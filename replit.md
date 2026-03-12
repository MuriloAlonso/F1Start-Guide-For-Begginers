# F1 Racing App

## Overview
A React + TypeScript + Vite frontend application for Formula 1 racing news, race countdowns, and related content. Fully bilingual (PT-BR / EN).

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
  App.tsx          - Main application component (all page sections)
  components/      - UI components (LanguageSelector, NewsFeed, RaceCountdown, ui/)
  contexts/        - React context providers (AppContext — language, translations)
  hooks/           - Custom React hooks (useAutoUpdate, use-mobile)
  lib/             - Utility libraries
  services/        - API/data services (newsApi, f1DataService)
```

## News System
- Real RSS feeds fetched via `api.allorigins.win` CORS proxy
- Sources: BBC Sport F1, Motorsport.com, RaceFans
- Cache duration: **30 minutes**, separate per language (`f1_news_cache_v4_pt` / `f1_news_cache_v4_en`)
- Feeds always fetched in English; when PT-BR is active, articles are auto-translated via MyMemory API (free, no key, native CORS)
- Translation is **sequential** (1 article at a time, title + summary in parallel = max 2 concurrent requests)
- Concurrent fetch guard: `isFetching` flag prevents duplicate simultaneous fetches
- Fallback: expired cache → static hardcoded news if all feeds fail
- Translation: MyMemory API (`api.mymemory.translated.net/get`), 480-char limit per request

## Performance Optimizations (applied for weaker devices)
### Network
- Cache duration extended from 15 → **30 minutes** (halves API calls)
- Translation serialized: max **2 concurrent** requests (was 8 per batch)
- Articles per feed reduced from 8 → **5** (less memory + fewer translation calls)
- Concurrent fetch guard prevents duplicate parallel fetches
- Auto-update interval extended from 5 → **15 minutes**
- Visibility-change handler debounced by **2 seconds** to prevent rapid re-triggers
- Concurrent `checkUpdates` guard prevents stacked calls

### React rendering
- `CURRENT_YEAR` as a **module-level constant** (computed once, not on every render)
- `DRIVER_LINKS` object moved to **module level** (22 entries, was recreated every render)
- `CIRCUITOS_DATA` array (24 circuits) moved to **module level** (was recreated every render)
- `useMemo` on `rules` and `teams` computations derived from `useF1Data` data
- Navigation scroll listener uses `{ passive: true }` for better scroll performance
- `useScrollAnimation` already uses IntersectionObserver (not scroll events)

### f1DataService singleton
- `useF1Data()` is called in 3 separate components (RegrasSection, EquipesSection, PontuacaoSection)
- Now uses a **shared module-level subscription pattern**: single `setInterval`, data shared across all 3 instances (was 3 independent timers)

## Development
- Run: `npm run dev` (starts on port 5000)
- Build: `npm run build`
- Vite dev server: host `0.0.0.0`, port `5000`, `allowedHosts: true`

## Deployment
- Target: Static site
- Build command: `npm run build`
- Public directory: `dist`
