import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import {
  TOWER_TYPES,
  buildTower,
  getSellValue,
  sellTower,
  upgradeTower,
  validatePlacement,
} from '../src/game/towers.js';

function playingState() {
  return startRun(createInitialState());
}

describe('tower catalogue', () => {
  it('defines thirteen distinct towers with three upgrade levels each', () => {
    expect(Object.keys(TOWER_TYPES)).toHaveLength(13);
    Object.values(TOWER_TYPES).forEach((tower) => {
      expect(tower.levels).toHaveLength(3);
      expect(tower.levels.every((level) => level.cost > 0 && level.range > 0)).toBe(true);
    });
  });
});

describe('tower placement', () => {
  it('accepts an open location near the guardian', () => {
    expect(validatePlacement(playingState(), 220, 500, 'pulse')).toEqual({ ok: true });
  });

  it.each([
    [20, 20, 'out-of-bounds'],
    [200, 80, 'on-path'],
    [650, 600, 'out-of-range'],
  ])('rejects invalid placement at %s,%s', (x, y, reason) => {
    expect(validatePlacement(playingState(), x, y, 'pulse')).toEqual({ ok: false, reason });
  });

  it('rejects overlap and insufficient energy', () => {
    const state = playingState();
    expect(buildTower(state, 220, 500, 'pulse').ok).toBe(true);
    expect(validatePlacement(state, 230, 505, 'pulse')).toEqual({ ok: false, reason: 'too-close' });

    state.energy = 0;
    expect(validatePlacement(state, 120, 500, 'pulse')).toEqual({ ok: false, reason: 'insufficient-energy' });
  });
});

describe('tower economy', () => {
  it('charges build and upgrade costs through level three', () => {
    const state = playingState();
    const startingEnergy = state.energy;
    const built = buildTower(state, 220, 500, 'pulse');
    const tower = built.tower;

    expect(state.energy).toBe(startingEnergy - TOWER_TYPES.pulse.levels[0].cost);
    expect(tower.level).toBe(0);

    expect(upgradeTower(state, tower.id).ok).toBe(true);
    expect(tower.level).toBe(1);
    expect(upgradeTower(state, tower.id).ok).toBe(true);
    expect(tower.level).toBe(2);
    expect(upgradeTower(state, tower.id)).toEqual({ ok: false, reason: 'max-level' });
  });

  it('sells a tower for its displayed refund', () => {
    const state = playingState();
    const tower = buildTower(state, 220, 500, 'pulse').tower;
    const refund = getSellValue(tower);
    const energyBeforeSale = state.energy;

    expect(sellTower(state, tower.id)).toEqual({ ok: true, refund });
    expect(state.towers).toHaveLength(0);
    expect(state.energy).toBe(energyBeforeSale + refund);
  });
});
