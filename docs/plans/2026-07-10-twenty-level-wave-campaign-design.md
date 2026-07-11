# Twenty-Level Multi-Wave Campaign Redesign

## Goal

Replace the mistaken one-wave-per-level campaign with a true two-layer tower-defence structure: twenty levels, each containing ten to thirty waves. A level owns its map, towers, temporary upgrades, funds, and core health; waves are enemy assaults inside that level. Only completing the final wave clears the level.

## Campaign structure

The campaign contains twenty levels divided into five chapters of four levels.

| Chapter | Levels | Waves per level | Boss level | Tower unlock after boss |
| --- | --- | ---: | ---: | --- |
| 1 | 1–4 | 10 | 4 | Gravity Well, Solar Lance |
| 2 | 5–8 | 15 | 8 | Drone Hive, Corrosion Forge |
| 3 | 9–12 | 20 | 12 | Resonance Relay, Rift Gate |
| 4 | 13–16 | 25 | 16 | Quantum Splitter, Singularity Cannon |
| 5 | 17–20 | 30 | 20 | Final Overclock and Challenge Loop |

Levels 4, 8, 12, 16, and 20 are chapter boss encounters. The final wave of those levels contains the chapter boss. Other levels end with an elite climax wave.

## Two-layer state machine

`Stage` owns the level lifecycle: deployment, map, stage-start funds, core health, towers, temporary upgrades, total waves, level clear, recycling, unlocks, chapter transitions, and failure.

`Wave` owns only the current assault: wave number, spawn composition, queue, timers, active enemies, completion, and the inter-wave countdown.

The primary flow is:

1. Generate a level map and enter deployment.
2. Player builds and explicitly starts Wave 1.
3. Clearing a non-final wave enters a five-second preparation countdown.
4. During the countdown the player may move, build, upgrade, and sell.
5. The next wave begins automatically when the countdown expires; an optional Start Now action skips the remaining wait.
6. Clearing the final wave opens level settlement.
7. Towers recycle, rewards apply, the next map generates, and the next level enters deployment.

The HUD always displays both progress layers, for example `Level 7 / 20` and `Wave 12 / 15`.

## In-level persistence and economy

Within one level, all of the following persist across waves:

- generated map and route layout;
- placed towers and their in-level upgrades;
- unspent funds and kill rewards;
- core health and accumulated leaks;
- score, kills, and temporary combat state that is safe to carry forward.

The core does not heal between waves. Enemies and projectiles from a cleared wave are removed before the preparation countdown.

On level clear, every tower is automatically recycled at its displayed Sell value. The next level starts with unspent funds, tower recycling, the clear reward, and performance bonuses. The map changes, the core returns to full health, and all towers and in-level upgrades disappear.

Permanent research, Core Chips, Quantum Cores, language, tower unlocks, campaign statistics, Final Overclock, and Challenge Loop status persist across levels.

Failure restarts the entire current level at Wave 1 using the saved level-start funds and deterministic map seed. Funds, towers, and rewards earned during the failed attempt are discarded. Refreshing during an active attempt follows the same rule.

## Wave generation and difficulty

Wave composition is generated from both the current level and normalized progress within that level.

- First 30%: establish the level's base enemy composition.
- Middle 40%: add runners, swarms, armor, and denser combinations.
- Final 30%: add healers, splitters, disruptors, elites, and counter-pressure groups.
- Final wave: elite assault, or the chapter boss on levels 4, 8, 12, 16, and 20.

Health, armor, speed, group budget, spawn density, and rewards scale from the level number plus `currentWave / totalWaves`. Armor families never appear before their counter tower is available. The first encounter with each armor family still pauses the game for its localized counter tutorial.

## Map redesign

The core remains on the right side, with a variable vertical position. Portals may appear on the left, top, or bottom edges. Routes use approximately `Y=70–620`, reserving only the minimum bottom UI safety strip.

Routes use longer constrained grammars with rounded corners, diagonal segments, reversals, branches, re-joins, asymmetric lengths, and multi-entry convergence. Map generation remains deterministic by campaign seed, challenge cycle, and level.

Chapter grammars:

1. A long single-entry snake crosses both upper and lower halves.
2. One entry splits into distinct upper and lower branches before rejoining.
3. Left and top portals create two independent lanes toward the core.
4. A short fast upper route contrasts with a long dense lower route.
5. Left, top, and bottom portals use three routes with multiple convergence points.

Validation checks route connectivity, endpoint placement, route length, segment spacing, buildable sample count, safe UI margins, and lower-arena usage. Invalid candidates reroll deterministically. Deployment and build UI avoid covering critical lower-route information.

## Chapter and final cinematics

Clearing levels 4, 8, 12, and 16 plays a skippable animation of roughly five seconds:

- the boss disintegrates geometrically;
- a Quantum Core is released and installed in the base;
- two newly unlocked towers appear as neon silhouettes and reveal their names;
- the palette and route motif preview the next chapter;
- the next level then enters deployment.

Level 20 keeps the longer final cinematic, Final Overclock unlock, finale replay, and Challenge Loop entry.

## UI and localization

- Campaign screens and Level Select use twenty levels.
- Level cards show their total wave count and boss status.
- Deployment shows chapter, level, total waves, and map seed.
- Combat HUD shows level and wave separately.
- Inter-wave UI shows countdown, next-wave enemy preview, and Start Now.
- Level settlement appears only after the final wave.
- Chinese and English dictionaries use distinct Level and Wave terminology throughout.

## Save migration

The save schema advances to a new version. Existing fifty-level progress maps proportionally to twenty levels so the old unlock milestones remain equivalent:

- old 10 maps to new 4;
- old 20 maps to new 8;
- old 30 maps to new 12;
- old 40 maps to new 16;
- old 50 maps to new 20.

Language, research, chips, cores, statistics, challenge state, and unlocked towers are preserved. Active maps, towers, and temporary combat state are not migrated. Corrupted saves fall back to a safe new campaign.

## Verification

Unit tests cover twenty level definitions, chapter wave counts, nested stage/wave transitions, countdown and Start Now, tower persistence between waves, core-health persistence, level recycling, full-level retry, unlock gates, boss placement, difficulty growth, save migration, and deterministic map validation across many seeds.

Browser QA covers deployment, several consecutive waves on one map, retained towers and health, level settlement, a new map on the next level, lower-arena routes, multi-edge portals, chapter animations, tower unlock reveals, Chinese and English UI, Level Select, failure restart, responsive resizing, final cinematic, console errors, and text-state parity.
