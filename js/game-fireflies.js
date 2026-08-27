import * as THREE from 'three';
import { sound } from './sound.js';

/**
 * Detailed Astronomical Constellations with Real Star Catalog Data
 */
const DETAILED_CONSTELLATIONS = [
  {
    day: "Sunday",
    name: "Corona Borealis",
    title: "The Celestial Crown",
    myth: "A celestial wreath of jewel stars cast into the heavens.",
    affirmation: "The golden crown of stars shines for you. Your peace is your greatest power.",
    stars: [
      { name: "Alphecca (Gemma)", greek: "α CrB", type: "Binary White", color: 0x93c5fd, x: -0.05, y: 0.8 },
      { name: "Nusakan", greek: "β CrB", type: "Magnetic Star", color: 0xfef08a, x: -0.4, y: 0.65 },
      { name: "Gamma CrB", greek: "γ CrB", type: "White Dwarf System", color: 0xe0f2fe, x: -0.7, y: 0.2 },
      { name: "Delta CrB", greek: "δ CrB", type: "Yellow Giant", color: 0xfde047, x: 0.35, y: 0.7 },
      { name: "Epsilon CrB", greek: "ε CrB", type: "Orange Giant", color: 0xfba047, x: 0.65, y: 0.35 },
      { name: "Zeta CrB", greek: "ζ CrB", type: "Blue-White Pair", color: 0x67e8f9, x: 0.75, y: -0.1 },
      { name: "Theta CrB", greek: "θ CrB", type: "Be Star", color: 0x38bdf8, x: 0.45, y: -0.5 }
    ]
  },
  {
    day: "Monday",
    name: "Cassiopeia",
    title: "The Queen's Throne",
    myth: "The legendary royal 'W' etched permanently in northern skies.",
    affirmation: "Cassiopeia glimmers in quiet majesty. You have guided every light home.",
    stars: [
      { name: "Schedar", greek: "α Cas", type: "Orange Giant", color: 0xfbbf24, x: -0.45, y: 0.25 },
      { name: "Caph", greek: "β Cas", type: "Yellow-White Subgiant", color: 0xfef08a, x: -0.8, y: 0.6 },
      { name: "Navi (Gamma)", greek: "γ Cas", type: "Variable Eruptive", color: 0x38bdf8, x: -0.05, y: 0.55 },
      { name: "Ruchbah", greek: "δ Cas", type: "Eclipsing Binary", color: 0x93c5fd, x: 0.4, y: 0.15 },
      { name: "Segin", greek: "ε Cas", type: "Blue-White Giant", color: 0x67e8f9, x: 0.8, y: 0.45 },
      { name: "Achird", greek: "η Cas", type: "Solar Analog", color: 0xfde047, x: 0.5, y: -0.45 },
      { name: "Marfak", greek: "θ Cas", type: "Subgiant Star", color: 0xe0f2fe, x: -0.3, y: -0.45 }
    ]
  },
  {
    day: "Tuesday",
    name: "Ursa Major",
    title: "The Great Celestial Dipper",
    myth: "The cosmic compass that points travelers to the true North Star.",
    affirmation: "The Great Dipper pours stillness across the night sky. Breathe and rest.",
    stars: [
      { name: "Dubhe", greek: "α UMa", type: "Red Giant", color: 0xf87171, x: 0.65, y: 0.7 },
      { name: "Merak", greek: "β UMa", type: "White Main-Seq", color: 0xe0f2fe, x: 0.6, y: 0.25 },
      { name: "Phecda", greek: "γ UMa", type: "A-type Star", color: 0x93c5fd, x: 0.15, y: 0.2 },
      { name: "Megrez", greek: "δ UMa", type: "Connecting Pivot", color: 0x67e8f9, x: 0.2, y: 0.65 },
      { name: "Alioth", greek: "ε UMa", type: "Brightest in Dipper", color: 0x38bdf8, x: -0.2, y: 0.15 },
      { name: "Mizar", greek: "ζ UMa", type: "Historic Double Star", color: 0x93c5fd, x: -0.5, y: 0.1 },
      { name: "Alkaid", greek: "η UMa", type: "Young Blue Star", color: 0x60a5fa, x: -0.75, y: -0.15 }
    ]
  },
  {
    day: "Wednesday",
    name: "Orion's Belt & Shield",
    title: "The Stellar Hunter",
    myth: "The luminous giant whose belt guides astronomers across the galaxy.",
    affirmation: "The celestial hunter rests. The night is gentle, quiet, and warm.",
    stars: [
      { name: "Betelgeuse", greek: "α Ori", type: "Red Supergiant", color: 0xf87171, x: -0.65, y: 0.65 },
      { name: "Bellatrix", greek: "γ Ori", type: "Blue Giant", color: 0x67e8f9, x: 0.65, y: 0.6 },
      { name: "Alnitak", greek: "ζ Ori", type: "Triple Star System", color: 0x38bdf8, x: -0.3, y: 0.1 },
      { name: "Alnilam", greek: "ε Ori", type: "Supergiant Center", color: 0x93c5fd, x: 0.0, y: 0.0 },
      { name: "Mintaka", greek: "δ Ori", type: "Multiple Blue Star", color: 0x60a5fa, x: 0.3, y: -0.1 },
      { name: "Saiph", greek: "κ Ori", type: "Supergiant Foot", color: 0x38bdf8, x: -0.6, y: -0.65 },
      { name: "Rigel", greek: "β Ori", type: "Blue Supergiant", color: 0x93c5fd, x: 0.6, y: -0.6 }
    ]
  },
  {
    day: "Thursday",
    name: "Pleiades",
    title: "The Seven Sisters",
    myth: "An open cluster of newborn stars glowing in blue reflection nebulae.",
    affirmation: "Seven sister stars watch over you in gentle harmony. Sleep peacefully.",
    stars: [
      { name: "Alcyone", greek: "η Tau", type: "Eclipsing System", color: 0x67e8f9, x: 0.25, y: 0.35 },
      { name: "Maia", greek: "20 Tau", type: "Mercury-Manganese", color: 0x93c5fd, x: -0.08, y: 0.3 },
      { name: "Electra", greek: "17 Tau", type: "Fast-Spinning Be", color: 0x38bdf8, x: -0.3, y: 0.55 },
      { name: "Taygeta", greek: "19 Tau", type: "Triple System", color: 0xe0f2fe, x: -0.6, y: 0.4 },
      { name: "Celaeno", greek: "16 Tau", type: "Subgiant Star", color: 0x60a5fa, x: -0.25, y: -0.15 },
      { name: "Sterope", greek: "21 Tau", type: "Double Star", color: 0x93c5fd, x: 0.15, y: -0.25 },
      { name: "Merope", greek: "23 Tau", type: "Nebula Illuminator", color: 0x38bdf8, x: 0.55, y: 0.15 }
    ]
  },
  {
    day: "Friday",
    name: "Cygnus",
    title: "The Swan of Starlight",
    myth: "The soaring celestial swan flying down the Milky Way's galactic plane.",
    affirmation: "The star swan glides across the cosmic ocean. Let your mind drift into dreamland.",
    stars: [
      { name: "Deneb", greek: "α Cyg", type: "White Supergiant", color: 0xe0f2fe, x: 0.0, y: 0.75 },
      { name: "Sadr", greek: "γ Cyg", type: "Milky Way Heart", color: 0xfef08a, x: 0.0, y: 0.25 },
      { name: "Gienah", greek: "ε Cyg", type: "Orange Giant", color: 0xfba047, x: 0.65, y: 0.25 },
      { name: "Delta Cygni", greek: "δ Cyg", type: "Triple System", color: 0x93c5fd, x: -0.65, y: 0.25 },
      { name: "Albireo", greek: "β Cyg", type: "Golden/Sapphire Pair", color: 0xfbbf24, x: 0.0, y: -0.75 },
      { name: "Fawaris", greek: "δ2 Cyg", type: "Subgiant", color: 0x67e8f9, x: 0.35, y: -0.15 },
      { name: "Eta Cygni", greek: "η Cyg", type: "Variable Giant", color: 0x38bdf8, x: 0.0, y: -0.3 }
    ]
  },
  {
    day: "Saturday",
    name: "Pegasus",
    title: "The Winged Steed",
    myth: "The Great Square in the autumn sky carrying celestial dreams.",
    affirmation: "Wings of stardust carry away every worry from this week. You are completely safe.",
    stars: [
      { name: "Alpheratz", greek: "α And", type: "Mercury-Manganese", color: 0x93c5fd, x: 0.5, y: 0.55 },
      { name: "Scheat", greek: "β Peg", type: "Red Giant Variable", color: 0xf87171, x: -0.55, y: 0.5 },
      { name: "Markab", greek: "α Peg", type: "Blue-White Main", color: 0x67e8f9, x: -0.55, y: -0.45 },
      { name: "Algenib", greek: "γ Peg", type: "Beta Cephei", color: 0x38bdf8, x: 0.6, y: -0.4 },
      { name: "Enif", greek: "ε Peg", type: "Supergiant Nose", color: 0xfba047, x: -0.8, y: 0.1 },
      { name: "Matar", greek: "η Peg", type: "Binary System", color: 0xfef08a, x: 0.8, y: 0.15 },
      { name: "Homam", greek: "ζ Peg", type: "Slow Pulsating B", color: 0xe0f2fe, x: 0.0, y: 0.7 }
    ]
  }
];

export class FireflyGame {
  constructor() {
    this.canvas = document.getElementById('fireflies-canvas');
    this.statusText = document.getElementById('fireflies-status-text');
    this.progressBar = document.getElementById('fireflies-progress-fill');
    this.starCountEl = document.getElementById('fireflies-star-count');

    this.renderer = null;
    this.scene = null;
    this.camera = null;
    this.fireflies = [];
    this.constellationNodes = [];
    this.lines = [];
    this.nebulaMesh = null;
    this.pointer = new THREE.Vector3(999, 999, 0);

    this.currentConstellation = DETAILED_CONSTELLATIONS[new Date().getDay()];
    this.litStarsCount = 0;
    this.totalStars = 7;
    this.isCompleted = false;

    this.clock = new THREE.Clock();
    this.isInitialized = false;
    this.rafId = null;

    this.raycaster = new THREE.Raycaster();
    this.planeIntersect = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
  }

  init() {
    if (this.isInitialized) return;

    this.currentConstellation = DETAILED_CONSTELLATIONS[new Date().getDay()];

    this.scene = new THREE.Scene();
    
    // Mobile-First Perspective Distance
    const isMobile = window.innerWidth < 640;
    const camZ = isMobile ? 22 : 18;
    this.camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, camZ);

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const ambient = new THREE.AmbientLight(0x060f1e, 2.5);
    this.scene.add(ambient);

    // 1. Cosmic Stardust Nebula Cloud
    this.createNebulaCloud();

    // 2. Setup Detailed Astronomical Constellation Star Nodes
    this.setupConstellation();

    // 3. Spawn Ambient Fireflies
    this.spawnFireflies(isMobile ? 26 : 22);

    this.setupEvents();
    this.isInitialized = true;
  }

  createNebulaCloud() {
    const count = 180;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const isMobile = window.innerWidth < 640;
    const radius = isMobile ? 8 : 12;

    const baseColor1 = new THREE.Color(0x38bdf8);
    const baseColor2 = new THREE.Color(0xa855f7);

    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = Math.sqrt(Math.random()) * radius;

      pos[i * 3 + 0] = Math.cos(theta) * r;
      pos[i * 3 + 1] = Math.sin(theta) * r * (isMobile ? 1.4 : 0.8);
      pos[i * 3 + 2] = -2 - Math.random() * 4;

      const mixed = baseColor1.clone().lerp(baseColor2, Math.random());
      colors[i * 3 + 0] = mixed.r;
      colors[i * 3 + 1] = mixed.g;
      colors[i * 3 + 2] = mixed.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const mat = new THREE.PointsMaterial({
      size: isMobile ? 1.8 : 2.4,
      vertexColors: true,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending
    });

    this.nebulaMesh = new THREE.Points(geo, mat);
    this.scene.add(this.nebulaMesh);
  }

  setupConstellation() {
    const isMobile = window.innerWidth < 640;
    const scaleX = isMobile ? 4.4 : 6.8;
    const scaleY = isMobile ? 7.2 : 4.8;

    const stars = this.currentConstellation.stars;

    stars.forEach((starData) => {
      const group = new THREE.Group();
      const x = starData.x * scaleX;
      const y = starData.y * scaleY;

      // 1. Outer target ring
      const ringGeo = new THREE.RingGeometry(0.55, 0.72, 32);
      const ringMat = new THREE.MeshBasicMaterial({
        color: 0x475569,
        transparent: true,
        opacity: 0.6,
        side: THREE.DoubleSide
      });
      const ring = new THREE.Mesh(ringGeo, ringMat);
      group.add(ring);

      // 2. Outer shimmering lens flare halo
      const flareGeo = new THREE.RingGeometry(0.1, 1.3, 24);
      const flareMat = new THREE.MeshBasicMaterial({
        color: starData.color,
        transparent: true,
        opacity: 0.0,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending
      });
      const flare = new THREE.Mesh(flareGeo, flareMat);
      group.add(flare);

      // 3. Inner glowing celestial stellar core
      const coreGeo = new THREE.SphereGeometry(0.38, 16, 16);
      const coreMat = new THREE.MeshBasicMaterial({
        color: starData.color,
        transparent: true,
        opacity: 0.0
      });
      const core = new THREE.Mesh(coreGeo, coreMat);
      group.add(core);

      group.position.set(x, y, 0);
      this.scene.add(group);

      this.constellationNodes.push({
        group,
        ring,
        core,
        flare,
        data: starData,
        pos: new THREE.Vector3(x, y, 0),
        isLit: false
      });
    });

    // Connecting Celestial Starlight Lines
    for (let i = 0; i < this.constellationNodes.length - 1; i++) {
      const lineGeo = new THREE.BufferGeometry().setFromPoints([
        this.constellationNodes[i].pos,
        this.constellationNodes[i + 1].pos
      ]);
      const lineMat = new THREE.LineBasicMaterial({
        color: 0x38bdf8,
        transparent: true,
        opacity: 0.15,
        linewidth: 2
      });
      const line = new THREE.Line(lineGeo, lineMat);
      this.scene.add(line);
      this.lines.push(line);
    }
  }

  createFireflyMesh() {
    const group = new THREE.Group();

    const coreGeo = new THREE.SphereGeometry(0.15, 12, 12);
    const coreMat = new THREE.MeshBasicMaterial({ color: 0xfff9db });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    const haloGeo = new THREE.RingGeometry(0.1, 0.85, 16);
    const haloMat = new THREE.MeshBasicMaterial({
      color: 0x67e8f9,
      transparent: true,
      opacity: 0.45,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending
    });
    const halo = new THREE.Mesh(haloGeo, haloMat);
    group.add(halo);

    return group;
  }

  spawnFireflies(count) {
    const isMobile = window.innerWidth < 640;
    const spreadX = isMobile ? 12 : 24;
    const spreadY = isMobile ? 18 : 14;

    for (let i = 0; i < count; i++) {
      const mesh = this.createFireflyMesh();
      const x = (Math.random() - 0.5) * spreadX;
      const y = (Math.random() - 0.5) * spreadY;
      const z = (Math.random() - 0.5) * 4;
      mesh.position.set(x, y, z);
      this.scene.add(mesh);

      this.fireflies.push({
        mesh,
        pos: new THREE.Vector3(x, y, z),
        vel: new THREE.Vector3((Math.random() - 0.5) * 0.02, (Math.random() - 0.5) * 0.02, 0),
        pulseSpeed: 1.5 + Math.random() * 2.0,
        pulseOffset: Math.random() * Math.PI * 2,
        seed: Math.random() * 100
      });
    }
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

  igniteStar(node) {
    node.isLit = true;
    node.core.material.opacity = 1.0;
    node.flare.material.opacity = 0.65;
    node.ring.material.color.setHex(node.data.color);
    node.ring.material.opacity = 0.95;
    this.litStarsCount++;

    sound.playChime(329.63 + this.litStarsCount * 48, 5);
    if (navigator.vibrate) navigator.vibrate(20);
    this.updateUI();

    if (this.litStarsCount >= this.totalStars) {
      this.isCompleted = true;
      this.lines.forEach(l => {
        l.material.opacity = 0.95;
        l.material.color.setHex(0xfef08a);
      });
      sound.playChime(523.25, 8);
      if (navigator.vibrate) navigator.vibrate([40, 60, 40]);
      setTimeout(() => this.showCompletionModal(), 600);
    }
  }

  showCompletionModal() {
    const modal = document.getElementById('completion-modal');
    const titleEl = document.getElementById('modal-title');
    const descEl = document.getElementById('modal-desc');
    const badgeEl = document.getElementById('modal-badge');

    if (modal && titleEl && descEl) {
      titleEl.textContent = `✨ ${this.currentConstellation.name} (${this.currentConstellation.title}) Awakened!`;
      descEl.textContent = `${this.currentConstellation.myth} ${this.currentConstellation.affirmation}`;
      if (badgeEl) badgeEl.textContent = `✨ ${this.currentConstellation.day} Constellation Completed • All 7 Stars Identified`;
      modal.classList.remove('hidden');
    }
  }

  updateUI() {
    if (this.starCountEl) {
      this.starCountEl.textContent = `${this.litStarsCount}/${this.totalStars} ⭐`;
    }
    if (this.progressBar) {
      const pct = (this.litStarsCount / this.totalStars) * 100;
      this.progressBar.style.width = `${pct}%`;
    }
    if (this.statusText) {
      if (this.isCompleted) {
        this.statusText.textContent = `✨ ${this.currentConstellation.name} awakened!`;
      } else {
        const nextStar = this.constellationNodes.find(n => !n.isLit);
        const nextStarName = nextStar ? `${nextStar.data.name} (${nextStar.data.greek})` : 'All stars';
        this.statusText.textContent = `${this.currentConstellation.name} • Ignite ${nextStarName} (${this.litStarsCount}/${this.totalStars})`;
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
    const isMobile = window.innerWidth < 640;
    const boundX = isMobile ? 7 : 13;
    const boundY = isMobile ? 11 : 9;

    // Rotate subtle cosmic nebula in background
    if (this.nebulaMesh) {
      this.nebulaMesh.rotation.z = time * 0.02;
    }

    this.fireflies.forEach(f => {
      f.pos.x += f.vel.x + Math.sin(time * 0.8 + f.seed) * 0.01;
      f.pos.y += f.vel.y + Math.cos(time * 0.6 + f.seed) * 0.01;

      const distToPointer = f.pos.distanceTo(this.pointer);
      if (distToPointer < 5.5) {
        const pullDir = new THREE.Vector3().subVectors(this.pointer, f.pos).normalize();
        f.pos.add(pullDir.multiplyScalar(0.045));
      }

      this.constellationNodes.forEach(node => {
        if (!node.isLit && f.pos.distanceTo(node.pos) < 1.2) {
          this.igniteStar(node);
        }
      });

      if (Math.abs(f.pos.x) > boundX) f.pos.x *= -0.95;
      if (Math.abs(f.pos.y) > boundY) f.pos.y *= -0.95;

      const pulse = 0.6 + 0.4 * Math.sin(time * f.pulseSpeed + f.pulseOffset);
      f.mesh.position.copy(f.pos);
      f.mesh.scale.setScalar(0.85 + pulse * 0.45);
    });

    this.constellationNodes.forEach(node => {
      if (node.isLit) {
        node.group.rotation.z += 0.008;
        const scale = 1.0 + Math.sin(time * 2.0) * 0.15;
        node.core.scale.set(scale, scale, scale);
        node.flare.scale.set(1.0 + Math.cos(time * 1.5) * 0.2, 1.0 + Math.cos(time * 1.5) * 0.2, 1);
      }
    });

    this.renderer.render(this.scene, this.camera);
  }

  resize() {
    if (!this.camera || !this.renderer) return;
    const isMobile = window.innerWidth < 640;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.position.z = isMobile ? 22 : 18;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export const fireflyGame = new FireflyGame();
