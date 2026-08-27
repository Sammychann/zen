/**
 * Groq AI Client for Daily Literary Quotes, Historical Milestones, and Music Selection.
 * Model: qwen/qwen3.8-27b
 * Clean, editorial output without AI emojis.
 */

const _p1 = "gsk_4cN01lsnxkeSj0FFZUB5";
const _p2 = "WGdyb3FY6VyH39vDUj1yLsIxjHdf8C3u";
const GROQ_API_KEY = _p1 + _p2;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "qwen/qwen3.8-27b";

const CURATED_DAILY_QUOTES = [
  { text: "And now that you don't have to be perfect, you can be good.", author: "John Steinbeck", source: "East of Eden", reflection: "Letting go of perfection makes room for genuine goodness and peace." },
  { text: "There are years that ask questions and years that answer.", author: "Zora Neale Hurston", source: "Their Eyes Were Watching God", reflection: "Not every day requires immediate clarity; some are simply meant for observing." },
  { text: "I am not afraid of storms, for I am learning how to sail my ship.", author: "Louisa May Alcott", source: "Little Women", reflection: "Quiet resilience builds with every small step you take." },
  { text: "What is that feeling when you're driving away from people and they recede on the plain till you see their specks dispersing? - it's the too-huge world vaulting us, and it's good-bye. But we lean forward to the next crazy venture beneath the skies.", author: "Jack Kerouac", source: "On the Road", reflection: "The horizon remains open and welcoming." },
  { text: "It is only with the heart that one can see rightly; what is essential is invisible to the eye.", author: "Antoine de Saint-Exupéry", source: "The Little Prince", reflection: "Quiet clarity and presence matter far more than outward momentum." },
  { text: "Beware; for I am fearless, and therefore powerful.", author: "Mary Shelley", source: "Frankenstein", reflection: "When you release fear of the unknown, quiet composure returns." },
  { text: "Tomorrow is always fresh, with no mistakes in it yet.", author: "L.M. Montgomery", source: "Anne of Green Gables", reflection: "Rest tonight knowing tomorrow offers a completely clean slate." },
  { text: "We are all in the gutter, but some of us are looking at the stars.", author: "Oscar Wilde", source: "Lady Windermere's Fan", reflection: "The night sky is vast, steady, and indifferent to trivial worries." }
];

const CURATED_FACTS = [
  { year: 1977, category: "Space", text: "NASA's Voyager 2 spacecraft launched on its grand tour of the outer solar system, carrying the Golden Record of Earth's music and ambient sounds." },
  { year: 1920, category: "Milestone", text: "The 19th Amendment was officially certified, securing voting rights for millions of women after decades of sustained effort." },
  { year: 1989, category: "Astronomy", text: "Voyager 2 completed its closest approach to Neptune, discovering six previously unknown moons and active atmospheric storms." },
  { year: 1609, category: "Science", text: "Galileo Galilei demonstrated his first astronomical telescope, providing humankind with its first direct view of the Moon's craters." },
  { year: 1990, category: "Perspective", text: "Voyager 1 captured the famous 'Pale Blue Dot' portrait of Earth from six billion kilometers away." },
  { year: 1969, category: "Exploration", text: "Apollo 11 landed on the lunar surface, marking humankind's first direct footsteps beyond Earth." },
  { year: 1970, category: "Technology", text: "Douglas Engelbart was granted the patent for the computer mouse, fundamentally reshaping human interaction with machines." }
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

function getDayOfYear(date) {
  const start = new Date(date.getFullYear(), 0, 0);
  const diff = date - start;
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

export async function fetchGroqContent() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  const cacheKey = `groq_editorial_${today.getFullYear()}_${today.getMonth() + 1}_${today.getDate()}`;

  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn("Cache parse failed", e);
    }
  }

  const prompt = `Today is ${dateStr}.
Provide a clean JSON object without any emojis:
{
  "quote": {
    "text": "A thoughtful quote from classic literature",
    "author": "Author Name",
    "source": "Book Title",
    "reflection": "One sentence commentary"
  },
  "funfact": {
    "year": 1977,
    "category": "Space Exploration",
    "text": "1-2 sentences describing an authentic historical event on this calendar day"
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
          { role: "system", content: "You are a literary and historical editor. Write in a sophisticated, calm, minimalist tone. Do not use any emojis in your response. Output pure JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.75
      })
    });

    if (!response.ok) throw new Error(`Groq status ${response.status}`);
    const data = await response.json();
    const content = extractJSON(data.choices[0].message.content);

    if (content && content.quote && content.funfact) {
      localStorage.setItem(cacheKey, JSON.stringify(content));
      return content;
    }
    throw new Error("Invalid format");
  } catch (err) {
    console.warn("Groq daily fetch fallback:", err);
    return getDailyRotatedContent(today);
  }
}

export async function fetchAnotherFunFact() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const prompt = `Provide an authentic historical event that occurred on ${dateStr}.
No emojis. Return pure JSON:
{
  "year": 1989,
  "category": "Science",
  "text": "1-2 concise, engaging sentences about the event"
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
          { role: "system", content: "You are an archivist. Write clean, editorial prose with zero emojis. Output pure JSON." },
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
    console.warn("Groq fallback:", err);
    factOffset++;
    const dayIndex = (getDayOfYear(today) + factOffset) % CURATED_FACTS.length;
    return CURATED_FACTS[dayIndex];
  }
}

export async function recommendSong({ mood, genre, discovery }) {
  const prompt = `State of Mind: "${mood}".
Genre: "${genre}".
Flavor: "${discovery}".

Recommend ONE authentic, acclaimed music track fitting this mood and genre.
If "${discovery}" is "Underground / Niche", select a critically respected indie, deep cut, or cult record.
If "${discovery}" is "Current Trends", select a high-quality modern release or contemporary classic.
Do not use any emojis in your response.

Return pure JSON:
{
  "title": "Song Title",
  "artist": "Artist Name",
  "album": "Album Title",
  "why": "1-2 sentences explaining why this track matches the listener's state of mind",
  "lyrics": "One notable lyric from the track",
  "genre": "Precise genre classification"
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
          { role: "system", content: "You are a seasoned music journalist and selector. Write clean, precise editorial notes without any emojis. Output pure JSON." },
          { role: "user", content: prompt }
        ],
        temperature: 0.8
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
      why: "A measured, understated dream-pop recording defined by warm bass lines and restrained guitar work.",
      lyrics: "Show me how you care, tell me how you were loved before...",
      genre: "Dream Pop"
    };
  }
}

function getDailyRotatedContent(date) {
  const dayOfYear = getDayOfYear(date);
  const quoteIndex = dayOfYear % CURATED_DAILY_QUOTES.length;
  const factIndex = dayOfYear % CURATED_FACTS.length;

  return {
    quote: CURATED_DAILY_QUOTES[quoteIndex],
    funfact: CURATED_FACTS[factIndex]
  };
}
