import * as THREE from 'three';
import type { ZoneId } from '../data/artifacts';
import { palm, pedestal, pyramid, std, tree } from './models';

export interface PortalDef { target: ZoneId; position: [number, number, number] }

export const PORTALS: Record<ZoneId, PortalDef[]> = {
  treehouse: [ { target: 'egypt', position: [-1.4, 0, -6.4] }, { target: 'nile', position: [1.4, 0, -6.4] } ],
  egypt: [ { target: 'treehouse', position: [-1.4, 0, -6.4] }, { target: 'nile', position: [1.4, 0, -6.4] } ],
  nile: [ { target: 'treehouse', position: [-1.4, 0, -6.4] }, { target: 'egypt', position: [1.4, 0, -6.4] } ],
};

export const SPAWN = new THREE.Vector3(0, 0, 4.5);
export const WALK_RADIUS = 7;

/** Builds static scenery for a zone. Returns the group and the walkable floor mesh. */
export function buildZone(id: ZoneId): { group: THREE.Group; floor: THREE.Mesh } {
  const g = new THREE.Group();
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
      g.add(plank);
    }
    // Railing
    const railMat = std(0x7a4f2a);
    const rail = new THREE.Mesh(new THREE.TorusGeometry(7.8, 0.06, 8, 64), railMat);
    rail.rotation.x = Math.PI / 2;
    rail.position.y = 1.0;
    g.add(rail);
    for (let i = 0; i < 32; i++) {
      const a = (i / 32) * Math.PI * 2;
      const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 1.0, 6), railMat);
      post.position.set(Math.cos(a) * 7.8, 0.5, Math.sin(a) * 7.8);
      g.add(post);
    }
    // Giant trunk behind, canopy overhead
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(1.3, 1.8, 30, 16), std(0x5b3a1e, { roughness: 1 }));
    trunk.position.set(0, -5, -9.8);
    g.add(trunk);
    for (let i = 0; i < 10; i++) {
      const a = (i / 10) * Math.PI * 2;
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(3 + (i % 3), 1), std(0x3f7f32, { flatShading: true }));
      leaf.position.set(Math.cos(a) * 7, 8 + (i % 2) * 1.5, Math.sin(a) * 7 - 3);
      g.add(leaf);
    }
    // Forest floor far below
    const ground = new THREE.Mesh(new THREE.CircleGeometry(80, 32), std(0x3e6b2c));
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -8;
    g.add(ground);
    for (let i = 0; i < 40; i++) {
      const t = tree(6 + Math.random() * 4, 2.5 + Math.random(), [0x3d7a2f, 0x4d8c3a, 0x2f6a28][i % 3]);
      const a = Math.random() * Math.PI * 2;
      const r = 14 + Math.random() * 40;
      t.position.set(Math.cos(a) * r, -8, Math.sin(a) * r);
      g.add(t);
    }
    // Tables for artifacts
    for (const [x, z] of [[-2.2, -2.4], [2.2, -2.4], [-2.8, 1.2], [2.8, 1.2]]) {
      const p = pedestal(0x8e5a2b, 0.75, 0.7);
      p.position.set(x, 0, z);
      g.add(p);
    }
  } else if (id === 'egypt') {
    floor = new THREE.Mesh(new THREE.CircleGeometry(120, 48), std(0xd9b26f, { roughness: 1 }));
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
      g.add(d);
    }
    const p1 = pyramid(14); p1.position.x = -6; p1.position.z = -45; g.add(p1);
    const p2 = pyramid(11); p2.position.x = 18; p2.position.z = -55; g.add(p2);
    const p3 = pyramid(6);  p3.position.x = 30; p3.position.z = -38; g.add(p3);
    // Sphinx (stylised)
    const sphinx = new THREE.Group();
    const stone = std(0xc9a25a, { roughness: 1, flatShading: true });
    const body = new THREE.Mesh(new THREE.BoxGeometry(3, 1.6, 7), stone); body.position.set(0, 0.8, 0); sphinx.add(body);
    const head = new THREE.Mesh(new THREE.BoxGeometry(1.6, 1.9, 1.6), stone); head.position.set(0, 2.4, -3); sphinx.add(head);
    const nemes = new THREE.Mesh(new THREE.ConeGeometry(1.4, 2.4, 4), std(0x3f6fa3, { flatShading: true })); nemes.position.set(0, 2.2, -2.7); nemes.rotation.y = Math.PI / 4; sphinx.add(nemes);
    for (const s of [-1, 1]) { const paw = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 3), stone); paw.position.set(s * 1, 0.3, -4.5); sphinx.add(paw); }
    sphinx.position.set(-16, 0, -18);
    sphinx.rotation.y = 0.6;
    g.add(sphinx);
    // Obelisks + palms
    for (const x of [-7, 7]) {
      const ob = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.45, 6, 4), std(0xb38b4d, { flatShading: true }));
      ob.position.set(x, 3, -9);
      ob.rotation.y = Math.PI / 4;
      ob.castShadow = true;
      g.add(ob);
      const tip = new THREE.Mesh(new THREE.ConeGeometry(0.3, 0.6, 4), std(0xd4af37, { metalness: 0.8 }));
      tip.position.set(x, 6.3, -9);
      tip.rotation.y = Math.PI / 4;
      g.add(tip);
    }
    for (let i = 0; i < 10; i++) {
      const p = palm(3.5 + Math.random() * 2);
      const a = (i / 10) * Math.PI * 2 + 0.3;
      p.position.set(Math.cos(a) * (10 + Math.random() * 4), 0, Math.sin(a) * (10 + Math.random() * 4));
      p.rotation.y = Math.random() * 6;
      g.add(p);
    }
    for (const [x, z] of [[-3, -3], [3, -3], [-3.5, 2], [3.5, 2]]) {
      const p = pedestal(0xc2a26a, 0.75, 0.55);
      p.position.set(x, 0, z);
      g.add(p);
    }
    // Sun
    const sun = new THREE.Mesh(new THREE.SphereGeometry(6, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff1b8 }));
    sun.position.set(60, 55, -110);
    g.add(sun);
  } else {
    // Nile Fossil Exhibit: museum hall opening onto the river
    floor = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), std(0x6b5a45, { roughness: 0.6 }));
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    g.add(floor);
    const wallMat = std(0xb9a789, { roughness: 0.9, side: THREE.DoubleSide });
    const wall = (w: number, x: number, z: number, ry: number) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, 6), wallMat);
      m.position.set(x, 3, z);
      m.rotation.y = ry;
      m.receiveShadow = true;
      g.add(m);
    };
    wall(18, 0, -9, 0);
    wall(18, -9, 0, Math.PI / 2);
    wall(18, 9, 0, -Math.PI / 2);
    // Back opens to the river: low wall + columns
    for (let i = -4; i <= 4; i += 2) {
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.35, 6, 16), std(0xd8c7a3));
      col.position.set(i * 2, 3, 9);
      col.castShadow = true;
      g.add(col);
    }
    const ceiling = new THREE.Mesh(new THREE.PlaneGeometry(18, 18), std(0x4a3d2e, { side: THREE.DoubleSide }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.y = 6;
    g.add(ceiling);
    // River beyond the columns
    const river = new THREE.Mesh(new THREE.PlaneGeometry(200, 30), std(0x2e6f8e, { roughness: 0.15, metalness: 0.3 }));
    river.rotation.x = -Math.PI / 2;
    river.position.set(0, -0.3, 28);
    river.userData.water = true;
    g.add(river);
    const bank = new THREE.Mesh(new THREE.PlaneGeometry(200, 12), std(0x7a6a4a));
    bank.rotation.x = -Math.PI / 2;
    bank.position.set(0, -0.05, 14);
    g.add(bank);
    for (let i = 0; i < 60; i++) {
      const reed = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.02, 1.2 + Math.random(), 4), std(0x6f8f3a));
      reed.position.set(-30 + Math.random() * 60, 0.6, 12.5 + Math.random() * 3);
      reed.rotation.z = (Math.random() - 0.5) * 0.3;
      g.add(reed);
    }
    for (let i = 0; i < 8; i++) {
      const p = palm(4 + Math.random() * 2);
      p.position.set(-24 + i * 7 + Math.random() * 2, 0, 16 + Math.random() * 3);
      g.add(p);
    }
    // Glass display cases
    for (const [x, z] of [[-3, -2.5], [3, -2.5], [-3, 2.5], [3, 2.5]]) {
      const p = pedestal(0x3d3328, 0.8, 0.6, true);
      p.position.set(x, 0, z);
      g.add(p);
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
    g.add(spine);
  }

  return { group: g, floor };
}
