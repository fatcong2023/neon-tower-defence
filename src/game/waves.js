import { spawnEnemy } from './enemies.js';
import { BOSS_VARIANTS, startFinalCinematic } from './cinematic.js';

function makeWaveGroups(level, waveNumber, totalWaves) {
  const progress = Math.max(0, Math.min(1, waveNumber / totalWaves));
  const chapter = Math.ceil(level / 4);
  const base = 4 + level + Math.floor(progress * 9);
  const spacing = Math.max(0.26, 0.72 - level * 0.012 - progress * 0.16);
  const groups = [{ type: 'grunt', count: base, spacing }];

  if (progress >= 0.12 || waveNumber >= 2) groups.push({ type: 'runner', count: 2 + chapter + Math.floor(progress * 4), spacing: 0.46 });
  if (progress >= 0.3) groups.push({ type: 'swarm', count: 5 + chapter * 2 + Math.floor(progress * 5), spacing: 0.2 });
  if (progress >= 0.38) groups.push({ type: 'tank', count: 1 + chapter + Math.floor(progress * 2), spacing: 0.86 });
  if (progress >= 0.45 && level >= 2) groups.push({ type: 'juggernaut', count: Math.max(1, chapter - 1 + Math.floor(progress * 2)), spacing: 0.95 });
  if (progress >= 0.52 && level >= 5) groups.push({ type: 'aegis', count: chapter, spacing: 0.72 });
  if (progress >= 0.62 && level >= 9) groups.push({ type: 'crystal', count: chapter - 1, spacing: 0.8 });
  if (progress >= 0.7 && level >= 13) groups.push({ type: 'mystic', count: chapter - 1, spacing: 0.74 });
  if (progress >= 0.7) groups.push({ type: 'healer', count: 1 + Math.floor(chapter / 2), spacing: 1.05 });
  if (progress >= 0.76) groups.push({ type: 'splitter', count: 2 + chapter, spacing: 0.62 });
  if (progress >= 0.84) groups.push({ type: 'disruptor', count: 1 + Math.floor(chapter / 2), spacing: 0.82 });

  if (waveNumber === totalWaves) {
    const boss = BOSS_VARIANTS.find((candidate) => candidate.level === level);
    if (boss) groups.unshift({ type: boss.type, count: 1, spacing: 0 });
    else groups.push({ type: chapter >= 3 ? 'juggernaut' : 'tank', count: 2 + chapter, spacing: 0.72 });
  }
  return groups;
}

export function createSpawnQueue(level, waveNumber = 1, totalWaves = 10) {
  const groups = makeWaveGroups(level, waveNumber, totalWaves);
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
