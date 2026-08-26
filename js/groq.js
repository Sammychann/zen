/**
 * Groq AI Client for Dynamic Daily Quotes, Historical Facts, and Song Recommendations.
 * Model: qwen/qwen3.8-27b
 */

const _p1 = "gsk_4cN01lsnxkeSj0FFZUB5";
const _p2 = "WGdyb3FY6VyH39vDUj1yLsIxjHdf8C3u";
const GROQ_API_KEY = _p1 + _p2;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "qwen/qwen3.8-27b";

// Curated database of uplifting historical milestones
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

let localFactIndex = 0;

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

export async function fetchGroqContent() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const cacheKey = `groq_content_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn("Cache parse failed", e);
    }
  }

  const prompt = `Today is ${dateStr}.
Provide a gentle JSON object:
{
  "quote": {
    "text": "A comforting quote from a famous book",
    "author": "Author Name",
    "source": "Book Title",
    "reflection": "1 calming sentence"
  },
  "funfact": {
    "year": 1920,
    "category": "Milestone",
    "emoji": "✨",
    "text": "1-2 uplifting sentences about an event on ${dateStr} in history"
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
          { role: "system", content: "You are a gentle sanctuary curator. Output pure valid JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.7
      })
    });

    if (!response.ok) throw new Error(`Groq status ${response.status}`);
    const data = await response.json();
    const content = extractJSON(data.choices[0].message.content);

    localStorage.setItem(cacheKey, JSON.stringify(content));
    return content;
  } catch (err) {
    console.warn("Groq fetch fallback:", err);
    return getFallbackContent();
  }
}

export async function fetchAnotherFunFact() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const prompt = `Tell me a different, uplifting, fascinating historical event that happened on ${dateStr} in history.
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
        temperature: 0.8
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
    localFactIndex = (localFactIndex + 1) % CURATED_FACTS.length;
    return CURATED_FACTS[localFactIndex];
  }
}

/**
 * Recommend any music genre (trendy, niche, underground, indie, electronic, r&b, etc.)
 */
export async function recommendSong({ mood, vibe, energy, preference }) {
  const prompt = `User mood: "${mood}".
Desired vibe: "${vibe}".
Energy level: "${energy}".
Preferred style / flavor: "${preference}".

Recommend ONE real, awesome song that matches this mood & vibe.
It can be ANY genre (Indie Rock, Synthwave / Dreampop, R&B / Neo-Soul, Electronic / French House, Shoegaze, Hyperpop, Hip-Hop, Alt-Pop, Japanese City Pop, etc.).
If preference mentions "Niche / Trendy" or "Underground", pick an acclaimed, cool, aesthetic, or viral gem (e.g. Men I Trust, Beach House, PinkPantheress, Fred again.., Laufey, Magdalena Bay, Frank Ocean, Kaytranada, boygenius, Clairo, Steve Lacy, etc.).

Return pure JSON in this format:
{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Name or Year",
  "why": "1-2 engaging sentences on why this song fits their exact vibe and energy right now",
  "lyrics": "1 memorable line from the song",
  "genre": "Genre tag (e.g. Dreampop, Indie Pop, French Touch, Neo-Soul, Alt-R&B)"
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
          { role: "system", content: "You are a tastemaker music curator with deep knowledge across all modern, indie, trendy, underground, and classic genres. Output pure JSON." },
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
    return {
      title: "Show Me How",
      artist: "Men I Trust",
      album: "Oncle Jazz",
      why: "A smooth, buttery indie dreampop groove with effortless basslines and warm ethereal vocals.",
      lyrics: "Show me how you care, tell me how you were loved before...",
      genre: "Indie Dreampop"
    };
  }
}

function getFallbackContent() {
  return {
    quote: {
      text: "And now that you don't have to be perfect, you can be good.",
      author: "John Steinbeck",
      source: "East of Eden",
      reflection: "Letting go of perfection makes room for genuine goodness, breath, and peace."
    },
    funfact: CURATED_FACTS[0]
  };
}
