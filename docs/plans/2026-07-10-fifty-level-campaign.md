# Fifty-Level Campaign Expansion Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the ten-wave single-map game into a bilingual fifty-level campaign with deterministic procedural maps, deployment phases, armor counters, thirteen towers, persistent research, autosave, chapter unlocks, and a level-fifty victory cinematic.

**Architecture:** Add pure data modules for deterministic random generation, campaign progression, localization, saves, armor, unlocks, and research. Refactor the simulation and renderer to consume `state.map.paths` rather than a global path, then layer localized campaign UI and cinematic states above the existing fixed-step runtime.

**Tech Stack:** Vite, vanilla JavaScript ES modules, Canvas 2D, Web Audio, localStorage, Vitest, and Playwright web-game interaction.

---

### Task 1: Deterministic procedural maps and multi-route geometry

**Files:**
- Create: `src/game/random.js`
- Create: `src/game/maps.js`
- Create: `tests/maps.test.js`
- Modify: `src/game/geometry.js`
- Modify: `src/game/state.js`

**Step 1: Write failing map tests**

Test deterministic output for equal seeds, variation across levels, route-stage rules for levels 1/11/21/31/41, path endpoints, minimum lengths, branch balance, buildable sample count, and fifty campaign seeds that all validate.

**Step 2: Verify red**

Run `npm test -- --run tests/maps.test.js` and expect failure because the generator does not exist.

**Step 3: Implement the generator and geometry API**

Add a small seeded PRNG, chapter themes, constrained route templates, retry validation, map metadata, `pointAtRouteProgress(route, progress)`, `routeLength(route)`, and distance-to-all-routes placement helpers. Initial state receives a generated level-one map.

**Step 4: Verify green**

Run `npm test -- --run tests/maps.test.js`, then `npm test`.

**Step 5: Commit**

```bash
git add src/game/random.js src/game/maps.js src/game/geometry.js src/game/state.js tests/maps.test.js
git commit -m "feat: generate deterministic campaign maps"
```

### Task 2: Campaign progression, deployment economy, and persistence

**Files:**
- Create: `src/game/campaign.js`
- Create: `src/game/save.js`
- Create: `tests/campaign.test.js`
- Create: `tests/save.test.js`
- Modify: `src/game/state.js`
- Modify: `src/game/waves.js`
- Modify: `src/game/simulation.js`
- Modify: `src/game/towers.js`

**Step 1: Write failing campaign and save tests**

Test fifty levels and five chapters, elite/boss flags, deployment mode, manual assault start, tower sell-value recycling, rewards, retry restoration, level advance, chapter unlock points, safe new-campaign defaults, round-trip persistence, language persistence, and corrupted-save fallback.

**Step 2: Verify red**

Run `npm test -- --run tests/campaign.test.js tests/save.test.js` and expect missing APIs.

**Step 3: Implement campaign state and save schema**

Add `createCampaign`, `prepareLevel`, `startAssault`, `settleLevel`, `retryLevel`, `getLevelDefinition`, versioned serialization, validation, browser storage adapters, and save-safe pure fallbacks. Replace automatic countdown starts with an explicit deployment phase.

**Step 4: Verify green**

Run the focused tests and then the full suite.

**Step 5: Commit**

```bash
git add src/game/campaign.js src/game/save.js src/game/state.js src/game/waves.js src/game/simulation.js src/game/towers.js tests/campaign.test.js tests/save.test.js
git commit -m "feat: add fifty-level campaign persistence"
```

### Task 3: Armor families, new enemies, and first-appearance tutorials

**Files:**
- Create: `src/game/armor.js`
- Create: `src/game/tutorials.js`
- Create: `tests/armor.test.js`
- Create: `tests/tutorials.test.js`
- Modify: `src/game/enemies.js`
- Modify: `src/game/combat.js`
- Modify: `src/game/simulation.js`
- Modify: `src/game/campaign.js`

**Step 1: Write failing armor tests**

Test heavy/prism, flux/arc, crystal/nova, and mystic/frost counter pairs; ten-percent non-counter damage; counter armor reduction; break stun and vulnerability; healer, splitter, and disruptor behaviors; first-appearance pause; tutorial acknowledgement; and no repeat tutorial after acknowledgement.

**Step 2: Verify red**

Run focused tests and confirm the armor/tutorial APIs are missing.

**Step 3: Implement armor and enemy mechanics**

Add separate armor meters, counter tags on attacks, stunned/vulnerable timers, expanded enemy definitions, milestone introduction metadata, and a `tutorial` mode that freezes simulation until acknowledged.

**Step 4: Verify green**

Run focused tests and full regression tests.

**Step 5: Commit**

```bash
git add src/game/armor.js src/game/tutorials.js src/game/enemies.js src/game/combat.js src/game/simulation.js src/game/campaign.js tests/armor.test.js tests/tutorials.test.js
git commit -m "feat: add armor counters and enemy tutorials"
```

### Task 4: Eight unlockable towers and thirty-nine research nodes

**Files:**
- Create: `src/game/research.js`
- Create: `tests/research.test.js`
- Modify: `src/game/towers.js`
- Modify: `src/game/combat.js`
- Modify: `src/game/campaign.js`
- Modify: `src/game/state.js`

**Step 1: Write failing roster and research tests**

Test thirteen definitions, unlock pairs at 10/20/30/40, Quantum Core totals, locked build rejection, three nodes per tower, prerequisites, chip spending, unavailable locked-tower research, and representative mechanics for Gravity, Solar, Drone, Corrosion, Relay, Rift, Quantum, and Singularity.

**Step 2: Verify red**

Run `npm test -- --run tests/research.test.js` and expect roster/research failures.

**Step 3: Implement data-driven unlocks and research**

Extend the tower catalog and combat dispatch, add support effects and route-aware targets, encode thirty-nine localized research records, and apply purchased modifiers when calculating live tower stats without changing in-map tower level.

**Step 4: Verify green**

Run focused and full tests.

**Step 5: Commit**

```bash
git add src/game/research.js src/game/towers.js src/game/combat.js src/game/campaign.js src/game/state.js tests/research.test.js
git commit -m "feat: expand tower roster and research lab"
```

### Task 5: Chinese-first localization and campaign UI

**Files:**
- Create: `src/i18n.js`
- Create: `tests/i18n.test.js`
- Modify: `src/ui/interface.js`
- Modify: `src/main.js`
- Modify: `src/style.css`
- Modify: `index.html`

**Step 1: Write failing localization tests**

Test Chinese default, English switching, safe Chinese fallback, interpolation, key coverage for both dictionaries, and persisted language normalization.

**Step 2: Verify red**

Run `npm test -- --run tests/i18n.test.js` and expect missing translation APIs.

**Step 3: Implement i18n and campaign screens**

Create translation dictionaries and immediate `setLanguage` updates. Rebuild UI strings around keys and add Continue/New Campaign/Level Select/Research, deployment Start Level, chapter clear, localized tutorial, language buttons on title/pause, and save feedback.

**Step 4: Verify green and browser smoke**

Run unit tests, build, and a Playwright smoke check for Chinese default, English instant switch, refresh persistence, and deployment start.

**Step 5: Commit**

```bash
git add src/i18n.js src/ui/interface.js src/main.js src/style.css index.html tests/i18n.test.js
git commit -m "feat: add bilingual campaign interface"
```

### Task 6: Multi-route rendering, tutorial focus, and research presentation

**Files:**
- Modify: `src/render/renderer.js`
- Modify: `src/render/effects.js`
- Modify: `src/ui/interface.js`
- Modify: `src/style.css`
- Modify: `src/main.js`

**Step 1: Create a failing browser scenario**

Assert that level 11 renders multiple routes, deployment prevents spawning before Start Level, a first armor enemy opens a blocking tutorial with highlighted counter, acknowledgement resumes play, and Research exposes locked/unlocked state.

**Step 2: Verify red**

Run the browser scenario and record the missing surfaces.

**Step 3: Implement campaign rendering**

Render all generated routes, entrances, themes, obstacles, multi-route enemies, armor bars/icons, deployment overlay, tutorial spotlight, chapter transition, expanded scrolling tower dock, research grid, and localized map/level labels.

**Step 4: Verify with the required web-game client**

Exercise deployment, movement, all armor counters, route branches, language switching, research, and save/continue. Inspect title, deployment, branch, tutorial, research, and combat screenshots plus text state and console output.

**Step 5: Commit**

```bash
git add src/render src/ui/interface.js src/style.css src/main.js
git commit -m "feat: render procedural campaign systems"
```

### Task 7: Chapter bosses and final victory cinematic

**Files:**
- Create: `src/game/cinematic.js`
- Create: `tests/cinematic.test.js`
- Modify: `src/game/campaign.js`
- Modify: `src/game/simulation.js`
- Modify: `src/render/renderer.js`
- Modify: `src/ui/interface.js`
- Modify: `src/audio.js`
- Modify: `src/main.js`
- Modify: `src/style.css`

**Step 1: Write failing cinematic tests**

Test chapter boss metadata, final boss completion entering cinematic mode, deterministic cinematic phases, skip/replay, Quantum Core unlocks, final overclock/challenge unlock, and eventual results mode.

**Step 2: Verify red**

Run focused tests and expect missing cinematic transitions.

**Step 3: Implement bosses and finale**

Add five milestone boss variants and a timed cinematic state machine for freeze, core orbit/assembly, tower salute, path-50 trace, guardian launch, fireworks, localized captions, result statistics, replay, skip, and challenge-mode unlock. Add matching synthesized audio cues.

**Step 4: Verify green and visually inspect**

Run focused/full tests, drive the final boss to completion, capture each major cinematic phase, inspect images, confirm skip/replay, and check for console errors.

**Step 5: Commit**

```bash
git add src/game/cinematic.js src/game/campaign.js src/game/simulation.js src/render/renderer.js src/ui/interface.js src/audio.js src/main.js src/style.css tests/cinematic.test.js
git commit -m "feat: add chapter bosses and victory finale"
```

### Task 8: Final campaign QA and documentation

**Files:**
- Modify: `README.md`
- Modify: `progress.md`

**Step 1: Run complete automated verification**

Run `npm test && npm run build` and require zero failures.

**Step 2: Run exhaustive browser QA**

Check new campaign, continue, retry, level select, deployment, recycling, procedural maps at chapter boundaries, all thirteen towers, all armor counters, tutorial pauses, research purchases, language persistence, chapter unlocks, bosses, level-fifty cinematic, skip/replay, responsive layout, text state, and console errors.

**Step 3: Inspect visual artifacts**

Open final screenshots for Chinese title, English title, deployment, branched map, each armor tutorial, research lab, chapter unlock, boss combat, cinematic phases, victory results, and defeat/retry.

**Step 4: Update documentation**

Document campaign structure, save behavior, language controls, armor counters, thirteen towers, research, map generation, and verification evidence. Append completed work and optional balance-tuning notes to `progress.md`.

**Step 5: Commit**

```bash
git add README.md progress.md
git commit -m "docs: document fifty-level campaign"
```
