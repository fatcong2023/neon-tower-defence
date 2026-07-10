import { allocateId } from './state.js';
import { PATH_TOTAL_LENGTH, pointAtPathProgress } from './geometry.js';

export const ENEMY_TYPES = Object.freeze({
  grunt: { name: 'Vector', health: 68, speed: 76, reward: 16, baseDamage: 8, radius: 14, color: '#ff4fd8', score: 100 },
  runner: { name: 'Glitch', health: 42, speed: 132, reward: 14, baseDamage: 6, radius: 11, color: '#ffae57', score: 125 },
  swarm: { name: 'Bit', health: 24, speed: 104, reward: 8, baseDamage: 3, radius: 8, color: '#a9ff68', score: 70 },
  tank: { name: 'Blockade', health: 280, speed: 43, reward: 42, baseDamage: 18, radius: 20, color: '#9b7bff', score: 280 },
  shield: { name: 'Aegis', health: 125, shield: 80, speed: 64, reward: 30, baseDamage: 12, radius: 17, color: '#4dfcff', score: 240 },
  boss: { name: 'THE OVERDRIVE', health: 2300, shield: 350, speed: 29, reward: 500, baseDamage: 100, radius: 36, color: '#ff3f72', score: 3000 },
});

export function spawnEnemy(state, type) {
  const definition = ENEMY_TYPES[type];
  if (!definition) throw new Error(`Unknown enemy type: ${type}`);
  const start = pointAtPathProgress(0);
  const enemy = {
    id: allocateId('enemy'),
    type,
    x: start.x,
    y: start.y,
    radius: definition.radius,
    progress: 0,
    health: definition.health,
    maxHealth: definition.health,
    shield: definition.shield ?? 0,
    maxShield: definition.shield ?? 0,
    speed: definition.speed,
    reward: definition.reward,
    baseDamage: definition.baseDamage,
    score: definition.score,
    slowMultiplier: 1,
    slowTimer: 0,
    flash: 0,
  };
  state.enemies.push(enemy);
  return enemy;
}

export function damageEnemy(state, enemy, amount, effect = {}) {
  if (!state.enemies.includes(enemy) || amount <= 0) return { killed: false, damage: 0 };
  let remaining = amount;
  if (enemy.shield > 0) {
    const absorbed = Math.min(enemy.shield, remaining);
    enemy.shield -= absorbed;
    remaining -= absorbed;
  }
  const healthDamage = Math.min(enemy.health, remaining);
  enemy.health -= healthDamage;
  enemy.flash = 0.09;

  if (effect.slow) {
    enemy.slowMultiplier = Math.min(enemy.slowMultiplier, effect.slow);
    enemy.slowTimer = Math.max(enemy.slowTimer, effect.slowDuration ?? 1);
  }

  state.effects.push({ type: 'damage', x: enemy.x, y: enemy.y, value: Math.round(amount), color: effect.color, ttl: 0.65 });
  if (enemy.health > 0) return { killed: false, damage: healthDamage };

  state.enemies.splice(state.enemies.indexOf(enemy), 1);
  state.energy += enemy.reward;
  state.score += enemy.score;
  state.kills += 1;
  state.effects.push({ type: 'enemy-destroyed', x: enemy.x, y: enemy.y, color: effect.color, radius: enemy.radius, ttl: 0.55 });
  return { killed: true, damage: healthDamage };
}

export function updateEnemies(state, delta) {
  for (const enemy of [...state.enemies]) {
    const movementScale = enemy.slowTimer > 0 ? enemy.slowMultiplier : 1;
    enemy.progress += (enemy.speed * movementScale * delta) / PATH_TOTAL_LENGTH;
    const point = pointAtPathProgress(enemy.progress);
    enemy.x = point.x;
    enemy.y = point.y;
    enemy.flash = Math.max(0, enemy.flash - delta);
    if (enemy.slowTimer > 0) {
      enemy.slowTimer = Math.max(0, enemy.slowTimer - delta);
      if (enemy.slowTimer === 0) enemy.slowMultiplier = 1;
    }
    if (enemy.progress >= 1) {
      state.enemies.splice(state.enemies.indexOf(enemy), 1);
      state.base.health = Math.max(0, state.base.health - enemy.baseDamage);
      state.leaks = (state.leaks ?? 0) + 1;
      state.cameraShake = Math.max(state.cameraShake, enemy.type === 'boss' ? 18 : 8);
      state.effects.push({ type: 'base-hit', x: enemy.x, y: enemy.y, color: '#ff3f72', ttl: 0.7 });
    }
  }
}
