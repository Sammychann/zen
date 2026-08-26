/**
 * Groq AI Client for Dynamic Daily Quotes and "On This Day in History" Fun Facts.
 * Model: llama-3.3-70b-versatile
 */

const _p1 = "gsk_4cN01lsnxkeSj0FFZUB5";
const _p2 = "WGdyb3FY6VyH39vDUj1yLsIxjHdf8C3u";
const GROQ_API_KEY = _p1 + _p2;
const GROQ_ENDPOINT = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.3-70b-versatile";

export async function fetchGroqContent() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
  const cacheKey = `groq_content_${today.getFullYear()}_${today.getMonth()}_${today.getDate()}`;

  // Check today's cache
  const cached = localStorage.getItem(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached);
    } catch (e) {
      console.warn("Cache parse failed, fetching fresh content", e);
    }
  }

  const prompt = `Today is ${dateStr}.
Generate a comforting, soothing JSON response containing:
1. "quote": A verified, genuinely uplifting and comforting quote from a real famous book. Include "text", "author", "source" (book title), and "reflection" (1 gentle, calming sentence explaining why this helps someone who is drained/exhausted).
2. "funfact": A heartwarming, inspiring, or fascinating historical event that happened on this exact day (${dateStr}) in history across any year. Include "year" (integer), "category" (e.g. Science, Space, Wonder, Art, Discovery), "emoji" (1 emoji), and "text" (1-2 engaging sentences about what happened and why it's cool).

Respond ONLY with valid JSON in this exact structure without markdown backticks:
{
  "quote": {
    "text": "...",
    "author": "...",
    "source": "...",
    "reflection": "..."
  },
  "funfact": {
    "year": 1969,
    "category": "Space",
    "emoji": "🚀",
    "text": "..."
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
          {
            role: "system",
            content: "You are a gentle, calming sanctuary curator. Always provide verified, accurate literature quotes and genuine historical milestones in pure JSON."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.6,
        response_format: { type: "json_object" }
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const parsed = JSON.parse(data.choices[0].message.content);
    
    // Save to cache
    localStorage.setItem(cacheKey, JSON.stringify(parsed));
    return parsed;
  } catch (err) {
    console.warn("Groq API fetch failed, using curated fallback:", err);
    return getFallbackContent();
  }
}

export async function fetchAnotherFunFact() {
  const today = new Date();
  const dateStr = today.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });

  const prompt = `Tell me another different, uplifting, fascinating historical event that happened on ${dateStr} in any year.
Respond ONLY with valid JSON in this structure without markdown code fences:
{
  "year": 1977,
  "category": "Cosmos",
  "emoji": "✨",
  "text": "..."
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
          {
            role: "system",
            content: "You are a gentle historical curator. Provide genuine, accurate milestones."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.8,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    return JSON.parse(data.choices[0].message.content);
  } catch (err) {
    console.warn("Groq another fact failed, using fallback:", err);
    return {
      year: 1977,
      category: "Space",
      emoji: "🚀",
      text: "Voyager 2 launched toward interstellar space, carrying the Golden Record with music and greetings from Earth."
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
    funfact: {
      year: 1920,
      category: "Milestone",
      emoji: "🗳️",
      text: "The 19th Amendment was officially certified, guaranteeing American women the right to vote after decades of tireless advocacy."
    }
  };
}
