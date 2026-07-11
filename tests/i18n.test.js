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
    expect(i18n.t('hud.level', { current: 8, total: 20 })).toBe('LEVEL 8 / 20');
    expect(i18n.t('hud.wave', { current: 12, total: 15 })).toBe('WAVE 12 / 15');
    expect(i18n.t('only.zh.key')).toBe('中文回退');
  });

  it('distinguishes level and wave terminology in both languages', () => {
    const zh = createI18n('zh-CN');
    const en = createI18n('en');

    expect(zh.t('hud.level', { current: 2, total: 20 })).toBe('关卡 2 / 20');
    expect(zh.t('hud.wave', { current: 3, total: 10 })).toBe('波次 3 / 10');
    expect(en.t('wave.countdown', { seconds: 5 })).toContain('5');
    expect(en.t('wave.startNow')).toBe('START NOW');
    expect(en.t('wave.preview')).toBe('NEXT WAVE');
    expect(en.t('deployment.totalWaves', { total: 25 })).toContain('25');
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
