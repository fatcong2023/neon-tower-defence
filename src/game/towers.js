import { allocateId } from './state.js';
import {
  PATH_WIDTH,
  TOWER_RADIUS,
  TOWER_SPACING,
  distance,
  distanceToRoutes,
  isInsideArena,
} from './geometry.js';

const level = (cost, range, damage, cooldown, extra = {}) => ({ cost, range, damage, cooldown, ...extra });

export const TOWER_TYPES = Object.freeze({
  pulse: {
    name: 'Pulse Spire',
    shortName: 'PULSE',
    role: 'Rapid single target',
    color: '#4dfcff',
    glyph: '▲',
    attack: 'single',
    levels: [
      level(90, 142, 12, 0.36),
      level(115, 158, 19, 0.29),
      level(165, 176, 29, 0.22),
    ],
  },
  prism: {
    name: 'Prism Cannon',
    shortName: 'PRISM',
    role: 'Heavy long range',
    color: '#ff4fd8',
    glyph: '◆',
    attack: 'single',
    levels: [
      level(150, 215, 48, 1.28),
      level(190, 238, 78, 1.08),
      level(260, 265, 126, 0.9),
    ],
  },
  arc: {
    name: 'Arc Coil',
    shortName: 'ARC',
    role: 'Chain lightning',
    color: '#a9ff68',
    glyph: '⬡',
    attack: 'chain',
    levels: [
      level(175, 155, 20, 0.95, { chains: 2, chainRange: 92 }),
      level(215, 170, 30, 0.79, { chains: 3, chainRange: 105 }),
      level(290, 190, 44, 0.62, { chains: 4, chainRange: 120 }),
    ],
  },
  nova: {
    name: 'Nova Mortar',
    shortName: 'NOVA',
    role: 'Large splash damage',
    color: '#ffae57',
    glyph: '⬟',
    attack: 'splash',
    levels: [
      level(195, 190, 34, 1.55, { splash: 62 }),
      level(245, 210, 52, 1.3, { splash: 78 }),
      level(330, 232, 80, 1.05, { splash: 96 }),
    ],
  },
  frost: {
    name: 'Frost Beacon',
    shortName: 'FROST',
    role: 'Area slow field',
    color: '#9b7bff',
    glyph: '✦',
    attack: 'pulse',
    levels: [
      level(160, 122, 8, 0.8, { slow: 0.68, slowDuration: 1.2 }),
      level(205, 140, 13, 0.67, { slow: 0.58, slowDuration: 1.5 }),
      level(280, 160, 21, 0.52, { slow: 0.48, slowDuration: 1.8 }),
    ],
  },
  gravity: {
    name: 'Gravity Well', shortName: 'GRAVITY', role: 'Group and slow crowds', color: '#7ddcff', glyph: '◎', attack: 'gravity',
    levels: [level(230, 145, 12, 1.1, { slow: 0.62 }), level(300, 165, 20, 0.9, { slow: 0.52 }), level(390, 190, 31, 0.72, { slow: 0.42 })],
  },
  solar: {
    name: 'Solar Lance', shortName: 'SOLAR', role: 'Piercing anti-heal beam', color: '#ffe06b', glyph: '☀', attack: 'line',
    levels: [level(260, 230, 38, 1.15, { targets: 3 }), level(335, 255, 60, 0.95, { targets: 4 }), level(430, 285, 92, 0.76, { targets: 6 })],
  },
  drone: {
    name: 'Drone Hive', shortName: 'DRONE', role: 'Cross-route response', color: '#6fffd8', glyph: '✣', attack: 'drone',
    levels: [level(285, 320, 22, 0.58), level(365, 370, 34, 0.46), level(470, 430, 49, 0.34)],
  },
  corrosion: {
    name: 'Corrosion Forge', shortName: 'CORRODE', role: 'Universal armor erosion', color: '#b8ff45', glyph: '◉', attack: 'corrosion',
    levels: [level(300, 135, 10, 0.85, { splash: 55 }), level(385, 150, 17, 0.68, { splash: 70 }), level(490, 170, 27, 0.52, { splash: 88 })],
  },
  relay: {
    name: 'Resonance Relay', shortName: 'RELAY', role: 'Boost nearby towers', color: '#70a7ff', glyph: '⌁', attack: 'support',
    levels: [level(320, 145, 0, 1.1, { boost: 0.14 }), level(410, 165, 0, 0.9, { boost: 0.21 }), level(525, 190, 0, 0.7, { boost: 0.3 })],
  },
  rift: {
    name: 'Rift Gate', shortName: 'RIFT', role: 'Roll enemies backward', color: '#d17bff', glyph: '◌', attack: 'rift',
    levels: [level(360, 155, 8, 2.5, { rollback: 0.055 }), level(460, 180, 14, 2.05, { rollback: 0.075 }), level(590, 205, 22, 1.65, { rollback: 0.1 })],
  },
  quantum: {
    name: 'Quantum Splitter', shortName: 'QUANTUM', role: 'Multi-route copied attacks', color: '#ff75c8', glyph: '✧', attack: 'multi',
    levels: [level(420, 235, 32, 0.92, { targets: 2 }), level(540, 265, 48, 0.72, { targets: 3 }), level(690, 300, 70, 0.54, { targets: 4 })],
  },
  singularity: {
    name: 'Singularity Cannon', shortName: 'SINGULAR', role: 'Endgame boss artillery', color: '#ff526f', glyph: '⬢', attack: 'splash',
    levels: [level(650, 260, 130, 2.8, { splash: 92 }), level(820, 295, 205, 2.3, { splash: 116 }), level(1050, 335, 330, 1.82, { splash: 145 })],
  },
});

export function getTowerStats(tower) {
  return TOWER_TYPES[tower.type]?.levels[tower.level] ?? null;
}

export function validatePlacement(state, x, y, type) {
  const definition = TOWER_TYPES[type];
  if (!definition) return { ok: false, reason: 'unknown-type' };
  if (state.campaign && !state.campaign.unlockedTowers.includes(type)) return { ok: false, reason: 'locked' };
  const point = { x, y };
  if (!isInsideArena(point, TOWER_RADIUS)) return { ok: false, reason: 'out-of-bounds' };
  if (distanceToRoutes(point, state.map?.paths ?? []) < PATH_WIDTH / 2 + TOWER_RADIUS + 6) return { ok: false, reason: 'on-path' };
  if (state.towers.some((tower) => distance(point, tower) < TOWER_SPACING)) return { ok: false, reason: 'too-close' };
  if (distance(point, state.player) > state.player.buildRadius) return { ok: false, reason: 'out-of-range' };
  if (state.energy < definition.levels[0].cost) return { ok: false, reason: 'insufficient-energy' };
  return { ok: true };
}

export function buildTower(state, x, y, type) {
  const validation = validatePlacement(state, x, y, type);
  if (!validation.ok) return validation;

  const tower = {
    id: allocateId('tower'),
    type,
    x,
    y,
    radius: TOWER_RADIUS,
    level: 0,
    cooldown: 0,
    angle: -Math.PI / 2,
    invested: TOWER_TYPES[type].levels[0].cost,
  };
  state.energy -= tower.invested;
  state.towers.push(tower);
  return { ok: true, tower };
}

export function upgradeTower(state, towerId) {
  const tower = state.towers.find((candidate) => candidate.id === towerId);
  if (!tower) return { ok: false, reason: 'tower-not-found' };
  if (tower.level >= 2) return { ok: false, reason: 'max-level' };

  const cost = TOWER_TYPES[tower.type].levels[tower.level + 1].cost;
  if (state.energy < cost) return { ok: false, reason: 'insufficient-energy' };

  state.energy -= cost;
  tower.invested += cost;
  tower.level += 1;
  tower.cooldown = Math.min(tower.cooldown, getTowerStats(tower).cooldown);
  return { ok: true, tower, cost };
}

export function getSellValue(tower) {
  return Math.floor(tower.invested * 0.65);
}

export function sellTower(state, towerId) {
  const index = state.towers.findIndex((tower) => tower.id === towerId);
  if (index === -1) return { ok: false, reason: 'tower-not-found' };

  const [tower] = state.towers.splice(index, 1);
  const refund = getSellValue(tower);
  state.energy += refund;
  if (state.selectedTowerId === towerId) state.selectedTowerId = null;
  return { ok: true, refund };
}
