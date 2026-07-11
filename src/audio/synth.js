export const SUPPORTED_VOICES = Object.freeze(['kick', 'snare', 'hat', 'bass', 'pad', 'chip', 'lead', 'alarm']);
export function createEnvelope(start, attack, release, duration) { return { start, attackEnd: start + attack, releaseStart: start + attack + duration, stop: start + attack + duration + release }; }
export function voiceDescriptor(event, start) { const duration = Math.max(0.02, Math.min(4, event.duration)); return { ...event, start, stop: start + duration + 0.08, velocity: Math.max(0, Math.min(1, event.velocity)) }; }
