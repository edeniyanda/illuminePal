// Optimized Web Audio API sound generator with zero-leak audio node disposal & automatic context suspension

class AudioService {
  private ctx: AudioContext | null = null;
  private suspendTimeout: number | null = null;

  private getContext(): AudioContext {
    if (this.suspendTimeout !== null) {
      clearTimeout(this.suspendTimeout);
      this.suspendTimeout = null;
    }

    if (!this.ctx) {
      const AudioContextClass =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioContextClass();
    }

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }
    return this.ctx;
  }

  private scheduleContextIdle() {
    if (this.suspendTimeout !== null) {
      clearTimeout(this.suspendTimeout);
    }
    // Suspend audio context after 3 seconds of silence to release hardware audio buffer pools
    this.suspendTimeout = window.setTimeout(() => {
      if (this.ctx && this.ctx.state === "running") {
        this.ctx.suspend();
      }
      this.suspendTimeout = null;
    }, 3000);
  }

  /**
   * Play a gentle multi-tone zen chime when a break starts
   */
  playBreakStart() {
    try {
      const ctx = this.getContext();
      const now = ctx.currentTime;
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

        // Immediate garbage collection cleanup when note ends
        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {
            // Already disconnected
          }
        };

        osc.start(now + index * 0.12);
        osc.stop(now + index * 0.12 + 2.6);
      });

      this.scheduleContextIdle();
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

        // Immediate garbage collection cleanup when note ends
        osc.onended = () => {
          try {
            osc.disconnect();
            gain.disconnect();
          } catch {
            // Already disconnected
          }
        };

        osc.start(now + note.time);
        osc.stop(now + note.time + 1.9);
      });

      this.scheduleContextIdle();
    } catch (e) {
      console.warn("Audio playback failed:", e);
    }
  }

  /**
   * Explicitly destroy Web Audio resources
   */
  destroy() {
    if (this.suspendTimeout !== null) {
      clearTimeout(this.suspendTimeout);
      this.suspendTimeout = null;
    }
    if (this.ctx) {
      this.ctx.close();
      this.ctx = null;
    }
  }
}

export const audioService = new AudioService();
