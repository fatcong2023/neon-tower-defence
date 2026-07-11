export const LEVEL_COUNT = 20;
export const LEVELS_PER_CHAPTER = 4;
export const CHAPTER_WAVE_COUNTS = Object.freeze([10, 15, 20, 25, 30]);

export const CHAPTER_TOWER_UNLOCKS = Object.freeze({
  4: Object.freeze(['gravity', 'solar']),
  8: Object.freeze(['drone', 'corrosion']),
  12: Object.freeze(['relay', 'rift']),
  16: Object.freeze(['quantum', 'singularity']),
});

export function getStageDefinition(level) {
  const number = Math.max(1, Math.min(LEVEL_COUNT, Math.floor(level)));
  const chapter = Math.ceil(number / LEVELS_PER_CHAPTER);
  return {
    level: number,
    chapter,
    waveCount: CHAPTER_WAVE_COUNTS[chapter - 1],
    elite: number % LEVELS_PER_CHAPTER === LEVELS_PER_CHAPTER - 1,
    boss: number % LEVELS_PER_CHAPTER === 0,
    baseReward: 95 + number * 16,
    chipReward: 3 + Math.ceil(number / 2),
    difficulty: Number((1 + (number - 1) * 0.18).toFixed(3)),
  };
}

export const STAGE_DEFINITIONS = Object.freeze(
  Array.from({ length: LEVEL_COUNT }, (_, index) => Object.freeze(getStageDefinition(index + 1))),
);
