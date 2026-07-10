import { COLORS, LOGICAL_HEIGHT, LOGICAL_WIDTH } from '../game/config.js';
import { PATH_POINTS, PATH_WIDTH, distance } from '../game/geometry.js';
import { ENEMY_TYPES } from '../game/enemies.js';
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

function strokePath(context) {
  context.beginPath();
  PATH_POINTS.forEach((point, index) => index === 0 ? context.moveTo(point.x, point.y) : context.lineTo(point.x, point.y));
}

function drawBackground(context, time) {
  const gradient = context.createRadialGradient(700, 320, 40, 640, 360, 720);
  gradient.addColorStop(0, '#11194c');
  gradient.addColorStop(0.48, '#080d2d');
  gradient.addColorStop(1, '#030617');
  context.fillStyle = gradient;
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

function drawTrack(context, time) {
  context.save();
  context.lineCap = 'round';
  context.lineJoin = 'round';
  context.shadowColor = COLORS.violet;
  context.shadowBlur = 26;
  context.strokeStyle = 'rgba(100,78,220,.28)';
  context.lineWidth = PATH_WIDTH + 16;
  strokePath(context); context.stroke();
  context.shadowBlur = 0;
  context.strokeStyle = '#111747';
  context.lineWidth = PATH_WIDTH;
  strokePath(context); context.stroke();
  context.strokeStyle = 'rgba(155,123,255,.42)';
  context.lineWidth = 2;
  strokePath(context); context.stroke();
  context.setLineDash([4, 18]);
  context.lineDashOffset = -time * 45;
  context.strokeStyle = 'rgba(77,252,255,.55)';
  context.lineWidth = 3;
  strokePath(context); context.stroke();
  context.setLineDash([]);

  PATH_POINTS.slice(1, -1).forEach((point) => {
    context.fillStyle = '#111747';
    context.strokeStyle = 'rgba(155,123,255,.34)';
    polygon(context, point.x, point.y, 11, 4, Math.PI / 4);
    context.fill(); context.stroke();
  });
  context.restore();
}

function drawPortal(context, time) {
  const portal = PATH_POINTS[0];
  context.save();
  context.translate(portal.x, portal.y);
  for (let index = 0; index < 3; index += 1) {
    context.rotate((time * (index % 2 ? -0.55 : 0.42)) + index);
    context.strokeStyle = `rgba(255,79,216,${0.9 - index * 0.24})`;
    context.lineWidth = 3 - index * 0.5;
    context.shadowColor = COLORS.magenta;
    context.shadowBlur = 16;
    polygon(context, 0, 0, 24 + index * 9, 6, 0);
    context.stroke();
  }
  context.restore();
}

function drawBase(context, state, time) {
  const base = PATH_POINTS.at(-1);
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
  } else {
    context.rotate(time * 0.8); for (let i = 0; i < 4; i += 1) { context.rotate(Math.PI / 2); context.fillRect(3, -2, 17, 4); }
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
  context.save();
  context.translate(enemy.x, enemy.y);
  const angle = time * (enemy.type === 'runner' ? 5 : 1.8) + enemy.progress * 12;
  context.rotate(angle);
  context.shadowColor = definition.color;
  context.shadowBlur = enemy.flash > 0 ? 30 : 13;
  context.fillStyle = enemy.flash > 0 ? '#ffffff' : definition.color;
  const sides = { grunt: 4, runner: 3, swarm: 4, tank: 6, shield: 8, boss: 8 }[enemy.type];
  polygon(context, 0, 0, enemy.radius, sides, enemy.type === 'grunt' ? Math.PI / 4 : 0);
  context.fill();
  context.fillStyle = '#090d28';
  polygon(context, 0, 0, enemy.radius * 0.48, sides, 0);
  context.fill();
  if (enemy.type === 'boss') {
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

  if (enemy.health < enemy.maxHealth || enemy.type === 'boss') {
    const width = enemy.type === 'boss' ? 82 : 34;
    context.fillStyle = 'rgba(1,3,14,.75)'; context.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 13, width, 4);
    context.fillStyle = definition.color; context.fillRect(enemy.x - width / 2, enemy.y - enemy.radius - 13, width * Math.max(0, enemy.health / enemy.maxHealth), 4);
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
    } else if (['explosion', 'frost-pulse', 'enemy-destroyed', 'base-hit', 'projectile-hit', 'build', 'upgrade'].includes(effect.type)) {
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

export function createRenderer(canvas) {
  const context = canvas.getContext('2d');
  context.imageSmoothingEnabled = true;

  return function render(state, pointer) {
    const time = performance.now() / 1000;
    context.save();
    if (state.cameraShake > 0) {
      context.translate(Math.sin(time * 87) * state.cameraShake * 0.35, Math.cos(time * 71) * state.cameraShake * 0.35);
    }
    drawBackground(context, time);
    drawTrack(context, time);
    drawPortal(context, time);
    drawBase(context, state, time);
    drawPlacement(context, state, pointer);
    state.towers.forEach((tower) => drawTower(context, tower, tower.id === state.selectedTowerId, time));
    state.enemies.forEach((enemy) => drawEnemy(context, enemy, time));
    drawProjectiles(context, state.projectiles);
    drawPlayer(context, state.player, time);
    drawEffects(context, state.effects);
    context.restore();
  };
}
