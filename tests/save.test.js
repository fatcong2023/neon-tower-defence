import { describe, expect, it } from 'vitest';
import { createCampaign } from '../src/game/campaign.js';
import { SAVE_VERSION, parseSave, serializeSave } from '../src/game/save.js';

describe('campaign saves', () => {
  it('round-trips progress, research, and language', () => {
    const campaign = createCampaign({ seed: 42, language: 'en' });
    Object.assign(campaign, { currentLevel: 13, highestCleared: 12, coreChips: 91, research: ['pulse-1'], challengeUnlocked: true, challengeMode: true, challengeCycle: 2 });

    const restored = parseSave(serializeSave(campaign));

    expect(restored).toMatchObject({ version: SAVE_VERSION, seed: 42, currentLevel: 13, highestCleared: 12, coreChips: 91, language: 'en', challengeMode: true, challengeCycle: 2 });
    expect(restored.research).toEqual(['pulse-1']);
  });

  it('migrates version-one progress proportionally and preserves permanent data', () => {
    const migrated = parseSave(JSON.stringify({
      version: 1,
      currentLevel: 31,
      highestCleared: 30,
      language: 'en',
      research: ['pulse-1'],
      coreChips: 22,
      quantumCores: 3,
      tutorialsSeen: ['heavy'],
      stats: { totalKills: 123 },
    }));

    expect(SAVE_VERSION).toBe(2);
    expect(migrated).toMatchObject({ version: 2, currentLevel: 13, highestCleared: 12, language: 'en', coreChips: 22, quantumCores: 3 });
    expect(migrated.research).toEqual(['pulse-1']);
    expect(migrated.tutorialsSeen).toEqual(['heavy']);
    expect(migrated.stats.totalKills).toBe(123);
    expect(migrated.unlockedTowers).toEqual(expect.arrayContaining(['relay', 'rift']));
  });

  it('falls back safely for corrupt or unsupported data', () => {
    expect(parseSave('{bad json').currentLevel).toBe(1);
    expect(parseSave(JSON.stringify({ version: 999, currentLevel: 50 })).currentLevel).toBe(1);
    expect(parseSave(JSON.stringify({ version: SAVE_VERSION, language: 'xx', currentLevel: -4 })).language).toBe('zh-CN');
  });

  it('persists only the durable level-start economy during an active attempt', () => {
    const campaign = createCampaign({ funds: 700 });
    campaign.levelStartFunds = 700;
    const activeStateFunds = 1234;

    const restored = parseSave(serializeSave(campaign));

    expect(activeStateFunds).not.toBe(restored.funds);
    expect(restored).toMatchObject({ funds: 700, levelStartFunds: 700, currentLevel: 1 });
  });
});
