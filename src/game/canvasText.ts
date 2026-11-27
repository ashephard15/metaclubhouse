import * as THREE from 'three';

export function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(' ');
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    const test = line ? `${line} ${w}` : w;
    if (ctx.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = w;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** A plane mesh whose face is drawn with a 2D canvas. Width in metres; height follows canvas aspect. */
export class CanvasPlane {
  canvas: HTMLCanvasElement;
  ctx: CanvasRenderingContext2D;
  texture: THREE.CanvasTexture;
  mesh: THREE.Mesh;

  constructor(pxW: number, pxH: number, metresW: number) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = pxW;
    this.canvas.height = pxH;
    this.ctx = this.canvas.getContext('2d')!;
    this.texture = new THREE.CanvasTexture(this.canvas);
    this.texture.colorSpace = THREE.SRGBColorSpace;
    this.texture.anisotropy = 4;
    const mat = new THREE.MeshBasicMaterial({ map: this.texture, transparent: true, depthTest: true, fog: false, toneMapped: false });
    this.mesh = new THREE.Mesh(new THREE.PlaneGeometry(metresW, (metresW * pxH) / pxW), mat);
  }

  draw(fn: (ctx: CanvasRenderingContext2D, w: number, h: number) => void) {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    fn(this.ctx, this.canvas.width, this.canvas.height);
    this.texture.needsUpdate = true;
  }

  dispose() {
    this.texture.dispose();
    this.mesh.geometry.dispose();
    (this.mesh.material as THREE.Material).dispose();
  }
}

/** Simple floating label (always readable from front). */
export function makeLabel(text: string, metresW = 1.4, color = '#fff8e1', bg = 'rgba(20,14,8,0.75)'): CanvasPlane {
  const p = new CanvasPlane(1024, 220, metresW); // high-res so text stays crisp up close and in the headset
  (p.texture as THREE.Texture).generateMipmaps = true;
  p.texture.minFilter = THREE.LinearMipmapLinearFilter;
  p.draw((ctx, w, h) => {
    ctx.fillStyle = bg;
    roundRect(ctx, 6, 6, w - 12, h - 12, 80);
    ctx.fill();
    ctx.fillStyle = color;
    let size = 112;
    do { ctx.font = `bold ${size}px system-ui, sans-serif`; size -= 4; } while (ctx.measureText(text).width > w - 90 && size > 40);
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, w / 2, h / 2 + 4);
  });
  return p;
}
