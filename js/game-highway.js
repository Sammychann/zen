import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Daily Scenery Configs based on day of the week
 */
const DAILY_SCENERY = [
  { day: "Sunday", name: "Golden Sunset Coast", skyColor: 0x451a03, roadColor: 0x0f0b14, lightColor: 0xfbbf24, carColor: 0xf59e0b, goalAffirmation: "The sun sets on today. You did wonderful, and tomorrow brings fresh light." },
  { day: "Monday", name: "Midnight Coastal Highway", skyColor: 0x020617, roadColor: 0x070d1a, lightColor: 0x38bdf8, carColor: 0x0284c7, goalAffirmation: "You navigated through everything with quiet resilience. Rest deeply now." },
  { day: "Tuesday", name: "Tokyo Neon Cyber Glide", skyColor: 0x090514, roadColor: 0x0e0720, lightColor: 0xf43f5e, carColor: 0xec4899, goalAffirmation: "Let go of all the noise and demands. You are safe and peaceful right here." },
  { day: "Wednesday", name: "Sakura Forest Highway", skyColor: 0x14050b, roadColor: 0x1a0a12, lightColor: 0xfbcfe8, carColor: 0xf472b6, goalAffirmation: "Like petals in the breeze, let your thoughts gently float away into stillness." },
  { day: "Thursday", name: "Emerald Aurora Pass", skyColor: 0x02140d, roadColor: 0x051a12, lightColor: 0x34d399, carColor: 0x10b981, goalAffirmation: "Breathe in the calm night air. Your mind is quiet, steady, and clear." },
  { day: "Friday", name: "Desert Starlight Ridge", skyColor: 0x05081c, roadColor: 0x0b1026, lightColor: 0xa78bfa, carColor: 0x8b5cf6, goalAffirmation: "You carried so much this week. It is finally time to lay it all down and sleep." },
  { day: "Saturday", name: "Moonlit Glacial Route", skyColor: 0x040e1a, roadColor: 0x071524, lightColor: 0x67e8f9, carColor: 0x38bdf8, goalAffirmation: "A gentle stillness surrounds you. Nothing is expected of you now." }
];

export class HighwayGame {
  constructor() {
    this.canvas = document.getElementById('highway-canvas');
    this.progressBar = document.getElementById('highway-progress-fill');
    this.orbCountEl = document.getElementById('highway-orb-count');
    this.statusText = document.getElementById('highway-status-text');

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.car = null;
    this.roadLines = [];
    this.streetlights = [];
    this.starOrbs = [];

    this.carX = 0;
    this.targetCarX = 0;
    this.distance = 0;
    this.maxDistance = 1000;
    this.collectedOrbs = 0;
    this.targetOrbs = 10;
    this.isCompleted = false;

    this.currentScenery = DAILY_SCENERY[new Date().getDay()];

    this.clock = new THREE.Clock();
    this.isInitialized = false;
    this.rafId = null;
  }

  init() {
    if (this.isInitialized) return;

    this.currentScenery = DAILY_SCENERY[new Date().getDay()];

    this.scene = new THREE.Scene();
    
    // Mobile-First Dynamic Camera & FOV
    const isMobile = window.innerWidth < 640;
    const fov = isMobile ? 72 : 58;
    this.camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 100);
    
    if (isMobile) {
      this.camera.position.set(0, 4.2, 9.0);
      this.camera.lookAt(0, 1.0, -12);
    } else {
      this.camera.position.set(0, 3.5, 7.5);
      this.camera.lookAt(0, 1.2, -10);
    }

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Daily ambient lighting
    const ambient = new THREE.AmbientLight(this.currentScenery.skyColor, 2.8);
    this.scene.add(ambient);

    const moon = new THREE.DirectionalLight(this.currentScenery.lightColor, 1.6);
    moon.position.set(0, 15, 10);
    this.scene.add(moon);

    // Road Surface (Optimized for Mobile Portrait Width)
    const roadWidth = isMobile ? 9 : 12;
    const roadGeo = new THREE.PlaneGeometry(roadWidth, 120);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: this.currentScenery.roadColor,
      roughness: 0.8
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0, -50);
    this.scene.add(road);

    // Dashed Road Markings
    for (let i = 0; i < 20; i++) {
      const lineGeo = new THREE.PlaneGeometry(0.22, 3.5);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: this.currentScenery.lightColor });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(0, 0.02, -i * 6);
      this.scene.add(line);
      this.roadLines.push(line);
    }

    // Streetlights
    const lightDist = isMobile ? 5.2 : 6.5;
    for (let i = 0; i < 10; i++) {
      this.createStreetlight(-lightDist, -i * 12);
      this.createStreetlight(lightDist, -i * 12);
    }

    // Cruiser Car
    this.createCar();

    // Spawn Star Orbs
    this.spawnOrbs();

    this.setupControls();
    this.isInitialized = true;
  }

  createStreetlight(x, z) {
    const group = new THREE.Group();

    const poleGeo = new THREE.CylinderGeometry(0.08, 0.08, 6);
    const poleMat = new THREE.MeshBasicMaterial({ color: 0x1e293b });
    const pole = new THREE.Mesh(poleGeo, poleMat);
    pole.position.y = 3;
    group.add(pole);

    const lampGeo = new THREE.SphereGeometry(0.35, 12, 12);
    const lampMat = new THREE.MeshBasicMaterial({ color: this.currentScenery.lightColor });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(x > 0 ? -0.8 : 0.8, 5.8, 0);
    group.add(lamp);

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.streetlights.push(group);
  }

  createCar() {
    this.car = new THREE.Group();

    const isMobile = window.innerWidth < 640;
    const bodyScale = isMobile ? 0.85 : 1.0;

    const bodyGeo = new THREE.BoxGeometry(1.6 * bodyScale, 0.6 * bodyScale, 3.2 * bodyScale);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: this.currentScenery.carColor,
      metalness: 0.85,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5 * bodyScale;
    this.car.add(body);

    const cabinGeo = new THREE.BoxGeometry(1.3 * bodyScale, 0.5 * bodyScale, 1.6 * bodyScale);
    const cabinMat = new THREE.MeshStandardMaterial({ color: 0x030712, roughness: 0.1 });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.95 * bodyScale, -0.2 * bodyScale);
    this.car.add(cabin);

    const tailMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.35 * bodyScale, 0.15 * bodyScale, 0.05), tailMat);
    tail1.position.set(-0.55 * bodyScale, 0.55 * bodyScale, 1.62 * bodyScale);
    const tail2 = tail1.clone();
    tail2.position.set(0.55 * bodyScale, 0.55 * bodyScale, 1.62 * bodyScale);
    this.car.add(tail1);
    this.car.add(tail2);

    this.car.position.set(0, 0, 0);
    this.scene.add(this.car);
  }

  spawnOrbs() {
    const isMobile = window.innerWidth < 640;
    const lanes = isMobile ? [-2.4, 0, 2.4] : [-3, 0, 3];

    for (let i = 0; i < 25; i++) {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      const z = -20 - i * 18;

      const orbGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(lane, 0.8, z);
      this.scene.add(orb);

      this.starOrbs.push({ mesh: orb, collected: false });
    }
  }

  setupControls() {
    const maxBound = window.innerWidth < 640 ? 2.6 : 3.5;
    const step = window.innerWidth < 640 ? 2.4 : 3.2;

    // Keyboard controls
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        this.targetCarX = Math.max(-maxBound, this.targetCarX - step);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        this.targetCarX = Math.min(maxBound, this.targetCarX + step);
      }
    });

    // Mobile On-Screen Thumb Buttons
    const leftBtn = document.getElementById('btn-highway-left');
    const rightBtn = document.getElementById('btn-highway-right');

    leftBtn?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.targetCarX = Math.max(-maxBound, this.targetCarX - step);
      if (navigator.vibrate) navigator.vibrate(10);
    });

    rightBtn?.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      this.targetCarX = Math.min(maxBound, this.targetCarX + step);
      if (navigator.vibrate) navigator.vibrate(10);
    });

    // Tap Left / Right Half of Screen on Mobile
    this.canvas.addEventListener('pointerdown', (e) => {
      const xRatio = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetCarX = xRatio * maxBound;
    });

    // Swipe / Drag controls
    let startX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      const diff = e.touches[0].clientX - startX;
      if (Math.abs(diff) > 20) {
        if (diff > 0) this.targetCarX = Math.min(maxBound, this.targetCarX + step);
        else this.targetCarX = Math.max(-maxBound, this.targetCarX - step);
        startX = e.touches[0].clientX;
        if (navigator.vibrate) navigator.vibrate(10);
      }
    }, { passive: true });
  }

  showCompletionModal() {
    const modal = document.getElementById('completion-modal');
    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');
    const badgeEl = document.getElementById('modal-badge');

    if (modal && titleEl && descEl) {
      titleEl.textContent = `✨ ${this.currentScenery.name} Overlook Reached!`;
      descEl.textContent = this.currentScenery.goalAffirmation;
      if (badgeEl) badgeEl.textContent = `🚗 ${this.currentScenery.day} Journey Completed • 1000m Cruised`;
      modal.classList.remove('hidden');
    }
  }

  start() {
    this.init();
    this.distance = 0;
    this.collectedOrbs = 0;
    this.isCompleted = false;
    this.updateUI();
    this.animate();
  }

  stop() {
    if (this.rafId) cancelAnimationFrame(this.rafId);
  }

  updateUI() {
    if (this.progressBar) {
      const pct = Math.min(100, (this.distance / this.maxDistance) * 100);
      this.progressBar.style.width = `${pct}%`;
    }
    if (this.orbCountEl) {
      this.orbCountEl.textContent = `${this.collectedOrbs}/${this.targetOrbs} ⭐`;
    }
    if (this.statusText) {
      if (this.isCompleted) {
        this.statusText.textContent = `✨ Overlook reached • ${this.currentScenery.name}`;
      } else {
        const remaining = Math.max(0, Math.floor(this.maxDistance - this.distance));
        this.statusText.textContent = `${this.currentScenery.name} • ${remaining}m`;
      }
    }
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const speed = 28 * delta;

    if (!this.isCompleted) {
      this.distance += speed * 2.5;

      this.carX += (this.targetCarX - this.carX) * 0.18;
      if (this.car) {
        this.car.position.x = this.carX;
        this.car.rotation.z = (this.targetCarX - this.carX) * -0.06;
      }

      this.roadLines.forEach(l => {
        l.position.z += speed;
        if (l.position.z > 5) l.position.z -= 120;
      });

      this.streetlights.forEach(s => {
        s.position.z += speed;
        if (s.position.z > 5) s.position.z -= 120;
      });

      this.starOrbs.forEach(o => {
        if (!o.collected) {
          o.mesh.position.z += speed;
          o.mesh.rotation.y += 0.05;

          const dx = o.mesh.position.x - this.carX;
          const dz = o.mesh.position.z - this.car.position.z;
          if (Math.abs(dx) < 1.4 && Math.abs(dz) < 1.4) {
            o.collected = true;
            o.mesh.visible = false;
            this.collectedOrbs++;
            sound.playChime(392 + this.collectedOrbs * 30, 4);
            if (navigator.vibrate) navigator.vibrate(15);
            this.updateUI();
          }

          if (o.mesh.position.z > 8) {
            o.mesh.position.z -= 450;
            o.collected = false;
            o.mesh.visible = true;
          }
        }
      });

      if (this.distance >= this.maxDistance && this.collectedOrbs >= this.targetOrbs) {
        this.isCompleted = true;
        sound.playChime(523.25, 8);
        if (navigator.vibrate) navigator.vibrate([30, 50, 30]);
        setTimeout(() => this.showCompletionModal(), 600);
      }

      this.updateUI();
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.camera || !this.renderer) return;
    const isMobile = window.innerWidth < 640;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.fov = isMobile ? 72 : 58;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export const highwayGame = new HighwayGame();
