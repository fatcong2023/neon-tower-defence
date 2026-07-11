import { DOCK_SAFE_Y, PATH_WIDTH, TOWER_RADIUS, distance, distanceToRoutes, routeLength } from './geometry.js';
import { createRandom, hashSeed, randomBetween } from './random.js';

const THEMES = Object.freeze([
  { id: 'genesis', primary: '#4dfcff', secondary: '#9b7bff' },
  { id: 'fracture', primary: '#ff4fd8', secondary: '#4dfcff' },
  { id: 'twin-signal', primary: '#a9ff68', secondary: '#9b7bff' },
  { id: 'overclock', primary: '#ffae57', secondary: '#ff4fd8' },
  { id: 'quantum-night', primary: '#ffffff', secondary: '#ff3f72' },
]);

const point = (x, y) => ({ x: Math.round(x), y: Math.round(y) });

function portalEdge(portal) {
  if (portal.x <= 55) return 'left';
  if (portal.y <= 60) return 'top';
  if (portal.y >= 615) return 'bottom';
  return null;
}

function generateGrammar(chapter, random) {
  const core = point(1160, randomBetween(random, 285, 505));
  const low = randomBetween(random, 588, 615);
  const dx = randomBetween(random, -28, 28);
  const dy = randomBetween(random, -20, 20);

  if (chapter === 1) {
    return {
      topology: 'single', core,
      paths: [[
        point(50, 100 + dy), point(280 + dx, 140), point(165, 355 + dy), point(430, low),
        point(700 + dx, 435), point(525, 150), point(845, 85 + dy), point(1010, 305),
        point(900 + dx, low - 5), point(1080, 535), core,
      ]],
    };
  }

  if (chapter === 2) {
    const start = point(50, 300 + dy);
    return {
      topology: 'split', core,
      paths: [
        [start, point(250, 300), point(175 + dx, 105), point(510, 80 + dy), point(705, 285), point(945 + dx, 115), point(1045, 365), core],
        [start, point(275, 360), point(180 + dx, low - 15), point(500, low), point(425, 390), point(765, 520 + dy), point(675, 245), point(995, low - 5), core],
      ],
    };
  }

  if (chapter === 3) {
    return {
      topology: 'dual', core,
      paths: [
        [point(50, 145 + dy), point(300, 105), point(220 + dx, 390), point(510, low), point(735, 410), point(635, 145), point(960, 230 + dy), point(1040, 545), core],
        [point(420 + dx, 55), point(430, 245), point(690, 95 + dy), point(835, 315), point(700, low), point(1000 + dx, 515), point(930, 280), core],
      ],
    };
  }

  if (chapter === 4) {
    return {
      topology: 'asymmetric', core,
      paths: [
        [point(335 + dx, 55), point(340, 205), point(575, 95 + dy), point(760, 250), point(930, 100), point(1035, 350), core],
        [point(50, 500 + dy), point(245, low), point(180, 300), point(475 + dx, 430), point(410, 90), point(735, 180), point(650, low - 5), point(965, 530), point(885, 275), point(1080, 160), core],
      ],
    };
  }

  return {
    topology: 'convergence', core,
    paths: [
      [point(50, 125 + dy), point(280, 80), point(190 + dx, 345), point(450, low), point(680, 405), point(610, 125), point(930, 250), point(1040, 535), core],
      [point(500 + dx, 55), point(490, 250), point(740, 90 + dy), point(880, 330), point(710, low), point(1010, 510), point(925, 275), core],
      [point(360 + dx, 620), point(345, 430), point(585, low - 25), point(520, 220), point(820, 150 + dy), point(750, 480), point(1030, low - 10), point(970, 320), core],
    ],
  };
}

function countBuildableSamples(paths) {
  let count = 0;
  for (let y = 70; y <= DOCK_SAFE_Y - 18; y += 65) {
    for (let x = 80; x <= 1200; x += 65) {
      if (distanceToRoutes({ x, y }, paths) > PATH_WIDTH / 2 + TOWER_RADIUS + 10) count += 1;
    }
  }
  return count;
}

function makePortals(paths) {
  const portals = [];
  paths.forEach((route, routeIndex) => {
    const start = route[0];
    const existing = portals.find((portal) => portal.x === start.x && portal.y === start.y);
    if (existing) existing.routeIndices.push(routeIndex);
    else portals.push({ ...start, edge: portalEdge(start), routeIndices: [routeIndex] });
  });
  return portals;
}

export function validateMap(map) {
  if (!map?.paths?.length) return { ok: false, reason: 'no-routes' };
  if (!map.core || map.core.x < 1100 || map.core.x > 1210) return { ok: false, reason: 'bad-core' };
  if (!map.portals?.length || map.portals.some((portal) => !portal.edge)) return { ok: false, reason: 'bad-portals' };
  if (map.paths.some((route) => route.length < 6 || routeLength(route) < 1000)) return { ok: false, reason: 'route-too-short' };
  if (map.paths.some((route) => distance(route.at(-1), map.core) > 0.01)) return { ok: false, reason: 'disconnected-core' };
  if (map.paths.some((route) => !portalEdge(route[0]))) return { ok: false, reason: 'bad-endpoints' };
  if (map.paths.flat().some((routePoint) => routePoint.x < 35 || routePoint.x > 1245 || routePoint.y < 50 || routePoint.y > 620)) return { ok: false, reason: 'out-of-bounds' };
  if (!map.paths.flat().some((routePoint) => routePoint.y > 575)) return { ok: false, reason: 'no-lower-arena' };
  if (!map.paths.some((route) => route.slice(0, -1).some((start, index) => start.x !== route[index + 1].x && start.y !== route[index + 1].y))) return { ok: false, reason: 'no-diagonals' };
  if (map.paths.some((route) => route.slice(0, -1).some((start, index) => distance(start, route[index + 1]) < 70))) return { ok: false, reason: 'segment-too-short' };
  if (map.buildableSamples < 35) return { ok: false, reason: 'insufficient-build-space' };
  return { ok: true };
}

export function createCampaignMap(level, campaignSeed = 2026) {
  const safeLevel = Math.max(1, Math.min(20, Math.floor(level)));
  const chapter = Math.ceil(safeLevel / 4);
  let candidate;
  for (let attempt = 0; attempt < 8; attempt += 1) {
    const seed = hashSeed(campaignSeed, safeLevel, attempt);
    const grammar = generateGrammar(chapter, createRandom(seed));
    candidate = {
      id: `map-${seed}`,
      seed,
      level: safeLevel,
      chapter,
      topology: grammar.topology,
      paths: grammar.paths,
      core: grammar.core,
      portals: makePortals(grammar.paths),
      theme: THEMES[chapter - 1],
      pathWidth: PATH_WIDTH,
      buildableSamples: countBuildableSamples(grammar.paths),
      obstacles: [],
    };
    if (validateMap(candidate).ok) return candidate;
  }
  return candidate;
}
