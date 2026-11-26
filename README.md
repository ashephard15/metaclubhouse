# Time Explorers VR — Meta Quest & WebXR Project

A Vite + React + TypeScript + Three.js WebXR game for **Meta Quest 3** (and desktop browsers). Explore three zones, inspect 12 artifacts, read their field notes and answer a quiz to add each one to your Explorer collection.

## Zones
| Zone | Artifacts |
|---|---|
| **Tree House Hub**: a wooden deck high in the forest canopy | Explorer's Compass, Time Map, Oil Lantern, Field Journal |
| **Ancient Egypt Arrival**: Giza plateau with pyramids, sphinx and obelisks | Golden Scarab, Ankh, Papyrus Scroll, Canopic Jar |
| **Nile Fossil Exhibit**: museum hall open to the river | Ammonite, Crocodile Skull, Trilobite, Basilosaurus Tooth |

Glowing portals at the back of each zone link to the other two. Progress is saved in the browser.

## Controls
**Quest 3:** point a controller and pull the trigger to inspect artifacts, answer quizzes, use portals, or teleport by pointing at the floor. Left stick = smooth walk, right stick = snap-turn. Hand-tracking pinch also works.

**Desktop:** drag to look around, use WASD or the arrow keys to walk, click to interact, and press Esc to close a panel. The top-right buttons jump between zones.

## Play on your Quest 3
**Option A: GitHub Pages (easiest).** In the repo go to *Settings → Pages → Build and deployment → Source: GitHub Actions*. Every push to `main` then deploys automatically to
`https://ashephard15.github.io/metaclubhouse/`. Open that URL in the Quest Browser and press **ENTER VR**.

**Option B: local network.**
```bash
npm install
npm run dev:quest     # HTTPS dev server (WebXR requires HTTPS)
```
Open `https://<your-computer-ip>:5173` in the Quest Browser. Accept the self-signed certificate warning, then press **ENTER VR**.

Desktop-only development: `npm run dev` → http://localhost:5173.

## Project structure
- `src/game/Engine.ts`: renderer, WebXR session, controllers/hands, locomotion, raycast interaction, game state
- `src/game/zones.ts`: scenery and portal layout for each zone
- `src/game/models.ts`: procedural 3D stand-in models for every artifact
- `src/game/InfoPanel.ts`: in-world field-note + quiz panel (same panel in VR and on desktop)
- `src/game/sfx.ts`: synthesized sound effects
- `src/components/VRSceneCanvas.tsx`, `src/App.tsx`: React mount and desktop HUD
- `src/data/artifacts.ts`: artifact metadata, field notes, quizzes, cutout filenames

## Adding the art assets
The game runs without any image files. Each artifact shows a built-in 3D model until its art is added.
- **`public/assets/cutouts/`**: drop transparent PNGs here using the `cutout` filename listed for each artifact in `src/data/artifacts.ts` (e.g. `explorer-compass.png`). A matching PNG automatically replaces that artifact's 3D model, keeping its aspect ratio.
- **`public/assets/references/`**: zone reference images (`treehouse-hub.png`, `egypt-arrival.png`, `nile-fossil-exhibit.png`).
- **`meta-store-submission/`**: Meta Horizon Store images (3000×900 hero, 2560×1440 landscape, 1440×1440 square, 1008×1440 portrait, 512×512 icon, 5× 2560×1440 screenshots).
