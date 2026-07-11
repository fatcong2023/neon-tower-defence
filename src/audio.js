import { getTheme } from './audio/themes.js';
import { createStepEvents, getMusicScene, shouldCommitScene } from './audio/sequencer.js';

const CUES = {
  ui:[520,760,.055,'square',.035], start:[180,520,.32,'sawtooth',.055], playerShot:[780,310,.07,'square',.025], pulse:[640,420,.055,'square',.018], prism:[160,80,.16,'sawtooth',.04], arc:[1050,380,.1,'sawtooth',.025], nova:[110,44,.2,'square',.05], frost:[880,620,.18,'sine',.023], build:[240,640,.2,'square',.04], upgrade:[330,990,.3,'triangle',.05], sell:[520,230,.14,'triangle',.03], destroy:[130,55,.12,'sawtooth',.028], baseHit:[72,38,.3,'sawtooth',.075], wave:[220,660,.36,'triangle',.055], victory:[440,1320,.8,'triangle',.06], defeat:[180,45,.9,'sawtooth',.065],
};
export function createAudioEngine(preferences = {}) {
  let context = null, master, music, sfx, filter, analyser, noise;
  let prefs = { muted:false, musicVolume:.55, sfxVolume:.7, ...preferences };
  let activeScene = null, requestedScene = null, nextStepTime = 0, step = 0, bar = 0, hidden = false, unlocked = false, activeNodes = 0, maxActiveNodes = 0, scheduled = 0;
  const seenEffects = new WeakSet();
  const ramp = (param, value, time = .04) => { if (!context) return; param.cancelScheduledValues(context.currentTime); param.setTargetAtTime(value, context.currentTime, time); };
  function applyMix() { if (!context) return; ramp(master.gain, prefs.muted ? 0 : 1); ramp(music.gain, prefs.musicVolume * (activeScene?.gain ?? 1)); ramp(sfx.gain, prefs.sfxVolume); ramp(filter.frequency, activeScene?.filterHz ?? 18000, .08); }
  function ensureContext() {
    if (context) return context;
    const AudioContextClass = globalThis.AudioContext ?? globalThis.webkitAudioContext;
    if (!AudioContextClass) return null;
    context = new AudioContextClass(); master = context.createGain(); music = context.createGain(); sfx = context.createGain(); filter = context.createBiquadFilter(); analyser = context.createAnalyser();
    filter.type = 'lowpass'; filter.Q.value = .7; analyser.fftSize = 256; music.connect(filter); filter.connect(analyser); analyser.connect(master); sfx.connect(master); master.connect(context.destination); nextStepTime = context.currentTime + .03; applyMix(); return context;
  }
  async function unlock() { const c = ensureContext(); if (!c) return false; if (c.state === 'suspended') await c.resume().catch(() => {}); unlocked = c.state === 'running'; return unlocked; }
  function track(source, stop) { activeNodes++; maxActiveNodes = Math.max(maxActiveNodes, activeNodes); source.stop(stop); source.onended = () => { activeNodes = Math.max(0, activeNodes - 1); try { source.disconnect(); } catch {} }; scheduled++; }
  function oscillator(voice, frequency, start, duration, velocity, bus = music, pan = 0) {
    if (!context || activeNodes >= 64 || !Number.isFinite(frequency)) return;
    const osc = context.createOscillator(), gain = context.createGain(), panner = context.createStereoPanner?.();
    osc.type = voice === 'chip' || voice === 'alarm' ? 'square' : voice === 'pad' || voice === 'lead' || voice === 'bass' ? 'sawtooth' : 'sine'; osc.frequency.setValueAtTime(Math.max(24, frequency), start);
    if (voice === 'alarm') osc.frequency.linearRampToValueAtTime(frequency * 1.5, start + duration);
    gain.gain.setValueAtTime(.0001, start); gain.gain.exponentialRampToValueAtTime(Math.max(.0002, velocity * .09), start + Math.min(.04, duration / 3)); gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
    osc.connect(gain); if (panner) { panner.pan.value = pan; gain.connect(panner); panner.connect(bus); } else gain.connect(bus); osc.start(start); track(osc, start + duration + .03);
  }
  function noiseHit(voice, start, velocity) {
    if (!context || activeNodes >= 64) return; if (!noise) { noise = context.createBuffer(1, context.sampleRate, context.sampleRate); const data = noise.getChannelData(0); for (let i=0;i<data.length;i++) data[i]=Math.random()*2-1; }
    const source=context.createBufferSource(), gain=context.createGain(), hp=context.createBiquadFilter(); source.buffer=noise; hp.type=voice==='hat'?'highpass':'bandpass'; hp.frequency.value=voice==='hat'?6000:1600; gain.gain.setValueAtTime(velocity*.06,start); gain.gain.exponentialRampToValueAtTime(.0001,start+(voice==='hat'?.045:.12)); source.connect(hp); hp.connect(gain); gain.connect(music); source.start(start); track(source,start+(voice==='hat'?.06:.14));
  }
  function scheduleEvent(event, when) { if (event.voice==='snare'||event.voice==='hat') noiseHit(event.voice,when,event.velocity); else oscillator(event.voice,event.frequency,when,Math.max(.03,event.duration * 60/getTheme(activeScene.themeId).bpm/4),event.velocity,music,event.pan); }
  function tone(def, when=context?.currentTime) { if (!context) return; oscillator(def[3],def[0],when,def[2],def[4],sfx); }
  function cue(name, muted = false) { if (muted || prefs.muted || !CUES[name]) return; unlock().then(()=>tone(CUES[name])); }
  function schedule() {
    if (!context || hidden || context.state !== 'running' || !activeScene) return;
    const theme=getTheme(activeScene.themeId), stepDuration=60/theme.bpm/4;
    if (nextStepTime < context.currentTime-.5) { nextStepTime=context.currentTime+.03; step=0; bar++; }
    while (nextStepTime < context.currentTime+.15) {
      if (requestedScene && shouldCommitScene(activeScene,requestedScene,{step,bar})) { activeScene=requestedScene; applyMix(); }
      for (const event of createStepEvents(theme,{bar,step},activeScene.layers)) scheduleEvent(event,nextStepTime+event.startOffset);
      nextStepTime+=stepDuration; step=(step+1)%16; if(step===0) bar=(bar+1)%16;
    }
  }
  function handleEffects(state) { for (const effect of state.effects??[]) if (!seenEffects.has(effect)) { seenEffects.add(effect); const name={muzzle:'playerShot','pulse-shot':'pulse','prism-shot':'prism','arc-shot':'arc','nova-shot':'nova','frost-pulse':'frost','enemy-destroyed':'destroy','base-hit':'baseHit',build:'build',upgrade:'upgrade'}[effect.type]; if(name)cue(name,state.muted); } }
  function update(state) { prefs={...prefs,...state.audio,muted:state.muted}; requestedScene=getMusicScene(state); if(!activeScene||activeScene.paused!==requestedScene.paused){activeScene=requestedScene;} applyMix(); handleEffects(state); schedule(); }
  function handleVisibility(isHidden=document.hidden) { hidden=isHidden; if(!hidden&&context){nextStepTime=context.currentTime+.05;step=0;bar=(bar+1)%16;} }
  function getRms(){if(!analyser)return 0;const values=new Float32Array(analyser.fftSize);analyser.getFloatTimeDomainData(values);return Math.sqrt(values.reduce((sum,v)=>sum+v*v,0)/values.length);}
  return { unlock,cue,update,setMusicVolume(value){prefs.musicVolume=Math.max(0,Math.min(1,Number(value)||0));applyMix();},setSfxVolume(value){prefs.sfxVolume=Math.max(0,Math.min(1,Number(value)||0));applyMix();},setMuted(value){prefs.muted=Boolean(value);applyMix();},handleVisibility,getDebugState(){const theme=getTheme(activeScene?.themeId);return {theme:activeScene?.themeId??'menu',intensity:activeScene?.tier??'menu',layers:activeScene?.layers??[],bpm:theme.bpm,bar,beat:Math.floor(step/4)+1,step,musicVolume:prefs.musicVolume,sfxVolume:prefs.sfxVolume,muted:prefs.muted,unlocked,contextState:context?.state??'unavailable',paused:Boolean(activeScene?.paused),filterHz:activeScene?.filterHz??18000,activeNodes,maxActiveNodes,scheduled,rms:Number(getRms().toFixed(5)),hidden};} };
}
