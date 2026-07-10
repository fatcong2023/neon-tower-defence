# Neon Tower Defence Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Build a polished top-down ten-wave tower-defence game in which a mobile guardian shoots enemies, builds five three-level tower types, and protects a crystal base.

**Architecture:** Use a deterministic pure-JavaScript simulation behind a single HTML Canvas, with small DOM overlays for menus and accessible controls. Keep balance data separate from simulation behavior, and keep rendering/audio effects outside the authoritative state so rules can be unit tested without a browser.

**Tech Stack:** Vite, vanilla JavaScript ES modules, HTML Canvas 2D, Web Audio, Vitest, and Playwright-based browser interaction.

---

### Task 1: Scaffold the application and deterministic game-state core

**Files:**
- Create: `package.json`
- Create: `index.html`
- Create: `src/style.css`
- Create: `src/main.js`
- Create: `src/game/config.js`
- Create: `src/game/state.js`
- Create: `tests/state.test.js`
- Create: `progress.md`

**Step 1: Write the failing test**

Create tests asserting that `createInitialState()` starts in the title mode and `startRun()` creates a playing state with full base health, starting energy, wave zero, and no towers or enemies.

**Step 2: Run test to verify it fails**

Run: `npm test -- --run tests/state.test.js`

Expected: FAIL because `src/game/state.js` does not exist.

**Step 3: Write minimal implementation**

Add the Vite/Vitest scripts, app shell, logical canvas constants, and pure constructors required by the test. Add `Original prompt: can you build a web game, tower defence, with a movable main character that can build defence towers. there are 5 kinds of towers, single attack and area attack, all of them are upgradable` at the top of `progress.md`.

**Step 4: Run test to verify it passes**

Run: `npm test -- --run tests/state.test.js`

Expected: PASS.

**Step 5: Commit**

```bash
git add package.json index.html src tests progress.md
git commit -m "feat: scaffold deterministic game state"
```

### Task 2: Implement tower data, placement, upgrades, and economy

**Files:**
- Create: `src/game/towers.js`
- Create: `src/game/geometry.js`
- Create: `tests/towers.test.js`
- Modify: `src/game/state.js`

**Step 1: Write the failing tests**

Test that the five tower definitions exist with three levels; placement rejects the path, boundaries, overlapping towers, excessive guardian distance, and insufficient energy; successful building deducts cost; upgrades advance one level and charge the correct amount; selling refunds a defined fraction of total investment.

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/towers.test.js`

Expected: FAIL because tower APIs are missing.

**Step 3: Write minimal implementation**

Add `TOWER_TYPES`, level stats, winding path geometry, distance helpers, `validatePlacement`, `buildTower`, `upgradeTower`, and `sellTower`. Return explicit reason codes for invalid actions so UI feedback stays consistent.

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run tests/towers.test.js`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/game/towers.js src/game/geometry.js src/game/state.js tests/towers.test.js
git commit -m "feat: add tower building and upgrade economy"
```

### Task 3: Implement path movement, enemies, waves, and terminal states

**Files:**
- Create: `src/game/enemies.js`
- Create: `src/game/waves.js`
- Create: `src/game/simulation.js`
- Create: `tests/simulation.test.js`

**Step 1: Write the failing tests**

Test path interpolation, enemy spawning, enemy progress, base damage on escape, kill rewards, slowing, shields, countdown transitions, ten authored waves, boss presence on wave ten, victory after the last enemy, and defeat at zero base health.

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/simulation.test.js`

Expected: FAIL because the simulation modules are missing.

**Step 3: Write minimal implementation**

Add enemy archetypes, authored wave composition, spawn scheduling, fixed-step updates, status timers, reward handling, and win/lose transitions. Keep random variation seeded or cosmetic-only.

**Step 4: Run tests to verify they pass**

Run: `npm test -- --run tests/simulation.test.js`

Expected: PASS.

**Step 5: Commit**

```bash
git add src/game/enemies.js src/game/waves.js src/game/simulation.js tests/simulation.test.js
git commit -m "feat: add enemies and ten-wave progression"
```

### Task 4: Implement all tower attacks and guardian combat

**Files:**
- Modify: `src/game/simulation.js`
- Create: `src/game/combat.js`
- Create: `src/game/player.js`
- Create: `tests/combat.test.js`

**Step 1: Write the failing tests**

Test Pulse rapid targeting, Prism heavy long-range targeting, Arc chain limits, Nova splash radius, Frost pulse damage and slow, guardian movement boundaries, blaster cooldown, and dash cooldown/distance.

**Step 2: Run tests to verify they fail**

Run: `npm test -- --run tests/combat.test.js`

Expected: FAIL because combat APIs are missing.

**Step 3: Write minimal implementation**

Add deterministic targeting, projectiles, area resolution, status application, guardian input intentions, movement, aiming, shooting, and dashing. Emit short-lived effect events for the renderer without coupling visual state to combat outcomes.

**Step 4: Run all unit tests**

Run: `npm test`

Expected: all tests PASS with no warnings.

**Step 5: Commit**

```bash
git add src/game/simulation.js src/game/combat.js src/game/player.js tests/combat.test.js
git commit -m "feat: implement guardian and tower combat"
```

### Task 5: Build the neon Canvas renderer and responsive interface

**Files:**
- Create: `src/render/renderer.js`
- Create: `src/render/effects.js`
- Create: `src/ui/interface.js`
- Create: `src/input.js`
- Modify: `src/main.js`
- Modify: `src/style.css`
- Modify: `index.html`

**Step 1: Add a failing browser smoke assertion**

Create a minimal browser assertion through the provided web-game client that expects a visible canvas plus `window.render_game_to_text` and `window.advanceTime` functions.

**Step 2: Run it to verify it fails**

Run the Vite server and the web-game Playwright client against `http://localhost:5173`.

Expected: FAIL because the interactive runtime hooks do not exist.

**Step 3: Implement the playable interface**

Render the arena grid, path, base, guardian, enemies, five tower geometries, projectiles, ranges, placement ghost, particles, damage text, shockwaves, HUD, build dock, contextual upgrade/sell panel, title/tutorial UI, pause, wave banners, boss warning, victory, and defeat. Scale from a fixed 1280x720 logical coordinate system and translate mouse positions correctly.

**Step 4: Run browser interaction scenarios**

Exercise start, move, aim, fire, dash, select tower by keys and dock, valid/invalid placement, select tower, upgrade, sell, cancel, pause/resume, restart, mute, and fullscreen. Inspect gameplay screenshots and text state after each meaningful burst.

Expected: visuals match state; controls work; no console errors.

**Step 5: Commit**

```bash
git add index.html src
git commit -m "feat: add neon canvas gameplay interface"
```

### Task 6: Add synthesized audio and final game feel

**Files:**
- Create: `src/audio.js`
- Modify: `src/main.js`
- Modify: `src/render/effects.js`
- Modify: `src/render/renderer.js`

**Step 1: Add a failing unit test for audio preference state**

Test that mute toggling is stable, survives run resets, and never changes authoritative combat state.

**Step 2: Run it to verify it fails**

Run: `npm test`

Expected: FAIL because audio preference handling is missing.

**Step 3: Implement audio and polish**

Add lazy Web Audio initialization and distinct oscillator/noise cues for UI, shots, hits, builds, upgrades, waves, boss, victory, and defeat. Add restrained screen shake, recoil, hit-stop-like visual emphasis, combo-like score feedback, and richer transition animation without changing simulation timing.

**Step 4: Re-run unit and browser tests**

Run: `npm test`, then run the web-game Playwright client across title, combat, upgrades, boss, victory, and defeat scenarios.

Expected: tests PASS; no unhandled audio errors; mute works; screenshots remain readable.

**Step 5: Commit**

```bash
git add src tests
git commit -m "feat: polish audio and combat feedback"
```

### Task 7: Final verification and handoff

**Files:**
- Modify: `progress.md`
- Create: `README.md`

**Step 1: Run the full automated suite**

Run: `npm test && npm run build`

Expected: all tests PASS and Vite production build succeeds.

**Step 2: Perform exhaustive browser QA**

Use short deterministic input bursts and resets between scenarios. Verify all five tower types at all levels, all enemy archetypes, the boss, victory, defeat, resource changes, base damage, movement boundaries, pause/restart, mute, fullscreen, and resize. Open and inspect final gameplay screenshots. Review text-state output and console messages.

**Step 3: Document the project**

Add installation, commands, controls, tower roster, gameplay rules, and architecture notes to `README.md`. Append completed checks, remaining tuning ideas, and the final validation commands to `progress.md`.

**Step 4: Commit**

```bash
git add README.md progress.md
git commit -m "docs: add game guide and verification notes"
```
