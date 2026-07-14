class SoundEngine {
  constructor() {
    this.ctx = null;
    this.enabled = true;
    this.suspenseInterval = null;

    // Unlock WebAudio on first user gesture anywhere on screen
    const unlockAudio = () => {
      this.init();
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
    window.addEventListener('click', unlockAudio);
    window.addEventListener('keydown', unlockAudio);
  }

  init() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  toggleSound() {
    this.enabled = !this.enabled;
    if (this.enabled) {
      this.init();
    }
    return this.enabled;
  }

  // Pre-Draw Background Tension Music Disabled
  playBackgroundBgm() {
    // Disabled per user request
  }

  stopBackgroundBgm() {
    // Disabled
  }

  // Play particle lock-in tick sound
  playTick() {
    if (!this.enabled) return;
    this.init();

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800 + Math.random() * 400, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.05);

      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    } catch (e) {}
  }

  // Custom Suspense Tension Music Track for Canon Lucky Draw (Spin Tension Track)
  playSpinStart(duration = 2.5) {
    if (!this.enabled) return;
    this.init();

    try {
      const now = this.ctx.currentTime;

      // 1. Cinematic Rising Riser
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(120, now);
      osc.frequency.exponentialRampToValueAtTime(960, now + duration);

      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.3, now + duration * 0.85);
      gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(450, now);
      filter.frequency.linearRampToValueAtTime(4500, now + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + duration);

      // 2. Dramatic Arpeggiated Suspense Pulse Beats
      const arpNotes = [220, 261.63, 329.63, 392.00, 440, 523.25, 659.25, 783.99]; // Minor 7th Tension Arpeggio
      let stepCount = 0;
      const totalSteps = 16;
      const stepInterval = (duration * 1000) / totalSteps;

      if (this.suspenseInterval) clearInterval(this.suspenseInterval);

      this.suspenseInterval = setInterval(() => {
        if (stepCount >= totalSteps) {
          clearInterval(this.suspenseInterval);
          return;
        }

        const noteTime = this.ctx.currentTime;
        const arpOsc = this.ctx.createOscillator();
        const arpGain = this.ctx.createGain();

        arpOsc.type = 'square';
        arpOsc.frequency.setValueAtTime(arpNotes[stepCount % arpNotes.length] * (1 + (stepCount / totalSteps) * 0.5), noteTime);

        arpGain.gain.setValueAtTime(0.12, noteTime);
        arpGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.09);

        arpOsc.connect(arpGain);
        arpGain.connect(this.ctx.destination);
        arpOsc.start(noteTime);
        arpOsc.stop(noteTime + 0.09);

        // Heartbeat pulse every 4th step
        if (stepCount % 4 === 0) {
          const subOsc = this.ctx.createOscillator();
          const subGain = this.ctx.createGain();
          subOsc.type = 'triangle';
          subOsc.frequency.setValueAtTime(100, noteTime);
          subOsc.frequency.exponentialRampToValueAtTime(35, noteTime + 0.18);

          subGain.gain.setValueAtTime(0.4, noteTime);
          subGain.gain.exponentialRampToValueAtTime(0.001, noteTime + 0.18);

          subOsc.connect(subGain);
          subGain.connect(this.ctx.destination);
          subOsc.start(noteTime);
          subOsc.stop(noteTime + 0.18);
        }

        stepCount++;
      }, stepInterval);
    } catch (e) {}
  }

  // Laser Explosion Shockwave reveal sound
  playRevealExplosion() {
    if (!this.enabled) return;
    this.init();

    try {
      const now = this.ctx.currentTime;

      // Sub-bass impact
      const subOsc = this.ctx.createOscillator();
      const subGain = this.ctx.createGain();
      subOsc.type = 'triangle';
      subOsc.frequency.setValueAtTime(180, now);
      subOsc.frequency.exponentialRampToValueAtTime(30, now + 0.6);

      subGain.gain.setValueAtTime(0.7, now);
      subGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      subOsc.connect(subGain);
      subGain.connect(this.ctx.destination);
      subOsc.start();
      subOsc.stop(now + 0.6);

      // Laser Synth Blast
      const synthOsc = this.ctx.createOscillator();
      const synthGain = this.ctx.createGain();
      synthOsc.type = 'sawtooth';
      synthOsc.frequency.setValueAtTime(1600, now);
      synthOsc.frequency.exponentialRampToValueAtTime(400, now + 0.35);

      synthGain.gain.setValueAtTime(0.35, now);
      synthGain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      synthOsc.connect(synthGain);
      synthGain.connect(this.ctx.destination);
      synthOsc.start();
      synthOsc.stop(now + 0.35);
    } catch (e) {}
  }

  // Victory fanfare synth arpeggio
  playVictoryFanfare() {
    if (!this.enabled) return;
    this.init();

    try {
      const now = this.ctx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50, 1318.51]; // C5, E5, G5, C6, E6

      notes.forEach((freq, index) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + index * 0.08);

        const startTime = now + index * 0.08;
        const noteDuration = index === notes.length - 1 ? 0.8 : 0.25;

        gain.gain.setValueAtTime(0, startTime);
        gain.gain.linearRampToValueAtTime(0.25, startTime + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + noteDuration);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(startTime);
        osc.stop(startTime + noteDuration);
      });
    } catch (e) {}
  }
}

window.soundEngine = new SoundEngine();
