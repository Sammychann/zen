import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Firefly Constellation Game
 * Gentle floating glowing fireflies that drift toward you and bloom into constellations.
 */
export class FireflyGame {
  constructor() {
    this.canvas = document.getElementById('fireflies-canvas');
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.fireflies = [];
    this.constellations = [];
    this.pointer = new THREE.Vector3(999, 999, 0);
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

    // Ambient night lighting
    const ambient = new THREE.AmbientLight(0x0a1424, 2.0);
    this.scene.add(ambient);

    this.spawnFireflies(24);
    this.setupEvents();
    this.isInitialized = true;
  }

  createFireflyMesh() {
    const group = new THREE.Group();

    // Soft glowing core
    const coreGeo = new THREE.SphereGeometry(0.12, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff9db });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Glowing halo ring
    const haloGeo = new THREE.PlaneGeometry(0.9, 0.9);
    const haloCanvas = document.createElement('canvas');
    haloCanvas.width = 128;
    haloCanvas.height = 128;
    const hCtx = haloCanvas.getContext('2d');
    const grad = hCtx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0, 'rgba(255, 230, 109, 0.85)');
    grad.addColorStop(0.3, 'rgba(100, 223, 223, 0.45)');
    grad.addColorStop(1, 'rgba(0, 0, 0, 0)');
    hCtx.fillStyle = grad;
    hCtx.fillRect(0, 0, 128, 128);

    const haloTexture = new THREE.CanvasTexture(haloCanvas);
    const haloMat = new THREE.MeshBasicMaterial({
      map: haloTexture,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      side: THREE.DoubleSide
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    return group;
  }

  spawnFireflies(count) {
    for (let i = 0; i < count; i++) {
      const mesh = this.createFireflyMesh();
      const x = (Math.random() - 0.5) * 26;
      const y = (Math.random() - 0.5) * 18;
      const z = (Math.random() - 0.5) * 6;
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      this.fireflies.push({
        mesh,
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.015, (Math.random() - 0.5) * 0.015, 0),
        pulseSpeed: 1.5 + Math.random() * 2.0,
        pulseOffset: Math.random() * Math.PI * 2,
        seed: Math.random() * 100
      });
    }
  }

  triggerBloom(x, y, z) {
    const starCount = 7;
    const starGroup = new THREE.Group();
    const sparks = [];

    const chimePitches = [329.63, 392.00, 440.00, 523.25, 587.33, 659.25];
    const pitch = chimePitches[Math.floor(Math.random() * chimePitches.length)];
    sound.playChime(pitch, 6);

    for (let i = 0; i < starCount; i++) {
      const angle = (i / starCount) * Math.PI * 2 + (Math.random() * 0.2);
      const dist = 0.8 + Math.random() * 1.4;

      const starGeo = new THREE.SphereGeometry(0.08, 8, 8);
      const starMat = new THREE.MeshBasicMaterial({
        color: Math.random() > 0.4 ? 0xffe66d : 0x64dfdf,
        transparent: true,
        opacity: 1
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.set(0, 0, 0);
      starGroup.add(star);

      // Line connecting to center
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x64dfdf,
        transparent: true,
        opacity: 0.75
      });
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(0, 0, 0)
      ]);
      const line = new THREE.Line(lineGeo, lineMat);
      starGroup.add(line);

      sparks.push({
        mesh: star,
        line,
        targetPos: new THREE.Vector3(Math.cos(angle) * dist, Math.sin(angle) * dist, (Math.random() - 0.5) * 0.4),
        currPos: new THREE.Vector3(0, 0, 0)
      });
    }

    starGroup.position.set(x, y, z);
    this.scene.add(starGroup);

    this.constellations.push({
      group: starGroup,
      sparks,
      progress: 0,
      life: 1.0
    });
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

    // Update Fireflies
    for (let i = this.fireflies.length - 1; i >= 0; i--) {
      const f = this.fireflies[i];

      // Organic wandering
      f.pos.x += f.vel.x + Math.sin(time * 0.8 + f.seed) * 0.008;
      f.pos.y += f.vel.y + Math.cos(time * 0.6 + f.seed) * 0.008;

      // Soft magnetic attraction to cursor/touch
      const distToPointer = f.pos.distanceTo(this.pointer);
      if (distToPointer < 4.5) {
        const pullDir = new THREE.Vector3().subVectors(this.pointer, f.pos).normalize();
        f.pos.add(pullDir.multiplyScalar(0.035));

        // Trigger bloom on close contact
        if (distToPointer < 0.9) {
          this.triggerBloom(f.pos.x, f.pos.y, f.pos.z);
          // Respawn firefly smoothly elsewhere
          f.pos.x = (Math.random() - 0.5) * 24;
          f.pos.y = (Math.random() - 0.5) * 16;
        }
      }

      // Keep within bounds
      if (Math.abs(f.pos.x) > 14) f.pos.x *= -0.95;
      if (Math.abs(f.pos.y) > 10) f.pos.y *= -0.95;

      // Breathing glow pulse
      const pulse = 0.5 + 0.5 * Math.sin(time * f.pulseSpeed + f.pulseOffset);
      f.mesh.position.copy(f.pos);
      f.mesh.scale.setScalar(0.8 + pulse * 0.4);
    }

    // Update Bloom Constellations
    for (let i = this.constellations.length - 1; i >= 0; i--) {
      const c = this.constellations[i];
      c.progress += 0.025;
      c.life -= 0.015;

      c.sparks.forEach(s => {
        s.currPos.lerp(s.targetPos, 0.08);
        s.mesh.position.copy(s.currPos);
        s.mesh.material.opacity = c.life;

        const pts = [new THREE.Vector3(0, 0, 0), s.currPos];
        s.line.geometry.setFromPoints(pts);
        s.line.material.opacity = c.life * 0.6;
      });

      if (c.life <= 0) {
        this.scene.remove(c.group);
        this.constellations.splice(i, 1);
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

export const fireflyGame = new FireflyGame();
