# Time Explorers VR — Meta Quest & WebXR Project

Complete Vite + React + TypeScript + Three.js WebXR codebase pre-wired with all 44 exported transparent cutouts, visual environment references, UI badges, and Meta Horizon Store submission assets.

## Project Structure
- `src/components/VRSceneCanvas.tsx` — Three.js + WebXR (`VRButton`) 3D environment with desktop WASD + OrbitControls, interactive hotspots, and aspect-ratio-preserving artifact cutouts.
- `src/data/artifacts.ts` — Metadata, field notes, and interactive quiz questions for all 12 discoverable artifacts across the Tree House Hub, Ancient Egypt Arrival, and Nile Fossil Exhibit.
- `public/assets/cutouts/` — 26 transparent RGBA PNG objects.
- `public/assets/references/` — 6 visual reference & aspect-ratio-preserving inspection images (used as visual references and inspection modals, not spherical panoramas).
- `meta-store-submission/` — 10 Meta Horizon Store submission images (`3000x900` Hero Cover, `2560x1440` Landscape, `1440x1440` Square, `1008x1440` Portrait, `512x512` App Icon, and 5 `2560x1440` screenshots).

## Quick Start
```bash
npm install
npm run dev
```
