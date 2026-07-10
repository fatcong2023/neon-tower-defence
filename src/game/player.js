import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';

const PLAYER_SHOT_COOLDOWN = 0.24;
const PLAYER_PROJECTILE_SPEED = 680;
const PLAYER_PROJECTILE_DAMAGE = 18;

export function updatePlayer(state, input = {}, delta) {
  const player = state.player;
  const moveX = input.moveX ?? 0;
  const moveY = input.moveY ?? 0;
  const magnitude = Math.hypot(moveX, moveY);
  const directionX = magnitude > 0 ? moveX / magnitude : 0;
  const directionY = magnitude > 0 ? moveY / magnitude : 0;

  if (input.dash && player.dashCooldown <= 0 && magnitude > 0) {
    player.dashTimer = 0.16;
    player.dashCooldown = 2.2;
    state.effects.push({ type: 'dash', x: player.x, y: player.y, color: '#4dfcff', ttl: 0.35 });
  }

  const speedMultiplier = player.dashTimer > 0 ? 2.85 : 1;
  player.x += directionX * player.speed * speedMultiplier * delta;
  player.y += directionY * player.speed * speedMultiplier * delta;
  const inset = player.radius + 8;
  player.x = Math.max(inset, Math.min(LOGICAL_WIDTH - inset, player.x));
  player.y = Math.max(inset, Math.min(LOGICAL_HEIGHT - inset, player.y));

  if (Number.isFinite(input.aimX) && Number.isFinite(input.aimY)) {
    player.angle = Math.atan2(input.aimY - player.y, input.aimX - player.x);
  }
  player.shotCooldown = Math.max(0, player.shotCooldown - delta);
  player.dashCooldown = Math.max(0, player.dashCooldown - delta);
  player.dashTimer = Math.max(0, player.dashTimer - delta);
}

export function firePlayerShot(state, aimX, aimY) {
  const player = state.player;
  if (player.shotCooldown > 0 || state.mode !== 'playing') return false;
  const angle = Math.atan2(aimY - player.y, aimX - player.x);
  player.angle = angle;
  player.shotCooldown = PLAYER_SHOT_COOLDOWN;
  state.projectiles.push({
    id: `player-shot-${state.time}-${state.projectiles.length}`,
    owner: 'player',
    x: player.x + Math.cos(angle) * 24,
    y: player.y + Math.sin(angle) * 24,
    previousX: player.x,
    previousY: player.y,
    vx: Math.cos(angle) * PLAYER_PROJECTILE_SPEED,
    vy: Math.sin(angle) * PLAYER_PROJECTILE_SPEED,
    radius: 4,
    damage: PLAYER_PROJECTILE_DAMAGE,
    color: '#4dfcff',
    ttl: 1.25,
  });
  state.effects.push({ type: 'muzzle', x: player.x, y: player.y, angle, color: '#4dfcff', ttl: 0.12 });
  return true;
}
