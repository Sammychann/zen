import * as THREE from 'three';

/**
 * Blue Hour Ocean (Dark Theme) Three.js Scene
 * Deep inky abyss with glowing bioluminescent particles and gentle wave motion.
 */
export class OceanScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 18);

    this.particleCount = 350;
    this.particles = null;
    this.particleGeometry = null;
    this.particleMaterial = null;
    this.positions = null;
    this.initialPositions = [];
    this.speeds = [];

    this.ambientLight = null;
    this.moonLight = null;

    this.init();
  }

  init() {
    // Deep midnight ambient lighting
    this.ambientLight = new THREE.AmbientLight(0x020610, 1.2);
    this.scene.add(this.ambientLight);

    this.moonLight = new THREE.DirectionalLight(0x38bdf8, 1.0);
    this.moonLight.position.set(-8, 12, 6);
    this.scene.add(this.moonLight);

    // Bioluminescent Particle System
    this.particleGeometry = new THREE.BufferGeometry();
    this.positions = new Float32Array(this.particleCount * 3);
    const colors = new Float32Array(this.particleCount * 3);
    const sizes = new Float32Array(this.particleCount);

    const color1 = new THREE.Color(0x38bdf8); // Sky blue
    const color2 = new THREE.Color(0x2dd4bf); // Teal
    const color3 = new THREE.Color(0x818cf8); // Indigo bioluminescence

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const x = (Math.random() - 0.5) * 36;
      const y = (Math.random() - 0.5) * 26;
      const z = (Math.random() - 0.5) * 22;

      this.positions[i3 + 0] = x;
      this.positions[i3 + 1] = y;
      this.positions[i3 + 2] = z;

      this.initialPositions.push({ x, y, z });
      this.speeds.push({
        driftX: (Math.random() - 0.5) * 0.008,
        driftY: 0.006 + Math.random() * 0.012,
        freq: 0.5 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2
      });

      const randColor = Math.random();
      const mixedColor = randColor < 0.6 ? color1 : (randColor < 0.85 ? color2 : color3);
      colors[i3 + 0] = mixedColor.r;
      colors[i3 + 1] = mixedColor.g;
      colors[i3 + 2] = mixedColor.b;

      sizes[i] = 12.0 + Math.random() * 24.0;
    }

    this.particleGeometry.setAttribute('position', new THREE.BufferAttribute(this.positions, 3));
    this.particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    this.particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

    // Custom circular glow particle shader
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
          
          pos.y += sin(uTime * 0.8 + pos.x * 0.2) * 0.6;
          pos.x += cos(uTime * 0.5 + pos.y * 0.15) * 0.4;
          
          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_PointSize = size * (220.0 / -mvPosition.z) * uPixelRatio;
          gl_Position = projectionMatrix * mvPosition;

          vAlpha = 0.6 + 0.4 * sin(uTime * 1.2 + pos.x + pos.y);
        }
      `,
      fragmentShader: `
        varying vec3 vColor;
        varying float vAlpha;

        void main() {
          float dist = length(gl_PointCoord - vec2(0.5));
          if (dist > 0.5) discard;
          
          float glow = pow(1.0 - (dist * 2.0), 2.2);
          gl_FragColor = vec4(vColor, glow * vAlpha * 0.9);
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
      this.positions[i3 + 0] += speed.driftX + Math.sin(time * speed.freq + speed.phase) * 0.005;

      if (this.positions[i3 + 1] > 14) {
        this.positions[i3 + 1] = -14;
        this.positions[i3 + 0] = (Math.random() - 0.5) * 36;
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
