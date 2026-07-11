import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import {
  AUDIO_PREFERENCES_KEY, createAudioPreferences, loadAudioPreferences,
  normalizeAudioPreferences, saveAudioPreferences, setMusicVolume, setSfxVolume,
  toggleMutePreference,
} from '../src/game/preferences.js';

describe('audio preference', () => {
  it('normalizes mixer values and migrates legacy mute', () => {
    expect(createAudioPreferences()).toEqual({ muted: false, musicVolume: 0.55, sfxVolume: 0.7 });
    expect(normalizeAudioPreferences({ muted: true, musicVolume: 2, sfxVolume: -1 }))
      .toEqual({ muted: true, musicVolume: 1, sfxVolume: 0 });
    expect(normalizeAudioPreferences({ muted: true })).toEqual({ muted: true, musicVolume: 0.55, sfxVolume: 0.7 });
  });

  it('round trips mixer settings through storage', () => {
    const values = new Map();
    const storage = { getItem: (key) => values.get(key) ?? null, setItem: (key, value) => values.set(key, value) };
    const saved = { muted: true, musicVolume: 0.2, sfxVolume: 0.9 };
    saveAudioPreferences(saved, storage);
    expect(values.has(AUDIO_PREFERENCES_KEY)).toBe(true);
    expect(loadAudioPreferences(storage)).toEqual(saved);
  });

  it('toggles predictably and survives run resets', () => {
    const state = createInitialState();
    expect(toggleMutePreference(state)).toBe(true);
    expect(state.muted).toBe(true);

    const restarted = startRun(state);
    expect(restarted.muted).toBe(true);
    expect(toggleMutePreference(restarted)).toBe(false);
    expect(restarted.muted).toBe(false);
    setMusicVolume(restarted, 0.25);
    setSfxVolume(restarted, 0.8);
    expect(restarted.audio).toEqual({ muted: false, musicVolume: 0.25, sfxVolume: 0.8 });
  });

  it('does not modify authoritative combat state', () => {
    const state = startRun(createInitialState());
    const before = { health: state.base.health, energy: state.energy, score: state.score };

    toggleMutePreference(state);

    expect({ health: state.base.health, energy: state.energy, score: state.score }).toEqual(before);
  });
});
