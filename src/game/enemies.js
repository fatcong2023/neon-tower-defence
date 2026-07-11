import { allocateId } from './state.js';
import { PATH_POINTS, pointAtRouteProgress, routeLength } from './geometry.js';
import { resolveArmoredDamage } from './armor.js';
import { triggerTutorialForEnemy } from './tutorials.js';

export const ENEMY_TYPES = Object.freeze({
  grunt: { name: 'Vector', health: 68, speed: 76, reward: 16, baseDamage: 8, radius: 14, color: '#ff4fd8', score: 100 },
  runner: { name: 'Glitch', health: 42, speed: 132, reward: 14, baseDamage: 6, radius: 11, color: '#ffae57', score: 125 },
  swarm: { name: 'Bit', health: 24, speed: 104, reward: 8, baseDamage: 3, radius: 8, color: '#a9ff68', score: 70 },
  tank: { name: 'Blockade', health: 280, speed: 43, reward: 42, baseDamage: 18, radius: 20, color: '#9b7bff', score: 280 },
  shield: { name: 'Aegis', health: 125, shield: 80, speed: 64, reward: 30, baseDamage: 12, radius: 17, color: '#4dfcff', score: 240 },
  juggernaut: { name: 'Ironclad', health: 210, armor: 150, armorFamily: 'heavy', speed: 46, reward: 45, baseDamage: 18, radius: 21, color: '#d8c8ff', score: 330 },
  aegis: { name: 'Flux Aegis', health: 135, armor: 110, armorFamily: 'flux', speed: 67, reward: 38, baseDamage: 12, radius: 17, color: '#a9ff68', score: 300 },
  crystal: { name: 'Shardback', health: 190, armor: 145, armorFamily: 'crystal', speed: 54, reward: 46, baseDamage: 15, radius: 19, color: '#ffae57', score: 370 },
  mystic: { name: 'Veil Walker', health: 155, armor: 135, armorFamily: 'mystic', speed: 72, reward: 48, baseDamage: 14, radius: 18, color: '#9b7bff', score: 390 },
  healer: { name: 'Mender', health: 115, speed: 58, reward: 34, baseDamage: 9, radius: 15, color: '#65ffba', score: 310, ability: 'heal' },
  splitter: { name: 'Fractal', health: 100, speed: 78, reward: 26, baseDamage: 9, radius: 15, color: '#ff7ee7', score: 270, ability: 'split' },
  disruptor: { name: 'Jammer', health: 145, speed: 61, reward: 39, baseDamage: 12, radius: 17, color: '#ffd15c', score: 360, ability: 'disrupt' },
  boss: { name: 'THE OVERDRIVE', health: 2300, shield: 350, speed: 29, reward: 500, baseDamage: 100, radius: 36, color: '#ff3f72', score: 3000 },
  'boss-overdrive': { name: 'Overdrive', health: 2600, speed: 36, reward: 600, baseDamage: 100, radius: 37, color: '#ff3f72', score: 4000, ability: 'split' },
  'boss-twin': { name: 'Twin Warden', health: 3400, armor: 650, armorFamily: 'flux', speed: 31, reward: 800, baseDamage: 100, radius: 39, color: '#a9ff68', score: 6000, ability: 'disrupt' },
  'boss-hydra': { name: 'Crystal Hydra', health: 4700, armor: 900, armorFamily: 'crystal', speed: 27, reward: 1000, baseDamage: 100, radius: 42, color: '#ffae57', score: 8500, ability: 'heal' },
  'boss-tyrant': { name: 'Veil Tyrant', health: 6200, armor: 1200, armorFamily: 'mystic', speed: 30, reward: 1300, baseDamage: 100, radius: 44, color: '#9b7bff', score: 12000, ability: 'disrupt' },
  'boss-null': { name: 'Null Architect', health: 9000, armor: 1800, armorFamily: 'heavy', speed: 25, reward: 2000, baseDamage: 100, radius: 50, color: '#ffffff', score: 20000, ability: 'heal' },
});

export function isBossType(type) {
  return type === 'boss' || type.startsWith('boss-');
}

export function spawnEnemy(state, type, options = {}) {
  const definition = ENEMY_TYPES[type];
  if (!definition) throw new Error(`Unknown enemy type: ${type}`);
  const routes = state.map?.paths?.length ? state.map.paths : [PATH_POINTS];
  const routeIndex = options.routeIndex ?? ((state.spawnSerial ?? 0) % routes.length);
  state.spawnSerial = (state.spawnSerial ?? 0) + 1;
  const route = routes[routeIndex % routes.length];
  const start = pointAtRouteProgress(route, 0);
  const level = state.campaign?.currentLevel ?? 1;
  const waveProgress = Math.max(0, Math.min(1, (state.wave?.index ?? 1) / Math.max(1, state.wave?.total ?? 1)));
  const challengeCycle = state.campaign?.challengeMode ? Math.max(1, state.campaign.challengeCycle ?? 1) : 0;
  const challengeScale = challengeCycle ? 1.22 + challengeCycle * 0.08 : 1;
  const boss = isBossType(type);
  const healthScale = (boss ? 1 : 1 + Math.max(0, level - 1) * 0.1 + waveProgress * 0.42) * challengeScale;
  const armorScale = (boss ? 1 : 1 + Math.max(0, level - 1) * 0.075 + waveProgress * 0.32) * challengeScale;
  const speedScale = boss ? 1 : 1 + Math.min(0.16, Math.max(0, level - 1) * 0.004 + waveProgress * 0.08);
  const rewardScale = 1 + Math.max(0, level - 1) * 0.025 + waveProgress * 0.1;
  const enemy = {
    id: allocateId('enemy'),
    type,
    x: start.x,
    y: start.y,
    radius: definition.radius,
    routeIndex: routeIndex % routes.length,
    progress: 0,
    health: Math.round(definition.health * healthScale),
    maxHealth: Math.round(definition.health * healthScale),
    shield: Math.round((definition.shield ?? 0) * armorScale),
    maxShield: Math.round((definition.shield ?? 0) * armorScale),
    armorFamily: definition.armorFamily ?? null,
    armor: Math.round((definition.armor ?? 0) * armorScale),
    maxArmor: Math.round((definition.armor ?? 0) * armorScale),
    speed: definition.speed * speedScale * (challengeCycle ? Math.min(1.16, 1.05 + challengeCycle * 0.02) : 1),
    reward: Math.round(definition.reward * rewardScale),
    baseDamage: definition.baseDamage,
    score: definition.score,
    slowMultiplier: 1,
    slowTimer: 0,
    flash: 0,
    stunnedTimer: 0,
    vulnerableTimer: 0,
    ability: definition.ability ?? null,
    abilityCooldown: 1.5,
  };
  if (enemy.armorFamily === 'flux') {
    enemy.shield = enemy.armor;
    enemy.maxShield = enemy.maxArmor;
  }
  state.enemies.push(enemy);
  if (!options.skipTutorial) triggerTutorialForEnemy(state, enemy);
  return enemy;
}

export function damageEnemy(state, enemy, amount, effect = {}) {
  if (!state.enemies.includes(enemy) || amount <= 0) return { killed: false, damage: 0 };
  const armorResult = resolveArmoredDamage(enemy, amount, effect.attackTag);
  if (enemy.armorFamily) enemy.shield = enemy.armorFamily === 'flux' ? enemy.armor : 0;
  let remaining = armorResult.healthDamage;
  if (!enemy.armorFamily && enemy.shield > 0) {
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

  state.effects.push({ type: armorResult.armorDamage > 0 ? 'armor-hit' : 'damage', x: enemy.x, y: enemy.y, value: Math.round(armorResult.armorDamage || healthDamage), color: effect.color, ttl: 0.65 });
  if (armorResult.broke) state.effects.push({ type: 'armor-break', x: enemy.x, y: enemy.y, radius: enemy.radius + 18, color: effect.color, ttl: 0.75 });
  if (enemy.health > 0) return { killed: false, damage: healthDamage };

  state.enemies.splice(state.enemies.indexOf(enemy), 1);
  state.energy += enemy.reward;
  state.score += enemy.score;
  state.kills += 1;
  state.effects.push({ type: 'enemy-destroyed', x: enemy.x, y: enemy.y, color: effect.color, radius: enemy.radius, ttl: 0.55 });
  if (enemy.ability === 'split') {
    for (let index = 0; index < 2; index += 1) {
      const child = spawnEnemy(state, 'swarm', { routeIndex: enemy.routeIndex, skipTutorial: true });
      child.progress = Math.max(0, enemy.progress - index * 0.012);
      const route = state.map?.paths?.[child.routeIndex] ?? PATH_POINTS;
      Object.assign(child, pointAtRouteProgress(route, child.progress));
    }
  }
  return { killed: true, damage: healthDamage };
}

export function updateEnemies(state, delta) {
  for (const enemy of [...state.enemies]) {
    enemy.stunnedTimer = Math.max(0, (enemy.stunnedTimer ?? 0) - delta);
    enemy.vulnerableTimer = Math.max(0, (enemy.vulnerableTimer ?? 0) - delta);
    enemy.abilityCooldown = Math.max(0, (enemy.abilityCooldown ?? 0) - delta);
    if (enemy.ability === 'heal' && enemy.abilityCooldown <= 0) {
      state.enemies.filter((other) => other !== enemy && Math.hypot(other.x - enemy.x, other.y - enemy.y) < 120).forEach((other) => { other.health = Math.min(other.maxHealth, other.health + other.maxHealth * 0.08); });
      enemy.abilityCooldown = 1.8;
    }
    if (enemy.ability === 'disrupt' && enemy.abilityCooldown <= 0) {
      state.towers.filter((tower) => Math.hypot(tower.x - enemy.x, tower.y - enemy.y) < 150).forEach((tower) => { tower.cooldown += 0.35; });
      enemy.abilityCooldown = 2.2;
    }
    if (enemy.stunnedTimer > 0) continue;
    const movementScale = enemy.slowTimer > 0 ? enemy.slowMultiplier : 1;
    const route = state.map?.paths?.[enemy.routeIndex] ?? PATH_POINTS;
    enemy.progress += (enemy.speed * movementScale * delta) / routeLength(route);
    const point = pointAtRouteProgress(route, enemy.progress);
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
      state.cameraShake = Math.max(state.cameraShake, isBossType(enemy.type) ? 18 : 8);
      state.effects.push({ type: 'base-hit', x: enemy.x, y: enemy.y, color: '#ff3f72', ttl: 0.7 });
    }
  }
}
