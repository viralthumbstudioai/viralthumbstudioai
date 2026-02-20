
import { GoogleGenAI } from "@google/genai";

export const config = {
    runtime: 'edge',
};

export default async function handler(req: Request) {
    if (req.method !== 'POST') {
        return new Response('Method Not Allowed', { status: 405 });
    }

    try {
        // 1. ENHANCE PROMPT (Make it "YouTube Style")
        let enhancedPrompt = userPrompt;
        try {
            const promptText = `
            You are an expert YouTube Thumbnail Designer. 
             rewrite the following user prompt into a high-quality image generation prompt for a viral YouTube thumbnail.
            
            Rules:
            - Hyper-realistic and viral YouTube thumbnail style, high contrast, ultra-detailed 8k. 
            - A central charismatic subject with an intense, expressive facial expression (wide-eyed shock or a confident smirk). 
            - Sharp rim lighting and vibrant neon glows (electric blue, fiery orange, or toxic green) to separate the subject from the background. 
            - The background is a clean, cinematic environment related to the theme.
            - Dynamic composition with a shallow depth of field.
            - Output ONLY the raw prompt text, no explanations.

            User Prompt: "${userPrompt}"
            `;

            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 4000); // 4s timeout

            const enhancementRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptText)}?model=openai`, {
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (enhancementRes.ok) {
                const text = await enhancementRes.text();
                if (text && text.length > 10) enhancedPrompt = text.trim();
            }
        } catch (e) {
            console.error("Prompt Enhancement Failed (Using raw prompt):", e);
        }

        console.log("Final Prompt:", enhancedPrompt);

        // 2. GENERATE IMAGE (POLLINATIONS.AI - FREE & UNLIMTED)
        const encodedPrompt = encodeURIComponent(enhancedPrompt);
        let width = 1920;
        let height = 1080;

        if (aspectRatio === '9:16') { width = 1080; height = 1920; }
        else if (aspectRatio === '1:1') { width = 1080; height = 1080; }

        const imageUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=${width}&height=${height}&nologo=true&model=flux&seed=${Math.floor(Math.random() * 1000)}`;

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
