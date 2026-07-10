const LOGICAL_WIDTH = 1280;
const LOGICAL_HEIGHT = 720;
const BASE_UI_FONT_SIZE = 10;
const MIN_UI_FONT_SIZE = 6;
const MAX_UI_FONT_SIZE = 14;

function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

export function fitGameViewport(viewportWidth, viewportHeight) {
  const scale = Math.min(viewportWidth / LOGICAL_WIDTH, viewportHeight / LOGICAL_HEIGHT);
  return {
    width: LOGICAL_WIDTH * scale,
    height: LOGICAL_HEIGHT * scale,
    scale,
    uiFontSize: clamp(BASE_UI_FONT_SIZE * scale, MIN_UI_FONT_SIZE, MAX_UI_FONT_SIZE),
  };
}
