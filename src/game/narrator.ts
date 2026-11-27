/** Plays the pre-recorded teacher narration (public/assets/voice/*.mp3). One clip at a time. */
const BASE = import.meta.env.BASE_URL;
const STORAGE_KEY = 'time-explorers-voice-on';

export class Narrator {
  private audio = new Audio();
  private lastCorrect = 0;
  private lastWrong = 0;
  enabled = true;

  constructor() {
    this.audio.preload = 'auto';
    try { this.enabled = localStorage.getItem(STORAGE_KEY) !== 'off'; } catch { /* storage unavailable */ }
  }

  setEnabled(on: boolean) {
    this.enabled = on;
    if (!on) this.stop();
    try { localStorage.setItem(STORAGE_KEY, on ? 'on' : 'off'); } catch { /* storage unavailable */ }
  }

  play(clip: string) {
    if (!this.enabled) return;
    this.audio.pause();
    this.audio.src = `${BASE}assets/voice/${clip}.mp3`;
    this.audio.currentTime = 0;
    void this.audio.play().catch(() => { /* missing clip or blocked: stay silent */ });
  }

  stop() { this.audio.pause(); }

  correct() { this.lastCorrect = (this.lastCorrect % 4) + 1; this.play(`correct-${this.lastCorrect}`); }
  wrong() { this.lastWrong = (this.lastWrong % 3) + 1; this.play(`wrong-${this.lastWrong}`); }
}
