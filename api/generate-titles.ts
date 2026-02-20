
import { GoogleGenAI, Type } from "@google/genai";

export const config = {
    runtime: 'edge', // or 'nodejs'
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { topic, language } = await req.json();

        if (!process.env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // Use Pollinations Text API
        const promptText = `Gere 5 títulos de vídeo do YouTube virais e intrigantes para o tópico: "${topic}". 
      Idioma: ${language || 'pt-BR'}.
      REGRAS CRÍTICAS: 
      1. Grafia 100% CORRETA e gramática impecável.
      2. Sem erros de digitação.
      3. Use ganchos de alta retenção.
      4. Retorne APENAS um JSON Array de strings, sem markdown.
      Exemplo: ["Titulo 1", "Titulo 2"]`;

        const response = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptText)}?model=openai`);
        const text = await response.text();

        // Clean markdown code blocks if present
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();

        // Ensure it's a valid JSON array
        let data = [];
        try {
            data = JSON.parse(cleanText);
        } catch (e) {
            console.error("JSON Parse Error:", e);
            // Fallback: try to extract array-like structure
            const match = cleanText.match(/\[.*\]/s);
            if (match) {
                data = JSON.parse(match[0]);
            } else {
                data = [cleanText]; // Fallback to raw text as single item
            }
        }

        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to generate titles' }), { status: 500 });
    }
}
