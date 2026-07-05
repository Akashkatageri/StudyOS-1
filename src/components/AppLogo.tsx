import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number | string;
}

export default function AppLogo({ className = "w-full h-full", size }: AppLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        {/* Background Gradient */}
        <radialGradient id="logoBgGrad" cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="#1E1B4B" />
          <stop offset="100%" stopColor="#09090B" />
        </radialGradient>
        
        {/* Outer Glow */}
        <filter id="logoGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="10" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Inner Glow for Star */}
        <filter id="logoStarGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="12" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Gradients for Book pages */}
        <linearGradient id="logoBookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6366F1" />
        </linearGradient>

        {/* Gradient for Graduation Cap */}
        <linearGradient id="logoCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#4F46E5" />
          <stop offset="100%" stopColor="#312E81" />
        </linearGradient>

        {/* Gradient for Star / Achievements */}
        <linearGradient id="logoStarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>

        {/* Ring Gradient */}
        <linearGradient id="logoRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7C5CFF" />
          <stop offset="50%" stopColor="#A78BFA" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Background for Launcher Icon */}
      <rect width="512" height="512" rx="112" fill="url(#logoBgGrad)" />

      {/* Outer Progress Ring */}
      <circle cx="256" cy="256" r="190" fill="none" stroke="#27272A" strokeWidth="16" opacity="0.3" />
      <path d="M 256,66 A 190,190 0 1,1 121,390" fill="none" stroke="url(#logoRingGrad)" strokeWidth="16" strokeLinecap="round" filter="url(#logoGlow)" />

      {/* The Learning OS Open Book / Platform Base */}
      <g transform="translate(0, 30)">
        {/* Left page */}
        <path d="M 256,330 C 210,290 140,290 90,310 L 90,200 C 140,180 210,180 256,220 Z" fill="url(#logoBookGrad)" opacity="0.95" />
        {/* Right page */}
        <path d="M 256,330 C 302,290 372,290 422,310 L 422,200 C 372,180 302,180 256,220 Z" fill="url(#logoBookGrad)" opacity="0.95" />
        {/* Book Spine */}
        <path d="M 256,220 L 256,332" stroke="#1E1B4B" strokeWidth="6" strokeLinecap="round" />
        {/* Glowing page lines to indicate study guidelines/code */}
        <path d="M 120,230 L 210,210 M 120,260 L 210,240 M 120,290 L 210,270" stroke="#E0E7FF" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
        <path d="M 392,230 L 302,210 M 392,260 L 302,240 M 392,290 L 302,270" stroke="#E0E7FF" strokeWidth="6" strokeLinecap="round" opacity="0.4" />
      </g>

      {/* Modern Graduation Cap nested above the book */}
      <g transform="translate(0, -20)" filter="url(#logoGlow)">
        {/* Cap Base */}
        <path d="M 190,190 L 190,220 C 190,245 322,245 322,220 L 322,190 Z" fill="#1E1B4B" stroke="#312E81" strokeWidth="4" />
        {/* Cap Diamond top */}
        <path d="M 256,120 L 390,170 L 256,220 L 122,170 Z" fill="url(#logoCapGrad)" stroke="#6366F1" strokeWidth="4" strokeLinejoin="round" />
        {/* Cap Tassel */}
        <path d="M 256,170 L 348,200 L 348,235" fill="none" stroke="#10B981" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="348" cy="245" r="10" fill="#10B981" filter="url(#logoStarGlow)" />
      </g>

      {/* Floating Glowing Star of Achievement in the center */}
      <g transform="translate(256, 175) scale(1.1)" filter="url(#logoStarGlow)">
        <path d="M 0,-30 L 9,-9 L 31,-9 L 13,5 L 20,27 L 0,14 L -20,27 L -13,5 L -31,-9 L -9,-9 Z" fill="url(#logoStarGrad)" stroke="#34D399" strokeWidth="2" />
      </g>
    </svg>
  );
}
