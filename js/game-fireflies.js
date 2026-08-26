import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Daily Constellations with mobile-responsive normalized coordinates
 */
const DAILY_CONSTELLATIONS = [
  {
    day: "Sunday",
    name: "Corona Borealis (Northern Crown)",
    stars: [
      { x: -0.7, y: 0.2 }, { x: -0.4, y: 0.65 }, { x: -0.05, y: 0.8 },
      { x: 0.35, y: 0.7 }, { x: 0.65, y: 0.35 }, { x: 0.75, y: -0.1 }, { x: 0.45, y: -0.5 }
    ],
    affirmation: "The golden crown of stars shines for you. Your peace is your greatest power."
  },
  {
    day: "Monday",
    name: "Cassiopeia (The Queen's Throne)",
    stars: [
      { x: -0.8, y: 0.6 }, { x: -0.45, y: 0.25 }, { x: -0.05, y: 0.55 },
      { x: 0.4, y: 0.15 }, { x: 0.8, y: 0.45 }, { x: 0.5, y: -0.45 }, { x: -0.3, y: -0.45 }
    ],
    affirmation: "Cassiopeia glimmers in quiet majesty. You have guided every light home."
  },
  {
    day: "Tuesday",
    name: "Ursa Major (The Great Dipper)",
    stars: [
      { x: -0.75, y: -0.15 }, { x: -0.5, y: 0.1 }, { x: -0.2, y: 0.15 },
      { x: 0.15, y: 0.2 }, { x: 0.2, y: 0.65 }, { x: 0.65, y: 0.7 }, { x: 0.6, y: 0.25 }
    ],
    affirmation: "The Great Dipper pours stillness across the night sky. Breathe and rest."
  },
  {
    day: "Wednesday",
    name: "Orion's Radiant Belt",
    stars: [
      { x: -0.65, y: 0.65 }, { x: 0.65, y: 0.6 }, { x: -0.3, y: 0.1 },
      { x: 0.0, y: 0.0 }, { x: 0.3, y: -0.1 }, { x: -0.6, y: -0.65 }, { x: 0.6, y: -0.6 }
    ],
    affirmation: "The celestial hunter rests. The night is gentle, quiet, and warm."
  },
  {
    day: "Thursday",
    name: "Pleiades (The Seven Sisters)",
    stars: [
      { x: -0.6, y: 0.4 }, { x: -0.3, y: 0.55 }, { x: -0.08, y: 0.3 },
      { x: 0.25, y: 0.35 }, { x: 0.55, y: 0.15 }, { x: 0.15, y: -0.25 }, { x: -0.25, y: -0.15 }
    ],
    affirmation: "Seven sister stars watch over you in gentle harmony. Sleep peacefully."
  },
  {
    day: "Friday",
    name: "Cygnus (The Swan of Starlight)",
    stars: [
      { x: 0.0, y: 0.75 }, { x: 0.0, y: 0.25 }, { x: 0.0, y: -0.3 },
      { x: 0.0, y: -0.75 }, { x: -0.65, y: 0.25 }, { x: 0.65, y: 0.25 }, { x: 0.35, y: -0.15 }
    ],
    affirmation: "The star swan glides across the cosmic ocean. Let your mind drift into dreamland."
  },
  {
    day: "Saturday",
    name: "Pegasus (The Winged Stardust)",
    stars: [
      { x: -0.55, y: 0.5 }, { x: 0.5, y: 0.55 }, { x: 0.6, y: -0.4 },
      { x: -0.55, y: -0.45 }, { x: -0.8, y: 0.1 }, { x: 0.8, y: 0.15 }, { x: 0.0, y: 0.7 }
    ],
    affirmation: "Wings of stardust carry away every worry from this week. You are completely safe."
  }
];

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

    this.currentConstellation = DAILY_CONSTELLATIONS[new Date().getDay()];
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

    this.currentConstellation = DAILY_CONSTELLATIONS[new Date().getDay()];

    this.scene = new THREE.Scene();
    
    // Dynamic Mobile Viewport Distance
    const isMobile = window.innerWidth < 640;
    const camZ = isMobile ? 22 : 18;
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, camZ);

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

    // Setup Daily Constellation Star Nodes
    this.setupConstellation();

    // Spawn gentle fireflies
    this.spawnFireflies(isMobile ? 26 : 22);

    this.setupEvents();
    this.isInitialized = true;
  }

  setupConstellation() {
    const isMobile = window.innerWidth < 640;
    const scaleX = isMobile ? 4.2 : 6.8;
    const scaleY = isMobile ? 7.2 : 4.8;

    const starCoords = this.currentConstellation.stars;

    starCoords.forEach((c) => {
      const group = new THREE.Group();
      const x = c.x * scaleX;
      const y = c.y * scaleY;

      const ringGeo = new THREE.RingGeometry(0.55, 0.72, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      const coreGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: 0xfef08a,
        transparent: true,
        opacity: 0.0
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      group.position.set(x, y, 0);
      this.scene.add(group);

      this.constellationNodes.push({
        group,
        ring,
        core,
        pos: new THREE.Vector3(x, y, 0),
        isLit: false
      });
    });

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

    const coreGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff9db });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const haloGeo = new THREE.RingGeometry(0.1, 0.85, 16);
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
    const isMobile = window.innerWidth < 640;
    const spreadX = isMobile ? 12 : 24;
    const spreadY = isMobile ? 18 : 14;

    for (let i = 0; i < count; i++) {
      const mesh = this.createFireflyMesh();
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
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
    if (navigator.vibrate) navigator.vibrate(18);
    this.updateUI();

    if (this.litStarsCount >= this.totalStars) {
      this.isCompleted = true;
      this.lines.forEach(l => {
        l.material.opacity = 0.9;
        l.material.color.setHex(0xfef08a);
      });
      sound.playChime(523.25, 8);
      if (navigator.vibrate) navigator.vibrate([30, 50, 40]);
      setTimeout(() => this.showCompletionModal(), 600);
    }
  }

  showCompletionModal() {
    const modal = document.getElementById('completion-modal');
    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');
    const badgeEl = document.getElementById('modal-badge');

    if (modal && titleEl && descEl) {
      titleEl.textContent = `✨ ${this.currentConstellation.name} Awakened!`;
      descEl.textContent = this.currentConstellation.affirmation;
      if (badgeEl) badgeEl.textContent = `✨ ${this.currentConstellation.day} Constellation Completed • 7 Stars Lit`;
      modal.classList.remove('hidden');
    }
  }

  updateUI() {
    if (this.starCountEl) {
      this.starCountEl.textContent = `${this.litStarsCount}/${this.totalStars} ⭐`;
    }
    if (this.progressBar) {
      const pct = (this.litStarsCount / this.totalStars) * 100;
      this.progressBar.style.width = `${pct}%`;
    }
    if (this.statusText) {
      if (this.isCompleted) {
        this.statusText.textContent = `✨ ${this.currentConstellation.name} awakened!`;
      } else {
        this.statusText.textContent = `${this.currentConstellation.name} • ${this.litStarsCount}/${this.totalStars} lit`;
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
    const isMobile = window.innerWidth < 640;
    const boundX = isMobile ? 7 : 13;
    const boundY = isMobile ? 11 : 9;

    this.fireflies.forEach(f => {
      f.pos.x += f.vel.x + Math.sin(time * 0.8 + f.seed) * 0.01;
      f.pos.y += f.vel.y + Math.cos(time * 0.6 + f.seed) * 0.01;

      const distToPointer = f.pos.distanceTo(this.pointer);
      if (distToPointer < 5.5) {
        const pullDir = new THREE.Vector3().subVectors(this.pointer, f.pos).normalize();
        f.pos.add(pullDir.multiplyScalar(0.045));
      }

      this.constellationNodes.forEach(node => {
        if (!node.isLit && f.pos.distanceTo(node.pos) < 1.2) {
          this.igniteStar(node);
        }
      });

      if (Math.abs(f.pos.x) > boundX) f.pos.x *= -0.95;
      if (Math.abs(f.pos.y) > boundY) f.pos.y *= -0.95;

      const pulse = 0.6 + 0.4 * Math.sin(time * f.pulseSpeed + f.pulseOffset);
      f.mesh.position.copy(f.pos);
      f.mesh.scale.setScalar(0.85 + pulse * 0.45);
    });

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
    const isMobile = window.innerWidth < 640;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.position.z = isMobile ? 22 : 18;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export const fireflyGame = new FireflyGame();
