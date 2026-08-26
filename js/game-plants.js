import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Sanctuary Plant Nursery Game
 * Gently water and nourish 3 soothing potted plants until they bloom into full flower.
 * Goal: Reach 100% hydration and full bloom on all 3 botanical plants.
 */
export class PlantGame {
  constructor() {
    this.canvas = document.getElementById('plants-canvas');
    this.statusText = document.getElementById('plants-status-text');
    this.progressBar = document.getElementById('plants-progress-fill');
    this.plantTabs = document.querySelectorAll('.plant-tab-btn');

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.currentPlantIndex = 0;
    this.plants = [];
    this.rainParticles = [];

    this.isWatering = false;
    this.clock = new THREE.Clock();
    this.isInitialized = false;
    this.rafId = null;
  }

  init() {
    if (this.isInitialized) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 2, 8);
    this.camera.lookAt(0, 1.2, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Warm greenhouse lighting
    const ambient = new THREE.AmbientLight(0xfff5ea, 1.8);
    this.scene.add(ambient);

    const sun = new THREE.DirectionalLight(0xfef3c7, 1.5);
    sun.position.set(4, 10, 6);
    this.scene.add(sun);

    // Setup 3 Distinct Botanical Plants
    this.setupPlants();

    // Setup Rain Droplet System
    this.setupWaterParticles();

    this.setupEvents();
    this.isInitialized = true;
  }

  setupPlants() {
    // 1. Japanese Bonsai
    const bonsaiGroup = this.createBonsai();
    bonsaiGroup.visible = true;
    this.scene.add(bonsaiGroup);

    // 2. French Lavender
    const lavenderGroup = this.createLavender();
    lavenderGroup.visible = false;
    this.scene.add(lavenderGroup);

    // 3. Sakura Blossom
    const sakuraGroup = this.createSakuraSeedling();
    sakuraGroup.visible = false;
    this.scene.add(sakuraGroup);

    this.plants = [
      { name: "Japanese Bonsai", group: bonsaiGroup, hydration: 0, maxHydration: 100, flowers: bonsaiGroup.userData.flowers },
      { name: "French Lavender", group: lavenderGroup, hydration: 0, maxHydration: 100, flowers: lavenderGroup.userData.flowers },
      { name: "Sakura Seedling", group: sakuraGroup, hydration: 0, maxHydration: 100, flowers: sakuraGroup.userData.flowers }
    ];
  }

  createPot() {
    const potGeo = new THREE.CylinderGeometry(1.2, 0.9, 1.1, 24);
    const potMat = new THREE.MeshStandardMaterial({
      color: 0x475569,
      roughness: 0.7
    });
    const pot = new THREE.Mesh(potGeo, potMat);
    pot.position.y = 0.55;

    const soilGeo = new THREE.CylinderGeometry(1.15, 1.15, 0.1, 24);
    const soilMat = new THREE.MeshStandardMaterial({ color: 0x271c19, roughness: 0.9 });
    const soil = new THREE.Mesh(soilGeo, soilMat);
    soil.position.y = 1.06;
    pot.add(soil);

    return pot;
  }

  createBonsai() {
    const group = new THREE.Group();
    group.add(this.createPot());

    // Trunk
    const trunkGeo = new THREE.CylinderGeometry(0.18, 0.35, 2.2, 12);
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5c4033, roughness: 0.9 });
    const trunk = new THREE.Mesh(trunkGeo, trunkMat);
    trunk.position.set(0, 2.1, 0);
    trunk.rotation.z = -0.15;
    group.add(trunk);

    // Pine Needles / Foliage Clusters
    const foliageMat = new THREE.MeshStandardMaterial({ color: 0x166534, roughness: 0.6 });
    const flowers = [];

    const clusters = [
      { x: -0.6, y: 2.8, z: 0.2, s: 0.6 },
      { x: 0.4, y: 3.2, z: -0.2, s: 0.75 },
      { x: -0.2, y: 3.6, z: 0.1, s: 0.85 }
    ];

    clusters.forEach(c => {
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(c.s, 1), foliageMat);
      foliage.position.set(c.x, c.y, c.z);
      group.add(foliage);

      // Flower Bud
      const flowerGeo = new THREE.SphereGeometry(0.16, 8, 8);
      const flowerMat = new THREE.MeshStandardMaterial({
        color: 0xf472b6,
        emissive: 0xdb2777,
        emissiveIntensity: 0.2
      });
      const fl = new THREE.Mesh(flowerGeo, flowerMat);
      fl.position.set(c.x, c.y + c.s * 0.7, c.z);
      fl.scale.set(0.01, 0.01, 0.01);
      group.add(fl);
      flowers.push(fl);
    });

    group.userData = { flowers };
    return group;
  }

  createLavender() {
    const group = new THREE.Group();
    group.add(this.createPot());

    const stemMat = new THREE.MeshStandardMaterial({ color: 0x4d7c0f, roughness: 0.7 });
    const flowerMat = new THREE.MeshStandardMaterial({ color: 0xa855f7, emissive: 0x7e22ce, emissiveIntensity: 0.3 });
    const flowers = [];

    for (let i = 0; i < 7; i++) {
      const angle = (i / 7) * Math.PI * 2;
      const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.05, 2.4, 8), stemMat);
      const x = Math.cos(angle) * 0.35;
      const z = Math.sin(angle) * 0.35;
      stem.position.set(x, 2.2, z);
      stem.rotation.z = (Math.random() - 0.5) * 0.2;
      group.add(stem);

      const bud = new THREE.Mesh(new THREE.ConeGeometry(0.18, 0.8, 8), flowerMat);
      bud.position.set(x, 3.4, z);
      bud.scale.set(0.01, 0.01, 0.01);
      group.add(bud);
      flowers.push(bud);
    }

    group.userData = { flowers };
    return group;
  }

  createSakuraSeedling() {
    const group = new THREE.Group();
    group.add(this.createPot());

    const trunk = new THREE.Mesh(
      new THREE.CylinderGeometry(0.14, 0.25, 2.5, 10),
      new THREE.MeshStandardMaterial({ color: 0x713f12, roughness: 0.8 })
    );
    trunk.position.set(0, 2.2, 0);
    group.add(trunk);

    const flowers = [];
    const petalMat = new THREE.MeshStandardMaterial({ color: 0xfbcfe8, emissive: 0xf472b6, emissiveIntensity: 0.4 });

    for (let i = 0; i < 9; i++) {
      const blossom = new THREE.Mesh(new THREE.SphereGeometry(0.22, 10, 10), petalMat);
      const bx = (Math.random() - 0.5) * 1.4;
      const by = 2.6 + Math.random() * 1.2;
      const bz = (Math.random() - 0.5) * 1.4;
      blossom.position.set(bx, by, bz);
      blossom.scale.set(0.01, 0.01, 0.01);
      group.add(blossom);
      flowers.push(blossom);
    }

    group.userData = { flowers };
    return group;
  }

  setupWaterParticles() {
    const count = 40;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 1.8;
      pos[i * 3 + 1] = 4.5 + Math.random() * 2.0;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.8;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 4,
      transparent: true,
      opacity: 0.0
    });

    this.rainMesh = new THREE.Points(geo, mat);
    this.scene.add(this.rainMesh);
  }

  setupEvents() {
    // Plant selection tabs
    this.plantTabs.forEach((tab, index) => {
      tab.addEventListener('click', () => {
        this.selectPlant(index);
      });
    });

    const waterBtn = document.getElementById('btn-water-plant');
    const startWater = () => { this.isWatering = true; };
    const endWater = () => { this.isWatering = false; };

    waterBtn?.addEventListener('mousedown', startWater);
    window.addEventListener('mouseup', endWater);

    waterBtn?.addEventListener('touchstart', startWater, { passive: false });
    window.addEventListener('touchend', endWater);

    this.canvas.addEventListener('pointerdown', startWater);
    window.addEventListener('pointerup', endWater);
  }

  selectPlant(index) {
    this.currentPlantIndex = index;
    this.plants.forEach((p, idx) => {
      p.group.visible = idx === index;
    });
    this.plantTabs.forEach((tab, idx) => {
      if (idx === index) tab.classList.add('active');
      else tab.classList.remove('active');
    });
    this.updateUI();
  }

  updateUI() {
    const current = this.plants[this.currentPlantIndex];
    if (this.progressBar) {
      this.progressBar.style.width = `${current.hydration}%`;
    }
    if (this.statusText) {
      if (current.hydration >= 100) {
        this.statusText.textContent = `🌸 ${current.name} in full vibrant bloom!`;
      } else {
        this.statusText.textContent = `Hold to water ${current.name} • ${Math.floor(current.hydration)}% hydrated`;
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

    const delta = this.clock.getDelta();
    const current = this.plants[this.currentPlantIndex];

    // Gentle plant sway
    if (current && current.group) {
      current.group.rotation.y += 0.003;
    }

    // Water rain stream physics
    if (this.isWatering && current.hydration < 100) {
      current.hydration = Math.min(100, current.hydration + delta * 35);
      this.rainMesh.material.opacity = 0.85;

      if (Math.random() < 0.25) {
        sound.playChime(329 + current.hydration * 2.5, 2);
      }

      // Bloom flowers scale with hydration
      const bloomScale = (current.hydration / 100) * 1.2;
      current.flowers.forEach(fl => {
        fl.scale.set(bloomScale, bloomScale, bloomScale);
      });

      if (current.hydration >= 100) {
        sound.playChime(587.33, 7);
      }

      this.updateUI();
    } else {
      this.rainMesh.material.opacity = Math.max(0, this.rainMesh.material.opacity - 0.08);
    }

    // Animate raindrops falling
    const pos = this.rainMesh.geometry.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      let y = pos.getY(i) - delta * 12;
      if (y < 1.0) y = 4.5 + Math.random() * 1.5;
      pos.setY(i, y);
    }
    pos.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export const plantGame = new PlantGame();
