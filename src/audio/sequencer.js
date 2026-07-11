import { midiToFrequency, scaleDegreeToMidi } from './themes.js';
export const LAYERS = Object.freeze({ deployment: ['pad', 'arp'], early: ['pad', 'bass', 'drums'], middle: ['pad', 'bass', 'drums', 'arp', 'melody'], late: ['pad', 'bass', 'drums', 'arp', 'melody', 'reinforcement'], boss: ['pad', 'bass', 'drums', 'arp', 'melody', 'reinforcement', 'boss'], countdown: ['pad', 'bass', 'arp'], victory: ['pad', 'bass', 'drums', 'arp', 'melody', 'reinforcement'] });
export function getMusicScene(state) {
  if (state.mode === 'title') return { themeId: 'menu', intensity: 0, tier: 'menu', layers: ['pad', 'arp'], paused: false, filterHz: 18000, gain: 1 };
  const chapter = Math.max(1, Math.min(5, Math.ceil((state.campaign?.currentLevel ?? 1) / 4)));
  const themeId = `chapter-${chapter}`; const progress = (state.wave?.index ?? 0) / Math.max(1, state.wave?.total ?? 1);
  let tier = progress < 0.34 ? 'early' : progress < 0.67 ? 'middle' : 'late';
  if (state.mode === 'deployment') tier = 'deployment';
  if (state.mode === 'wave-countdown') tier = 'countdown';
  if (state.wave?.boss || (state.wave?.index === state.wave?.total && state.wave?.active)) tier = 'boss';
  if (['cinematic', 'level-clear', 'victory'].includes(state.mode)) tier = 'victory';
  if (state.mode === 'defeat') tier = 'defeat';
  const paused = state.mode === 'paused';
  return { themeId, intensity: tier === 'boss' ? 3 : tier === 'late' ? 2 : tier === 'middle' ? 1 : 0, tier, layers: tier === 'defeat' ? ['pad'] : LAYERS[tier] ?? LAYERS.deployment, paused, filterHz: paused ? 650 : 18000, gain: paused ? 0.22 : tier === 'defeat' ? 0.3 : 1 };
}
const configs = { pad: ['pad', 'chords'], bass: ['bass', 'bass'], drums: ['kick', 'drums'], arp: ['chip', 'arp'], melody: ['lead', 'melody'], reinforcement: ['chip', 'reinforcement'], boss: ['alarm', 'boss'] };
export function createStepEvents(theme, transport, layers) {
  const events = []; const step = transport.step; const chord = theme.chords[transport.bar % theme.chords.length];
  for (const layer of layers) {
    if (layer === 'pad' && step === 0) events.push({ layer, voice: 'pad', frequency: midiToFrequency(scaleDegreeToMidi(theme, chord)), startOffset: 0, duration: 3.5, velocity: 0.18, pan: 0 });
    const patternName = configs[layer]?.[1];
    for (const note of theme[patternName] ?? []) if (note.step === step) events.push({ layer, voice: note.voice ?? configs[layer][0], frequency: layer === 'drums' ? 60 : midiToFrequency(scaleDegreeToMidi(theme, note.degree, chord)), startOffset: 0, duration: note.duration ?? 0.12, velocity: note.velocity, pan: layer === 'arp' ? (step % 4 < 2 ? -0.45 : 0.45) : 0 });
  }
  return events;
}
export function shouldCommitScene(current, requested, transport) { return requested.tier === 'defeat' || current?.paused !== requested.paused || (!current || JSON.stringify(current) !== JSON.stringify(requested)) && transport.step === 0; }
