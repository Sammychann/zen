import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Midnight Highway Glide Game
 * Smooth, relaxing night cruise with no crashes or hazards.
 * Goal: Cruise 1000m and collect 10 star orbs to reach the scenic ocean overlook.
 */
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

    this.clock = new THREE.Clock();
    this.isInitialized = false;
    this.rafId = null;
  }

  init() {
    if (this.isInitialized) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 3.5, 7.5);
    this.camera.lookAt(0, 1.2, -10);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Night lighting
    const ambient = new THREE.AmbientLight(0x0a1428, 2.5);
    this.scene.add(ambient);

    const moon = new THREE.DirectionalLight(0x60a5fa, 1.5);
    moon.position.set(0, 15, 10);
    this.scene.add(moon);

    // Road Surface
    const roadGeo = new THREE.PlaneGeometry(12, 120);
    roadGeo.rotateX(-Math.PI / 2);
    const roadMat = new THREE.MeshStandardMaterial({
      color: 0x070d1a,
      roughness: 0.8
    });
    const road = new THREE.Mesh(roadGeo, roadMat);
    road.position.set(0, 0, -50);
    this.scene.add(road);

    // Dashed Road Markings
    for (let i = 0; i < 20; i++) {
      const lineGeo = new THREE.PlaneGeometry(0.25, 3.5);
      lineGeo.rotateX(-Math.PI / 2);
      const lineMat = new THREE.MeshBasicMaterial({ color: 0x38bdf8 });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(0, 0.02, -i * 6);
      this.scene.add(line);
      this.roadLines.push(line);
    }

    // Streetlights
    for (let i = 0; i < 10; i++) {
      this.createStreetlight(-6.5, -i * 12);
      this.createStreetlight(6.5, -i * 12);
    }

    // Sleek Minimalist Cruiser Car
    this.createCar();

    // Spawn Star Orbs along highway
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
    const lampMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
    const lamp = new THREE.Mesh(lampGeo, lampMat);
    lamp.position.set(x > 0 ? -0.8 : 0.8, 5.8, 0);
    group.add(lamp);

    group.position.set(x, 0, z);
    this.scene.add(group);
    this.streetlights.push(group);
  }

  createCar() {
    this.car = new THREE.Group();

    // Body
    const bodyGeo = new THREE.BoxGeometry(1.6, 0.6, 3.2);
    const bodyMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      metalness: 0.85,
      roughness: 0.2
    });
    const body = new THREE.Mesh(bodyGeo, bodyMat);
    body.position.y = 0.5;
    this.car.add(body);

    // Cabin
    const cabinGeo = new THREE.BoxGeometry(1.3, 0.5, 1.6);
    const cabinMat = new THREE.MeshStandardMaterial({
      color: 0x030712,
      roughness: 0.1
    });
    const cabin = new THREE.Mesh(cabinGeo, cabinMat);
    cabin.position.set(0, 0.95, -0.2);
    this.car.add(cabin);

    // Taillights
    const tailMat = new THREE.MeshBasicMaterial({ color: 0xf43f5e });
    const tail1 = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.15, 0.05), tailMat);
    tail1.position.set(-0.55, 0.55, 1.62);
    const tail2 = tail1.clone();
    tail2.position.set(0.55, 0.55, 1.62);
    this.car.add(tail1);
    this.car.add(tail2);

    this.car.position.set(0, 0, 0);
    this.scene.add(this.car);
  }

  spawnOrbs() {
    const lanes = [-3, 0, 3];
    for (let i = 0; i < 25; i++) {
      const lane = lanes[Math.floor(Math.random() * lanes.length)];
      const z = -20 - i * 18;

      const orbGeo = new THREE.SphereGeometry(0.4, 16, 16);
      const orbMat = new THREE.MeshBasicMaterial({ color: 0xfef08a });
      const orb = new THREE.Mesh(orbGeo, orbMat);
      orb.position.set(lane, 0.8, z);
      this.scene.add(orb);

      this.starOrbs.push({
        mesh: orb,
        collected: false
      });
    }
  }

  setupControls() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        this.targetCarX = Math.max(-3.5, this.targetCarX - 3.2);
      } else if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        this.targetCarX = Math.min(3.5, this.targetCarX + 3.2);
      }
    });

    // Touch / Mouse dragging across highway lanes
    let startX = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
    }, { passive: true });

    this.canvas.addEventListener('touchmove', (e) => {
      const diff = e.touches[0].clientX - startX;
      if (Math.abs(diff) > 25) {
        if (diff > 0) this.targetCarX = Math.min(3.5, this.targetCarX + 3.2);
        else this.targetCarX = Math.max(-3.5, this.targetCarX - 3.2);
        startX = e.touches[0].clientX;
      }
    }, { passive: true });

    this.canvas.addEventListener('pointerdown', (e) => {
      const xRatio = (e.clientX / window.innerWidth) * 2 - 1;
      this.targetCarX = xRatio * 3.5;
    });
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
      this.orbCountEl.textContent = `${this.collectedOrbs}/${this.targetOrbs}`;
    }
    if (this.statusText) {
      if (this.isCompleted) {
        this.statusText.textContent = "✨ Overlook reached. Take a peaceful breath.";
      } else {
        const remaining = Math.max(0, Math.floor(this.maxDistance - this.distance));
        this.statusText.textContent = `Cruising smoothly • ${remaining}m to scenic overlook`;
      }
    }
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const delta = this.clock.getDelta();
    const speed = 28 * delta;

    if (!this.isCompleted) {
      this.distance += speed * 2.5;

      // Smooth car steering interpolation
      this.carX += (this.targetCarX - this.carX) * 0.15;
      if (this.car) {
        this.car.position.x = this.carX;
        this.car.rotation.z = (this.targetCarX - this.carX) * -0.05;
      }

      // Move road lines & streetlights backward
      this.roadLines.forEach(l => {
        l.position.z += speed;
        if (l.position.z > 5) l.position.z -= 120;
      });

      this.streetlights.forEach(s => {
        s.position.z += speed;
        if (s.position.z > 5) s.position.z -= 120;
      });

      // Move star orbs & check collision
      this.starOrbs.forEach(o => {
        if (!o.collected) {
          o.mesh.position.z += speed;
          o.mesh.rotation.y += 0.05;

          // Check proximity
          const dx = o.mesh.position.x - this.carX;
          const dz = o.mesh.position.z - this.car.position.z;
          if (Math.abs(dx) < 1.4 && Math.abs(dz) < 1.4) {
            o.collected = true;
            o.mesh.visible = false;
            this.collectedOrbs++;
            sound.playChime(392 + this.collectedOrbs * 30, 4);
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
      }

      this.updateUI();
    }

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export const highwayGame = new HighwayGame();
