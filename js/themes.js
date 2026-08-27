import * as THREE from 'three';
import { SakuraScene } from './scene-sakura.js';
import { OceanScene } from './scene-ocean.js';
import { AuroraScene } from './scene-aurora.js';
import { sound } from './sound.js';

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem('zen_theme') || 'light';
    this.canvas = document.getElementById('bg-canvas');
    this.renderer = null;
    this.sakuraScene = null;
    this.oceanScene = null;
    this.auroraScene = null;
    this.activeScene = null;
    this.clock = new THREE.Clock();
    this.rafId = null;
    this.auroraUnlocked = localStorage.getItem('zen_aurora_unlocked') === 'true';
  }

  init() {
    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true,
      antialias: window.devicePixelRatio <= 1,
      powerPreference: 'high-performance',
      precision: 'mediump'
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.sakuraScene = new SakuraScene(this.canvas);
    this.oceanScene = new OceanScene(this.canvas);
    this.auroraScene = new AuroraScene(this.canvas);

    this.applyTheme(this.currentTheme, false);

    window.addEventListener('resize', () => this.handleResize());
    this.animate();
  }

  applyTheme(theme, animateTransition = true) {
    this.currentTheme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('zen_theme', theme);

    if (theme === 'light') {
      this.activeScene = this.sakuraScene;
    } else if (theme === 'aurora') {
      this.activeScene = this.auroraScene;
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
    let nextTheme;
    if (this.auroraUnlocked) {
      // Cycle between light -> dark -> aurora
      if (this.currentTheme === 'light') nextTheme = 'dark';
      else if (this.currentTheme === 'dark') nextTheme = 'aurora';
      else nextTheme = 'light';
    } else {
      nextTheme = this.currentTheme === 'light' ? 'dark' : 'light';
    }

    this.applyTheme(nextTheme, true);
    return nextTheme;
  }

  unlockAurora() {
    this.auroraUnlocked = true;
    localStorage.setItem('zen_aurora_unlocked', 'true');
    this.applyTheme('aurora', true);
    sound.playChime(523.25, 6);
    if (navigator.vibrate) navigator.vibrate([40, 80, 40]);
  }

  handleResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    this.sakuraScene.resize(width, height);
    this.oceanScene.resize(width, height);
    this.auroraScene.resize(width, height);
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
