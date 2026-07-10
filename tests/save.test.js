import { describe, expect, it } from 'vitest';
import { createCampaign } from '../src/game/campaign.js';
import { SAVE_VERSION, parseSave, serializeSave } from '../src/game/save.js';

describe('campaign saves', () => {
  it('round-trips progress, research, and language', () => {
    const campaign = createCampaign({ seed: 42, language: 'en' });
    Object.assign(campaign, { currentLevel: 23, highestCleared: 22, coreChips: 91, research: ['pulse-1'], challengeUnlocked: true, challengeMode: true, challengeCycle: 2 });

    const restored = parseSave(serializeSave(campaign));

    expect(restored).toMatchObject({ version: SAVE_VERSION, seed: 42, currentLevel: 23, highestCleared: 22, coreChips: 91, language: 'en', challengeMode: true, challengeCycle: 2 });
    expect(restored.research).toEqual(['pulse-1']);
  });

  it('falls back safely for corrupt or unsupported data', () => {
    expect(parseSave('{bad json').currentLevel).toBe(1);
    expect(parseSave(JSON.stringify({ version: 999, currentLevel: 50 })).currentLevel).toBe(1);
    expect(parseSave(JSON.stringify({ version: SAVE_VERSION, language: 'xx', currentLevel: -4 })).language).toBe('zh-CN');
  });
});
