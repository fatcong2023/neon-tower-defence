# Fifty-Level Campaign Expansion Design

## Vision

Expand Neon Tower Defence from a ten-wave run into a replayable fifty-level campaign with a new deterministic procedural map on every level, five ten-level chapters, armor-counter enemies, thirteen total towers, persistent research, bilingual UI, chapter unlocks, and a celebratory level-fifty finale.

## Campaign structure

- Fifty levels split into five chapters of ten.
- Levels 5, 15, 25, 35, and 45 are elite encounters.
- Levels 10, 20, 30, 40, and 50 are bosses.
- Each level is one complete assault on a newly generated map.
- The game autosaves after every clear and exposes Continue, Level Select, New Campaign, and Research from the title screen.
- A failed level restores the funds and map seed from the start of that level.

## Deployment and economy

Every level opens in a deployment phase. The guardian may move, build, upgrade, sell, and reposition defenses without enemies or a timer. The assault starts only when the player chooses Start Level.

At clear, all towers are automatically recycled. The next level begins with current unspent energy plus the sum of each tower's displayed sell value, a base clear reward, and performance bonuses for core integrity and zero leaks. Tower positions and in-map levels never carry between maps; all newly built towers begin at level one.

Core Chips are earned from level performance and spent in the Neon Lab. Permanent research enhances tower identity, targeting, counters, and special effects without automatically raising a tower's in-map level.

## Procedural maps

Maps use a deterministic seed derived from campaign slot and level number. Reloading or retrying a level produces the same map.

- Levels 1–10 use a single route.
- Levels 11–20 may split and rejoin.
- Levels 21–30 introduce dual entrances or parallel routes.
- Levels 31–40 use asymmetric short-fast and long-dense routes.
- Levels 41–50 combine dual entrances, branches, reunions, and special build zones.

The generator uses constrained grid anchors and route grammars rather than unrestricted randomness. It validates route connectivity, total length, segment separation, entry/core distance, branch balance, sufficient buildable area, and non-overlapping blocking geometry. Invalid candidates are deterministically rerolled. Theme hue, grid treatment, obstacles, and ambient animation vary by chapter and seed.

## Enemy and armor counters

The enemy roster expands with runners, swarms, tanks, healers, splitters, disruptors, elite variants, and chapter bosses.

Four armor families require a direct tower counter:

| Armor | Counter | Behavior |
| --- | --- | --- |
| Heavy plating | Prism Cannon | High-impact shots strip plating |
| Flux shield | Arc Coil | Electrical discharge collapses shield energy |
| Crystal shell | Nova Mortar | Explosions fracture the shell |
| Mystic ward | Frost Beacon | Cold buildup freezes and shatters the ward |

Non-counter damage deals only ten percent damage while special armor remains. Counter hits reduce a separate armor meter. Breaking armor briefly stuns the enemy and applies vulnerability so every tower can deal full damage.

Before each armor family or major enemy mechanic appears for the first time, the game pauses, focuses the enemy, presents a localized tutorial card, highlights the recommended counter, and resumes only after acknowledgement.

## Tower unlocks

The five original towers remain available at level one. Boss Quantum Cores unlock two towers after levels 10, 20, 30, and 40:

- Level 10: Gravity Well and Solar Lance.
- Level 20: Drone Hive and Corrosion Forge.
- Level 30: Resonance Relay and Rift Gate.
- Level 40: Quantum Splitter and Singularity Cannon.
- Level 50: final Quantum Core unlocks a campaign overclock, victory replay, and challenge mode.

The expanded towers cover crowd grouping, line damage, anti-healing, cross-route response, universal armor erosion, tower support, route rollback, multi-route attacks, and expensive endgame damage.

## Research

Each of the thirteen towers has three data-driven research nodes, for thirty-nine total nodes. Nodes cost Core Chips and form a short prerequisite chain per tower. Locked towers expose their future research as a preview but cannot purchase it before the relevant Quantum Core unlock.

The Neon Lab is accessible from the title screen and every level-clear screen. Research and unlocks persist in browser storage.

## Difficulty

Level definitions are generated from monotonic budgets controlling enemy count, health, speed, armor, spawn density, and composition. Authored milestone rules introduce new mechanics and bespoke bosses. Difficulty scoring accounts for route length, route count, branch asymmetry, available tower roster, and counter availability. An armor family never appears before its counter is available.

## Final victory animation

When the level-fifty boss dies, simulation enters a skippable cinematic mode. Time freezes, projectiles suspend, five Quantum Cores orbit the base and assemble a large geometric guardian, towers fire colored energy into the sky, path lights trace the number 50, the guardian breaks the dark canopy, and geometric fireworks and particle rain fill the arena at the music climax. A localized result panel then displays score, core integrity, no-leak clears, research completion, and most-used tower. The player may replay the animation or enter challenge mode.

## Localization

Simplified Chinese is the default language. English may be selected from the title screen or pause menu and applies immediately without reload. The choice persists in browser storage.

All UI labels, tower and enemy names, tutorials, notices, results, research descriptions, cinematic captions, and errors use translation keys. Missing English keys fall back safely to Chinese.

## Persistence

The save schema stores version, language, current level, highest cleared level, funds at level start, Core Chips, Quantum Cores, unlocked towers, purchased research, challenge-mode status, campaign seed, and summary statistics. Save parsing validates fields and falls back to a safe new campaign when corrupted. New Campaign requires confirmation before replacing progress.

## Verification

- Unit tests validate at least fifty deterministic seeds, route connectivity, route-stage rules, buildable area, armor counters, difficulty growth, economy recycling, unlock gates, research prerequisites, i18n coverage, and save migration/fallback.
- Browser tests validate deployment-to-start flow, retry restoration, chapter transitions, tutorials that pause and resume, language switching and persistence, level selection, research purchases, tower unlocks, bosses, and the final cinematic.
- The web-game client captures active gameplay screenshots and text state. Final QA inspects title, deployment, branched maps, tutorials, research, boss combat, Chinese and English UI, victory animation, console errors, and responsive layout.
