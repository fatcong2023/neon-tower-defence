import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import { PATH_POINTS, pointAtPathProgress } from '../src/game/geometry.js';
import { ENEMY_TYPES, damageEnemy, isBossType, spawnEnemy, updateEnemies } from '../src/game/enemies.js';
import { beginWave, createSpawnQueue, launchNextWaveEarly, updateWaveState } from '../src/game/waves.js';
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

  it('scales enemy durability with both stage and normalized wave progress', () => {
    const early = startRun(createInitialState());
    early.campaign.currentLevel = 5;
    early.wave.index = 1;
    early.wave.total = 15;
    const late = startRun(createInitialState());
    late.campaign.currentLevel = 5;
    late.wave.index = 15;
    late.wave.total = 15;
    const laterStage = startRun(createInitialState());
    laterStage.campaign.currentLevel = 15;
    laterStage.wave.index = 1;
    laterStage.wave.total = 25;

    expect(spawnEnemy(late, 'grunt').maxHealth).toBeGreaterThan(spawnEnemy(early, 'grunt').maxHealth);
    expect(spawnEnemy(laterStage, 'grunt').maxHealth).toBeGreaterThan(spawnEnemy(early, 'grunt').maxHealth);
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
  it('grows phase-based assault budgets from early to late waves', () => {
    const early = createSpawnQueue(5, 1, 15);
    const middle = createSpawnQueue(5, 8, 15);
    const late = createSpawnQueue(5, 15, 15);

    expect(early.length).toBeLessThan(middle.length);
    expect(middle.length).toBeLessThan(late.length);
    expect(late.some((entry) => ['healer', 'splitter', 'disruptor'].includes(entry.type))).toBe(true);
  });

  it('schedules chapter bosses only on the final wave of boss levels', () => {
    expect(createSpawnQueue(4, 10, 10).some((entry) => entry.type === 'boss-overdrive')).toBe(true);
    expect(createSpawnQueue(8, 15, 15).some((entry) => entry.type === 'boss-twin')).toBe(true);
    expect(createSpawnQueue(12, 20, 20).some((entry) => entry.type === 'boss-hydra')).toBe(true);
    expect(createSpawnQueue(16, 25, 25).some((entry) => entry.type === 'boss-tyrant')).toBe(true);
    expect(createSpawnQueue(20, 30, 30).some((entry) => entry.type === 'boss-null')).toBe(true);
    expect(createSpawnQueue(4, 9, 10).some((entry) => entry.type.startsWith('boss'))).toBe(false);
    expect(createSpawnQueue(3, 10, 10).some((entry) => entry.type.startsWith('boss'))).toBe(false);
  });
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
