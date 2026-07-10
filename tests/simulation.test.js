import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import { PATH_POINTS, pointAtPathProgress } from '../src/game/geometry.js';
import { ENEMY_TYPES, damageEnemy, isBossType, spawnEnemy, updateEnemies } from '../src/game/enemies.js';
import { WAVE_DEFINITIONS, beginWave, updateWaveState } from '../src/game/waves.js';
import { updateSimulation } from '../src/game/simulation.js';

describe('path and enemy movement', () => {
  it('recognizes every chapter boss variant for rendering and impact effects', () => {
    expect(isBossType('boss')).toBe(true);
    expect(isBossType('boss-overdrive')).toBe(true);
    expect(isBossType('boss-twin')).toBe(true);
    expect(isBossType('boss-hydra')).toBe(true);
    expect(isBossType('boss-tyrant')).toBe(true);
    expect(isBossType('boss-null')).toBe(true);
    expect(isBossType('tank')).toBe(false);
  });

  it('interpolates the winding path from portal to base', () => {
    expect(pointAtPathProgress(0)).toEqual(PATH_POINTS[0]);
    expect(pointAtPathProgress(1)).toEqual(PATH_POINTS.at(-1));
    const middle = pointAtPathProgress(0.5);
    expect(middle.x).toBeGreaterThan(300);
    expect(middle.x).toBeLessThan(1050);
  });

  it('spawns enemies at the portal and advances them', () => {
    const state = startRun(createInitialState());
    const enemy = spawnEnemy(state, 'grunt');
    const start = { x: enemy.x, y: enemy.y };

    updateEnemies(state, 1);

    expect(enemy.progress).toBeGreaterThan(0);
    expect({ x: enemy.x, y: enemy.y }).not.toEqual(start);
  });

  it('raises enemy durability during unlocked challenge loops', () => {
    const normalState = startRun(createInitialState());
    const challengeState = startRun(createInitialState());
    challengeState.campaign.challengeUnlocked = true;
    challengeState.campaign.challengeMode = true;
    challengeState.campaign.challengeCycle = 1;

    expect(spawnEnemy(challengeState, 'grunt').maxHealth).toBeGreaterThan(spawnEnemy(normalState, 'grunt').maxHealth);
  });

  it('damages the base when an enemy escapes', () => {
    const state = startRun(createInitialState());
    const enemy = spawnEnemy(state, 'grunt');
    enemy.progress = 0.999;
    enemy.speed = 10_000;

    updateEnemies(state, 1);

    expect(state.enemies).toHaveLength(0);
    expect(state.base.health).toBe(state.base.maxHealth - ENEMY_TYPES.grunt.baseDamage);
  });
});

describe('enemy damage and status', () => {
  it('uses shields before health and awards kill rewards', () => {
    const state = startRun(createInitialState());
    const enemy = spawnEnemy(state, 'aegis', { skipTutorial: true });
    const reward = enemy.reward;

    damageEnemy(state, enemy, 30, { attackTag: 'arc' });
    expect(enemy.armor).toBeLessThan(ENEMY_TYPES.aegis.armor);
    expect(enemy.health).toBe(enemy.maxHealth);

    damageEnemy(state, enemy, 10_000);
    expect(state.enemies).not.toContain(enemy);
    expect(state.energy).toBe(420 + reward);
    expect(state.kills).toBe(1);
  });

  it('temporarily slows enemies', () => {
    const state = startRun(createInitialState());
    const enemy = spawnEnemy(state, 'runner');
    enemy.slowMultiplier = 0.5;
    enemy.slowTimer = 1;

    updateEnemies(state, 0.5);
    const slowedProgress = enemy.progress;
    updateEnemies(state, 1);

    expect(slowedProgress).toBeGreaterThan(0);
    expect(enemy.slowTimer).toBe(0);
    expect(enemy.slowMultiplier).toBe(1);
  });
});

describe('waves and terminal states', () => {
  it('defines fifty levels with a boss every ten levels', () => {
    expect(WAVE_DEFINITIONS).toHaveLength(50);
    expect(WAVE_DEFINITIONS[9].some((group) => group.type.startsWith('boss'))).toBe(true);
    expect(WAVE_DEFINITIONS[49].some((group) => group.type.startsWith('boss'))).toBe(true);
  });

  it('opens settlement after clearing a campaign level', () => {
    const state = startRun(createInitialState());
    beginWave(state, 10);
    state.wave.spawnQueue = [];
    state.enemies = [];

    updateWaveState(state, 1 / 60);

    expect(state.mode).toBe('level-clear');
  });

  it('loses immediately when base health reaches zero', () => {
    const state = startRun(createInitialState());
    state.base.health = 0;

    updateSimulation(state, 1 / 60);

    expect(state.mode).toBe('defeat');
  });
});
