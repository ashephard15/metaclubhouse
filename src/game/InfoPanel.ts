import * as THREE from 'three';
import { CanvasPlane, roundRect, wrapText } from './canvasText';
import { ZONES, type Artifact, type InfoPoint } from '../data/artifacts';

const PX = 1024;
const M = 1.0; // panel width in metres
const toM = (px: number) => (px / PX) * M;
const IMAGE_MAX_W = 0.9; // metres
const IMAGE_MAX_H = 0.8;
const HINGE = 0.38; // radians the image leaf is angled toward the viewer
const BASE = import.meta.env.BASE_URL;

type Feedback = 'ask' | 'wrong' | 'correct' | 'already';

/**
 * World-space panel that shows an artifact's field note + quiz, or an info point's text.
 * An optional inspection image is shown on a hinged leaf to the left, aspect ratio preserved.
 * Works identically for desktop mouse and Quest controller rays.
 */
export class InfoPanel {
  group = new THREE.Group();
  private bg = new CanvasPlane(PX, PX, M);
  private buttons: CanvasPlane[] = [];
  private close = new CanvasPlane(160, 160, toM(110));
  private imageLeaf = new THREE.Group();
  private imageMesh: THREE.Mesh | null = null;
  private loader = new THREE.TextureLoader();
  private textures = new Map<string, THREE.Texture>();
  private imageToken = 0;

  artifact: Artifact | null = null;
  info: InfoPoint | null = null;
  private wrong = new Set<number>();
  private feedback: Feedback = 'ask';
  private hovered: THREE.Object3D | null = null;

  constructor() {
    this.group.visible = false;
    this.group.add(this.bg.mesh, this.imageLeaf);
    for (let i = 0; i < 3; i++) {
      const b = new CanvasPlane(PX, 96, toM(920));
      b.mesh.position.set(0, M / 2 - toM(690 + i * 100 + 43), 0.004);
      b.mesh.userData.panelAction = { type: 'answer', index: i };
      this.buttons.push(b);
      this.group.add(b.mesh);
    }
    this.close.mesh.position.set(M / 2 - toM(80), M / 2 - toM(80), 0.004);
    this.close.mesh.userData.panelAction = { type: 'close' };
    this.group.add(this.close.mesh);
    this.bg.mesh.userData.panelAction = { type: 'none' };
    // Hinge sits on the panel's left edge
    this.imageLeaf.position.set(-M / 2 - 0.02, 0, 0);
    this.imageLeaf.rotation.y = HINGE;
  }

  get isOpen() { return this.group.visible; }

  get interactiveMeshes(): THREE.Object3D[] {
    if (!this.group.visible) return [];
    const list: THREE.Object3D[] = [this.close.mesh, this.bg.mesh];
    if (this.artifact) list.push(...this.buttons.map((b) => b.mesh));
    if (this.imageMesh) list.push(this.imageMesh);
    return list;
  }

  open(a: Artifact, alreadyFound: boolean) {
    this.artifact = a;
    this.info = null;
    this.wrong.clear();
    this.feedback = alreadyFound ? 'already' : 'ask';
    this.buttons.forEach((b) => (b.mesh.visible = true));
    this.group.visible = true;
    this.setImage(a.inspectImage);
    this.redraw();
  }

  openInfo(p: InfoPoint) {
    this.artifact = null;
    this.info = p;
    this.buttons.forEach((b) => (b.mesh.visible = false));
    this.group.visible = true;
    this.setImage(p.image);
    this.redraw();
  }

  hide() {
    this.group.visible = false;
    this.artifact = null;
    this.info = null;
  }

  /** returns 'correct' | 'wrong' | 'close' | null */
  activate(obj: THREE.Object3D): 'correct' | 'wrong' | 'close' | null {
    const act = obj.userData.panelAction as { type: string; index?: number } | undefined;
    if (!act || !this.group.visible) return null;
    if (act.type === 'close') {
      this.hide();
      return 'close';
    }
    if (act.type === 'answer' && act.index !== undefined && this.artifact) {
      if (this.feedback === 'correct' || this.feedback === 'already') return null;
      if (act.index === this.artifact.quiz.answerIndex) {
        this.feedback = 'correct';
        this.redraw();
        return 'correct';
      }
      this.wrong.add(act.index);
      this.feedback = 'wrong';
      this.redraw();
      return 'wrong';
    }
    return null;
  }

  setHovered(obj: THREE.Object3D | null) {
    if (obj === this.hovered) return;
    this.hovered = obj;
    if (this.group.visible) this.redrawButtons();
  }

  // ---------- inspection image (aspect-ratio preserving, flat) ----------
  private setImage(path?: string) {
    const token = ++this.imageToken;
    if (this.imageMesh) {
      this.imageLeaf.remove(this.imageMesh);
      this.imageMesh.traverse((o) => {
        const m = o as THREE.Mesh;
        m.geometry?.dispose();
        (m.material as THREE.Material | undefined)?.dispose();
      });
      this.imageMesh = null;
    }
    if (!path) return;
    const apply = (tex: THREE.Texture) => {
      if (token !== this.imageToken) return; // panel changed while loading
      const img = tex.image as HTMLImageElement;
      const aspect = img.width / img.height;
      let w = IMAGE_MAX_W;
      let h = w / aspect;
      if (h > IMAGE_MAX_H) { h = IMAGE_MAX_H; w = h * aspect; }
      const frame = new THREE.Mesh(
        new THREE.PlaneGeometry(w, h),
        new THREE.MeshBasicMaterial({ map: tex, toneMapped: false, fog: false }),
      );
      frame.position.set(-w / 2, M / 2 - h / 2 - 0.02, 0);
      frame.userData.panelAction = { type: 'none' };
      const border = new THREE.Mesh(new THREE.PlaneGeometry(w + 0.03, h + 0.03), new THREE.MeshBasicMaterial({ color: 0xd4a64a, fog: false }));
      border.position.z = -0.002;
      frame.add(border);
      this.imageMesh = frame;
      this.imageLeaf.add(frame);
    };
    const cached = this.textures.get(path);
    if (cached) { apply(cached); return; }
    this.loader.load(`${BASE}assets/${path}`, (tex) => {
      tex.colorSpace = THREE.SRGBColorSpace;
      tex.anisotropy = 8;
      this.textures.set(path, tex);
      apply(tex);
    }, undefined, () => { /* missing image: panel still works without it */ });
  }

  // ---------- drawing ----------
  private frame(ctx: CanvasRenderingContext2D, w: number, h: number) {
    ctx.fillStyle = 'rgba(28,20,12,0.98)';
    roundRect(ctx, 0, 0, w, h, 48);
    ctx.fill();
    ctx.strokeStyle = '#d4a64a';
    ctx.lineWidth = 8;
    roundRect(ctx, 6, 6, w - 12, h - 12, 44);
    ctx.stroke();
  }

  private redraw() {
    if (this.info) { this.drawInfo(this.info); this.redrawButtons(); return; }
    const a = this.artifact!;
    this.bg.draw((ctx, w, h) => {
      this.frame(ctx, w, h);
      ctx.fillStyle = '#f7c95c';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText(ZONES[a.zone].name.toUpperCase(), 56, 72);
      ctx.fillStyle = '#fff8e1';
      ctx.font = 'bold 60px system-ui, sans-serif';
      ctx.fillText(a.name, 56, 140, w - 220);

      ctx.fillStyle = '#c9b48a';
      ctx.font = 'italic 28px system-ui, sans-serif';
      ctx.fillText('Field note', 56, 200);
      ctx.fillStyle = '#f3ead6';
      ctx.font = '34px system-ui, sans-serif';
      wrapText(ctx, a.fieldNote, w - 112).slice(0, 7).forEach((l, i) => ctx.fillText(l, 56, 248 + i * 44));

      ctx.fillStyle = '#f7c95c';
      ctx.font = 'bold 36px system-ui, sans-serif';
      wrapText(ctx, a.quiz.question, w - 112).slice(0, 2).forEach((l, i) => ctx.fillText(l, 56, 570 + i * 44));

      const fb: Record<Feedback, [string, string]> = {
        ask: ['Pick an answer to add this to your backpack', '#c9b48a'],
        wrong: ['Not quite. Try another answer!', '#ff8a80'],
        correct: ['Correct! Added to your backpack.', '#7ee08a'],
        already: ['Already in your backpack. Great memory!', '#7ee08a'],
      };
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillStyle = fb[this.feedback][1];
      ctx.fillText(fb[this.feedback][0], 56, 668);
    });
    this.redrawButtons();
  }

  private drawInfo(p: InfoPoint) {
    this.bg.draw((ctx, w, h) => {
      this.frame(ctx, w, h);
      ctx.fillStyle = '#f7c95c';
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillText(`${ZONES[p.zone].name.toUpperCase()} · ${p.kind === 'sign' ? 'SIGN' : 'FIELD GUIDE'}`, 56, 72);
      ctx.fillStyle = '#fff8e1';
      ctx.font = 'bold 56px system-ui, sans-serif';
      wrapText(ctx, p.title, w - 220).slice(0, 2).forEach((l, i) => ctx.fillText(l, 56, 140 + i * 64));
      ctx.fillStyle = '#f3ead6';
      ctx.font = '38px system-ui, sans-serif';
      wrapText(ctx, p.body, w - 112).slice(0, 12).forEach((l, i) => ctx.fillText(l, 56, 300 + i * 52));
      ctx.fillStyle = '#c9b48a';
      ctx.font = 'italic 28px system-ui, sans-serif';
      ctx.fillText('Select ✕ (or press Esc) to close', 56, h - 56);
    });
  }

  private redrawButtons() {
    const a = this.artifact;
    if (a) {
      const solved = this.feedback === 'correct' || this.feedback === 'already';
      this.buttons.forEach((b, i) => {
        const hover = this.hovered === b.mesh && !solved;
        const isAnswer = i === a.quiz.answerIndex;
        let fill = hover ? '#7a5a2a' : '#4a3720';
        let text = '#fff8e1';
        if (this.wrong.has(i)) { fill = '#5a2a2a'; text = '#ff9e9e'; }
        if (solved && isAnswer) { fill = '#2f6b3a'; }
        b.draw((ctx, w, h) => {
          ctx.fillStyle = fill;
          roundRect(ctx, 0, 0, w, h, 28);
          ctx.fill();
          if (hover) { ctx.strokeStyle = '#f7c95c'; ctx.lineWidth = 5; roundRect(ctx, 3, 3, w - 6, h - 6, 26); ctx.stroke(); }
          ctx.fillStyle = text;
          ctx.font = 'bold 36px system-ui, sans-serif';
          ctx.textBaseline = 'middle';
          const prefix = solved && isAnswer ? '✓ ' : this.wrong.has(i) ? '✗ ' : `${'ABC'[i]}.  `;
          ctx.fillText(prefix + a.quiz.options[i], 36, h / 2 + 2, w - 72);
        });
      });
    }
    const hc = this.hovered === this.close.mesh;
    this.close.draw((ctx, w, h) => {
      ctx.fillStyle = hc ? '#b4492f' : '#6b2f22';
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, w / 2 - 4, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#fff8e1';
      ctx.lineWidth = 14;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(52, 52); ctx.lineTo(w - 52, h - 52);
      ctx.moveTo(w - 52, 52); ctx.lineTo(52, h - 52);
      ctx.stroke();
    });
  }

  /**
   * Place the panel in front of the viewer at chest height, facing them.
   * With an image, the pair is pushed back a little and shifted right so picture + text are centred.
   */
  placeInFront(head: THREE.Vector3, forward: THREE.Vector3, withImage: boolean) {
    const f = forward.clone().setY(0).normalize();
    const dist = withImage ? 1.35 : 1.0;
    this.group.position.copy(head).addScaledVector(f, dist);
    this.group.position.y = head.y - 0.15;
    this.group.lookAt(head.x, this.group.position.y, head.z);
    if (withImage) this.group.translateX(0.42);
  }
}
