import { themeManager } from './themes.js';
import { sound } from './sound.js';
import { worldRadio } from './radio.js';
import { fetchGroqContent, fetchAnotherFunFact } from './groq.js';
import { highwayGame } from './game-highway.js';
import { plantGame } from './game-plants.js';
import { fireflyGame } from './game-fireflies.js';
import { teaGame } from './game-tea.js';
import { kintsugiGame } from './game-kintsugi.js';

/**
 * Master Sanctuary Application Orchestrator
 */
class App {
  constructor() {
    this.currentView = 'home';
    this.views = {
      home: document.getElementById('view-home'),
      highway: document.getElementById('view-highway'),
      plants: document.getElementById('view-plants'),
      fireflies: document.getElementById('view-fireflies'),
      tea: document.getElementById('view-tea'),
      kintsugi: document.getElementById('view-kintsugi')
    };
  }

  async init() {
    // 1. Initialize 3D Theme System
    themeManager.init();

    // 2. Initialize Worldwide Radio Tuner
    this.initRadio();

    // 3. Load Groq AI Daily Quote & Historical Fun Fact
    await this.loadGroqContent();

    // 4. Setup Event Listeners
    this.bindEvents();
  }

  async loadGroqContent() {
    try {
      const content = await fetchGroqContent();
      if (content && content.quote) {
        this.renderQuote(content.quote);
      }
      if (content && content.funfact) {
        this.renderFunFact(content.funfact);
      }
    } catch (e) {
      console.warn("Error rendering Groq content:", e);
    }
  }

  renderQuote(quote) {
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

  initRadio() {
    const playBtn = document.getElementById('btn-radio-play');
    const playIcon = document.getElementById('radio-play-icon');
    const prevBtn = document.getElementById('btn-radio-prev');
    const nextBtn = document.getElementById('btn-radio-next');
    const nameEl = document.getElementById('radio-station-name');
    const cityEl = document.getElementById('radio-station-city');
    const emojiEl = document.getElementById('radio-station-emoji');
    const volSlider = document.getElementById('radio-volume');

    const updateRadioUI = (station, isPlaying) => {
      if (nameEl) nameEl.textContent = station.name;
      if (cityEl) cityEl.textContent = `${station.city}, ${station.country} • ${station.genre}`;
      if (emojiEl) emojiEl.textContent = station.emoji;
      if (playIcon) playIcon.textContent = isPlaying ? "⏸" : "▶";
    };

    updateRadioUI(worldRadio.getCurrentStation(), false);

    worldRadio.onStateChange = ({ isPlaying, loading }) => {
      const station = worldRadio.getCurrentStation();
      if (playIcon) playIcon.textContent = isPlaying ? "⏸" : (loading ? "⏳" : "▶");
      updateRadioUI(station, isPlaying);
    };

    playBtn?.addEventListener('click', () => {
      worldRadio.toggle();
    });

    prevBtn?.addEventListener('click', () => {
      const s = worldRadio.prevStation();
      updateRadioUI(s, worldRadio.isPlaying);
    });

    nextBtn?.addEventListener('click', () => {
      const s = worldRadio.nextStation();
      updateRadioUI(s, worldRadio.isPlaying);
    });

    volSlider?.addEventListener('input', (e) => {
      worldRadio.setVolume(parseFloat(e.target.value));
    });
  }

  switchView(viewName) {
    if (this.currentView === viewName) return;

    // Stop currently running active activity
    if (this.currentView === 'highway') highwayGame.stop();
    if (this.currentView === 'plants') plantGame.stop();
    if (this.currentView === 'fireflies') fireflyGame.stop();
    if (this.currentView === 'tea') teaGame.stop();
    if (this.currentView === 'kintsugi') kintsugiGame.stop();

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
    if (viewName === 'highway') highwayGame.start();
    if (viewName === 'plants') plantGame.start();
    if (viewName === 'fireflies') fireflyGame.start();
    if (viewName === 'tea') teaGame.start();
    if (viewName === 'kintsugi') kintsugiGame.start();
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

    // Next Fun Fact Button (Groq AI Powered)
    const nextFactBtn = document.getElementById('btn-next-fact');
    nextFactBtn?.addEventListener('click', async () => {
      nextFactBtn.textContent = "Fetching... ✨";
      const fact = await fetchAnotherFunFact();
      this.renderFunFact(fact);
      nextFactBtn.textContent = "Another fact ✨";
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
      if (this.currentView === 'highway') highwayGame.resize();
      if (this.currentView === 'plants') plantGame.resize();
      if (this.currentView === 'fireflies') fireflyGame.resize();
      if (this.currentView === 'tea') teaGame.resize();
      if (this.currentView === 'kintsugi') kintsugiGame.resize();
    });
  }
}

// Start application on DOM ready
window.addEventListener('DOMContentLoaded', () => {
  const app = new App();
  app.init();
});
