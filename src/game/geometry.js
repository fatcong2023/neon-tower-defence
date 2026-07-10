import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './config.js';

export const PATH_POINTS = Object.freeze([
  { x: 50, y: 92 },
  { x: 310, y: 92 },
  { x: 310, y: 245 },
  { x: 650, y: 245 },
  { x: 650, y: 112 },
  { x: 1040, y: 112 },
  { x: 1040, y: 365 },
  { x: 805, y: 365 },
  { x: 805, y: 545 },
  { x: 1140, y: 545 },
]);

export const PATH_WIDTH = 72;
export const TOWER_RADIUS = 24;
export const TOWER_SPACING = 62;
export const ARENA_MARGIN = 42;
export const DOCK_SAFE_Y = LOGICAL_HEIGHT - 86;

export function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

export function distanceToSegment(point, start, end) {
  const dx = end.x - start.x;
  const dy = end.y - start.y;
  const lengthSquared = dx * dx + dy * dy;
  if (lengthSquared === 0) return distance(point, start);

  const t = Math.max(0, Math.min(1, ((point.x - start.x) * dx + (point.y - start.y) * dy) / lengthSquared));
  return distance(point, { x: start.x + dx * t, y: start.y + dy * t });
}

export function distanceToPath(point) {
  let minimum = Infinity;
  for (let index = 0; index < PATH_POINTS.length - 1; index += 1) {
    minimum = Math.min(minimum, distanceToSegment(point, PATH_POINTS[index], PATH_POINTS[index + 1]));
  }
  return minimum;
}

export function isInsideArena(point, radius = 0) {
  return (
    point.x - radius >= ARENA_MARGIN
    && point.x + radius <= LOGICAL_WIDTH - ARENA_MARGIN
    && point.y - radius >= ARENA_MARGIN
    && point.y + radius <= DOCK_SAFE_Y
  );
}
