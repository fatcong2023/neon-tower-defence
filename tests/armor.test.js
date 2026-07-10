import { describe, expect, it } from 'vitest';
import { createInitialState, startRun } from '../src/game/state.js';
import { ARMOR_FAMILIES } from '../src/game/armor.js';
import { damageEnemy, spawnEnemy } from '../src/game/enemies.js';

const pairs = [
  ['juggernaut', 'heavy', 'prism'],
  ['aegis', 'flux', 'arc'],
  ['crystal', 'crystal', 'nova'],
  ['mystic', 'mystic', 'frost'],
];

describe('special armor counters', () => {
  it('defines a dedicated tower counter for every armor family', () => {
    expect(ARMOR_FAMILIES).toMatchObject({
      heavy: { counter: 'prism' }, flux: { counter: 'arc' }, crystal: { counter: 'nova' }, mystic: { counter: 'frost' },
    });
  });

  it.each(pairs)('%s armor resists ordinary damage and breaks to %s counter', (enemyType, family, counter) => {
    const state = startRun(createInitialState());
    state.mode = 'playing';
    const enemy = spawnEnemy(state, enemyType, { skipTutorial: true });
    const initialArmor = enemy.armor;
    const initialHealth = enemy.health;

    damageEnemy(state, enemy, 50, { attackTag: 'pulse' });
    expect(enemy.armor).toBe(initialArmor);
    expect(enemy.health).toBe(initialHealth - 5);

    damageEnemy(state, enemy, initialArmor * 2, { attackTag: counter });
    expect(enemy.armorFamily).toBe(family);
    expect(enemy.armor).toBe(0);
    expect(enemy.stunnedTimer).toBeGreaterThan(0);
    expect(enemy.vulnerableTimer).toBeGreaterThan(0);
  });
});
