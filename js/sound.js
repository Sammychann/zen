/**
 * Independent Procedural Ambient Sound Engine using Web Audio API.
 * Provides independent toggles for:
 * 1. 🌧️ Procedural Rain (Pink noise + stochastic micro-droplet pops)
 * 2. 🌊 Procedural Ocean Waves (Brown noise + rhythmic LFO filter sweep)
 * 3. 🔔 Harmonic Chimes
 */

class SoundEngine {
  constructor() {
    this.ctx = null;
    this.masterLimiter = null;

    this.rainGain = null;
    this.oceanGain = null;

    this.isRainPlaying = false;
    this.isWavesPlaying = false;

    this.isInitialized = false;
  }

  async init() {
    if (this.isInitialized) return;

    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    this.ctx = new AudioContextClass();

    // Master Dynamics Limiter
    this.masterLimiter = this.ctx.createDynamicsCompressor();
    this.masterLimiter.threshold.setValueAtTime(-12, this.ctx.currentTime);
    this.masterLimiter.knee.setValueAtTime(20, this.ctx.currentTime);
    this.masterLimiter.ratio.setValueAtTime(8, this.ctx.currentTime);
    this.masterLimiter.attack.setValueAtTime(0.003, this.ctx.currentTime);
    this.masterLimiter.release.setValueAtTime(0.25, this.ctx.currentTime);
    this.masterLimiter.connect(this.ctx.destination);

    // 1. Setup Rain Generator
    this.setupRain();

    // 2. Setup Ocean Waves Generator
    this.setupOceanWaves();

    this.isInitialized = true;
  }

  setTheme(theme) {
    // Optional ambient tone adaptation when theme switches
    if (this.isInitialized && this.ctx) {
      if (theme === 'dark') {
        this.playChime(220, 2);
      } else {
        this.playChime(329.63, 2);
      }
    }
  }

  createNoiseBuffer(type = 'pink', durationSeconds = 4) {
    const bufferSize = this.ctx.sampleRate * durationSeconds;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);

    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    let brownLast = 0;

    for (let i = 0; i < bufferSize; i++) {
      const white = Math.random() * 2 - 1;
      if (type === 'pink') {
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.1538520;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.0168980;
        const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
        b6 = white * 0.115926;
        output[i] = pink * 0.04;
      } else if (type === 'brown') {
        brownLast = (brownLast + (0.02 * white)) / 1.02;
        output[i] = brownLast * 0.5;
      }
    }

    const source = this.ctx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    return source;
  }

  setupRain() {
    this.rainGain = this.ctx.createGain();
    this.rainGain.gain.setValueAtTime(0, this.ctx.currentTime);

    const rainNoise = this.createNoiseBuffer('pink', 4);
    const rainLow = this.ctx.createBiquadFilter();
    rainLow.type = 'lowpass';
    rainLow.frequency.value = 1600;

    const rainHigh = this.ctx.createBiquadFilter();
    rainHigh.type = 'highpass';
    rainHigh.frequency.value = 350;

    rainNoise.connect(rainHigh);
    rainHigh.connect(rainLow);
    rainLow.connect(this.rainGain);
    this.rainGain.connect(this.masterLimiter);

    rainNoise.start();

    // Stochastic Rain Droplets
    const triggerDrop = () => {
      if (!this.isRainPlaying || !this.ctx) {
        setTimeout(triggerDrop, 200);
        return;
      }
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      const baseFreq = 1200 + Math.random() * 1800;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, now + 0.03);

      gain.gain.setValueAtTime(0.03 + Math.random() * 0.03, now);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);

      osc.connect(gain);
      gain.connect(this.rainGain);

      osc.start(now);
      osc.stop(now + 0.035);

      const next = 60 + Math.random() * 160;
      setTimeout(triggerDrop, next);
    };
    triggerDrop();
  }

  setupOceanWaves() {
    this.oceanGain = this.ctx.createGain();
    this.oceanGain.gain.setValueAtTime(0, this.ctx.currentTime);

    // Deep Swell
    const swellNoise = this.createNoiseBuffer('brown', 5);
    const swellFilter = this.ctx.createBiquadFilter();
    swellFilter.type = 'lowpass';
    swellFilter.frequency.value = 180;
    swellFilter.Q.value = 2.0;

    // Foam Surf
    const foamNoise = this.createNoiseBuffer('pink', 4);
    const foamFilter = this.ctx.createBiquadFilter();
    foamFilter.type = 'bandpass';
    foamFilter.frequency.value = 650;
    foamFilter.Q.value = 1.0;

    const foamGain = this.ctx.createGain();
    foamGain.gain.value = 0.25;

    // Slow Rhythmic LFO for Wave Swells (0.09 Hz = ~11s tidal wave cycle)
    const waveLFO = this.ctx.createOscillator();
    waveLFO.type = 'sine';
    waveLFO.frequency.value = 0.09;

    const swellMod = this.ctx.createGain();
    swellMod.gain.value = 220;

    const foamMod = this.ctx.createGain();
    foamMod.gain.value = 450;

    waveLFO.connect(swellMod);
    swellMod.connect(swellFilter.frequency);

    waveLFO.connect(foamMod);
    foamMod.connect(foamFilter.frequency);

    swellNoise.connect(swellFilter);
    swellFilter.connect(this.oceanGain);

    foamNoise.connect(foamFilter);
    foamFilter.connect(foamGain);
    foamGain.connect(this.oceanGain);

    this.oceanGain.connect(this.masterLimiter);

    swellNoise.start();
    foamNoise.start();
    waveLFO.start();
  }

  async toggleRain() {
    if (!this.isInitialized) await this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    this.isRainPlaying = !this.isRainPlaying;
    const now = this.ctx.currentTime;

    this.rainGain.gain.cancelScheduledValues(now);
    if (this.isRainPlaying) {
      this.rainGain.gain.setTargetAtTime(0.45, now, 0.8);
      this.playChime(329.63, 3);
    } else {
      this.rainGain.gain.setTargetAtTime(0.0, now, 0.6);
    }

    return this.isRainPlaying;
  }

  async toggleWaves() {
    if (!this.isInitialized) await this.init();
    if (this.ctx.state === 'suspended') await this.ctx.resume();

    this.isWavesPlaying = !this.isWavesPlaying;
    const now = this.ctx.currentTime;

    this.oceanGain.gain.cancelScheduledValues(now);
    if (this.isWavesPlaying) {
      this.oceanGain.gain.setTargetAtTime(0.55, now, 1.0);
      this.playChime(261.63, 4);
    } else {
      this.oceanGain.gain.setTargetAtTime(0.0, now, 0.6);
    }

    return this.isWavesPlaying;
  }

  playPurr(duration = 4) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    
    // Low frequency rumble oscillator (cat purr ~26Hz)
    const purrLFO = this.ctx.createOscillator();
    purrLFO.type = 'sawtooth';
    purrLFO.frequency.setValueAtTime(26, now);

    const purrFilter = this.ctx.createBiquadFilter();
    purrFilter.type = 'lowpass';
    purrFilter.frequency.setValueAtTime(140, now);

    const purrGain = this.ctx.createGain();
    purrGain.gain.setValueAtTime(0.0001, now);
    purrGain.gain.linearRampToValueAtTime(0.18, now + 0.5);
    purrGain.gain.setValueAtTime(0.18, now + duration - 0.5);
    purrGain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    // Warm sub-harmonic tone
    const subOsc = this.ctx.createOscillator();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(75, now);
    const subGain = this.ctx.createGain();
    subGain.gain.setValueAtTime(0.08, now);

    subOsc.connect(subGain);
    subGain.connect(purrFilter);

    purrLFO.connect(purrFilter);
    purrFilter.connect(purrGain);
    purrGain.connect(this.masterLimiter);

    purrLFO.start(now);
    subOsc.start(now);
    purrLFO.stop(now + duration + 0.1);
    subOsc.stop(now + duration + 0.1);
  }

  playChime(fundamental = 261.63, duration = 5) {
    if (!this.ctx) return;
    if (this.ctx.state === 'suspended') this.ctx.resume();

    const now = this.ctx.currentTime;
    const gain = this.ctx.createGain();
    gain.connect(this.masterLimiter);

    const osc = this.ctx.createOscillator();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(fundamental, now);

    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.linearRampToValueAtTime(0.2, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);

    osc.connect(gain);
    osc.start(now);
    osc.stop(now + duration + 0.05);
  }
}

export const sound = new SoundEngine();
