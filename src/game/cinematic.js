export const BOSS_VARIANTS = Object.freeze([
  { level: 10, type: 'boss-overdrive', name: 'Overdrive', mechanic: 'rush' },
  { level: 20, type: 'boss-twin', name: 'Twin Warden', mechanic: 'dual-route' },
  { level: 30, type: 'boss-hydra', name: 'Crystal Hydra', mechanic: 'regeneration' },
  { level: 40, type: 'boss-tyrant', name: 'Veil Tyrant', mechanic: 'disruption' },
  { level: 50, type: 'boss-null', name: 'Null Architect', mechanic: 'armor-cycle' },
]);

export const CINEMATIC_PHASES = Object.freeze([
  { id: 'freeze', duration: 1.7 },
  { id: 'cores', duration: 2.2 },
  { id: 'guardian', duration: 2.25 },
  { id: 'salute', duration: 2.1 },
  { id: 'launch', duration: 2.5 },
  { id: 'fireworks', duration: 3.2 },
  { id: 'complete', duration: 0 },
]);

function createCinematic(state, snapshot) {
  return {
    phaseIndex: 0,
    phase: CINEMATIC_PHASES[0].id,
    phaseTime: 0,
    totalTime: 0,
    towerSnapshot: snapshot ?? state.towers.map((tower) => ({ ...tower })),
    skippable: true,
  };
}

export function startFinalCinematic(state) {
  const previousSnapshot = state.cinematic?.towerSnapshot;
  state.cinematic = createCinematic(state, previousSnapshot);
  state.mode = 'cinematic';
  state.projectiles = state.projectiles.map((projectile) => ({ ...projectile, frozen: true }));
  state.notice = '';
  state.noticeTimer = 0;
  return state.cinematic;
}

function finishCinematic(state) {
  state.mode = 'victory';
  state.campaign.completed = true;
  state.campaign.challengeUnlocked = true;
  if (state.cinematic) state.cinematic.phase = 'complete';
}

export function updateCinematic(state, delta) {
  if (state.mode !== 'cinematic' || !state.cinematic) return false;
  state.cinematic.phaseTime += delta;
  state.cinematic.totalTime += delta;
  while (state.mode === 'cinematic') {
    const current = CINEMATIC_PHASES[state.cinematic.phaseIndex];
    if (!current || current.id === 'complete') { finishCinematic(state); break; }
    if (state.cinematic.phaseTime < current.duration) break;
    state.cinematic.phaseTime -= current.duration;
    state.cinematic.phaseIndex += 1;
    const next = CINEMATIC_PHASES[state.cinematic.phaseIndex];
    state.cinematic.phase = next?.id ?? 'complete';
    if (!next || next.id === 'complete') finishCinematic(state);
  }
  return true;
}

export function skipCinematic(state) {
  if (state.mode !== 'cinematic') return false;
  finishCinematic(state);
  return true;
}

export function replayCinematic(state) {
  if (state.mode !== 'victory' && state.mode !== 'cinematic') return false;
  startFinalCinematic(state);
  return true;
}
