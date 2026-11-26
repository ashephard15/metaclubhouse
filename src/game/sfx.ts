/** Tiny synthesized sound effects — no audio files needed. */
export class Sfx {
  private ctx: AudioContext | null = null;

  unlock() {
    if (!this.ctx) {
      try { this.ctx = new AudioContext(); } catch { return; }
    }
    if (this.ctx.state === 'suspended') void this.ctx.resume();
  }

  private tone(freq: number, start: number, dur: number, type: OscillatorType = 'sine', gain = 0.18) {
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime + start;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(this.ctx.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  click() { this.unlock(); this.tone(880, 0, 0.08, 'triangle', 0.1); }
  wrong() { this.unlock(); this.tone(220, 0, 0.18, 'square', 0.08); this.tone(180, 0.12, 0.22, 'square', 0.08); }
  correct() { this.unlock(); [523, 659, 784].forEach((f, i) => this.tone(f, i * 0.09, 0.3, 'triangle')); }
  portal() {
    this.unlock();
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const o = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    o.frequency.setValueAtTime(200, t0);
    o.frequency.exponentialRampToValueAtTime(1200, t0 + 0.6);
    g.gain.setValueAtTime(0.12, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.7);
    o.connect(g).connect(this.ctx.destination);
    o.start(t0);
    o.stop(t0 + 0.75);
  }
  fanfare() { this.unlock(); [523, 659, 784, 1047, 784, 1047].forEach((f, i) => this.tone(f, i * 0.14, 0.4, 'triangle', 0.2)); }
}
