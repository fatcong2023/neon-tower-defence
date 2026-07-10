import { BASE_TOWERS, CHAPTER_TOWER_UNLOCKS } from './campaign.js';
import { TOWER_TYPES } from './towers.js';

const TOWER_ORDER = Object.keys(TOWER_TYPES);

export const RESEARCH_NODES = Object.freeze(TOWER_ORDER.flatMap((tower, towerIndex) => [1, 2, 3].map((rank) => ({
  id: `${tower}-${rank}`,
  tower,
  rank,
  cost: 4 + towerIndex * 2 + rank * 3,
  prerequisite: rank > 1 ? `${tower}-${rank - 1}` : null,
  effect: rank === 1 ? 'damage' : rank === 2 ? 'range' : 'cooldown',
  value: rank === 1 ? 0.12 : rank === 2 ? 0.08 : 0.1,
}))));

export function getUnlockedTowerTypes(highestCleared = 0) {
  const types = [...BASE_TOWERS];
  for (const [required, unlocked] of Object.entries(CHAPTER_TOWER_UNLOCKS)) {
    if (highestCleared >= Number(required)) types.push(...unlocked);
  }
  return types;
}

export function syncTowerUnlocks(campaign) {
  campaign.unlockedTowers = getUnlockedTowerTypes(campaign.highestCleared);
  return campaign.unlockedTowers;
}

export function purchaseResearch(campaign, nodeId) {
  const node = RESEARCH_NODES.find((candidate) => candidate.id === nodeId);
  if (!node) return { ok: false, reason: 'unknown-node' };
  if (!campaign.unlockedTowers.includes(node.tower)) return { ok: false, reason: 'tower-locked' };
  if (campaign.research.includes(nodeId)) return { ok: false, reason: 'already-owned' };
  if (node.prerequisite && !campaign.research.includes(node.prerequisite)) return { ok: false, reason: 'prerequisite' };
  if (campaign.coreChips < node.cost) return { ok: false, reason: 'insufficient-chips' };
  campaign.coreChips -= node.cost;
  campaign.research.push(nodeId);
  return { ok: true, node };
}

export function applyResearchModifiers(type, baseStats, campaign) {
  const stats = { ...baseStats };
  if (!campaign) return stats;
  for (const node of RESEARCH_NODES.filter((candidate) => candidate.tower === type && campaign.research.includes(candidate.id))) {
    if (node.effect === 'damage') stats.damage = Number((stats.damage * (1 + node.value)).toFixed(2));
    if (node.effect === 'range') stats.range = Math.round(stats.range * (1 + node.value));
    if (node.effect === 'cooldown') stats.cooldown = Number((stats.cooldown * (1 - node.value)).toFixed(3));
  }
  if (campaign.challengeUnlocked) {
    stats.damage = Number((stats.damage * 1.08).toFixed(2));
    stats.cooldown = Number((stats.cooldown * 0.92).toFixed(3));
  }
  return stats;
}
