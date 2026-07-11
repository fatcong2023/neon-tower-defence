import { describe, expect, it } from 'vitest';
import { createCampaign } from '../src/game/campaign.js';
import { createInitialState } from '../src/game/state.js';
import {
  BOSS_VARIANTS,
  CINEMATIC_PHASES,
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
});
