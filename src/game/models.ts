import * as THREE from 'three';
import type { ArtifactShape } from '../data/artifacts';

const std = (color: number, extra: Partial<THREE.MeshStandardMaterialParameters> = {}) =>
  new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0.1, ...extra });

const gold = () => std(0xd4af37, { metalness: 0.8, roughness: 0.3 });

/** Procedural stand-in model for each artifact, roughly 0.35 m in size. */
export function buildArtifactModel(shape: ArtifactShape, color: number): THREE.Object3D {
  const g = new THREE.Group();
  const add = (geo: THREE.BufferGeometry, mat: THREE.Material, p: [number, number, number] = [0, 0, 0], r: [number, number, number] = [0, 0, 0]) => {
    const m = new THREE.Mesh(geo, mat);
    m.position.set(...p);
    m.rotation.set(...r);
    m.castShadow = true;
    g.add(m);
    return m;
  };

  switch (shape) {
    case 'compass': {
      add(new THREE.CylinderGeometry(0.16, 0.16, 0.05, 32), std(color, { metalness: 0.8, roughness: 0.3 }), [0, 0, 0], [Math.PI / 2, 0, 0]);
      add(new THREE.CylinderGeometry(0.14, 0.14, 0.052, 32), std(0xf5f0e1), [0, 0, 0.002], [Math.PI / 2, 0, 0]);
      add(new THREE.ConeGeometry(0.025, 0.12, 8), std(0xc0392b), [0, 0.06, 0.035]);
      add(new THREE.ConeGeometry(0.025, 0.12, 8), std(0x2c3e50), [0, -0.06, 0.035], [0, 0, Math.PI]);
      break;
    }
    case 'map': {
      add(new THREE.BoxGeometry(0.42, 0.3, 0.01), std(color));
      add(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 12), std(0x8e5a2b), [-0.22, 0, 0]);
      add(new THREE.CylinderGeometry(0.02, 0.02, 0.32, 12), std(0x8e5a2b), [0.22, 0, 0]);
      add(new THREE.TorusGeometry(0.05, 0.008, 8, 24), std(0xc0392b), [0.05, 0.03, 0.01]);
      break;
    }
    case 'lantern': {
      add(new THREE.CylinderGeometry(0.1, 0.12, 0.04, 16), std(0x2d2d2d, { metalness: 0.7 }), [0, -0.14, 0]);
      add(new THREE.CylinderGeometry(0.09, 0.09, 0.22, 16, 1, true), std(0xffffff, { transparent: true, opacity: 0.3 }), [0, -0.01, 0]);
      add(new THREE.SphereGeometry(0.05, 16, 16), new THREE.MeshBasicMaterial({ color }), [0, -0.03, 0]);
      add(new THREE.ConeGeometry(0.11, 0.08, 16), std(0x2d2d2d, { metalness: 0.7 }), [0, 0.13, 0]);
      add(new THREE.TorusGeometry(0.05, 0.008, 8, 24), std(0x2d2d2d, { metalness: 0.7 }), [0, 0.2, 0]);
      break;
    }
    case 'journal': {
      add(new THREE.BoxGeometry(0.28, 0.36, 0.06), std(color));
      add(new THREE.BoxGeometry(0.26, 0.34, 0.062), std(0xf5ecd7), [0.012, 0, 0]);
      add(new THREE.BoxGeometry(0.02, 0.37, 0.065), std(0x5b3a1a), [-0.14, 0, 0]);
      break;
    }
    case 'scarab': {
      const body = add(new THREE.SphereGeometry(0.13, 24, 16), std(color, { metalness: 0.6, roughness: 0.25 }));
      body.scale.set(1, 1.3, 0.55);
      add(new THREE.SphereGeometry(0.06, 16, 12), std(color, { metalness: 0.6, roughness: 0.25 }), [0, 0.19, 0]);
      add(new THREE.BoxGeometry(0.005, 0.3, 0.08), gold(), [0, -0.01, 0.04]);
      for (const s of [-1, 1]) add(new THREE.TorusGeometry(0.12, 0.012, 6, 16, Math.PI), gold(), [s * 0.04, 0, -0.02], [0, 0, s * Math.PI / 2]);
      break;
    }
    case 'ankh': {
      const m = std(color, { metalness: 0.85, roughness: 0.25 });
      const loop = add(new THREE.TorusGeometry(0.07, 0.025, 12, 32), m, [0, 0.12, 0]);
      loop.scale.set(0.8, 1.15, 1);
      add(new THREE.BoxGeometry(0.28, 0.05, 0.05), m, [0, 0.02, 0]);
      add(new THREE.BoxGeometry(0.05, 0.28, 0.05), m, [0, -0.12, 0]);
      break;
    }
    case 'papyrus': {
      add(new THREE.CylinderGeometry(0.05, 0.05, 0.4, 20), std(color), [0, 0, 0], [0, 0, Math.PI / 2]);
      add(new THREE.BoxGeometry(0.36, 0.2, 0.005), std(color), [0, -0.12, 0.04]);
      add(new THREE.TorusGeometry(0.052, 0.008, 6, 20), std(0xc0392b), [0, 0, 0], [0, Math.PI / 2, 0]);
      break;
    }
    case 'canopic': {
      const pts = [0, 0.07, 0.11, 0.12, 0.1, 0.07, 0.06].map((r, i) => new THREE.Vector2(r, i * 0.05 - 0.15));
      add(new THREE.LatheGeometry(pts, 24), std(color, { roughness: 0.8 }));
      add(new THREE.SphereGeometry(0.075, 20, 16), std(0x2c3e50), [0, 0.2, 0]);
      add(new THREE.ConeGeometry(0.035, 0.09, 4), std(0x2c3e50), [0, 0.28, 0]);
      add(new THREE.TorusGeometry(0.115, 0.01, 6, 24), gold(), [0, -0.02, 0], [Math.PI / 2, 0, 0]);
      break;
    }
    case 'ammonite': {
      const pts: THREE.Vector3[] = [];
      for (let t = 0; t < 1; t += 0.01) {
        const a = t * Math.PI * 6;
        const r = 0.015 + 0.15 * t;
        pts.push(new THREE.Vector3(Math.cos(a) * r, Math.sin(a) * r, 0));
      }
      const curve = new THREE.CatmullRomCurve3(pts);
      add(new THREE.TubeGeometry(curve, 160, 0.035, 10, false), std(color, { roughness: 0.9 }));
      break;
    }
    case 'crocodile': {
      const bone = std(color, { roughness: 0.9 });
      const skull = add(new THREE.BoxGeometry(0.22, 0.09, 0.16), bone, [-0.08, 0, 0]);
      skull.scale.set(1, 1, 1);
      add(new THREE.ConeGeometry(0.06, 0.3, 8), bone, [0.16, -0.01, 0], [0, 0, -Math.PI / 2]);
      for (const s of [-1, 1]) add(new THREE.SphereGeometry(0.03, 10, 8), std(0x2d2d2d), [-0.05, 0.04, s * 0.06]);
      for (let i = 0; i < 6; i++) add(new THREE.ConeGeometry(0.008, 0.03, 4), std(0xffffff), [0.04 + i * 0.035, -0.05, 0.03], [Math.PI, 0, 0]);
      break;
    }
    case 'trilobite': {
      const rock = std(color, { roughness: 0.95 });
      const body = add(new THREE.SphereGeometry(0.16, 24, 16), rock);
      body.scale.set(0.75, 1, 0.3);
      for (let i = -4; i <= 4; i++) {
        const seg = add(new THREE.TorusGeometry(0.11 - Math.abs(i) * 0.012, 0.01, 6, 20, Math.PI), std(0x5d6d6e), [0, i * 0.03, 0.02], [0, 0, Math.PI]);
        seg.scale.set(1, 0.3, 1);
      }
      break;
    }
    case 'tooth': {
      const t = add(new THREE.ConeGeometry(0.06, 0.32, 16), std(color, { roughness: 0.4 }), [0, 0.04, 0]);
      t.rotation.z = 0.2;
      add(new THREE.CylinderGeometry(0.06, 0.045, 0.1, 16), std(0x8d7b68), [0.02, -0.15, 0], [0, 0, 0.2]);
      break;
    }
    case 'bastet': {
      // Seated black cat statue on a gold base; spans roughly y -0.2 … 0.45
      const stone = std(color, { roughness: 0.35, metalness: 0.2 });
      add(new THREE.CylinderGeometry(0.17, 0.18, 0.08, 32), gold(), [0, -0.16, 0]);
      const body = add(new THREE.SphereGeometry(0.13, 24, 16), stone, [0, -0.02, 0.01]);
      body.scale.set(0.9, 1.25, 1.1);
      const chest = add(new THREE.SphereGeometry(0.08, 20, 14), stone, [0, 0.12, -0.05]);
      chest.scale.set(1, 1.6, 0.9);
      add(new THREE.SphereGeometry(0.075, 20, 16), stone, [0, 0.29, -0.06]);
      add(new THREE.ConeGeometry(0.032, 0.06, 12), stone, [0, 0.26, -0.13], [-Math.PI / 2, 0, 0]);
      for (const sx of [-1, 1]) {
        add(new THREE.ConeGeometry(0.03, 0.1, 4), stone, [sx * 0.045, 0.39, -0.05]);
        add(new THREE.CylinderGeometry(0.022, 0.025, 0.2, 10), stone, [sx * 0.05, -0.04, -0.09]);
        add(new THREE.SphereGeometry(0.012, 8, 6), std(0xf1c40f, { emissive: 0x6b4f00 }), [sx * 0.028, 0.305, -0.125]);
      }
      add(new THREE.TorusGeometry(0.065, 0.016, 8, 24), std(0x2a5db0, { metalness: 0.4 }), [0, 0.18, -0.05], [Math.PI / 2.4, 0, 0]);
      add(new THREE.TorusGeometry(0.075, 0.008, 8, 24), gold(), [0, 0.16, -0.05], [Math.PI / 2.4, 0, 0]);
      const tail = new THREE.CatmullRomCurve3([new THREE.Vector3(0, -0.12, 0.13), new THREE.Vector3(0.1, -0.14, 0.05), new THREE.Vector3(0.08, -0.14, -0.08)]);
      add(new THREE.TubeGeometry(tail, 16, 0.018, 8), stone);
      break;
    }
    case 'stela': {
      // Round-topped carved stone tablet; spans roughly y -0.55 … 0.5
      const sand = std(color, { roughness: 0.95, flatShading: true });
      add(new THREE.BoxGeometry(0.7, 0.85, 0.12), sand, [0, -0.12, 0]);
      add(new THREE.CylinderGeometry(0.35, 0.35, 0.12, 24, 1, false, Math.PI / 2, Math.PI), sand, [0, 0.305, 0], [Math.PI / 2, 0, 0]);
      const carve = std(0x8a6a3a, { roughness: 1 });
      // seated figure + glyph blocks in low relief on the front face
      add(new THREE.BoxGeometry(0.08, 0.22, 0.02), carve, [-0.12, -0.05, -0.065]);
      add(new THREE.SphereGeometry(0.04, 12, 8), carve, [-0.12, 0.1, -0.065]);
      add(new THREE.BoxGeometry(0.16, 0.04, 0.02), carve, [-0.1, -0.2, -0.065]);
      for (let i = 0; i < 4; i++) add(new THREE.BoxGeometry(0.09, 0.07, 0.02), carve, [0.17, 0.2 - i * 0.12, -0.065]);
      const ankh = std(0xd4af37, { metalness: 0.7, roughness: 0.3, emissive: 0x3a2a00 });
      add(new THREE.TorusGeometry(0.03, 0.01, 6, 16), ankh, [0.0, 0.35, -0.07]);
      add(new THREE.BoxGeometry(0.08, 0.016, 0.016), ankh, [0.0, 0.31, -0.07]);
      add(new THREE.BoxGeometry(0.016, 0.09, 0.016), ankh, [0.0, 0.26, -0.07]);
      break;
    }
    case 'mapTable': {
      // Riverside table (stands on the ground) with an unrolled Nile map, a scarab and a pot of reed pens
      const wood = std(0x7a4f2a, { roughness: 0.9 });
      add(new THREE.BoxGeometry(1.1, 0.06, 0.7), wood, [0, 0.72, 0]);
      for (const [x, z] of [[-0.48, -0.28], [0.48, -0.28], [-0.48, 0.28], [0.48, 0.28]]) add(new THREE.BoxGeometry(0.07, 0.7, 0.07), wood, [x, 0.35, z]);
      add(new THREE.BoxGeometry(0.62, 0.005, 0.4), std(color, { roughness: 1 }), [0.05, 0.755, 0]);
      add(new THREE.BoxGeometry(0.5, 0.006, 0.05), std(0x3a8fc4), [0.05, 0.757, 0.03], [0, 0.4, 0]);
      add(new THREE.ConeGeometry(0.05, 0.05, 4), std(0xc9a25a), [0.18, 0.78, -0.08], [0, Math.PI / 4, 0]);
      for (const x of [-0.27, 0.37]) add(new THREE.CylinderGeometry(0.03, 0.03, 0.44, 14), std(color), [x, 0.78, 0], [Math.PI / 2, 0, 0]);
      const scarab = add(new THREE.SphereGeometry(0.045, 16, 12), std(0x1abc9c, { metalness: 0.6, roughness: 0.25 }), [-0.38, 0.775, 0.22]);
      scarab.scale.set(1, 0.5, 1.3);
      add(new THREE.CylinderGeometry(0.05, 0.04, 0.1, 14), std(0x2a5db0), [-0.4, 0.8, -0.2]);
      for (let i = 0; i < 4; i++) add(new THREE.CylinderGeometry(0.005, 0.005, 0.18, 4), std(0xd9b77a), [-0.4 + (i - 1.5) * 0.012, 0.88, -0.2], [0.15 * (i - 1.5), 0, 0.1]);
      break;
    }
    case 'oar': {
      const wood = std(color, { roughness: 0.8 });
      add(new THREE.CylinderGeometry(0.02, 0.025, 0.6, 10), wood, [0, 0.05, 0], [0, 0, 0.5]);
      const blade = add(new THREE.BoxGeometry(0.14, 0.26, 0.015), std(0xc9a25a), [-0.16, -0.22, 0], [0, 0, 0.5]);
      blade.scale.y = 1;
      add(new THREE.SphereGeometry(0.03, 10, 8), std(0x2a5db0), [0.13, 0.3, 0]);
      break;
    }
    case 'nilometer': {
      const stone = std(color, { roughness: 1, flatShading: true });
      add(new THREE.BoxGeometry(0.16, 0.5, 0.12), stone);
      for (let i = 0; i < 6; i++) add(new THREE.BoxGeometry(i % 2 ? 0.08 : 0.12, 0.01, 0.01), std(0x5a3a1e), [0.02, -0.2 + i * 0.08, -0.065]);
      add(new THREE.BoxGeometry(0.2, 0.09, 0.02), std(0x2e7fb0, { transparent: true, opacity: 0.6 }), [0, -0.2, -0.07]);
      break;
    }
    case 'shaduf': {
      const wood = std(color, { roughness: 0.9 });
      add(new THREE.CylinderGeometry(0.015, 0.02, 0.4, 8), wood, [0, -0.08, 0]);
      add(new THREE.CylinderGeometry(0.01, 0.01, 0.55, 8), wood, [0, 0.12, 0], [0, 0, 1.2]);
      add(new THREE.CylinderGeometry(0.04, 0.035, 0.06, 12), std(0x6f8f3a), [-0.25, 0.0, 0]);
      add(new THREE.SphereGeometry(0.05, 12, 10), std(0x8a7a6a, { flatShading: true }), [0.25, 0.22, 0]);
      break;
    }
    case 'reeds': {
      for (let i = 0; i < 9; i++) {
        const a = (i / 9) * Math.PI * 2;
        add(new THREE.CylinderGeometry(0.008, 0.012, 0.42, 5), std(color), [Math.cos(a) * 0.035, 0, Math.sin(a) * 0.035], [Math.sin(a) * 0.12, 0, Math.cos(a) * 0.12]);
        const tuft = add(new THREE.ConeGeometry(0.035, 0.07, 6), std(0x8fae4a), [Math.cos(a) * 0.06, 0.24, Math.sin(a) * 0.06], [Math.PI, 0, 0]);
        tuft.scale.set(1, 0.8, 1);
      }
      add(new THREE.TorusGeometry(0.05, 0.008, 6, 16), std(0xb98a52), [0, -0.05, 0], [Math.PI / 2, 0, 0]);
      break;
    }
    case 'net': {
      const mesh = add(new THREE.SphereGeometry(0.17, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(color, { wireframe: true }));
      mesh.rotation.x = Math.PI;
      for (let i = 0; i < 3; i++) {
        const fish = add(new THREE.SphereGeometry(0.05, 12, 8), std(0x9fb4c2, { metalness: 0.5, roughness: 0.3 }), [(i - 1) * 0.07, -0.09, (i % 2) * 0.03]);
        fish.scale.set(1.8, 0.6, 0.5);
      }
      break;
    }
    case 'block': {
      const b = add(new THREE.BoxGeometry(0.34, 0.24, 0.26), std(color, { roughness: 1, flatShading: true }));
      b.rotation.y = 0.3;
      break;
    }
    case 'chisel': {
      add(new THREE.BoxGeometry(0.035, 0.36, 0.035), std(color, { metalness: 0.7, roughness: 0.35 }), [0, 0, 0], [0, 0, 0.6]);
      add(new THREE.SphereGeometry(0.08, 10, 8), std(0x8a8070, { flatShading: true, roughness: 1 }), [0.16, 0.08, 0]);
      break;
    }
    case 'cubit': {
      add(new THREE.BoxGeometry(0.5, 0.05, 0.05), std(color), [0, 0, 0], [0, 0, 0.35]);
      for (let i = 0; i < 7; i++) add(new THREE.BoxGeometry(0.005, 0.055, 0.052), std(0xf1c40f), [-0.2 + i * 0.066, 0, 0], [0, 0, 0.35]);
      break;
    }
    case 'pyramidion': {
      const m = add(new THREE.ConeGeometry(0.2, 0.28, 4), std(color, { metalness: 0.85, roughness: 0.25, emissive: 0x3a2a00 }));
      m.rotation.y = Math.PI / 4;
      break;
    }
  }
  if (shape === 'bastet' || shape === 'stela') g.rotation.y = Math.PI; // carved/face side toward +z
  return g;
}

// ---------- Environment helpers ----------

export function tree(trunkH = 3, crown = 1.6, crownColor = 0x3d7a2f): THREE.Group {
  const g = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, trunkH, 10), std(0x6b4423, { roughness: 0.95 }));
  trunk.position.y = trunkH / 2;
  trunk.castShadow = true;
  g.add(trunk);
  for (let i = 0; i < 3; i++) {
    const c = new THREE.Mesh(new THREE.IcosahedronGeometry(crown * (1 - i * 0.2), 1), std(crownColor, { flatShading: true }));
    c.position.set((i - 1) * 0.5, trunkH + i * 0.6, (i % 2) * 0.4);
    c.castShadow = true;
    g.add(c);
  }
  return g;
}

export function palm(h = 4): THREE.Group {
  const g = new THREE.Group();
  const curve = new THREE.QuadraticBezierCurve3(new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.4, h / 2, 0), new THREE.Vector3(0.2, h, 0));
  const trunk = new THREE.Mesh(new THREE.TubeGeometry(curve, 12, 0.14, 8), std(0x8b6b3d, { roughness: 1 }));
  trunk.castShadow = true;
  g.add(trunk);
  for (let i = 0; i < 7; i++) {
    const leaf = new THREE.Mesh(new THREE.ConeGeometry(0.25, 2, 4), std(0x3f8f3a, { flatShading: true }));
    leaf.scale.set(1, 1, 0.15);
    const a = (i / 7) * Math.PI * 2;
    leaf.position.set(0.2 + Math.cos(a) * 0.8, h - 0.25, Math.sin(a) * 0.8);
    leaf.rotation.set(Math.sin(a) * 1.2, 0, -Math.cos(a) * 1.2 - 0.0);
    leaf.lookAt(new THREE.Vector3(0.2 + Math.cos(a) * 3, h - 1.2, Math.sin(a) * 3));
    leaf.rotateX(Math.PI / 2);
    g.add(leaf);
  }
  return g;
}

export function pyramid(size: number, color = 0xd8b46a): THREE.Mesh {
  const m = new THREE.Mesh(new THREE.ConeGeometry(size, size * 0.95, 4), std(color, { flatShading: true, roughness: 1 }));
  m.rotation.y = Math.PI / 4;
  m.position.y = (size * 0.95) / 2;
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

export function pedestal(color: number, h = 0.8, w = 0.5, glass = false): THREE.Group {
  const g = new THREE.Group();
  const base = new THREE.Mesh(new THREE.BoxGeometry(w, h, w), std(color, { roughness: 0.8 }));
  base.position.y = h / 2;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);
  if (glass) {
    const case_ = new THREE.Mesh(
      new THREE.BoxGeometry(w * 0.95, 0.6, w * 0.95),
      new THREE.MeshStandardMaterial({ color: 0xbfe6ff, transparent: true, opacity: 0.12, roughness: 0, metalness: 0, depthWrite: false }),
    );
    case_.position.y = h + 0.3;
    g.add(case_);
  }
  return g;
}

// ---------- Tree stump (Tree House stands) ----------
let barkTex: THREE.CanvasTexture | null = null;
let ringsTex: THREE.CanvasTexture | null = null;

function makeBark(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = 512; c.height = 256;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = '#7a5232';
  ctx.fillRect(0, 0, 512, 256);
  // vertical bark ridges and furrows
  for (let i = 0; i < 140; i++) {
    const x = Math.random() * 512;
    const w = 2 + Math.random() * 7;
    ctx.strokeStyle = Math.random() < 0.55 ? `rgba(48,28,14,${0.35 + Math.random() * 0.4})` : `rgba(170,120,78,${0.25 + Math.random() * 0.3})`;
    ctx.lineWidth = w;
    ctx.beginPath();
    let px = x;
    ctx.moveTo(px, 0);
    for (let y = 0; y <= 256; y += 16) { px += (Math.random() - 0.5) * 6; ctx.lineTo(px, y); }
    ctx.stroke();
  }
  // a few horizontal cracks
  for (let i = 0; i < 18; i++) {
    ctx.strokeStyle = 'rgba(40,22,10,0.5)';
    ctx.lineWidth = 2;
    const x = Math.random() * 512, y = Math.random() * 256;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 10 + Math.random() * 25, y + (Math.random() - 0.5) * 6); ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.wrapS = THREE.RepeatWrapping;
  t.anisotropy = 8;
  return t;
}

function makeRings(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 512;
  const ctx = c.getContext('2d')!;
  const g = ctx.createRadialGradient(256, 256, 0, 256, 256, 256);
  g.addColorStop(0, '#d9b47c'); g.addColorStop(0.85, '#c79a62'); g.addColorStop(0.93, '#8a5a32'); g.addColorStop(1, '#5a3a1e');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  // growth rings, slightly wobbly
  for (let r = 10; r < 232; r += 7 + Math.random() * 9) {
    ctx.strokeStyle = `rgba(110,70,36,${0.25 + Math.random() * 0.35})`;
    ctx.lineWidth = 1.5 + Math.random() * 2;
    ctx.beginPath();
    for (let a = 0; a <= Math.PI * 2 + 0.01; a += 0.08) {
      const rr = r + Math.sin(a * 3 + r) * 2.5;
      const x = 256 + Math.cos(a) * rr, y = 256 + Math.sin(a) * rr;
      a === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();
  }
  // radial drying cracks
  for (let i = 0; i < 7; i++) {
    const a = Math.random() * Math.PI * 2;
    ctx.strokeStyle = 'rgba(60,34,16,0.7)';
    ctx.lineWidth = 2 + Math.random() * 2;
    ctx.beginPath();
    ctx.moveTo(256 + Math.cos(a) * 20, 256 + Math.sin(a) * 20);
    ctx.lineTo(256 + Math.cos(a + 0.05) * (120 + Math.random() * 110), 256 + Math.sin(a + 0.05) * (120 + Math.random() * 110));
    ctx.stroke();
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

/** Cut tree stump with bark sides, ringed top and a little root flare. Top surface sits at y = h. */
export function stump(h = 0.75, r = 0.36): THREE.Group {
  barkTex ??= makeBark();
  ringsTex ??= makeRings();
  const g = new THREE.Group();
  const profile = [
    [r * 1.28, 0], [r * 1.16, 0.04], [r * 1.05, 0.1], [r * 1.0, 0.2],
    [r * 0.97, h * 0.55], [r * 0.99, h - 0.03], [r * 1.0, h],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  const bark = barkTex.clone();
  bark.needsUpdate = true;
  bark.repeat.set(2, 1);
  bark.offset.x = Math.random();
  const body = new THREE.Mesh(new THREE.LatheGeometry(profile, 40), new THREE.MeshStandardMaterial({ map: bark, roughness: 1 }));
  body.rotation.y = Math.random() * Math.PI * 2;
  body.castShadow = true;
  body.receiveShadow = true;
  g.add(body);
  const top = new THREE.Mesh(new THREE.CircleGeometry(r * 0.985, 40), new THREE.MeshStandardMaterial({ map: ringsTex, roughness: 0.85 }));
  top.rotation.set(-Math.PI / 2, 0, Math.random() * Math.PI * 2);
  top.position.y = h + 0.001;
  top.receiveShadow = true;
  g.add(top);
  return g;
}

/** Thick round log-slice table on four log legs, like the Clubhouse concept art. Top surface at y = h. */
export function roundTable(r = 1.1, h = 0.78): THREE.Group {
  barkTex ??= makeBark();
  ringsTex ??= makeRings();
  const g = new THREE.Group();
  const bark = barkTex.clone();
  bark.needsUpdate = true;
  bark.repeat.set(6, 0.4);
  const side = new THREE.MeshStandardMaterial({ map: bark, roughness: 1, emissive: 0x3a1e0c });
  const top = new THREE.MeshStandardMaterial({ map: ringsTex, roughness: 0.7, emissive: 0x5a3414, emissiveIntensity: 0.9 });
  const slab = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.97, 0.16, 48), [side, top, side]);
  slab.position.y = h - 0.08;
  slab.castShadow = slab.receiveShadow = true;
  g.add(slab);
  const legBark = barkTex.clone();
  legBark.needsUpdate = true;
  legBark.repeat.set(1, 1);
  for (let i = 0; i < 4; i++) {
    const a = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.11, 0.14, h - 0.16, 12), new THREE.MeshStandardMaterial({ map: legBark, roughness: 1 }));
    leg.position.set(Math.cos(a) * r * 0.55, (h - 0.16) / 2, Math.sin(a) * r * 0.55);
    leg.castShadow = true;
    g.add(leg);
  }
  return g;
}

export { std };
