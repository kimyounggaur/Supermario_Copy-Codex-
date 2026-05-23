# Sky Sprout Runner

Sky Sprout Runner is an original browser platform game built with Vite, React, TypeScript, and Phaser 3. The playable demo follows Sprout, a small seedling spirit, across a cloud-island stage to gather Light Seed Shards and reach the Wind Gate.

## Creative Principles

This project uses original names, level layouts, code-generated placeholder art, and WebAudio sound effects. It does not use external images, music, fonts, or copyrighted game assets.

## Install

```bash
npm install
```

## Run

```bash
npm run dev
```

Open the local URL printed by Vite. The app is a static client-side game and does not need a server or database after build.

## Test

```bash
npm run build
npm run test
npm run test:e2e
npm run lint
```

The E2E smoke test starts the Vite dev server, opens the game in Chromium, clicks Start, checks HUD state, and pauses through the touch pause button.

## Controls

- Left: Arrow Left or A
- Right: Arrow Right or D
- Jump: Space, W, or Arrow Up
- Run: Shift
- Pause: P, Escape, or the top-right touch button
- Restart at checkpoint: R
- Mobile: left/right buttons bottom-left, jump and run buttons bottom-right
- Wall cling: hold toward a wall while falling to slide slowly, then jump to kick away
- Double jump: press jump once more while airborne

## Screen Layout

The first screen is the game menu with the title, Sprout, and a Start button. During play, the HUD sits along the top edge with health, seed count, score, time, checkpoint, and Breeze Orb status. Touch controls are anchored to the bottom corners and the pause button is placed in the top-right corner so it does not cover the HUD.

## Architecture

- `src/components/GameCanvas.tsx` mounts and destroys the Phaser game instance from React.
- `src/game/scenes` contains Boot, Menu, Level, HUD, Pause, Game Over, and Clear scenes.
- `src/game/entities` contains Player, enemies, pickups, hazards, checkpoints, platforms, and the finish gate.
- `src/game/systems` contains input, touch controls, scoring, saving, audio, camera, collision, particles, and level loading.
- `src/game/data/levels/level1.ts` is the editable data-driven stage definition.
- `tests/unit` covers pure player physics, scoring, saving, and level validation.
- `tests/e2e` contains the Playwright browser smoke test.

## Game Systems

Player movement uses acceleration, separate walk/run speed caps, ground and air drag, coyote time, jump buffering, variable jump height, wall cling, wall jump, one double jump, stronger falling gravity, knockback, and invulnerability after damage. Enemies can be stomped from above or damage the player from the side. Falling below the stage returns Sprout to the latest checkpoint while health remains available.

The score system awards points for Light Seed Shards, defeated enemies, Breeze Orb collection, and fast level clears. Best score is stored in `localStorage` under the `sky-sprout-runner.best-score` key.

## Editing The Level

Edit `src/game/data/levels/level1.ts`. The level is made from plain TypeScript data:

- `terrain`: solid rectangles
- `movingPlatforms`: platform rectangles with `from`, `to`, and `speed`
- `collectibles`: Light Seed Shards
- `powerUps`: Breeze Orbs with duration
- `enemies`: Drift Bug, Puff Hopper, and Wind Wisp definitions
- `hazards`: Thorn Crystal rectangles
- `checkpoints`: Glow Lantern positions
- `finishGate`: Wind Gate position

Run `npm run test` after editing level data. The validation test checks for unique ids and basic stage route requirements.

## Build And Deploy

```bash
npm run build
```

Deploy the generated `dist` folder to any static hosting provider. No environment variables are required.

## Future Improvements

- Add more stages and biome-specific hazards.
- Replace placeholder generated textures with a larger original art pass.
- Add settings for sound volume and input remapping.
- Add a collectible route timer and optional challenge medals.
