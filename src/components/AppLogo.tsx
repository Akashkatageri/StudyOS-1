import React from 'react';

interface AppLogoProps {
  className?: string;
  size?: number | string;
  transparent?: boolean;
}

export default function AppLogo({ className = "w-full h-full", size, transparent = false }: AppLogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 512 512" 
      className={className}
      style={size ? { width: size, height: size } : undefined}
    >
      <defs>
        <linearGradient id="purple-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8B5CF6" />
          <stop offset="100%" stopColor="#6C63FF" />
        </linearGradient>
      </defs>
      {/* Premium Purple Gradient Background (can be bypassed for transparent layouts) */}
      {!transparent && <rect width="512" height="512" rx="112" fill="url(#purple-grad)" />}

      <g stroke="#ffffff" strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" fill="none">
        {/* Lightbulb */}
        {/* Bulb outline */}
        <path d="M 236,160 C 220,150 216,130 216,115 C 216,92 234,75 256,75 C 278,75 296,92 296,115 C 296,130 292,150 276,160" />
        {/* Bulb base threads */}
        <path d="M 238,162 L 274,162" />
        <path d="M 238,172 L 274,172" />
        <path d="M 244,182 L 268,182" />
        {/* Filament */}
        <path d="M 248,160 C 248,135 252,130 256,130 C 260,130 264,135 264,160" strokeWidth={8} />
        {/* Light rays */}
        <path d="M 256,58 L 256,42" />
        <path d="M 220,79 L 206,65" />
        <path d="M 292,79 L 306,65" />
        <path d="M 200,115 L 184,115" />
        <path d="M 312,115 L 328,115" />

        {/* Open Book */}
        {/* Spine */}
        <path d="M 256,210 L 256,290" />
        {/* Left page outline */}
        <path d="M 256,210 C 210,180 150,180 100,195 L 100,275 C 150,260 210,260 256,290" />
        {/* Right page outline */}
        <path d="M 256,210 C 302,180 362,180 412,195 L 412,275 C 362,260 302,260 256,290" />
        {/* Page text lines */}
        <path d="M 135,225 C 165,215 195,215 220,225" strokeWidth={8} />
        <path d="M 135,250 C 165,240 195,240 220,250" strokeWidth={8} />
        <path d="M 292,225 C 317,215 347,215 377,225" strokeWidth={8} />
        <path d="M 292,250 C 317,240 347,240 377,250" strokeWidth={8} />

        {/* Text StudyOS */}
        {/* S */}
        <path d="M 148,342 C 144,334 122,330 116,346 C 110,362 135,360 142,368 C 149,376 142,392 124,392 C 112,392 108,382 108,382" />
        {/* t */}
        <path d="M 168,330 L 168,380 C 168,390 176,390 184,382" />
        <path d="M 158,346 L 178,346" />
        {/* u */}
        <path d="M 198,348 L 198,376 C 198,386 214,386 214,376 L 214,348" />
        <path d="M 214,368 L 214,384 C 214,388 218,390 224,388" />
        {/* d */}
        <path d="M 250,366 C 250,352 234,352 234,366 C 234,380 250,380 250,366 Z" />
        <path d="M 250,330 L 250,384" />
        {/* y */}
        <path d="M 264,348 L 270,368 C 272,374 278,374 280,368 L 286,348" />
        <path d="M 280,368 L 274,394 C 268,414 252,414 242,404" />
        {/* O */}
        <path d="M 326,366 C 326,346 302,346 302,366 C 302,386 326,386 326,366 Z" />
        {/* S */}
        <path d="M 364,342 C 360,334 338,330 332,346 C 326,362 351,360 358,368 C 365,376 358,392 340,392 C 328,392 324,382 324,382" />

        {/* Underline Swoop */}
        <path d="M 178,412 C 240,404 300,404 356,410" />

        {/* Dots */}
        <circle cx={372} cy={412} r={6} fill="#ffffff" stroke="none" />
        <circle cx={388} cy={412} r={6} fill="#ffffff" stroke="none" />
        <circle cx={404} cy={412} r={8} fill="#ffffff" stroke="none" />
      </g>
    </svg>
  );
}
