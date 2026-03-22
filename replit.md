# F1Start — Guia de Fórmula 1 para Iniciantes

## Visão Geral
Aplicação frontend React + TypeScript + Vite. Site guia completo sobre Fórmula 1, totalmente bilíngue (PT-BR / EN). Projeto acadêmico de faculdade, código aberto.

**GitHub:** https://github.com/MuriloAlonso/F1Start-Guide-For-Begginers

## Stack
- **Framework**: React 19 com TypeScript
- **Build**: Vite 7
- **Estilização**: Tailwind CSS + Radix UI (shadcn/ui)
- **Ícones**: Lucide React
- **Gráficos**: Recharts
- **Formulários**: React Hook Form + Zod
- **Datas**: date-fns, react-day-picker

## Estrutura
```
src/
  App.tsx          - Componente principal (todas as seções da página)
  components/      - Componentes reutilizáveis (LanguageSelector, etc.)
  contexts/        - AppContext (idioma, traduções PT-BR/EN)
  hooks/           - Hooks personalizados (useAutoUpdate, use-mobile)
  lib/             - Utilitários
  services/        - newsApi.ts, f1DataService.ts

api/
  proxy.js         - Serverless function Vercel para proxy RSS (sem CORS)
```

## Sistema de Notícias
- Feeds RSS: BBC Sport F1, Motorsport.com, RaceFans
- **Desenvolvimento**: proxy via `api.allorigins.win`
- **Produção (Vercel)**: proxy serverless próprio em `api/proxy.js` (sem limites externos)
- Cache: 30 minutos, separado por idioma (`f1_news_cache_v4_pt` / `f1_news_cache_v4_en`)
- Tradução automática EN → PT-BR:
  - **Primário**: Google Translate endpoint público (sem chave, alto limite)
  - **Fallback**: MyMemory API
  - Se ambos falharem (429/rate limit): exibe artigos em inglês
  - Se PT falhar por completo: usa cache EN como fallback
- Guard `isFetching` previne fetches duplicados simultâneos

## Tradução
- Primário: `translate.googleapis.com` (client=gtx, sem chave)
- Fallback: `api.mymemory.translated.net`
- Rate limit detectado (429/rate/quota): interrompe tradução e exibe inglês

## Deploy
- **Vercel**: `vercel.json` com rewrite SPA + `api/proxy.js` para feeds
- Build: `npm run build` → pasta `dist`
- `base: '/'` no vite.config.ts para paths absolutos corretos

## Desenvolvimento
- `npm run dev` — porta 5000
- `npm run build` — build de produção
- Host: `0.0.0.0`, `allowedHosts: true`

## Assets / Imagens
- `public/images/legends/` — Fotos dos pilotos lendários (Schumacher, Senna, Hamilton, Verstappen, Prost, Vettel)
- `public/images/teams/` — Logos das 11 equipes (McLaren, Ferrari, Red Bull, Mercedes, Aston Martin, Alpine, Williams, Racing Bulls, Haas, Audi, Cadillac)
- `public/images/cars/` — Fotos dos carros 2025/2026 das 11 equipes (em ação, da Wikimedia Commons); usadas em 3 locais:
  - Seção "O que é F1": banner com foto do Red Bull RB22 (2026)
  - Cards Equipes: banner fotográfico no topo de cada card com o carro real de cada equipe
  - Aba "Carro" (Regras): header fotográfico do Ferrari 2026 (Hamilton)
  - 2026: McLaren, Ferrari, Red Bull, Mercedes, Williams, Audi, Cadillac (MAC-26)
  - 2025: Aston Martin, Alpine, Haas, Racing Bulls (best available via Wikimedia)

## Dependências de Segurança (overrides)
- `minimatch`: 3.1.4 (3.x) e 9.0.7 (9.x)
- `rollup`: 4.59.0
