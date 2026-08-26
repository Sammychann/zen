import { themeManager } from './themes.js';
import { sound } from './sound.js';
import { getDailyQuote } from './quotes.js';
import { funFacts } from './funfacts.js';
import { fireflyGame } from './game-fireflies.js';
import { rainWindowGame } from './game-rain-window.js';
import { lotusPondGame } from './game-lotus-pond.js';
import { auroraGame } from './game-aurora.js';
import { cloudDriftGame } from './game-cloud-drift.js';

/**
 * Main Sanctuary Application Orchestrator
 */
class App {
  constructor() {
    this.currentView = 'home';
    this.views = {
      home: document.getElementById('view-home'),
      fireflies: document.getElementById('view-fireflies'),
      'rain-window': document.getElementById('view-rain-window'),
      'lotus-pond': document.getElementById('view-lotus-pond'),
      aurora: document.getElementById('view-aurora'),
      'cloud-drift': document.getElementById('view-cloud-drift')
    };
  }

  init() {
    // 1. Initialize 3D Theme System
    themeManager.init();

    // 2. Initialize Daily Literary Comfort Quote
    this.renderDailyQuote();

    // 3. Initialize Today in History Fun Fact
    this.renderFunFact(funFacts.getCurrentFact());

    // 4. Setup Event Listeners
    this.bindEvents();
  }

  renderDailyQuote() {
    const quote = getDailyQuote();
    const textEl = document.getElementById('quote-text');
    const authorEl = document.getElementById('quote-author');
    const sourceEl = document.getElementById('quote-source');
    const reflectionEl = document.getElementById('quote-reflection');

    if (textEl) textEl.textContent = `“${quote.text}”`;
    if (authorEl) authorEl.textContent = quote.author;
    if (sourceEl) sourceEl.textContent = quote.source;
    if (reflectionEl) reflectionEl.textContent = quote.reflection;
  }

  renderFunFact(fact) {
    if (!fact) return;
    const tagEl = document.getElementById('funfact-tag');
    const textEl = document.getElementById('funfact-text');

    if (tagEl) tagEl.textContent = `${fact.emoji || '✨'} ${fact.category} • ${fact.year}`;
    if (textEl) textEl.textContent = fact.text;
  }

  switchView(viewName) {
    if (this.currentView === viewName) return;

    // Stop currently running active activity
    if (this.currentView === 'fireflies') fireflyGame.stop();
    if (this.currentView === 'rain-window') rainWindowGame.stop();
    if (this.currentView === 'lotus-pond') lotusPondGame.stop();
    if (this.currentView === 'aurora') auroraGame.stop();
    if (this.currentView === 'cloud-drift') cloudDriftGame.stop();

    // Hide old view
    const oldViewEl = this.views[this.currentView];
    if (oldViewEl) {
      oldViewEl.classList.remove('active');
      setTimeout(() => {
        oldViewEl.classList.add('hidden');
      }, 350);
    }

    // Show new view
    const newViewEl = this.views[viewName];
    if (newViewEl) {
      newViewEl.classList.remove('hidden');
      void newViewEl.offsetWidth; // trigger reflow
      newViewEl.classList.add('active');
    }

    this.currentView = viewName;

    // Start target activity
    if (viewName === 'fireflies') fireflyGame.start();
    if (viewName === 'rain-window') rainWindowGame.start();
    if (viewName === 'lotus-pond') lotusPondGame.start();
    if (viewName === 'aurora') auroraGame.start();
    if (viewName === 'cloud-drift') cloudDriftGame.start();
  }

  bindEvents() {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn?.addEventListener('click', () => {
      themeManager.toggleTheme();
    });

    // Sound Toggle
    const soundBtn = document.getElementById('sound-toggle');
    const soundOff = soundBtn?.querySelector('.sound-off');
    const soundOn = soundBtn?.querySelector('.sound-on');

    soundBtn?.addEventListener('click', async () => {
      const isUnmuted = await sound.toggle();
      if (isUnmuted) {
        soundOff?.classList.add('hidden');
        soundOn?.classList.remove('hidden');
      } else {
        soundOff?.classList.remove('hidden');
        soundOn?.classList.add('hidden');
      }
    });

    // Why This Quote Accordion
    const whyThisBtn = document.getElementById('btn-why-this');
    const reflectionEl = document.getElementById('quote-reflection');
    whyThisBtn?.addEventListener('click', () => {
      const isHidden = reflectionEl?.classList.contains('hidden');
      if (isHidden) {
        reflectionEl?.classList.remove('hidden');
        whyThisBtn.textContent = 'Why this? ▴';
        whyThisBtn.setAttribute('aria-expanded', 'true');
      } else {
        reflectionEl?.classList.add('hidden');
        whyThisBtn.textContent = 'Why this? ▾';
        whyThisBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Next Fun Fact Button
    const nextFactBtn = document.getElementById('btn-next-fact');
    nextFactBtn?.addEventListener('click', () => {
      const fact = funFacts.getNextFact();
      this.renderFunFact(fact);
      sound.playChime(329.63, 3);
    });

    // Activity Navigation Cards
    const gameButtons = document.querySelectorAll('.game-card-btn');
    gameButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        const game = btn.getAttribute('data-game');
        if (game) this.switchView(game);
      });
    });

    // Universal Back to Sanctuary Buttons
    const backButtons = document.querySelectorAll('.back-btn[data-back="home"]');
    backButtons.forEach(btn => {
      btn.addEventListener('click', () => {
        this.switchView('home');
      });
    });

    // Keyboard Shortcuts (Escape to return to Sanctuary, T for Theme, M for Mute)
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.switchView('home');
      } else if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
        themeManager.toggleTheme();
      } else if (e.key.toLowerCase() === 'm' && !e.ctrlKey && !e.metaKey) {
        soundBtn?.click();
      }
    });

    // Window Resize Handler
    window.addEventListener('resize', () => {
      if (this.currentView === 'fireflies') fireflyGame.resize();
      if (this.currentView === 'rain-window') rainWindowGame.resize();
      if (this.currentView === 'lotus-pond') lotusPondGame.resize();
      if (this.currentView === 'aurora') auroraGame.resize();
      if (this.currentView === 'cloud-drift') cloudDriftGame.resize();
    });
  }
}

// Start application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
