import { spawnEnemy } from './enemies.js';

export const WAVE_DEFINITIONS = Object.freeze([
  [{ type: 'grunt', count: 7, spacing: 0.85 }],
  [{ type: 'grunt', count: 8, spacing: 0.72 }, { type: 'runner', count: 4, spacing: 0.9 }],
  [{ type: 'swarm', count: 15, spacing: 0.32 }, { type: 'grunt', count: 6, spacing: 0.65 }],
  [{ type: 'tank', count: 3, spacing: 1.35 }, { type: 'runner', count: 9, spacing: 0.55 }],
  [{ type: 'shield', count: 5, spacing: 1.1 }, { type: 'grunt', count: 10, spacing: 0.5 }],
  [{ type: 'swarm', count: 24, spacing: 0.23 }, { type: 'tank', count: 4, spacing: 1.1 }],
  [{ type: 'shield', count: 7, spacing: 0.82 }, { type: 'runner', count: 14, spacing: 0.4 }],
  [{ type: 'tank', count: 8, spacing: 0.95 }, { type: 'swarm', count: 25, spacing: 0.2 }],
  [{ type: 'shield', count: 10, spacing: 0.7 }, { type: 'tank', count: 8, spacing: 0.8 }, { type: 'runner', count: 16, spacing: 0.3 }],
  [{ type: 'boss', count: 1, spacing: 0 }, { type: 'shield', count: 8, spacing: 0.65 }, { type: 'swarm', count: 20, spacing: 0.2 }],
]);

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
  state.notice = waveNumber === 10 ? 'BOSS WAVE' : `WAVE ${waveNumber}`;
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
    if (state.wave.index >= WAVE_DEFINITIONS.length) {
      state.mode = 'victory';
      state.notice = 'CORE SECURED';
      state.noticeTimer = 4;
    } else {
      state.mode = 'countdown';
      state.wave.countdown = 4.5;
      state.energy += 35 + state.wave.index * 4;
      state.notice = 'WAVE CLEARED';
      state.noticeTimer = 1.6;
    }
  }
}
