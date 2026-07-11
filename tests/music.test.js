import { describe, expect, it } from 'vitest';
import { MUSIC_THEMES, getTheme, validateTheme } from '../src/audio/themes.js';
import { createStepEvents, getMusicScene, shouldCommitScene } from '../src/audio/sequencer.js';
import { createEnvelope, SUPPORTED_VOICES } from '../src/audio/synth.js';

describe('procedural music', () => {
  it('defines six complete and distinct themes', () => {
    expect(Object.keys(MUSIC_THEMES)).toEqual(['menu', 'chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5']);
    expect(new Set(Object.values(MUSIC_THEMES).map((theme) => theme.bpm)).size).toBe(6);
    expect(new Set(Object.values(MUSIC_THEMES).map((theme) => JSON.stringify(theme.melody))).size).toBe(6);
    for (const theme of Object.values(MUSIC_THEMES)) {
      expect(theme.formBars).toBe(16);
      expect(validateTheme(theme)).toEqual([]);
      for (const key of ['drums', 'bass', 'arp', 'melody', 'reinforcement', 'boss', 'timbres']) expect(theme[key]).toBeTruthy();
    }
    expect(getTheme('missing').id).toBe('menu');
  });

  it('maps game states to adaptive layers', () => {
    const base = { mode: 'deployment', campaign: { currentLevel: 5 }, wave: { index: 0, total: 15, active: false } };
    expect(getMusicScene({ ...base, mode: 'title' })).toMatchObject({ themeId: 'menu', intensity: 0 });
    expect(getMusicScene(base).layers).toEqual(['pad', 'arp']);
    expect(getMusicScene({ ...base, mode: 'playing', wave: { index: 1, total: 15, active: true } }).layers).toEqual(expect.arrayContaining(['pad', 'bass', 'drums']));
    expect(getMusicScene({ ...base, mode: 'playing', wave: { index: 15, total: 15, active: true, boss: true } }).layers).toContain('boss');
    expect(getMusicScene({ ...base, mode: 'wave-countdown' }).layers).not.toContain('reinforcement');
    expect(getMusicScene({ ...base, mode: 'paused' })).toMatchObject({ paused: true, filterHz: 650 });
  });

  it('generates deterministic bounded events and commits on bars', () => {
    const theme = getTheme('chapter-1');
    const low = createStepEvents(theme, { bar: 0, step: 0 }, ['pad', 'bass', 'drums']);
    const high = createStepEvents(theme, { bar: 0, step: 0 }, ['pad', 'bass', 'drums', 'arp', 'melody', 'reinforcement', 'boss']);
    expect(high.length).toBeGreaterThan(low.length);
    expect(high.some((event) => event.layer === 'boss')).toBe(true);
    for (const event of high) for (const key of ['frequency', 'startOffset', 'duration', 'velocity', 'pan']) expect(Number.isFinite(event[key])).toBe(true);
    expect(shouldCommitScene({ themeId: 'menu' }, { themeId: 'chapter-1' }, { step: 0 })).toBe(true);
    expect(shouldCommitScene({ themeId: 'menu' }, { themeId: 'chapter-1' }, { step: 3 })).toBe(false);
    expect(shouldCommitScene({ paused: false }, { paused: true }, { step: 3 })).toBe(true);
  });

  it('provides finite synthesis contracts', () => {
    expect(createEnvelope(1, 0.01, 0.08, 0.5)).toMatchObject({ start: 1, stop: 1.59 });
    expect(SUPPORTED_VOICES).toEqual(expect.arrayContaining(['kick', 'snare', 'hat', 'bass', 'pad', 'chip', 'lead', 'alarm']));
  });
});
