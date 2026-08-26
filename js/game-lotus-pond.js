import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Midnight Lotus & Lantern Pond Game
 * Tap or drag to place glowing lanterns and lotus flowers that drift across calm waters.
 */
export class LotusPondGame {
  constructor() {
    this.canvas = document.getElementById('lotus-canvas');
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.lanterns = [];
    this.ripples = [];
    this.clock = new THREE.Clock();
    this.isInitialized = false;
    this.rafId = null;

    this.raycaster = new THREE.Raycaster();
    this.planeIntersect = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  }

  init() {
    if (this.isInitialized) return;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, -6, 16);
    this.camera.lookAt(0, 0, 0);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Midnight water pond lighting
    const ambient = new THREE.AmbientLight(0x020714, 2.0);
    this.scene.add(ambient);

    const moonLight = new THREE.DirectionalLight(0x38bdf8, 1.2);
    moonLight.position.set(0, 10, 10);
    this.scene.add(moonLight);

    // Initial pre-placed gentle floating lanterns
    for (let i = 0; i < 6; i++) {
      this.spawnLantern(
        new THREE.Vector3((Math.random() - 0.5) * 12, (Math.random() - 0.5) * 8 + 2, 0),
        false
      );
    }

    this.setupEvents();
    this.isInitialized = true;
  }

  createLanternMesh() {
    const group = new THREE.Group();

    // Glowing warm lantern box/cube
    const boxGeo = new THREE.BoxGeometry(0.7, 0.7, 0.9);
    const boxMat = new THREE.MeshStandardMaterial({
      color: 0xffedd5,
      emissive: 0xf59e0b,
      emissiveIntensity: 0.85,
      roughness: 0.3
    });
    const box = new THREE.Mesh(boxGeo, boxMat);
    group.add(box);

    // Soft glow halo
    const haloGeo = new THREE.RingGeometry(0.5, 1.2, 24);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0xfbbf24,
      transparent: true,
      opacity: 0.35,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    halo.position.set(0, 0, -0.2);
    group.add(halo);

    return group;
  }

  spawnLantern(pos, playSound = true) {
    const mesh = this.createLanternMesh();
    mesh.position.copy(pos);
    mesh.rotation.z = Math.random() * Math.PI;
    this.scene.add(mesh);

    this.lanterns.push({
      mesh,
      pos: pos.clone(),
      driftY: 0.008 + Math.random() * 0.012,
      driftX: (Math.random() - 0.5) * 0.006,
      swaySpeed: 1.0 + Math.random() * 1.5,
      swayOffset: Math.random() * Math.PI * 2
    });

    // Ripple
    this.spawnRipple(pos);

    if (playSound) {
      sound.playChime(261.63 + Math.random() * 200, 5);
    }
  }

  spawnRipple(pos) {
    const ringGeo = new THREE.RingGeometry(0.2, 0.3, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.7,
      side: THREE.DoubleSide
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.position.copy(pos);
    ring.position.z = -0.1;
    this.scene.add(ring);

    this.ripples.push({
      mesh: ring,
      radius: 0.2,
      life: 1.0
    });
  }

  setupEvents() {
    const handleAction = (e) => {
      const rect = this.canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;

      const mouseNorm = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );

      this.raycaster.setFromCamera(mouseNorm, this.camera);
      const target = new THREE.Vector3();
      this.raycaster.ray.intersectPlane(this.planeIntersect, target);

      this.spawnLantern(target, true);
    };

    this.canvas.addEventListener('mousedown', handleAction);
    this.canvas.addEventListener('touchstart', handleAction, { passive: false });
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

    const delta = this.clock.getDelta();
    const time = this.clock.getElapsedTime();

    // Update Lanterns drifting slowly upstream
    this.lanterns.forEach(l => {
      l.pos.y += l.driftY;
      l.pos.x += l.driftX + Math.sin(time * l.swaySpeed + l.swayOffset) * 0.003;
      l.mesh.position.copy(l.pos);
      l.mesh.rotation.z += 0.002;

      // Wrap around
      if (l.pos.y > 10) {
        l.pos.y = -8;
        l.pos.x = (Math.random() - 0.5) * 14;
      }
    });

    // Update Water Ripples
    for (let i = this.ripples.length - 1; i >= 0; i--) {
      const r = this.ripples[i];
      r.life -= delta * 0.5;
      r.radius += delta * 2.2;
      r.mesh.scale.set(r.radius, r.radius, 1);
      r.mesh.material.opacity = r.life * 0.5;

      if (r.life <= 0) {
        this.scene.remove(r.mesh);
        this.ripples.splice(i, 1);
      }
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

export const lotusPondGame = new LotusPondGame();
