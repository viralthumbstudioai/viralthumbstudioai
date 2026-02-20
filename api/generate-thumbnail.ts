
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
        // We use Pollinations Text API (OpenAI compatible model) for this.
        const promptText = `
        You are an expert YouTube Thumbnail Designer. 
         rewrite the following user prompt into a high-quality image generation prompt for a viral YouTube thumbnail.
        
        Rules:
        - Make it high contrast, vibrant, and eye-catching (4k, ultra detailed).
        - Focus on facial expressions (shocked, happy, curious) if people are involved.
        - Add lighting effects (neon, rim lighting, dramatic shadows).
        - Keep the subject clear and center.
        - Output ONLY the raw prompt text, no explanations.

        User Prompt: "${userPrompt}"
        `;

        const enhancementRes = await fetch(`https://text.pollinations.ai/${encodeURIComponent(promptText)}?model=openai`);
        const enhancedPrompt = await enhancementRes.text();

        console.log("Enhanced Prompt:", enhancedPrompt); // For debugging in Vercel logs

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
