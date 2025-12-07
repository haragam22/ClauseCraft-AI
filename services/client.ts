import { GoogleGenAI } from "@google/genai";

// Initialize the client once.
// We strictly use the environment variable as requested.
export const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const MODELS = {
  TEXT: 'gemini-2.5-flash',
  TTS: 'gemini-2.5-flash-preview-tts'
};
