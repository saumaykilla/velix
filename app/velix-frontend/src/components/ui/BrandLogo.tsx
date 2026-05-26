import React from 'react';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function BrandLogo({ className = '', size = 'md' }: BrandLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-12 h-12 text-lg',
    lg: 'w-16 h-16 text-xl',
  };

  return (
    <div className={`rounded-lg bg-surface-container flex items-center justify-center border border-primary-container/10 ${sizeClasses[size]} ${className}`}>
      <span className="font-headline-md font-bold text-primary tracking-tight">VX</span>
    </div>
  );
}

export default BrandLogo;
