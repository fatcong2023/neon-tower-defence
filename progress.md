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

## TODO

- Implement and verify simulation, combat, rendering, audio, and browser interaction.
