# Neon Tower Defence

A polished top-down arcade tower-defence game built with vanilla JavaScript and HTML Canvas. Move the guardian, fire its blaster, place five specialized tower types, upgrade every tower through three levels, and protect the Neon Core through ten waves and a final boss.

## Run locally

Requirements: Node.js 20 or newer.

```bash
npm install
npm run dev
```

Open the local address printed by Vite, normally [http://localhost:5173](http://localhost:5173).

Production build:

```bash
npm run build
npm run preview
```

Run the automated rule tests:

```bash
npm test
```

## Controls

| Control | Action |
| --- | --- |
| WASD / arrow keys | Move the guardian |
| Mouse | Aim |
| Left mouse | Fire, select, or place |
| Shift / Space | Dash |
| 1–5 | Select a tower |
| Escape | Cancel placement or pause |
| F | Toggle fullscreen |
| M | Toggle audio |
| R | Restart after victory or defeat |

The character can only construct inside its visible build radius. Towers cannot overlap, leave the arena, or block the enemy path. Between waves, use **Launch Early** to gain bonus energy.

## Tower roster

| Tower | Cost | Specialty |
| --- | ---: | --- |
| Pulse Spire | 90 | Fast, reliable single-target fire |
| Prism Cannon | 150 | Heavy long-range single-target damage |
| Arc Coil | 175 | Lightning that chains between enemies |
| Nova Mortar | 195 | Large splash-damage blasts |
| Frost Beacon | 160 | Area damage and movement slowing |

Select a placed tower to inspect its damage, range, rate, upgrade cost, and sell value. Every tower has three visual and statistical levels.

## Game structure

- Ten authored waves introduce grunts, runners, swarms, tanks, shielded enemies, and the final Overdrive boss.
- Eliminations award energy and score.
- Escaped enemies damage the Core; reaching zero integrity ends the run.
- The guardian's blaster helps finish targets, while towers provide the main damage output.
- Sound effects and the backing rhythm are synthesized at runtime with Web Audio. There are no external game assets or audio files.

## Architecture

- `src/game/` contains deterministic rules for state, geometry, placement, economy, enemies, waves, movement, and combat.
- `src/render/` draws the arena, entities, projectiles, placement previews, particles, flashes, and shockwaves.
- `src/ui/` owns the DOM HUD, menus, build dock, contextual tower panel, and result screens.
- `src/audio.js` provides synthesized cues and procedural music.
- `src/main.js` connects fixed-step simulation, input, rendering, UI, and runtime testing hooks.

The browser exposes `window.render_game_to_text()` for a concise JSON snapshot and `window.advanceTime(ms)` for deterministic interaction testing.
