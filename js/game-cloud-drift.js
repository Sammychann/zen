import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Dream Cloud Sculptor Game
 * Glide your finger to sculpt and part soft stardust clouds into glowing dissolving wisps.
 */
export class CloudDriftGame {
  constructor() {
    this.canvas = document.getElementById('cloud-canvas');
    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.cloudPoints = null;
    this.positions = null;
    this.initialPositions = [];
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
    this.camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 16);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.spawnClouds(450);
    this.setupEvents();
    this.isInitialized = true;
  }

  spawnClouds(count) {
    const geo = new THREE.BufferGeometry();
    this.positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);

    const c1 = new THREE.Color(0xfbcfe8); // Soft pink
    const c2 = new THREE.Color(0xbae6fd); // Pastel blue
    const c3 = new THREE.Color(0xddd6fe); // Soft lavender

    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 28;
      const y = (Math.random() - 0.5) * 18;
      const z = (Math.random() - 0.5) * 8;

      this.positions[i3 + 0] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;

      this.initialPositions.push({ x, y, z, seed: Math.random() * 10 });

      const chosen = Math.random() < 0.35 ? c1 : (Math.random() < 0.7 ? c2 : c3);
      colors[i3 + 0] = chosen.r;
      colors[i3 + 1] = chosen.g;
      colors[i3 + 2] = chosen.b;

      sizes[i] = 20.0 + Math.random() * 40.0;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geo.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    const mat = new THREE.ShaderMaterial({
      uniforms: {
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
      },
      vertexShader: `
        uniform float uTime;
        uniform float uPixelRatio;
        attribute float size;
        attribute vec3 color;
        varying vec3 vColor;

        void main() {
          vColor = color;
          vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
          gl_PointSize = size * (240.0 / -mvPosition.z) * uPixelRatio;
          gl_Position = projectionMatrix * mvPosition;
        }
      `,
      fragmentShader: `
        varying vec3 vColor;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          float alpha = pow(1.0 - dist * 2.0, 2.0) * 0.35;
          gl_FragColor = vec4(vColor, alpha);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.cloudPoints = new THREE.Points(geo, mat);
    this.scene.add(this.cloudPoints);
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

      if (Math.random() < 0.05) {
        sound.playChime(329.63 + Math.random() * 200, 6);
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
    const posAttr = this.cloudPoints.geometry.attributes.position;

    for (let i = 0; i < this.initialPositions.length; i++) {
      const i3 = i * 3;
      const init = this.initialPositions[i];

      let cx = init.x + Math.sin(time * 0.3 + init.seed) * 1.2;
      let cy = init.y + Math.cos(time * 0.2 + init.seed) * 0.8;

      // Parting clouds with gentle repulsion from touch
      const dx = cx - this.pointer.x;
      const dy = cy - this.pointer.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < 4.0) {
        const force = (1.0 - dist / 4.0) * 2.2;
        cx += (dx / (dist + 0.001)) * force;
        cy += (dy / (dist + 0.001)) * force;
      }

      this.positions[i3 + 0] = cx;
      this.positions[i3 + 1] = cy;
    }
    posAttr.needsUpdate = true;

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.camera || !this.renderer) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export const cloudDriftGame = new CloudDriftGame();
