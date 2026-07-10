export const ARMOR_FAMILIES = Object.freeze({
  heavy: { counter: 'prism', color: '#d8c8ff', breakStun: 0.9, vulnerability: 2.6 },
  flux: { counter: 'arc', color: '#a9ff68', breakStun: 0.7, vulnerability: 2.2 },
  crystal: { counter: 'nova', color: '#ffae57', breakStun: 1.05, vulnerability: 2.8 },
  mystic: { counter: 'frost', color: '#9b7bff', breakStun: 1.2, vulnerability: 3 },
});

export function resolveArmoredDamage(enemy, amount, attackTag) {
  if (!enemy.armorFamily || enemy.armor <= 0) {
    return { healthDamage: amount * (enemy.vulnerableTimer > 0 ? 1.25 : 1), armorDamage: 0, broke: false };
  }
  const family = ARMOR_FAMILIES[enemy.armorFamily];
  if (attackTag === 'corrosion') {
    const armorDamage = Math.min(enemy.armor, amount * 0.6);
    enemy.armor = Math.max(0, enemy.armor - armorDamage);
    const broke = enemy.armor === 0;
    if (broke) {
      enemy.stunnedTimer = Math.max(enemy.stunnedTimer ?? 0, family.breakStun * 0.6);
      enemy.vulnerableTimer = Math.max(enemy.vulnerableTimer ?? 0, family.vulnerability);
    }
    return { healthDamage: amount * 0.1, armorDamage, broke };
  }
  if (attackTag !== family.counter) return { healthDamage: amount * 0.1, armorDamage: 0, broke: false };

  const armorDamage = Math.min(enemy.armor, amount * 1.5);
  enemy.armor = Math.max(0, enemy.armor - armorDamage);
  const broke = enemy.armor === 0;
  if (broke) {
    enemy.stunnedTimer = Math.max(enemy.stunnedTimer ?? 0, family.breakStun);
    enemy.vulnerableTimer = Math.max(enemy.vulnerableTimer ?? 0, family.vulnerability);
  }
  return { healthDamage: 0, armorDamage, broke };
}
