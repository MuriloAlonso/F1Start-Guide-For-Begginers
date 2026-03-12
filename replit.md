# F1 Racing App

## Overview
A React + TypeScript + Vite frontend application for Formula 1 racing news, race countdowns, and related content.

## Tech Stack
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite 7
- **Styling**: Tailwind CSS with Radix UI components (shadcn/ui)
- **UI Components**: Radix UI, Lucide React icons, Recharts
- **Forms**: React Hook Form + Zod
- **Date Handling**: date-fns, react-day-picker

## Project Structure
```
src/
  App.tsx          - Main application component
  components/      - UI components (LanguageSelector, NewsFeed, RaceCountdown, ui/)
  contexts/        - React context providers
  hooks/           - Custom React hooks
  lib/             - Utility libraries
  services/        - API/data services
```

## News System
- Real RSS feeds fetched via `api.allorigins.win` CORS proxy
- Sources: BBC Sport F1, Motorsport.com, RaceFans
- Cache duration: 15 minutes (localStorage key: `f1_news_cache_v2`)
- Fallback: static hardcoded news if all feeds fail
- Only `src/services/newsApi.ts` was modified — all exports, interfaces, and hook signatures remain unchanged

## Development
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build`
- The Vite dev server is configured to use host `0.0.0.0` and port `5000`

## Deployment
- Target: Static site
- Build command: `npm run build`
- Public directory: `dist`
