import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import { spawnEnemy } from '../src/game/enemies.js';
import { acknowledgeTutorial } from '../src/game/tutorials.js';

describe('first-appearance tutorials', () => {
  it('pauses on a new armor mechanic and highlights its counter', () => {
    const state = startRun(createInitialState());
    state.mode = 'playing';
    const enemy = spawnEnemy(state, 'juggernaut');

    expect(state.mode).toBe('tutorial');
    expect(state.tutorial).toMatchObject({ id: 'armor-heavy', counter: 'prism', enemyId: enemy.id });
    acknowledgeTutorial(state);
    expect(state.mode).toBe('playing');
    expect(state.campaign.tutorialsSeen).toContain('armor-heavy');
  });

  it('does not repeat an acknowledged tutorial', () => {
    const state = startRun(createInitialState());
    state.mode = 'playing';
    spawnEnemy(state, 'mystic');
    acknowledgeTutorial(state);
    spawnEnemy(state, 'mystic');
    expect(state.mode).toBe('playing');
  });
});
