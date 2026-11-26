import * as THREE from 'three';
import { CanvasPlane, roundRect, wrapText } from './canvasText';
import { ZONES, type Artifact } from '../data/artifacts';

const PX = 1024;
const M = 1.0; // panel width in metres
const toM = (px: number) => (px / PX) * M;

type Feedback = 'ask' | 'wrong' | 'correct' | 'already';

/**
 * World-space panel that shows an artifact's field note + quiz.
 * Works identically for desktop mouse and Quest controller rays.
 */
export class InfoPanel {
  group = new THREE.Group();
  private bg = new CanvasPlane(PX, PX, M);
  private buttons: CanvasPlane[] = [];
  private close = new CanvasPlane(160, 160, toM(110));
  artifact: Artifact | null = null;
  private wrong = new Set<number>();
  private feedback: Feedback = 'ask';
  private hovered: THREE.Object3D | null = null;

  constructor() {
    this.group.visible = false;
    this.group.add(this.bg.mesh);
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
  }

  get interactiveMeshes(): THREE.Object3D[] {
    return this.group.visible ? [this.close.mesh, ...this.buttons.map((b) => b.mesh), this.bg.mesh] : [];
  }

  open(a: Artifact, alreadyFound: boolean) {
    this.artifact = a;
    this.wrong.clear();
    this.feedback = alreadyFound ? 'already' : 'ask';
    this.group.visible = true;
    this.redraw();
  }

  hide() {
    this.group.visible = false;
    this.artifact = null;
  }

  /** returns 'correct' | 'wrong' | 'close' | null */
  activate(obj: THREE.Object3D): 'correct' | 'wrong' | 'close' | null {
    const act = obj.userData.panelAction as { type: string; index?: number } | undefined;
    if (!act || !this.artifact) return null;
    if (act.type === 'close') {
      this.hide();
      return 'close';
    }
    if (act.type === 'answer' && act.index !== undefined) {
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

  private redraw() {
    const a = this.artifact!;
    this.bg.draw((ctx, w, h) => {
      ctx.fillStyle = 'rgba(28,20,12,0.98)';
      roundRect(ctx, 0, 0, w, h, 48);
      ctx.fill();
      ctx.strokeStyle = '#d4a64a';
      ctx.lineWidth = 8;
      roundRect(ctx, 6, 6, w - 12, h - 12, 44);
      ctx.stroke();

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
      wrapText(ctx, a.fieldNote, w - 112).slice(0, 8).forEach((l, i) => ctx.fillText(l, 56, 248 + i * 44));

      ctx.fillStyle = '#f7c95c';
      ctx.font = 'bold 36px system-ui, sans-serif';
      wrapText(ctx, a.quiz.question, w - 112).slice(0, 2).forEach((l, i) => ctx.fillText(l, 56, 570 + i * 44));

      const fb: Record<Feedback, [string, string]> = {
        ask: ['Pick an answer to collect this artifact', '#c9b48a'],
        wrong: ['Not quite — try another answer!', '#ff8a80'],
        correct: ['Correct! Added to your Explorer collection.', '#7ee08a'],
        already: ['Already in your collection — great memory!', '#7ee08a'],
      };
      ctx.font = 'bold 30px system-ui, sans-serif';
      ctx.fillStyle = fb[this.feedback][1];
      ctx.fillText(fb[this.feedback][0], 56, 668);
    });
    this.redrawButtons();
  }

  private redrawButtons() {
    const a = this.artifact;
    if (!a) return;
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

  /** Place panel ~1 m in front of the viewer at chest height, facing them. */
  placeInFront(head: THREE.Vector3, forward: THREE.Vector3) {
    const f = forward.clone().setY(0).normalize();
    this.group.position.copy(head).addScaledVector(f, 1.0);
    this.group.position.y = head.y - 0.15;
    this.group.lookAt(head.x, this.group.position.y, head.z);
  }
}
