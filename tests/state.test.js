import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import { BASE_MAX_HEALTH, STARTING_ENERGY } from '../src/game/config.js';

describe('game state', () => {
  it('starts on the title screen', () => {
    const state = createInitialState();

    expect(state.mode).toBe('title');
    expect(state.player).toBeDefined();
  });

  it('starts a fresh playable run', () => {
    const state = startRun(createInitialState());

    expect(state.mode).toBe('deployment');
    expect(state.base.health).toBe(BASE_MAX_HEALTH);
    expect(state.energy).toBe(STARTING_ENERGY);
    expect(state.wave).toMatchObject({ index: 0, total: 10, active: false, completed: false });
    expect(state.towers).toEqual([]);
    expect(state.enemies).toEqual([]);
  });
});
