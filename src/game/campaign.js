import { BASE_MAX_HEALTH, STARTING_ENERGY } from './config.js';
import { createCampaignMap } from './maps.js';
import { beginWave } from './waves.js';
import {
  CHAPTER_TOWER_UNLOCKS,
  LEVEL_COUNT,
  getStageDefinition,
} from './stages.js';

export { CHAPTER_TOWER_UNLOCKS, LEVEL_COUNT } from './stages.js';
export const BASE_TOWERS = Object.freeze(['pulse', 'prism', 'arc', 'nova', 'frost']);

export function getLevelDefinition(level) {
  return getStageDefinition(level);
}

export function createCampaign(options = {}) {
  const funds = Number.isFinite(options.funds) ? Math.max(0, Math.floor(options.funds)) : STARTING_ENERGY;
  return {
    version: 2,
    seed: Number.isFinite(options.seed) ? Math.floor(options.seed) : 20260710,
    language: options.language === 'en' ? 'en' : 'zh-CN',
    currentLevel: 1,
    highestCleared: 0,
    funds,
    levelStartFunds: funds,
    coreChips: 0,
    quantumCores: 0,
    unlockedTowers: [...BASE_TOWERS],
    research: [],
    tutorialsSeen: [],
    challengeUnlocked: false,
    challengeMode: false,
    challengeCycle: 0,
    completed: false,
    stats: { totalKills: 0, noLeakClears: 0, levelsCleared: 0, towerBuilds: {} },
  };
}

export function prepareLevel(state, campaign) {
  campaign.levelStartFunds = campaign.funds;
  state.campaign = campaign;
  state.mode = 'deployment';
  const mapSeed = campaign.seed + (campaign.challengeMode ? campaign.challengeCycle * 100003 : 0);
  state.map = createCampaignMap(campaign.currentLevel, mapSeed);
  state.energy = campaign.funds;
  state.base = { health: BASE_MAX_HEALTH, maxHealth: BASE_MAX_HEALTH };
  state.score = 0;
  state.kills = 0;
  state.leaks = 0;
  state.towers = [];
  state.enemies = [];
  state.projectiles = [];
  state.effects = [];
  state.wave = { index: campaign.currentLevel, countdown: 0, spawnQueue: [], spawnTimer: 0, active: false, completed: false };
  state.selectedTowerId = null;
  state.selectedTowerType = null;
  state.notice = '';
  state.noticeTimer = 0;
  return state;
}

export function startAssault(state, campaign = state.campaign) {
  if (state.mode !== 'deployment') return false;
  return beginWave(state, campaign.currentLevel);
}

export function settleLevel(state, campaign = state.campaign) {
  const definition = getLevelDefinition(campaign.currentLevel);
  const recycled = state.towers.reduce((sum, tower) => sum + Math.floor(tower.invested * 0.65), 0);
  const fullHealth = state.base.health >= state.base.maxHealth;
  const noLeaks = (state.leaks ?? 0) === 0;
  const performanceBonus = (fullHealth ? 45 + definition.level * 2 : 0) + (noLeaks ? 30 + definition.level : 0);
  const totalFunds = Math.floor(state.energy + recycled + definition.baseReward + performanceBonus);
  const clearedLevel = campaign.currentLevel;
  campaign.funds = totalFunds;
  campaign.highestCleared = Math.max(campaign.highestCleared, clearedLevel);
  for (const [required, types] of Object.entries(CHAPTER_TOWER_UNLOCKS)) {
    if (campaign.highestCleared >= Number(required)) {
      types.forEach((type) => { if (!campaign.unlockedTowers.includes(type)) campaign.unlockedTowers.push(type); });
    }
  }
  campaign.coreChips += definition.chipReward + (noLeaks ? 1 : 0);
  if (definition.boss) campaign.quantumCores = Math.min(5, campaign.quantumCores + 1);
  campaign.stats.totalKills += state.kills;
  campaign.stats.levelsCleared += 1;
  if (noLeaks) campaign.stats.noLeakClears += 1;
  if (clearedLevel >= LEVEL_COUNT) {
    campaign.completed = true;
    campaign.challengeUnlocked = true;
  } else campaign.currentLevel += 1;
  campaign.levelStartFunds = campaign.funds;
  state.towers = [];
  return { recycled, baseReward: definition.baseReward, performanceBonus, totalFunds, clearedLevel };
}

export function retryLevel(campaign) {
  campaign.funds = campaign.levelStartFunds;
  return campaign.funds;
}

export function canSelectLevel(campaign, level) {
  const number = Math.floor(level);
  return Number.isFinite(level) && number >= 1 && number <= Math.min(LEVEL_COUNT, campaign.highestCleared + 1);
}

export function selectCampaignLevel(campaign, level) {
  if (!canSelectLevel(campaign, level)) return { ok: false, reason: 'locked' };
  campaign.currentLevel = Math.floor(level);
  campaign.levelStartFunds = campaign.funds;
  campaign.completed = false;
  return { ok: true, level: campaign.currentLevel };
}

export function beginChallengeCampaign(campaign) {
  if (!campaign.challengeUnlocked) return { ok: false, reason: 'locked' };
  campaign.challengeMode = true;
  campaign.challengeCycle = Math.max(0, campaign.challengeCycle ?? 0) + 1;
  campaign.currentLevel = 1;
  campaign.levelStartFunds = campaign.funds;
  campaign.completed = false;
  return { ok: true, cycle: campaign.challengeCycle };
}
