/**
 * Procedural Zen Ambient Soundscape Generator using Web Audio API.
 * 100% self-contained — No external audio files or network requests required.
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterGain = null;
    this.limiter = null;
    this.isPlaying = false;
    this.isMuted = true;
    this.currentTheme = 'light'; // 'light' or 'dark'

    // Sound Generators
    this.oceanNode = null;
    this.rainNode = null;
    this.windNode = null;
    this.isInitialized = false;
  }

  /**
   * Initialize AudioContext upon user gesture.
   */
  async init() {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Dynamics Limiter (prevents clipping and harsh spikes)
    this.limiter = this.ctx.createDynamicsCompressor();
    this.limiter.threshold.setValueAtTime(-14, this.ctx.currentTime);
    this.limiter.knee.setValueAtTime(25, this.ctx.currentTime);
    this.limiter.ratio.setValueAtTime(10, this.ctx.currentTime);
    this.limiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.limiter.release.setValueAtTime(0.25, this.ctx.currentTime);

    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.setValueAtTime(0, this.ctx.currentTime);

    this.masterGain.connect(this.limiter);
    this.limiter.connect(this.ctx.destination);

    // Setup procedural generators
    this.setupOceanGenerator();
    this.setupRainGenerator();
    this.setupWindGenerator();

    this.isInitialized = true;
  }

  /**
   * Create looping noise buffer (White, Pink, Brown)
   */
  createNoiseBuffer(type = 'pink', durationSeconds = 4) {
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let brownLast = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'white') {
        output[i] = white * 0.15;
      } else if (type === 'pink') {
        // Paul Kellet's Pink Noise Algorithm
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        output[i] = pink * 0.035;
      } else if (type === 'brown') {
        // Leaky Integrator Brown Noise (-6dB/oct)
        brownLast = (brownLast + (0.02 * white)) / 1.02;
        output[i] = brownLast * 0.45;
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  /**
   * Procedural Ocean Generator (Brown noise swell + pink noise foam sweep)
   */
  setupOceanGenerator() {
    const oceanGain = this.ctx.createGain();
    oceanGain.gain.setValueAtTime(0.35, this.ctx.currentTime);

    // Deep Swell
    const swellNoise = this.createNoiseBuffer('brown', 5);
    const swellFilter = this.ctx.createBiquadFilter();
    swellFilter.type = 'lowpass';
    swellFilter.frequency.value = 180;
    swellFilter.Q.value = 2.5;

    // Surf Foam
    const foamNoise = this.createNoiseBuffer('pink', 4);
    const foamFilter = this.ctx.createBiquadFilter();
    foamFilter.type = 'bandpass';
    foamFilter.frequency.value = 750;
    foamFilter.Q.value = 1.2;

    const foamGain = this.ctx.createGain();
    foamGain.gain.value = 0.22;

    // LFO for Rhythmic Wave Swells (0.09 Hz = ~11s wave cycle)
    const waveLFO = this.ctx.createOscillator();
    waveLFO.type = 'sine';
    waveLFO.frequency.value = 0.09;

    const swellFilterMod = this.ctx.createGain();
    swellFilterMod.gain.value = 220;

    const foamFilterMod = this.ctx.createGain();
    foamFilterMod.gain.value = 500;

    waveLFO.connect(swellFilterMod);
    swellFilterMod.connect(swellFilter.frequency);

    waveLFO.connect(foamFilterMod);
    foamFilterMod.connect(foamFilter.frequency);

    swellNoise.connect(swellFilter);
    swellFilter.connect(oceanGain);

    foamNoise.connect(foamFilter);
    foamFilter.connect(foamGain);
    foamGain.connect(oceanGain);

    oceanGain.connect(this.masterGain);

    swellNoise.start();
    foamNoise.start();
    waveLFO.start();

    this.oceanNode = { gain: oceanGain };
  }

  /**
   * Procedural Rain Generator (Pink noise body + stochastic droplet pops)
   */
  setupRainGenerator() {
    const rainGain = this.ctx.createGain();
    rainGain.gain.setValueAtTime(0.2, this.ctx.currentTime);

    // Background Rain
    const bgNoise = this.createNoiseBuffer('pink', 4);
    const bgLow = this.ctx.createBiquadFilter();
    bgLow.type = 'lowpass';
    bgLow.frequency.value = 1400;

    const bgHigh = this.ctx.createBiquadFilter();
    bgHigh.type = 'highpass';
    bgHigh.frequency.value = 300;

    bgNoise.connect(bgHigh);
    bgHigh.connect(bgLow);
    bgLow.connect(rainGain);
    rainGain.connect(this.masterGain);
    bgNoise.start();

    // Stochastic Rain Droplets
    const triggerDrop = () => {
      if (!this.isPlaying || this.isMuted || !this.ctx) {
        setTimeout(triggerDrop, 200);
        return;
      }
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 1200 + Math.random() * 2000;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.03);

      gain.gain.setValueAtTime(0.04 + Math.random() * 0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(rainGain);

      osc.start(now);
      osc.stop(now + 0.035);

      const next = 60 + Math.random() * 180;
      setTimeout(triggerDrop, next);
    };
    triggerDrop();

    this.rainNode = { gain: rainGain };
  }

  /**
   * Procedural Wind Generator (Pink noise + dual resonant bandpass)
   */
  setupWindGenerator() {
    const windGain = this.ctx.createGain();
    windGain.gain.setValueAtTime(0.25, this.ctx.currentTime);

    const noise = this.createNoiseBuffer('pink', 5);
    const windFilter = this.ctx.createBiquadFilter();
    windFilter.type = 'bandpass';
    windFilter.frequency.value = 450;
    windFilter.Q.value = 3.0;

    // Dual out-of-phase LFOs
    const lfo1 = this.ctx.createOscillator();
    lfo1.frequency.value = 0.06; // 16.6s
    const lfo1Gain = this.ctx.createGain();
    lfo1Gain.gain.value = 280;

    const lfo2 = this.ctx.createOscillator();
    lfo2.frequency.value = 0.09; // 11.1s
    const lfo2Gain = this.ctx.createGain();
    lfo2Gain.gain.value = 160;

    lfo1.connect(lfo1Gain);
    lfo2.connect(lfo2Gain);
    lfo1Gain.connect(windFilter.frequency);
    lfo2Gain.connect(windFilter.frequency);

    noise.connect(windFilter);
    windFilter.connect(windGain);
    windGain.connect(this.masterGain);

    noise.start();
    lfo1.start();
    lfo2.start();

    this.windNode = { gain: windGain };
  }

  /**
   * Play modal Tibetan Singing Bowl / Chime
   */
  playChime(fundamental = 216, duration = 8) {
    if (!this.ctx || this.isMuted) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const bowlGain = this.ctx.createGain();
    bowlGain.connect(this.masterGain);

    // Harmonic partial modes
    const modes = [
      { ratio: 1.00, amp: 0.55, decay: duration * 1.0, detune: 0.5 },
      { ratio: 2.76, amp: 0.28, decay: duration * 0.7, detune: 1.0 },
      { ratio: 5.40, amp: 0.14, decay: duration * 0.4, detune: 1.5 },
      { ratio: 8.93, amp: 0.06, decay: duration * 0.2, detune: 2.0 }
    ];

    modes.forEach(mode => {
      [-1, 1].forEach(sign => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(fundamental * mode.ratio + (sign * mode.detune * 0.4), now);

        const peak = (mode.amp / 2) * (0.8 + Math.random() * 0.3);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.linearRampToValueAtTime(peak, now + 0.035);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + mode.decay);

        osc.connect(gain);
        gain.connect(bowlGain);

        osc.start(now);
        osc.stop(now + mode.decay + 0.05);
      });
    });
  }

  /**
   * Set theme balance (Sakura vs Blue Hour)
   */
  setTheme(theme) {
    this.currentTheme = theme;
    if (!this.ctx) return;

    const now = this.ctx.currentTime;
    if (theme === 'light') {
      // Sakura: Gentle wind, faint rain, very soft ocean
      this.windNode?.gain.gain.setTargetAtTime(0.4, now, 1.5);
      this.rainNode?.gain.gain.setTargetAtTime(0.25, now, 1.5);
      this.oceanNode?.gain.gain.setTargetAtTime(0.12, now, 1.5);
    } else {
      // Blue Hour: Prominent ocean swells, gentle wind, faint rain
      this.oceanNode?.gain.gain.setTargetAtTime(0.5, now, 1.5);
      this.windNode?.gain.gain.setTargetAtTime(0.2, now, 1.5);
      this.rainNode?.gain.gain.setTargetAtTime(0.1, now, 1.5);
    }
  }

  /**
   * Toggle Sound
   */
  async toggle() {
    if (!this.isInitialized) {
      await this.init();
    }

    if (this.ctx.state === 'suspended') {
      await this.ctx.resume();
    }

    this.isMuted = !this.isMuted;
    this.isPlaying = !this.isMuted;

    const now = this.ctx.currentTime;
    if (this.isMuted) {
      // Smooth fade out
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0.0, now, 0.6);
    } else {
      // Smooth fade in
      this.setTheme(this.currentTheme);
      this.masterGain.gain.cancelScheduledValues(now);
      this.masterGain.gain.setTargetAtTime(0.45, now, 0.8);
      // Play a soft welcome chime
      this.playChime(216, 7);
    }

    return !this.isMuted;
  }
}

export const sound = new SoundEngine();
