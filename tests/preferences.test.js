import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import { toggleMutePreference } from '../src/game/preferences.js';

describe('audio preference', () => {
  it('toggles predictably and survives run resets', () => {
    const state = createInitialState();
    expect(toggleMutePreference(state)).toBe(true);
    expect(state.muted).toBe(true);

    const restarted = startRun(state);
    expect(restarted.muted).toBe(true);
    expect(toggleMutePreference(restarted)).toBe(false);
    expect(restarted.muted).toBe(false);
  });

  it('does not modify authoritative combat state', () => {
    const state = startRun(createInitialState());
    const before = { health: state.base.health, energy: state.energy, score: state.score };

    toggleMutePreference(state);

    expect({ health: state.base.health, energy: state.energy, score: state.score }).toEqual(before);
  });
});
