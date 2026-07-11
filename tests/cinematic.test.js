import { describe, expect, it } from 'vitest';
import { createCampaign, prepareLevel } from '../src/game/campaign.js';
import { createInitialState } from '../src/game/state.js';
import { beginWave } from '../src/game/waves.js';
import { updateSimulation } from '../src/game/simulation.js';
import {
  BOSS_VARIANTS,
  CHAPTER_CINEMATIC_PHASES,
  CINEMATIC_PHASES,
  FINAL_LEVEL_MARK,
  replayCinematic,
  skipCinematic,
  startFinalCinematic,
  updateCinematic,
} from '../src/game/cinematic.js';

describe('chapter bosses and finale', () => {
  it('defines a distinct boss for every chapter', () => {
    expect(BOSS_VARIANTS.map((boss) => boss.level)).toEqual([4, 8, 12, 16, 20]);
    expect(new Set(BOSS_VARIANTS.map((boss) => boss.mechanic)).size).toBe(5);
  });

  it('brands the finale for the twentieth level', () => {
    expect(FINAL_LEVEL_MARK).toBe('20');
  });

  it('runs deterministic cinematic phases into victory', () => {
    const state = createInitialState({ campaign: createCampaign() });
    state.towers = [{ id: 'tower-1', type: 'pulse', x: 200, y: 300, level: 2 }];
    state.notice = 'BOSS WAVE';
    state.noticeTimer = 1.8;
    startFinalCinematic(state);
    expect(state.mode).toBe('cinematic');
    expect(state.cinematic.phase).toBe('freeze');
    expect(state.cinematic.towerSnapshot).toHaveLength(1);
    expect(state.notice).toBe('');
    expect(state.noticeTimer).toBe(0);

    for (const phase of CINEMATIC_PHASES.slice(0, -1)) updateCinematic(state, phase.duration + 0.01);
    expect(state.mode).toBe('victory');
    expect(state.campaign.challengeUnlocked).toBe(true);
  });

  it('supports skip and replay', () => {
    const state = createInitialState();
    startFinalCinematic(state);
    skipCinematic(state);
    expect(state.mode).toBe('victory');
    replayCinematic(state);
    expect(state.mode).toBe('cinematic');
    expect(state.cinematic.phase).toBe('freeze');
  });

  it.each([
    [4, ['gravity', 'solar']],
    [8, ['drone', 'corrosion']],
    [12, ['relay', 'rift']],
    [16, ['quantum', 'singularity']],
  ])('plays a short chapter cinematic after level %i and deploys the next level', (level, unlocks) => {
    const campaign = createCampaign({ funds: 1000 });
    campaign.currentLevel = level;
    campaign.highestCleared = level - 1;
    campaign.quantumCores = level / 4 - 1;
    const state = createInitialState({ campaign });
    prepareLevel(state, campaign);
    state.towers = [{ id: 'tower-1', type: 'pulse', x: 200, y: 300, level: 1, invested: 205 }];
    beginWave(state, state.wave.total);
    state.wave.spawnQueue = [];
    state.enemies = [];

    updateSimulation(state, 1 / 60);

    expect(state.mode).toBe('cinematic');
    expect(state.cinematic).toMatchObject({ kind: 'chapter', clearedLevel: level, phase: 'boss-break', unlocks });
    expect(state.cinematic.towerSnapshot).toHaveLength(1);
    expect(state.campaign.quantumCores).toBe(level / 4);
    expect(state.campaign.currentLevel).toBe(level + 1);
    expect(state.campaign.unlockedTowers).toEqual(expect.arrayContaining(unlocks));

    for (const phase of CHAPTER_CINEMATIC_PHASES.slice(0, -1)) updateSimulation(state, phase.duration + 0.01);
    expect(state.mode).toBe('deployment');
    expect(state.campaign.currentLevel).toBe(level + 1);
    expect(state.wave.index).toBe(0);
  });

  it('keeps level twenty on the full finale path', () => {
    const campaign = createCampaign({ funds: 1000 });
    campaign.currentLevel = 20;
    campaign.highestCleared = 19;
    const state = createInitialState({ campaign });
    prepareLevel(state, campaign);
    beginWave(state, state.wave.total);
    state.wave.spawnQueue = [];
    state.enemies = [];

    updateSimulation(state, 1 / 60);

    expect(state.mode).toBe('cinematic');
    expect(state.cinematic.kind).toBe('final');
    expect(state.campaign.completed).toBe(true);
  });
});
