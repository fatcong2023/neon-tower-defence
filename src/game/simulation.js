import { updateEnemies } from './enemies.js';
import { updateWaveState } from './waves.js';
import { firePlayerShot, updatePlayer } from './player.js';
import { updateProjectiles, updateTowerCombat } from './combat.js';

export function updateSimulation(state, delta, input = {}) {
  if (state.mode === 'defeat' || state.mode === 'victory' || state.mode === 'paused' || state.mode === 'title') return;
  if (state.base.health <= 0) {
    state.base.health = 0;
    state.mode = 'defeat';
    state.notice = 'CORE BREACHED';
    state.noticeTimer = 4;
    return;
  }

  state.time += delta;
  updatePlayer(state, input, delta);
  if (input.fire) firePlayerShot(state, input.aimX, input.aimY);
  updateWaveState(state, delta);
  if (state.mode === 'playing') {
    updateEnemies(state, delta);
    updateTowerCombat(state, delta);
    updateProjectiles(state, delta);
  }
  if (state.base.health <= 0) {
    state.base.health = 0;
    state.mode = 'defeat';
    state.notice = 'CORE BREACHED';
    state.noticeTimer = 4;
  }

  state.noticeTimer = Math.max(0, state.noticeTimer - delta);
  state.cameraShake = Math.max(0, state.cameraShake - delta * 24);
  state.effects.forEach((effect) => { effect.ttl -= delta; });
  state.effects = state.effects.filter((effect) => effect.ttl > 0);
}
