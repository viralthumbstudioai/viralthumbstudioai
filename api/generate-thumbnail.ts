
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

        // 2. GENERATE IMAGE (GOOGLE IMAGEN)
        console.log("Generating image with Google GenAI...");
        // Re-instantiate AI for this scope to ensure availability
        const googleAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const imageResponse = await googleAI.models.generateContent({
            model: 'imagine-3-generation', // Using the latest available Imagen model or similar
            contents: {
                parts: [{ text: `YouTube thumbnail background: ${enhancedPrompt}. Cinematic, high quality, 8k, detailed, NO TEXT.` }]
            },
            config: {
                imageConfig: {
                    aspectRatio: aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9',
                    sampleCount: 1
                }
            }
        });

        // Extract Base64 Image
        const part = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
        if (!part?.inlineData?.data) {
            throw new Error("Failed to generate image with Google AI");
        }

        const imageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;

        return new Response(JSON.stringify({ imageUrl, prompt: enhancedPrompt }), {
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
    }
}
