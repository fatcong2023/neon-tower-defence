import { describe, expect, it } from 'vitest';
import { createCampaignMap, validateMap } from '../src/game/maps.js';
import { pointAtRouteProgress, routeLength } from '../src/game/geometry.js';

describe('campaign map generator', () => {
  it('is deterministic for a level and campaign seed', () => {
    expect(createCampaignMap(9, 4242)).toEqual(createCampaignMap(9, 4242));
    expect(createCampaignMap(9, 4242)).not.toEqual(createCampaignMap(9, 4243));
    expect(createCampaignMap(9, 4242)).not.toEqual(createCampaignMap(10, 4242));
  });

  it.each([
    [1, 1, 'single'],
    [5, 2, 'split'],
    [9, 2, 'dual'],
    [13, 2, 'asymmetric'],
    [17, 3, 'convergence'],
  ])('uses the chapter route grammar at level %i', (level, routeCount, topology) => {
    const map = createCampaignMap(level, 99);
    expect(map.paths).toHaveLength(routeCount);
    expect(map.topology).toBe(topology);
    expect(map.chapter).toBe(Math.ceil(level / 4));
  });

  it('uses left, top, and bottom portal edges by chapter', () => {
    expect(createCampaignMap(1, 77).portals.map((portal) => portal.edge)).toEqual(['left']);
    expect(createCampaignMap(9, 77).portals.map((portal) => portal.edge)).toEqual(expect.arrayContaining(['left', 'top']));
    expect(createCampaignMap(17, 77).portals.map((portal) => portal.edge)).toEqual(expect.arrayContaining(['left', 'top', 'bottom']));
  });

  it('creates traversable routes with portal and core endpoints', () => {
    const map = createCampaignMap(17, 2026);
    expect(map.core.x).toBeGreaterThan(1100);
    for (const route of map.paths) {
      expect(pointAtRouteProgress(route, 1)).toEqual(map.core);
      expect(routeLength(route)).toBeGreaterThan(1050);
    }
    expect(map.paths.flat().some((routePoint) => routePoint.y > 575)).toBe(true);
    expect(map.paths.some((route) => route.slice(0, -1).some((start, index) => {
      const end = route[index + 1];
      return start.x !== end.x && start.y !== end.y;
    }))).toBe(true);
    expect(map.buildableSamples).toBeGreaterThan(35);
    expect(validateMap(map)).toEqual({ ok: true });
  });

  it('validates all twenty campaign levels across several seeds', () => {
    for (const seed of [7, 2026, 98765]) {
      for (let level = 1; level <= 20; level += 1) {
        const map = createCampaignMap(level, seed);
        expect(validateMap(map), `seed ${seed}, level ${level}`).toEqual({ ok: true });
        expect(map.paths.flat().some((routePoint) => routePoint.y > 575)).toBe(true);
      }
    }
  });
});
