import { spawnEnemy } from './enemies.js';

function makeLevelGroups(level) {
  const groups = [{ type: 'grunt', count: 5 + Math.ceil(level * 0.85), spacing: Math.max(0.28, 0.82 - level * 0.006) }];
  if (level >= 2) groups.push({ type: 'runner', count: 2 + Math.ceil(level * 0.28), spacing: 0.55 });
  if (level >= 3) groups.push({ type: 'swarm', count: 4 + Math.ceil(level * 0.4), spacing: 0.24 });
  if (level >= 4) groups.push({ type: 'tank', count: Math.ceil(level * 0.14), spacing: 1.05 });
  if (level >= 5) groups.push({ type: 'shield', count: Math.ceil(level * 0.16), spacing: 0.75 });
  if (level % 10 === 0) groups.unshift({ type: 'boss', count: 1, spacing: 0 });
  return groups;
}

export const WAVE_DEFINITIONS = Object.freeze(Array.from({ length: 50 }, (_, index) => makeLevelGroups(index + 1)));

export function createSpawnQueue(waveNumber) {
  const groups = WAVE_DEFINITIONS[waveNumber - 1] ?? [];
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
  if (waveNumber < 1 || waveNumber > WAVE_DEFINITIONS.length) return false;
  state.mode = 'playing';
  state.wave.index = waveNumber;
  state.wave.active = true;
  state.wave.completed = false;
  state.wave.spawnQueue = createSpawnQueue(waveNumber);
  state.wave.spawnTimer = state.wave.spawnQueue[0]?.delay ?? 0;
  state.notice = waveNumber % 10 === 0 ? 'BOSS WAVE' : `LEVEL ${waveNumber}`;
  state.noticeTimer = 1.8;
  return true;
}

export function launchNextWaveEarly(state) {
  if (state.mode !== 'countdown') return false;
  const bonus = Math.max(0, Math.ceil(state.wave.countdown * 4));
  state.energy += bonus;
  return beginWave(state, state.wave.index + 1);
}

export function updateWaveState(state, delta) {
  if (state.mode === 'countdown') {
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
    state.mode = 'level-clear';
    state.notice = 'LEVEL CLEARED';
    state.noticeTimer = 2;
  }
}
