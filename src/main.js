import './style.css';
import { createInitialState, startRun } from './game/state.js';
import { updateSimulation } from './game/simulation.js';
import { TOWER_TYPES, buildTower, sellTower, upgradeTower, validatePlacement } from './game/towers.js';
import { launchNextWaveEarly } from './game/waves.js';
import { distance } from './game/geometry.js';
import { createInput } from './input.js';
import { createRenderer } from './render/renderer.js';
import { addBurst, addEffect } from './render/effects.js';
import { createInterface } from './ui/interface.js';
import { createAudioEngine } from './audio.js';
import { toggleMutePreference } from './game/preferences.js';

const FIXED_STEP = 1 / 60;
const canvas = document.querySelector('#game-canvas');
const shell = document.querySelector('#game-shell');
const uiRoot = document.querySelector('#ui-layer');
const render = createRenderer(canvas);
let state = createInitialState();
let pausedFromMode = 'playing';
let accumulator = 0;
let lastTime = performance.now();
const audio = createAudioEngine();

const towerHotkeys = {
  Digit1: 'pulse',
  Digit2: 'prism',
  Digit3: 'arc',
  Digit4: 'nova',
  Digit5: 'frost',
};

function setNotice(message, duration = 1.4) {
  state.notice = message;
  state.noticeTimer = duration;
}

function selectTower(type) {
  if (!TOWER_TYPES[type] || ['title', 'paused', 'victory', 'defeat'].includes(state.mode)) return;
  state.selectedTowerType = state.selectedTowerType === type ? null : type;
  state.selectedTowerId = null;
  if (state.selectedTowerType) setNotice(`${TOWER_TYPES[type].name.toUpperCase()} READY`, 0.9);
  audio.cue('ui', state.muted);
}

function cancelBuild() {
  state.selectedTowerType = null;
  state.placement = null;
}

function startGame() {
  audio.unlock();
  state = startRun(state);
  setNotice('INITIALIZING DEFENCE GRID', 1.8);
  audio.cue('start', state.muted);
}

function restartGame() {
  state = startRun(state);
  pausedFromMode = 'playing';
  setNotice('RUN RESET', 1.2);
  audio.cue('start', state.muted);
}

function togglePause() {
  if (state.mode === 'paused') {
    state.mode = pausedFromMode;
  } else if (state.mode === 'playing' || state.mode === 'countdown') {
    pausedFromMode = state.mode;
    state.mode = 'paused';
    cancelBuild();
  }
  audio.cue('ui', state.muted);
}

function upgradeSelected() {
  if (!state.selectedTowerId) return;
  const tower = state.towers.find((candidate) => candidate.id === state.selectedTowerId);
  const result = upgradeTower(state, state.selectedTowerId);
  if (result.ok) {
    addEffect(state, 'upgrade', { x: tower.x, y: tower.y, radius: 48, color: TOWER_TYPES[tower.type].color, ttl: 0.65 });
    addBurst(state, tower.x, tower.y, TOWER_TYPES[tower.type].color, 18, 120);
    setNotice(`${TOWER_TYPES[tower.type].name.toUpperCase()} // LEVEL ${tower.level + 1}`);
  } else setNotice(result.reason === 'insufficient-energy' ? 'NOT ENOUGH ENERGY' : 'MAXIMUM LEVEL', 0.9);
}

function sellSelected() {
  const tower = state.towers.find((candidate) => candidate.id === state.selectedTowerId);
  if (!tower) return;
  const result = sellTower(state, tower.id);
  if (result.ok) {
    addEffect(state, 'enemy-destroyed', { x: tower.x, y: tower.y, radius: 35, color: TOWER_TYPES[tower.type].color, ttl: 0.45 });
    setNotice(`RECYCLED // +${result.refund} ENERGY`);
    audio.cue('sell', state.muted);
  }
}

function toggleMute() {
  toggleMutePreference(state);
  if (!state.muted) audio.unlock();
  setNotice(state.muted ? 'AUDIO MUTED' : 'AUDIO ONLINE', 0.8);
  audio.cue('ui', state.muted);
}

async function toggleFullscreen() {
  try {
    if (document.fullscreenElement) await document.exitFullscreen();
    else await shell.requestFullscreen();
  } catch {
    setNotice('FULLSCREEN UNAVAILABLE', 1);
  }
}

function handleCommand(code) {
  if (towerHotkeys[code]) selectTower(towerHotkeys[code]);
  else if (code === 'Escape') {
    if (state.selectedTowerType) cancelBuild(); else togglePause();
  } else if (code === 'KeyF') toggleFullscreen();
  else if (code === 'KeyM') toggleMute();
  else if (code === 'KeyR' && (state.mode === 'victory' || state.mode === 'defeat')) restartGame();
  else if (code === 'Enter' && state.mode === 'title') startGame();
}

const input = createInput(canvas, handleCommand);
const ui = createInterface(uiRoot, {
  start: startGame,
  restart: restartGame,
  resume: togglePause,
  selectTower,
  cancelBuild,
  upgrade: upgradeSelected,
  sell: sellSelected,
  launchWave: () => {
    if (launchNextWaveEarly(state)) {
      setNotice(`WAVE ${state.wave.index} // EARLY LAUNCH`, 1.2);
      audio.cue('wave', state.muted);
    }
  },
  toggleMute,
});

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || !['playing', 'countdown'].includes(state.mode)) return;
  const point = input.pointer;
  if (state.selectedTowerType) {
    const result = buildTower(state, point.x, point.y, state.selectedTowerType);
    if (result.ok) {
      const definition = TOWER_TYPES[result.tower.type];
      addEffect(state, 'build', { x: result.tower.x, y: result.tower.y, radius: 44, color: definition.color, ttl: 0.55 });
      addBurst(state, result.tower.x, result.tower.y, definition.color, 14, 95);
      setNotice(`${definition.name.toUpperCase()} DEPLOYED`, 0.9);
      if (state.energy < definition.levels[0].cost) cancelBuild();
    } else {
      const labels = {
        'on-path': 'PATHWAY BLOCKED', 'too-close': 'TOWERS TOO CLOSE', 'out-of-range': 'MOVE CLOSER TO BUILD',
        'out-of-bounds': 'OUTSIDE BUILD ZONE', 'insufficient-energy': 'NOT ENOUGH ENERGY',
      };
      setNotice(labels[result.reason] ?? 'INVALID PLACEMENT', 0.8);
    }
    return;
  }

  const clickedTower = state.towers
    .filter((tower) => distance(point, tower) <= tower.radius + 8)
    .sort((a, b) => distance(point, a) - distance(point, b))[0];
  state.selectedTowerId = clickedTower?.id ?? null;
});

function step(delta = FIXED_STEP) {
  const previousMode = state.mode;
  const previousWave = state.wave.index;
  const frameInput = input.snapshot();
  const hoveringTower = state.towers.some((tower) => distance(input.pointer, tower) <= tower.radius + 8);
  frameInput.fire = frameInput.fire && !state.selectedTowerType && !hoveringTower;
  updateSimulation(state, delta, frameInput);
  if (state.wave.index > previousWave) audio.cue(state.wave.index === 10 ? 'baseHit' : 'wave', state.muted);
  if (state.mode !== previousMode) {
    if (state.mode === 'victory') audio.cue('victory', state.muted);
    else if (state.mode === 'defeat') audio.cue('defeat', state.muted);
  }
  audio.update(state);
}

function renderFrame() {
  state.placement = state.selectedTowerType
    ? { x: input.pointer.x, y: input.pointer.y, ...validatePlacement(state, input.pointer.x, input.pointer.y, state.selectedTowerType) }
    : null;
  render(state, input.pointer);
  ui.update(state, input.pointer);
}

function frame(now) {
  const elapsed = Math.min(0.1, (now - lastTime) / 1000);
  lastTime = now;
  accumulator += elapsed;
  while (accumulator >= FIXED_STEP) {
    step();
    accumulator -= FIXED_STEP;
  }
  renderFrame();
  requestAnimationFrame(frame);
}

window.render_game_to_text = () => JSON.stringify({
  coordinateSystem: 'origin top-left; x increases right; y increases down; logical canvas 1280x720',
  mode: state.mode,
  player: {
    x: Math.round(state.player.x), y: Math.round(state.player.y), angle: Number(state.player.angle.toFixed(2)),
    buildRadius: state.player.buildRadius, dashCooldown: Number(state.player.dashCooldown.toFixed(2)),
  },
  base: { health: state.base.health, maxHealth: state.base.maxHealth, x: 1140, y: 545 },
  wave: {
    current: state.wave.index, total: 10, active: state.wave.active,
    countdown: Number(Math.max(0, state.wave.countdown).toFixed(2)), queued: state.wave.spawnQueue.length,
  },
  energy: state.energy,
  score: state.score,
  selectedBuild: state.selectedTowerType,
  selectedTowerId: state.selectedTowerId,
  placement: state.placement,
  towers: state.towers.map((tower) => ({ id: tower.id, type: tower.type, level: tower.level + 1, x: Math.round(tower.x), y: Math.round(tower.y) })),
  enemies: state.enemies.map((enemy) => ({ id: enemy.id, type: enemy.type, x: Math.round(enemy.x), y: Math.round(enemy.y), health: Math.ceil(enemy.health), shield: Math.ceil(enemy.shield), progress: Number(enemy.progress.toFixed(3)) })),
  projectiles: state.projectiles.length,
  notice: state.noticeTimer > 0 ? state.notice : '',
  muted: state.muted,
});

window.advanceTime = (milliseconds) => {
  const steps = Math.max(1, Math.round(milliseconds / (1000 / 60)));
  for (let index = 0; index < steps; index += 1) step();
  renderFrame();
};

window.__NEON_GAME__ = {
  getState: () => state,
  start: startGame,
  restart: restartGame,
  selectTower,
  upgradeSelected,
  sellSelected,
  launchWave: () => launchNextWaveEarly(state),
};

renderFrame();
requestAnimationFrame(frame);
