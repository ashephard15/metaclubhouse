import * as THREE from 'three';
import { CanvasPlane, roundRect, wrapText } from './canvasText';
import { ARTIFACTS, ZONES, type Artifact } from '../data/artifacts';

const BASE = import.meta.env.BASE_URL;
const W_PX = 1280;
const H_PX = 960;
const W_M = 1.2;
const COLS = 5;

/** In-world inventory grid of every artifact; collected ones show a thumbnail. */
export class BackpackPanel {
  group = new THREE.Group();
  private board = new CanvasPlane(W_PX, H_PX, W_M);
  private close = new CanvasPlane(160, 160, 0.1);
  private thumbs = new Map<string, HTMLImageElement>();
  private discovered: string[] = [];
  private hoverClose = false;

  constructor() {
    this.group.visible = false;
    this.board.mesh.userData.backpackAction = 'none';
    this.close.mesh.userData.backpackAction = 'close';
    this.close.mesh.position.set(W_M / 2 - 0.07, (W_M * H_PX) / W_PX / 2 - 0.07, 0.004);
    this.group.add(this.board.mesh, this.close.mesh);
    // Thumbnails: prefer the inspection image, otherwise the cutout PNG if one exists.
    for (const a of ARTIFACTS) {
      for (const path of [a.inspectImage, `cutouts/${a.cutout}`]) {
        if (!path) continue;
        const img = new Image();
        img.onload = () => {
          if (!this.thumbs.has(a.id) || path === a.inspectImage) this.thumbs.set(a.id, img);
          if (this.group.visible) this.redraw();
        };
        img.src = `${BASE}assets/${path}`;
      }
    }
  }

  get isOpen() { return this.group.visible; }
  get interactiveMeshes(): THREE.Object3D[] { return this.group.visible ? [this.close.mesh, this.board.mesh] : []; }

  show(discovered: string[], head: THREE.Vector3, forward: THREE.Vector3) {
    this.discovered = discovered;
    const f = forward.clone().setY(0).normalize();
    this.group.position.copy(head).addScaledVector(f, 1.2);
    this.group.position.y = head.y - 0.1;
    this.group.lookAt(head.x, this.group.position.y, head.z);
    this.group.visible = true;
    this.redraw();
  }

  hide() { this.group.visible = false; }

  setHovered(obj: THREE.Object3D | null) {
    const h = obj === this.close.mesh;
    if (h !== this.hoverClose) { this.hoverClose = h; if (this.group.visible) this.drawClose(); }
  }

  private redraw() {
    const found = new Set(this.discovered);
    this.board.draw((ctx, w, h) => {
      ctx.fillStyle = 'rgba(52,32,18,0.98)';
      roundRect(ctx, 0, 0, w, h, 56);
      ctx.fill();
      ctx.strokeStyle = '#d4a64a';
      ctx.lineWidth = 10;
      roundRect(ctx, 8, 8, w - 16, h - 16, 50);
      ctx.stroke();
      ctx.fillStyle = '#fff8e1';
      ctx.font = 'bold 60px system-ui, sans-serif';
      ctx.fillText(`🎒 Backpack  (${found.size}/${ARTIFACTS.length})`, 60, 100);

      const gx = 60, gy = 150, cellW = (w - 120) / COLS, rows = Math.ceil(ARTIFACTS.length / COLS);
      const cellH = (h - gy - 50) / rows;
      ARTIFACTS.forEach((a, i) => {
        const x = gx + (i % COLS) * cellW + 8;
        const y = gy + Math.floor(i / COLS) * cellH + 8;
        const cw = cellW - 16, ch = cellH - 16;
        const has = found.has(a.id);
        ctx.fillStyle = has ? '#5a3d20' : '#2e1f12';
        roundRect(ctx, x, y, cw, ch, 22);
        ctx.fill();
        const imgH = ch - 70;
        if (has) this.drawThumb(ctx, a, x + 10, y + 10, cw - 20, imgH);
        else {
          ctx.fillStyle = '#6b5236';
          ctx.font = 'bold 90px system-ui, sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('?', x + cw / 2, y + 10 + imgH / 2 + 32);
          ctx.textAlign = 'left';
        }
        ctx.fillStyle = has ? '#fff8e1' : '#8a7356';
        ctx.font = 'bold 24px system-ui, sans-serif';
        ctx.textAlign = 'center';
        const label = has ? a.name : ZONES[a.zone].name;
        wrapText(ctx, label, cw - 16).slice(0, 2).forEach((l, li) => ctx.fillText(l, x + cw / 2, y + imgH + 38 + li * 26));
        ctx.textAlign = 'left';
      });
    });
    this.drawClose();
  }

  private drawThumb(ctx: CanvasRenderingContext2D, a: Artifact, x: number, y: number, w: number, h: number) {
    const img = this.thumbs.get(a.id);
    ctx.save();
    roundRect(ctx, x, y, w, h, 16);
    ctx.clip();
    if (img) {
      // contain-fit: keep the picture's aspect ratio
      const s = Math.min(w / img.width, h / img.height);
      const dw = img.width * s, dh = img.height * s;
      ctx.fillStyle = '#1f150c';
      ctx.fillRect(x, y, w, h);
      ctx.drawImage(img, x + (w - dw) / 2, y + (h - dh) / 2, dw, dh);
    } else {
      const c = `#${a.color.toString(16).padStart(6, '0')}`;
      ctx.fillStyle = '#1f150c';
      ctx.fillRect(x, y, w, h);
      ctx.fillStyle = c;
      ctx.beginPath();
      ctx.arc(x + w / 2, y + h / 2, Math.min(w, h) * 0.32, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#fff8e1';
      ctx.font = 'bold 48px system-ui, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(a.name[0], x + w / 2, y + h / 2 + 17);
      ctx.textAlign = 'left';
    }
    ctx.restore();
  }

  private drawClose() {
    const hc = this.hoverClose;
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
}
