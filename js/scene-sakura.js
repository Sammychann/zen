import * as THREE from 'three';

/**
 * Sakura (Light Theme) Three.js Scene
 * Falling 3D cherry blossom petals with gentle wind sway and soft lighting.
 */
export class SakuraScene {
  constructor(canvas) {
    this.canvas = canvas;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 100);
    this.camera.position.set(0, 0, 18);

    this.petalCount = 180;
    this.petals = null;
    this.dummy = new THREE.Object3D();
    this.petalData = [];

    this.ambientLight = null;
    this.dirLight = null;

    this.init();
  }

  init() {
    // Lighting
    this.ambientLight = new THREE.AmbientLight(0xfff5f0, 1.2);
    this.scene.add(this.ambientLight);

    this.dirLight = new THREE.DirectionalLight(0xffecd2, 1.0);
    this.dirLight.position.set(5, 10, 8);
    this.scene.add(this.dirLight);

    // Create Petal Geometry (Curved Leaf Shape)
    const shape = new THREE.Shape();
    shape.moveTo(0, 0);
    shape.quadraticCurveTo(0.35, 0.45, 0.1, 0.9);
    shape.quadraticCurveTo(0, 1.05, -0.1, 0.9);
    shape.quadraticCurveTo(-0.35, 0.45, 0, 0);

    const petalGeometry = new THREE.ShapeGeometry(shape, 8);
    petalGeometry.scale(0.8, 0.8, 0.8);
    petalGeometry.center();

    // Material with warm Sakura gradient vertex coloring
    const petalMaterial = new THREE.MeshStandardMaterial({
      color: 0xffb5c2,
      roughness: 0.4,
      metalness: 0.05,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.88,
    });

    this.petals = new THREE.InstancedMesh(petalGeometry, petalMaterial, this.petalCount);

    // Initialize individual petal data
    for (let i = 0; i < this.petalCount; i++) {
      const x = (Math.random() - 0.5) * 32;
      const y = (Math.random() - 0.5) * 26 + 2;
      const z = (Math.random() - 0.5) * 20;

      const scale = 0.5 + Math.random() * 0.7;
      const rotSpeedX = (Math.random() - 0.5) * 0.02;
      const rotSpeedY = (Math.random() - 0.5) * 0.025;
      const rotSpeedZ = (Math.random() - 0.5) * 0.015;

      const fallSpeed = 0.015 + Math.random() * 0.022;
      const swaySpeed = 0.8 + Math.random() * 1.5;
      const swayOffset = Math.random() * Math.PI * 2;

      this.petalData.push({
        x, y, z,
        rotX: Math.random() * Math.PI * 2,
        rotY: Math.random() * Math.PI * 2,
        rotZ: Math.random() * Math.PI * 2,
        rotSpeedX, rotSpeedY, rotSpeedZ,
        fallSpeed,
        swaySpeed,
        swayOffset,
        scale,
        baseX: x
      });

      this.dummy.position.set(x, y, z);
      this.dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
      this.dummy.scale.set(scale, scale, scale);
      this.dummy.updateMatrix();

      this.petals.setMatrixAt(i, this.dummy.matrix);

      // Subtle individual shade variation
      const shade = new THREE.Color().setHSL(0.97 + Math.random() * 0.03, 0.65, 0.78 + Math.random() * 0.15);
      this.petals.setColorAt(i, shade);
    }

    this.petals.instanceMatrix.needsUpdate = true;
    if (this.petals.instanceColor) this.petals.instanceColor.needsUpdate = true;

    this.scene.add(this.petals);
  }

  update(time) {
    for (let i = 0; i < this.petalCount; i++) {
      const data = this.petalData[i];

      // Update positions
      data.y -= data.fallSpeed;
      data.x = data.baseX + Math.sin(time * data.swaySpeed + data.swayOffset) * 1.8;
      data.z += Math.cos(time * data.swaySpeed * 0.7 + data.swayOffset) * 0.01;

      // Update rotations
      data.rotX += data.rotSpeedX;
      data.rotY += data.rotSpeedY;
      data.rotZ += data.rotSpeedZ;

      // Recycle if below view
      if (data.y < -15) {
        data.y = 15;
        data.baseX = (Math.random() - 0.5) * 32;
        data.x = data.baseX;
      }

      this.dummy.position.set(data.x, data.y, data.z);
      this.dummy.rotation.set(data.rotX, data.rotY, data.rotZ);
      this.dummy.scale.set(data.scale, data.scale, data.scale);
      this.dummy.updateMatrix();

      this.petals.setMatrixAt(i, this.dummy.matrix);
    }

    this.petals.instanceMatrix.needsUpdate = true;
  }

  resize(width, height) {
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
  }
}
