'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface ChitboxLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showTagline?: boolean;
  className?: string;
  textClassName?: string;
  taglineClassName?: string;
}

export function ChitboxLogo({ 
  size = 'md', 
  showText = true, 
  showTagline = false,
  className,
  textClassName,
  taglineClassName 
}: ChitboxLogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', tagline: 'text-xs' },
    md: { icon: 'w-8 h-8', text: 'text-xl', tagline: 'text-sm' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', tagline: 'text-base' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl', tagline: 'text-lg' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Logo Icon - Envelope with Circuit Board */}
      <div className={cn(
        "relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg",
        currentSize.icon
      )}>
        {/* Envelope outline */}
        <div className="absolute inset-1 border-2 border-white rounded-lg">
          {/* Circuit board pattern inside envelope */}
          <div className="absolute inset-2 bg-blue-500 rounded opacity-80">
            {/* Circuit lines */}
            <div className="absolute top-1 left-1 w-2 h-0.5 bg-white rounded"></div>
            <div className="absolute top-1 right-1 w-2 h-0.5 bg-white rounded"></div>
            <div className="absolute top-2 left-2 w-1 h-0.5 bg-white rounded"></div>
            <div className="absolute top-3 left-1 w-3 h-0.5 bg-white rounded"></div>
            <div className="absolute top-3 right-2 w-1 h-0.5 bg-white rounded"></div>
            
            {/* Circuit nodes */}
            <div className="absolute top-1 left-1 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute top-1 right-1 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute top-2 left-2 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute top-3 left-1 w-0.5 h-0.5 bg-white rounded-full"></div>
            <div className="absolute top-3 right-2 w-0.5 h-0.5 bg-white rounded-full"></div>
          </div>
        </div>
        
        {/* Glowing effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 rounded-xl opacity-20 animate-pulse"></div>
      </div>

      {/* Text and Tagline */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
            currentSize.text,
            textClassName
          )}>
            ChitBox
          </span>
          {showTagline && (
            <span className={cn(
              "text-slate-400 font-medium",
              currentSize.tagline,
              taglineClassName
            )}>
              AI MAIL SERVER
            </span>
          )}
        </div>
      )}
    </div>
  );
}

// Alternative logo component with more detailed design
export function ChitboxLogoDetailed({ 
  size = 'md', 
  showText = true, 
  showTagline = false,
  className,
  textClassName,
  taglineClassName 
}: ChitboxLogoProps) {
  const sizeClasses = {
    sm: { icon: 'w-6 h-6', text: 'text-lg', tagline: 'text-xs' },
    md: { icon: 'w-8 h-8', text: 'text-xl', tagline: 'text-sm' },
    lg: { icon: 'w-10 h-10', text: 'text-2xl', tagline: 'text-base' },
    xl: { icon: 'w-12 h-12', text: 'text-3xl', tagline: 'text-lg' }
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("flex items-center space-x-2", className)}>
      {/* Logo Icon - More detailed envelope design */}
      <div className={cn(
        "relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg overflow-hidden",
        currentSize.icon
      )}>
        {/* Background glow */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-purple-400 opacity-30 animate-pulse"></div>
        
        {/* Envelope design */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Mail icon with circuit pattern */}
          <svg 
            className="w-3/4 h-3/4 text-white" 
            viewBox="0 0 24 24" 
            fill="none" 
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Envelope outline */}
            <path 
              d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              fill="none"
            />
            {/* Envelope flap */}
            <path 
              d="M4 8l8 5 8-5" 
              stroke="currentColor" 
              strokeWidth="1.5" 
              fill="none"
            />
            {/* Circuit board lines inside */}
            <path 
              d="M6 10h4M6 12h3M6 14h5" 
              stroke="currentColor" 
              strokeWidth="0.8" 
              opacity="0.6"
            />
            {/* Circuit nodes */}
            <circle cx="7" cy="10" r="0.5" fill="currentColor" opacity="0.8"/>
            <circle cx="8" cy="12" r="0.5" fill="currentColor" opacity="0.8"/>
            <circle cx="9" cy="14" r="0.5" fill="currentColor" opacity="0.8"/>
          </svg>
        </div>
      </div>

      {/* Text and Tagline */}
      {showText && (
        <div className="flex flex-col">
          <span className={cn(
            "font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent",
            currentSize.text,
            textClassName
          )}>
            ChitBox
          </span>
          {showTagline && (
            <span className={cn(
              "text-slate-400 font-medium",
              currentSize.tagline,
              taglineClassName
            )}>
              AI MAIL SERVER
            </span>
          )}
        </div>
      )}
    </div>
  );
}
