import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Matcha Zen Tea Ceremony Game
 * Mindful 3-step traditional tea ritual: Sift matcha, pour water, whisk to froth.
 * Goal: Complete all 3 mindful steps to achieve 100% serene tea harmony.
 */
export class TeaGame {
  constructor() {
    this.canvas = document.getElementById('tea-canvas');
    this.statusText = document.getElementById('tea-status-text');
    this.stepBtn = document.getElementById('btn-tea-action');
    this.progressBar = document.getElementById('tea-progress-fill');

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.chawan = null;
    this.teaLiquid = null;
    this.whisk = null;
    this.steamGroup = null;

    this.currentStep = 0; // 0: Scoop, 1: Pour, 2: Whisk, 3: Completed
    this.whiskProgress = 0;
    this.isWhisking = false;

    this.clock = new THREE.Clock();
    this.isInitialized = false;
    this.rafId = null;
  }

  init() {
    if (this.isInitialized) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 3.5, 7);
    this.camera.lookAt(0, 1, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Warm tatami room lighting
    const ambient = new THREE.AmbientLight(0xffedd5, 2.0);
    this.scene.add(ambient);

    const dir = new THREE.DirectionalLight(0xfef08a, 1.4);
    dir.position.set(3, 8, 5);
    this.scene.add(dir);

    // Ceramic Chawan Tea Bowl
    this.createBowl();

    // Bamboo Whisk (Chasen)
    this.createWhisk();

    // Steam particles
    this.setupSteam();

    this.setupEvents();
    this.isInitialized = true;
  }

  createBowl() {
    const group = new THREE.Group();

    // Outer bowl
    const bowlGeo = new THREE.CylinderGeometry(1.6, 1.0, 1.4, 32, 1, true);
    const bowlMat = new THREE.MeshStandardMaterial({
      color: 0x292524,
      roughness: 0.8,
      metalness: 0.1,
      side: THREE.DoubleSide
    });
    const bowl = new THREE.Mesh(bowlGeo, bowlMat);
    bowl.position.y = 1.0;
    group.add(bowl);

    // Bowl Bottom
    const bottomGeo = new THREE.CircleGeometry(1.0, 32);
    bottomGeo.rotateX(Math.PI / 2);
    const bottom = new THREE.Mesh(bottomGeo, bowlMat);
    bottom.position.y = 0.3;
    group.add(bottom);

    // Tea Liquid / Matcha Powder surface
    const teaGeo = new THREE.CircleGeometry(1.4, 32);
    teaGeo.rotateX(-Math.PI / 2);
    this.teaMat = new THREE.MeshStandardMaterial({
      color: 0x14532d, // Dark matcha dry powder initially
      roughness: 0.9
    });
    this.teaLiquid = new THREE.Mesh(teaGeo, this.teaMat);
    this.teaLiquid.position.y = 0.5;
    this.teaLiquid.scale.set(0.01, 0.01, 0.01);
    group.add(this.teaLiquid);

    this.scene.add(group);
    this.chawan = group;
  }

  createWhisk() {
    this.whisk = new THREE.Group();

    const handleGeo = new THREE.CylinderGeometry(0.12, 0.12, 2.0, 12);
    const handleMat = new THREE.MeshStandardMaterial({ color: 0xd97706, roughness: 0.6 });
    const handle = new THREE.Mesh(handleGeo, handleMat);
    handle.position.y = 1.5;
    this.whisk.add(handle);

    const tinesGeo = new THREE.ConeGeometry(0.5, 1.0, 16, 1, true);
    const tines = new THREE.Mesh(tinesGeo, handleMat);
    tines.position.y = 0.5;
    tines.rotation.x = Math.PI;
    this.whisk.add(tines);

    this.whisk.position.set(0, 4, 0);
    this.whisk.visible = false;
    this.scene.add(this.whisk);
  }

  setupSteam() {
    this.steamGroup = new THREE.Group();
    const count = 18;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      pos[i * 3 + 0] = (Math.random() - 0.5) * 1.0;
      pos[i * 3 + 1] = 1.2 + Math.random() * 1.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 1.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 16,
      transparent: true,
      opacity: 0.0
    });

    this.steamMesh = new THREE.Points(geo, mat);
    this.steamGroup.add(this.steamMesh);
    this.scene.add(this.steamGroup);
  }

  setupEvents() {
    this.stepBtn?.addEventListener('click', () => {
      this.advanceStep();
    });

    // Whisking with touch or mouse swipe inside bowl
    const handleWhiskMove = () => {
      if (this.currentStep === 2) {
        this.whiskProgress = Math.min(100, this.whiskProgress + 3.5);
        sound.playChime(329 + this.whiskProgress * 2.0, 1.5);
        this.updateWhiskVisuals();
      }
    };

    this.canvas.addEventListener('mousemove', handleWhiskMove);
    this.canvas.addEventListener('touchmove', handleWhiskMove, { passive: true });
  }

  advanceStep() {
    if (this.currentStep === 0) {
      // Step 1: Scoop fine green matcha
      this.currentStep = 1;
      this.teaLiquid.scale.set(0.7, 0.7, 0.7);
      this.teaMat.color.setHex(0x16a34a); // Bright matcha green
      sound.playChime(261.63, 4);
    } else if (this.currentStep === 1) {
      // Step 2: Pour steaming water
      this.currentStep = 2;
      this.teaLiquid.scale.set(1.0, 1.0, 1.0);
      this.teaMat.color.setHex(0x15803d);
      this.teaLiquid.position.y = 1.1;
      this.steamMesh.material.opacity = 0.35;
      this.whisk.visible = true;
      this.whisk.position.set(0, 1.8, 0);
      sound.playChime(392.00, 5);
    } else if (this.currentStep === 3) {
      // Reset
      this.currentStep = 0;
      this.whiskProgress = 0;
      this.teaLiquid.scale.set(0.01, 0.01, 0.01);
      this.whisk.visible = false;
      this.steamMesh.material.opacity = 0.0;
    }
    this.updateUI();
  }

  updateWhiskVisuals() {
    if (this.whiskProgress >= 100 && this.currentStep === 2) {
      this.currentStep = 3;
      this.whisk.visible = false;
      this.teaMat.color.setHex(0x86efac); // Frothy light jade foam!
      sound.playChime(523.25, 8);
    }
    this.updateUI();
  }

  updateUI() {
    if (this.progressBar) {
      let pct = 0;
      if (this.currentStep === 1) pct = 33;
      else if (this.currentStep === 2) pct = 33 + (this.whiskProgress / 100) * 66;
      else if (this.currentStep === 3) pct = 100;
      this.progressBar.style.width = `${pct}%`;
    }

    if (this.statusText && this.stepBtn) {
      if (this.currentStep === 0) {
        this.statusText.textContent = "Step 1: Sift fresh stone-ground matcha powder into bowl";
        this.stepBtn.textContent = "🍃 Scoop Matcha";
      } else if (this.currentStep === 1) {
        this.statusText.textContent = "Step 2: Pour steaming 80°C spring water";
        this.stepBtn.textContent = "🫖 Pour Water";
      } else if (this.currentStep === 2) {
        this.statusText.textContent = `Step 3: Move finger/cursor in circles to whisk frothy jade foam (${Math.floor(this.whiskProgress)}%)`;
        this.stepBtn.textContent = "🍵 Whisking...";
      } else if (this.currentStep === 3) {
        this.statusText.textContent = "✨ Serene bowl of Matcha perfected. Savor the tranquility.";
        this.stepBtn.textContent = "🌸 Brew Another";
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
    const time = this.clock.getElapsedTime();

    // Chawan gentle presentation rotation
    if (this.chawan) {
      this.chawan.rotation.y += 0.002;
    }

    // Whisk animation when whisking
    if (this.currentStep === 2 && this.whisk) {
      this.whisk.position.x = Math.sin(time * 8) * 0.4;
      this.whisk.position.z = Math.cos(time * 8) * 0.4;
      this.whisk.rotation.z = Math.sin(time * 8) * 0.2;
    }

    // Gentle rising steam
    if (this.steamMesh && this.steamMesh.material.opacity > 0) {
      const pos = this.steamMesh.geometry.attributes.position;
      for (let i = 0; i < pos.count; i++) {
        let y = pos.getY(i) + delta * 0.8;
        if (y > 3.2) y = 1.2;
        pos.setY(i, y);
      }
      pos.needsUpdate = true;
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

export const teaGame = new TeaGame();
