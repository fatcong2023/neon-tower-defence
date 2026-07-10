import { LOGICAL_HEIGHT, LOGICAL_WIDTH } from './game/config.js';

const MOVEMENT_KEYS = new Set(['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight']);

export function createInput(canvas, onCommand = () => {}) {
  const keys = new Set();
  const pointer = { x: LOGICAL_WIDTH / 2, y: LOGICAL_HEIGHT / 2, down: false };
  let dashQueued = false;

  function mapPointer(event) {
    const rect = canvas.getBoundingClientRect();
    pointer.x = ((event.clientX - rect.left) / rect.width) * LOGICAL_WIDTH;
    pointer.y = ((event.clientY - rect.top) / rect.height) * LOGICAL_HEIGHT;
  }

  window.addEventListener('keydown', (event) => {
    if (MOVEMENT_KEYS.has(event.code) || event.code === 'Space') event.preventDefault();
    if (!keys.has(event.code)) {
      if (event.code === 'Space' || event.code === 'ShiftLeft' || event.code === 'ShiftRight') dashQueued = true;
      onCommand(event.code);
    }
    keys.add(event.code);
  });
  window.addEventListener('keyup', (event) => keys.delete(event.code));
  window.addEventListener('blur', () => {
    keys.clear();
    pointer.down = false;
  });

  // Track the pointer across the whole game shell, including DOM controls that
  // sit above the canvas. Otherwise the custom crosshair freezes whenever a
  // button intercepts pointer movement.
  window.addEventListener('pointermove', mapPointer);
  canvas.addEventListener('pointerdown', (event) => {
    mapPointer(event);
    if (event.button === 0) pointer.down = true;
  });
  window.addEventListener('pointerup', (event) => {
    if (event.button === 0) pointer.down = false;
  });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());

  return {
    pointer,
    snapshot() {
      const moveX = (keys.has('KeyD') || keys.has('ArrowRight') ? 1 : 0) - (keys.has('KeyA') || keys.has('ArrowLeft') ? 1 : 0);
      const moveY = (keys.has('KeyS') || keys.has('ArrowDown') ? 1 : 0) - (keys.has('KeyW') || keys.has('ArrowUp') ? 1 : 0);
      const dash = dashQueued;
      dashQueued = false;
      return {
        moveX,
        moveY,
        dash,
        fire: pointer.down,
        aimX: pointer.x,
        aimY: pointer.y,
      };
    },
  };
}
