import { describe, expect, it } from 'vitest';
import { fitGameViewport } from '../src/ui/responsive.js';

describe('responsive game viewport', () => {
  it('uses height as the limiting dimension in a wide browser window', () => {
    expect(fitGameViewport(1616, 810)).toEqual({
      width: 1440,
      height: 810,
      scale: 1.125,
      uiFontSize: 11.25,
    });
  });

  it('uses width as the limiting dimension in a narrow browser window', () => {
    expect(fitGameViewport(800, 500)).toEqual({
      width: 800,
      height: 450,
      scale: 0.625,
      uiFontSize: 6.25,
    });
  });

  it('keeps controls legible in very small viewports', () => {
    expect(fitGameViewport(500, 900)).toEqual({
      width: 500,
      height: 281.25,
      scale: 0.390625,
      uiFontSize: 6,
    });
  });

  it.each([
    [1280, 720, 1280, 720],
    [900, 600, 900, 506.25],
  ])('keeps the 16:9 shell inside a %ix%i viewport', (width, height, expectedWidth, expectedHeight) => {
    const fitted = fitGameViewport(width, height);
    expect(fitted.width).toBe(expectedWidth);
    expect(fitted.height).toBe(expectedHeight);
    expect(fitted.width).toBeLessThanOrEqual(width);
    expect(fitted.height).toBeLessThanOrEqual(height);
  });
});
