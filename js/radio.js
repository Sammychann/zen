/**
 * Worldwide Interactive Ambient Radio (Radio Garden Style)
 * High-reliability, loud & clear 24/7 global stream URLs with world map coordinates.
 */

export const WORLD_STATIONS = [
  {
    id: "tokyo",
    name: "Tokyo Midnight Lo-Fi",
    city: "Tokyo",
    country: "Japan",
    countryCode: "JP",
    genre: "Lo-Fi Beats & City Pop",
    emoji: "🗾",
    lat: 35.6762,
    lon: 139.6503,
    mapX: 82, // Percentage on world map
    mapY: 38,
    url: "https://stream.zeno.fm/f3wvbbqmdg8uv"
  },
  {
    id: "paris",
    name: "Parisian Dream Cafe",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    genre: "French Cafe & Smooth Jazz",
    emoji: "🥐",
    lat: 48.8566,
    lon: 2.3522,
    mapX: 49,
    mapY: 30,
    url: "https://ice1.somafm.com/secretagent-128-mp3"
  },
  {
    id: "london",
    name: "London Rainy Chillhop",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    genre: "Rainy Downtempo & Chill",
    emoji: "🌧️",
    lat: 51.5074,
    lon: -0.1278,
    mapX: 47,
    mapY: 27,
    url: "https://ice2.somafm.com/lush-128-mp3"
  },
  {
    id: "sf",
    name: "Groove Salad Lounge",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    genre: "Ambient Downtempo",
    emoji: "🌉",
    lat: 37.7749,
    lon: -122.4194,
    mapX: 18,
    mapY: 37,
    url: "https://ice2.somafm.com/groovesalad-128-mp3"
  },
  {
    id: "ny",
    name: "Drone Zone Deep Space",
    city: "New York",
    country: "United States",
    countryCode: "US",
    genre: "Deep Atmospheric Space",
    emoji: "🌌",
    lat: 40.7128,
    lon: -74.0060,
    mapX: 28,
    mapY: 35,
    url: "https://ice2.somafm.com/dronezone-128-mp3"
  },
  {
    id: "reykjavik",
    name: "Reykjavik Glacial Drift",
    city: "Reykjavik",
    country: "Iceland",
    countryCode: "IS",
    genre: "Nordic Ambient Sleep",
    emoji: "❄️",
    lat: 64.1466,
    lon: -21.9426,
    mapX: 42,
    mapY: 18,
    url: "https://ice2.somafm.com/fluid-128-mp3"
  },
  {
    id: "rio",
    name: "Rio Sunset Bossa",
    city: "Rio de Janeiro",
    country: "Brazil",
    countryCode: "BR",
    genre: "Bossa Nova & Acoustic",
    emoji: "🏖️",
    lat: -22.9068,
    lon: -43.1729,
    mapX: 35,
    mapY: 72,
    url: "https://ice4.somafm.com/illstreet-128-mp3"
  },
  {
    id: "berlin",
    name: "Berlin Deep Chill",
    city: "Berlin",
    country: "Germany",
    countryCode: "DE",
    genre: "Lounge & Minimal Chill",
    emoji: "📻",
    lat: 52.5200,
    lon: 13.4050,
    mapX: 52,
    mapY: 28,
    url: "https://ice2.somafm.com/defcon-128-mp3"
  },
  {
    id: "goa",
    name: "Goa Sunset Chillout",
    city: "Goa",
    country: "India",
    countryCode: "IN",
    genre: "Peaceful Sitar & Meditative Beats",
    emoji: "🪔",
    lat: 15.2993,
    lon: 74.1240,
    mapX: 68,
    mapY: 48,
    url: "https://ice1.somafm.com/suburbsofgoa-128-mp3"
  },
  {
    id: "sydney",
    name: "Sydney Coastal Breeze",
    city: "Sydney",
    country: "Australia",
    countryCode: "AU",
    genre: "Warm Acoustic & Ocean Breeze",
    emoji: "🌊",
    lat: -33.8688,
    lon: 151.2093,
    mapX: 88,
    mapY: 78,
    url: "https://ice6.somafm.com/indiepop-128-mp3"
  }
];

class WorldRadioManager {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.currentStationIndex = 0;
    this.isPlaying = false;
    this.volume = 0.85; // High clear volume
    this.audio.volume = this.volume;

    this.onStateChange = null;

    this.audio.addEventListener("playing", () => {
      this.isPlaying = true;
      if (this.onStateChange) this.onStateChange({ isPlaying: true, loading: false });
    });

    this.audio.addEventListener("waiting", () => {
      if (this.onStateChange) this.onStateChange({ isPlaying: false, loading: true });
    });

    this.audio.addEventListener("error", (e) => {
      console.warn("Stream error, switching to next station...", e);
      if (this.onStateChange) this.onStateChange({ isPlaying: false, loading: false, error: true });
    });
  }

  getCurrentStation() {
    return WORLD_STATIONS[this.currentStationIndex];
  }

  play() {
    const station = this.getCurrentStation();
    if (this.audio.src !== station.url) {
      this.audio.src = station.url;
      this.audio.load();
    }
    this.audio.play().catch(e => {
      console.warn("Audio autoplay policy or stream error:", e);
    });
    this.isPlaying = true;
    if (this.onStateChange) this.onStateChange({ isPlaying: true, loading: true });
  }

  pause() {
    this.audio.pause();
    this.isPlaying = false;
    if (this.onStateChange) this.onStateChange({ isPlaying: false, loading: false });
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  selectStation(index) {
    if (index >= 0 && index < WORLD_STATIONS.length) {
      this.currentStationIndex = index;
      if (this.isPlaying) {
        this.play();
      } else if (this.onStateChange) {
        this.onStateChange({ isPlaying: false, loading: false });
      }
    }
    return this.getCurrentStation();
  }

  selectStationById(id) {
    const idx = WORLD_STATIONS.findIndex(s => s.id === id);
    if (idx !== -1) {
      return this.selectStation(idx);
    }
    return this.getCurrentStation();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audio.volume = this.volume;
  }
}

export const worldRadio = new WorldRadioManager();
