import { GoogleGenAI } from "@google/genai";

export const config = {
    runtime: 'nodejs', // Switch to Node.js for better stability
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const { prompt: userPrompt, aspectRatio } = req.body;
    let finalImageUrl = 'https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=1200&auto=format&fit=crop'; // Default fallback

    try {
        console.log("Processing Request:", userPrompt);

        // 1. Try Google Gemini Generation
        try {
            const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;
            if (!apiKey) throw new Error("Missing API Key");

            const googleAI = new GoogleGenAI({ apiKey });

            // Use 'gemini-2.0-flash' which is generally available and supports images
            const imageResponse = await googleAI.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: {
                    parts: [{ text: `YouTube thumbnail background: ${userPrompt}. Cinematic, high quality, 8k, detailed, NO TEXT.` }]
                },
                config: {
                    imageConfig: {
                        aspectRatio: aspectRatio === '9:16' ? '9:16' : aspectRatio === '1:1' ? '1:1' : '16:9',
                        sampleCount: 1
                    }
                }
            });

            const part = imageResponse.candidates?.[0]?.content?.parts?.find(p => p.inlineData);
            if (part?.inlineData?.data) {
                finalImageUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
            } else {
                throw new Error("No image data in Google AI response");
            }

        } catch (aiError) {
            console.error("Google AI Generation Failed, switching to Unsplash:", aiError);

            // 2. Smart Fallback: Search Unsplash for relevant keywords
            try {
                // Extract keywords (simple split)
                const keywords = userPrompt.split(' ').slice(0, 3).join(',');
                const orientation = aspectRatio === '9:16' ? 'portrait' : aspectRatio === '1:1' ? 'squarish' : 'landscape';
                const unsplashRes = await fetch(`https://source.unsplash.com/1280x720/?${encodeURIComponent(keywords)}`);

                // Note: source.unsplash.com redirects to the image URL.
                // If it fails, existing fallback stands.
                if (unsplashRes.ok && unsplashRes.url) {
                    finalImageUrl = unsplashRes.url;
                }
            } catch (unsplashError) {
                console.error("Unsplash Fallback Failed:", unsplashError);
            }
        }

        return res.status(200).json({ imageUrl: finalImageUrl, prompt: userPrompt });

    } catch (error) {
        console.error("Critical API Error:", error);
        // Even on critical error, return a valid JSON with fallback image to prevent client crash
        return res.status(200).json({
            imageUrl: finalImageUrl,
            prompt: userPrompt,
            error: 'Generated with fallback due to system error'
        });
    }
}
