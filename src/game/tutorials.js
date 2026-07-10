import { ARMOR_FAMILIES } from './armor.js';

export function triggerTutorialForEnemy(state, enemy) {
  if (!enemy.armorFamily || !state.campaign) return false;
  const id = `armor-${enemy.armorFamily}`;
  if (state.campaign.tutorialsSeen.includes(id) || state.tutorial?.id === id) return false;
  state.tutorial = {
    id,
    enemyId: enemy.id,
    armorFamily: enemy.armorFamily,
    counter: ARMOR_FAMILIES[enemy.armorFamily].counter,
    previousMode: state.mode,
  };
  state.mode = 'tutorial';
  return true;
}

export function acknowledgeTutorial(state) {
  if (!state.tutorial) return false;
  if (!state.campaign.tutorialsSeen.includes(state.tutorial.id)) state.campaign.tutorialsSeen.push(state.tutorial.id);
  state.mode = state.tutorial.previousMode === 'tutorial' ? 'playing' : state.tutorial.previousMode;
  state.tutorial = null;
  return true;
}
