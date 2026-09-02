# Vento a Favor 🪁

PWA de treino em casa e ao ar livre para Michel (Kite Prep) e Gabriella (Full Body) — feito em Ilhabela.
Offline-first, dados 100% locais (IndexedDB), sem cookies, sem analytics.

## Rodar

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produção em dist/ (base './' — funciona em subpasta do GitHub Pages)
```

## Arquitetura

- **React + Vite + TypeScript**, CSS custom com design tokens (`src/index.css`) — sem framework de UI
- **Dexie.js** sobre IndexedDB (`src/db.ts`) + `useLiveQuery` — a UI reage ao banco
- **vite-plugin-pwa** (Workbox): app shell precacheado, thumbnails do YouTube em CacheFirst
- Gráficos em **SVG próprio** (`src/components/ui.tsx`) — sem lib de chart

## Estrutura

```
src/
  data/seed.ts     ← os 8 treinos (3 Michel + 5 Gabriella) com vídeos
  data/quotes.ts   ← frases de incentivo por perfil
  db.ts            ← schema Dexie, seed, export/import JSON
  lib/metrics.ts   ← streak, aderência, cargas, bem-estar, backfill de "pulado"
  lib/dates.ts     ← datas locais YYYY-MM-DD
  screens/         ← Onboarding · Today · Player · Workouts · Progress · History · Settings
  components/ui.tsx← ícones, waterline, sparkline, switch
```

## Decisões importantes

- **Sessão guarda snapshot do treino** — editar um template nunca corrompe o histórico
- **Timer de descanso dispara ao marcar exercício** (60s; +30s/90s), com beep + vibração
- **Carga pré-preenchida** com a última registrada
- **Dias planejados sem treino viram "pulado" ao abrir o app** — dado, não culpa
- Status da sessão: `done` ≥80% dos exercícios · `partial` 1–79% · `skipped` 0%
- Temas por perfil via `[data-theme]`; a marca (linha d'água verde→azul) é fixa

## Deploy (GitHub Pages)

`npm run build` e copie `dist/` para a pasta `app/` do repositório `treino-kite`.
As páginas estáticas atuais continuam no ar como fallback.
