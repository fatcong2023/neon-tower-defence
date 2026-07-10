export function addEffect(state, type, options = {}) {
  const ttl = options.ttl ?? 0.5;
  const effect = { type, ttl, maxTtl: ttl, ...options };
  state.effects.push(effect);
  return effect;
}

export function addBurst(state, x, y, color, count = 10, speed = 80) {
  for (let index = 0; index < count; index += 1) {
    const angle = (Math.PI * 2 * index) / count + ((index * 1.618) % 1) * 0.35;
    addEffect(state, 'particle', {
      x,
      y,
      vx: Math.cos(angle) * speed * (0.55 + (index % 4) * 0.16),
      vy: Math.sin(angle) * speed * (0.55 + (index % 4) * 0.16),
      size: 2 + (index % 3),
      color,
      ttl: 0.45 + (index % 4) * 0.06,
    });
  }
}
