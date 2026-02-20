
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

        const response = await ai.models.generateContent({
            model: "gemini-pro", // Switched to gemini-pro (stable)
            contents: `Gere 5 títulos de vídeo do YouTube virais e intrigantes para o tópico: "${topic}". 
      Idioma: ${language || 'pt-BR'}.
      REGRAS CRÍTICAS: 
      1. Grafia 100% CORRETA e gramática impecável.
      2. Sem erros de digitação.
      3. Use ganchos de alta retenção.
      Retorne apenas um array JSON de strings.`,
            config: {
                responseMimeType: "application/json",
                responseSchema: {
                    type: Type.ARRAY,
                    items: { type: Type.STRING }
                }
            },
        });

        const data = JSON.parse(response.text || '[]');
        return new Response(JSON.stringify(data), {
            headers: { 'Content-Type': 'application/json' },
        });
    } catch (error) {
        console.error(error);
        return new Response(JSON.stringify({ error: 'Failed to generate titles' }), { status: 500 });
    }
}
