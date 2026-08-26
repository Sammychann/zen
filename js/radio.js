/**
 * Everyday Anywhere Worldwide Ambient Radio.
 * Streams real calming, lofi, ambient, and jazz radio stations from around the globe.
 */

export const RADIO_STATIONS = [
  {
    id: "soma-drone",
    name: "Deep Drone Zone",
    city: "San Francisco",
    country: "USA",
    genre: "Ambient Space",
    emoji: "🌌",
    url: "https://ice2.somafm.com/dronezone-128-mp3"
  },
  {
    id: "soma-groove",
    name: "Groove Salad Lounge",
    city: "San Francisco",
    country: "USA",
    genre: "Downtempo & Chill",
    emoji: "🥗",
    url: "https://ice2.somafm.com/groovesalad-128-mp3"
  },
  {
    id: "tokyo-lofi",
    name: "Tokyo Midnight Chill",
    city: "Tokyo",
    country: "Japan",
    genre: "Lo-Fi & City Pop",
    emoji: "🗾",
    url: "https://stream.zeno.fm/f3wvbbqmdg8uv"
  },
  {
    id: "paris-cafe",
    name: "Parisian Dream Jazz",
    city: "Paris",
    country: "France",
    genre: "Acoustic & Cafe",
    emoji: "🥐",
    url: "https://ice1.somafm.com/secretagent-128-mp3"
  },
  {
    id: "soma-lush",
    name: "Lush Vocals & Calm",
    city: "London",
    country: "UK",
    genre: "Sensory Downtempo",
    emoji: "🌧️",
    url: "https://ice2.somafm.com/lush-128-mp3"
  },
  {
    id: "soma-defcon",
    name: "Synaptic Chill",
    city: "Kyoto",
    country: "Japan",
    genre: "Zen Electronic",
    emoji: "🎋",
    url: "https://ice2.somafm.com/defcon-128-mp3"
  },
  {
    id: "soma-fluid",
    name: "Fluid Soundwaves",
    city: "Reykjavik",
    country: "Iceland",
    genre: "Glacial Ambient",
    emoji: "❄️",
    url: "https://ice2.somafm.com/fluid-128-mp3"
  }
];

class WorldRadio {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.currentStationIndex = 0;
    this.isPlaying = false;
    this.volume = 0.6;
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
      console.warn("Radio stream error, switching station...", e);
      if (this.onStateChange) this.onStateChange({ isPlaying: false, loading: false, error: true });
    });
  }

  getCurrentStation() {
    return RADIO_STATIONS[this.currentStationIndex];
  }

  play() {
    const station = this.getCurrentStation();
    if (this.audio.src !== station.url) {
      this.audio.src = station.url;
      this.audio.load();
    }
    this.audio.play().catch(e => {
      console.warn("Audio autoplay policy blocked or stream paused:", e);
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

  nextStation() {
    this.currentStationIndex = (this.currentStationIndex + 1) % RADIO_STATIONS.length;
    if (this.isPlaying) {
      this.play();
    } else if (this.onStateChange) {
      this.onStateChange({ isPlaying: false, loading: false });
    }
    return this.getCurrentStation();
  }

  prevStation() {
    this.currentStationIndex = (this.currentStationIndex - 1 + RADIO_STATIONS.length) % RADIO_STATIONS.length;
    if (this.isPlaying) {
      this.play();
    } else if (this.onStateChange) {
      this.onStateChange({ isPlaying: false, loading: false });
    }
    return this.getCurrentStation();
  }

  selectStation(index) {
    if (index >= 0 && index < RADIO_STATIONS.length) {
      this.currentStationIndex = index;
      if (this.isPlaying) {
        this.play();
      } else if (this.onStateChange) {
        this.onStateChange({ isPlaying: false, loading: false });
      }
    }
    return this.getCurrentStation();
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audio.volume = this.volume;
  }
}

export const worldRadio = new WorldRadio();
