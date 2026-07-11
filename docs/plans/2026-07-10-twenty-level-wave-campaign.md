# Twenty-Level Multi-Wave Campaign Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rebuild the campaign as twenty levels containing ten to thirty persistent waves per level, with full-arena procedural routes and chapter transition cinematics.

**Architecture:** Introduce a pure stage-definition module and separate the stage lifecycle from the wave lifecycle. A stage owns map, towers, funds, core health, retry state, and settlement; a wave owns only spawn composition and the active/countdown transition. Preserve the existing fixed-step Canvas runtime, localization system, research catalog, save adapter, and deterministic map seed strategy.

**Tech Stack:** Vanilla JavaScript ES modules, HTML Canvas 2D, Vite, Vitest, localStorage, Web Audio, and Playwright web-game QA.

---

### Task 1: Twenty-level stage definitions and save migration

**Files:**
- Create: `src/game/stages.js`
- Create: `tests/stages.test.js`
- Modify: `src/game/campaign.js`
- Modify: `src/game/research.js`
- Modify: `src/game/save.js`
- Modify: `tests/campaign.test.js`
- Modify: `tests/save.test.js`

**Step 1: Write the failing stage-definition tests**

Add tests that require twenty levels, five four-level chapters, wave-count steps of 10/15/20/25/30, bosses at 4/8/12/16/20, and unlocks after 4/8/12/16.

```js
expect(LEVEL_COUNT).toBe(20);
expect(getStageDefinition(1)).toMatchObject({ chapter: 1, waveCount: 10, boss: false });
expect(getStageDefinition(4)).toMatchObject({ chapter: 1, waveCount: 10, boss: true });
expect(getStageDefinition(8)).toMatchObject({ chapter: 2, waveCount: 15, boss: true });
expect(getStageDefinition(20)).toMatchObject({ chapter: 5, waveCount: 30, boss: true });
expect(CHAPTER_TOWER_UNLOCKS[4]).toEqual(['gravity', 'solar']);
```

**Step 2: Write failing save-migration tests**

Require save schema version 2 and proportional migration of old milestones while preserving permanent data.

```js
const migrated = parseSave(JSON.stringify({
  version: 1,
  currentLevel: 31,
  highestCleared: 30,
  language: 'en',
  research: ['pulse-1'],
  coreChips: 22,
}));
expect(migrated).toMatchObject({ version: 2, currentLevel: 13, highestCleared: 12, language: 'en', coreChips: 22 });
expect(migrated.research).toEqual(['pulse-1']);
```

**Step 3: Run the focused tests and verify red**

Run:

```bash
npm test -- --run tests/stages.test.js tests/campaign.test.js tests/save.test.js
```

Expected: FAIL because `stages.js`, the twenty-level definitions, and version-2 migration do not exist.

**Step 4: Implement the pure stage catalog**

Create `src/game/stages.js` with `LEVEL_COUNT = 20`, `LEVELS_PER_CHAPTER = 4`, `CHAPTER_WAVE_COUNTS = [10, 15, 20, 25, 30]`, boss metadata, and `getStageDefinition(level)`. Move stage-count and chapter-unlock constants out of `campaign.js` so `campaign.js`, `waves.js`, saves, UI, and tests share one source of truth.

**Step 5: Implement version-2 normalization and migration**

Map old progress with `Math.ceil(oldLevel * 20 / 50)` for current level and `Math.floor(oldHighest * 20 / 50)` for cleared progress. Preserve language, funds, research, chips, cores, tutorials, statistics, challenge state, and unlocks; recompute missing unlocks from migrated progress.

**Step 6: Run focused and full tests**

Run:

```bash
npm test -- --run tests/stages.test.js tests/campaign.test.js tests/save.test.js
npm test
```

Expected: all tests pass with no references expecting fifty campaign levels.

**Step 7: Commit**

```bash
git add src/game/stages.js src/game/campaign.js src/game/research.js src/game/save.js tests/stages.test.js tests/campaign.test.js tests/save.test.js
git commit -m "refactor: separate twenty-level stage definitions"
```

### Task 2: Nested stage and wave lifecycle

**Files:**
- Modify: `src/game/state.js`
- Modify: `src/game/campaign.js`
- Modify: `src/game/waves.js`
- Modify: `src/game/simulation.js`
- Modify: `tests/state.test.js`
- Modify: `tests/campaign.test.js`
- Modify: `tests/simulation.test.js`

**Step 1: Write failing lifecycle tests**

Require deployment to initialize `wave.index = 0` and `wave.total` from the stage definition. Require Wave 1 to start explicitly, a non-final clear to enter `wave-countdown`, and a final clear to enter level completion.

```js
prepareLevel(state, campaign);
expect(state.wave).toMatchObject({ index: 0, total: 10, active: false });
startAssault(state);
expect(state.wave.index).toBe(1);
state.wave.spawnQueue = [];
state.enemies = [];
updateWaveState(state, 1 / 60);
expect(state.mode).toBe('wave-countdown');
expect(state.wave.index).toBe(1);
expect(state.towers).toEqual(existingTowers);
```

Add coverage that countdown expiry and `launchNextWaveEarly` both start `wave.index + 1` without replacing the map, energy, towers, base health, score, or kills.

**Step 2: Run focused tests and verify red**

```bash
npm test -- --run tests/state.test.js tests/campaign.test.js tests/simulation.test.js
```

Expected: FAIL because the current implementation treats the campaign level as the wave index and opens `level-clear` after one wave.

**Step 3: Replace the wave state shape**

Use:

```js
{
  index: 0,
  total: getStageDefinition(level).waveCount,
  active: false,
  completed: false,
  countdown: 0,
  spawnQueue: [],
  spawnTimer: 0,
  preview: [],
}
```

`startAssault` begins Wave 1. `beginWave(state, waveNumber)` validates against `state.wave.total`, not a global campaign array.

**Step 4: Implement inter-wave countdown**

On a non-final clear, remove transient enemies/projectiles, set `mode = 'wave-countdown'`, set a five-second countdown, and populate the next-wave preview. Permit player movement, building, upgrades, and selling during this mode; suspend enemy and tower combat. Countdown expiry calls `beginWave` automatically. `launchNextWaveEarly` skips the remaining wait without an economy bonus.

**Step 5: Implement final-wave completion**

Only when `wave.index === wave.total` may the state enter level settlement or a chapter/final cinematic. Do not clear towers before the stage settlement snapshots their Sell values.

**Step 6: Run focused and full tests**

```bash
npm test -- --run tests/state.test.js tests/campaign.test.js tests/simulation.test.js
npm test
```

**Step 7: Commit**

```bash
git add src/game/state.js src/game/campaign.js src/game/waves.js src/game/simulation.js tests/state.test.js tests/campaign.test.js tests/simulation.test.js
git commit -m "refactor: add persistent multi-wave stage lifecycle"
```

### Task 3: Wave composition, scaling, and boss scheduling

**Files:**
- Modify: `src/game/waves.js`
- Modify: `src/game/enemies.js`
- Modify: `src/game/cinematic.js`
- Modify: `tests/simulation.test.js`
- Modify: `tests/armor.test.js`
- Modify: `tests/cinematic.test.js`

**Step 1: Write failing composition tests**

Add tests for `createSpawnQueue(level, wave, totalWaves)` that compare early, middle, and late wave budgets. Require the final wave of levels 4/8/12/16/20 to contain the correct boss and prohibit bosses on other waves.

```js
expect(createSpawnQueue(1, 1, 10).length).toBeLessThan(createSpawnQueue(1, 10, 10).length);
expect(createSpawnQueue(4, 10, 10).some(entry => entry.type === 'boss-overdrive')).toBe(true);
expect(createSpawnQueue(4, 9, 10).some(entry => entry.type.startsWith('boss'))).toBe(false);
```

Require enemy health and armor to increase with both level number and normalized wave progress while maintaining Challenge Loop scaling.

**Step 2: Run focused tests and verify red**

```bash
npm test -- --run tests/simulation.test.js tests/armor.test.js tests/cinematic.test.js
```

Expected: FAIL because composition currently accepts one global wave number and boss metadata still uses old levels.

**Step 3: Implement phase-based wave budgets**

Calculate `progress = wave / totalWaves`. Use early/middle/late composition gates, level-scaled group budgets, and deterministic group selection. Keep the existing enemy identities and ensure heavy/flux/crystal/mystic armor introductions occur only after Prism/Arc/Nova/Frost are available.

**Step 4: Move boss metadata to levels 4/8/12/16/20**

Retain five distinct boss variants and mechanics. Schedule them only in the final wave of their chapter-ending level. Non-boss levels receive a late elite group instead.

**Step 5: Apply stage and wave scaling at spawn time**

Store the active wave difficulty on the state or pass it into `spawnEnemy`. Scale health, armor, speed, reward, and spawn pressure from level plus normalized wave progress. Avoid double-scaling boss base stats.

**Step 6: Run focused and full tests**

```bash
npm test -- --run tests/simulation.test.js tests/armor.test.js tests/cinematic.test.js
npm test
```

**Step 7: Commit**

```bash
git add src/game/waves.js src/game/enemies.js src/game/cinematic.js tests/simulation.test.js tests/armor.test.js tests/cinematic.test.js
git commit -m "feat: scale enemy assaults across stage waves"
```

### Task 4: Level settlement, recycling, and full-level retry

**Files:**
- Modify: `src/game/campaign.js`
- Modify: `src/game/save.js`
- Modify: `src/main.js`
- Modify: `tests/campaign.test.js`
- Modify: `tests/save.test.js`

**Step 1: Write failing persistence tests**

Require towers, tower levels, energy, map id, and damaged base health to remain unchanged after a normal wave. Require final-wave settlement to recycle towers exactly once, reset the next level's base, and generate a different deterministic map.

Require retry to restore `levelStartFunds`, Wave 1 deployment, full core health, zero towers, and the same map id.

**Step 2: Run focused tests and verify red**

```bash
npm test -- --run tests/campaign.test.js tests/save.test.js
```

Expected: FAIL until stage attempts and wave completion are separated.

**Step 3: Make settlement stage-only**

Guard `settleLevel` so it runs only after the final wave. Calculate recycled Sell value, unspent funds, clear reward, and performance bonus; advance one of twenty levels; update chapter unlocks and persistent rewards; then clear towers for the next map.

**Step 4: Save only durable attempt boundaries**

Persist campaign progress at deployment start and stage clear. Do not serialize active towers or temporary wave funds. A browser refresh during combat therefore calls `prepareLevel` with saved level-start funds and restarts at Wave 1.

**Step 5: Update main-loop transition handling**

Replace the old `playing -> level-clear` assumption with explicit final-wave and cinematic transitions. Ensure a stage result is settled once even when a cinematic begins before the result screen.

**Step 6: Run focused and full tests**

```bash
npm test -- --run tests/campaign.test.js tests/save.test.js
npm test
```

**Step 7: Commit**

```bash
git add src/game/campaign.js src/game/save.js src/main.js tests/campaign.test.js tests/save.test.js
git commit -m "fix: settle economy only after the final wave"
```

### Task 5: Full-arena procedural route grammars

**Files:**
- Modify: `src/game/maps.js`
- Modify: `src/game/geometry.js`
- Modify: `src/render/renderer.js`
- Modify: `src/game/towers.js`
- Modify: `tests/maps.test.js`
- Modify: `tests/towers.test.js`

**Step 1: Write failing map tests**

For every level across multiple seeds, require route validation, a right-side core, deterministic equality, meaningful seed variation, and at least one route point below `y = 575`.

Require chapter portal patterns:

```js
expect(createCampaignMap(1, seed).portals.map(p => p.edge)).toEqual(['left']);
expect(createCampaignMap(9, seed).portals.map(p => p.edge)).toEqual(expect.arrayContaining(['left', 'top']));
expect(createCampaignMap(17, seed).portals.map(p => p.edge)).toEqual(expect.arrayContaining(['left', 'top', 'bottom']));
```

Also assert minimum route length, diagonal-segment presence, buildable sample count, and shared core connectivity.

**Step 2: Run map tests and verify red**

```bash
npm test -- --run tests/maps.test.js tests/towers.test.js
```

Expected: FAIL because current routes stop near `y = 545`, use fixed left portals, and are mostly short orthogonal templates.

**Step 3: Implement five constrained route grammars**

Generate anchors in `y = 70..620`, reserve only the bottom dock safety strip, vary the right-side core y-position, and create the confirmed single-snake, split/rejoin, left+top dual, asymmetric upper/lower, and left+top+bottom convergence grammars. Include diagonal segments and longer reversals without self-blocking the build area.

**Step 4: Strengthen deterministic validation**

Validate endpoints, core convergence, length, lower-arena coverage, segment spacing, portal edge declarations, and at least the existing minimum buildable sample count. Deterministically reroll invalid candidates with a bounded attempt count and a known-safe fallback.

**Step 5: Update rendering and placement**

Render `map.core` and `map.portals`, preserve rounded line joins, and make route colors readable across all chapter themes. Update placement distance checks to cover every route and the expanded lower arena while keeping the dock safe.

**Step 6: Run focused and full tests**

```bash
npm test -- --run tests/maps.test.js tests/towers.test.js
npm test
```

**Step 7: Commit**

```bash
git add src/game/maps.js src/game/geometry.js src/render/renderer.js src/game/towers.js tests/maps.test.js tests/towers.test.js
git commit -m "feat: generate full-arena multi-entry routes"
```

### Task 6: Level/Wave UI, countdown controls, and localization

**Files:**
- Modify: `src/ui/interface.js`
- Modify: `src/main.js`
- Modify: `src/i18n.js`
- Modify: `src/style.css`
- Modify: `tests/i18n.test.js`
- Modify: `tests/responsive.test.js`

**Step 1: Write failing localization tests**

Require distinct Chinese and English keys for Level, Wave, next-wave countdown, Start Now, enemy preview, total waves, and twenty-level selection. Assert no shared UI string formats Wave as a campaign level.

**Step 2: Run focused tests and verify red**

```bash
npm test -- --run tests/i18n.test.js tests/responsive.test.js
```

Expected: FAIL because the HUD and deployment screen currently expose only `currentLevel / 50`.

**Step 3: Update the HUD and deployment screen**

Show `Level X / 20` and `Wave Y / N` in separate metrics. Deployment shows chapter, level, total waves, and map seed. Add Wave information to `window.render_game_to_text`.

**Step 4: Add countdown and Start Now UI**

Create a compact countdown panel visible only in `wave-countdown`. Show seconds, next wave number, localized enemy preview icons/names, and a Start Now button wired to `launchNextWaveEarly`. Keep build controls active during countdown.

**Step 5: Convert Level Select and results to twenty levels**

Render twenty cards, chapter/boss markers, and the total wave count for each card. Update victory, continue metadata, results, and challenge copy.

**Step 6: Verify responsive behavior in browser sizes**

Use the existing responsive fitter and assert that the added Wave metric and countdown panel remain inside the game shell at 1616×810, 1280×720, 900×600, and 800×500.

**Step 7: Run focused and full tests**

```bash
npm test -- --run tests/i18n.test.js tests/responsive.test.js
npm test
npm run build
```

**Step 8: Commit**

```bash
git add src/ui/interface.js src/main.js src/i18n.js src/style.css tests/i18n.test.js tests/responsive.test.js
git commit -m "feat: distinguish levels and waves in the interface"
```

### Task 7: Chapter transition cinematics

**Files:**
- Modify: `src/game/cinematic.js`
- Modify: `src/game/simulation.js`
- Modify: `src/render/renderer.js`
- Modify: `src/ui/interface.js`
- Modify: `src/audio.js`
- Modify: `src/main.js`
- Modify: `src/style.css`
- Modify: `tests/cinematic.test.js`

**Step 1: Write failing chapter-cinematic tests**

Require levels 4/8/12/16 to enter a skippable chapter cinematic after their final wave, snapshot towers before recycling, reveal exactly two tower types, install the correct Quantum Core, and finish in the next level's deployment. Require level 20 to use the full finale instead.

**Step 2: Run focused tests and verify red**

```bash
npm test -- --run tests/cinematic.test.js tests/simulation.test.js
```

Expected: FAIL because only the level-50 finale exists.

**Step 3: Add a short deterministic chapter state machine**

Use phases such as `boss-break`, `core-flight`, `tower-reveal`, and `chapter-preview` with a total duration near five seconds. Store cleared level, next chapter theme, unlocked tower types, tower snapshot, and skippable status.

**Step 4: Integrate settlement and automatic next deployment**

Settle the level exactly once as the cinematic begins, preserving the tower snapshot for rendering. At completion or skip, call the main transition into the next level's deployment and save durable progress. Keep level 20 routed to the longer final cinematic and victory result.

**Step 5: Render and localize the reveal**

Draw boss fragments, a Quantum Core flight path, two tower silhouettes with localized names, and the next chapter palette/route motif. Add short synthesized audio accents without external assets.

**Step 6: Run focused/full tests and visual phase capture**

```bash
npm test -- --run tests/cinematic.test.js tests/simulation.test.js
npm test
npm run build
```

Capture and inspect each short cinematic phase plus skip behavior.

**Step 7: Commit**

```bash
git add src/game/cinematic.js src/game/simulation.js src/render/renderer.js src/ui/interface.js src/audio.js src/main.js src/style.css tests/cinematic.test.js tests/simulation.test.js
git commit -m "feat: add chapter transition cinematics"
```

### Task 8: End-to-end campaign QA and documentation

**Files:**
- Modify: `README.md`
- Modify: `progress.md`

**Step 1: Run complete automated verification**

```bash
npm test
npm run build
git diff --check
```

Expected: zero failures, a successful Vite production bundle, and no whitespace errors.

**Step 2: Run the required web-game client**

Use `/Users/frankcj/.codex/skills/develop-web-game/scripts/web_game_playwright_client.js` with short action bursts. Verify deployment, movement, building, Wave 1, non-final clear, countdown, Start Now, retained towers, and the next wave on the same map.

**Step 3: Run exhaustive browser scenarios**

Verify:

- all five wave-count tiers;
- damaged core and upgraded towers persisting across waves;
- full-level retry from Wave 1;
- Sell-value recycling and a new map at the next level;
- lower-half route use and left/top/bottom portals;
- first-armor tutorial pause/resume;
- level 4 boss, short cinematic, Quantum Core, and two-tower unlock;
- level 20 boss and full finale;
- save migration, refresh behavior, Chinese/English persistence, Level Select, Challenge Loop, fullscreen, and live browser resizing;
- `render_game_to_text` parity and zero console/page errors.

**Step 4: Inspect visual artifacts**

Open screenshots for title, deployment, upper/lower snake, split routes, top portal, bottom portal, active combat, inter-wave countdown, armor tutorial, chapter boss, each short cinematic phase, tower reveal, next chapter deployment, final cinematic, victory, defeat, and 800×500 responsive layout.

**Step 5: Update documentation and progress**

Replace fifty-level wording with the twenty-level multi-wave model. Document wave counts, intra-level persistence, stage recycling, retry behavior, chapter maps, chapter cinematics, save migration, and verified commands. Keep the original prompt at the top of `progress.md`.

**Step 6: Commit**

```bash
git add README.md progress.md
git commit -m "docs: document multi-wave campaign progression"
```

**Step 7: Final verification and integration**

Read and follow `verification-before-completion` and `finishing-a-development-branch`. Re-run tests and build after merging to `main`, remove the feature worktree, delete the merged branch, push `main`, and verify the remote commit matches local HEAD.
