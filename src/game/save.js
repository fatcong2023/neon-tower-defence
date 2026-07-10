import { createCampaign, LEVEL_COUNT } from './campaign.js';

export const SAVE_VERSION = 1;
export const SAVE_KEY = 'neon-tower-defence-campaign';

function cleanStringArray(value) {
  return Array.isArray(value) ? [...new Set(value.filter((item) => typeof item === 'string'))] : [];
}

export function normalizeCampaign(value = {}) {
  if (value.version !== undefined && value.version !== SAVE_VERSION) return createCampaign();
  const campaign = createCampaign({
    seed: Number.isFinite(value.seed) ? value.seed : undefined,
    funds: Number.isFinite(value.funds) ? value.funds : undefined,
    language: value.language,
  });
  campaign.version = SAVE_VERSION;
  campaign.currentLevel = Math.max(1, Math.min(LEVEL_COUNT, Math.floor(value.currentLevel ?? 1)));
  campaign.highestCleared = Math.max(0, Math.min(LEVEL_COUNT, Math.floor(value.highestCleared ?? 0)));
  campaign.levelStartFunds = Number.isFinite(value.levelStartFunds) ? Math.max(0, Math.floor(value.levelStartFunds)) : campaign.funds;
  campaign.coreChips = Number.isFinite(value.coreChips) ? Math.max(0, Math.floor(value.coreChips)) : 0;
  campaign.quantumCores = Number.isFinite(value.quantumCores) ? Math.max(0, Math.min(5, Math.floor(value.quantumCores))) : 0;
  campaign.unlockedTowers = cleanStringArray(value.unlockedTowers).length ? cleanStringArray(value.unlockedTowers) : campaign.unlockedTowers;
  campaign.research = cleanStringArray(value.research);
  campaign.tutorialsSeen = cleanStringArray(value.tutorialsSeen);
  campaign.challengeUnlocked = Boolean(value.challengeUnlocked);
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
