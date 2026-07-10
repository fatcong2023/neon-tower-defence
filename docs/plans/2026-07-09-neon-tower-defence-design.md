# Neon Tower Defence Design

## Product vision

Neon Tower Defence is a polished, top-down, ten-wave tower-defence game with an original neon-geometric arcade style. The player controls a mobile guardian, fights enemies with a modest blaster, and constructs upgradable towers beside a fixed winding path. The game should feel energetic and tactile through motion, glow, impact effects, audio, and immediate UI feedback.

## Core loop

1. Move around the arena with WASD and aim with the mouse.
2. Shoot enemies directly while earning energy from kills.
3. Open the build dock, select a tower, and place it off the path within the guardian's build radius.
4. Upgrade or sell existing towers between and during waves.
5. Protect the crystal base through ten increasingly difficult waves.
6. Defeat the boss in wave ten to win. Lose if base health reaches zero.

## Arena and combat

The arena uses one readable fixed path that winds from the upper-left spawn portal to a crystal base near the lower-right. Enemies stay on the route, while the guardian can move anywhere within the arena except through the path's blocking scenery. Valid tower locations must be outside the route, sufficiently far from other towers, within map boundaries, and within the guardian's build radius.

The guardian has a modest mouse-aimed blaster and a short cooldown dash. Towers remain the dominant damage source. Enemy archetypes escalate from basic runners to swarms, tanks, and shielded units, followed by a large wave-ten boss.

## Tower roster

All towers have three visible power levels and can be sold for a partial refund.

| Tower | Role | Identity |
| --- | --- | --- |
| Pulse Spire | Rapid single-target | Reliable short-to-mid-range sustained damage |
| Prism Cannon | Heavy single-target | Slow, long-range shots with high impact |
| Arc Coil | Chained area damage | Lightning jumps to nearby enemies |
| Nova Mortar | Splash area damage | Slow explosive projectiles with a large blast |
| Frost Beacon | Area control | Continuous pulses that damage and slow enemies |

Upgrades improve core statistics and strengthen each tower's signature effect. Geometry, glow layers, and orbiting accents transform at every level so upgrades are visible without reading text.

## Waves and economy

The run contains ten authored wave definitions with increasing enemy counts and mixed archetypes. A short countdown separates waves, and the next wave can be launched early for an energy bonus. Kills award energy. Building and upgrading spend energy; selling returns part of the tower's total invested value.

The HUD shows wave, base health, energy, and score. It never obscures the arena. Tower cards show cost and role, while contextual tower panels expose current stats, next upgrade changes, upgrade cost, and sell value.

## Visual and audio direction

The look is an original neon-geometric arcade treatment inspired by the energy of Geometry Dash without copying its assets. A deep navy arena, luminous grid, pulsing path, crisp polygons, bright cyan/magenta/lime/orange/violet accents, and high-contrast silhouettes make the board readable.

Feedback includes projectile trails, hit flashes, particles, damage numbers, shockwaves, tower recoil, upgrade bursts, enemy dissolve effects, wave banners, restrained camera shake, and a boss warning. The interface uses animated glassy panels, strong geometric typography, a bottom build dock, range previews, and green/red placement feedback.

Audio is synthesized with Web Audio at runtime. Shots, hits, builds, upgrades, wave starts, UI actions, victory, and defeat have distinct cues. A mute control is always available, and audio failure never blocks play.

## Controls

- WASD or arrow keys: move
- Mouse: aim
- Left mouse: shoot, select, place, or activate UI
- Shift or Space: dash
- 1-5: choose tower
- Escape: cancel placement or pause
- F: toggle fullscreen
- M: mute

## Technical architecture

The project is a Vite application using vanilla JavaScript, HTML, CSS, and one Canvas. Pure simulation modules own tower definitions, enemy/wave definitions, placement rules, combat calculations, and state transitions. Browser-facing modules own input, fixed-step timing, Canvas rendering, particles, sound, and DOM overlays.

The simulation exposes a concise `window.render_game_to_text()` snapshot containing mode, coordinate system, player, towers, visible enemies, wave state, resources, and base health. `window.advanceTime(ms)` advances fixed simulation steps for deterministic browser tests.

The game handles viewport changes through a fixed logical 16:9 coordinate system and scaled pointer coordinates. Missing Web Audio or fullscreen support degrades gracefully. Resetting a run reconstructs all transient simulation and effect state.

## Verification strategy

Pure unit tests cover placement validity, tower costs and upgrades, targeting and damage, status effects, economy, waves, and terminal states. Browser play tests cover menus, movement, aiming, firing, dashing, building all five towers, invalid placement, upgrading, selling, pausing, restarting, victory, defeat, resizing, fullscreen entry, text-state parity, and console errors. Gameplay screenshots are inspected after meaningful changes, including active combat rather than only menus.
