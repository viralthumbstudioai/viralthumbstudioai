
import { GoogleGenAI } from "@google/genai";

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        const { prompt: userPrompt, aspectRatio } = await req.json();

        // 1. ENHANCE PROMPT (Make it "YouTube Style")
        let enhancedPrompt = userPrompt;

        // Strategy: Try Gemini 2.0 Flash -> Pollinations -> Raw Prompt
        try {
            // A. Try Gemini
            const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
            const enhancementRes = await ai.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: `
                You are an expert YouTube Thumbnail Designer. 
                rewrite the following user prompt into a high-quality image generation prompt for a viral YouTube thumbnail.
                ... (keep rules same) ...
                User Prompt: "${userPrompt}"
                `
            });
            const text = enhancementRes.text; // Access as property, not function
            if (text) enhancedPrompt = text.trim();
        } catch (geminiError) {
            console.error("Gemini Enhancement Failed, trying Pollinations...", geminiError);

            // B. Try Pollinations
            try {
                const promptText = `Rewrite this prompt for a viral YouTube thumbnail (high contrast, 8k, detailed): "${userPrompt}"`;
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), 4000);

                const enhancementRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptText)}?model=openai`, {
                    signal: controller.signal
                });
                clearTimeout(timeoutId);

                if (enhancementRes.ok) {
                    const text = await enhancementRes.text();
                    if (text && text.length > 10) enhancedPrompt = text.trim();
                }
            } catch (pollinationsError) {
                console.error("All enhancement failed, using raw prompt.", pollinationsError);
            }
        }

        console.log("Final Prompt:", enhancedPrompt);

        // 2. GENERATE IMAGE (POLLINATIONS.AI - FREE & UNLIMTED)
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        let width = 1920;
        let height = 1080;

        if (aspectRatio === '9:16') { width = 1080; height = 1920; }
        else if (aspectRatio === '1:1') { width = 1080; height = 1080; }

        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&seed=${Math.floor(Math.random() * 1000)}`;

        return new Response(JSON.stringify({
            imageUrl: imageUrl, // Direct URL to image
            enhancedPrompt: enhancedPrompt
        }), {
            headers: { 'Content-Type': 'application/json' },
        });

    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate thumbnail' }), { status: 500 });
    }
}
