import {
  BASE_MAX_HEALTH,
  PLAYER_START,
  STARTING_ENERGY,
} from './config.js';
import { createCampaignMap } from './maps.js';

let nextEntityId = 1;

export function createPlayer() {
  return {
    id: `player-${nextEntityId++}`,
    x: PLAYER_START.x,
    y: PLAYER_START.y,
    radius: 17,
    speed: 235,
    angle: 0,
    shotCooldown: 0,
    dashCooldown: 0,
    dashTimer: 0,
    buildRadius: 185,
  };
}

export function createInitialState() {
  return {
    mode: 'title',
    map: createCampaignMap(1, 2026),
    time: 0,
    player: createPlayer(),
    base: { health: BASE_MAX_HEALTH, maxHealth: BASE_MAX_HEALTH },
    energy: STARTING_ENERGY,
    score: 0,
    kills: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    effects: [],
    wave: {
      index: 0,
      countdown: 3,
      spawnQueue: [],
      spawnTimer: 0,
      active: false,
      completed: false,
    },
    selectedTowerType: null,
    selectedTowerId: null,
    placement: null,
    notice: '',
    noticeTimer: 0,
    muted: false,
    cameraShake: 0,
  };
}

export function startRun(previousState = createInitialState()) {
  const fresh = createInitialState();
  fresh.mode = 'countdown';
  fresh.muted = Boolean(previousState.muted);
  return fresh;
}

export function allocateId(prefix = 'entity') {
  return `${prefix}-${nextEntityId++}`;
}
