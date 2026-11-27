# Time Explorers VR — Meta Quest & WebXR Project

A Vite + React + TypeScript + Three.js WebXR game for **Meta Quest 3** (and desktop browsers). Explore three zones, inspect 12 artifacts, read their field notes and answer a quiz to add each one to your Explorer collection.

## Zones
| Zone | Artifacts |
|---|---|
| **Clubhouse** (start): a magical tree-house library where every adventure begins | Explorer's Compass, Time Map, Oil Lantern, Field Journal |
| **Ancient Egypt Arrival**: the Nile c. 1500 BCE, with pyramids, Sphinx, market stall, stone path and torch-lit portals | Golden Scarab, Ankh, Papyrus Scroll, Canopic Jar, plus three discoveries with inspection art: **Bastet Cat Statue**, **Hieroglyphic Tablet**, **Nile Scroll Map** |
| **Nile Fossil Exhibit**: museum hall open to the river | Ammonite, Crocodile Skull, Trilobite, Basilosaurus Tooth |
| **Nile River Voyage**: on the deck of a boat in mid-river (return through the portal behind you) | Steering Oar, Nilometer, Shaduf, Papyrus Reeds, Fishing Net |
| **Great Pyramid of Giza**: on the plateau in front of Khufu's pyramid (return through the portal behind you) | Limestone Block, Copper Chisel, Cubit Rod, White Casing Stone, Pyramidion |

The Clubhouse has one Time Portal (the painted stone archway). It sends the explorer to their current mission: Ancient Egypt, then the Nile Fossil Exhibit, the Nile River Voyage and the Great Pyramid. Read the Mission Jar on the table to see it. Each destination has one stone arch back to the Clubhouse: the flowered ankh arch in Egypt, the fossil arch at the Nile. Answering an artifact's quiz adds it to your **Backpack** (25 items). Progress is saved in the browser. A welcome sign in Egypt and field-guide easels in the Clubhouse and Egypt open info panels with their artwork.

## Controls
**Quest 3:** point a controller and pull the trigger to inspect artifacts, answer quizzes, or use portals. Point at a valid floor location until the green ring appears, then pull the trigger to teleport. The left stick walks. Each right-stick tilt turns 30°, and releasing the stick lets you turn again. **B or Y** opens the backpack. Hand tracking uses pinch to select.

**Desktop:** drag to look around, use WASD or the arrow keys to walk, click to interact, press **B** for the backpack and Esc to close a panel. The top-right buttons jump between zones.

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

## Art assets
- **`public/assets/inspection/`**: inspection images shown beside the field note on a hinged frame, aspect ratio preserved: `egypt_bastet_statue.png`, `egypt_hieroglyphic_tablet.png`, `egypt_nile_discovery.png` (the three Egypt discoveries) and `egypt_welcome_sign.png` (welcome sign). Set an artifact's `inspectImage` in `src/data/artifacts.ts` to add more.
- **`public/assets/references/`**: environment references used as flat framed pictures (not spherical panoramas): `treehouse_hub_reference.png`, `egypt_arrival_reference.png`.
- **`public/assets/cutouts/`**: transparent PNGs for all 12 quiz artifacts (trimmed, max 1024 px). They replace the stand-in 3D models in the world and show as backpack thumbnails. The three set-piece Egypt discoveries keep their 3D models.
- **`public/assets/panoramas/`** contains six 1774×887 PNGs, one per zone. The renderer projects each backdrop from a 1.6 m reference height. The walk surfaces, displays and interaction targets have independent scene geometry. The Clubhouse and Egypt portal hotspots align with the arches in the artwork. The scenery painted into the panorama has limited depth during room-scale movement.
- **`src/data/artifacts.ts`** holds positions and sizes in metres for artifacts, props and info points. **`src/game/zones.ts`** holds walkable boundaries, floor shapes and scenery. The Great Pyramid’s White Casing Stone and Pyramidion use 3D models because their cutout PNGs are absent.
- **`meta-store-submission/`**: Meta Horizon Store covers, icon and concept screenshots. Replace the screenshots with real in-game captures before submitting, because Meta requires screenshots to show actual app content without extra overlays.

## Testing status
Tested in desktop Chrome: all six zones, portals, doorways, quizzes, backpack and saved progress. Live build: https://ashephard15.github.io/metaclubhouse/. The WebXR paths (controllers, hands, teleport, snap-turn, in-headset backpack) are being tested on Meta Quest 3.
