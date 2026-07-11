import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import { PATH_POINTS, pointAtPathProgress } from '../src/game/geometry.js';
import { ENEMY_TYPES, damageEnemy, isBossType, spawnEnemy, updateEnemies } from '../src/game/enemies.js';
import { beginWave, launchNextWaveEarly, updateWaveState } from '../src/game/waves.js';
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
  it('enters a five-second countdown after a non-final wave without replacing stage state', () => {
    const state = startRun(createInitialState());
    const map = state.map;
    const tower = { id: 'tower-1', type: 'pulse', level: 1 };
    state.towers = [tower];
    state.energy = 333;
    state.base.health = 61;
    beginWave(state, 1);
    state.wave.spawnQueue = [];
    state.enemies = [];

    updateWaveState(state, 1 / 60);

    expect(state.mode).toBe('wave-countdown');
    expect(state.wave).toMatchObject({ index: 1, total: 10, active: false, countdown: 5 });
    expect(state.map).toBe(map);
    expect(state.towers).toEqual([tower]);
    expect(state.energy).toBe(333);
    expect(state.base.health).toBe(61);
  });

  it('automatically starts the next wave when the countdown expires', () => {
    const state = startRun(createInitialState());
    beginWave(state, 1);
    state.wave.spawnQueue = [];
    state.enemies = [];
    updateWaveState(state, 0);

    updateWaveState(state, 5.01);

    expect(state.mode).toBe('playing');
    expect(state.wave.index).toBe(2);
  });

  it('starts the next wave early without granting an economy bonus', () => {
    const state = startRun(createInitialState());
    beginWave(state, 1);
    state.wave.spawnQueue = [];
    state.enemies = [];
    updateWaveState(state, 0);
    const energy = state.energy;

    expect(launchNextWaveEarly(state)).toBe(true);
    expect(state.mode).toBe('playing');
    expect(state.wave.index).toBe(2);
    expect(state.energy).toBe(energy);
  });

  it('opens settlement only after clearing the final wave', () => {
    const state = startRun(createInitialState());
    beginWave(state, state.wave.total);
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
