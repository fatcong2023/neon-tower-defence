import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/game/state.js';
import { buildTower, getSellValue } from '../src/game/towers.js';
import {
  LEVEL_COUNT,
  beginChallengeCampaign,
  canSelectLevel,
  createCampaign,
  getLevelDefinition,
  prepareLevel,
  retryLevel,
  selectCampaignLevel,
  settleLevel,
  startAssault,
} from '../src/game/campaign.js';

describe('twenty-level campaign', () => {
  it('organizes twenty levels into elite and boss milestones', () => {
    expect(LEVEL_COUNT).toBe(20);
    expect(getLevelDefinition(3)).toMatchObject({ chapter: 1, elite: true, boss: false, waveCount: 10 });
    expect(getLevelDefinition(4)).toMatchObject({ chapter: 1, elite: false, boss: true, waveCount: 10 });
    expect(getLevelDefinition(20)).toMatchObject({ chapter: 5, boss: true, waveCount: 30 });
  });

  it('opens each level in deployment and starts only on command', () => {
    const campaign = createCampaign({ seed: 77 });
    const state = createInitialState();
    prepareLevel(state, campaign);

    expect(state.mode).toBe('deployment');
    expect(state.enemies).toHaveLength(0);
    expect(state.map.level).toBe(1);
    expect(startAssault(state, campaign)).toBe(true);
    expect(state.mode).toBe('playing');
    expect(state.wave.index).toBe(1);
  });

  it('recycles towers at sell value and advances campaign funds', () => {
    const campaign = createCampaign({ funds: 1000 });
    const state = createInitialState();
    prepareLevel(state, campaign);
    state.player.x = 470;
    state.player.y = 420;
    const tower = buildTower(state, 450, 560, 'pulse').tower;
    const expectedSell = getSellValue(tower);
    state.base.health = state.base.maxHealth;
    const unspent = state.energy;

    const result = settleLevel(state, campaign);

    expect(result.recycled).toBe(expectedSell);
    expect(campaign.funds).toBe(unspent + expectedSell + result.baseReward + result.performanceBonus);
    expect(campaign.currentLevel).toBe(2);
    expect(campaign.highestCleared).toBe(1);
    expect(state.towers).toHaveLength(0);
  });

  it('restores the level-start funds on retry', () => {
    const campaign = createCampaign({ funds: 730 });
    campaign.levelStartFunds = 730;
    campaign.funds = 12;
    expect(retryLevel(campaign)).toBe(730);
    expect(campaign.currentLevel).toBe(1);
  });

  it('allows selecting reached levels without unlocking future levels', () => {
    const campaign = createCampaign();
    campaign.highestCleared = 12;
    campaign.currentLevel = 13;

    expect(canSelectLevel(campaign, 13)).toBe(true);
    expect(canSelectLevel(campaign, 14)).toBe(false);
    expect(selectCampaignLevel(campaign, 8)).toEqual({ ok: true, level: 8 });
    expect(campaign.currentLevel).toBe(8);
    expect(selectCampaignLevel(campaign, 14)).toEqual({ ok: false, reason: 'locked' });
  });

  it('starts a harder campaign loop only after the finale unlocks it', () => {
    const campaign = createCampaign();
    expect(beginChallengeCampaign(campaign)).toEqual({ ok: false, reason: 'locked' });

    campaign.challengeUnlocked = true;
    campaign.completed = true;
    campaign.highestCleared = 20;
    expect(beginChallengeCampaign(campaign)).toEqual({ ok: true, cycle: 1 });
    expect(campaign).toMatchObject({ currentLevel: 1, challengeMode: true, challengeCycle: 1, completed: false });
  });
});
