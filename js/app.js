import { themeManager } from './themes.js';
import { sound } from './sound.js';
import { worldRadio, WORLD_STATIONS } from './radio.js';
import { fetchGroqContent, fetchAnotherFunFact, recommendSong } from './groq.js';
import { highwayGame } from './game-highway.js';
import { fireflyGame } from './game-fireflies.js';

/**
 * Master Sanctuary Application Orchestrator
 */
class App {
  constructor() {
    this.currentView = 'home';
    this.views = {
      home: document.getElementById('view-home'),
      highway: document.getElementById('view-highway'),
      fireflies: document.getElementById('view-fireflies')
    };

    // User Mood Selection State
    this.songSelections = {
      mood: 'Drained & overwhelmed',
      vibe: 'Soft acoustic guitar & gentle warmth',
      energy: '10% - Barely keeping eyes open',
      style: 'Any / Atmospheric & Calm'
    };
  }

  init() {
    // 1. Initialize 3D Theme System
    themeManager.init();

    // 2. Initialize Worldwide Radio Tuner & Interactive Map
    this.initRadio();

    // 3. Initialize Interactive Mood Chip Pickers
    this.initMoodChips();

    // 4. Immediately Bind All Event Listeners & Modals (Synchronously)
    this.bindEvents();

    // 5. Asynchronously Load Groq AI Daily Quote & Historical Fun Fact in background
    this.loadGroqContent();
  }

  initMoodChips() {
    const chipGroups = document.querySelectorAll('.chips-row');
    chipGroups.forEach(row => {
      const inputName = row.getAttribute('data-input');
      const chips = row.querySelectorAll('.mood-chip');

      chips.forEach(chip => {
        chip.addEventListener('click', (e) => {
          e.stopPropagation();
          chips.forEach(c => c.classList.remove('active'));
          chip.classList.add('active');

          const val = chip.getAttribute('data-value');
          if (inputName === 'song-mood') this.songSelections.mood = val;
          if (inputName === 'song-vibe') this.songSelections.vibe = val;
          if (inputName === 'song-energy') this.songSelections.energy = val;
          if (inputName === 'song-style') this.songSelections.style = val;

          sound.playChime(329.63, 1.5);
        });
      });
    });
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

    if (textEl && quote.text) textEl.textContent = `“${quote.text}”`;
    if (authorEl && quote.author) authorEl.textContent = quote.author;
    if (sourceEl && quote.source) sourceEl.textContent = quote.source;
    if (reflectionEl && quote.reflection) {
      const p = reflectionEl.querySelector('.reflection-text') || reflectionEl;
      p.textContent = quote.reflection;
    }
  }

  renderFunFact(fact) {
    if (!fact) return;
    const tagEl = document.getElementById('funfact-tag');
    const textEl = document.getElementById('funfact-text');

    if (tagEl) tagEl.textContent = `${fact.emoji || '✨'} ${fact.category || 'Milestone'} • ${fact.year || '1920'}`;
    if (textEl && fact.text) textEl.textContent = fact.text;
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
    const countrySelect = document.getElementById('radio-country-select');
    const pinsContainer = document.getElementById('map-pins-container');
    const waveBars = document.getElementById('audio-wave-visualizer');

    // Create Clickable Map Pins
    if (pinsContainer) {
      pinsContainer.innerHTML = '';
      WORLD_STATIONS.forEach((station, idx) => {
        const pin = document.createElement('div');
        pin.className = `map-pin ${idx === 0 ? 'active' : ''}`;
        pin.style.left = `${station.mapX}%`;
        pin.style.top = `${station.mapY}%`;
        pin.title = `${station.emoji} ${station.city}, ${station.country} (${station.name})`;
        pin.setAttribute('data-station-id', station.id);

        pin.addEventListener('click', (e) => {
          e.stopPropagation();
          worldRadio.selectStation(idx);
          worldRadio.play();
          sound.playChime(329.63, 2);
        });

        pinsContainer.appendChild(pin);
      });
    }

    const updateRadioUI = (station, isPlaying) => {
      if (!station) return;
      if (nameEl) nameEl.textContent = station.name;
      if (cityEl) cityEl.textContent = `${station.city}, ${station.country} • ${station.genre}`;
      if (emojiEl) emojiEl.textContent = station.emoji;
      if (playIcon) playIcon.textContent = isPlaying ? "⏸" : "▶";
      if (countrySelect) countrySelect.value = station.id;

      if (waveBars) {
        if (isPlaying) waveBars.classList.add('playing');
        else waveBars.classList.remove('playing');
      }

      const pins = document.querySelectorAll('.map-pin');
      pins.forEach(pin => {
        if (pin.getAttribute('data-station-id') === station.id) {
          pin.classList.add('active');
        } else {
          pin.classList.remove('active');
        }
      });
    };

    updateRadioUI(worldRadio.getCurrentStation(), false);

    worldRadio.onStateChange = ({ isPlaying, loading }) => {
      const station = worldRadio.getCurrentStation();
      if (playIcon) playIcon.textContent = isPlaying ? "⏸" : (loading ? "⏳" : "▶");
      updateRadioUI(station, isPlaying);
    };

    playBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      worldRadio.toggle();
    });

    prevBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const s = worldRadio.prevStation();
      updateRadioUI(s, worldRadio.isPlaying);
    });

    nextBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const s = worldRadio.nextStation();
      updateRadioUI(s, worldRadio.isPlaying);
    });

    volSlider?.addEventListener('input', (e) => {
      worldRadio.setVolume(parseFloat(e.target.value));
    });

    countrySelect?.addEventListener('change', (e) => {
      const s = worldRadio.selectStationById(e.target.value);
      worldRadio.play();
      updateRadioUI(s, true);
      sound.playChime(392.00, 2);
    });
  }

  switchView(viewName) {
    if (this.currentView === viewName) return;

    if (this.currentView === 'highway') highwayGame.stop();
    if (this.currentView === 'fireflies') fireflyGame.stop();

    const modal = document.getElementById('completion-modal');
    if (modal) modal.classList.add('hidden');

    const oldViewEl = this.views[this.currentView];
    if (oldViewEl) {
      oldViewEl.classList.remove('active');
      setTimeout(() => {
        oldViewEl.classList.add('hidden');
      }, 350);
    }

    const newViewEl = this.views[viewName];
    if (newViewEl) {
      newViewEl.classList.remove('hidden');
      void newViewEl.offsetWidth;
      newViewEl.classList.add('active');
    }

    this.currentView = viewName;

    if (viewName === 'highway') highwayGame.start();
    if (viewName === 'fireflies') fireflyGame.start();
  }

  bindEvents() {
    // Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    themeBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      themeManager.toggleTheme();
    });

    // Rain Sound Toggle
    const rainBtn = document.getElementById('toggle-rain-sound');
    rainBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const isPlaying = await sound.toggleRain();
      if (isPlaying) rainBtn.classList.add('active');
      else rainBtn.classList.remove('active');
    });

    // Waves Sound Toggle
    const wavesBtn = document.getElementById('toggle-waves-sound');
    wavesBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const isPlaying = await sound.toggleWaves();
      if (isPlaying) wavesBtn.classList.add('active');
      else wavesBtn.classList.remove('active');
    });

    // Why This Quote Accordion
    const whyThisBtn = document.getElementById('btn-why-this');
    const reflectionEl = document.getElementById('quote-reflection');
    whyThisBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = reflectionEl?.classList.contains('hidden');
      if (isHidden) {
        reflectionEl?.classList.remove('hidden');
        whyThisBtn.querySelector('.toggle-arrow').textContent = '▴';
        whyThisBtn.setAttribute('aria-expanded', 'true');
      } else {
        reflectionEl?.classList.add('hidden');
        whyThisBtn.querySelector('.toggle-arrow').textContent = '▾';
        whyThisBtn.setAttribute('aria-expanded', 'false');
      }
    });

    // Next Fun Fact Button (Groq AI Powered)
    const nextFactBtn = document.getElementById('btn-next-fact');
    nextFactBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      nextFactBtn.querySelector('span:first-child').textContent = "Fetching...";
      const fact = await fetchAnotherFunFact();
      this.renderFunFact(fact);
      nextFactBtn.querySelector('span:first-child').textContent = "Another Fact";
      sound.playChime(329.63, 3);
    });

    // Song Recommendation Form
    const discoverSongBtn = document.getElementById('btn-discover-song');
    discoverSongBtn?.addEventListener('click', async (e) => {
      e.stopPropagation();
      const mood = this.songSelections.mood;
      const vibe = this.songSelections.vibe;
      const energy = this.songSelections.energy;
      const preference = this.songSelections.style;

      discoverSongBtn.textContent = "Finding your song... ✨";
      discoverSongBtn.disabled = true;

      try {
        const rec = await recommendSong({ mood, vibe, energy, preference });

        const resultCard = document.getElementById('song-result-card');
        const titleEl = document.getElementById('song-result-title');
        const artistEl = document.getElementById('song-result-artist');
        const whyEl = document.getElementById('song-result-why');
        const lyricsEl = document.getElementById('song-result-lyrics');
        const genreEl = document.getElementById('song-result-genre');
        const linkEl = document.getElementById('song-result-link');

        if (titleEl) titleEl.textContent = rec.title;
        if (artistEl) artistEl.textContent = `by ${rec.artist}`;
        if (whyEl) whyEl.textContent = rec.why;
        if (lyricsEl) lyricsEl.textContent = rec.lyrics ? `“${rec.lyrics}”` : '';
        if (genreEl) genreEl.textContent = rec.genre || 'Comfort Song';
        if (linkEl) {
          linkEl.href = `https://open.spotify.com/search/${encodeURIComponent(rec.title + ' ' + rec.artist)}`;
          linkEl.textContent = `🎧 Listen to "${rec.title}" on Spotify`;
        }

        resultCard?.classList.remove('hidden');
        resultCard?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        sound.playChime(392.00, 4);
      } catch (err) {
        console.warn("Song recommendation error:", err);
      } finally {
        discoverSongBtn.textContent = "✨ Find Another Song";
        discoverSongBtn.disabled = false;
      }
    });

    // Game Launch Cards
    const gameButtons = document.querySelectorAll('.game-launch-card');
    gameButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const game = btn.getAttribute('data-game');
        if (game) this.switchView(game);
      });
    });

    // Universal Back to Sanctuary Buttons
    const backButtons = document.querySelectorAll('.back-btn[data-back="home"]');
    backButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        this.switchView('home');
      });
    });

    // Completion Modal Buttons
    const modalReturnBtn = document.getElementById('btn-modal-return');
    const modalAgainBtn = document.getElementById('btn-modal-again');
    const modal = document.getElementById('completion-modal');

    modalReturnBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      modal?.classList.add('hidden');
      this.switchView('home');
    });

    modalAgainBtn?.addEventListener('click', (e) => {
      e.stopPropagation();
      modal?.classList.add('hidden');
      if (this.currentView === 'highway') highwayGame.start();
      if (this.currentView === 'fireflies') fireflyGame.start();
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.switchView('home');
      } else if (e.key.toLowerCase() === 't' && !e.ctrlKey && !e.metaKey) {
        themeManager.toggleTheme();
      }
    });

    // Window Resize Handler
    window.addEventListener('resize', () => {
      if (this.currentView === 'highway') highwayGame.resize();
      if (this.currentView === 'fireflies') fireflyGame.resize();
    });
  }
}

// Start application immediately
const startApp = () => {
  const app = new App();
  app.init();
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startApp);
} else {
  startApp();
}
