import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const SVG_WITH_BG = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Background Gradient -->
    <radialGradient id="bgGrad" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="#1E1B4B" />
      <stop offset="100%" stop-color="#09090B" />
    </radialGradient>
    
    <!-- Outer Glow -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- Inner Glow for Star -->
    <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- Gradients for Book pages -->
    <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>

    <!-- Gradient for Graduation Cap -->
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#312E81" />
    </linearGradient>

    <!-- Gradient for Star / Achievements -->
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- Ring Gradient -->
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C5CFF" />
      <stop offset="50%" stop-color="#A78BFA" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>

  <!-- Background for Launcher Icon -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />

  <!-- Outer Progress Ring (Gamification / Progress Spirit) -->
  <circle cx="256" cy="256" r="190" fill="none" stroke="#27272A" stroke-width="16" opacity="0.3" />
  <path d="M 256,66 A 190,190 0 1,1 121,390" fill="none" stroke="url(#ringGrad)" stroke-width="16" stroke-linecap="round" filter="url(#glow)" />

  <!-- The Learning OS Open Book / Platform Base -->
  <g transform="translate(0, 30)">
    <!-- Left page -->
    <path d="M 256,330 C 210,290 140,290 90,310 L 90,200 C 140,180 210,180 256,220 Z" fill="url(#bookGrad)" opacity="0.95" />
    <!-- Right page -->
    <path d="M 256,330 C 302,290 372,290 422,310 L 422,200 C 372,180 302,180 256,220 Z" fill="url(#bookGrad)" opacity="0.95" />
    <!-- Book Spine -->
    <path d="M 256,220 L 256,332" stroke="#1E1B4B" stroke-width="6" stroke-linecap="round" />
    <!-- Glowing page lines to indicate study guidelines/code -->
    <path d="M 120,230 L 210,210 M 120,260 L 210,240 M 120,290 L 210,270" stroke="#E0E7FF" stroke-width="6" stroke-linecap="round" opacity="0.4" />
    <path d="M 392,230 L 302,210 M 392,260 L 302,240 M 392,290 L 302,270" stroke="#E0E7FF" stroke-width="6" stroke-linecap="round" opacity="0.4" />
  </g>

  <!-- Modern Graduation Cap (Semester Progression) nested above the book -->
  <g transform="translate(0, -20)" filter="url(#glow)">
    <!-- Cap Base / Skullcap under the diamond -->
    <path d="M 190,190 L 190,220 C 190,245 322,245 322,220 L 322,190 Z" fill="#1E1B4B" stroke="#312E81" stroke-width="4" />
    <!-- Cap Diamond top -->
    <path d="M 256,120 L 390,170 L 256,220 L 122,170 Z" fill="url(#capGrad)" stroke="#6366F1" stroke-width="4" stroke-linejoin="round" />
    <!-- Cap Tassel with emerald green token -->
    <path d="M 256,170 L 348,200 L 348,235" fill="none" stroke="#10B981" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
    <circle cx="348" cy="245" r="10" fill="#10B981" filter="url(#starGlow)" />
  </g>

  <!-- Floating Glowing Star of Achievement in the center -->
  <g transform="translate(256, 175) scale(1.1)" filter="url(#starGlow)">
    <path d="M 0,-30 L 9,-9 L 31,-9 L 13,5 L 20,27 L 0,14 L -20,27 L -13,5 L -31,-9 L -9,-9 Z" fill="url(#starGrad)" stroke="#34D399" stroke-width="2" />
  </g>
</svg>
`;

const SVG_FG_ONLY = `<?xml version="1.0" encoding="utf-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <!-- Outer Glow -->
    <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="10" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- Inner Glow for Star -->
    <filter id="starGlow" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="12" result="blur" />
      <feComposite in="SourceGraphic" in2="blur" operator="over" />
    </filter>

    <!-- Gradients for Book pages -->
    <linearGradient id="bookGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8B5CF6" />
      <stop offset="100%" stop-color="#6366F1" />
    </linearGradient>

    <!-- Gradient for Graduation Cap -->
    <linearGradient id="capGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#4F46E5" />
      <stop offset="100%" stop-color="#312E81" />
    </linearGradient>

    <!-- Gradient for Star / Achievements -->
    <linearGradient id="starGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#10B981" />
      <stop offset="100%" stop-color="#059669" />
    </linearGradient>

    <!-- Ring Gradient -->
    <linearGradient id="ringGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C5CFF" />
      <stop offset="50%" stop-color="#A78BFA" />
      <stop offset="100%" stop-color="#10B981" />
    </linearGradient>
  </defs>

  <!-- Scale contents to fit safe zone of adaptive launcher icons -->
  <g transform="translate(71.68, 71.68) scale(0.72)">
    <!-- Outer Progress Ring -->
    <circle cx="256" cy="256" r="190" fill="none" stroke="#27272A" stroke-width="16" opacity="0.3" />
    <path d="M 256,66 A 190,190 0 1,1 121,390" fill="none" stroke="url(#ringGrad)" stroke-width="16" stroke-linecap="round" filter="url(#glow)" />

    <!-- The Learning OS Open Book / Platform Base -->
    <g transform="translate(0, 30)">
      <!-- Left page -->
      <path d="M 256,330 C 210,290 140,290 90,310 L 90,200 C 140,180 210,180 256,220 Z" fill="url(#bookGrad)" opacity="0.95" />
      <!-- Right page -->
      <path d="M 256,330 C 302,290 372,290 422,310 L 422,200 C 372,180 302,180 256,220 Z" fill="url(#bookGrad)" opacity="0.95" />
      <!-- Book Spine -->
      <path d="M 256,220 L 256,332" stroke="#1E1B4B" stroke-width="6" stroke-linecap="round" />
      <!-- Glowing page lines -->
      <path d="M 120,230 L 210,210 M 120,260 L 210,240 M 120,290 L 210,270" stroke="#E0E7FF" stroke-width="6" stroke-linecap="round" opacity="0.4" />
      <path d="M 392,230 L 302,210 M 392,260 L 302,240 M 392,290 L 302,270" stroke="#E0E7FF" stroke-width="6" stroke-linecap="round" opacity="0.4" />
    </g>

    <!-- Modern Graduation Cap -->
    <g transform="translate(0, -20)" filter="url(#glow)">
      <path d="M 190,190 L 190,220 C 190,245 322,245 322,220 L 322,190 Z" fill="#1E1B4B" stroke="#312E81" stroke-width="4" />
      <path d="M 256,120 L 390,170 L 256,220 L 122,170 Z" fill="url(#capGrad)" stroke="#6366F1" stroke-width="4" stroke-linejoin="round" />
      <path d="M 256,170 L 348,200 L 348,235" fill="none" stroke="#10B981" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" />
      <circle cx="348" cy="245" r="10" fill="#10B981" filter="url(#starGlow)" />
    </g>

    <!-- Floating Glowing Star of Achievement -->
    <g transform="translate(256, 175) scale(1.1)" filter="url(#starGlow)">
      <path d="M 0,-30 L 9,-9 L 31,-9 L 13,5 L 20,27 L 0,14 L -20,27 L -13,5 L -31,-9 L -9,-9 Z" fill="url(#starGrad)" stroke="#34D399" stroke-width="2" />
    </g>
  </g>
</svg>
`;

const androidResDir = path.join(process.cwd(), 'android/app/src/main/res');

// Mipmap configurations
const mipmaps = [
  { dir: 'mipmap-mdpi', size: 48 },
  { dir: 'mipmap-hdpi', size: 72 },
  { dir: 'mipmap-xhdpi', size: 96 },
  { dir: 'mipmap-xxhdpi', size: 144 },
  { dir: 'mipmap-xxxhdpi', size: 192 },
];

// Helper to compile SVG to PNG using sharp
async function compilePng(svgString, destPng, size) {
  const dir = path.dirname(destPng);
  fs.mkdirSync(dir, { recursive: true });

  try {
    await sharp(Buffer.from(svgString))
      .resize(size, size)
      .png()
      .toFile(destPng);
    console.log(`Successfully generated: ${destPng} (${size}x${size})`);
  } catch (err) {
    console.error(`Error compiling SVG to PNG (${destPng}):`, err.message);
  }
}

async function run() {
  console.log('Generating Android Launcher Icons...');
  for (const mm of mipmaps) {
    // 1. Regular icon (with background)
    const destIcon = path.join(androidResDir, mm.dir, 'ic_launcher.png');
    await compilePng(SVG_WITH_BG, destIcon, mm.size);

    // 2. Round icon (with background)
    const destRound = path.join(androidResDir, mm.dir, 'ic_launcher_round.png');
    await compilePng(SVG_WITH_BG, destRound, mm.size);

    // 3. Foreground adaptive icon (transparent background, scaled-down logo content)
    const destFg = path.join(androidResDir, mm.dir, 'ic_launcher_foreground.png');
    await compilePng(SVG_FG_ONLY, destFg, mm.size);
  }

  console.log('Generating Web Application Icons...');
  const publicDir = path.join(process.cwd(), 'public');
  fs.mkdirSync(publicDir, { recursive: true });

  await compilePng(SVG_WITH_BG, path.join(publicDir, 'logo.png'), 512);
  await compilePng(SVG_WITH_BG, path.join(publicDir, 'favicon.png'), 64);
  await compilePng(SVG_WITH_BG, path.join(publicDir, 'favicon.ico'), 32);

  // Also write copies to src/assets for imports if any
  const srcAssetsDir = path.join(process.cwd(), 'src/assets');
  fs.mkdirSync(srcAssetsDir, { recursive: true });
  fs.writeFileSync(path.join(srcAssetsDir, 'logo.svg'), SVG_WITH_BG);
  await compilePng(SVG_WITH_BG, path.join(srcAssetsDir, 'logo.png'), 512);

  console.log('--- ALL ASSETS GENERATED SUCCESSFULLY ---');
}

run().catch(err => {
  console.error('Fatal error running asset generator:', err);
});
