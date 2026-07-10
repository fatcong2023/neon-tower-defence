import { describe, expect, it } from 'vitest';
import { createCampaignMap, validateMap } from '../src/game/maps.js';
import { pointAtRouteProgress, routeLength } from '../src/game/geometry.js';

describe('campaign map generator', () => {
  it('is deterministic for a level and campaign seed', () => {
    expect(createCampaignMap(17, 4242)).toEqual(createCampaignMap(17, 4242));
    expect(createCampaignMap(17, 4242)).not.toEqual(createCampaignMap(18, 4242));
  });

  it.each([
    [1, 1, 'single'],
    [11, 2, 'split'],
    [21, 2, 'dual'],
    [31, 2, 'asymmetric'],
    [41, 3, 'convergence'],
  ])('uses the chapter route grammar at level %i', (level, routeCount, topology) => {
    const map = createCampaignMap(level, 99);
    expect(map.paths).toHaveLength(routeCount);
    expect(map.topology).toBe(topology);
    expect(map.chapter).toBe(Math.ceil(level / 10));
  });

  it('creates traversable routes with portal and core endpoints', () => {
    const map = createCampaignMap(43, 2026);
    for (const route of map.paths) {
      expect(pointAtRouteProgress(route, 0).x).toBeLessThan(90);
      expect(pointAtRouteProgress(route, 1).x).toBeGreaterThan(1100);
      expect(routeLength(route)).toBeGreaterThan(900);
    }
    expect(map.buildableSamples).toBeGreaterThan(35);
    expect(validateMap(map)).toEqual({ ok: true });
  });

  it('validates all fifty campaign levels across several seeds', () => {
    for (const seed of [7, 2026, 98765]) {
      for (let level = 1; level <= 50; level += 1) {
        const map = createCampaignMap(level, seed);
        expect(validateMap(map), `seed ${seed}, level ${level}`).toEqual({ ok: true });
      }
    }
  });
});
