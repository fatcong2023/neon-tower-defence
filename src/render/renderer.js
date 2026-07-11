import { COLORS, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../game/config.js';
import { PATH_WIDTH } from '../game/geometry.js';
import { ENEMY_TYPES, isBossType } from '../game/enemies.js';
import { TOWER_TYPES, getTowerStats, validatePlacement } from '../game/towers.js';

function polygon(context, x, y, radius, sides, rotation = 0) {
  context.beginPath();
  for (let index = 0; index < sides; index += 1) {
    const angle = rotation + (Math.PI * 2 * index) / sides;
    const px = x + Math.cos(angle) * radius;
    const py = y + Math.sin(angle) * radius;
    if (index === 0) context.moveTo(px, py); else context.lineTo(px, py);
  }
  context.closePath();
}

function strokePath(context, route) {
  context.beginPath();
  route.forEach((point, index) => index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y));
}

function drawBackground(context, time, map) {
  const gradient = context.createRadialGradient(700, 320, 40, 640, 360, 720);
  gradient.addColorStop(0, '#11194c');
  gradient.addColorStop(0.48, '#080d2d');
  gradient.addColorStop(1, '#030617');
  context.fillStyle = gradient;
  context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  const themeGlow = context.createLinearGradient(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
  themeGlow.addColorStop(0, `${map?.theme?.primary ?? COLORS.cyan}12`);
  themeGlow.addColorStop(1, `${map?.theme?.secondary ?? COLORS.violet}0d`);
  context.fillStyle = themeGlow;
  context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  context.save();
  context.strokeStyle = 'rgba(77,252,255,.07)';
  context.lineWidth = 1;
  const offset = (time * 14) % 48;
  for (let x = -48 + offset; x < LOGICAL_WIDTH + 48; x += 48) {
    context.beginPath(); context.moveTo(x, 0); context.lineTo(x, LOGICAL_HEIGHT); context.stroke();
  }
  for (let y = -48 + offset; y < LOGICAL_HEIGHT + 48; y += 48) {
    context.beginPath(); context.moveTo(0, y); context.lineTo(LOGICAL_WIDTH, y); context.stroke();
  }
  context.strokeStyle = 'rgba(155,123,255,.04)';
  for (let x = -LOGICAL_HEIGHT; x < LOGICAL_WIDTH; x += 150) {
    context.beginPath(); context.moveTo(x, LOGICAL_HEIGHT); context.lineTo(x + LOGICAL_HEIGHT, 0); context.stroke();
  }
  context.restore();

  for (let index = 0; index < 22; index += 1) {
    const x = (index * 173 + time * (5 + index % 4)) % (LOGICAL_WIDTH + 100) - 50;
    const y = (index * 91) % LOGICAL_HEIGHT;
    const pulse = 0.18 + Math.sin(time * 1.7 + index) * 0.08;
    context.fillStyle = `rgba(155,123,255,${pulse})`;
    polygon(context, x, y, 2 + index % 3, index % 2 ? 3 : 4, time * 0.2);
    context.fill();
  }
}

function drawTrack(context, time, map) {
  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';
  (map?.paths ?? []).forEach((route, routeIndex) => {
    const routeColor = routeIndex % 2 ? (map.theme?.secondary ?? COLORS.violet) : (map.theme?.primary ?? COLORS.cyan);
    context.shadowColor = routeColor; context.shadowBlur = 26; context.strokeStyle = `${routeColor}30`; context.lineWidth = PATH_WIDTH + 16; strokePath(context, route); context.stroke();
    context.shadowBlur = 0; context.strokeStyle = '#111747'; context.lineWidth = PATH_WIDTH; strokePath(context, route); context.stroke();
    context.strokeStyle = `${routeColor}72`; context.lineWidth = 2; strokePath(context, route); context.stroke();
    context.setLineDash([4, 18]); context.lineDashOffset = -time * (45 + routeIndex * 6); context.strokeStyle = `${routeColor}cc`; context.lineWidth = 3; strokePath(context, route); context.stroke(); context.setLineDash([]);
    route.slice(1, -1).forEach((routePoint) => { context.fillStyle = '#111747'; context.strokeStyle = `${routeColor}88`; polygon(context, routePoint.x, routePoint.y, 11, 4, Math.PI / 4); context.fill(); context.stroke(); });
  });
  context.restore();
}

function drawPortalAt(context, time, portal, color, offset = 0) {
  context.save();
  context.translate(portal.x, portal.y);
  for (let index = 0; index < 3; index += 1) {
    context.rotate((time * (index % 2 ? -0.55 : 0.42)) + index);
    context.strokeStyle = color;
    context.globalAlpha = 0.9 - index * 0.24;
    context.lineWidth = 3 - index * 0.5;
    context.shadowColor = color;
    context.shadowBlur = 16;
    polygon(context, 0, 0, 24 + index * 9, 6, 0);
    context.stroke();
  }
  context.restore();
}

function drawPortals(context, time, map) {
  (map.portals ?? map.paths.map((route) => route[0])).forEach((portal, index) => {
    drawPortalAt(context, time + index * 0.6, portal, index % 2 ? map.theme.secondary : COLORS.magenta, index);
  });
}

function drawBase(context, state, time) {
  const base = state.map.core ?? state.map.paths[0].at(-1);
  const healthRatio = state.base.health / state.base.maxHealth;
  context.save();
  context.translate(base.x, base.y);
  context.shadowColor = healthRatio > 0.3 ? COLORS.cyan : '#ff3f72';
  context.shadowBlur = 28 + Math.sin(time * 4) * 6;
  context.fillStyle = healthRatio > 0.3 ? '#b9ffff' : '#ff8baa';
  polygon(context, 0, 0, 27, 4, Math.PI / 4);
  context.fill();
  context.fillStyle = '#23306f';
  polygon(context, 0, 0, 15, 4, Math.PI / 4);
  context.fill();
  context.rotate(-time * 0.65);
  context.strokeStyle = healthRatio > 0.3 ? COLORS.cyan : '#ff3f72';
  context.lineWidth = 3;
  polygon(context, 0, 0, 42, 8, Math.PI / 8);
  context.stroke();
  context.restore();
}

function drawTower(context, tower, selected, time) {
  const definition = TOWER_TYPES[tower.type];
  const stats = getTowerStats(tower);
  context.save();
  context.translate(tower.x, tower.y);
  if (selected) {
    context.strokeStyle = 'rgba(255,255,255,.7)';
    context.setLineDash([5, 6]);
    context.beginPath(); context.arc(0, 0, stats.range, 0, Math.PI * 2); context.stroke();
    context.setLineDash([]);
  }
  context.shadowColor = definition.color;
  context.shadowBlur = selected ? 28 : 15;
  context.fillStyle = '#0b1035';
  context.strokeStyle = definition.color;
  context.lineWidth = 2.5;
  polygon(context, 0, 0, 22 + tower.level * 2, 6, Math.PI / 6);
  context.fill(); context.stroke();
  context.rotate(tower.angle);
  context.fillStyle = definition.color;
  if (tower.type === 'pulse') {
    polygon(context, 8, 0, 13, 3, 0); context.fill();
  } else if (tower.type === 'prism') {
    context.fillRect(-2, -6, 31, 12); polygon(context, 28, 0, 9, 4, Math.PI / 4); context.fill();
  } else if (tower.type === 'arc') {
    context.rotate(time * 1.7); context.strokeStyle = definition.color; polygon(context, 0, 0, 14, 6, 0); context.stroke();
  } else if (tower.type === 'nova') {
    polygon(context, 0, 0, 15, 5, -Math.PI / 2); context.fill(); context.fillRect(0, -5, 24, 10);
  } else if (tower.type === 'frost') {
    context.rotate(time * 0.8); for (let i = 0; i < 4; i += 1) { context.rotate(Math.PI / 2); context.fillRect(3, -2, 17, 4); }
  } else if (definition.attack === 'support') {
    context.fillRect(-3, -18, 6, 30); context.beginPath(); context.arc(0, -16, 8, 0, Math.PI * 2); context.stroke();
  } else if (definition.attack === 'rift' || definition.attack === 'gravity') {
    context.beginPath(); context.arc(0, 0, 14, 0, Math.PI * 2); context.stroke(); context.beginPath(); context.arc(0, 0, 7, 0, Math.PI * 2); context.fill();
  } else if (definition.attack === 'drone') {
    for (let i = 0; i < 3; i += 1) { context.rotate(Math.PI * 2 / 3); context.fillRect(7, -3, 15, 6); }
  } else if (definition.attack === 'line' || definition.attack === 'multi') {
    polygon(context, 7, 0, 14, definition.attack === 'line' ? 3 : 4, 0); context.fill();
  } else {
    polygon(context, 0, 0, 14, 8, time * 0.4); context.fill();
  }
  context.restore();

  context.save();
  context.fillStyle = definition.color;
  for (let index = 0; index <= tower.level; index += 1) {
    const angle = time * (0.9 + index * 0.2) + (Math.PI * 2 * index) / (tower.level + 1);
    context.beginPath(); context.arc(tower.x + Math.cos(angle) * 29, tower.y + Math.sin(angle) * 29, 2.5, 0, Math.PI * 2); context.fill();
  }
  context.restore();
}

function drawEnemy(context, enemy, time) {
  const definition = ENEMY_TYPES[enemy.type];
  const isBoss = isBossType(enemy.type);
  context.save();
  context.translate(enemy.x, enemy.y);
  const angle = time * (enemy.type === 'runner' ? 5 : 1.8) + enemy.progress * 12;
  context.rotate(angle);
  context.shadowColor = definition.color;
  context.shadowBlur = enemy.flash > 0 ? 30 : 13;
  context.fillStyle = enemy.flash > 0 ? '#ffffff' : definition.color;
  const sides = isBoss ? 8 : ({ grunt: 4, runner: 3, swarm: 4, tank: 6, shield: 8 }[enemy.type] ?? 6);
  polygon(context, 0, 0, enemy.radius, sides, enemy.type === 'grunt' ? Math.PI / 4 : 0);
  context.fill();
  context.fillStyle = '#090d28';
  polygon(context, 0, 0, enemy.radius * 0.48, sides, 0);
  context.fill();
  if (isBoss) {
    context.rotate(-angle * 1.8); context.strokeStyle = '#ffffff'; context.lineWidth = 2; polygon(context, 0, 0, enemy.radius + 11, 4, Math.PI / 4); context.stroke();
  }
  if (enemy.shield > 0) {
    context.rotate(-angle);
    context.strokeStyle = COLORS.cyan;
    context.lineWidth = 3;
    context.globalAlpha = 0.45 + Math.sin(time * 6) * 0.15;
    context.beginPath(); context.arc(0, 0, enemy.radius + 7, 0, Math.PI * 2); context.stroke();
  }
  context.restore();

  if (enemy.health < enemy.maxHealth || isBoss) {
    const width = isBoss ? 82 : 34;
    context.fillStyle = 'rgba(1,3,14,.75)'; context.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 13, width, 4);
    context.fillStyle = definition.color; context.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 13, width * Math.max(0, enemy.health / enemy.maxHealth), 4);
  }
  if (enemy.maxArmor > 0 && enemy.armor > 0) {
    const width = isBoss ? 82 : 34;
    context.fillStyle = 'rgba(1,3,14,.8)'; context.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 20, width, 4);
    context.fillStyle = { heavy: '#d8c8ff', flux: '#a9ff68', crystal: '#ffae57', mystic: '#9b7bff' }[enemy.armorFamily];
    context.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 20, width * enemy.armor / enemy.maxArmor, 4);
  }
}

function drawPlayer(context, player, time) {
  context.save();
  context.translate(player.x, player.y);
  context.rotate(player.angle);
  context.shadowColor = COLORS.cyan;
  context.shadowBlur = 24;
  context.fillStyle = '#d7ffff';
  polygon(context, 0, 0, 18, 3, 0); context.fill();
  context.fillStyle = COLORS.cyan;
  context.fillRect(-8, -4, 18, 8);
  context.fillStyle = `rgba(255,79,216,${0.65 + Math.sin(time * 18) * 0.2})`;
  context.beginPath(); context.moveTo(-13, -6); context.lineTo(-24 - Math.sin(time * 18) * 4, 0); context.lineTo(-13, 6); context.fill();
  context.restore();

  if (player.dashCooldown > 0) {
    const ready = 1 - player.dashCooldown / 2.2;
    context.strokeStyle = 'rgba(77,252,255,.35)'; context.lineWidth = 2;
    context.beginPath(); context.arc(player.x, player.y, 25, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * ready); context.stroke();
  }
}

function drawPlacement(context, state, pointer) {
  if (!state.selectedTowerType) return;
  const validation = validatePlacement(state, pointer.x, pointer.y, state.selectedTowerType);
  const definition = TOWER_TYPES[state.selectedTowerType];
  const stats = definition.levels[0];
  const color = validation.ok ? definition.color : '#ff3f72';
  context.save();
  context.globalAlpha = 0.68;
  context.strokeStyle = color;
  context.fillStyle = `${color}22`;
  context.setLineDash([7, 7]);
  context.beginPath(); context.arc(pointer.x, pointer.y, stats.range, 0, Math.PI * 2); context.fill(); context.stroke();
  context.setLineDash([]);
  context.shadowColor = color; context.shadowBlur = 20;
  polygon(context, pointer.x, pointer.y, 24, 6, Math.PI / 6); context.stroke();
  context.strokeStyle = 'rgba(77,252,255,.25)';
  context.beginPath(); context.arc(state.player.x, state.player.y, state.player.buildRadius, 0, Math.PI * 2); context.stroke();
  context.restore();
}

function drawProjectiles(context, projectiles) {
  projectiles.forEach((projectile) => {
    context.save();
    context.strokeStyle = projectile.color; context.lineWidth = 3; context.shadowColor = projectile.color; context.shadowBlur = 12;
    context.beginPath(); context.moveTo(projectile.previousX, projectile.previousY); context.lineTo(projectile.x, projectile.y); context.stroke();
    context.fillStyle = '#ffffff'; context.beginPath(); context.arc(projectile.x, projectile.y, projectile.radius, 0, Math.PI * 2); context.fill();
    context.restore();
  });
}

function drawEffects(context, effects) {
  effects.forEach((effect) => {
    const alpha = Math.max(0, Math.min(1, effect.maxTtl ? effect.ttl / effect.maxTtl : effect.ttl * 5));
    context.save(); context.globalAlpha = alpha; context.strokeStyle = effect.color ?? '#ffffff'; context.fillStyle = effect.color ?? '#ffffff'; context.shadowColor = effect.color ?? '#ffffff'; context.shadowBlur = 16;
    if (['pulse-shot', 'prism-shot', 'arc-shot', 'nova-shot'].includes(effect.type)) {
      context.lineWidth = effect.type === 'prism-shot' ? 6 : 2.5;
      let previous = { x: effect.x, y: effect.y };
      effect.targetPoints?.forEach((target, index) => {
        context.beginPath(); context.moveTo(previous.x, previous.y);
        if (effect.type === 'arc-shot') {
          const midX = (previous.x + target.x) / 2 + (index % 2 ? -8 : 8); const midY = (previous.y + target.y) / 2 - 7;
          context.lineTo(midX, midY); context.lineTo(target.x, target.y);
        } else context.lineTo(target.x, target.y);
        context.stroke(); previous = target;
      });
    } else if (['explosion', 'frost-pulse', 'gravity-pulse', 'corrosion-pulse', 'relay-pulse', 'rift-pulse', 'armor-break', 'enemy-destroyed', 'base-hit', 'projectile-hit', 'build', 'upgrade'].includes(effect.type)) {
      const progress = 1 - alpha;
      context.lineWidth = 3;
      context.beginPath(); context.arc(effect.x, effect.y, (effect.radius ?? 28) * (0.35 + progress * 0.8), 0, Math.PI * 2); context.stroke();
    } else if (effect.type === 'damage') {
      context.shadowBlur = 6; context.font = '700 14px "Chakra Petch", sans-serif'; context.textAlign = 'center'; context.fillText(effect.value, effect.x, effect.y - 12 - (1 - alpha) * 18);
    } else if (effect.type === 'particle') {
      const elapsed = (effect.maxTtl ?? effect.ttl) - effect.ttl;
      context.fillRect(effect.x + effect.vx * elapsed, effect.y + effect.vy * elapsed, effect.size, effect.size);
    } else if (effect.type === 'dash') {
      context.lineWidth = 2; context.beginPath(); context.arc(effect.x, effect.y, 22 + (1 - alpha) * 35, 0, Math.PI * 2); context.stroke();
    } else if (effect.type === 'muzzle') {
      context.translate(effect.x, effect.y); context.rotate(effect.angle); context.beginPath(); context.moveTo(18, -6); context.lineTo(39, 0); context.lineTo(18, 6); context.fill();
    }
    context.restore();
  });
}

function drawCinematic(context, state, time) {
  if (state.mode !== 'cinematic' || !state.cinematic) return;
  const phase = state.cinematic.phase;
  const phaseProgress = Math.min(1, state.cinematic.phaseTime / ({ freeze: 1.7, cores: 2.2, guardian: 2.25, salute: 2.1, launch: 2.5, fireworks: 3.2 }[phase] ?? 1));
  const base = state.map.core ?? state.map.paths[0].at(-1);
  context.save();
  context.fillStyle = `rgba(2,3,18,${phase === 'freeze' ? 0.22 : 0.42})`;
  context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);

  if (['cores', 'guardian', 'salute', 'launch', 'fireworks'].includes(phase)) {
    for (let index = 0; index < 5; index += 1) {
      const orbit = phase === 'cores' ? 92 - phaseProgress * 48 : 45;
      const angle = time * 1.8 + index * Math.PI * 0.4;
      const x = base.x + Math.cos(angle) * orbit;
      const y = base.y + Math.sin(angle) * orbit;
      context.fillStyle = [COLORS.cyan, COLORS.magenta, COLORS.lime, COLORS.orange, COLORS.violet][index];
      context.shadowColor = context.fillStyle; context.shadowBlur = 24;
      polygon(context, x, y, 9, 4, angle); context.fill();
    }
  }

  if (['guardian', 'salute', 'launch', 'fireworks'].includes(phase)) {
    const launchOffset = phase === 'launch' ? -phaseProgress * 310 : phase === 'fireworks' ? -310 : 0;
    const gx = 640; const gy = 300 + launchOffset;
    context.shadowColor = COLORS.cyan; context.shadowBlur = 45; context.strokeStyle = '#dfffff'; context.lineWidth = 5;
    polygon(context, gx, gy, 78 + Math.sin(time * 3) * 4, 6, -Math.PI / 2); context.stroke();
    context.fillStyle = 'rgba(77,252,255,.18)'; polygon(context, gx, gy, 66, 6, -Math.PI / 2); context.fill();
    context.strokeStyle = COLORS.magenta; context.lineWidth = 3; polygon(context, gx, gy, 42, 3, time); context.stroke();
    context.beginPath(); context.moveTo(gx - 44, gy + 30); context.lineTo(gx - 96, gy + 82); context.moveTo(gx + 44, gy + 30); context.lineTo(gx + 96, gy + 82); context.stroke();
  }

  if (phase === 'salute' || phase === 'launch') {
    const snapshot = state.cinematic.towerSnapshot ?? [];
    snapshot.forEach((tower, index) => {
      context.strokeStyle = TOWER_TYPES[tower.type]?.color ?? COLORS.cyan; context.lineWidth = 2.5; context.shadowColor = context.strokeStyle; context.shadowBlur = 15;
      context.beginPath(); context.moveTo(tower.x, tower.y); context.lineTo(640, 300); context.stroke();
    });
    context.font = '900 240px "Chakra Petch",sans-serif'; context.textAlign = 'center'; context.textBaseline = 'middle'; context.strokeStyle = `rgba(77,252,255,${0.16 + phaseProgress * 0.5})`; context.lineWidth = 5; context.strokeText('50', 640, 380);
  }

  if (phase === 'fireworks') {
    for (let index = 0; index < 70; index += 1) {
      const burst = index % 5; const angle = index * 2.399; const radius = ((time * 90 + index * 17) % 240);
      const cx = 180 + burst * 230; const cy = 150 + (burst % 2) * 120;
      context.fillStyle = [COLORS.cyan, COLORS.magenta, COLORS.lime, COLORS.orange, COLORS.violet][burst]; context.shadowColor = context.fillStyle; context.shadowBlur = 10;
      context.fillRect(cx + Math.cos(angle) * radius, cy + Math.sin(angle) * radius, 4, 4);
    }
  }
  context.restore();
}

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = true;

  return function render(state, pointer) {
    const time = performance.now() / 1000;
    context.save();
    if (state.cameraShake > 0) {
      context.translate(Math.sin(time * 87) * state.cameraShake * 0.35, Math.cos(time * 71) * state.cameraShake * 0.35);
    }
    drawBackground(context, time, state.map);
    drawTrack(context, time, state.map);
    drawPortals(context, time, state.map);
    drawBase(context, state, time);
    drawPlacement(context, state, pointer);
    state.towers.forEach((tower) => drawTower(context, tower, tower.id === state.selectedTowerId, time));
    state.enemies.forEach((enemy) => drawEnemy(context, enemy, time));
    drawProjectiles(context, state.projectiles);
    drawPlayer(context, state.player, time);
    drawEffects(context, state.effects);
    drawCinematic(context, state, time);
    context.restore();
  };
}
