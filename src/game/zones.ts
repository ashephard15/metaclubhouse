import * as THREE from 'three';
import type { ZoneId } from '../data/artifacts';
import { palm, pyramid, std, tree } from './models';

export interface PortalDef { target: ZoneId; position: [number, number, number] }

export const PORTALS: Record<ZoneId, PortalDef[]> = {
  // The Clubhouse portal is the painted archway (see Engine.spawnTimePortal); it goes where the mission says.
  treehouse: [],
  egypt: [ { target: 'treehouse', position: [0, 0, -3.0] } ], // stands over the big painted portal in the wall
  nile: [ { target: 'treehouse', position: [0, 0, -5.6] } ],
  // On the boat there is no arch: the portal you arrived through hangs behind you at the stern.
  river: [ { target: 'treehouse', position: [0, 0, 7.0] } ],
  pyramid: [ { target: 'treehouse', position: [0, 0, 7.2] } ],
};

export const SPAWN = new THREE.Vector3(0, 0, 4.5);
export const WALK_RADIUS = 7;
/** Walkable area per zone as an ellipse (half-width x, half-length z). The boat deck is long and narrow. */
export const WALK_AREA: Record<ZoneId, { rx: number; rz: number }> = {
  treehouse: { rx: 7, rz: 7 }, egypt: { rx: 7, rz: 7 }, nile: { rx: 7, rz: 7 }, river: { rx: 3.4, rz: 6.2 }, pyramid: { rx: 7, rz: 7 },
};

/**
 * Builds static scenery for a zone. Returns the group and the walkable floor mesh.
 * Distant scenery goes in `far`, which is skipped when a 360° panorama backdrop is used,
 * so the panorama provides the horizon while the playable area stays real 3D geometry.
 */
export function buildZone(id: ZoneId, panorama = false): { group: THREE.Group; floor: THREE.Mesh } {
  const g = new THREE.Group();
  const far = new THREE.Group();
  let floor: THREE.Mesh;

  if (id === 'treehouse') {
    // Wooden deck high in the canopy
    floor = new THREE.Mesh(new THREE.CircleGeometry(8, 48), std(0x9c6b3c, { roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    g.add(floor);
    for (let i = 0; i < 16; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(16, 0.01, 0.04), std(0x6e4826));
      plank.position.set(0, 0.006, -8 + i * 1.0);
      far.add(plank);
    }
    // Railing
    const railMat = std(0x7a4f2a);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(7.8, 0.06, 8, 64), railMat);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 1.0;
    far.add(rail);
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), railMat);
      post.position.set(Math.cos(a) * 7.8, 0.5, Math.sin(a) * 7.8);
      far.add(post);
    }
    // Giant trunk behind, canopy overhead
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.8, 30, 16), std(0x5b3a1e, { roughness: 1 }));
    trunk.position.set(0, -5, -9.8);
    far.add(trunk);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + (i % 3), 1), std(0x3f7f32, { flatShading: true }));
      leaf.position.set(Math.cos(a) * 7, 8 + (i % 2) * 1.5, Math.sin(a) * 7 - 3);
      far.add(leaf);
    }
    // Forest floor far below
    const ground = new THREE.Mesh(new THREE.CircleGeometry(80, 32), std(0x3e6b2c));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -8;
    far.add(ground);
    for (let i = 0; i < 40; i++) {
      const t = tree(6 + Math.random() * 4, 2.5 + Math.random(), [0x3d7a2f, 0x4d8c3a, 0x2f6a28][i % 3]);
      const a = Math.random() * Math.PI * 2;
      const r = 14 + Math.random() * 40;
      t.position.set(Math.cos(a) * r, -8, Math.sin(a) * r);
      far.add(t);
    }
  } else if (id === 'egypt') {
    floor = new THREE.Mesh(new THREE.CircleGeometry(panorama ? 9 : 120, 48), std(panorama ? 0xd8bf94 : 0xd9b26f, { roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    g.add(floor);
    // Dunes
    for (let i = 0; i < 18; i++) {
      const d = new THREE.Mesh(new THREE.SphereGeometry(8 + Math.random() * 10, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), std(0xd2a85f, { roughness: 1 }));
      d.scale.y = 0.2;
      const a = Math.random() * Math.PI * 2;
      const r = 50 + Math.random() * 50;
      d.position.set(Math.cos(a) * r, 0, Math.sin(a) * r);
      far.add(d);
    }
    const p1 = pyramid(14); p1.position.x = -6; p1.position.z = -45; far.add(p1);
    const p2 = pyramid(11); p2.position.x = 18; p2.position.z = -55; far.add(p2);
    const p3 = pyramid(6);  p3.position.x = 30; p3.position.z = -38; far.add(p3);
    // Sphinx (stylised)
    const sphinx = new THREE.Group();
    const stone = std(0xc9a25a, { roughness: 1, flatShading: true });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.6, 7), stone); body.position.set(0, 0.8, 0); sphinx.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.9, 1.6), stone); head.position.set(0, 2.4, -3); sphinx.add(head);
    const nemes = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.4, 4), std(0x3f6fa3, { flatShading: true })); nemes.position.set(0, 2.2, -2.7); nemes.rotation.y = Math.PI / 4; sphinx.add(nemes);
    for (const s of [-1, 1]) { const paw = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 3), stone); paw.position.set(s * 1, 0.3, -4.5); sphinx.add(paw); }
    sphinx.position.set(-16, 0, -18);
    sphinx.rotation.y = 0.6;
    far.add(sphinx);
    // Obelisks + palms
    for (const x of [-7, 7]) {
      const ob = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 6, 4), std(0xb38b4d, { flatShading: true }));
      ob.position.set(x, 3, -9);
      ob.rotation.y = Math.PI / 4;
      ob.castShadow = true;
      far.add(ob);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 4), std(0xd4af37, { metalness: 0.8 }));
      tip.position.set(x, 6.3, -9);
      tip.rotation.y = Math.PI / 4;
      far.add(tip);
    }
    for (let i = 0; i < 10; i++) {
      const p = palm(3.5 + Math.random() * 2);
      const a = (i / 10) * Math.PI * 2 + 0.3;
      p.position.set(Math.cos(a) * (10 + Math.random() * 4), 0, Math.sin(a) * (10 + Math.random() * 4));
      p.rotation.y = Math.random() * 6;
      far.add(p);
    }
    // Stone path from spawn to the portals (matches the reference art)
    for (let i = 0; i < 26; i++) {
      const slab = new THREE.Mesh(new THREE.BoxGeometry(0.55 + Math.random() * 0.25, 0.04, 0.5 + Math.random() * 0.2), std(0xcfb48a, { roughness: 1 }));
      slab.position.set(((i % 3) - 1) * 0.72 + (Math.random() - 0.5) * 0.1, 0.02, 5 - Math.floor(i / 3) * 1.25);
      slab.rotation.y = (Math.random() - 0.5) * 0.2;
      slab.receiveShadow = true;
      far.add(slab);
    }
    // Torches flanking the portals
    for (const x of [-3, 3]) {
      const stand = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.18, 1.1, 8), std(0x2a5db0, { metalness: 0.3 }));
      stand.position.set(x, 0.55, -6.2);
      far.add(stand);
      const bowl = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.12, 0.18, 12), std(0xd4af37, { metalness: 0.8 }));
      bowl.position.set(x, 1.18, -6.2);
      far.add(bowl);
      const flame = new THREE.Mesh(new THREE.ConeGeometry(0.16, 0.42, 10), new THREE.MeshBasicMaterial({ color: 0xffa233 }));
      flame.position.set(x, 1.48, -6.2);
      flame.userData.flame = true;
      far.add(flame);
    }
    // Market stall with striped awning (left side, behind the Bastet statue)
    const stall = new THREE.Group();
    const stallWood = std(0x6e4826);
    for (const [x, z] of [[-1, -0.6], [1, -0.6], [-1, 0.6], [1, 0.6]]) {
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 2.3, 6), stallWood);
      post.position.set(x, 1.15, z);
      stall.add(post);
    }
    for (let i = 0; i < 8; i++) {
      const stripe = new THREE.Mesh(new THREE.BoxGeometry(0.27, 0.03, 1.5), std(i % 2 ? 0xf2e6cf : 0xb83a2e));
      stripe.position.set(-0.95 + i * 0.27, 2.35 - Math.abs(i - 3.5) * 0.03, 0);
      stall.add(stripe);
    }
    const counter = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.8, 0.6), std(0x8e5a2b));
    counter.position.set(0, 0.4, 0.3);
    stall.add(counter);
    for (let i = 0; i < 5; i++) {
      const pot = new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 10), std([0x2a5db0, 0xd9b77a, 0xb83a2e][i % 3]));
      pot.scale.y = 1.3;
      pot.position.set(-0.8 + i * 0.4, 0.98, 0.3);
      stall.add(pot);
    }
    stall.position.set(-7.4, 0, -1.2);
    stall.rotation.y = Math.PI / 2;
    far.add(stall);
    // The Nile beyond the right side, with a sailboat
    const nile = new THREE.Mesh(new THREE.PlaneGeometry(30, 200), std(0x2e7fb0, { roughness: 0.15, metalness: 0.3 }));
    nile.rotation.x = -Math.PI / 2;
    nile.position.set(26, 0.02, 0);
    far.add(nile);
    const boat = new THREE.Group();
    const hull = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.3, 6, 10, 1, false, 0, Math.PI), std(0x7a4f2a));
    hull.rotation.set(0, 0, Math.PI / 2);
    hull.rotation.x = Math.PI;
    boat.add(hull);
    const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 5, 6), std(0x5b3a1e));
    mast.position.y = 2.5;
    boat.add(mast);
    const sail = new THREE.Mesh(new THREE.PlaneGeometry(3, 3.4), std(0xf5ecd7, { side: THREE.DoubleSide }));
    sail.position.set(0, 3, 0.1);
    boat.add(sail);
    boat.position.set(20, 0.3, -12);
    boat.rotation.y = Math.PI / 2;
    far.add(boat);

    // Sun
    const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff1b8 }));
    sun.position.set(60, 55, -110);
    far.add(sun);
  } else if (id === 'river') {
    // Nile River Voyage: the deck of a long wooden river boat in mid-stream
    floor = new THREE.Mesh(new THREE.CircleGeometry(1, 64), std(0x9c6b3c, { roughness: 0.85 }));
    floor.scale.set(3.9, 7.4, 1);
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    g.add(floor);
    for (let i = -7; i <= 7; i++) {
      const plank = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.008, 14), std(0x6e4826));
      plank.position.set(i * 0.27, 0.005, 0);
      far.add(plank);
    }
    const rail = new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 64), std(0x6e4826));
    rail.scale.set(3.95, 7.45, 1);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 0.7;
    far.add(rail);
    const water = new THREE.Mesh(new THREE.PlaneGeometry(400, 400), std(0x2e7fb0, { roughness: 0.15, metalness: 0.3 }));
    water.rotation.x = -Math.PI / 2;
    water.position.y = -0.6;
    far.add(water);
    for (const side of [-1, 1]) {
      const bank = new THREE.Mesh(new THREE.PlaneGeometry(60, 400), std(0x5f8f3a));
      bank.rotation.x = -Math.PI / 2;
      bank.position.set(side * 70, -0.4, 0);
      far.add(bank);
      for (let i = 0; i < 25; i++) {
        const p = palm(4 + Math.random() * 3);
        p.position.set(side * (42 + Math.random() * 10), -0.4, -120 + i * 10 + Math.random() * 5);
        far.add(p);
      }
    }
    const py = pyramid(16); py.position.set(-90, -0.4, -60); far.add(py);
  } else if (id === 'pyramid') {
    // Great Pyramid of Giza: sandy plateau with the pyramid towering ahead
    floor = new THREE.Mesh(new THREE.CircleGeometry(panorama ? 9 : 200, 48), std(0xd9b26f, { roughness: 1 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    g.add(floor);
    const great = pyramid(110, 0xe6d3a8); great.position.set(0, 0, -95); far.add(great);
    const khafre = pyramid(95); khafre.position.set(-110, 0, -150); far.add(khafre);
    const menkaure = pyramid(45); menkaure.position.set(-180, 0, -190); far.add(menkaure);
    for (let i = 0; i < 3; i++) { const q = pyramid(10); q.position.set(60 + i * 22, 0, -60); far.add(q); }
  } else {
    // Nile Fossil Exhibit: museum hall opening onto the river
    floor = new THREE.Mesh(panorama ? new THREE.CircleGeometry(9, 48) : new THREE.PlaneGeometry(18, 18), std(panorama ? 0xc9a676 : 0x6b5a45, { roughness: 0.7 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    g.add(floor);
    const wallMat = std(0xb9a789, { roughness: 0.9, side: THREE.DoubleSide });
    const wall = (w: number, x: number, z: number, ry: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 6), wallMat);
      m.position.set(x, 3, z);
      m.rotation.y = ry;
      m.receiveShadow = true;
      far.add(m);
    };
    wall(18, 0, -9, 0);
    wall(18, -9, 0, Math.PI / 2);
    wall(18, 9, 0, -Math.PI / 2);
    // Back opens to the river: low wall + columns
    for (let i = -4; i <= 4; i += 2) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 6, 16), std(0xd8c7a3));
      col.position.set(i * 2, 3, 9);
      col.castShadow = true;
      far.add(col);
    }
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), std(0x4a3d2e, { side: THREE.DoubleSide }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 6;
    far.add(ceiling);
    // River beyond the columns
    const river = new THREE.Mesh(new THREE.PlaneGeometry(200, 30), std(0x2e6f8e, { roughness: 0.15, metalness: 0.3 }));
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, -0.3, 28);
    river.userData.water = true;
    far.add(river);
    const bank = new THREE.Mesh(new THREE.PlaneGeometry(200, 12), std(0x7a6a4a));
    bank.rotation.x = -Math.PI / 2;
    bank.position.set(0, -0.05, 14);
    far.add(bank);
    for (let i = 0; i < 60; i++) {
      const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 1.2 + Math.random(), 4), std(0x6f8f3a));
      reed.position.set(-30 + Math.random() * 60, 0.6, 12.5 + Math.random() * 3);
      reed.rotation.z = (Math.random() - 0.5) * 0.3;
      far.add(reed);
    }
    for (let i = 0; i < 8; i++) {
      const p = palm(4 + Math.random() * 2);
      p.position.set(-24 + i * 7 + Math.random() * 2, 0, 16 + Math.random() * 3);
      far.add(p);
    }
    // Glass display cases
    for (const [x, z] of [[-3, -2.5], [3, -2.5], [-3, 2.5], [3, 2.5]]) {
      const spot = new THREE.SpotLight(0xfff2d6, 12, 7, 0.45, 0.6, 1.5);
      spot.position.set(x, 5.8, z);
      spot.target.position.set(x, 1, z);
      g.add(spot, spot.target);
    }
    // Hanging whale skeleton (stylised spine)
    const spine = new THREE.Group();
    for (let i = 0; i < 26; i++) {
      const v = new THREE.Mesh(new THREE.SphereGeometry(0.16 - i * 0.004, 8, 6), std(0xe8dcc0));
      v.position.set(i * 0.38 - 5, Math.sin(i * 0.25) * 0.4, 0);
      spine.add(v);
      if (i > 3 && i < 16) {
        const rib = new THREE.Mesh(new THREE.TorusGeometry(0.55 - Math.abs(i - 9) * 0.04, 0.025, 6, 16, Math.PI), std(0xe8dcc0));
        rib.position.copy(v.position);
        rib.rotation.set(0, Math.PI / 2, Math.PI);
        spine.add(rib);
      }
    }
    spine.position.set(0, 4.4, -1);
    far.add(spine); // hangs from the hall ceiling; the panorama has its own whale poster
  }

  // With a panorama, fade the floor's rim so it blends into the backdrop's ground
  if (panorama) {
    floor.geometry.dispose();
    floor.geometry = new THREE.CircleGeometry(11, 64);
    const c = document.createElement('canvas');
    c.width = c.height = 256;
    const ctx = c.getContext('2d')!;
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0, '#fff');
    grad.addColorStop(0.68, '#fff');
    grad.addColorStop(1, '#000');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 256, 256);
    // Invisible floor: the panorama's painted ground shows through, the floor only catches shadows
    (floor.material as THREE.Material).dispose();
    floor.material = new THREE.ShadowMaterial({ opacity: 0.28, transparent: true, depthWrite: false });
  }

  if (!panorama) g.add(far);
  return { group: g, floor };
}
