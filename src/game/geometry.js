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
  return distanceToRoute(point, PATH_POINTS);
}

export function distanceToRoute(point, route) {
  let minimum = Infinity;
  for (let index = 0; index < route.length - 1; index += 1) {
    minimum = Math.min(minimum, distanceToSegment(point, route[index], route[index + 1]));
  }
  return minimum;
}

export function distanceToRoutes(point, routes) {
  return Math.min(...routes.map((route) => distanceToRoute(point, route)));
}

export const PATH_SEGMENTS = Object.freeze(PATH_POINTS.slice(0, -1).map((start, index) => {
  const end = PATH_POINTS[index + 1];
  return { start, end, length: distance(start, end) };
}));

export const PATH_TOTAL_LENGTH = PATH_SEGMENTS.reduce((sum, segment) => sum + segment.length, 0);

export function routeSegments(route) {
  return route.slice(0, -1).map((start, index) => {
    const end = route[index + 1];
    return { start, end, length: distance(start, end) };
  });
}

export function routeLength(route) {
  return routeSegments(route).reduce((sum, segment) => sum + segment.length, 0);
}

export function pointAtRouteProgress(route, progress) {
  const clamped = Math.max(0, Math.min(1, progress));
  if (clamped === 0) return route[0];
  if (clamped === 1) return route.at(-1);
  const segments = routeSegments(route);
  let remaining = clamped * segments.reduce((sum, segment) => sum + segment.length, 0);
  for (const segment of segments) {
    if (remaining <= segment.length) {
      const ratio = remaining / segment.length;
      return {
        x: segment.start.x + (segment.end.x - segment.start.x) * ratio,
        y: segment.start.y + (segment.end.y - segment.start.y) * ratio,
      };
    }
    remaining -= segment.length;
  }
  return route.at(-1);
}

export function pointAtPathProgress(progress) {
  return pointAtRouteProgress(PATH_POINTS, progress);
}

export function isInsideArena(point, radius = 0) {
  return (
    point.x - radius >= ARENA_MARGIN
    && point.x + radius <= LOGICAL_WIDTH - ARENA_MARGIN
    && point.y - radius >= ARENA_MARGIN
    && point.y + radius <= DOCK_SAFE_Y
  );
}
