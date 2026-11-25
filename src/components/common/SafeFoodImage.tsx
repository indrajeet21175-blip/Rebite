import React, { useState } from 'react';
import { Utensils } from 'lucide-react';

interface SafeFoodImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export const SafeFoodImage: React.FC<SafeFoodImageProps> = ({
  src,
  alt,
  className = 'w-full h-48 object-cover',
  fallbackLabel,
}) => {
  const [hasError, setHasError] = useState(false);

  if (hasError || !src) {
    return (
      <div
        className={`flex flex-col items-center justify-center bg-gradient-to-br from-[#14532D] to-[#16A34A] text-white p-4 text-center ${className}`}
        role="img"
        aria-label={alt}
      >
        <Utensils className="w-8 h-8 mb-2 opacity-90" />
        <span className="text-xs font-medium tracking-tight line-clamp-2 max-w-[200px]">
          {fallbackLabel || alt}
        </span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setHasError(true)}
      className={className}
    />
  );
};
