import React, { useState, useEffect } from 'react';

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

            try {
                // Determine aspect ratio
                let ratio = '16:9';
                if (width === height) ratio = '1:1';
                else if (height > width) ratio = '9:16';

                const res = await fetch('/api/generate-thumbnail', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ prompt, aspectRatio: ratio })
                });

                if (!res.ok) throw new Error('Generation failed');

                const data = await res.json();
                if (data.imageUrl && isMounted) {
                    setImgUrl(data.imageUrl);
                    if (onImageLoaded) onImageLoaded(data.imageUrl);
                } else {
                    throw new Error('No image URL returned');
                }
            } catch (error) {
                console.error("AI Image Generation Failed:", error);
                if (isMounted) {
                    setHasError(true);
                    // Fallback to placeholder if API fails
                    const fallbackUrl = 'https://images.unsplash.com/photo-1626544827763-d516dce335ca?q=80&w=1200&auto=format&fit=crop';
                    setImgUrl(fallbackUrl);
                    if (onImageLoaded) onImageLoaded(fallbackUrl);
                    if (onImageError) onImageError();
                }
            } finally {
                if (isMounted) setIsLoading(false);
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
