import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Firefly Constellation Weaver Game
 * Guide peaceful floating fireflies to ignite the 7 star nodes of the night sky constellation.
 * Goal: Light all 7 celestial stars to awaken the cosmic constellation.
 */
export class FireflyGame {
  constructor() {
    this.canvas = document.getElementById('fireflies-canvas');
    this.statusText = document.getElementById('fireflies-status-text');
    this.progressBar = document.getElementById('fireflies-progress-fill');
    this.starCountEl = document.getElementById('fireflies-star-count');

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.fireflies = [];
    this.constellationNodes = [];
    this.lines = [];
    this.pointer = new THREE.Vector3(999, 999, 0);

    this.litStarsCount = 0;
    this.totalStars = 7;
    this.isCompleted = false;

    this.clock = new THREE.Clock();
    this.isInitialized = false;
    this.rafId = null;

    this.raycaster = new THREE.Raycaster();
    this.planeIntersect = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  }

  init() {
    if (this.isInitialized) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 18);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambient = new THREE.AmbientLight(0x060f1e, 2.5);
    this.scene.add(ambient);

    // Setup 7 Constellation Star Nodes (Cassiopeia / Big Dipper shape)
    this.setupConstellation();

    // Spawn 22 gentle fireflies
    this.spawnFireflies(22);

    this.setupEvents();
    this.isInitialized = true;
  }

  setupConstellation() {
    const starCoords = [
      { x: -6.5, y: 3.5, name: "Alpha" },
      { x: -3.5, y: 1.5, name: "Beta" },
      { x: -0.5, y: 3.0, name: "Gamma" },
      { x: 2.8, y: 0.8, name: "Delta" },
      { x: 5.8, y: 2.5, name: "Epsilon" },
      { x: 4.2, y: -2.8, name: "Zeta" },
      { x: -2.0, y: -2.5, name: "Eta" }
    ];

    starCoords.forEach((c) => {
      const group = new THREE.Group();

      // Outer unlit star ring
      const ringGeo = new THREE.RingGeometry(0.5, 0.65, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      // Inner glowing core (hidden until lit)
      const coreGeo = new THREE.SphereGeometry(0.35, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.0
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      group.position.set(c.x, c.y, 0);
      this.scene.add(group);

      this.constellationNodes.push({
        group,
        ring,
        core,
        pos: new THREE.Vector3(c.x, c.y, 0),
        isLit: false
      });
    });

    // Constellation lines connecting stars
    for (let i = 0; i < this.constellationNodes.length - 1; i++) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        this.constellationNodes[i].pos,
        this.constellationNodes[i + 1].pos
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.15
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.scene.add(line);
      this.lines.push(line);
    }
  }

  createFireflyMesh() {
    const group = new THREE.Group();

    const coreGeo = new THREE.SphereGeometry(0.14, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff9db });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const haloGeo = new THREE.RingGeometry(0.1, 0.8, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    return group;
  }

  spawnFireflies(count) {
    for (let i = 0; i < count; i++) {
      const mesh = this.createFireflyMesh();
      const x = (Math.random() - 0.5) * 24;
      const y = (Math.random() - 0.5) * 16;
      const z = (Math.random() - 0.5) * 4;
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      this.fireflies.push({
        mesh,
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0),
        pulseSpeed: 1.5 + Math.random() * 2.0,
        pulseOffset: Math.random() * Math.PI * 2,
        seed: Math.random() * 100
      });
    }
  }

  setupEvents() {
    const handleMove = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const mouseNorm = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );

      this.raycaster.setFromCamera(mouseNorm, this.camera);
      this.raycaster.ray.intersectPlane(this.planeIntersect, this.pointer);
    };

    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleMove, { passive: false });
    this.canvas.addEventListener('touchstart', handleMove, { passive: false });
  }

  igniteStar(node) {
    node.isLit = true;
    node.core.material.opacity = 1.0;
    node.ring.material.color.setHex(0xfef08a);
    node.ring.material.opacity = 0.9;
    this.litStarsCount++;

    sound.playChime(329.63 + this.litStarsCount * 45, 5);
    this.updateUI();

    // Check if whole constellation completed
    if (this.litStarsCount >= this.totalStars) {
      this.isCompleted = true;
      this.lines.forEach(l => {
        l.material.opacity = 0.9;
        l.material.color.setHex(0xfef08a);
      });
      sound.playChime(523.25, 8);
    }
  }

  updateUI() {
    if (this.starCountEl) {
      this.starCountEl.textContent = `${this.litStarsCount}/${this.totalStars}`;
    }
    if (this.progressBar) {
      const pct = (this.litStarsCount / this.totalStars) * 100;
      this.progressBar.style.width = `${pct}%`;
    }
    if (this.statusText) {
      if (this.isCompleted) {
        this.statusText.textContent = "✨ Constellation awakened! The cosmos shines upon you.";
      } else {
        this.statusText.textContent = `Guide fireflies to ignite stars (${this.litStarsCount}/${this.totalStars} lit)`;
      }
    }
  }

  start() {
    this.init();
    this.updateUI();
    this.animate();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const time = this.clock.getElapsedTime();

    // Update Fireflies
    this.fireflies.forEach(f => {
      f.pos.x += f.vel.x + Math.sin(time * 0.8 + f.seed) * 0.01;
      f.pos.y += f.vel.y + Math.cos(time * 0.6 + f.seed) * 0.01;

      // Follow touch/pointer
      const distToPointer = f.pos.distanceTo(this.pointer);
      if (distToPointer < 5.0) {
        const pullDir = new THREE.Vector3().subVectors(this.pointer, f.pos).normalize();
        f.pos.add(pullDir.multiplyScalar(0.04));
      }

      // Check collision with constellation star nodes
      this.constellationNodes.forEach(node => {
        if (!node.isLit && f.pos.distanceTo(node.pos) < 1.1) {
          this.igniteStar(node);
        }
      });

      // Bounds
      if (Math.abs(f.pos.x) > 13) f.pos.x *= -0.95;
      if (Math.abs(f.pos.y) > 9) f.pos.y *= -0.95;

      const pulse = 0.6 + 0.4 * Math.sin(time * f.pulseSpeed + f.pulseOffset);
      f.mesh.position.copy(f.pos);
      f.mesh.scale.setScalar(0.8 + pulse * 0.5);
    });

    // Star node pulsing
    this.constellationNodes.forEach(node => {
      if (node.isLit) {
        node.group.rotation.z += 0.01;
        const scale = 1.0 + Math.sin(time * 2.0) * 0.15;
        node.core.scale.set(scale, scale, scale);
      }
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

export const fireflyGame = new FireflyGame();
