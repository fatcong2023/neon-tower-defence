import { describe, expect, it } from 'vitest';
import {
  CHAPTER_TOWER_UNLOCKS,
  CHAPTER_WAVE_COUNTS,
  LEVEL_COUNT,
  LEVELS_PER_CHAPTER,
  getStageDefinition,
} from '../src/game/stages.js';

describe('twenty-level stage catalog', () => {
  it('defines five chapters of four levels', () => {
    expect(LEVEL_COUNT).toBe(20);
    expect(LEVELS_PER_CHAPTER).toBe(4);
    expect(CHAPTER_WAVE_COUNTS).toEqual([10, 15, 20, 25, 30]);
    expect(getStageDefinition(1)).toMatchObject({ level: 1, chapter: 1, waveCount: 10, boss: false });
    expect(getStageDefinition(4)).toMatchObject({ level: 4, chapter: 1, waveCount: 10, boss: true });
    expect(getStageDefinition(8)).toMatchObject({ level: 8, chapter: 2, waveCount: 15, boss: true });
    expect(getStageDefinition(20)).toMatchObject({ level: 20, chapter: 5, waveCount: 30, boss: true });
  });

  it('defines two tower unlocks after the first four chapter bosses', () => {
    expect(CHAPTER_TOWER_UNLOCKS[4]).toEqual(['gravity', 'solar']);
    expect(CHAPTER_TOWER_UNLOCKS[8]).toEqual(['drone', 'corrosion']);
    expect(CHAPTER_TOWER_UNLOCKS[12]).toEqual(['relay', 'rift']);
    expect(CHAPTER_TOWER_UNLOCKS[16]).toEqual(['quantum', 'singularity']);
  });
});
