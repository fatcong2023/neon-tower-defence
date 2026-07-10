import { describe, expect, it } from 'vitest';
import { createInitialState } from '../src/game/state.js';
import { buildTower, getSellValue } from '../src/game/towers.js';
import {
  LEVEL_COUNT,
  createCampaign,
  getLevelDefinition,
  prepareLevel,
  retryLevel,
  settleLevel,
  startAssault,
} from '../src/game/campaign.js';

describe('fifty-level campaign', () => {
  it('organizes fifty levels into elite and boss milestones', () => {
    expect(LEVEL_COUNT).toBe(50);
    expect(getLevelDefinition(5)).toMatchObject({ chapter: 1, elite: true, boss: false });
    expect(getLevelDefinition(10)).toMatchObject({ chapter: 1, elite: false, boss: true });
    expect(getLevelDefinition(50)).toMatchObject({ chapter: 5, boss: true });
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
});
