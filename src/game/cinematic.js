export const BOSS_VARIANTS = Object.freeze([
  { level: 4, type: 'boss-overdrive', name: 'Overdrive', mechanic: 'rush' },
  { level: 8, type: 'boss-twin', name: 'Twin Warden', mechanic: 'dual-route' },
  { level: 12, type: 'boss-hydra', name: 'Crystal Hydra', mechanic: 'regeneration' },
  { level: 16, type: 'boss-tyrant', name: 'Veil Tyrant', mechanic: 'disruption' },
  { level: 20, type: 'boss-null', name: 'Null Architect', mechanic: 'armor-cycle' },
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

export const CHAPTER_CINEMATIC_PHASES = Object.freeze([
  { id: 'boss-break', duration: 1.1 },
  { id: 'core-flight', duration: 1.2 },
  { id: 'tower-reveal', duration: 1.5 },
  { id: 'chapter-preview', duration: 1.2 },
  { id: 'complete', duration: 0 },
]);

const CHAPTER_UNLOCKS = Object.freeze({
  4: ['gravity', 'solar'],
  8: ['drone', 'corrosion'],
  12: ['relay', 'rift'],
  16: ['quantum', 'singularity'],
});

function createCinematic(state, snapshot) {
  return {
    kind: 'final',
    phaseIndex: 0,
    phase: CINEMATIC_PHASES[0].id,
    phaseTime: 0,
    totalTime: 0,
    towerSnapshot: snapshot ?? state.towers.map((tower) => ({ ...tower })),
    skippable: true,
  };
}

export function startChapterCinematic(state, clearedLevel) {
  state.cinematic = {
    kind: 'chapter',
    phaseIndex: 0,
    phase: CHAPTER_CINEMATIC_PHASES[0].id,
    phaseTime: 0,
    totalTime: 0,
    clearedLevel,
    nextChapter: clearedLevel / 4 + 1,
    quantumCore: clearedLevel / 4,
    unlocks: [...(CHAPTER_UNLOCKS[clearedLevel] ?? [])],
    towerSnapshot: state.towers.map((tower) => ({ ...tower })),
    skippable: true,
  };
  state.mode = 'cinematic';
  state.projectiles = [];
  state.notice = '';
  state.noticeTimer = 0;
  return state.cinematic;
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

function finishFinalCinematic(state) {
  state.mode = 'victory';
  state.campaign.completed = true;
  state.campaign.challengeUnlocked = true;
  if (state.cinematic) state.cinematic.phase = 'complete';
}

function finishChapterCinematic(state) {
  state.mode = 'chapter-complete';
  if (state.cinematic) state.cinematic.phase = 'complete';
}

export function updateCinematic(state, delta) {
  if (state.mode !== 'cinematic' || !state.cinematic) return false;
  state.cinematic.phaseTime += delta;
  state.cinematic.totalTime += delta;
  const phases = state.cinematic.kind === 'chapter' ? CHAPTER_CINEMATIC_PHASES : CINEMATIC_PHASES;
  while (state.mode === 'cinematic') {
    const current = phases[state.cinematic.phaseIndex];
    if (!current || current.id === 'complete') {
      if (state.cinematic.kind === 'chapter') finishChapterCinematic(state); else finishFinalCinematic(state);
      break;
    }
    if (state.cinematic.phaseTime < current.duration) break;
    state.cinematic.phaseTime -= current.duration;
    state.cinematic.phaseIndex += 1;
    const next = phases[state.cinematic.phaseIndex];
    state.cinematic.phase = next?.id ?? 'complete';
    if (!next || next.id === 'complete') {
      if (state.cinematic.kind === 'chapter') finishChapterCinematic(state); else finishFinalCinematic(state);
    }
  }
  return true;
}

export function skipCinematic(state) {
  if (state.mode !== 'cinematic') return false;
  if (state.cinematic?.kind === 'chapter') finishChapterCinematic(state); else finishFinalCinematic(state);
  return true;
}

export function replayCinematic(state) {
  if (state.mode !== 'victory' && state.mode !== 'cinematic') return false;
  startFinalCinematic(state);
  return true;
}
