import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Golden Kintsugi Pottery Repair Game
 * Japanese art of repairing broken pottery with precious gold lacquer.
 * Goal: Reassemble all 4 ceramic shards to restore the vessel to golden wholeness.
 */
export class KintsugiGame {
  constructor() {
    this.canvas = document.getElementById('kintsugi-canvas');
    this.statusText = document.getElementById('kintsugi-status-text');
    this.progressBar = document.getElementById('kintsugi-progress-fill');
    this.shardCountEl = document.getElementById('kintsugi-shard-count');

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.shards = [];
    this.goldLines = [];

    this.fittedCount = 0;
    this.totalShards = 4;
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
    this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 12);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambient = new THREE.AmbientLight(0xfff7ed, 2.0);
    this.scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xfef08a, 1.8);
    dirLight.position.set(4, 6, 8);
    this.scene.add(dirLight);

    // Setup 4 Broken Shards
    this.setupShards();

    this.setupEvents();
    this.isInitialized = true;
  }

  setupShards() {
    const shardDefs = [
      { startX: -4.5, startY: 3.0, targetX: -1.2, targetY: 1.2, rotZ: 0.4 },
      { startX: 4.5, startY: 3.2, targetX: 1.2, targetY: 1.2, rotZ: -0.3 },
      { startX: -4.2, startY: -3.0, targetX: -1.2, targetY: -1.2, rotZ: -0.5 },
      { startX: 4.6, startY: -2.8, targetX: 1.2, targetY: -1.2, rotZ: 0.3 }
    ];

    const ceramicMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a, // Deep indigo porcelain
      roughness: 0.3,
      metalness: 0.2
    });

    shardDefs.forEach((def, index) => {
      const geo = new THREE.DodecahedronGeometry(1.4, 1);
      geo.scale(1.2, 1.0, 0.4);
      const mesh = new THREE.Mesh(geo, ceramicMat.clone());
      mesh.position.set(def.startX, def.startY, 0);
      mesh.rotation.z = def.rotZ;
      this.scene.add(mesh);

      // Gold seam line (hidden until fitted)
      const lineGeo = new THREE.RingGeometry(1.2, 1.35, 16);
      const lineMat = new THREE.MeshBasicMaterial({
        color: 0xfbbf24, // Radiant gold lacquer
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide
      });
      const line = new THREE.Mesh(lineGeo, lineMat);
      line.position.set(def.targetX, def.targetY, 0.1);
      this.scene.add(line);

      this.shards.push({
        mesh,
        line,
        startX: def.startX,
        startY: def.startY,
        targetX: def.targetX,
        targetY: def.targetY,
        currX: def.startX,
        currY: def.startY,
        isFitted: false,
        index
      });
    });
  }

  setupEvents() {
    const handleTap = (e) => {
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

      // Check which shard is nearest to tap
      let closest = null;
      let minDist = 999;
      this.shards.forEach(s => {
        if (!s.isFitted) {
          const dist = Math.sqrt((s.currX - target.x) ** 2 + (s.currY - target.y) ** 2);
          if (dist < minDist && dist < 3.0) {
            minDist = dist;
            closest = s;
          }
        }
      });

      if (closest) {
        this.fitShard(closest);
      }
    };

    this.canvas.addEventListener('mousedown', handleTap);
    this.canvas.addEventListener('touchstart', handleTap, { passive: false });
  }

  fitShard(shard) {
    shard.isFitted = true;
    this.fittedCount++;
    sound.playChime(261.63 + this.fittedCount * 65, 5);

    // Light up gold line
    shard.line.material.opacity = 1.0;

    this.updateUI();

    if (this.fittedCount >= this.totalShards) {
      this.isCompleted = true;
      sound.playChime(523.25, 9);
    }
  }

  updateUI() {
    if (this.shardCountEl) {
      this.shardCountEl.textContent = `${this.fittedCount}/${this.totalShards}`;
    }
    if (this.progressBar) {
      const pct = (this.fittedCount / this.totalShards) * 100;
      this.progressBar.style.width = `${pct}%`;
    }
    if (this.statusText) {
      if (this.isCompleted) {
        this.statusText.textContent = "✨ Beautifully restored with gold. Stronger at the broken places.";
      } else {
        this.statusText.textContent = `Tap shards to set them in gold (${this.fittedCount}/${this.totalShards} restored)`;
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

    this.shards.forEach(s => {
      if (s.isFitted) {
        // Lerp to target position
        s.currX += (s.targetX - s.currX) * 0.1;
        s.currY += (s.targetY - s.currY) * 0.1;
        s.mesh.rotation.z *= 0.95;
      } else {
        // Gentle float
        s.mesh.position.y = s.startY + Math.sin(time * 1.5 + s.index) * 0.15;
      }
      s.mesh.position.x = s.currX;
      s.mesh.position.y = s.currY;
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

export const kintsugiGame = new KintsugiGame();
