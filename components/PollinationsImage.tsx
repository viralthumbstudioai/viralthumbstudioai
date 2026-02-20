
import React, { useState, useEffect } from 'react';

interface PollinationsImageProps {
    prompt: string;
    width: number;
    height: number;
    className?: string;
    alt: string;
    nologo?: boolean;
    seed?: number;
    onImageLoaded?: (url: string) => void;
    onImageError?: () => void;
}

const MODELS = ['flux', 'turbo', 'osm']; // Priority: Quality -> Speed -> Fallback

const PollinationsImage: React.FC<PollinationsImageProps> = ({
    prompt,
    width,
    height,
    className,
    alt,
    nologo = true,
    seed
}) => {
    // Stabilize seed: use prop if provided, otherwise generate ONCE and keep it.
    const [stableSeed] = useState(seed || Math.floor(Math.random() * 1000));

    const [currentModelIndex, setCurrentModelIndex] = useState(0);
    const [imgUrl, setImgUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);

    useEffect(() => {
        // Reset state when prompt changes (but NOT when parent re-renders)
        setCurrentModelIndex(0);
        setHasError(false);
        setIsLoading(true);
        generateUrl(0);
    }, [prompt, width, height, stableSeed]);

    const generateUrl = (modelIndex: number) => {
        const model = MODELS[modelIndex];
        // Clean prompt to avoid URL breaking characters
        const safePrompt = encodeURIComponent(prompt.slice(0, 200).replace(/[^a-zA-Z0-9 ]/g, ""));
        const url = `https://image.pollinations.ai/prompt/${safePrompt}?width=${width}&height=${height}&model=${model}&nologo=${nologo}&seed=${stableSeed}&t=${Date.now()}`;
        setImgUrl(url);
    };

    const handleError = () => {
        console.warn(`Image load failed for model ${MODELS[currentModelIndex]}. Retrying...`);

        if (currentModelIndex < MODELS.length - 1) {
            // Try next model
            const nextIndex = currentModelIndex + 1;
            setCurrentModelIndex(nextIndex);
            setIsLoading(true);
            setTimeout(() => generateUrl(nextIndex), 500); // Small delay before retry
        } else {
            // All models failed
            setHasError(true);
            setIsLoading(false);
            if (onImageError) onImageError();
        }
    };

    const handleLoad = () => {
        setIsLoading(false);
        if (onImageLoaded) onImageLoaded(imgUrl);
    };

    return (
        <div className={`relative overflow-hidden bg-black ${className}`}>
            {!hasError && (
                <img
                    src={imgUrl}
                    alt={alt}
                    className={`w-full h-full object-cover transition-opacity duration-500 ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                    onError={handleError}
                    onLoad={handleLoad}
                    referrerPolicy="no-referrer"
                    id={`pollination-img-${seed}`}
                />
            )}

            {/* Loading State - Pulse */}
            {isLoading && !hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-900/80 backdrop-blur-sm z-10">
                    <div className="text-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                        <p className="text-[10px] text-white/50 uppercase tracking-widest">
                            {currentModelIndex === 0 ? 'Renderizando Flux...' : 'Otimizando...'}
                        </p>
                    </div>
                </div>
            )}

            {/* Error State */}
            {hasError && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-900/20 z-20">
                    <div className="text-center p-4 border border-red-500/30 rounded-xl bg-black/50 backdrop-blur-md">
                        <span className="material-symbols-outlined text-red-500 text-3xl mb-2">broken_image</span>
                        <p className="text-white text-xs font-bold uppercase">Falha na Geração</p>
                        <button
                            onClick={() => { setCurrentModelIndex(0); generateUrl(0); }}
                            className="mt-3 text-[10px] bg-red-500/20 hover:bg-red-500/40 text-white px-3 py-1 rounded transition-colors uppercase"
                        >
                            Tentar Novamente
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default PollinationsImage;
