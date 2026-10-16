import {
  AngularNodeAppEngine,
  createNodeRequestHandler,
  isMainModule,
  writeResponseToNodeResponse,
} from '@angular/ssr/node';
import express from 'express';
import { join } from 'node:path';
import { GoogleGenAI } from '@google/genai';

const browserDistFolder = join(import.meta.dirname, '../browser');

const app = express();
const angularApp = new AngularNodeAppEngine();

app.use(express.json());

// In-Memory Database Store for AppConfig & Dynamic Endpoints
let currentAppConfig = {
  id: 1,
  enable_channels: 1, // 0 or 1
  enable_movies: 1,   // 0 or 1
  enable_anime: 1,    // 0 or 1
  enable_ads: 1,      // 0 or 1
  ad_skip_delay_seconds: 5,
  custom_m3u_url: 'https://iptv-org.github.io/iptv/index.m3u',
  app_title: 'StreamSUUt IPTV & Media Hub',
  theme: 'dark',
  updated_at: new Date().toISOString()
};

/**
 * Lazy-initialized Gemini API Client
 */
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env['GEMINI_API_KEY'];
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return null;
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

// API Routes

// 1. AppConfig Local Database Endpoints
app.get('/api/config', (_req, res) => {
  res.json(currentAppConfig);
});

app.post('/api/config/update', (req, res) => {
  if (req.body && typeof req.body === 'object') {
    currentAppConfig = {
      ...currentAppConfig,
      ...req.body,
      updated_at: new Date().toISOString()
    };
  }
  res.json(currentAppConfig);
});

// 2. Gemini AI Assistant Route
app.post('/api/gemini', async (req, res) => {
  try {
    const { prompt, contextCategory } = req.body || {};

    const ai = getGeminiClient();

    if (!ai) {
      // Fallback response when key is not set
      return res.json({
        answer: `🤖 **StreamSUUt AI Assistant**: Here are recommended choices for **${contextCategory || 'Media'}**:\n\n` +
          `• **Featured Channel**: NASA TV Live 4K HLS Stream\n` +
          `• **Top Movie**: Cyberpunk Vanguard 2088 (Sci-Fi / Action)\n` +
          `• **Recommended Anime**: Neo Tokyo Re-Genesis Episode 1\n\n` +
          `*(Connect your Gemini API Key in Settings for interactive real-time AI responses!)*`
      });
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: `You are the StreamSUUt AI IPTV & Streaming Assistant. Help the user with TV channel guides, movie recommendations, anime insights, or IPTV M3U playlist analysis.\n\nContext: ${contextCategory || 'general'}\nUser query: ${prompt || 'Suggest top channels and movies to watch right now.'}`
    });

    return res.json({ answer: response.text });
  } catch (err: unknown) {
    console.error('Gemini API Error:', err);
    return res.json({
      answer: `🤖 **StreamSUUt AI Assistant**: Found top streams for you:\n- NASA TV Live Stream (HLS .m3u8)\n- Red Bull Extreme Sports HD\n- Cyberpunk Vanguard 2088`,
      error: (err as Error)?.message
    });
  }
});

/**
 * Serve static files from /browser
 */
app.use(
  express.static(browserDistFolder, {
    maxAge: '1y',
    index: false,
    redirect: false,
  }),
);

/**
 * Handle all other requests by rendering the Angular application.
 */
app.use((req, res, next) => {
  angularApp
    .handle(req)
    .then((response) =>
      response ? writeResponseToNodeResponse(response, res) : next(),
    )
    .catch(next);
});

/**
 * Start the server if this module is the main entry point, or it is ran via PM2.
 */
if (isMainModule(import.meta.url) || process.env['pm_id']) {
  const port = process.env['PORT'] || 4000;
  app.listen(port, (error) => {
    if (error) {
      throw error;
    }
    console.log(`Node Express server listening on http://localhost:${port}`);
  });
}

export const reqHandler = createNodeRequestHandler(app);
