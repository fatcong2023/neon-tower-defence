import { describe, expect, it } from 'vitest';
import { LANGUAGE_KEY, TRANSLATIONS, createI18n, normalizeLanguage } from '../src/i18n.js';

describe('localization', () => {
  it('defaults to Simplified Chinese and switches instantly to English', () => {
    const i18n = createI18n();
    expect(i18n.language).toBe('zh-CN');
    expect(i18n.t('menu.continue')).toBe('继续战役');
    i18n.setLanguage('en');
    expect(i18n.language).toBe('en');
    expect(i18n.t('menu.continue')).toBe('CONTINUE');
  });

  it('interpolates values and falls back to Chinese', () => {
    const i18n = createI18n('en');
    expect(i18n.t('hud.level', { current: 8, total: 50 })).toBe('LEVEL 8 / 50');
    expect(i18n.t('only.zh.key')).toBe('中文回退');
  });

  it('persists a normalized language choice', () => {
    const values = new Map();
    const storage = { getItem: (key) => values.get(key), setItem: (key, value) => values.set(key, value) };
    const i18n = createI18n('xx', storage);
    expect(normalizeLanguage('xx')).toBe('zh-CN');
    i18n.setLanguage('en');
    expect(values.get(LANGUAGE_KEY)).toBe('en');
  });

  it('keeps English coverage aligned with Chinese for shared UI keys', () => {
    const englishKeys = Object.keys(TRANSLATIONS.en);
    expect(englishKeys.every((key) => key in TRANSLATIONS['zh-CN'])).toBe(true);
    expect(englishKeys.length).toBeGreaterThan(70);
  });
});
