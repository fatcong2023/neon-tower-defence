# Adaptive Procedural Music Design

## Goal

Replace the current single-note rhythm loop with a complete, original, adaptive Web Audio soundtrack. The game will have a dedicated menu theme and five musically distinct chapter themes that transition smoothly between deployment, combat intensity, wave countdowns, bosses, pause, defeat, chapter victory, and the final cinematic.

## Audio architecture

The audio graph contains three persistent buses:

- Master controls global mute and final output.
- Music controls every soundtrack layer.
- SFX controls combat and interface cues.

Each bus uses a `GainNode`. Music also passes through a low-pass filter used for pause and selected transitions. Music and SFX volumes persist independently in browser storage.

A look-ahead scheduler evaluates roughly every 25–50 ms and schedules 100–200 ms ahead. The transport tracks BPM, bar, beat, step, active theme, requested theme, intensity, and pending layer changes. Musical changes commit on a bar boundary so deployment, combat, countdown, and boss transitions remain rhythmically continuous.

## Musical themes

The soundtrack uses one menu theme plus five fully distinct chapter themes. Every chapter defines its own BPM, scale, chord progression, bass pattern, drum pattern, arpeggio, melody, timbres, and sixteen-bar form.

### Menu theme

A slow neon ambience with soft pads, sparse low-frequency pulses, and a restrained arpeggio. It begins only after the browser receives a user gesture.

### Chapter 1 — Synthwave foundation

Steady four-on-the-floor drums, warm minor chords, a clear bass line, and a memorable analogue-style melody. This establishes the neon world without overwhelming early combat.

### Chapter 2 — Fractured chiptune

Faster tempo, syncopated drums, square-wave melodic jumps, and playful broken-beat accents. The theme feels more arcade-like and visibly different from Chapter 1.

### Chapter 3 — Dual-signal rush

Bright, tense, high-speed electronic music. Two complementary melodic phrases answer each other to echo the chapter's multi-route pressure.

### Chapter 4 — Industrial asymmetry

Heavy bass, clipped industrial percussion, off-beat accents, and a darker lead. Rhythmic asymmetry reinforces the short-fast and long-dense route design.

### Chapter 5 — Dark overdrive

The fastest and most intense theme. Dark harmony, high-energy drums, sub-bass pulses, urgent lead writing, and additional boss alarms support the final thirty-wave levels.

The themes do not merely transpose one shared pattern. They use different melodies, rhythms, progressions, speeds, and synthesis choices.

## Adaptive layers

Each chapter theme provides seven independently controlled layers:

1. ambience and pads;
2. bass;
3. core drums;
4. chiptune arpeggio;
5. main melody;
6. high-frequency percussion and reinforcement phrase;
7. boss sub-bass, alarm, and counter-melody.

State mapping:

- Title uses the menu theme.
- Deployment uses chapter pads, ambience, and a light arpeggio.
- Early wave combat adds bass and core drums.
- Middle wave combat adds the main melody.
- Late wave combat adds high percussion and the reinforcement phrase.
- Boss waves enable all normal layers and the boss layer.
- Inter-wave countdown keeps harmony and bass while reducing drums to create breathing room.
- Pause ducks music volume and closes the low-pass filter instead of stopping the transport.
- Defeat rapidly deconstructs the current music and resolves downward.
- Chapter cinematics use a short chapter-victory arrangement.
- The final cinematic uses a longer final-victory arrangement.

Combat intensity derives from the current wave divided by the level's total waves, with explicit overrides for deployment, countdown, boss, cinematic, defeat, and victory. Layer changes occur only at bar boundaries.

## Synthesis and effects

All soundtrack audio is synthesized at runtime with Web Audio and uses no external music assets.

- Kick: sine oscillator with a rapid pitch envelope.
- Snare: filtered noise plus a short triangle body.
- Hi-hat: high-pass noise with short decay.
- Bass: sawtooth or pulse oscillator through a low-pass filter.
- Chiptune: square and triangle oscillators with short envelopes.
- Pad: lightly detuned oscillators with slow attack and release.
- Arpeggio: short square or triangle notes with stereo movement.
- Lead: filtered sawtooth with subtle distortion and delay.
- Boss layer: sub-bass pulses, alarm glides, and heavier percussion.

The engine limits polyphony, releases every source after its envelope, and avoids unbounded node or timer accumulation. Hidden tabs stop scheduling; returning resumes on a clean bar boundary without duplicating transports.

## Controls and persistence

The title and pause screens expose:

- Music volume slider;
- SFX volume slider;
- master mute button.

Music and SFX volume values are normalized, clamped, saved independently, and restored on reload. Master mute preserves the two slider values. Existing mute saves migrate safely to the new preference shape.

The page never attempts forbidden autoplay. Audio unlocks after the first meaningful menu interaction such as Continue, New Campaign, or another button. If `AudioContext` is unavailable, the game remains fully playable in silent mode.

## Diagnostics

`render_game_to_text()` exposes a compact audio diagnostic object containing:

- theme id;
- intensity tier;
- active layers;
- BPM;
- bar and beat;
- music volume;
- SFX volume;
- muted and unlocked state.

This information supports deterministic browser QA without adding visible debug UI.

## Verification

Pure unit tests validate theme completeness, unique chapter identity, legal notes, legal bar positions, valid dynamics, intensity-to-layer mapping, bar-boundary transitions, preference normalization, and persistence migration.

Browser tests validate audio unlock, menu-to-deployment-to-wave transitions, countdown reduction, boss intensity, independent Music/SFX controls, pause filtering, refresh persistence, hidden-tab recovery, bounded scheduler state, text-state parity, and the absence of console or page errors.

Offline or diagnostic rendering verifies that each theme produces non-silent output, that intensity tiers increase layer activity without clipping, and that all scheduled nodes have finite stop times. Final human audition remains the source of truth for musical taste and balance.
