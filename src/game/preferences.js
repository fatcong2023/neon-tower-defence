export const AUDIO_PREFERENCES_KEY = 'neon-tower-defence.audio.v2';
const DEFAULTS = Object.freeze({ muted: false, musicVolume: 0.55, sfxVolume: 0.7 });

const volume = (value, fallback) => Number.isFinite(Number(value))
  ? Math.max(0, Math.min(1, Number(value))) : fallback;

export function createAudioPreferences(values = {}) {
  return normalizeAudioPreferences(values);
}

export function normalizeAudioPreferences(values = {}) {
  return {
    muted: typeof values.muted === 'boolean' ? values.muted : DEFAULTS.muted,
    musicVolume: volume(values.musicVolume, DEFAULTS.musicVolume),
    sfxVolume: volume(values.sfxVolume, DEFAULTS.sfxVolume),
  };
}

export function loadAudioPreferences(storage) {
  try { return normalizeAudioPreferences(JSON.parse(storage?.getItem(AUDIO_PREFERENCES_KEY) ?? '{}')); }
  catch { return createAudioPreferences(); }
}

export function saveAudioPreferences(preferences, storage) {
  const normalized = normalizeAudioPreferences(preferences?.audio ?? preferences);
  storage?.setItem(AUDIO_PREFERENCES_KEY, JSON.stringify(normalized));
  return normalized;
}

function sync(state, next) {
  state.audio = next;
  state.muted = next.muted;
  return next;
}

export function setMusicVolume(state, value) {
  return sync(state, normalizeAudioPreferences({ ...state.audio, musicVolume: value })).musicVolume;
}

export function setSfxVolume(state, value) {
  return sync(state, normalizeAudioPreferences({ ...state.audio, sfxVolume: value })).sfxVolume;
}

export function toggleMutePreference(state) {
  return sync(state, normalizeAudioPreferences({ ...state.audio, muted: !state.audio?.muted })).muted;
}
