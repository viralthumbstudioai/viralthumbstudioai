
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
    const [debugError, setDebugError] = useState('');

    useEffect(() => {
        let isMounted = true;
        let timeoutId: NodeJS.Timeout;

        const generateImage = async () => {
            setIsLoading(true);
            setDebugError('');

            // 1. ROBUST KEY RETRIEVAL
            const getKey = () => {
                if (typeof import.meta !== 'undefined' && import.meta.env) {
                    if (import.meta.env.VITE_GEMINI_API_KEY) return import.meta.env.VITE_GEMINI_API_KEY;
                    if (import.meta.env.VITE_API_KEY) return import.meta.env.VITE_API_KEY;
                }
                // Legacy/Process fallback
                try {
                    const pEnv = (process as any).env;
                    if (pEnv.GEMINI_API_KEY) return pEnv.GEMINI_API_KEY;
                    if (pEnv.API_KEY) return pEnv.API_KEY;
                } catch (e) { }
                return '';
            };

            const apiKey = getKey();

            if (!apiKey) {
                const msg = "CRITICAL: No API Key found in Environment (VITE_GEMINI_API_KEY)";
                console.error(msg);
                handleError(msg);
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
                console.log('Generating with key ending in: ...' + apiKey.slice(-4));
                const response = await ai.models.generateContent({
                    model: 'gemini-2.0-flash-exp', // Trying explictly experimental model from Editor
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

                if (isMounted) {
                    if (part?.inlineData?.data) {
                        const generatedUrl = `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
                        setImgUrl(generatedUrl);
                        if (onImageLoaded) onImageLoaded(generatedUrl);
                        setIsLoading(false);
                    } else {
                        throw new Error("API returned success but no image data.");
                    }
                }

            } catch (error: any) {
                console.error("Client-Side AI Generation Failed:", error);
                if (isMounted) handleError(error.message || JSON.stringify(error));
            }
        };

        const handleError = (msg: string) => {
            setDebugError(msg);
            // Wait a small delay before showing fallback to prevent flash if it was just a slow load
            setTimeout(() => {
                // STATIC FALLBACK (Reliable)
                const fallbackUrl = 'https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=1200&auto=format&fit=crop';
                setImgUrl(fallbackUrl);
                if (onImageLoaded) onImageLoaded(fallbackUrl);
                if (onImageError) onImageError();
                setIsLoading(false);
            }, 500);
        };

        // SAFETY TIMEOUT: If nothing happens in 10s, force fallback
        timeoutId = setTimeout(() => {
            if (isMounted && isLoading) {
                console.warn("Generation Timed Out - Forcing Fallback");
                handleError("Timeout (10s)");
            }
        }, 10000);

        generateImage();

        return () => {
            isMounted = false;
            clearTimeout(timeoutId);
        };
    }, [prompt, width, height]);

    return (
        <div className={`relative overflow-hidden bg-black ${className}`}>
            {!isLoading && imgUrl && (
                <img
                    src={imgUrl}
                    alt={alt}
                    className="w-full h-full object-cover transition-opacity duration-500"
                    referrerPolicy="no-referrer"
                    onError={() => handleError("DOM Image Load Error")}
                />
            )}

            {/* Loading State - Pulse */}
            {isLoading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10 transition-all duration-500">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                    <p className="text-[10px] text-white/50 uppercase tracking-widest animate-pulse">
                        Criando Visual IA...
                    </p>
                </div>
            )}

            {/* Dev Debug Overlay (Only visible if fails and hovering, or remove in prod) */}
            {debugError && (
                <div className="hidden absolute bottom-0 left-0 bg-red-900/80 text-white text-[8px] p-1 max-w-full truncate z-20">
                    Debug: {debugError}
                </div>
            )}
        </div>
    );
};

export default AIImage;
