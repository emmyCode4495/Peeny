# Peeny – AI Video & Animation Platform for African Creators

Mobile-first Progressive Web App built for the Colosseum Crypto World's Fair hackathon.

## Vision

Peeny is a social + creator economy platform where users:

- Watch AI videos in a **TikTok-style full-screen feed**
- Visit a creator’s profile to see their full series / catalogue
- Upload AI-generated videos & animations
- Earn in local currency (NGN first) based on views & engagement
- Create new content inside **Genny Studio** using credits
- Pay and get paid via **Solana** (USDC / SOL)
- Get verified to unlock higher earnings and wider reach

## Current Status (Hackathon MVP)

### Working pages
- **Feed** (`/`) – Full-screen vertical swipe (TikTok-style). Swipe up/down or use mouse wheel. Tap creator to open profile for full series.
- **Genny Studio** (`/studio`) – Text-to-video, Image-to-video, Full Narrative Scene, Voice modes + credit packs
- **Upload** (`/upload`) – Drag & drop + metadata + category
- **Wallet** (`/wallet`) – Balance (NGN), Credits, Solana connect placeholder, credit packs, verification upsell
- **Profile** (`/profile`) – Creator stats, videos grid, tier badge (series view)

### Tech Stack
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS v4
- Lucide icons
- Mobile-first PWA-ready layout
- Solana wallet integration (next step)

## Getting Started

```bash
cd aether   # folder name still aether for now
npm install
npm install lucide-react --legacy-peer-deps
npm run dev
```

Open http://localhost:3000 on your phone or browser.

**Feed controls**
- Mobile: swipe up = next video, swipe down = previous
- Desktop: mouse wheel
- Tap avatar / @username → go to creator profile (full series)

## Next Steps (priority order)

1. Real video playback (replace thumbnail with actual `<video>`)
2. Solana wallet connection + Solana Pay for credit purchases
3. Real video upload
4. Genny Studio generation flow
5. Profile as proper series / catalogue view
6. PWA manifest + service worker

## Why this fits Colosseum

- Real consumer product focused on African creators
- Clear Solana payment + earnings rail
- Complete create → publish → earn loop
- Mobile-first TikTok-style experience (critical for the target market)

Built as a solo founder sprint for Crypto World's Fair 2026.
