import { DOCK_SAFE_Y, PATH_WIDTH, TOWER_RADIUS, distanceToRoutes, routeLength } from './geometry.js';
import { createRandom, hashSeed, randomBetween } from './random.js';

const THEMES = [
  { id: 'genesis', primary: '#4dfcff', secondary: '#9b7bff' },
  { id: 'fracture', primary: '#ff4fd8', secondary: '#4dfcff' },
  { id: 'twin-signal', primary: '#a9ff68', secondary: '#9b7bff' },
  { id: 'overclock', primary: '#ffae57', secondary: '#ff4fd8' },
  { id: 'quantum-night', primary: '#ffffff', secondary: '#ff3f72' },
];

const point = (x, y) => ({ x: Math.round(x), y: Math.round(y) });

function singleRoute(random) {
  const top = randomBetween(random, 82, 155);
  const middle = randomBetween(random, 250, 330);
  const low = randomBetween(random, 455, 555);
  return [[point(50, top), point(275, top), point(275, middle), point(610, middle), point(610, 115), point(1010, 115), point(1010, low), point(1140, low)]];
}

function splitRoutes(random) {
  const startY = randomBetween(random, 95, 155);
  const endY = randomBetween(random, 480, 555);
  return [
    [point(50, startY), point(260, startY), point(260, 235), point(690, 235), point(690, 100), point(1010, 100), point(1010, endY), point(1140, endY)],
    [point(50, startY), point(260, startY), point(260, 470), point(530, 470), point(530, 360), point(850, 360), point(850, endY), point(1140, endY)],
  ];
}

function dualRoutes(random, asymmetric = false) {
  const endY = randomBetween(random, 470, 545);
  const top = [point(50, 90), point(330, 90), point(330, 215), point(760, 215), point(760, 100), point(1040, 100), point(1040, endY), point(1140, endY)];
  const bottom = asymmetric
    ? [point(50, 520), point(210, 520), point(210, 340), point(500, 340), point(500, 500), point(760, 500), point(760, 390), point(980, 390), point(980, endY), point(1140, endY)]
    : [point(50, 520), point(310, 520), point(310, 370), point(650, 370), point(650, 520), point(930, 520), point(930, endY), point(1140, endY)];
  return [top, bottom];
}

function convergenceRoutes(random) {
  const endY = randomBetween(random, 430, 530);
  return [
    [point(50, 75), point(290, 75), point(290, 190), point(590, 190), point(590, 85), point(960, 85), point(960, endY), point(1140, endY)],
    [point(50, 300), point(230, 300), point(230, 190), point(440, 190), point(440, 390), point(790, 390), point(790, endY), point(1140, endY)],
    [point(50, 545), point(350, 545), point(350, 430), point(650, 430), point(650, 545), point(930, 545), point(930, endY), point(1140, endY)],
  ];
}

function countBuildableSamples(paths) {
  let count = 0;
  for (let y = 70; y <= DOCK_SAFE_Y - 30; y += 70) {
    for (let x = 80; x <= 1200; x += 70) {
      if (distanceToRoutes({ x, y }, paths) > PATH_WIDTH / 2 + TOWER_RADIUS + 10) count += 1;
    }
  }
  return count;
}

export function validateMap(map) {
  if (!map?.paths?.length) return { ok: false, reason: 'no-routes' };
  if (map.paths.some((route) => route.length < 4 || routeLength(route) < 900)) return { ok: false, reason: 'route-too-short' };
  if (map.paths.some((route) => route[0].x > 90 || route.at(-1).x < 1100)) return { ok: false, reason: 'bad-endpoints' };
  if (map.paths.flat().some((routePoint) => routePoint.x < 35 || routePoint.x > 1245 || routePoint.y < 50 || routePoint.y > 590)) return { ok: false, reason: 'out-of-bounds' };
  if (map.buildableSamples < 35) return { ok: false, reason: 'insufficient-build-space' };
  return { ok: true };
}

export function createCampaignMap(level, campaignSeed = 2026) {
  const safeLevel = Math.max(1, Math.min(50, Math.floor(level)));
  const chapter = Math.ceil(safeLevel / 10);
  const seed = hashSeed(campaignSeed, safeLevel);
  const random = createRandom(seed);
  let topology;
  let paths;
  if (safeLevel <= 10) { topology = 'single'; paths = singleRoute(random); }
  else if (safeLevel <= 20) { topology = 'split'; paths = splitRoutes(random); }
  else if (safeLevel <= 30) { topology = 'dual'; paths = dualRoutes(random); }
  else if (safeLevel <= 40) { topology = 'asymmetric'; paths = dualRoutes(random, true); }
  else { topology = 'convergence'; paths = convergenceRoutes(random); }
  const map = {
    id: `map-${campaignSeed}-${safeLevel}`,
    seed,
    level: safeLevel,
    chapter,
    topology,
    paths,
    theme: THEMES[chapter - 1],
    pathWidth: PATH_WIDTH,
    buildableSamples: countBuildableSamples(paths),
    obstacles: [],
  };
  return map;
}
