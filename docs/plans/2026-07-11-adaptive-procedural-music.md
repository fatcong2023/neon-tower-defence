# Adaptive Procedural Music Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build an original six-theme Web Audio soundtrack with bar-aligned adaptive layers, independent Music/SFX mixing, persisted controls, and deterministic diagnostics.

**Architecture:** Keep `src/audio.js` as the browser-facing audio engine, but move immutable musical data, pure scene/layer decisions, and pure step-event generation into testable modules under `src/audio/`. The runtime engine owns Web Audio buses, synthesis voices, look-ahead scheduling, pause filtering, visibility recovery, and SFX routing. UI actions mutate a normalized preference object and save it independently from campaign progress.

**Tech Stack:** Vanilla JavaScript ES modules, Web Audio API, Vite, Vitest, localStorage, HTML range inputs, and Playwright browser QA.

---

### Task 1: Persistent audio mixer preferences

**Files:**
- Modify: `src/game/preferences.js`
- Modify: `src/game/state.js`
- Modify: `src/main.js`
- Modify: `tests/preferences.test.js`

**Step 1: Write failing preference tests**

Require a normalized preference shape, storage round-trip, invalid-value fallback, legacy mute migration, and preservation through `startRun`.

```js
expect(createAudioPreferences()).toEqual({ muted: false, musicVolume: 0.55, sfxVolume: 0.7 });
expect(normalizeAudioPreferences({ muted: true, musicVolume: 2, sfxVolume: -1 }))
  .toEqual({ muted: true, musicVolume: 1, sfxVolume: 0 });
expect(loadAudioPreferences(storage)).toEqual(savedPreferences);
expect(startRun(state).audio).toEqual(state.audio);
```

**Step 2: Run the focused test and verify red**

```bash
npm test -- --run tests/preferences.test.js
```

Expected: FAIL because only `toggleMutePreference(state)` exists and no volume preference storage is available.

**Step 3: Implement normalized preferences**

Add `AUDIO_PREFERENCES_KEY`, `createAudioPreferences`, `normalizeAudioPreferences`, `loadAudioPreferences`, `saveAudioPreferences`, `setMusicVolume`, `setSfxVolume`, and `toggleMutePreference`. Clamp finite slider values to `0..1`. Migrate a legacy boolean `muted` field when present.

**Step 4: Integrate preferences into state creation**

Store the preference object as `state.audio` and retain `state.muted` only as a compatibility mirror while old call sites are migrated. `createInitialState({ audio })` and `startRun` preserve all three values. `main.js` loads preferences before creating state and saves after every mixer action.

**Step 5: Run focused and full tests**

```bash
npm test -- --run tests/preferences.test.js
npm test
```

Expected: all preference and regression tests pass.

**Step 6: Commit**

```bash
git add src/game/preferences.js src/game/state.js src/main.js tests/preferences.test.js
git commit -m "feat: persist independent audio mixer settings"
```

### Task 2: Six complete theme definitions

**Files:**
- Create: `src/audio/themes.js`
- Create: `tests/music.test.js`

**Step 1: Write failing theme-catalog tests**

Require `menu`, `chapter-1` through `chapter-5`, unique BPM and melodic identity, a sixteen-bar form, valid scale degrees, valid chord steps, legal dynamics, and all required patterns.

```js
expect(Object.keys(MUSIC_THEMES)).toEqual([
  'menu', 'chapter-1', 'chapter-2', 'chapter-3', 'chapter-4', 'chapter-5',
]);
for (const theme of Object.values(MUSIC_THEMES)) {
  expect(theme.formBars).toBe(16);
  expect(theme).toHaveProperty('drums');
  expect(theme).toHaveProperty('bass');
  expect(theme).toHaveProperty('arp');
  expect(theme).toHaveProperty('melody');
}
expect(new Set(Object.values(MUSIC_THEMES).map(theme => JSON.stringify(theme.melody))).size).toBe(6);
```

**Step 2: Run the focused test and verify red**

```bash
npm test -- --run tests/music.test.js
```

Expected: FAIL because the music catalog does not exist.

**Step 3: Implement immutable musical data**

Define each theme with `id`, `bpm`, `rootMidi`, `scale`, `formBars`, `chords`, `drums`, `bass`, `arp`, `melody`, `reinforcement`, `boss`, and `timbres`. Use fixed arrays of sixteen-step or bar-indexed events. Keep menu sparse and make all five chapter themes materially different in tempo, rhythm, harmony, and melody.

Suggested starting identities:

- menu: 88 BPM, D minor ambience;
- chapter 1: 116 BPM, A minor synthwave;
- chapter 2: 138 BPM, C Dorian fractured chiptune;
- chapter 3: 150 BPM, E minor dual answering phrases;
- chapter 4: 124 BPM, F Phrygian industrial syncopation;
- chapter 5: 158 BPM, C# minor dark overdrive.

**Step 4: Add pure music helpers**

Export `midiToFrequency`, `scaleDegreeToMidi`, `getTheme`, and `validateTheme`. Reject non-finite timing, frequency, velocity, duration, or bar positions.

**Step 5: Run focused and full tests**

```bash
npm test -- --run tests/music.test.js
npm test
```

**Step 6: Commit**

```bash
git add src/audio/themes.js tests/music.test.js
git commit -m "feat: compose six procedural soundtrack themes"
```

### Task 3: Pure adaptive scene and sequencer logic

**Files:**
- Create: `src/audio/sequencer.js`
- Modify: `tests/music.test.js`

**Step 1: Write failing scene-mapping tests**

Require title, deployment, early/middle/late combat, countdown, boss, pause, defeat, chapter cinematic, and final cinematic to map to the correct theme, intensity, and layers.

```js
expect(getMusicScene(titleState)).toMatchObject({ themeId: 'menu', intensity: 0 });
expect(getMusicScene(deploymentState).layers).toEqual(['pad', 'arp']);
expect(getMusicScene(earlyWaveState).layers).toEqual(expect.arrayContaining(['pad', 'bass', 'drums']));
expect(getMusicScene(bossState).layers).toContain('boss');
expect(getMusicScene(countdownState).layers).not.toContain('reinforcement');
```

**Step 2: Write failing event-generation tests**

Require `createStepEvents(theme, transportPosition, layers)` to return deterministic finite events with `voice`, `frequency`, `startOffset`, `duration`, `velocity`, and `pan`. Higher intensity must add events without deleting the pad/harmony foundation. Boss events must appear only when the boss layer is active.

**Step 3: Run focused tests and verify red**

```bash
npm test -- --run tests/music.test.js
```

Expected: FAIL because scene and sequencer functions do not exist.

**Step 4: Implement state-to-scene mapping**

Use campaign chapter for the chapter theme. Derive wave progress from `state.wave.index / state.wave.total`. Use explicit scene variants for countdown, pause, cinematics, defeat, and victory. Return requested layers and mix weights without touching Web Audio.

**Step 5: Implement deterministic step events**

Use sixteen steps per bar and the theme's sixteen-bar form. Generate only the requested layers. Convert scale degrees to frequency through the current chord/root. Ensure every event has a bounded duration and stop time.

**Step 6: Implement bar-boundary transition decisions**

Add `shouldCommitScene(current, requested, transport)` and require theme/layer changes to commit only at step zero of a new bar, except immediate mute/defeat safety transitions.

**Step 7: Run focused and full tests**

```bash
npm test -- --run tests/music.test.js
npm test
```

**Step 8: Commit**

```bash
git add src/audio/sequencer.js tests/music.test.js
git commit -m "feat: add bar-aligned adaptive music sequencing"
```

### Task 4: Web Audio synthesis voices and buses

**Files:**
- Create: `src/audio/synth.js`
- Modify: `src/audio.js`
- Modify: `tests/music.test.js`

**Step 1: Write failing synthesis-contract tests**

Test pure envelope and filter parameter helpers. Require every voice descriptor to have finite start/stop times, a positive duration, bounded gain, and a voice id supported by the runtime.

```js
expect(createEnvelope(1, 0.01, 0.08, 0.5)).toEqual(expect.objectContaining({ start: 1, stop: 1.59 }));
expect(SUPPORTED_VOICES).toEqual(expect.arrayContaining(['kick','snare','hat','bass','pad','chip','lead','alarm']));
```

**Step 2: Run focused tests and verify red**

```bash
npm test -- --run tests/music.test.js
```

Expected: FAIL because synthesis helpers do not exist.

**Step 3: Create the three-bus graph**

`createAudioEngine(preferences)` lazily builds Master, Music, and SFX gains plus a music low-pass filter and analyser. Route existing cues exclusively through SFX. Apply gain changes with short ramps to avoid clicks.

**Step 4: Implement synthesis voices**

Create kick pitch envelopes, noise-based snare/hat, filtered saw/pulse bass, detuned pad, square/triangle chip, filtered lead with subtle delay, and boss alarm/sub voices. Every scheduled source must call `stop` and disconnect after completion. Cap scheduled polyphony and drop the quietest optional event if necessary.

**Step 5: Replace the old beat loop with look-ahead scheduling**

Maintain transport state inside the engine. On `update(state)`, request a pure scene, commit changes at a bar boundary, and schedule step events only until `currentTime + 0.15`. Prevent rescheduling the same step. Keep existing effect cue handling.

**Step 6: Expose mixer and diagnostics methods**

Return `unlock`, `cue`, `update`, `setMusicVolume`, `setSfxVolume`, `setMuted`, `handleVisibility`, and `getDebugState`. Debug state reports theme, intensity, layers, BPM, bar, beat, volumes, muted, unlocked, active node estimate, and analyser RMS.

**Step 7: Run focused/full tests and build**

```bash
npm test -- --run tests/music.test.js
npm test
npm run build
```

**Step 8: Commit**

```bash
git add src/audio/synth.js src/audio.js tests/music.test.js
git commit -m "feat: synthesize layered adaptive soundtrack"
```

### Task 5: Game-state transitions, pause filtering, and visibility recovery

**Files:**
- Modify: `src/main.js`
- Modify: `src/audio.js`
- Modify: `src/game/simulation.js`
- Modify: `tests/music.test.js`

**Step 1: Write failing transition tests**

Require scene changes to wait for a bar boundary, pause to preserve transport while requesting a low-pass/ducked mix, resume to clear the filter without duplicate transport, and hidden-tab recovery to reset the scheduling cursor to a future clean bar.

**Step 2: Run focused tests and verify red**

```bash
npm test -- --run tests/music.test.js
```

Expected: FAIL until lifecycle controls and diagnostics exist.

**Step 3: Integrate the engine with current game state**

Initialize `createAudioEngine(state.audio)`. Unlock on meaningful menu interactions and preserve the current browser autoplay contract. Pass full state to `audio.update` every frame. Keep one engine instance when `state` objects are replaced during retries or new levels.

**Step 4: Add pause and visibility behavior**

On pause, ramp Music down and lower the low-pass cutoff while transport position continues. On resume, restore both over a short bar-aligned transition. On `visibilitychange`, stop scheduling while hidden, cancel stale cursors, and resume from the next bar without starting a second scheduler.

**Step 5: Add cinematic and terminal transitions**

Use chapter-victory and final-victory arrangements for cinematics. Defeat schedules a short downward deconstruction and then leaves a low ambience. Returning to title requests the menu theme at the next safe boundary.

**Step 6: Run focused/full tests and build**

```bash
npm test -- --run tests/music.test.js
npm test
npm run build
```

**Step 7: Commit**

```bash
git add src/main.js src/audio.js src/game/simulation.js tests/music.test.js
git commit -m "feat: adapt soundtrack to live game states"
```

### Task 6: Mixer UI, localization, and text diagnostics

**Files:**
- Modify: `src/ui/interface.js`
- Modify: `src/style.css`
- Modify: `src/i18n.js`
- Modify: `src/main.js`
- Modify: `tests/i18n.test.js`
- Modify: `tests/preferences.test.js`
- Modify: `tests/responsive.test.js`

**Step 1: Write failing localization and preference-action tests**

Require Chinese and English labels for Music, SFX, Mute All, audio locked/ready status, and percentage values. Require slider changes to normalize, persist, and update the engine independently.

**Step 2: Run focused tests and verify red**

```bash
npm test -- --run tests/i18n.test.js tests/preferences.test.js tests/responsive.test.js
```

Expected: FAIL because the UI has only one mute button.

**Step 3: Add mixer controls to title and pause screens**

Render compact `input type="range"` controls for Music and SFX plus a master mute button. Keep them keyboard accessible, pointer-responsive, localized, and visually consistent with the neon interface. Avoid duplicating ids by using `data-audio-control` attributes and synchronized values.

**Step 4: Wire UI actions and persistence**

Add actions for music volume, SFX volume, and mute. Each action updates state, engine gain, storage, and all mirrored controls immediately. Restore values before first render.

**Step 5: Expose audio diagnostics**

Add `audio: audio.getDebugState()` to `window.render_game_to_text`. Keep the payload compact and exclude large note histories.

**Step 6: Verify responsive mixer layout**

Use current responsive tests plus browser measurements at 1616×810, 1280×720, 900×600, and 800×500. Controls must remain within title/pause cards without covering primary actions.

**Step 7: Run focused/full tests and build**

```bash
npm test -- --run tests/i18n.test.js tests/preferences.test.js tests/responsive.test.js
npm test
npm run build
```

**Step 8: Commit**

```bash
git add src/ui/interface.js src/style.css src/i18n.js src/main.js tests/i18n.test.js tests/preferences.test.js tests/responsive.test.js
git commit -m "feat: add persistent music and sound mixer"
```

### Task 7: Audio browser QA and documentation

**Files:**
- Modify: `README.md`
- Modify: `progress.md`

**Step 1: Run the required web-game client**

Use `/Users/frankcj/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js` after the final meaningful changes. Exercise menu interaction, deployment, Wave 1, countdown, later-wave intensity, pause/resume, and boss state. Capture state JSON and screenshots.

**Step 2: Run dedicated audio browser diagnostics**

Verify:

- AudioContext stays suspended before user interaction and runs after unlock;
- menu, five chapter themes, deployment, early/middle/late Wave, countdown, boss, pause, defeat, chapter cinematic, final cinematic, and victory return the expected debug scene;
- analyser RMS becomes non-zero when Music volume is above zero;
- Music volume zero leaves SFX analyser/cues active;
- SFX volume zero leaves Music RMS active;
- mute silences both without losing slider values;
- refresh restores settings;
- hide/show does not create duplicate scheduling or increasing active-node counts;
- no console or page errors occur.

**Step 3: Inspect UI screenshots and diagnostic output**

Open title and pause mixer screenshots at desktop and 800×500 sizes. Confirm every control is readable, sliders are aligned, cursor behavior is immediate, and primary game buttons remain unobstructed.

**Step 4: Perform soundtrack form diagnostics**

Advance deterministic time through at least sixteen bars for every theme. Confirm finite event counts, non-zero output, bounded active nodes, distinct BPM/layer data, and no clipping indicators. Document that final musical taste requires human listening.

**Step 5: Update documentation**

Document the six themes, adaptive layers, autoplay behavior, mixer controls, persistence, mute shortcut, and Web Audio fallback. Append the implementation and QA evidence to `progress.md` without changing its original prompt.

**Step 6: Run fresh completion verification**

```bash
npm test
npm run build
git diff --check
git status --short
```

Expected: all tests pass, build succeeds, no whitespace errors, and only intended documentation changes remain before commit.

**Step 7: Commit**

```bash
git add README.md progress.md
git commit -m "docs: document adaptive procedural soundtrack"
```

**Step 8: Integrate and publish**

Read and follow `verification-before-completion` and `finishing-a-development-branch`. Merge the feature branch into `main`, re-run tests and build in the cleaned root checkout, remove the worktree and merged branch, push `main`, and verify local and remote commit ids match.
