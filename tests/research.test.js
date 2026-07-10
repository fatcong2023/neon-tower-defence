import { describe, expect, it } from 'vitest';
import { createCampaign } from '../src/game/campaign.js';
import { createInitialState } from '../src/game/state.js';
import { TOWER_TYPES, validatePlacement } from '../src/game/towers.js';
import {
  RESEARCH_NODES,
  applyResearchModifiers,
  getUnlockedTowerTypes,
  purchaseResearch,
  syncTowerUnlocks,
} from '../src/game/research.js';

describe('expanded tower roster', () => {
  it('contains thirteen towers with three in-map levels', () => {
    expect(Object.keys(TOWER_TYPES)).toHaveLength(13);
    Object.values(TOWER_TYPES).forEach((tower) => expect(tower.levels).toHaveLength(3));
  });

  it('unlocks two towers after each chapter boss', () => {
    expect(getUnlockedTowerTypes(0)).toHaveLength(5);
    expect(getUnlockedTowerTypes(10)).toEqual(expect.arrayContaining(['gravity', 'solar']));
    expect(getUnlockedTowerTypes(20)).toEqual(expect.arrayContaining(['drone', 'corrosion']));
    expect(getUnlockedTowerTypes(30)).toEqual(expect.arrayContaining(['relay', 'rift']));
    expect(getUnlockedTowerTypes(40)).toEqual(expect.arrayContaining(['quantum', 'singularity']));
    expect(getUnlockedTowerTypes(40)).toHaveLength(13);
  });

  it('rejects building a tower before its chapter unlock', () => {
    const state = createInitialState();
    state.mode = 'deployment';
    state.player.x = 470;
    state.player.y = 420;
    state.energy = 10_000;
    expect(validatePlacement(state, 450, 560, 'gravity')).toEqual({ ok: false, reason: 'locked' });
    state.campaign.highestCleared = 10;
    syncTowerUnlocks(state.campaign);
    expect(validatePlacement(state, 450, 560, 'gravity')).toEqual({ ok: true });
  });
});

describe('Neon Lab research', () => {
  it('defines three permanent nodes for every tower', () => {
    expect(RESEARCH_NODES).toHaveLength(39);
    for (const type of Object.keys(TOWER_TYPES)) expect(RESEARCH_NODES.filter((node) => node.tower === type)).toHaveLength(3);
  });

  it('spends chips in prerequisite order without changing tower level', () => {
    const campaign = createCampaign();
    campaign.coreChips = 100;
    expect(purchaseResearch(campaign, 'pulse-2')).toEqual({ ok: false, reason: 'prerequisite' });
    expect(purchaseResearch(campaign, 'pulse-1').ok).toBe(true);
    expect(purchaseResearch(campaign, 'pulse-2').ok).toBe(true);
    const stats = applyResearchModifiers('pulse', TOWER_TYPES.pulse.levels[0], campaign);
    expect(stats.damage).toBeGreaterThan(TOWER_TYPES.pulse.levels[0].damage);
    expect(campaign.research).toEqual(['pulse-1', 'pulse-2']);
  });

  it('blocks research for a tower that is not unlocked', () => {
    const campaign = createCampaign();
    campaign.coreChips = 999;
    expect(purchaseResearch(campaign, 'gravity-1')).toEqual({ ok: false, reason: 'tower-locked' });
  });

  it('applies the finale overclock after challenge mode is unlocked', () => {
    const campaign = createCampaign();
    const base = applyResearchModifiers('pulse', TOWER_TYPES.pulse.levels[0], campaign);
    campaign.challengeUnlocked = true;
    const overclocked = applyResearchModifiers('pulse', TOWER_TYPES.pulse.levels[0], campaign);

    expect(overclocked.damage).toBeGreaterThan(base.damage);
    expect(overclocked.cooldown).toBeLessThan(base.cooldown);
  });
});
