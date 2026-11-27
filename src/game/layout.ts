import type { ZoneId } from '../data/artifacts';
import { SPAWN } from './zones';

/**
 * Scene layouts. Instead of hand-placed coordinates, each zone lists its objects in
 * left-to-right order with the floor width each one needs. They are spaced evenly in an
 * arc around the arrival point so nothing overlaps, and each side of the arc stops short
 * of the painted portal/doorway straight ahead so the way through stays clear.
 *
 * Angles are degrees from straight ahead at arrival (negative = left, positive = right).
 */
interface ArcLayout {
  kind: 'arc';
  radius: number;
  /** Clear window straight ahead (degrees each side of 0) kept free for a portal/doorway. */
  clear: number;
  /** Gap between neighbours along the arc (metres). */
  gap: number;
  /** Items left of the clear window, listed outermost-left first. */
  left: [id: string, width: number][];
  /** Items right of the clear window, listed nearest-centre first. */
  right: [id: string, width: number][];
}

interface FixedLayout {
  kind: 'fixed';
  /** Explicit floor positions [x, z] for narrow spaces like the boat deck. */
  at: Record<string, [number, number]>;
}

export const LAYOUTS: Partial<Record<ZoneId, ArcLayout | FixedLayout>> = {
  // Market goods on the market (left) side, writing and river things toward the Nile (right).
  egypt: {
    kind: 'arc', radius: 5.0, clear: 20, gap: 0.6,
    left: [['egypt-welcome', 1.4], ['bastet-statue', 1.0], ['golden-scarab', 0.9], ['canopic-jar', 0.9]],
    right: [['ankh', 0.9], ['papyrus-scroll', 0.9], ['hieroglyphic-tablet', 1.2], ['nile-discovery', 1.6], ['egypt-guide', 1.6]],
  },
  // Fossil stands around the pavilion; the arch back home stays clear ahead.
  nile: {
    kind: 'arc', radius: 3.8, clear: 16, gap: 0.9,
    left: [['dig-basket', 0.9], ['ammonite', 1.0], ['croc-skull', 1.0]],
    right: [['trilobite', 1.0], ['whale-tooth', 1.0]],
  },
  // On the deck: two rows along the rails, steering oar at the stern beside the way home.
  river: {
    kind: 'fixed',
    at: {
      'river-welcome': [-2.2, 4.2],
      nilometer: [-2.2, 1.0],
      shaduf: [2.3, 0.4],
      'papyrus-reeds': [-1.6, -1.8],
      'fishing-net': [1.3, -2.6],
      'steering-oar': [2.0, 6.2],
    },
  },
  // Building tools and stones either side of the path to the doorway.
  pyramid: {
    kind: 'arc', radius: 4.0, clear: 18, gap: 0.7,
    left: [['pyramid-welcome', 1.4], ['limestone-block', 1.1], ['cubit-rod', 0.9]],
    right: [['copper-chisel', 0.9], ['casing-stone', 0.9], ['pyramidion', 0.9]],
  },
  // Burial goods around the sarcophagus, which lies in the middle before the throne.
  tomb: {
    kind: 'arc', radius: 3.6, clear: 0, gap: 0.7,
    left: [['treasure-chest', 1.1], ['canopic-set', 1.2], ['dark-statue', 1.0]],
    right: [['sarcophagus', 1.9], ['pharaoh-statue', 1.0], ['offering-table', 1.4]],
  },
};

/** Floor position [x, z] for each laid-out id in a zone. */
export function layoutPositions(zone: ZoneId): Map<string, [number, number]> {
  const out = new Map<string, [number, number]>();
  const L = LAYOUTS[zone];
  if (!L) return out;
  if (L.kind === 'fixed') {
    for (const [id, p] of Object.entries(L.at)) out.set(id, p);
    return out;
  }
  const put = (id: string, deg: number) => {
    const a = (deg * Math.PI) / 180;
    out.set(id, [SPAWN.x + Math.sin(a) * L.radius, SPAWN.z - Math.cos(a) * L.radius]);
  };
  const toDeg = (m: number) => (m / L.radius) * (180 / Math.PI);
  if (L.clear === 0) {
    // One continuous arc centred straight ahead (centre item is the first of `right`)
    const all = [...L.left, ...L.right];
    const centre = L.left.length;
    let edge = 0;
    const centres: number[] = [];
    all.forEach(([, w], i) => { centres[i] = edge + w / 2; edge += w + L.gap; });
    const offset = centres[centre];
    all.forEach(([id], i) => put(id, toDeg(centres[i] - offset)));
    return out;
  }
  // Right side: march outward from the clear window
  let edge = L.clear;
  for (const [id, w] of L.right) { put(id, edge + toDeg(w / 2)); edge += toDeg(w + L.gap); }
  // Left side: listed outermost first, so march from the window outward in reverse
  edge = -L.clear;
  for (const [id, w] of [...L.left].reverse()) { put(id, edge - toDeg(w / 2)); edge -= toDeg(w + L.gap); }
  return out;
}
