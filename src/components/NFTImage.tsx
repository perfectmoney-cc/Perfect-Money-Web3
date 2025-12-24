import { useState, useEffect, useRef } from "react";
import { Package, ImageOff } from "lucide-react";
import { ipfsToHttp } from "@/utils/ipfsService";

interface NFTImageProps {
  src?: string | null;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  lazy?: boolean;
}

export function NFTImage({ 
  src, 
  alt, 
  className = "w-full h-full object-cover", 
  fallbackClassName = "h-16 w-16 text-muted-foreground",
  lazy = true 
}: NFTImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isInView, setIsInView] = useState(!lazy);
  const containerRef = useRef<HTMLDivElement>(null);

  // Convert IPFS URI to HTTP gateway URL
  const imageUrl = src ? ipfsToHttp(src) : null;

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!lazy || !containerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsInView(true);
            observer.disconnect();
          }
        });
      },
      {
        rootMargin: "100px", // Start loading 100px before entering viewport
        threshold: 0.01
      }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [lazy]);

  // Reset states when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoading(true);
  }, [src]);

  if (!imageUrl || hasError) {
    return (
      <div ref={containerRef} className="w-full h-full flex items-center justify-center bg-muted/30">
        {hasError ? (
          <ImageOff className={fallbackClassName} />
        ) : (
          <Package className={fallbackClassName} />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/30 animate-pulse">
          <Package className={fallbackClassName} />
        </div>
      )}
      {isInView && (
        <img
          src={imageUrl}
          alt={alt}
          loading="lazy"
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setHasError(true);
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
}
