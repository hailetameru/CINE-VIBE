import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini client (server-side only)
const apiKey = process.env.GEMINI_API_KEY;
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });
} else {
  console.warn("GEMINI_API_KEY is not defined in the environment. Recommendations and lookup endpoints will return demo data.");
}

// Log status on start
console.log(`Gemini API Key configured: ${apiKey ? "YES (using server keys)" : "NO"}`);

// API: Movie Recommendations
app.post("/api/recommendations", async (req, res) => {
  const { watchHistory = [], preferences } = req.body;

  if (!ai) {
    return res.status(500).json({ 
      error: "Gemini API is not configured. Please supply GEMINI_API_KEY in the Secrets panel." 
    });
  }

  // Build high-context prompt
  const preferencesSummary = preferences ? `
- Preferred Genres: ${preferences.genres?.join(", ") || "Any"}
- Preferred Moods: ${preferences.moods?.join(", ") || "Any"}
- Pace: ${preferences.pace || "Any"}
- Eras: ${preferences.eras?.join(", ") || "Any"}
- Languages: ${preferences.languages?.join(", ") || "Any"}
- Exclusions/Avoid: ${preferences.exclusions?.join(", ") || "None"}
` : "No specific preference filters provided (recommend general high-quality films).";

  const historySummary = watchHistory.length > 0 ? watchHistory.map((m: any) => {
    return `- "${m.title}" (${m.year || "Unknown year"}) - Rating: ${m.userRating}/5 stars. ${m.genres ? `Genres: ${m.genres.join(", ")}.` : ""} ${m.userReview ? `User feedback: "${m.userReview}"` : ""}`;
  }).join("\n") : "Watch history is empty (recommend foundational cinematic masterpieces across preferences).";

  const prompt = `
You are a highly premium, cinema-enthusiast movie recommendation system.
Your job is to analyze the user's Watch History and Preferences, then recommend exactly 5 highly compelling film suggestions they would love next.

CRITICAL INSTRUCTIONS:
1. Do NOT suggest movies that are already in the user's Watch History.
2. Provide a personalized "recommendationReason" explaining why they will like it based on their specified preferences and specific watch history titles. Avoid generic filler.
3. Keep results highly accurate to historical metadata (correct years, directories, etc).
4. Assign a creative "primaryColorAccent" out of "orange", "indigo", "emerald", "rose", "amber", "violet", "cyan" based on the film's vibe/intensity (e.g. emerald/cyan for sci-fi, orange/amber for adventure/romance, indigo/rose for thriller/drama, etc).

USER PROFILE:

### Preferences:
${preferencesSummary}

### Watch History:
${historySummary}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are an expert movie critic who is friendly and writes highly personalized film descriptions.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          description: "List of 5 movie recommendations tailored to preferences and history.",
          items: {
            type: Type.OBJECT,
            required: [
              "title", "year", "genres", "director", "rating", 
              "duration", "plot", "recommendationReason", 
              "similarityScore", "keyCast", "whereToWatch", "primaryColorAccent"
            ],
            properties: {
              title: { type: Type.STRING, description: "Official name of the movie." },
              year: { type: Type.STRING, description: "Year of release format e.g. 2014" },
              genres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Primary genres e.g. ['Sci-Fi', 'Drama']" },
              director: { type: Type.STRING, description: "Director of the film" },
              rating: { type: Type.STRING, description: "Cert rating e.g. PG-13, R, PG, G" },
              duration: { type: Type.STRING, description: "Runtime e.g. 2h 10m" },
              plot: { type: Type.STRING, description: "Short, captivating hook summary of the plot." },
              recommendationReason: { 
                type: Type.STRING, 
                description: "Deep personalized argument linking specific user preferences or past watched films to this film." 
              },
              similarityScore: { 
                type: Type.INTEGER, 
                description: "Calculated match percentage from 50 to 99 based on watch history correlation." 
              },
              keyCast: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Principal 2-3 actors" },
              whereToWatch: { type: Type.STRING, description: "Available platforms or standard streaming e.g. Netflix, Disney+, Rental" },
              primaryColorAccent: { 
                type: Type.STRING, 
                description: "Styling color from permitted selection: orange, indigo, emerald, rose, amber, violet, cyan" 
              }
            }
          }
        }
      }
    });

    const text = response.text || "[]";
    const parsedRecommendations = JSON.parse(text);
    return res.json({ recommendations: parsedRecommendations });

  } catch (err: any) {
    console.error("Gemini Recommendations Generation Error:", err);
    return res.status(500).json({ 
      error: "Failed to generate recommendations via AI model. Please check logs.", 
      details: err.message 
    });
  }
});

// API: Movie Lookup (for searching and auto-filling watch history items)
app.post("/api/movie-lookup", async (req, res) => {
  const { query } = req.body;

  if (!query || query.trim() === "") {
    return res.status(400).json({ error: "Query cannot be empty" });
  }

  if (!ai) {
    return res.status(500).json({ 
      error: "Gemini API is not configured. Please supply GEMINI_API_KEY in the Secrets panel." 
    });
  }

  const prompt = `
Find the movie matching: "${query}".
Provide authentic, accurate movie metadata. Ensure the title is spelled and capitalized correctly.
If the movie cannot be found or is fake, please synthesize what could match but try to guess actual release details.
`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction: "You are a movie info engine. Return the exact single movie object representing parsed data.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["title", "year", "genres", "plot"],
          properties: {
            title: { type: Type.STRING, description: "Official capitalized title" },
            year: { type: Type.STRING, description: "Year of release e.g. 1999" },
            genres: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Genres e.g. ['Sci-Fi', 'Action']" },
            plot: { type: Type.STRING, description: "Brief storyline summary (1-2 sentences)" }
          }
        }
      }
    });

    const text = response.text || "{}";
    const movieDetails = JSON.parse(text);
    return res.json({ movie: movieDetails });

  } catch (err: any) {
    console.error("Gemini Movie Lookup Error:", err);
    return res.status(500).json({ 
      error: "Failed to lookup movie details.", 
      details: err.message 
    });
  }
});

// Vite middleware development / static files production setup
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server successfully started on http://0.0.0.0:${PORT}`);
  });
}

startServer();
