import './style.css';
import { COLORS, LOGICAL_HEIGHT, LOGICAL_WIDTH } from './game/config.js';

const canvas = document.querySelector('#game-canvas');
const context = canvas.getContext('2d');

context.fillStyle = COLORS.background;
context.fillRect(0, 0, LOGICAL_WIDTH, LOGICAL_HEIGHT);
context.fillStyle = COLORS.cyan;
context.font = '700 42px "Chakra Petch", sans-serif';
context.textAlign = 'center';
context.fillText('NEON TOWER DEFENCE', LOGICAL_WIDTH / 2, LOGICAL_HEIGHT / 2);
