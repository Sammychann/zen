import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Rain on Windowpane Game
 * A cozy, foggy glass window with raindrops forming, trickling,
 * and satisfying touch wiping to clear the mist.
 */
export class RainWindowGame {
  constructor() {
    this.canvas = document.getElementById('rain-canvas');
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.fogCanvas = null;
    this.fogCtx = null;
    this.fogTexture = null;
    this.drops = [];
    this.clock = new THREE.Clock();
    this.isWiping = false;
    this.isInitialized = false;
    this.rafId = null;
  }

  init() {
    if (this.isInitialized) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Dynamic 2D Window Fog & Drop Canvas
    this.fogCanvas = document.createElement('canvas');
    this.fogCanvas.width = 1024;
    this.fogCanvas.height = 1024;
    this.fogCtx = this.fogCanvas.getContext('2d');
    this.initFog();

    this.fogTexture = new THREE.CanvasTexture(this.fogCanvas);

    const quadGeo = new THREE.PlaneGeometry(2, 2);
    const quadMat = new THREE.MeshBasicMaterial({
      map: this.fogTexture,
      transparent: true
    });
    const quad = new THREE.Mesh(quadGeo, quadMat);
    this.scene.add(quad);

    this.spawnRaindrops(45);
    this.setupEvents();
    this.isInitialized = true;
  }

  initFog() {
    const w = this.fogCanvas.width;
    const h = this.fogCanvas.height;

    // Dark cozy midnight background outside window
    this.fogCtx.fillStyle = '#030712';
    this.fogCtx.fillRect(0, 0, w, h);

    // Warm bokeh streetlights in the distance
    const bokehs = [
      { x: w * 0.25, y: h * 0.45, r: 80, color: 'rgba(254, 215, 170, 0.15)' },
      { x: w * 0.75, y: h * 0.35, r: 120, color: 'rgba(186, 230, 253, 0.12)' },
      { x: w * 0.5, y: h * 0.65, r: 100, color: 'rgba(251, 207, 232, 0.14)' },
      { x: w * 0.85, y: h * 0.7, r: 70, color: 'rgba(199, 210, 254, 0.15)' }
    ];

    bokehs.forEach(b => {
      const g = this.fogCtx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
      g.addColorStop(0, b.color);
      g.addColorStop(1, 'rgba(0,0,0,0)');
      this.fogCtx.fillStyle = g;
      this.fogCtx.beginPath();
      this.fogCtx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      this.fogCtx.fill();
    });

    // Glass Mist Layer
    this.fogCtx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    this.fogCtx.fillRect(0, 0, w, h);
  }

  spawnRaindrops(count) {
    const w = this.fogCanvas.width;
    const h = this.fogCanvas.height;
    for (let i = 0; i < count; i++) {
      this.drops.push({
        x: Math.random() * w,
        y: Math.random() * h,
        r: 3 + Math.random() * 7,
        speed: 0.2 + Math.random() * 0.8,
        trickling: Math.random() > 0.6,
        life: 1.0
      });
    }
  }

  wipeMist(canvasX, canvasY) {
    this.fogCtx.save();
    this.fogCtx.globalCompositeOperation = 'destination-out';
    const g = this.fogCtx.createRadialGradient(canvasX, canvasY, 0, canvasX, canvasY, 40);
    g.addColorStop(0, 'rgba(0, 0, 0, 0.85)');
    g.addColorStop(0.6, 'rgba(0, 0, 0, 0.4)');
    g.addColorStop(1, 'rgba(0, 0, 0, 0)');
    this.fogCtx.fillStyle = g;
    this.fogCtx.beginPath();
    this.fogCtx.arc(canvasX, canvasY, 40, 0, Math.PI * 2);
    this.fogCtx.fill();
    this.fogCtx.restore();

    // Occasional gentle drop chime
    if (Math.random() < 0.08) {
      sound.playChime(440 + Math.random() * 200, 3);
    }
  }

  setupEvents() {
    const clearBtn = document.getElementById('btn-rain-re-fog');
    clearBtn?.addEventListener('click', () => {
      this.initFog();
      sound.playChime(261.63, 4);
    });

    const getCanvasPos = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: ((clientX - rect.left) / rect.width) * this.fogCanvas.width,
        y: ((clientY - rect.top) / rect.height) * this.fogCanvas.height
      };
    };

    const startWipe = (e) => {
      this.isWiping = true;
      const p = getCanvasPos(e);
      this.wipeMist(p.x, p.y);
    };

    const moveWipe = (e) => {
      if (!this.isWiping) return;
      const p = getCanvasPos(e);
      this.wipeMist(p.x, p.y);
    };

    const endWipe = () => {
      this.isWiping = false;
    };

    this.canvas.addEventListener('mousedown', startWipe);
    window.addEventListener('mousemove', moveWipe);
    window.addEventListener('mouseup', endWipe);

    this.canvas.addEventListener('touchstart', startWipe, { passive: false });
    window.addEventListener('touchmove', moveWipe, { passive: false });
    window.addEventListener('touchend', endWipe);
  }

  start() {
    this.init();
    this.initFog();
    this.animate();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const w = this.fogCanvas.width;
    const h = this.fogCanvas.height;

    // Draw trickling raindrops onto glass
    this.fogCtx.save();
    this.drops.forEach(d => {
      if (d.trickling) {
        d.y += d.speed;
        d.x += (Math.random() - 0.5) * 0.3;

        // Draw raindrop lens streak
        this.fogCtx.fillStyle = 'rgba(255, 255, 255, 0.45)';
        this.fogCtx.beginPath();
        this.fogCtx.arc(d.x, d.y, d.r * 0.7, 0, Math.PI * 2);
        this.fogCtx.fill();

        // Droplet specular highlight
        this.fogCtx.fillStyle = 'rgba(255, 255, 255, 0.85)';
        this.fogCtx.beginPath();
        this.fogCtx.arc(d.x - d.r * 0.25, d.y - d.r * 0.25, d.r * 0.25, 0, Math.PI * 2);
        this.fogCtx.fill();

        if (d.y > h + 10) {
          d.y = -10;
          d.x = Math.random() * w;
        }
      }
    });
    this.fogCtx.restore();

    this.fogTexture.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.renderer) return;
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export const rainWindowGame = new RainWindowGame();
