/**
 * Real Worldwide Internet Radio Stations
 * Verified 24/7 direct audio streams from iconic global broadcasters.
 */

export const WORLD_STATIONS = [
  {
    id: "nts-london",
    name: "NTS Radio 1",
    city: "London",
    country: "United Kingdom",
    countryCode: "GB",
    genre: "Underground, Eclectic & Leftfield",
    lat: 51.5074,
    lon: -0.1278,
    mapX: 47,
    mapY: 27,
    url: "https://stream-relay-geo.ntslive.net/stream"
  },
  {
    id: "fip-paris",
    name: "FIP Radio (Radio France)",
    city: "Paris",
    country: "France",
    countryCode: "FR",
    genre: "Eclectic Jazz, Chanson & World",
    lat: 48.8566,
    lon: 2.3522,
    mapX: 49,
    mapY: 30,
    url: "https://icecast.radiofrance.fr/fip-midfi.mp3"
  },
  {
    id: "groove-salad",
    name: "SomaFM Groove Salad",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    genre: "Ambient Downtempo & Chillout",
    lat: 37.7749,
    lon: -122.4194,
    mapX: 18,
    mapY: 37,
    url: "https://ice2.somafm.com/groovesalad-128-mp3"
  },
  {
    id: "drone-zone",
    name: "SomaFM Drone Zone",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    genre: "Deep Atmospheric Space Ambient",
    lat: 37.7749,
    lon: -122.4194,
    mapX: 20,
    mapY: 39,
    url: "https://ice2.somafm.com/dronezone-128-mp3"
  },
  {
    id: "secret-agent",
    name: "SomaFM Secret Agent",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    genre: "Vintage Spy Lounge & Bossa",
    lat: 37.7749,
    lon: -122.4194,
    mapX: 22,
    mapY: 35,
    url: "https://ice1.somafm.com/secretagent-128-mp3"
  },
  {
    id: "lush",
    name: "SomaFM Lush",
    city: "London / SF",
    country: "United States",
    countryCode: "US",
    genre: "Sensuous Vocals & Electronic Chill",
    lat: 51.5074,
    lon: -0.1278,
    mapX: 45,
    mapY: 29,
    url: "https://ice2.somafm.com/lush-128-mp3"
  },
  {
    id: "suburbs-goa",
    name: "SomaFM Suburbs of Goa",
    city: "Goa",
    country: "India",
    countryCode: "IN",
    genre: "Asian Underground & Meditative Beats",
    lat: 15.2993,
    lon: 74.1240,
    mapX: 68,
    mapY: 48,
    url: "https://ice1.somafm.com/suburbsofgoa-128-mp3"
  },
  {
    id: "indie-pop",
    name: "SomaFM Indie Pop Rocks",
    city: "San Francisco",
    country: "United States",
    countryCode: "US",
    genre: "Modern & Classic Indie Pop",
    lat: 37.7749,
    lon: -122.4194,
    mapX: 16,
    mapY: 33,
    url: "https://ice6.somafm.com/indiepop-128-mp3"
  }
];

class WorldRadioManager {
  constructor() {
    this.audio = new Audio();
    this.audio.crossOrigin = "anonymous";
    this.currentStationIndex = 0;
    this.isPlaying = false;
    this.volume = 0.85;
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
      console.warn("Stream error, attempting fallback...", e);
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
      console.warn("Audio autoplay prevented:", e);
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

  nextStation() {
    const nextIdx = (this.currentStationIndex + 1) % WORLD_STATIONS.length;
    return this.selectStation(nextIdx);
  }

  prevStation() {
    const prevIdx = (this.currentStationIndex - 1 + WORLD_STATIONS.length) % WORLD_STATIONS.length;
    return this.selectStation(prevIdx);
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
    this.audio.volume = this.volume;
  }
}

export const worldRadio = new WorldRadioManager();
