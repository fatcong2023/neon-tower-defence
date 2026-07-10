import './style.css';
import { createInitialState, startRun } from './game/state.js';
import { updateSimulation } from './game/simulation.js';
import { TOWER_TYPES, buildTower, sellTower, upgradeTower, validatePlacement } from './game/towers.js';
import { beginChallengeCampaign, createCampaign, prepareLevel, retryLevel, selectCampaignLevel, settleLevel, startAssault } from './game/campaign.js';
import { loadCampaign, saveCampaign } from './game/save.js';
import { purchaseResearch } from './game/research.js';
import { acknowledgeTutorial } from './game/tutorials.js';
import { distance } from './game/geometry.js';
import { createInput } from './input.js';
import { createRenderer } from './render/renderer.js';
import { addBurst, addEffect } from './render/effects.js';
import { createInterface } from './ui/interface.js';
import { createAudioEngine } from './audio.js';
import { toggleMutePreference } from './game/preferences.js';
import { createI18n } from './i18n.js';
import { replayCinematic, skipCinematic } from './game/cinematic.js';

const FIXED_STEP = 1 / 60;
const canvas = document.querySelector('#game-canvas');
const shell = document.querySelector('#game-shell');
const uiRoot = document.querySelector('#ui-layer');
const storage = window.localStorage;
const campaign = loadCampaign(storage);
const i18n = createI18n(campaign.language, storage);
const render = createRenderer(canvas);
const audio = createAudioEngine();
let state = createInitialState({ campaign });
let pausedFromMode = 'playing';
let overlayReturnMode = 'title';
let accumulator = 0;
let lastTime = performance.now();

const towerHotkeys = { Digit1: 'pulse', Digit2: 'prism', Digit3: 'arc', Digit4: 'nova', Digit5: 'frost' };

function setNotice(message, duration = 1.4) { state.notice = message; state.noticeTimer = duration; }
function saveProgress() { state.campaign.language = i18n.language; saveCampaign(state.campaign, storage); }

function selectTower(type) {
  if (!TOWER_TYPES[type] || !['deployment', 'playing'].includes(state.mode)) return;
  if (!state.campaign.unlockedTowers.includes(type)) { setNotice(i18n.t('notice.locked')); return; }
  state.selectedTowerType = state.selectedTowerType === type ? null : type;
  state.selectedTowerId = null;
  audio.cue('ui', state.muted);
}

function cancelBuild() { state.selectedTowerType = null; state.placement = null; }

function continueCampaign() {
  audio.unlock();
  if (state.campaign.completed) {
    state.mode = 'victory';
    audio.cue('victory', state.muted);
    return;
  }
  state = startRun(state);
  setNotice(i18n.t('hud.deployment'), 1.2);
  audio.cue('start', state.muted);
}

function newCampaign() {
  if (state.campaign.highestCleared > 0 && !window.confirm(i18n.t('menu.newConfirm'))) return;
  const freshCampaign = createCampaign({ language: i18n.language, seed: Date.now() % 2147483647 });
  state = createInitialState({ campaign: freshCampaign });
  state = startRun(state);
  saveProgress();
  audio.cue('start', state.muted);
}

function startLevel() {
  if (startAssault(state)) {
    setNotice(i18n.t('hud.assault'), 1.2);
    audio.cue(state.campaign.currentLevel % 10 === 0 ? 'baseHit' : 'wave', state.muted);
  }
}

function nextLevel() {
  state.levelResult = null;
  prepareLevel(state, state.campaign);
  saveProgress();
  setNotice(i18n.t('hud.deployment'), 1.1);
}

function retryGame() {
  retryLevel(state.campaign);
  state = startRun(state);
  saveProgress();
  setNotice(i18n.t('hud.deployment'), 1.1);
}

function resultPrimary() { if (state.mode === 'defeat') retryGame(); else replayCinematic(state); }

function mainMenu() { cancelBuild(); state.mode = 'title'; saveProgress(); }

function togglePause() {
  if (state.mode === 'paused') state.mode = pausedFromMode;
  else if (state.mode === 'playing' || state.mode === 'deployment') { pausedFromMode = state.mode; state.mode = 'paused'; cancelBuild(); }
  audio.cue('ui', state.muted);
}

function openResearch() { overlayReturnMode = state.mode; state.mode = 'research'; cancelBuild(); }
function closeResearch() { state.mode = overlayReturnMode; }
function openLevelSelect() { overlayReturnMode = state.mode; state.mode = 'level-select'; cancelBuild(); }
function closeLevelSelect() { state.mode = overlayReturnMode; }
function selectLevel(level) {
  const result = selectCampaignLevel(state.campaign, level);
  if (!result.ok) return;
  state = startRun(state);
  saveProgress();
  audio.cue('start', state.muted);
}
function startChallenge() {
  const result = beginChallengeCampaign(state.campaign);
  if (!result.ok) return;
  state = startRun(state);
  saveProgress();
  setNotice(i18n.t('hud.challenge', { cycle: result.cycle }), 1.6);
  audio.cue('start', state.muted);
}
function buyResearch(nodeId) { const result = purchaseResearch(state.campaign, nodeId); if (result.ok) { saveProgress(); audio.cue('upgrade', state.muted); } else setNotice(result.reason); }

function setLanguage(language) {
  i18n.setLanguage(language);
  state.campaign.language = i18n.language;
  saveProgress();
  setNotice(i18n.t('notice.language'), 0.8);
}

function upgradeSelected() {
  const tower = state.towers.find((candidate) => candidate.id === state.selectedTowerId); if (!tower) return;
  const result = upgradeTower(state, tower.id);
  if (result.ok) { addEffect(state, 'upgrade', { x: tower.x, y: tower.y, radius: 48, color: TOWER_TYPES[tower.type].color, ttl: 0.65 }); addBurst(state, tower.x, tower.y, TOWER_TYPES[tower.type].color, 18, 120); audio.cue('upgrade', state.muted); }
}

function sellSelected() { const tower = state.towers.find((candidate) => candidate.id === state.selectedTowerId); if (!tower) return; const result = sellTower(state, tower.id); if (result.ok) audio.cue('sell', state.muted); }
function toggleMute() { toggleMutePreference(state); if (!state.muted) audio.unlock(); audio.cue('ui', state.muted); }

async function toggleFullscreen() { try { if (document.fullscreenElement) await document.exitFullscreen(); else await shell.requestFullscreen(); } catch { setNotice('FULLSCREEN'); } }

function handleCommand(code) {
  if (towerHotkeys[code]) selectTower(towerHotkeys[code]);
  else if (code === 'Escape') { if (state.selectedTowerType) cancelBuild(); else if (state.mode === 'research') closeResearch(); else if (state.mode === 'level-select') closeLevelSelect(); else togglePause(); }
  else if (code === 'KeyF') toggleFullscreen(); else if (code === 'KeyM') toggleMute(); else if (code === 'Enter' && state.mode === 'deployment') startLevel();
}

const input = createInput(canvas, handleCommand);
const ui = createInterface(uiRoot, {
  continueCampaign, newCampaign, startLevel, nextLevel, retry: retryGame, resultPrimary, mainMenu, resume: togglePause,
  openResearch, closeResearch, openLevelSelect, closeLevelSelect, selectLevel, startChallenge, purchaseResearch: buyResearch, acknowledgeTutorial: () => acknowledgeTutorial(state), setLanguage,
  selectTower, cancelBuild, upgrade: upgradeSelected, sell: sellSelected, toggleMute, skipCinematic: () => skipCinematic(state),
}, i18n);

canvas.addEventListener('pointerdown', (event) => {
  if (event.button !== 0 || !['playing', 'deployment'].includes(state.mode)) return;
  const point = input.pointer;
  if (state.selectedTowerType) {
    const result = buildTower(state, point.x, point.y, state.selectedTowerType);
    if (result.ok) {
      const definition = TOWER_TYPES[result.tower.type];
      addEffect(state, 'build', { x: result.tower.x, y: result.tower.y, radius: 44, color: definition.color, ttl: 0.55 }); addBurst(state, result.tower.x, result.tower.y, definition.color, 14, 95);
      state.campaign.stats.towerBuilds[result.tower.type] = (state.campaign.stats.towerBuilds[result.tower.type] ?? 0) + 1;
      setNotice(i18n.t('notice.built', { tower: i18n.t(`tower.${result.tower.type}.name`) }), 0.8);
      if (state.energy < definition.levels[0].cost) cancelBuild();
    } else {
      const key = { locked: 'notice.locked', 'on-path': 'notice.path', 'out-of-range': 'notice.range', 'insufficient-energy': 'notice.energy' }[result.reason];
      setNotice(key ? i18n.t(key) : result.reason, 0.8);
    }
    return;
  }
  const clickedTower = state.towers.filter((tower) => distance(point, tower) <= tower.radius + 8).sort((a, b) => distance(point, a) - distance(point, b))[0];
  state.selectedTowerId = clickedTower?.id ?? null;
});

function step(delta = FIXED_STEP) {
  const previousMode = state.mode;
  const previousCinematicPhase = state.cinematic?.phase;
  const frameInput = input.snapshot();
  const hoveringTower = state.towers.some((tower) => distance(input.pointer, tower) <= tower.radius + 8);
  frameInput.fire = frameInput.fire && !state.selectedTowerType && !hoveringTower;
  updateSimulation(state, delta, frameInput);
  if (previousMode === 'playing' && state.mode === 'level-clear' && !state.levelResult) {
    state.levelResult = settleLevel(state, state.campaign);
    saveProgress();
    audio.cue('victory', state.muted);
  }
  if (previousMode === 'playing' && state.mode === 'cinematic' && !state.levelResult) {
    state.levelResult = settleLevel(state, state.campaign);
    saveProgress();
    audio.cue('victory', state.muted);
  }
  if (state.mode === 'cinematic' && previousCinematicPhase && previousCinematicPhase !== state.cinematic.phase) audio.cue(state.cinematic.phase === 'fireworks' ? 'victory' : 'upgrade', state.muted);
  if (previousMode !== 'defeat' && state.mode === 'defeat') audio.cue('defeat', state.muted);
  audio.update(state);
}

function renderFrame() {
  state.placement = state.selectedTowerType ? { x: input.pointer.x, y: input.pointer.y, ...validatePlacement(state, input.pointer.x, input.pointer.y, state.selectedTowerType) } : null;
  render(state, input.pointer); ui.update(state, input.pointer);
}

function frame(now) { const elapsed = Math.min(0.1, (now - lastTime) / 1000); lastTime = now; accumulator += elapsed; while (accumulator >= FIXED_STEP) { step(); accumulator -= FIXED_STEP; } renderFrame(); requestAnimationFrame(frame); }

window.render_game_to_text = () => JSON.stringify({
  coordinateSystem: 'origin top-left; x right; y down; canvas 1280x720', mode: state.mode, language: i18n.language,
  campaign: { level: state.campaign.currentLevel, highestCleared: state.campaign.highestCleared, total: 50, chapter: state.map.chapter, funds: state.campaign.funds, chips: state.campaign.coreChips, cores: state.campaign.quantumCores, unlockedTowers: state.campaign.unlockedTowers, completed: state.campaign.completed, challengeUnlocked: state.campaign.challengeUnlocked, challengeMode: state.campaign.challengeMode, challengeCycle: state.campaign.challengeCycle },
  map: { id: state.map.id, seed: state.map.seed, topology: state.map.topology, routes: state.map.paths.length },
  player: { x: Math.round(state.player.x), y: Math.round(state.player.y), buildRadius: state.player.buildRadius, dashCooldown: Number(state.player.dashCooldown.toFixed(2)) },
  base: state.base, energy: state.energy, score: state.score, selectedBuild: state.selectedTowerType, tutorial: state.tutorial,
  towers: state.towers.map((tower) => ({ id: tower.id, type: tower.type, level: tower.level + 1, x: Math.round(tower.x), y: Math.round(tower.y) })),
  enemies: state.enemies.map((enemy) => ({ id: enemy.id, type: enemy.type, route: enemy.routeIndex, x: Math.round(enemy.x), y: Math.round(enemy.y), health: Math.ceil(enemy.health), armorFamily: enemy.armorFamily, armor: Math.ceil(enemy.armor), progress: Number(enemy.progress.toFixed(3)) })),
  queued: state.wave.spawnQueue.length, projectiles: state.projectiles.length, muted: state.muted,
});

window.advanceTime = (milliseconds) => { const steps = Math.max(1, Math.round(milliseconds / (1000 / 60))); for (let index = 0; index < steps; index += 1) step(); renderFrame(); };
window.__NEON_GAME__ = { getState: () => state, continueCampaign, newCampaign, startLevel, nextLevel, retry: retryGame, mainMenu, setLanguage, openResearch, closeResearch, openLevelSelect, closeLevelSelect, selectLevel, startChallenge, buyResearch, acknowledgeTutorial: () => acknowledgeTutorial(state), selectTower, upgradeSelected, sellSelected };

renderFrame(); requestAnimationFrame(frame);
