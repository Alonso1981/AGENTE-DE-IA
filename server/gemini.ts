import { GoogleGenAI } from '@google/genai';

let genAIClient: GoogleGenAI | null = null;

export function getGenAI(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!genAIClient && apiKey) {
    try {
      genAIClient = new GoogleGenAI({ apiKey });
    } catch (err) {
      console.error('Error initializing GoogleGenAI:', err);
    }
  }
  return genAIClient;
}

// Active verified models in order of lowest latency and highest availability
const CANDIDATE_MODELS = [
  'gemini-flash-lite-latest',
  'gemini-3-flash-preview',
  'gemini-2.5-flash-lite',
  'gemini-pro-latest',
  'gemini-flash-latest',
];

export async function generateContentResilient(params: {
  contents: any;
  systemInstruction?: string;
  temperature?: number;
  responseMimeType?: string;
}): Promise<string> {
  const ai = getGenAI();
  if (!ai) {
    throw new Error('GEMINI_API_KEY não configurada no servidor.');
  }

  let lastError: any = null;

  for (const model of CANDIDATE_MODELS) {
    try {
      const config: any = {
        temperature: params.temperature ?? 0.7,
      };

      if (params.systemInstruction) {
        config.systemInstruction = params.systemInstruction;
      }

      if (params.responseMimeType) {
        config.responseMimeType = params.responseMimeType;
      }

      const res = await ai.models.generateContent({
        model,
        contents: params.contents,
        config,
      });

      if (res.text && res.text.trim()) {
        return res.text.trim();
      }
    } catch (err: any) {
      console.warn(`Model ${model} failed (${err?.status || err?.message}), trying next candidate...`);
      lastError = err;
    }
  }

  throw lastError || new Error('Nenhum modelo Gemini respondeu.');
}
