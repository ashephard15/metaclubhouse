import * as THREE from 'three';
import { VRButton } from 'three/examples/jsm/webxr/VRButton.js';
import { XRControllerModelFactory } from 'three/examples/jsm/webxr/XRControllerModelFactory.js';
import { XRHandModelFactory } from 'three/examples/jsm/webxr/XRHandModelFactory.js';
import { ARTIFACTS, ZONES, artifactsInZone, infoPointsInZone, propsInZone, type Artifact, type InfoPoint, type ZoneId } from '../data/artifacts';
import { buildArtifactModel, pedestal, roundTable, std } from './models';
import { buildZone, PORTALS, SPAWN, WALK_RADIUS } from './zones';

const MISSION_ORDER: ZoneId[] = ['egypt', 'nile'];
/** Direction of the painted portal in the Clubhouse panorama, degrees right of straight ahead at spawn. */
const CLUB_PORTAL_DEG = 98;
import { InfoPanel } from './InfoPanel';
import { BackpackPanel } from './BackpackPanel';
import { CanvasPlane, makeLabel, roundRect, wrapText } from './canvasText';
import { Sfx } from './sfx';

export interface GameState {
  zone: ZoneId;
  discovered: string[];
  inXR: boolean;
  inspecting: string | null;
  backpackOpen: boolean;
}

type Hit =
  | { kind: 'artifact'; artifact: Artifact; point: THREE.Vector3 }
  | { kind: 'portal'; target: ZoneId | 'mission'; point: THREE.Vector3 }
  | { kind: 'info'; info: InfoPoint; point: THREE.Vector3 }
  | { kind: 'panel'; object: THREE.Object3D; point: THREE.Vector3 }
  | { kind: 'floor'; point: THREE.Vector3 };

const STORAGE_KEY = 'time-explorers-progress-v1';
const BASE = import.meta.env.BASE_URL;
const UP = new THREE.Vector3(0, 1, 0);

interface ControllerRig {
  target: THREE.XRTargetRaySpace;
  line: THREE.Line;
  reticle: THREE.Mesh;
  source: XRInputSource | null;
  hovered: Hit | null;
}

export class Engine {
  renderer: THREE.WebGLRenderer;
  scene = new THREE.Scene();
  camera: THREE.PerspectiveCamera;
  rig = new THREE.Group();
  vrButton: HTMLElement;

  private zoneGroup = new THREE.Group();
  private dynamicGroup = new THREE.Group();
  private floor: THREE.Mesh | null = null;
  private artifactNodes: { artifact: Artifact; node: THREE.Group; ring: THREE.Mesh; baseY: number }[] = [];
  private infoNodes: THREE.Object3D[] = [];
  private flames: THREE.Object3D[] = [];
  private backpack = new BackpackPanel();
  private buttonWasDown = new Map<XRInputSource, boolean>();
  private portalNodes: { target: ZoneId; node: THREE.Group; swirl: THREE.Mesh }[] = [];
  private labels: CanvasPlane[] = [];
  private panel = new InfoPanel();
  private raycaster = new THREE.Raycaster();
  private controllers: ControllerRig[] = [];
  private clock = new THREE.Clock();
  private sfx = new Sfx();
  private hemi: THREE.HemisphereLight;
  private sun: THREE.DirectionalLight;
  private textureLoader = new THREE.TextureLoader();
  private panoSphere: THREE.Mesh | null = null;
  private panoTextures = new Map<string, THREE.Texture>();

  // desktop input
  private keys = new Set<string>();
  private yaw = 0;
  private pitch = 0;
  private dragging = false;
  private dragDist = 0;
  private mouse = new THREE.Vector2(-10, -10);
  private desktopHover: Hit | null = null;

  // xr locomotion
  private snapCooldown = 0;

  state: GameState;
  private listeners = new Set<(s: GameState) => void>();

  constructor(private container: HTMLElement) {
    this.state = { zone: 'treehouse', discovered: this.loadProgress(), inXR: false, inspecting: null, backpackOpen: false };

    this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(container.clientWidth, container.clientHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.xr.enabled = true;
    this.renderer.xr.setReferenceSpaceType('local-floor');
    this.renderer.xr.setFoveation(1);
    container.appendChild(this.renderer.domElement);

    this.camera = new THREE.PerspectiveCamera(70, container.clientWidth / container.clientHeight, 0.05, 400);
    this.camera.rotation.order = 'YXZ';
    this.camera.position.set(0, 1.6, 0);
    this.rig.add(this.camera);
    this.scene.add(this.rig, this.zoneGroup, this.dynamicGroup, this.panel.group, this.backpack.group);

    this.hemi = new THREE.HemisphereLight(0xffffff, 0x444422, 1.2);
    this.sun = new THREE.DirectionalLight(0xffffff, 2.2);
    this.sun.position.set(8, 14, 6);
    this.sun.castShadow = true;
    this.sun.shadow.mapSize.set(1024, 1024);
    Object.assign(this.sun.shadow.camera, { left: -10, right: 10, top: 10, bottom: -10, near: 1, far: 40 });
    this.scene.add(this.hemi, this.sun);

    this.vrButton = VRButton.createButton(this.renderer, {
      optionalFeatures: ['local-floor', 'bounded-floor', 'hand-tracking', 'layers'],
    });

    this.setupControllers();
    this.setupDesktopInput();
    this.loadZone('treehouse');

    this.renderer.xr.addEventListener('sessionstart', () => {
      this.camera.position.set(0, 0, 0);
      this.camera.rotation.set(0, 0, 0);
      this.panel.hide();
      this.backpack.hide();
      this.setState({ inXR: true, inspecting: null, backpackOpen: false });
    });
    this.renderer.xr.addEventListener('sessionend', () => {
      this.camera.position.set(0, 1.6, 0);
      this.camera.rotation.set(this.pitch, this.yaw, 0);
      this.rig.rotation.set(0, 0, 0);
      this.setState({ inXR: false });
      this.onResize();
    });

    window.addEventListener('resize', this.onResize);
    this.renderer.setAnimationLoop(this.tick);
  }

  // ---------------- state ----------------
  subscribe(fn: (s: GameState) => void) {
    this.listeners.add(fn);
    fn(this.state);
    return () => this.listeners.delete(fn);
  }
  private setState(p: Partial<GameState>) {
    this.state = { ...this.state, ...p };
    this.listeners.forEach((l) => l(this.state));
  }
  private loadProgress(): string[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const ids = raw ? (JSON.parse(raw) as string[]) : [];
      return ids.filter((id) => ARTIFACTS.some((a) => a.id === id));
    } catch {
      return [];
    }
  }
  private saveProgress() {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state.discovered)); } catch { /* storage unavailable */ }
  }
  resetProgress() {
    this.setState({ discovered: [] });
    this.saveProgress();
    this.refreshRings();
  }

  // ---------------- zones ----------------
  travelTo(zone: ZoneId) {
    this.panel.hide();
    this.backpack.hide();
    this.loadZone(zone);
    this.sfx.portal();
  }

  private disposeTree(obj: THREE.Object3D) {
    obj.traverse((o) => {
      const m = o as THREE.Mesh;
      if (m.geometry) m.geometry.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose());
      else if (mat) { (mat as THREE.MeshBasicMaterial).map?.dispose(); mat.dispose(); }
    });
  }

  private loadZone(id: ZoneId) {
    this.disposeTree(this.zoneGroup);
    this.disposeTree(this.dynamicGroup);
    this.zoneGroup.clear();
    this.dynamicGroup.clear();
    this.labels = [];
    this.artifactNodes = [];
    this.portalNodes = [];
    this.infoNodes = [];

    const z = ZONES[id];
    const pano = !!z.panorama;
    this.scene.background = new THREE.Color(z.sky);
    this.scene.fog = pano ? null : new THREE.Fog(z.fog, id === 'nile' ? 20 : 30, id === 'egypt' ? 160 : 90);
    const indoorDim = id === 'nile' && !pano;
    this.hemi.color.set(id === 'treehouse' && pano ? 0xffe2b8 : indoorDim ? 0xfff0dd : 0xffffff);
    this.hemi.intensity = indoorDim ? 1.0 : 1.3;
    this.sun.intensity = indoorDim ? 0.6 : id === 'treehouse' && pano ? 1.4 : id === 'egypt' ? 3 : 2.4;
    this.setPanorama(z.panorama, z.panoramaYaw ?? 0);

    const { group, floor } = buildZone(id, pano);
    this.floor = floor;
    this.zoneGroup.add(group);

    // Zone title sign
    if (!z.panorama) { // with a panorama the HUD shows the zone name; no floating title
      const title = makeLabel(z.name, 2.6);
      title.mesh.position.set(0, 3.5, -6.9);
      this.labels.push(title);
      this.dynamicGroup.add(title.mesh);
    }
    for (const p of propsInZone(id)) {
      const g = this.sprite(`props/${p.image}.png`, p.height, { flat: p.flat, billboard: !p.fixed && !p.flat, shadow: !p.fixed && !p.flat && p.position[1] === 0 });
      g.position.set(...p.position);
      if (p.fixed) g.lookAt(SPAWN.x, p.position[1], SPAWN.z);
      this.dynamicGroup.add(g);
    }

    for (const a of artifactsInZone(id)) this.spawnArtifact(a);
    for (const p of PORTALS[id]) this.spawnPortal(p.target, p.position, id);
    if (id === 'treehouse') this.spawnTimePortal();
    for (const p of infoPointsInZone(id)) this.spawnInfoPoint(p);
    this.flames = [];
    group.traverse((o) => { if (o.userData.flame) this.flames.push(o); });

    // reset player
    this.rig.position.copy(SPAWN);
    this.rig.rotation.set(0, 0, 0);
    if (!this.renderer.xr.isPresenting) {
      this.yaw = 0;
      this.pitch = -0.08;
      this.camera.rotation.set(this.pitch, this.yaw, 0);
    }
    this.setState({ zone: id, inspecting: null, backpackOpen: false });
  }

  /**
   * 360° backdrop on a large inward-facing sphere centred on the play area at eye height.
   * The 3D floor and all interactive objects sit inside it, so WebXR depth and movement are preserved.
   */
  private setPanorama(path: string | undefined, yawDeg: number) {
    if (!path) { if (this.panoSphere) this.panoSphere.visible = false; return; }
    if (!this.panoSphere) {
      const geo = new THREE.SphereGeometry(40, 64, 32);
      geo.scale(-1, 1, 1);
      this.panoSphere = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ fog: false, toneMapped: false, depthWrite: false }));
      this.panoSphere.renderOrder = -1;
      this.panoSphere.position.set(SPAWN.x, 1.6, SPAWN.z);
      this.scene.add(this.panoSphere);
    }
    const sphere = this.panoSphere;
    // Equirect centre (u = 0.5) lands on -x for an inverted sphere; turn it to face -z (toward the portals).
    sphere.rotation.y = -Math.PI / 2 + THREE.MathUtils.degToRad(yawDeg);
    const apply = (tex: THREE.Texture) => {
      (sphere.material as THREE.MeshBasicMaterial).map = tex;
      (sphere.material as THREE.MeshBasicMaterial).needsUpdate = true;
      sphere.visible = true;
    };
    sphere.visible = false;
    const cached = this.panoTextures.get(path);
    if (cached) { apply(cached); return; }
    this.textureLoader.load(`${BASE}assets/${path}`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      tex.generateMipmaps = true;
      this.panoTextures.set(path, tex);
      if (ZONES[this.state.zone].panorama === path) apply(tex);
    });
  }

  private blobTex: THREE.Texture | null = null;

  /** A transparent PNG standing on the floor (bottom-anchored), or lying flat. Keeps the image's aspect ratio. */
  private sprite(path: string, height: number, opts: { flat?: boolean; billboard?: boolean; shadow?: boolean; back?: number } = {}): THREE.Group {
    const g = new THREE.Group();
    if (opts.billboard) g.userData.billboard = true;
    if (opts.shadow) {
      if (!this.blobTex) {
        const c = document.createElement('canvas');
        c.width = c.height = 128;
        const ctx = c.getContext('2d')!;
        const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
        grad.addColorStop(0, 'rgba(0,0,0,0.45)');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 128, 128);
        this.blobTex = new THREE.CanvasTexture(c);
      }
      const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.blobTex, transparent: true, depthWrite: false }));
      blob.rotation.x = -Math.PI / 2;
      blob.position.y = 0.006;
      blob.scale.set(height * 0.8, height * 0.45, 1);
      blob.userData.noBillboard = true;
      g.add(blob);
    }
    this.textureLoader.load(`${BASE}assets/${path}`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      const img = tex.image as HTMLImageElement;
      const aspect = img.width / img.height;
      const mat = new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.04, side: THREE.DoubleSide, toneMapped: false });
      let plane: THREE.Mesh;
      if (opts.flat) {
        plane = new THREE.Mesh(new THREE.PlaneGeometry(height, height / aspect), mat);
        plane.rotation.x = -Math.PI / 2;
      } else {
        plane = new THREE.Mesh(new THREE.PlaneGeometry(height * aspect, height), mat);
        plane.position.set(0, height / 2, -(opts.back ?? 0));
      }
      plane.userData.infoPoint = g.userData.infoPoint;
      g.add(plane);
    });
    return g;
  }

  private spawnArtifact(a: Artifact) {
    const node = new THREE.Group();
    node.position.set(...a.position);
    if (a.static) node.lookAt(SPAWN.x, a.position[1], SPAWN.z);
    const model = buildArtifactModel(a.shape, a.color);
    node.add(model);
    node.userData.artifact = a;

    // Swap in the transparent PNG cutout if it has been added to public/assets/cutouts/
    this.textureLoader.load(
      `${BASE}assets/cutouts/${a.cutout}`,
      (tex) => {
        const img = tex.image as HTMLImageElement;
        if (!img?.width) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        const h = a.cutoutHeight ?? 0.45;
        const w = (h * img.width) / img.height;
        const plane = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ map: tex, transparent: true, alphaTest: 0.05, side: THREE.DoubleSide }),
        );
        plane.userData.billboard = !a.lieFlat;
        if (a.lieFlat) {
          plane.geometry.dispose();
          plane.geometry = new THREE.PlaneGeometry(h, (h * img.height) / img.width);
          plane.rotation.x = -Math.PI / 2;
          plane.userData.noSpin = true;
        }
        // Set pieces stand on their stand (or the ground) instead of floating
        if (a.static) plane.position.y = (a.standHeight ?? 0.75) + h / 2 - a.position[1];
        node.remove(model);
        this.disposeTree(model);
        node.add(plane);
      },
      undefined,
      () => { /* no cutout yet — keep the 3D stand-in */ },
    );

    // Stand under the artifact, styled per zone
    const standH = a.standHeight ?? (a.zone === 'nile' ? 0.8 : 0.75);
    if (standH > 0) {
      const style = { treehouse: [0x8e5a2b, 0.7, false], egypt: [0xc2a26a, 0.6, false], nile: [0x9a7a52, 0.6, true] } as const;
      const [color, width, glass] = style[a.zone];
      const stand =
        a.zone === 'treehouse' ? this.sprite('props/tree-stump.png', standH + 0.12, { billboard: true, shadow: true })
        : a.zone === 'egypt' ? this.sprite('props/egypt-pedestal.png', standH + 0.06, { billboard: true, shadow: true, back: 0.12 })
        : a.zone === 'nile' ? this.sprite('props/nile-display-stand.png', standH * 2, { billboard: true, shadow: true, back: 0.18 })
        : pedestal(color, standH, width, glass && !a.static);
      stand.position.set(a.position[0], 0, a.position[2]);
      this.dynamicGroup.add(stand);
    }

    const onTable = a.zone === 'treehouse' && standH === 0;
    const box = new THREE.Box3().setFromObject(model);
    const size = box.getSize(new THREE.Vector3());
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(Math.max(0.32, Math.max(size.x, size.z) * 0.6), 0.015, 8, 48),
      new THREE.MeshBasicMaterial({ color: 0xf7c95c }),
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(a.position[0], onTable ? 0.815 : standH + 0.02, a.position[2]);
    if (onTable) ring.scale.setScalar(0.65);

    const label = makeLabel(a.name, 0.8);
    label.mesh.position.set(0, Math.max(box.max.y, 0.23) + 0.1, 0); // model is in node-local space here
    label.mesh.userData.billboard = true;
    if (!onTable) node.add(label.mesh); // tabletop items rely on their glow ring; the name shows when selected
    this.labels.push(label);

    this.dynamicGroup.add(node, ring);
    this.artifactNodes.push({ artifact: a, node, ring, baseY: a.position[1] });
    this.refreshRings();
  }

  private refreshRings() {
    for (const n of this.artifactNodes) {
      (n.ring.material as THREE.MeshBasicMaterial).color.set(this.state.discovered.includes(n.artifact.id) ? 0x5be37a : 0xf7c95c);
    }
  }

  /** Invisible hit area over the painted Clubhouse portal; entering follows the current mission. */
  private spawnTimePortal() {
    const yaw = THREE.MathUtils.degToRad(CLUB_PORTAL_DEG);
    const node = new THREE.Group();
    node.position.set(SPAWN.x + Math.sin(yaw) * 6, 0, SPAWN.z - Math.cos(yaw) * 6);
    node.lookAt(SPAWN.x, 0, SPAWN.z);
    const hit = new THREE.Mesh(new THREE.PlaneGeometry(2.4, 3.2), new THREE.MeshBasicMaterial({ visible: false }));
    hit.position.y = 1.5;
    hit.userData.portal = 'mission';
    const label = makeLabel('Time Portal', 1.4);
    label.mesh.position.y = 3.35;
    this.labels.push(label);
    node.add(hit, label.mesh);
    this.dynamicGroup.add(node);
    this.portalNodes.push({ target: 'egypt', node, swirl: hit });
  }

  /** Mission order: Egypt, then the Nile. Returns the zone the Time Portal sends the explorer to. */
  currentMission(): ZoneId {
    for (const z of MISSION_ORDER) if (artifactsInZone(z).some((a) => !this.state.discovered.includes(a.id))) return z;
    return MISSION_ORDER[0];
  }

  private missionText(): string {
    const z = this.currentMission();
    const left = artifactsInZone(z).filter((a) => !this.state.discovered.includes(a.id)).length;
    const clubLeft = artifactsInZone('treehouse').filter((a) => !this.state.discovered.includes(a.id)).length;
    const allDone = this.state.discovered.length === ARTIFACTS.length;
    if (allDone) return 'Every mission is complete. You are a Master Time Explorer! Step into the Time Portal any time to visit Ancient Egypt again.';
    return `Your mission: step into the Time Portal to travel to ${ZONES[z].name}. Find the ${left} glowing artifact${left === 1 ? '' : 's'} still waiting there and answer each question to fill your backpack. When you are done, walk through the stone archway to come back here to the Clubhouse.` +
      (clubLeft ? ` Before you go, check the explorer tools on this table: ${clubLeft} still to collect!` : '');
  }

  private spawnPortal(target: ZoneId, pos: [number, number, number], zone: ZoneId) {
    const node = new THREE.Group();
    node.position.set(...pos);
    node.lookAt(SPAWN.x, 0, SPAWN.z);
    const frame = new THREE.Mesh(
      new THREE.TorusGeometry(1.0, 0.09, 12, 48),
      new THREE.MeshStandardMaterial({ color: 0xd4af37, metalness: 0.8, roughness: 0.3, emissive: 0x3a2a00 }),
    );
    frame.position.y = 1.35;
    const swirlCanvas = document.createElement('canvas');
    swirlCanvas.width = swirlCanvas.height = 256;
    const c = swirlCanvas.getContext('2d')!;
    const grad = c.createRadialGradient(128, 128, 10, 128, 128, 128);
    const tint = '#b06cff'; // Clubhouse purple: every arch leads home
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.35, tint);
    grad.addColorStop(1, '#1a0f3a');
    c.fillStyle = grad;
    c.fillRect(0, 0, 256, 256);
    c.strokeStyle = 'rgba(255,255,255,0.45)';
    c.lineWidth = 6;
    for (let i = 0; i < 5; i++) {
      c.beginPath();
      for (let t = 0; t < 1; t += 0.02) {
        const ang = t * Math.PI * 3 + (i * Math.PI * 2) / 5;
        const r = t * 120;
        const x = 128 + Math.cos(ang) * r, y = 128 + Math.sin(ang) * r;
        t === 0 ? c.moveTo(x, y) : c.lineTo(x, y);
      }
      c.stroke();
    }
    const tex = new THREE.CanvasTexture(swirlCanvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const swirl = new THREE.Mesh(new THREE.CircleGeometry(0.95, 48), new THREE.MeshBasicMaterial({ map: tex, transparent: true, opacity: 0.9 }));
    swirl.position.y = 1.35;
    swirl.userData.portal = target;
    const label = makeLabel(`Back to the ${ZONES[target].name}`, 1.8);
    label.mesh.position.y = 2.7;
    // Destination-themed stone arch (transparent PNG); the swirl shows through its opening
    const arch = ({
      egypt: { img: 'props/egypt-portal-arch.png', cy: 0.475, w: 0.49 * 0.92, h: 0.53 },
      nile: { img: 'props/nile-portal-arch.png', cy: 0.455, w: 0.52 * 0.87, h: 0.59 },
    } as Partial<Record<ZoneId, { img: string; cy: number; w: number; h: number }>>)[zone];
    if (arch) {
      const H = 2.7;
      frame.visible = false;
      node.add(this.sprite(arch.img, H));
      swirl.position.set(0, arch.cy * H, -0.03);
      swirl.scale.set((arch.w * H * 1.1) / 1.9, (arch.h * H * 1.08) / 1.9, 1);
      label.mesh.position.y = H + 0.2;
    }
    this.labels.push(label);
    node.add(frame, swirl, label.mesh);
    this.dynamicGroup.add(node);
    this.portalNodes.push({ target, node, swirl });
  }

  /** Welcome sign (painted parchment) or field-guide easel (flat reference image, aspect preserved). */
  private spawnInfoPoint(p: InfoPoint) {
    const node = new THREE.Group();
    node.position.set(...p.position);
    node.lookAt(SPAWN.x, 0, SPAWN.z);
    const wood = std(0x6b4423, { roughness: 0.95 });
    let face: THREE.Mesh;
    if (p.kind === 'jar') {
      // Round table in the middle of the room; the Mission Jar stands raised in its centre
      node.add(roundTable(1.35, 0.8));
      const riser = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.36, 0.16, 24), std(0x8e5a2b, { roughness: 0.9 }));
      riser.position.set(0, 0.88, -0.5);
      riser.castShadow = true;
      node.add(riser);
      const jar = this.sprite('props/mission-jar.png', 0.85, { billboard: true });
      jar.position.set(0, 0.96, -0.5);
      node.add(jar);
      const glow = new THREE.PointLight(0xc9a0ff, 1.5, 2.2);
      glow.position.set(0, 1.3, -0.5);
      node.add(glow);
      const tag = makeLabel('Mission Jar', 0.6);
      tag.mesh.position.set(0, 2.0, -0.5);
      tag.mesh.userData.billboard = true;
      this.labels.push(tag);
      node.add(tag.mesh);
      face = new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.9, 12), new THREE.MeshBasicMaterial({ visible: false }));
      face.position.set(0, 1.4, -0.5);
    } else if (p.kind === 'board') {
      // How to Play: the sign picture hanging between two wooden posts
      const wood = std(0x6b4423, { roughness: 0.95 });
      for (const x of [-0.55, 0.55]) {
        const post = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.06, 2.1, 8), wood);
        post.position.set(x, 1.05, -0.03);
        node.add(post);
      }
      const bar = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 1.2, 8), wood);
      bar.rotation.z = Math.PI / 2;
      bar.position.set(0, 2.05, -0.03);
      node.add(bar);
      const board = this.sprite(p.image!, 1.45);
      board.position.y = 0.55;
      node.add(board);
      face = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 1.45), new THREE.MeshBasicMaterial({ visible: false }));
      face.position.set(0, 1.28, 0.02);
    } else if (p.kind === 'sign') {
      node.add(this.sprite('props/egypt-welcome-sign.png', 1.9, { shadow: true }));
      face = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 1.9), new THREE.MeshBasicMaterial({ visible: false }));
      face.position.set(0, 0.95, 0.02);
    } else {
      // Easel with the reference picture
      for (const [x, rz] of [[-0.45, 0.08], [0.45, -0.08]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.0, 0.06), wood);
        leg.position.set(x, 1.0, 0);
        leg.rotation.z = rz;
        node.add(leg);
      }
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.9, 0.06), wood);
      back.position.set(0, 0.95, -0.35);
      back.rotation.x = -0.2;
      node.add(back);
      face = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.68), new THREE.MeshBasicMaterial({ color: 0x3a2a1a }));
      face.position.set(0, 1.35, 0.05);
      const frame = new THREE.Mesh(new THREE.BoxGeometry(1.28, 0.76, 0.04), std(0xd4af37, { metalness: 0.7, roughness: 0.35 }));
      frame.position.set(0, 1.35, 0.02);
      node.add(frame);
      this.textureLoader.load(`${BASE}assets/${p.image}`, (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        const img = tex.image as HTMLImageElement;
        const w = 1.2, h = w / (img.width / img.height);
        face.geometry.dispose();
        face.geometry = new THREE.PlaneGeometry(w, h);
        frame.scale.set(1, (h + 0.08) / 0.76, 1);
        (face.material as THREE.MeshBasicMaterial).dispose();
        face.material = new THREE.MeshBasicMaterial({ map: tex, toneMapped: false });
      });
      const tag = makeLabel(p.title.replace(' Field Guide', ''), 1.1);
      tag.mesh.position.set(0, 2.2, 0.05);
      this.labels.push(tag);
      node.add(tag.mesh);
    }
    face.userData.infoPoint = p;
    node.add(face);
    node.traverse((o) => { if (o !== node) o.userData.infoPoint = p; });
    this.dynamicGroup.add(node);
    this.infoNodes.push(node);
  }

  // ---------------- backpack ----------------
  toggleBackpack() {
    if (this.state.backpackOpen) { this.backpack.hide(); this.setState({ backpackOpen: false }); return; }
    this.panel.hide();
    // In the headset the backpack is a 3D board; on desktop the React HUD drawer shows it.
    if (this.renderer.xr.isPresenting) {
      const { pos, dir } = this.headPose();
      this.backpack.show(this.state.discovered, pos, dir);
    }
    this.sfx.click();
    this.setState({ backpackOpen: true, inspecting: null });
  }

  // ---------------- interaction ----------------
  private interactTargets(): THREE.Object3D[] {
    const t: THREE.Object3D[] = [...this.panel.interactiveMeshes, ...this.backpack.interactiveMeshes];
    if (!this.panel.isOpen && !this.backpack.isOpen) {
      for (const n of this.artifactNodes) t.push(n.node);
      for (const p of this.portalNodes) t.push(p.swirl);
      t.push(...this.infoNodes);
    }
    if (this.floor) t.push(this.floor);
    return t;
  }

  private castRay(origin: THREE.Vector3, dir: THREE.Vector3): Hit | null {
    this.raycaster.set(origin, dir);
    this.raycaster.far = 30;
    const hits = this.raycaster.intersectObjects(this.interactTargets(), true);
    for (const h of hits) {
      let o: THREE.Object3D | null = h.object;
      if (o.userData.panelAction || o.userData.backpackAction) return { kind: 'panel', object: o, point: h.point };
      for (let q: THREE.Object3D | null = o; q; q = q.parent) {
        if (q.userData.infoPoint) return { kind: 'info', info: q.userData.infoPoint, point: h.point };
      }
      if (o.userData.portal) return { kind: 'portal', target: o.userData.portal, point: h.point };
      while (o) {
        if (o.userData.artifact) return { kind: 'artifact', artifact: o.userData.artifact, point: h.point };
        o = o.parent;
      }
      if (h.object === this.floor) return { kind: 'floor', point: h.point };
    }
    return null;
  }

  private headPose() {
    const pos = new THREE.Vector3();
    const dir = new THREE.Vector3();
    this.camera.getWorldPosition(pos);
    this.camera.getWorldDirection(dir);
    return { pos, dir };
  }

  private activate(hit: Hit | null, src: XRInputSource | null) {
    if (!hit) return;
    this.sfx.unlock();
    if (hit.kind === 'panel' && hit.object.userData.backpackAction) {
      if (hit.object.userData.backpackAction === 'close') this.toggleBackpack();
    } else if (hit.kind === 'panel') {
      const r = this.panel.activate(hit.object);
      if (r === 'correct') this.discover(this.panel.artifact!);
      else if (r === 'wrong') { this.sfx.wrong(); this.pulse(src, 0.6, 120); }
      else if (r === 'close') { this.sfx.click(); this.setState({ inspecting: null }); }
    } else if (hit.kind === 'artifact') {
      const { pos, dir } = this.headPose();
      this.panel.open(hit.artifact, this.state.discovered.includes(hit.artifact.id));
      this.panel.placeInFront(pos, dir, !!hit.artifact.inspectImage);
      this.sfx.click();
      this.pulse(src, 0.4, 60);
      this.setState({ inspecting: hit.artifact.id });
    } else if (hit.kind === 'info') {
      const { pos, dir } = this.headPose();
      this.panel.openInfo(hit.info.kind === 'jar' ? { ...hit.info, body: this.missionText() } : hit.info);
      this.panel.placeInFront(pos, dir, !!hit.info.image);
      this.sfx.click();
      this.pulse(src, 0.4, 60);
      this.setState({ inspecting: hit.info.id });
    } else if (hit.kind === 'portal') {
      this.travelTo(hit.target === 'mission' ? this.currentMission() : hit.target);
    } else if (hit.kind === 'floor' && this.renderer.xr.isPresenting && !this.panel.isOpen && !this.backpack.isOpen) {
      this.teleportTo(hit.point);
    }
  }

  closePanel() {
    this.panel.hide();
    this.backpack.hide();
    this.setState({ inspecting: null, backpackOpen: false });
  }

  private discover(a: Artifact) {
    if (!this.state.discovered.includes(a.id)) {
      const discovered = [...this.state.discovered, a.id];
      this.setState({ discovered });
      this.saveProgress();
      this.refreshRings();
      if (discovered.length === ARTIFACTS.length) this.sfx.fanfare();
      else this.sfx.correct();
    } else {
      this.sfx.correct();
    }
    for (const c of this.controllers) this.pulse(c.source, 0.8, 200);
  }

  private teleportTo(p: THREE.Vector3) {
    const { pos } = this.headPose();
    const target = this.clampToBounds(new THREE.Vector3(p.x, 0, p.z));
    this.rig.position.x += target.x - pos.x;
    this.rig.position.z += target.z - pos.z;
    this.sfx.click();
  }

  private clampToBounds(v: THREE.Vector3) {
    const len = Math.hypot(v.x, v.z);
    if (len > WALK_RADIUS) { v.x *= WALK_RADIUS / len; v.z *= WALK_RADIUS / len; }
    return v;
  }

  private pulse(src: XRInputSource | null, intensity: number, ms: number) {
    const act = src?.gamepad?.hapticActuators?.[0] as { pulse?: (i: number, d: number) => void } | undefined;
    act?.pulse?.(intensity, ms);
  }

  // ---------------- XR controllers ----------------
  private setupControllers() {
    const modelFactory = new XRControllerModelFactory();
    const handFactory = new XRHandModelFactory();
    for (let i = 0; i < 2; i++) {
      const target = this.renderer.xr.getController(i);
      const line = new THREE.Line(
        new THREE.BufferGeometry().setFromPoints([new THREE.Vector3(0, 0, 0), new THREE.Vector3(0, 0, -1)]),
        new THREE.LineBasicMaterial({ color: 0xf7c95c, transparent: true, opacity: 0.8 }),
      );
      line.scale.z = 5;
      target.add(line);
      const reticle = new THREE.Mesh(new THREE.RingGeometry(0.12, 0.16, 32), new THREE.MeshBasicMaterial({ color: 0x7ee08a, side: THREE.DoubleSide }));
      reticle.rotation.x = -Math.PI / 2;
      reticle.visible = false;
      this.scene.add(reticle);

      const rig: ControllerRig = { target, line, reticle, source: null, hovered: null };
      target.addEventListener('connected', (e) => { rig.source = (e as unknown as { data: XRInputSource }).data; });
      target.addEventListener('disconnected', () => { rig.source = null; reticle.visible = false; });
      target.addEventListener('select', () => this.activate(rig.hovered, rig.source));
      this.rig.add(target);

      const grip = this.renderer.xr.getControllerGrip(i);
      grip.add(modelFactory.createControllerModel(grip));
      this.rig.add(grip);

      const hand = this.renderer.xr.getHand(i);
      hand.add(handFactory.createHandModel(hand, 'mesh'));
      this.rig.add(hand);

      this.controllers.push(rig);
    }
  }

  private updateControllers(dt: number) {
    const panelHovers: THREE.Object3D[] = [];
    for (const c of this.controllers) {
      if (!c.source || c.source.targetRayMode !== 'tracked-pointer') { c.line.visible = false; c.reticle.visible = false; continue; }
      c.line.visible = true;
      const origin = new THREE.Vector3();
      const quat = new THREE.Quaternion();
      c.target.getWorldPosition(origin);
      c.target.getWorldQuaternion(quat);
      const dir = new THREE.Vector3(0, 0, -1).applyQuaternion(quat);
      const hit = this.castRay(origin, dir);
      if (hit?.kind !== c.hovered?.kind || (hit?.kind === 'artifact' && c.hovered?.kind === 'artifact' && hit.artifact !== c.hovered.artifact)) {
        if (hit && hit.kind !== 'floor') this.pulse(c.source, 0.15, 20);
      }
      c.hovered = hit;
      c.line.scale.z = hit ? origin.distanceTo(hit.point) : 5;
      const lm = c.line.material as THREE.LineBasicMaterial;
      lm.color.set(hit && hit.kind !== 'floor' ? 0x7ee08a : 0xf7c95c);
      c.reticle.visible = hit?.kind === 'floor' && !this.panel.isOpen && !this.backpack.isOpen;
      if (hit?.kind === 'floor') c.reticle.position.copy(hit.point).setY(0.01);
      if (hit?.kind === 'panel') panelHovers.push(hit.object);
    }
    this.panel.setHovered(panelHovers[0] ?? null);
    this.backpack.setHovered(panelHovers[0] ?? null);

    // thumbsticks
    const session = this.renderer.xr.getSession();
    if (!session) return;
    this.snapCooldown -= dt;
    for (const src of session.inputSources) {
      const gp = src.gamepad;
      if (!gp) continue;
      // B (right) or Y (left) toggles the backpack
      const down = !!gp.buttons[5]?.pressed;
      if (down && !this.buttonWasDown.get(src)) this.toggleBackpack();
      this.buttonWasDown.set(src, down);
      if (gp.axes.length < 4) continue;
      const x = gp.axes[2], y = gp.axes[3];
      if (src.handedness === 'left') {
        if (Math.abs(x) > 0.15 || Math.abs(y) > 0.15) {
          const { dir } = this.headPose();
          dir.y = 0; dir.normalize();
          const right = new THREE.Vector3().crossVectors(dir, UP).normalize();
          const move = dir.multiplyScalar(-y).addScaledVector(right, x).multiplyScalar(2.0 * dt);
          this.moveRig(move);
        }
      } else if (src.handedness === 'right') {
        if (Math.abs(x) > 0.7 && this.snapCooldown <= 0) {
          this.snapTurn(x > 0 ? -Math.PI / 6 : Math.PI / 6);
          this.snapCooldown = 0.35;
        }
        if (Math.abs(x) < 0.3) this.snapCooldown = Math.min(this.snapCooldown, 0);
      }
    }
  }

  private moveRig(delta: THREE.Vector3) {
    const { pos } = this.headPose();
    const next = this.clampToBounds(new THREE.Vector3(pos.x + delta.x, 0, pos.z + delta.z));
    this.rig.position.x += next.x - pos.x;
    this.rig.position.z += next.z - pos.z;
  }

  private snapTurn(angle: number) {
    const { pos } = this.headPose();
    const offset = this.rig.position.clone().sub(pos);
    offset.applyAxisAngle(UP, angle);
    this.rig.position.copy(pos).add(offset);
    this.rig.rotateY(angle);
  }

  // ---------------- desktop ----------------
  private setupDesktopInput() {
    const el = this.renderer.domElement;
    el.addEventListener('pointerdown', (e) => { this.dragging = true; this.dragDist = 0; el.setPointerCapture(e.pointerId); });
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      this.mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      if (this.dragging && !this.renderer.xr.isPresenting) {
        this.dragDist += Math.abs(e.movementX) + Math.abs(e.movementY);
        this.yaw -= e.movementX * 0.004;
        this.pitch = THREE.MathUtils.clamp(this.pitch - e.movementY * 0.004, -1.3, 1.3);
        this.camera.rotation.set(this.pitch, this.yaw, 0);
      }
    });
    el.addEventListener('pointerup', () => {
      this.dragging = false;
      if (this.dragDist < 6) this.activate(this.desktopHover, null);
    });
    window.addEventListener('keydown', (e) => {
      this.keys.add(e.code);
      if (e.code === 'Escape') this.closePanel();
      if (e.code === 'KeyB' || e.code === 'KeyI') this.toggleBackpack();
    });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code));
    window.addEventListener('blur', () => this.keys.clear());
  }

  private updateDesktop(dt: number) {
    const k = this.keys;
    const f = (k.has('KeyW') || k.has('ArrowUp') ? 1 : 0) - (k.has('KeyS') || k.has('ArrowDown') ? 1 : 0);
    const s = (k.has('KeyD') || k.has('ArrowRight') ? 1 : 0) - (k.has('KeyA') || k.has('ArrowLeft') ? 1 : 0);
    if (f || s) {
      const fwd = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
      const right = new THREE.Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw));
      this.moveRig(fwd.multiplyScalar(f).addScaledVector(right, s).normalize().multiplyScalar(3 * dt));
    }
    this.raycaster.setFromCamera(this.mouse, this.camera);
    const hit = this.castRay(this.raycaster.ray.origin.clone(), this.raycaster.ray.direction.clone());
    this.desktopHover = hit && hit.kind !== 'floor' ? hit : null;
    this.renderer.domElement.style.cursor = this.desktopHover ? 'pointer' : this.dragging ? 'grabbing' : 'grab';
    this.panel.setHovered(hit?.kind === 'panel' ? hit.object : null);
    this.backpack.setHovered(hit?.kind === 'panel' ? hit.object : null);
  }

  // ---------------- loop ----------------
  private tick = () => {
    const dt = Math.min(this.clock.getDelta(), 0.1);
    const t = this.clock.elapsedTime;

    if (this.renderer.xr.isPresenting) this.updateControllers(dt);
    else this.updateDesktop(dt);

    const head = new THREE.Vector3();
    this.camera.getWorldPosition(head);

    for (const n of this.artifactNodes) {
      n.node.position.y = n.baseY + Math.sin(t * 1.6 + n.baseY * 5) * 0.04;
      const model = n.node.children[0];
      if (n.artifact.static || n.artifact.lieFlat) { n.node.position.y = n.baseY; }
      else if (model && !model.userData.billboard && !model.userData.noSpin) model.rotation.y = t * 0.6;
      n.ring.scale.setScalar(1 + Math.sin(t * 3) * 0.05);
    }
    for (const p of this.portalNodes) p.swirl.rotation.z = -t * 1.2;
    this.flames.forEach((f, i) => f.scale.set(1, 1 + Math.sin(t * 9 + i * 2) * 0.12, 1));
    this.dynamicGroup.traverse((o) => {
      if (o.userData.billboard && !o.userData.noBillboard) {
        const wp = new THREE.Vector3();
        o.getWorldPosition(wp);
        o.lookAt(head.x, wp.y, head.z);
      }
    });

    this.renderer.render(this.scene, this.camera);
  };

  private onResize = () => {
    if (this.renderer.xr.isPresenting) return;
    const w = this.container.clientWidth, h = this.container.clientHeight;
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(w, h);
  };

  dispose() {
    this.renderer.setAnimationLoop(null);
    window.removeEventListener('resize', this.onResize);
    this.disposeTree(this.scene);
    this.renderer.dispose();
    this.renderer.domElement.remove();
    this.vrButton.remove();
  }
}
