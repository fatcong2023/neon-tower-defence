import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import { spawnEnemy } from '../src/game/enemies.js';
import { buildTower, getTowerStats } from '../src/game/towers.js';
import { fireTower, updateProjectiles } from '../src/game/combat.js';
import { firePlayerShot, updatePlayer } from '../src/game/player.js';

function combatState(towerType = 'pulse') {
  const state = startRun(createInitialState());
  state.mode = 'playing';
  const tower = buildTower(state, 220, 500, towerType).tower;
  return { state, tower };
}

function enemyAt(state, type, x, y, progress = 0.2) {
  const enemy = spawnEnemy(state, type);
  Object.assign(enemy, { x, y, progress });
  return enemy;
}

describe('tower combat identities', () => {
  it('Pulse and Prism hit one leading target with their level damage', () => {
    for (const type of ['pulse', 'prism']) {
      const { state, tower } = combatState(type);
      const trailing = enemyAt(state, 'tank', 255, 500, 0.2);
      const leading = enemyAt(state, 'tank', 275, 500, 0.7);

      const result = fireTower(state, tower);

      expect(result.targetIds).toEqual([leading.id]);
      expect(leading.health).toBe(leading.maxHealth - getTowerStats(tower).damage);
      expect(trailing.health).toBe(trailing.maxHealth);
    }
  });

  it('Arc Coil chains across its configured number of targets', () => {
    const { state, tower } = combatState('arc');
    const enemies = [
      enemyAt(state, 'tank', 260, 500, 0.8),
      enemyAt(state, 'tank', 310, 500, 0.6),
      enemyAt(state, 'tank', 360, 500, 0.4),
    ];

    const result = fireTower(state, tower);

    expect(result.targetIds).toHaveLength(getTowerStats(tower).chains);
    expect(enemies.filter((enemy) => enemy.health < enemy.maxHealth)).toHaveLength(2);
  });

  it('Nova Mortar damages every enemy in its blast', () => {
    const { state, tower } = combatState('nova');
    const enemies = [
      enemyAt(state, 'tank', 300, 500, 0.8),
      enemyAt(state, 'tank', 330, 520, 0.4),
      enemyAt(state, 'tank', 350, 490, 0.2),
    ];

    fireTower(state, tower);

    expect(enemies.every((enemy) => enemy.health < enemy.maxHealth)).toBe(true);
  });

  it('Frost Beacon damages and slows all enemies in its field', () => {
    const { state, tower } = combatState('frost');
    const enemies = [
      enemyAt(state, 'tank', 260, 500),
      enemyAt(state, 'tank', 300, 500),
    ];

    fireTower(state, tower);

    expect(enemies.every((enemy) => enemy.health < enemy.maxHealth)).toBe(true);
    expect(enemies.every((enemy) => enemy.slowMultiplier === getTowerStats(tower).slow)).toBe(true);
  });
});

describe('guardian controls and blaster', () => {
  it('moves normally, dashes farther, and remains inside the arena', () => {
    const walking = startRun(createInitialState());
    const dashing = startRun(createInitialState());

    updatePlayer(walking, { moveX: 1, moveY: 0, dash: false }, 0.1);
    updatePlayer(dashing, { moveX: 1, moveY: 0, dash: true }, 0.1);

    expect(dashing.player.x).toBeGreaterThan(walking.player.x);
    expect(dashing.player.dashCooldown).toBeGreaterThan(0);

    dashing.player.x = 1275;
    dashing.player.y = 20;
    updatePlayer(dashing, { moveX: 1, moveY: -1, dash: false }, 1);
    expect(dashing.player.x).toBeLessThanOrEqual(1255);
    expect(dashing.player.y).toBeGreaterThanOrEqual(25);
  });

  it('enforces blaster cooldown and damages an enemy projectile target', () => {
    const state = startRun(createInitialState());
    state.mode = 'playing';
    const enemy = enemyAt(state, 'tank', state.player.x + 90, state.player.y);

    expect(firePlayerShot(state, enemy.x, enemy.y)).toBe(true);
    expect(firePlayerShot(state, enemy.x, enemy.y)).toBe(false);
    for (let index = 0; index < 20; index += 1) updateProjectiles(state, 1 / 60);

    expect(enemy.health).toBeLessThan(enemy.maxHealth);
    updatePlayer(state, { moveX: 0, moveY: 0, dash: false }, 0.3);
    expect(firePlayerShot(state, enemy.x, enemy.y)).toBe(true);
  });
});
