import { updateEnemies } from './enemies.js';
import { updateWaveState } from './waves.js';
import { firePlayerShot, updatePlayer } from './player.js';
import { updateProjectiles, updateTowerCombat } from './combat.js';
import { updateCinematic } from './cinematic.js';
import { prepareLevel, settleLevel } from './campaign.js';

export function updateSimulation(state, delta, input = {}) {
  if (state.mode === 'chapter-complete') { prepareLevel(state, state.campaign); return; }
  if (state.mode === 'cinematic') {
    updateCinematic(state, delta);
    if (state.mode === 'chapter-complete') prepareLevel(state, state.campaign);
    return;
  }
  if (['defeat', 'victory', 'paused', 'title', 'tutorial', 'research', 'level-clear'].includes(state.mode)) return;
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
  const modeBeforeWave = state.mode;
  updateWaveState(state, delta);
  if (modeBeforeWave === 'playing' && ['level-clear', 'cinematic'].includes(state.mode) && !state.levelResult) {
    settleLevel(state, state.campaign);
  }
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
