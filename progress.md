Original prompt: can you build a web game, tower defence, with a movable main character that can build defence towers. there are 5 kinds of towers, single attack and area attack, all of them are upgradable

## Agreed direction

- New project in `/Users/frankcj/workspace/neon-tower-defence`.
- Top-down arena with a fixed winding enemy path and a ten-wave run.
- Mobile guardian has a modest blaster and dash.
- Five tower types, each with three levels: Pulse, Prism, Arc, Nova, Frost.
- Original neon-geometric arcade presentation inspired by Geometry Dash energy.

## Progress

- 2026-07-09: Approved design and implementation plan committed.
- 2026-07-09: Feature worktree created at `.worktrees/game`.
- 2026-07-09: Began TDD cycle for deterministic initial state.
- 2026-07-09: Initial state tests failed on the missing module, then passed after the state core and Vite shell were added (2 tests).
- 2026-07-10: Tower catalogue, placement validation, three-level upgrades, and selling completed through a red-green test cycle (8 tower tests).
- 2026-07-10: Path interpolation, six enemy archetypes, shields/slows, ten authored waves, and victory/defeat transitions completed through a red-green test cycle (9 simulation tests).
- 2026-07-10: Guardian movement/dash/blaster and all five tower combat identities completed through a red-green test cycle (6 combat tests).
- 2026-07-10: Completed the neon Canvas renderer, responsive HUD, build dock, selection/upgrade UI, menus, placement feedback, particles, runtime hooks, and keyboard/mouse controls.
- 2026-07-10: Browser smoke hook moved from missing to present; Playwright gameplay runs confirmed movement, dash, firing, wave spawning, five-tower placement, upgrading, and state/visual parity with no console errors.
- 2026-07-10: Added synthesized sound effects and procedural rhythm plus a reset-safe mute preference through a red-green test cycle (2 preference tests).
- 2026-07-10: Final QA exercised valid/invalid placement, every tower at all three levels, selling, movement, dash, firing, base damage, pause/resume, restart, mute, fullscreen, boss, victory, defeat, responsive layout, text-state parity, and console output.
- 2026-07-10: Visually inspected title, active gameplay, all-tower, boss, victory, and defeat screenshots. Final boss and gameplay surfaces are readable at 1280×720; the canvas preserves 16:9 at a 1024×768 viewport.
- 2026-07-10: Fixed cursor UX: title/pause/result overlays now use the native pointer, while the gameplay crosshair follows movement continuously across canvas-backed UI buttons instead of freezing on hover.
- 2026-07-10: Expanded the run into a Chinese-first, bilingual 50-level campaign with five deterministic procedural map chapters and manual deployment before every assault.
- 2026-07-10: Added 13 total towers, two-tower chapter unlocks, 39 persistent Neon Lab research nodes, Core Chips, five Quantum Cores, automatic sell-value recycling, autosave, retry restoration, and a 50-level selector.
- 2026-07-10: Added heavy, flux, crystal, and mystic armor families with Prism, Arc, Nova, and Frost counters plus first-encounter pause tutorials; expanded the roster with healers, splitters, disruptors, elites, and five distinct bosses.
- 2026-07-10: Added the skippable/replayable level-50 finale, Final Overclock, completed-save result entry, and a harder Challenge Loop with remixed map seeds.
- 2026-07-10: Fixed every `boss-*` variant to use boss rendering and impact treatment; before the fix, the new variant names bypassed the legacy `boss` visual branch.
- 2026-07-10: Final browser QA inspected Chinese/English title screens, deployment, dual and convergence maps, research, level selection, armor tutorial, Null Architect, defeat, six finale phases, victory, Challenge Loop, and responsive layout with zero page or console errors.
- 2026-07-10: Fixed non-fullscreen scaling by fitting the 1280×720 game shell to the live visual viewport, scaling UI typography from the same factor, and constraining modal/grid minimum sizes so the Neon Lab stays centered and inside the game at every tested window size.
- 2026-07-10: Began the approved twenty-level multi-wave redesign. Added the shared 20-level/5-chapter stage catalog, 10/15/20/25/30 wave tiers, chapter unlock milestones, and version-2 proportional save migration; focused and full suites pass (71 tests).

## Verification

- `npm test`: 65 tests across state, maps, campaign economy, saves, waves, armor, tutorials, enemy behavior, 13 towers, research, combat, movement, localization, challenge scaling, preferences, and the finale.
- `npm run build`: production Vite bundle.
- Web-game Playwright client: movement, dash, aim/fire, wave spawn, audio toggle, screenshots, and text state.
- Browser QA: campaign, persistence, terminal-state, finale, challenge, cursor, and responsive-layout scenarios; zero page or console errors.
- Responsive QA: live resize sequence and six fixed viewports from 1616×810 down to 800×500; shell and Neon Lab remained in bounds with zero page or console errors.

## Optional future tuning

- Adjust late-campaign economy and boss health after longer human play sessions.
- Add optional Challenge Loop modifiers or leaderboard integration.
