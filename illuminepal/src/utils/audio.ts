// Web Audio API sound generator for gentle wellness chimes without external audio dependencies

class AudioService {
  private ctx: AudioContext | null = null;

  private getContext(): AudioContext {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  /**
   * Play a gentle multi-tone zen chime when a break starts
   */
  playBreakStart() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Frequencies for a soothing major chord chime (C5, E5, G5, C6)
      const frequencies = [523.25, 659.25, 783.99, 1046.5];

      frequencies.forEach((freq, index) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + index * 0.12);

        gain.gain.setValueAtTime(0.001, now + index * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.18, now + index * 0.12 + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + index * 0.12 + 2.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 2.6);
      });
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }

  /**
   * Play a joyful completion chime when break finishes
   */
  playBreakComplete() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;

      // Uplifting two-tone chime (G5 -> C6)
      const notes = [
        { freq: 783.99, time: 0 },
        { freq: 1046.5, time: 0.18 },
      ];

      notes.forEach((note) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = "triangle";
        osc.frequency.setValueAtTime(note.freq, now + note.time);

        gain.gain.setValueAtTime(0.001, now + note.time);
        gain.gain.exponentialRampToValueAtTime(0.2, now + note.time + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.time + 1.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.time);
        osc.stop(now + note.time + 1.9);
      });
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }
}

export const audioService = new AudioService();
