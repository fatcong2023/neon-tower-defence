import { createCampaign, LEVEL_COUNT } from './campaign.js';
import { getUnlockedTowerTypes } from './research.js';

export const SAVE_VERSION = 2;
export const SAVE_KEY = 'neon-tower-defence-campaign';

function cleanStringArray(value) {
  return Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string'))] : [];
}

export function normalizeCampaign(value = {}) {
  if (value.version !== undefined && ![1, SAVE_VERSION].includes(value.version)) return createCampaign();
  const legacy = value.version === 1;
  const campaign = createCampaign({
    seed: Number.isFinite(value.seed) ? value.seed : undefined,
    funds: Number.isFinite(value.funds) ? value.funds : undefined,
    language: value.language,
  });
  campaign.version = SAVE_VERSION;
  const currentLevel = legacy ? Math.ceil((value.currentLevel ?? 1) * LEVEL_COUNT / 50) : value.currentLevel ?? 1;
  const highestCleared = legacy ? Math.floor((value.highestCleared ?? 0) * LEVEL_COUNT / 50) : value.highestCleared ?? 0;
  campaign.currentLevel = Math.max(1, Math.min(LEVEL_COUNT, Math.floor(currentLevel)));
  campaign.highestCleared = Math.max(0, Math.min(LEVEL_COUNT, Math.floor(highestCleared)));
  campaign.levelStartFunds = Number.isFinite(value.levelStartFunds) ? Math.max(0, Math.floor(value.levelStartFunds)) : campaign.funds;
  campaign.coreChips = Number.isFinite(value.coreChips) ? Math.max(0, Math.floor(value.coreChips)) : 0;
  campaign.quantumCores = Number.isFinite(value.quantumCores) ? Math.max(0, Math.min(5, Math.floor(value.quantumCores))) : 0;
  const savedUnlocks = cleanStringArray(value.unlockedTowers);
  campaign.unlockedTowers = [...new Set([...getUnlockedTowerTypes(campaign.highestCleared), ...savedUnlocks])];
  campaign.research = cleanStringArray(value.research);
  campaign.tutorialsSeen = cleanStringArray(value.tutorialsSeen);
  campaign.challengeUnlocked = Boolean(value.challengeUnlocked);
  campaign.challengeMode = Boolean(value.challengeMode && campaign.challengeUnlocked);
  campaign.challengeCycle = Number.isFinite(value.challengeCycle) ? Math.max(0, Math.floor(value.challengeCycle)) : 0;
  campaign.completed = Boolean(value.completed);
  if (value.stats && typeof value.stats === 'object') campaign.stats = { ...campaign.stats, ...value.stats };
  return campaign;
}

export function serializeSave(campaign) {
  return JSON.stringify({ ...campaign, version: SAVE_VERSION });
}

export function parseSave(serialized) {
  try {
    return normalizeCampaign(JSON.parse(serialized));
  } catch {
    return createCampaign();
  }
}

export function loadCampaign(storage = globalThis.localStorage) {
  if (!storage?.getItem) return createCampaign();
  return parseSave(storage.getItem(SAVE_KEY));
}

export function saveCampaign(campaign, storage = globalThis.localStorage) {
  if (!storage?.setItem) return false;
  try {
    storage.setItem(SAVE_KEY, serializeSave(campaign));
    return true;
  } catch {
    return false;
  }
}
