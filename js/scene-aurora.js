import * as THREE from 'three';

/**
 * Secret Aurora Borealis Theme Three.js Scene
 * Shimmering emerald, violet, and cyan cosmic light curtains with stardust particles.
 */
export class AuroraScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 18);

    this.particleCount = 400;
    this.particles = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.positions = null;
    this.initialPositions = [];
    this.speeds = [];

    this.ambientLight = null;
    this.auroraLight = null;

    this.init();
  }

  init() {
    this.ambientLight = new THREE.AmbientLight(0x021a14, 1.4);
    this.scene.add(this.ambientLight);

    this.auroraLight = new THREE.DirectionalLight(0x34d399, 1.2);
    this.auroraLight.position.set(0, 14, 8);
    this.scene.add(this.auroraLight);

    // Stardust and Aurora Wave Particles
    this.particleGeometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);

    const color1 = new THREE.Color(0x34d399); // Emerald
    const color2 = new THREE.Color(0x22d3ee); // Cyan
    const color3 = new THREE.Color(0xa78bfa); // Violet aurora

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 28;
      const z = (Math.random() - 0.5) * 24;

      this.positions[i3 + 0] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;

      this.initialPositions.push({ x, y, z });
      this.speeds.push({
        driftX: (Math.random() - 0.5) * 0.012,
        driftY: 0.008 + Math.random() * 0.016,
        freq: 0.6 + Math.random() * 1.8,
        phase: Math.random() * Math.PI * 2
      });

      const rand = Math.random();
      const c = rand < 0.45 ? color1 : (rand < 0.75 ? color2 : color3);
      colors[i3 + 0] = c.r;
      colors[i3 + 1] = c.g;
      colors[i3 + 2] = c.b;

      sizes[i] = 14.0 + Math.random() * 26.0;
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    this.particleMaterial = new THREE.ShaderMaterial({
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
        varying float vAlpha;

        void main() {
          vColor = color;
          vec3 pos = position;
          
          // Aurora sinusoidal curtain motion
          pos.y += sin(uTime * 0.9 + pos.x * 0.25) * 0.9;
          pos.x += cos(uTime * 0.6 + pos.y * 0.2) * 0.6;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (240.0 / -mvPosition.z) * uPixelRatio;
          gl_Position = projectionMatrix * mvPosition;

          vAlpha = 0.65 + 0.35 * sin(uTime * 1.5 + pos.x * 0.3);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float glow = pow(1.0 - (dist * 2.0), 2.0);
          gl_FragColor = vec4(vColor, glow * vAlpha * 0.95);
        }
      `,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending
    });

    this.particles = new THREE.Points(this.particleGeometry, this.particleMaterial);
    this.scene.add(this.particles);
  }

  update(time) {
    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uTime.value = time;
    }

    const posAttr = this.particleGeometry.attributes.position;
    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const speed = this.speeds[i];

      this.positions[i3 + 1] += speed.driftY;
      this.positions[i3 + 0] += speed.driftX + Math.sin(time * speed.freq + speed.phase) * 0.008;

      if (this.positions[i3 + 1] > 15) {
        this.positions[i3 + 1] = -15;
        this.positions[i3 + 0] = (Math.random() - 0.5) * 40;
      }
    }
    posAttr.needsUpdate = true;
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    if (this.particleMaterial) {
      this.particleMaterial.uniforms.uPixelRatio.value = Math.min(window.devicePixelRatio, 2);
    }
  }
}
