import { spawnEnemy } from './enemies.js';
import { BOSS_VARIANTS, startFinalCinematic } from './cinematic.js';

function makeLevelGroups(level) {
  const groups = [{ type: 'grunt', count: 5 + Math.ceil(level * 0.85), spacing: Math.max(0.28, 0.82 - level * 0.006) }];
  if (level >= 2) groups.push({ type: 'runner', count: 2 + Math.ceil(level * 0.28), spacing: 0.55 });
  if (level >= 3) groups.push({ type: 'swarm', count: 4 + Math.ceil(level * 0.4), spacing: 0.24 });
  if (level >= 4) groups.push({ type: 'tank', count: Math.ceil(level * 0.14), spacing: 1.05 });
  if (level >= 6) groups.push({ type: 'juggernaut', count: Math.ceil(level * 0.09), spacing: 1.1 });
  if (level >= 8) groups.push({ type: 'healer', count: Math.ceil(level * 0.05), spacing: 1.2 });
  if (level >= 11) groups.push({ type: 'aegis', count: Math.ceil(level * 0.1), spacing: 0.8 });
  if (level >= 16) groups.push({ type: 'splitter', count: Math.ceil(level * 0.07), spacing: 0.7 });
  if (level >= 21) groups.push({ type: 'crystal', count: Math.ceil(level * 0.09), spacing: 0.9 });
  if (level >= 26) groups.push({ type: 'disruptor', count: Math.ceil(level * 0.06), spacing: 0.9 });
  if (level >= 31) groups.push({ type: 'mystic', count: Math.ceil(level * 0.09), spacing: 0.75 });
  if (level % 10 === 0) groups.unshift({ type: BOSS_VARIANTS.find((boss) => boss.level === level)?.type ?? 'boss', count: 1, spacing: 0 });
  return groups;
}

export const WAVE_DEFINITIONS = Object.freeze(Array.from({ length: 50 }, (_, index) => makeLevelGroups(index + 1)));

export function createSpawnQueue(level, waveNumber = 1, totalWaves = 10) {
  const pressureLevel = Math.max(1, level + Math.floor((waveNumber - 1) / Math.max(1, totalWaves / 5)));
  const groups = makeLevelGroups(pressureLevel);
  const queue = [];
  groups.forEach((group, groupIndex) => {
    for (let index = 0; index < group.count; index += 1) {
      queue.push({
        type: group.type,
        delay: queue.length === 0 ? 0 : index === 0 && groupIndex > 0 ? 1.1 : group.spacing,
      });
    }
  });
  return queue;
}

export function beginWave(state, waveNumber = state.wave.index + 1) {
  if (waveNumber < 1 || waveNumber > state.wave.total) return false;
  state.mode = 'playing';
  state.wave.index = waveNumber;
  state.wave.active = true;
  state.wave.completed = false;
  state.wave.countdown = 0;
  state.wave.preview = [];
  state.wave.spawnQueue = createSpawnQueue(state.campaign.currentLevel, waveNumber, state.wave.total);
  state.wave.spawnTimer = state.wave.spawnQueue[0]?.delay ?? 0;
  state.notice = waveNumber === state.wave.total ? 'FINAL WAVE' : `WAVE ${waveNumber}`;
  state.noticeTimer = 1.8;
  return true;
}

export function launchNextWaveEarly(state) {
  if (state.mode !== 'wave-countdown') return false;
  return beginWave(state, state.wave.index + 1);
}

export function updateWaveState(state, delta) {
  if (state.mode === 'wave-countdown') {
    state.wave.countdown -= delta;
    if (state.wave.countdown <= 0) beginWave(state, state.wave.index + 1);
    return;
  }
  if (state.mode !== 'playing' || !state.wave.active) return;

  if (state.wave.spawnQueue.length > 0) {
    state.wave.spawnTimer -= delta;
    while (state.wave.spawnQueue.length > 0 && state.wave.spawnTimer <= 0) {
      const next = state.wave.spawnQueue.shift();
      spawnEnemy(state, next.type);
      state.wave.spawnTimer += state.wave.spawnQueue[0]?.delay ?? 0;
      if (state.wave.spawnTimer === 0) break;
    }
  }

  if (state.wave.spawnQueue.length === 0 && state.enemies.length === 0) {
    state.wave.active = false;
    state.wave.completed = true;
    state.projectiles = [];
    if (state.wave.index < state.wave.total) {
      state.mode = 'wave-countdown';
      state.wave.countdown = 5;
      state.wave.preview = [...new Set(createSpawnQueue(
        state.campaign.currentLevel,
        state.wave.index + 1,
        state.wave.total,
      ).map((entry) => entry.type))].slice(0, 4);
      state.notice = 'WAVE CLEARED';
      state.noticeTimer = 1.2;
    } else if (state.campaign.currentLevel === 20) startFinalCinematic(state);
    else {
      state.mode = 'level-clear';
      state.notice = 'LEVEL CLEARED';
      state.noticeTimer = 2;
    }
  }
}
