const CUES = {
  ui: { frequency: 520, endFrequency: 760, duration: 0.055, type: 'square', gain: 0.035 },
  start: { frequency: 180, endFrequency: 520, duration: 0.32, type: 'sawtooth', gain: 0.055 },
  playerShot: { frequency: 780, endFrequency: 310, duration: 0.07, type: 'square', gain: 0.025 },
  pulse: { frequency: 640, endFrequency: 420, duration: 0.055, type: 'square', gain: 0.018 },
  prism: { frequency: 160, endFrequency: 80, duration: 0.16, type: 'sawtooth', gain: 0.04 },
  arc: { frequency: 1050, endFrequency: 380, duration: 0.1, type: 'sawtooth', gain: 0.025 },
  nova: { frequency: 110, endFrequency: 44, duration: 0.2, type: 'square', gain: 0.05 },
  frost: { frequency: 880, endFrequency: 620, duration: 0.18, type: 'sine', gain: 0.023 },
  build: { frequency: 240, endFrequency: 640, duration: 0.2, type: 'square', gain: 0.04 },
  upgrade: { frequency: 330, endFrequency: 990, duration: 0.3, type: 'triangle', gain: 0.05 },
  sell: { frequency: 520, endFrequency: 230, duration: 0.14, type: 'triangle', gain: 0.03 },
  destroy: { frequency: 130, endFrequency: 55, duration: 0.12, type: 'sawtooth', gain: 0.028 },
  baseHit: { frequency: 72, endFrequency: 38, duration: 0.3, type: 'sawtooth', gain: 0.075 },
  wave: { frequency: 220, endFrequency: 660, duration: 0.36, type: 'triangle', gain: 0.055 },
  victory: { frequency: 440, endFrequency: 1320, duration: 0.8, type: 'triangle', gain: 0.06 },
  defeat: { frequency: 180, endFrequency: 45, duration: 0.9, type: 'sawtooth', gain: 0.065 },
};

export function createAudioEngine() {
  let context = null;
  let master = null;
  let nextBeat = 0;
  let beat = 0;
  const seenEffects = new WeakSet();

  function ensureContext() {
    if (!context) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      context = new AudioContextClass();
      master = context.createGain();
      master.gain.value = 0.62;
      master.connect(context.destination);
      nextBeat = context.currentTime;
    }
    if (context.state === 'suspended') context.resume().catch(() => {});
    return context;
  }

  function tone(options, when = null) {
    const audioContext = ensureContext();
    if (!audioContext || !master) return;
    const start = when ?? audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.type = options.type ?? 'sine';
    oscillator.frequency.setValueAtTime(options.frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, options.endFrequency ?? options.frequency), start + options.duration);
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(options.gain ?? 0.03, start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + options.duration);
    oscillator.connect(gain);
    gain.connect(master);
    oscillator.start(start);
    oscillator.stop(start + options.duration + 0.02);
  }

  function cue(name, muted = false) {
    if (muted || !CUES[name]) return;
    tone(CUES[name]);
    if (name === 'upgrade' || name === 'victory') {
      tone({ ...CUES[name], frequency: CUES[name].frequency * 1.5, endFrequency: CUES[name].endFrequency * 1.5, gain: CUES[name].gain * 0.6 }, (context?.currentTime ?? 0) + 0.08);
    }
  }

  function scheduleMusic(state) {
    if (!context || state.muted || ['title', 'paused', 'victory', 'defeat'].includes(state.mode)) return;
    const interval = state.wave.index >= 8 ? 0.18 : 0.24;
    if (nextBeat < context.currentTime - interval) nextBeat = context.currentTime;
    while (nextBeat < context.currentTime + 0.12) {
      const scale = [55, 65.41, 73.42, 82.41, 98];
      const frequency = scale[(beat + Math.floor(state.wave.index / 2)) % scale.length];
      tone({ frequency, endFrequency: frequency * 0.98, duration: interval * 0.72, type: 'triangle', gain: beat % 4 === 0 ? 0.018 : 0.009 }, nextBeat);
      if (beat % 4 === 2) tone({ frequency: frequency * 4, endFrequency: frequency * 3.5, duration: 0.045, type: 'square', gain: 0.006 }, nextBeat);
      nextBeat += interval;
      beat += 1;
    }
  }

  function handleEffects(state) {
    if (state.muted) return;
    state.effects.forEach((effect) => {
      if (seenEffects.has(effect)) return;
      seenEffects.add(effect);
      const cueName = {
        muzzle: 'playerShot', 'pulse-shot': 'pulse', 'prism-shot': 'prism', 'arc-shot': 'arc', 'nova-shot': 'nova',
        'frost-pulse': 'frost', 'enemy-destroyed': 'destroy', 'base-hit': 'baseHit', build: 'build', upgrade: 'upgrade',
      }[effect.type];
      if (cueName) cue(cueName, state.muted);
    });
  }

  return {
    unlock: ensureContext,
    cue,
    update(state) {
      handleEffects(state);
      scheduleMusic(state);
    },
  };
}
