import { distance } from './geometry.js';
import { damageEnemy } from './enemies.js';
import { getTowerStats, TOWER_TYPES } from './towers.js';

function enemiesInRange(state, origin, range) {
  return state.enemies
    .filter((enemy) => distance(origin, enemy) <= range)
    .sort((a, b) => b.progress - a.progress);
}

function visualShot(state, tower, targets, kind) {
  state.effects.push({
    type: kind,
    x: tower.x,
    y: tower.y,
    targetPoints: targets.map((target) => ({ x: target.x, y: target.y })),
    color: TOWER_TYPES[tower.type].color,
    ttl: kind === 'arc-shot' ? 0.14 : 0.28,
  });
}

export function fireTower(state, tower) {
  const definition = TOWER_TYPES[tower.type];
  const stats = getTowerStats(tower);
  if (!definition || !stats) return { fired: false, targetIds: [] };
  const candidates = enemiesInRange(state, tower, stats.range);
  if (candidates.length === 0) return { fired: false, targetIds: [] };

  const primary = candidates[0];
  tower.angle = Math.atan2(primary.y - tower.y, primary.x - tower.x);
  let targets = [];

  if (definition.attack === 'single') {
    targets = [primary];
    damageEnemy(state, primary, stats.damage, { color: definition.color });
    visualShot(state, tower, targets, tower.type === 'prism' ? 'prism-shot' : 'pulse-shot');
  } else if (definition.attack === 'chain') {
    targets = [primary];
    while (targets.length < stats.chains) {
      const last = targets.at(-1);
      const next = state.enemies
        .filter((enemy) => !targets.includes(enemy) && distance(last, enemy) <= stats.chainRange)
        .sort((a, b) => distance(last, a) - distance(last, b))[0];
      if (!next) break;
      targets.push(next);
    }
    targets.forEach((target, index) => damageEnemy(state, target, stats.damage * (1 - index * 0.12), { color: definition.color }));
    visualShot(state, tower, targets, 'arc-shot');
  } else if (definition.attack === 'splash') {
    targets = state.enemies.filter((enemy) => distance(primary, enemy) <= stats.splash);
    targets.forEach((target) => damageEnemy(state, target, stats.damage, { color: definition.color }));
    visualShot(state, tower, [primary], 'nova-shot');
    state.effects.push({ type: 'explosion', x: primary.x, y: primary.y, radius: stats.splash, color: definition.color, ttl: 0.42 });
  } else if (definition.attack === 'pulse') {
    targets = candidates;
    targets.forEach((target) => damageEnemy(state, target, stats.damage, {
      color: definition.color,
      slow: stats.slow,
      slowDuration: stats.slowDuration,
    }));
    state.effects.push({ type: 'frost-pulse', x: tower.x, y: tower.y, radius: stats.range, color: definition.color, ttl: 0.48 });
  }

  tower.cooldown = stats.cooldown;
  return { fired: targets.length > 0, targetIds: targets.map((target) => target.id) };
}

export function updateTowerCombat(state, delta) {
  state.towers.forEach((tower) => {
    tower.cooldown = Math.max(0, tower.cooldown - delta);
    if (tower.cooldown <= 0) fireTower(state, tower);
  });
}

export function updateProjectiles(state, delta) {
  for (const projectile of [...state.projectiles]) {
    projectile.previousX = projectile.x;
    projectile.previousY = projectile.y;
    projectile.x += projectile.vx * delta;
    projectile.y += projectile.vy * delta;
    projectile.ttl -= delta;

    const hit = state.enemies.find((enemy) => distance(projectile, enemy) <= projectile.radius + enemy.radius);
    if (hit) {
      damageEnemy(state, hit, projectile.damage, { color: projectile.color });
      state.effects.push({ type: 'projectile-hit', x: hit.x, y: hit.y, color: projectile.color, ttl: 0.2 });
      state.projectiles.splice(state.projectiles.indexOf(projectile), 1);
    } else if (projectile.ttl <= 0 || projectile.x < -20 || projectile.x > 1300 || projectile.y < -20 || projectile.y > 740) {
      state.projectiles.splice(state.projectiles.indexOf(projectile), 1);
    }
  }
}
