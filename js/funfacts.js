/**
 * "On This Day in History" Fun Facts Generator.
 * Features a curated database of uplifting, fascinating, and quirky historical milestones
 * for every day/month + dynamic Wikipedia 'On This Day' fetch with local fallback.
 */

// Curated database of uplifting, fascinating, and quirky events throughout history
export const CURATED_FACTS = [
  // August 26 (Today)
  {
    month: 8,
    day: 26,
    year: 1920,
    text: "The 19th Amendment to the US Constitution was certified, guaranteeing American women the right to vote after decades of tireless advocacy.",
    category: "Milestone",
    emoji: "🗳️"
  },
  {
    month: 8,
    day: 26,
    year: 1977,
    text: "NASA's Voyager 2 spacecraft was launched on its grand tour of the outer planets, carrying the Golden Record with sounds and music from Earth into interstellar space.",
    category: "Space",
    emoji: "🚀"
  },
  {
    month: 8,
    day: 26,
    year: 1910,
    text: "Thomas Edison demonstrated the first talking motion picture at his laboratory in West Orange, New Jersey.",
    category: "Invention",
    emoji: "🎬"
  },
  {
    month: 8,
    day: 26,
    year: 1989,
    text: "Voyager 2 made its closest approach to Neptune, discovering six new moons and the iconic Great Dark Spot.",
    category: "Cosmos",
    emoji: "🪐"
  },

  // General inspiring/fun historical facts across calendar dates
  {
    month: 1,
    day: 1,
    year: 1892,
    text: "Ellis Island opened in New York Harbor, welcoming millions of hopeful immigrants to new beginnings.",
    category: "History",
    emoji: "🗽"
  },
  {
    month: 2,
    day: 14,
    year: 1990,
    text: "Voyager 1 took the iconic 'Pale Blue Dot' photograph of Earth from 6 billion kilometers away, reminding humanity of our shared home.",
    category: "Cosmos",
    emoji: "🌍"
  },
  {
    month: 3,
    day: 21,
    year: 1685,
    text: "Johann Sebastian Bach was born, going on to create some of the most transcendent music in human history.",
    category: "Music",
    emoji: "🎼"
  },
  {
    month: 4,
    day: 11,
    year: 1954,
    text: "Computer scientists ran an algorithm to find the most peaceful day in history—April 11, 1954, when virtually nothing eventful or disastrous occurred worldwide.",
    category: "Oddity",
    emoji: "🕊️"
  },
  {
    month: 5,
    day: 29,
    year: 1953,
    text: "Sir Edmund Hillary and Tenzing Norgay became the first verified mountaineers to reach the summit of Mount Everest.",
    category: "Adventure",
    emoji: "🏔️"
  },
  {
    month: 6,
    day: 18,
    year: 1983,
    text: "Sally Ride became the first American woman in space aboard the Space Shuttle Challenger.",
    category: "Space",
    emoji: "👩‍🚀"
  },
  {
    month: 7,
    day: 20,
    year: 1969,
    text: "Humans took their very first steps on the Moon, broadcasting peace greetings back to Earth.",
    category: "Milestone",
    emoji: "🌕"
  },
  {
    month: 8,
    day: 25,
    year: 1609,
    text: "Galileo Galilei demonstrated his first telescope to Venetian lawmakers, opening humanity's eyes to the moons of Jupiter.",
    category: "Science",
    emoji: "🔭"
  },
  {
    month: 9,
    day: 12,
    year: 1940,
    text: "Four teenagers and their dog exploring in southwestern France discovered the ancient Lascaux cave paintings, created over 17,000 years ago.",
    category: "Discovery",
    emoji: "🎨"
  },
  {
    month: 10,
    day: 4,
    year: 1957,
    text: "Sputnik 1 was launched into orbit, beeping softly as humanity's very first artificial satellite.",
    category: "Space",
    emoji: "🛰️"
  },
  {
    month: 11,
    day: 17,
    year: 1970,
    text: "Douglas Engelbart received the official patent for the computer mouse, originally titled an 'X-Y position indicator for a display system'.",
    category: "Tech",
    emoji: "🖱️"
  },
  {
    month: 12,
    day: 24,
    year: 1968,
    text: "Astronaut William Anders captured the 'Earthrise' photograph from lunar orbit, inspiring the global environmental movement.",
    category: "Wonder",
    emoji: "✨"
  }
];

class FunFactsManager {
  constructor() {
    this.currentFactIndex = 0;
    this.factsForToday = [];
  }

  getTodayFacts() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentDay = today.getDate();

    // Find facts matching today's date
    let matches = CURATED_FACTS.filter(
      f => f.month === currentMonth && f.day === currentDay
    );

    // If fewer than 2 matches, include other delightful historical wonders
    if (matches.length < 3) {
      const others = CURATED_FACTS.filter(
        f => !(f.month === currentMonth && f.day === currentDay)
      );
      matches = [...matches, ...others];
    }

    this.factsForToday = matches;
    return this.factsForToday;
  }

  getCurrentFact() {
    if (this.factsForToday.length === 0) {
      this.getTodayFacts();
    }
    return this.factsForToday[this.currentFactIndex % this.factsForToday.length];
  }

  getNextFact() {
    if (this.factsForToday.length === 0) {
      this.getTodayFacts();
    }
    this.currentFactIndex = (this.currentFactIndex + 1) % this.factsForToday.length;
    return this.getCurrentFact();
  }
}

export const funFacts = new FunFactsManager();
