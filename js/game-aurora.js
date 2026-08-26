import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Aurora Weaver Game
 * Drag across the starry sky to weave undulating curtains of Aurora Borealis.
 */
export class AuroraGame {
  constructor() {
    this.canvas = document.getElementById('aurora-canvas');
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.ribbons = [];
    this.pointer = new THREE.Vector2(0, 0);
    this.clock = new THREE.Clock();
    this.isInitialized = false;
    this.rafId = null;
  }

  init() {
    if (this.isInitialized) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 15);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Starfield Background
    this.spawnStars(200);

    // Initial Aurora Curtains
    this.createAuroraRibbon(new THREE.Color(0x2dd4bf), -2); // Teal
    this.createAuroraRibbon(new THREE.Color(0x818cf8), 0);  // Indigo / Violet
    this.createAuroraRibbon(new THREE.Color(0x4ade80), 2);  // Emerald

    this.setupEvents();
    this.isInitialized = true;
  }

  spawnStars(count) {
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 36;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 2] = -5 + (Math.random() - 0.5) * 10;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      size: 2,
      color: 0xffffff,
      transparent: true,
      opacity: 0.75
    });
    const pts = new THREE.Points(geo, mat);
    this.scene.add(pts);
  }

  createAuroraRibbon(color, yOffset) {
    const segments = 60;
    const geo = new THREE.PlaneGeometry(28, 6, segments, 12);
    const mat = new THREE.MeshBasicMaterial({
      color,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      wireframe: false
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.y = yOffset;
    this.scene.add(mesh);

    this.ribbons.push({
      mesh,
      geo,
      baseColor: color,
      speed: 0.6 + Math.random() * 0.4,
      waveOffset: Math.random() * Math.PI * 2
    });
  }

  setupEvents() {
    const handleMove = (e) => {
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      this.pointer.x = (clientX / window.innerWidth) * 2 - 1;
      this.pointer.y = -(clientY / window.innerHeight) * 2 + 1;

      if (Math.random() < 0.04) {
        sound.playChime(196 + Math.random() * 300, 6);
      }
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
  }

  start() {
    this.init();
    this.animate();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();

    this.ribbons.forEach(r => {
      const pos = r.geo.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        const u = pos.getX(i);
        const v = pos.getY(i);

        // Undulating silky curtain physics
        const wave = Math.sin(u * 0.3 + time * r.speed + r.waveOffset) * 1.4 +
                     Math.cos(v * 0.4 + time * 0.8) * 0.6;

        // Pointer influence
        const distToPointer = Math.abs(u - this.pointer.x * 12);
        const pull = Math.max(0, 1 - distToPointer / 6) * this.pointer.y * 2.0;

        pos.setZ(i, wave + pull);
      }
      pos.needsUpdate = true;
    });

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export const auroraGame = new AuroraGame();
