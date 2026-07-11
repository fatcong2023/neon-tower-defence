import {
  BASE_MAX_HEALTH,
  PLAYER_START,
  STARTING_ENERGY,
} from './config.js';
import { createCampaignMap } from './maps.js';
import { createCampaign, prepareLevel } from './campaign.js';
import { createAudioPreferences, normalizeAudioPreferences } from './preferences.js';

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

export function createInitialState(options = {}) {
  const campaign = options.campaign ?? createCampaign();
  const audio = normalizeAudioPreferences(options.audio ?? {});
  return {
    mode: 'title',
    campaign,
    map: createCampaignMap(campaign.currentLevel, campaign.seed),
    time: 0,
    player: createPlayer(),
    base: { health: BASE_MAX_HEALTH, maxHealth: BASE_MAX_HEALTH },
    energy: STARTING_ENERGY,
    score: 0,
    kills: 0,
    leaks: 0,
    towers: [],
    enemies: [],
    projectiles: [],
    effects: [],
    wave: {
      index: 0,
      total: 10,
      countdown: 0,
      spawnQueue: [],
      spawnTimer: 0,
      active: false,
      completed: false,
      preview: [],
    },
    selectedTowerType: null,
    selectedTowerId: null,
    placement: null,
    notice: '',
    noticeTimer: 0,
    audio,
    muted: audio.muted,
    cameraShake: 0,
  };
}

export function startRun(previousState = createInitialState()) {
  const audio = previousState.audio ?? createAudioPreferences({ muted: previousState.muted });
  const fresh = createInitialState({ campaign: previousState.campaign ?? createCampaign(), audio });
  prepareLevel(fresh, fresh.campaign);
  return fresh;
}

export function allocateId(prefix = 'entity') {
  return `${prefix}-${nextEntityId++}`;
}
