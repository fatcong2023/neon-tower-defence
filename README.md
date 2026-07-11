# Neon Tower Defence

A neon-geometric, top-down tower-defence campaign built with vanilla JavaScript and HTML Canvas. Move the guardian, deploy and upgrade towers, counter specialized armor, research permanent upgrades, and defend the Neon Core through 20 procedurally generated multi-wave levels.

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

- 20 levels are divided into five four-level chapters. Levels contain 10, 15, 20, 25, and 30 waves respectively; Levels 4, 8, 12, 16, and 20 end with unique chapter bosses.
- Every level opens in deployment. Move, build, upgrade, and sell freely, then start Wave 1. Clearing a non-final wave opens a five-second preparation countdown with a next-wave preview and **Start Now** action.
- The map, towers, in-level upgrades, unspent funds, core health, score, and kills persist across every wave in the current level. The core does not heal between waves.
- Each new level receives a deterministic new map and a full-health core. Placed towers are automatically recycled at their displayed Sell value; unspent funds, recycling, clear rewards, and performance bonuses become the next level's funds.
- Chapter maps expand from a long snake to split/rejoin routes, left-plus-top dual lanes, asymmetric upper/lower routes, and left/top/bottom convergence. Routes use the lower arena while the core remains on the right.
- Core Chips, tower unlocks, completed research, language, progress, and Quantum Cores persist in browser storage.
- **Level Select** opens every reached level. Failure or refreshing during combat restarts the entire current level at Wave 1 with its original funds and deterministic map.
- Levels 4, 8, 12, and 16 play short skippable chapter transitions that install a Quantum Core and reveal two towers. Finishing Level 20 plays the full finale and unlocks Final Overclock, replay, and a harder Challenge Loop with remixed map seeds.
- Version-1 fifty-level saves migrate proportionally to the twenty-level model while preserving permanent progress and settings.

## Tower roster

Every tower has three in-level upgrades. The original five are available immediately; two more unlock after each of the first four chapter bosses.

| Unlock | Tower | Specialty |
| --- | --- | --- |
| Start | Pulse Spire | Rapid single-target fire |
| Start | Prism Cannon | Heavy hits and heavy-armor breaking |
| Start | Arc Coil | Chain lightning and flux-shield counter |
| Start | Nova Mortar | Splash damage and crystal-shell counter |
| Start | Frost Beacon | Area slow and mystic-ward counter |
| Level 4 | Gravity Well | Groups and slows crowds |
| Level 4 | Solar Lance | Piercing anti-heal beam |
| Level 8 | Drone Hive | Long-range, cross-route response |
| Level 8 | Corrosion Forge | Universal armor erosion |
| Level 12 | Resonance Relay | Boosts nearby defenses |
| Level 12 | Rift Gate | Rolls enemies backward along their route |
| Level 16 | Quantum Splitter | Copies attacks across multiple targets and routes |
| Level 16 | Singularity Cannon | Expensive endgame splash artillery |

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
| Enter | Start Wave 1 from deployment |
| F | Toggle fullscreen |
| M | Toggle audio |

The guardian can only construct inside the visible build radius. Towers cannot overlap, leave the arena, or block an enemy route. The full 13-tower dock scrolls horizontally.

## Architecture and testing hooks

- `src/game/` contains deterministic campaign, map, economy, armor, enemy, tower, research, save, wave, and cinematic rules.
- `src/render/` draws full-arena routes, combat, armor meters, particles, bosses, chapter transitions, and the finale.
- `src/ui/` owns the bilingual Level/Wave HUD, countdown panel, deployment panel, Lab, level selector, tutorials, and result screens.
- `src/audio.js` synthesizes sound effects and procedural music at runtime.
- `src/main.js` connects fixed-step simulation, input, persistence, rendering, and UI.

The browser exposes `window.render_game_to_text()` for a concise JSON snapshot and `window.advanceTime(ms)` for deterministic interaction testing.

## Verification

- 89 Vitest checks cover the twenty-level stage catalog, nested wave lifecycle, full-level retry, proportional save migration, procedural maps, economy, armor counters, tutorials, 13 towers, 39 research nodes, challenge scaling, combat, localization, chapter transitions, and the finale.
- Production Vite build completes successfully.
- The required web-game client and browser QA cover deployment, movement, building, retained upgraded towers/core health, countdown and Start Now, full-level retry, left/top/bottom portals, lower-arena routes, twenty-card Level Select, Chinese/English persistence, chapter and final cinematics, Challenge Loop, fullscreen, 800×500 through 1616×810 responsive layout, text-state parity, and console/page errors.
