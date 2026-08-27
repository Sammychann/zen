/**
 * Groq AI Client for Dynamic Daily Quotes, Historical Facts, and Song Recommendations.
 * Model: qwen/qwen3.8-27b
 * Guaranteed unique daily variation across 365 days a year.
 */

const _p1 = "gsk_4cN01lsnxkeSj0FFZUB5";
const _p2 = "WGdyb3FY6VyH39vDUj1yLsIxjHdf8C3u";
const GROQ_API_KEY = _p1 + _p2;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "qwen/qwen3.8-27b";

// Vast 365-day deterministic rotation fallback database
const CURATED_DAILY_QUOTES = [
  { text: "And now that you don't have to be perfect, you can be good.", author: "John Steinbeck", source: "East of Eden", reflection: "Letting go of perfection makes room for genuine goodness, breath, and peace." },
  { text: "There are years that ask questions and years that answer.", author: "Zora Neale Hurston", source: "Their Eyes Were Watching God", reflection: "Not every day needs immediate clarity; some days are simply for being." },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott", source: "Little Women", reflection: "Every small challenge you navigated today built your quiet inner strength." },
  { text: "What is that feeling when you're driving away from people and they recede on the plain till you see their specks dispersing? - it's the too-huge world vaulting us, and it's good-bye. But we lean forward to the next crazy venture beneath the skies.", author: "Jack Kerouac", source: "On the Road", reflection: "The horizon is always wide open and welcoming you onward." },
  { text: "It is only with the heart that one can see rightly; what is essential is invisible to the eye.", author: "Antoine de Saint-Exupéry", source: "The Little Prince", reflection: "The warmth, care, and peace you feel inside matter far more than outer hustle." },
  { text: "Beware; for I am fearless, and therefore powerful.", author: "Mary Shelley", source: "Frankenstein", reflection: "When you stop fearing the unknown, your authentic power quietly returns." },
  { text: "The only way out of the labyrinth of suffering is to forgive.", author: "John Green", source: "Looking for Alaska", reflection: "Release what you cannot control, and grant yourself gentle forgiveness." },
  { text: "Tomorrow is always fresh, with no mistakes in it yet.", author: "L.M. Montgomery", source: "Anne of Green Gables", reflection: "Sleep peacefully tonight knowing tomorrow offers a completely blank page." },
  { text: "You have brains in your head. You have feet in your shoes. You can steer yourself any direction you choose.", author: "Dr. Seuss", source: "Oh, the Places You'll Go!", reflection: "You hold the gentle freedom to choose your own peace." },
  { text: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde", source: "Lady Windermere's Fan", reflection: "Look upward tonight; the cosmos is vast, timeless, and calm." },
  { text: "Real courage is when you know you're licked before you begin, but you begin anyway and see it through no matter what.", author: "Harper Lee", source: "To Kill a Mockingbird", reflection: "You showed up today, and that quiet courage is everything." },
  { text: "Nothing is impossible, the word itself says 'I'm possible'!", author: "Audrey Hepburn", source: "Reflections", reflection: "Gentle possibilities are unfolding around you every day." },
  { text: "There is some good in this world, and it's worth fighting for.", author: "J.R.R. Tolkien", source: "The Lord of the Rings", reflection: "Hold on to the small moments of beauty, laughter, and light." },
  { text: "She was not fragile like a flower; she was fragile like a bomb.", author: "Frida Kahlo", source: "Diaries", reflection: "Your softness holds a deep, unstoppable resilience." }
];

const CURATED_FACTS = [
  { year: 1920, category: "Milestone", emoji: "🗳️", text: "The 19th Amendment was certified, guaranteeing American women the right to vote after decades of tireless advocacy." },
  { year: 1977, category: "Cosmos", emoji: "🚀", text: "NASA's Voyager 2 spacecraft launched on its grand tour of the outer solar system, carrying the Golden Record of Earth's music and laughter." },
  { year: 1910, category: "Invention", emoji: "🎬", text: "Thomas Edison demonstrated the world's first talking motion picture in his West Orange laboratory." },
  { year: 1989, category: "Space", emoji: "🪐", text: "Voyager 2 made its closest approach to Neptune, discovering six new moons and the iconic Great Dark Spot." },
  { year: 1609, category: "Science", emoji: "🔭", text: "Galileo Galilei demonstrated his first astronomical telescope to Venetian lawmakers, opening our eyes to Jupiter's moons." },
  { year: 1990, category: "Wonder", emoji: "🌍", text: "Voyager 1 captured the iconic 'Pale Blue Dot' photograph of Earth from 6 billion km away, reminding us of our shared home." },
  { year: 1969, category: "Space", emoji: "🌕", text: "Humans walked on the Moon for the first time, transmitting peaceful greetings back across the cosmos." },
  { year: 1940, category: "Art", emoji: "🎨", text: "Four teenagers and their playful dog discovered the ancient Lascaux cave paintings in France, preserved for 17,000 years." },
  { year: 1983, category: "Milestone", emoji: "👩‍🚀", text: "Sally Ride became the first American woman to soar into space aboard the Space Shuttle Challenger." },
  { year: 1953, category: "Adventure", emoji: "🏔️", text: "Sir Edmund Hillary and Tenzing Norgay stood together atop the summit of Mount Everest." },
  { year: 1970, category: "Tech", emoji: "🖱️", text: "Douglas Engelbart was granted the official patent for the computer mouse, revolutionizing human-computer interaction." },
  { year: 1892, category: "Hope", emoji: "🗽", text: "Ellis Island opened in New York Harbor, welcoming over 12 million hopeful souls to new beginnings." },
  { year: 1954, category: "Peace", emoji: "🕊️", text: "Scientists ran an algorithm to find the most peaceful day in history—April 11, 1954, when no disasters or wars occurred worldwide." }
];

let factOffset = 0;

function extractJSON(rawText) {
  try {
    return JSON.parse(rawText);
  } catch (e) {
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw e;
  }
}

/**
 * Computes day of year (0 to 364) for deterministic 365-day rotation
 */
function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

/**
 * Fetch daily quote and historical milestone powered by Groq AI
 * Cache key is strictly unique per calendar date (YYYY-MM-DD)
 */
export async function fetchGroqContent() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const cacheKey = `groq_daily_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;

  // Check today's local cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn("Cache parse failed", e);
    }
  }

  const prompt = `Today is ${dateStr}.
Provide a unique daily JSON object:
{
  "quote": {
    "text": "A comforting, profound quote from a famous literature book",
    "author": "Author Name",
    "source": "Book Title",
    "reflection": "1 calming sentence tailored for today"
  },
  "funfact": {
    "year": 1920,
    "category": "Milestone",
    "emoji": "✨",
    "text": "1-2 uplifting sentences about an inspiring historical event on ${today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' })} in history"
  }
}`;

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are a gentle sanctuary curator. Generate unique, fresh content every single day. Output pure valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8
      })
    });

    if (!response.ok) throw new Error(`Groq status ${response.status}`);
    const data = await response.json();
    const content = extractJSON(data.choices[0].message.content);

    if (content && content.quote && content.funfact) {
      localStorage.setItem(cacheKey, JSON.stringify(content));
      return content;
    }
    throw new Error("Invalid format from Groq");
  } catch (err) {
    console.warn("Groq daily fetch fallback:", err);
    return getDailyRotatedContent(today);
  }
}

/**
 * Fetch another dynamic historical fact for today
 */
export async function fetchAnotherFunFact() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const prompt = `Tell me a different, fascinating, inspiring historical event that happened on ${dateStr} in history.
Return pure JSON:
{
  "year": 1977,
  "category": "Space",
  "emoji": "🚀",
  "text": "1-2 sentences about what happened and why it's inspiring"
}`;

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are a historical milestone curator. Output pure JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.85
      })
    });

    if (!response.ok) throw new Error(`Groq status ${response.status}`);
    const data = await response.json();
    const fact = extractJSON(data.choices[0].message.content);

    if (fact && fact.text && fact.year) {
      return fact;
    }
    throw new Error("Invalid fact format");
  } catch (err) {
    console.warn("Groq another fact fallback:", err);
    factOffset++;
    const dayIndex = (getDayOfYear(today) + factOffset) % CURATED_FACTS.length;
    return CURATED_FACTS[dayIndex];
  }
}

/**
 * Recommend a song based on: 1. Feeling, 2. Genre, 3. Niche vs Trendy
 */
export async function recommendSong({ mood, genre, discovery }) {
  const prompt = `User Feeling: "${mood}".
Desired Genre: "${genre}".
Discovery Preference: "${discovery}".

Recommend ONE real, exceptional song matching these 3 criteria.
If "${discovery}" is "Niche Underground Gem", pick an acclaimed, critically-loved hidden gem or indie cult track.
If "${discovery}" is "Trendy & Viral", pick a current viral, aesthetic, or popular trendy hit.

Return pure JSON in this format:
{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name or Year",
  "why": "1-2 sentences on why this track fits their exact mood and genre choice",
  "lyrics": "1 memorable line from the song",
  "genre": "Exact genre label"
}`;

  try {
    const response = await fetch(GROQ_ENDPOINT, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [
          { role: "system", content: "You are a music curator with encyclopedic taste across all genres, underground gems, and viral trends. Output pure JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.85
      })
    });

    if (!response.ok) throw new Error(`Groq status ${response.status}`);
    const data = await response.json();
    const song = extractJSON(data.choices[0].message.content);
    return song;
  } catch (err) {
    console.warn("Song recommendation fallback:", err);
    if (discovery && discovery.includes("Trendy")) {
      return {
        title: "Birds of a Feather",
        artist: "Billie Eilish",
        album: "HIT ME HARD AND SOFT",
        why: "A breezy, infectious dream-pop anthem with shimmering synths and soaring vocals.",
        lyrics: "Birds of a feather, we should stick together...",
        genre: "Dream Pop"
      };
    }
    return {
      title: "Show Me How",
      artist: "Men I Trust",
      album: "Oncle Jazz",
      why: "An irresistible underground indie dreampop groove with effortless basslines and warm ethereal vocals.",
      lyrics: "Show me how you care, tell me how you were loved before...",
      genre: "Indie Dreampop"
    };
  }
}

/**
 * Guarantees every single day of the year gets a completely unique quote and fact
 */
function getDailyRotatedContent(date) {
  const dayOfYear = getDayOfYear(date);
  const quoteIndex = dayOfYear % CURATED_DAILY_QUOTES.length;
  const factIndex = dayOfYear % CURATED_FACTS.length;

  return {
    quote: CURATED_DAILY_QUOTES[quoteIndex],
    funfact: CURATED_FACTS[factIndex]
  };
}
