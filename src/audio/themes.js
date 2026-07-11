const event = (step, degree, duration = 1, velocity = 0.6) => ({ step, degree, duration, velocity });
const make = (id, bpm, rootMidi, scale, chords, patterns, timbres) => Object.freeze({
  id, bpm, rootMidi, scale, formBars: 16, chords,
  drums: patterns.drums, bass: patterns.bass, arp: patterns.arp, melody: patterns.melody,
  reinforcement: patterns.reinforcement, boss: patterns.boss, timbres,
});
const patterns = (offset, drumSteps, melodyDegrees) => ({
  drums: drumSteps.map((step, index) => ({ step, voice: index % 4 === 2 ? 'snare' : index % 2 ? 'hat' : 'kick', velocity: 0.45 + (index % 3) * 0.12 })),
  bass: [0, 4, 8, 12].map((step, index) => event(step, [0, 2, -1, 4][(index + offset) % 4], 2, 0.55)),
  arp: Array.from({ length: 8 }, (_, index) => event(index * 2, [0, 2, 4, 6][(index + offset) % 4], 0.65, 0.3)),
  melody: melodyDegrees.map((degree, index) => event((index * 2 + offset) % 16, degree, 1.25, 0.48 + (index % 2) * 0.12)),
  reinforcement: [3, 7, 11, 15].map((step, index) => event(step, melodyDegrees[index % melodyDegrees.length] + 7, 0.4, 0.3)),
  boss: [0, 6, 8, 14].map((step, index) => ({ ...event(step, index % 2 ? 7 : -7, 1.4, 0.7), voice: index % 2 ? 'alarm' : 'bass' })),
});

export const MUSIC_THEMES = Object.freeze({
  menu: make('menu', 88, 50, [0, 2, 3, 5, 7, 8, 10], [0, 5, 3, 6], patterns(0, [0, 8], [0, 4, 2]), { pad: 'triangle', bass: 'sine', chip: 'triangle', lead: 'sine' }),
  'chapter-1': make('chapter-1', 116, 45, [0, 2, 3, 5, 7, 8, 10], [0, 5, 3, 4], patterns(1, [0, 2, 4, 6, 8, 10, 12, 14], [0, 2, 4, 3, 2, 6]), { pad: 'sawtooth', bass: 'sawtooth', chip: 'square', lead: 'sawtooth' }),
  'chapter-2': make('chapter-2', 138, 48, [0, 2, 3, 5, 7, 9, 10], [0, 2, 6, 4], patterns(2, [0, 3, 4, 7, 9, 10, 14, 15], [0, 6, 2, 7, 3, 5, 1]), { pad: 'triangle', bass: 'square', chip: 'square', lead: 'square' }),
  'chapter-3': make('chapter-3', 150, 52, [0, 2, 3, 5, 7, 8, 10], [0, 3, 5, 2], patterns(3, [0, 2, 5, 6, 8, 11, 12, 14], [0, 4, 7, 2, 6, 3, 8, 5]), { pad: 'sawtooth', bass: 'triangle', chip: 'triangle', lead: 'sawtooth' }),
  'chapter-4': make('chapter-4', 124, 53, [0, 1, 3, 5, 7, 8, 10], [0, 1, 6, 3], patterns(4, [0, 1, 5, 7, 8, 10, 13, 15], [0, 1, 5, 2, 6, 1, 3]), { pad: 'square', bass: 'sawtooth', chip: 'square', lead: 'triangle' }),
  'chapter-5': make('chapter-5', 158, 49, [0, 2, 3, 5, 7, 8, 11], [0, 6, 5, 1], patterns(5, [0, 2, 3, 4, 6, 8, 10, 11, 12, 14, 15], [0, 7, 3, 8, 2, 9, 5, 11]), { pad: 'sawtooth', bass: 'square', chip: 'square', lead: 'sawtooth' }),
});

export const midiToFrequency = (midi) => 440 * (2 ** ((midi - 69) / 12));
export function scaleDegreeToMidi(theme, degree, chordDegree = 0) {
  const size = theme.scale.length; const normalized = ((degree + chordDegree) % size + size) % size;
  return theme.rootMidi + theme.scale[normalized] + 12 * Math.floor((degree + chordDegree) / size);
}
export const getTheme = (id) => MUSIC_THEMES[id] ?? MUSIC_THEMES.menu;
export function validateTheme(theme) {
  const errors = [];
  if (!Number.isFinite(theme?.bpm) || theme.bpm <= 0 || theme.formBars !== 16) errors.push('transport');
  for (const key of ['drums', 'bass', 'arp', 'melody', 'reinforcement', 'boss']) for (const item of theme?.[key] ?? []) {
    if (!Number.isFinite(item.step) || item.step < 0 || item.step > 15 || !Number.isFinite(item.velocity) || item.velocity < 0 || item.velocity > 1) errors.push(`${key}:event`);
    if (key !== 'drums' && (!Number.isFinite(item.degree) || !Number.isFinite(item.duration) || item.duration <= 0)) errors.push(`${key}:note`);
  }
  return errors;
}
