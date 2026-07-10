# Neon Tower Defence

A neon-geometric, top-down tower-defence campaign built with vanilla JavaScript and HTML Canvas. Move the guardian, deploy and upgrade towers, counter specialized armor, research permanent upgrades, and defend the Neon Core through 50 procedurally generated levels.

The interface defaults to Simplified Chinese and can switch instantly to English from the title or pause screen.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the address printed by Vite, normally [http://localhost:5173](http://localhost:5173).

Production and test commands:

```bash
npm run build
npm run preview
npm test
```

## How the campaign works

- 50 levels are divided into five chapters, with elite encounters every fifth level and a unique boss every tenth level.
- Every level opens in a deployment phase. Move, build, upgrade, and sell freely, then click **Start Level** when ready.
- Each level receives a deterministic new map. Levels 1–10 use one route; later chapters introduce splits, dual entrances, asymmetric lanes, and three-route convergence.
- Towers reset after a clear. Unspent funds, automatic tower sell-value recycling, level rewards, and performance bonuses become the next level's funds.
- Core Chips, tower unlocks, completed research, language, progress, and Quantum Cores persist in browser storage.
- **Level Select** opens every reached level. A failed level retries with its original starting funds and map.
- Finishing level 50 unlocks the Final Overclock, finale replay, and a harder Challenge Loop with remixed map seeds.

## Tower roster

Every tower has three in-level upgrades. The original five are available immediately; two more unlock after each of the first four chapter bosses.

| Unlock | Tower | Specialty |
| --- | --- | --- |
| Start | Pulse Spire | Rapid single-target fire |
| Start | Prism Cannon | Heavy hits and heavy-armor breaking |
| Start | Arc Coil | Chain lightning and flux-shield counter |
| Start | Nova Mortar | Splash damage and crystal-shell counter |
| Start | Frost Beacon | Area slow and mystic-ward counter |
| Level 10 | Gravity Well | Groups and slows crowds |
| Level 10 | Solar Lance | Piercing anti-heal beam |
| Level 20 | Drone Hive | Long-range, cross-route response |
| Level 20 | Corrosion Forge | Universal armor erosion |
| Level 30 | Resonance Relay | Boosts nearby defenses |
| Level 30 | Rift Gate | Rolls enemies backward along their route |
| Level 40 | Quantum Splitter | Copies attacks across multiple targets and routes |
| Level 40 | Singularity Cannon | Expensive endgame splash artillery |

## Armor and enemies

First encounters with each armor family pause the game and explain its direct counter.

| Defense | Required counter |
| --- | --- |
| Heavy plating | Prism Cannon |
| Flux shield | Arc Coil |
| Crystal shell | Nova Mortar |
| Mystic ward | Frost Beacon |

The roster also includes fast low-health runners, swarms, tanks, healers, splitters, disruptors, armored elites, and five distinct chapter bosses. Wrong attacks deal sharply reduced damage until special armor breaks.

## Neon Lab

The Lab contains 39 permanent research nodes: three for each tower. Core Chips buy damage, range, and cooldown upgrades in prerequisite order. Research never auto-levels a placed tower; every new tower still starts at level one.

## Controls

| Control | Action |
| --- | --- |
| WASD / arrow keys | Move the guardian |
| Mouse | Aim |
| Left mouse | Fire, select, or place |
| Shift / Space | Dash |
| 1–5 | Select one of the five starting towers |
| Escape | Cancel placement, close a screen, or pause |
| Enter | Start the deployed level |
| F | Toggle fullscreen |
| M | Toggle audio |

The guardian can only construct inside the visible build radius. Towers cannot overlap, leave the arena, or block an enemy route. The full 13-tower dock scrolls horizontally.

## Architecture and testing hooks

- `src/game/` contains deterministic campaign, map, economy, armor, enemy, tower, research, save, wave, and cinematic rules.
- `src/render/` draws procedural routes, combat, armor meters, particles, bosses, and the finale.
- `src/ui/` owns the bilingual HUD, deployment panel, Lab, level selector, tutorials, and result screens.
- `src/audio.js` synthesizes sound effects and procedural music at runtime.
- `src/main.js` connects fixed-step simulation, input, persistence, rendering, and UI.

The browser exposes `window.render_game_to_text()` for a concise JSON snapshot and `window.advanceTime(ms)` for deterministic interaction testing.

## Verification

- 65 Vitest checks cover procedural maps, 50-level progression, economy, saves, armor counters, tutorials, 13 towers, 39 research nodes, challenge scaling, combat, localization, and the finale.
- Production Vite build completes successfully.
- Browser QA covers Chinese/English persistence, deployment, branched maps, level selection, research, armor tutorials, boss visibility, defeat/retry, level-50 settlement, all cinematic phases, skip/replay, Challenge Loop, responsive layout, and console errors.
