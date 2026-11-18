import React, { useState } from 'react';
import { Building2 } from 'lucide-react';
import { cn } from '@/src/lib/utils';

interface ResilientImageProps {
  src: string;
  alt: string;
  className?: string;
  fallbackLabel?: string;
}

export function ResilientImage({ src, alt, className, fallbackLabel }: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={cn(
          'flex flex-col items-center justify-center bg-slate-100 text-slate-500 border border-slate-200',
          className
        )}
      >
        <Building2 className="h-6 w-6 mb-1 text-slate-400" />
        <span className="text-xs font-medium px-2 text-center truncate max-w-full">
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
      onError={() => setFailed(true)}
      className={cn('object-cover', className)}
    />
  );
}
