
import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";

interface AIImageProps {
    prompt: string;
    width: number;
    height: number;
    className?: string;
    alt: string;
    onImageLoaded?: (url: string) => void;
    onImageError?: () => void;
}

const AIImage: React.FC<AIImageProps> = ({
    prompt,
    width,
    height,
    className,
    alt,
    onImageLoaded,
    onImageError
}) => {
    const [imgUrl, setImgUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        let isMounted = true;

        const generateImage = async () => {
            setIsLoading(true);
            setHasError(false);

            // Fallback immediately if no key
            const apiKey = import.meta.env.VITE_GEMINI_API_KEY || (process.env as any).GEMINI_API_KEY || (process.env as any).API_KEY;
            if (!apiKey) {
                console.error("Missing API Key for Image Generation");
                handleError("Missing API Key");
                return;
            }

            try {
                // Determine aspect ratio for Google GenAI
                let ratio = '16:9';
                if (width === height) ratio = '1:1';
                else if (height > width) ratio = '9:16';

                // Initialize Google GenAI Client
                const ai = new GoogleGenAI({ apiKey });

                // Call Google GenAI Image Model (Client-Side)
                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash', // Using standard Flash model which supports image gen
                    contents: {
                        parts: [{ text: `YouTube thumbnail background: ${prompt}. Cinematic, high quality, 8k, detailed, NO TEXT.` }]
                    },
                    config: {
                        imageConfig: {
                            aspectRatio: ratio as any,
                            sampleCount: 1
                        }
                    }
                });

                // Extract Base64 Image
                const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);

                if (isMounted && part?.inlineData?.data) {
                    const generatedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                    setImgUrl(generatedUrl);
                    if (onImageLoaded) onImageLoaded(generatedUrl);
                    setIsLoading(false);
                } else {
                    throw new Error("No image data returned from Google AI");
                }

            } catch (error) {
                console.error("Client-Side AI Image Gen Failed:", error);
                if (isMounted) handleError(error);
            }
        };

        const handleError = (error: any) => {
            setHasError(true);
            setIsLoading(false);

            // Smart Fallback using Unsplash Source (Relevant Keywords)
            try {
                const keywords = prompt.split(' ').slice(0, 3).join(',');
                const fallbackUrl = `https://source.unsplash.com/1280x720/?${encodeURIComponent(keywords)}`;
                // Note: unsplash source redirects, so we use it directly as src
                setImgUrl(fallbackUrl);
                if (onImageLoaded) onImageLoaded(fallbackUrl);
                if (onImageError) onImageError();
            } catch (e) {
                // Absolute Last Resort
                const staticFallback = 'https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=1200&auto=format&fit=crop';
                setImgUrl(staticFallback);
                if (onImageLoaded) onImageLoaded(staticFallback);
            }
        };

        generateImage();

        return () => { isMounted = false; };
    }, [prompt, width, height]);

    return (
        <div className={`relative overflow-hidden bg-black ${className}`}>
            {!isLoading && (
                <img
                    src={imgUrl}
                    alt={alt}
                    className="w-full h-full object-cover transition-opacity duration-500"
                    referrerPolicy="no-referrer"
                    onError={() => {
                        // Final DOM-level fallback if even Unsplash source fails (e.g. 404)
                        if (!imgUrl.includes('photo-1626544827763')) {
                            const staticFallback = 'https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=1200&auto=format&fit=crop';
                            setImgUrl(staticFallback);
                        }
                    }}
                />
            )}

            {/* Loading State - Pulse */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest">
                            Gerando Visual...
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIImage;
