
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

        if (!process.env.GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: 'GEMINI_API_KEY not configured' }), { status: 500 });
        }

        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

        // 1. ENHANCE PROMPT (Make it "YouTube Style")
<<<<<<< HEAD
        // We use a fast text model for this.
        const enhancementModel = ai.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const enhancementPrompt = `
=======
        // 1. ENHANCE PROMPT (Make it "YouTube Style")
        // We use a fast text model for this.
        const enhancementRes = await ai.models.generateContent({
            model: 'gemini-1.5-flash',
            contents: `
>>>>>>> 2f43193 (1)
        You are an expert YouTube Thumbnail Designer. 
         rewrite the following user prompt into a high-quality image generation prompt for a viral YouTube thumbnail.
        
        Rules:
        - Make it high contrast, vibrant, and eye-catching (4k, ultra detailed).
        - Focus on facial expressions (shocked, happy, curious) if people are involved.
        - Add lighting effects (neon, rim lighting, dramatic shadows).
        - Keep the subject clear and center.
        - Output ONLY the raw prompt text, no explanations.

        User Prompt: "${userPrompt}"
<<<<<<< HEAD
        `;

        const enhancementRes = await enhancementModel.generateContent(enhancementPrompt);
        const enhancedPrompt = enhancementRes.response.text();
=======
        `
        });
        
        const enhancedPrompt = enhancementRes.text() || userPrompt;
>>>>>>> 2f43193 (1)

        console.log("Enhanced Prompt:", enhancedPrompt); // For debugging in Vercel logs

        // 2. GENERATE IMAGE
        // We use the Imagen 3 model (via Gemini API) for high quality images.
        // Note: Check available models. 'imagen-3.0-generate-001' is common for this.
<<<<<<< HEAD
        const imageModel = ai.getGenerativeModel({ model: 'imagen-3.0-generate-001' });

        const imageRes = await imageModel.generateContent({
            contents: [{ parts: [{ text: enhancedPrompt }] }],
        });

        const part = imageRes.response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
=======
        const imageRes = await ai.models.generateContent({
            model: 'imagen-3.0-generate-001',
            contents: { parts: [{ text: enhancedPrompt }] },
        });

        const part = imageRes.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
>>>>>>> 2f43193 (1)

        if (part?.inlineData) {
            return new Response(JSON.stringify({
                imageUrl: `data:image/png;base64,${part.inlineData.data}`,
                enhancedPrompt: enhancedPrompt // Sending back so user can see it
            }), {
                headers: { 'Content-Type': 'application/json' },
            });
        } else {
            console.error("No image data in response:", JSON.stringify(imageRes));
            return new Response(JSON.stringify({ error: 'No image generated' }), { status: 500 });
        }

    } catch (error: any) {
        console.error("API Error:", error);
        return new Response(JSON.stringify({ error: error.message || 'Failed to generate thumbnail' }), { status: 500 });
    }
}
