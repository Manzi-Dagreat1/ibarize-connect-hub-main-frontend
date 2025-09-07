import React, { useState } from 'react';
import { Play, Image as ImageIcon, AlertCircle, Loader2 } from 'lucide-react';
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { Badge } from '@/components/ui/badge';

interface MediaGalleryProps {
  images: string[];
  videos: string[];
  title: string;
  className?: string;
}

const MediaGallery: React.FC<MediaGalleryProps> = ({ images, videos, title, className = '' }) => {
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>({});
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({});

  // Combine images and videos into a single media array
  const mediaItems = [
    ...images.map(url => ({ type: 'image' as const, url })),
    ...videos.map(url => ({ type: 'video' as const, url }))
  ];

  const handleMediaLoad = (url: string) => {
    setLoadingStates(prev => ({ ...prev, [url]: false }));
  };

  const handleMediaError = (url: string) => {
    setLoadingStates(prev => ({ ...prev, [url]: false }));
    setErrorStates(prev => ({ ...prev, [url]: true }));
  };

  const handleMediaLoadStart = (url: string) => {
    setLoadingStates(prev => ({ ...prev, [url]: true }));
    setErrorStates(prev => ({ ...prev, [url]: false }));
  };

  if (mediaItems.length === 0) {
    return (
      <div className={`w-full h-64 bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center text-muted-foreground">
          <ImageIcon className="h-12 w-12 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No media available</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      <Carousel className="w-full">
        <CarouselContent>
          {mediaItems.map((item, index) => (
            <CarouselItem key={`${item.type}-${item.url}-${index}`}>
              <div className="relative w-full h-64 bg-muted rounded-lg overflow-hidden">
                {loadingStates[item.url] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  </div>
                )}

                {errorStates[item.url] ? (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted">
                    <div className="text-center text-muted-foreground">
                      <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
                      <p className="text-sm">Failed to load media</p>
                    </div>
                  </div>
                ) : (
                  <>
                    {item.type === 'image' ? (
                      <img
                        src={`http://localhost:3001${item.url}`}
                        alt={`${title} - Image ${index + 1}`}
                        className="w-full h-full object-cover"
                        onLoad={() => handleMediaLoad(item.url)}
                        onError={() => handleMediaError(item.url)}
                        onLoadStart={() => handleMediaLoadStart(item.url)}
                      />
                    ) : (
                      <video
                        src={`http://localhost:3001${item.url}`}
                        className="w-full h-full object-cover"
                        controls
                        preload="metadata"
                        onLoadedData={() => handleMediaLoad(item.url)}
                        onError={() => handleMediaError(item.url)}
                        onLoadStart={() => handleMediaLoadStart(item.url)}
                      >
                        <div className="absolute inset-0 flex items-center justify-center bg-muted">
                          <div className="text-center text-muted-foreground">
                            <Play className="h-8 w-8 mx-auto mb-2" />
                            <p className="text-sm">Video not supported</p>
                          </div>
                        </div>
                      </video>
                    )}

                    {/* Media type indicator */}
                    <div className="absolute top-2 left-2">
                      <Badge variant="secondary" className="bg-black/50 text-white border-0">
                        {item.type === 'image' ? (
                          <ImageIcon className="h-3 w-3 mr-1" />
                        ) : (
                          <Play className="h-3 w-3 mr-1" />
                        )}
                        {item.type}
                      </Badge>
                    </div>

                    {/* Media counter */}
                    {mediaItems.length > 1 && (
                      <div className="absolute top-2 right-2">
                        <Badge variant="secondary" className="bg-black/50 text-white border-0">
                          {index + 1} / {mediaItems.length}
                        </Badge>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>

        {mediaItems.length > 1 && (
          <>
            <CarouselPrevious className="left-2 bg-black/50 border-0 hover:bg-black/70 text-white" />
            <CarouselNext className="right-2 bg-black/50 border-0 hover:bg-black/70 text-white" />
          </>
        )}
      </Carousel>
    </div>
  );
};

export default MediaGallery;
