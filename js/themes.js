import * as THREE from 'three';
import { SakuraScene } from './scene-sakura.js';
import { OceanScene } from './scene-ocean.js';
import { sound } from './sound.js';

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('zen_theme') || 'light';
    this.canvas = document.getElementById('bg-canvas');
    this.renderer = null;
    this.sakuraScene = null;
    this.oceanScene = null;
    this.activeScene = null;
    this.clock = new THREE.Clock();
    this.rafId = null;
  }

  init() {
    // Setup WebGL Renderer
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: window.devicePixelRatio <= 1,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    // Instantiate both scenes
    this.sakuraScene = new SakuraScene(this.canvas);
    this.oceanScene = new OceanScene(this.canvas);

    // Apply initial theme
    this.applyTheme(this.currentTheme, false);

    // Event listeners
    window.addEventListener('resize', () => this.handleResize());

    // Start render loop
    this.animate();
  }

  applyTheme(theme, animateTransition = true) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zen_theme', theme);

    if (theme === 'light') {
      this.activeScene = this.sakuraScene;
    } else {
      this.activeScene = this.oceanScene;
    }

    sound.setTheme(theme);

    if (animateTransition && this.canvas) {
      this.canvas.style.opacity = '0';
      setTimeout(() => {
        this.canvas.style.opacity = '1';
      }, 350);
    }
  }

  toggleTheme() {
    const nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    this.applyTheme(nextTheme, true);
    return nextTheme;
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.sakuraScene.resize(width, height);
    this.oceanScene.resize(width, height);
  }

  animate() {
    this.rafId = requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    if (this.activeScene) {
      this.activeScene.update(elapsedTime);
      this.renderer.render(this.activeScene.scene, this.activeScene.camera);
    }
  }
}

export const themeManager = new ThemeManager();
