# Avaliação da SPEC + Execução — Vento a Favor

**Data:** 01/09/2026 · **Status:** MVP (Fase 1) construído, testado e funcionando + partes da Fase 2

## 1. Avaliação da spec (o que estava certo, o que foi corrigido)

A spec está madura: plataforma certa (PWA offline-first), modelo de dados razoável, não-objetivos claros. Pontos corrigidos/melhorados na execução:

| # | Achado | Decisão tomada |
|---|---|---|
| 1 | Spec diz **4 treinos da Gabriella**, mas a página publicada tem **5** (Treino 5 — Leg day da Madi) | Seed com os **8 templates** (3 Michel + 5 Gabriella) |
| 2 | `Session.checks` referencia exercícios do template — editar o template corromperia o histórico | **Snapshot desnormalizado**: a sessão guarda uma cópia das seções no momento do treino (padrão Liftosaur/wger) |
| 3 | Faltava o cenário Ilhabela (treino ao ar livre/kite) pedido pelo produto | Campo **`context`** na sessão: 🏠 casa · 🏋️ academia · 🌴 ar livre · 🪁 kite |
| 4 | "Job local à meia-noite" para marcar `skipped` não roda com app fechado | **Catch-up ao abrir o app** (`backfillSkipped`): dias planejados passados sem sessão viram `skipped`; nunca retro-marca antes do 1º uso |
| 5 | Carga: digitar toda vez é fricção | **Pré-preenchimento** com a última carga registrada (placeholder), padrão LiftLog |
| 6 | Timer de descanso manual | **Dispara automaticamente** ao marcar um exercício (padrão Flexify/Massive), com +30s/90s, beep + vibração |
| 7 | Nome em aberto | **Vento a Favor** (sugestão da própria spec; fácil de trocar em 3 lugares) |
| 8 | Gráficos: lib externa arriscaria os 30 kB | **SVG próprio** (sparkline + barras + calendário de pontos) — zero dependência de gráfico |

## 2. Pesquisa open source (agente de pesquisa)

Referências avaliadas: **Liftosaur** (blueprint técnico: TS + PWA offline + uPlot), **Flexify/Massive** (UX de log com poucos toques, licença MIT), **LiftLog** (repetir última carga com 1 toque), **wger** (modelo de dados relacional, exercícios em CC), **Feeel** (player guiado de treino em casa), **workout.lol** (montagem por equipamento, MIT), **FitTrackee** (taxonomia outdoor), **openScale** (métricas corporais multi-usuário).

Decisões herdadas: Dexie + `useLiveQuery` (UI reativa ao banco), sessão-snapshot, timer automático pós-check, sparklines SVG, sem backend no MVP. Projetos AGPL usados **apenas como referência de UX/arquitetura** — nenhum código copiado.

## 3. O que foi construído (app/)

**Stack:** Vite + React + TypeScript · Dexie (IndexedDB) · vite-plugin-pwa (Workbox) · CSS tokens custom · zero framework de UI · bundle ~111 kB gzip.

**Design:** conceito **"Ilha"** — em Ilhabela a mata (verde) desce até o mar (azul); a marca é a **linha d'água**, gradiente `#34d399→#2dd4bf→#38bdf8` que assina a saudação, a barra de progresso da sessão e as barras de meta batida. Base dark "petróleo", números tabulares como protagonistas, temas por perfil (Michel ocean · Gabriella rose com gradiente rosa→lilás).

**Funciona hoje (testado no navegador):**
- Onboarding com seletor de perfil (2 perfis seed)
- **Hoje**: saudação, frase do dia (banco local, 60/perfil, determinística — só repete após 60 dias), streak 🔥, treino sugerido com rotação automática (A→B→C / 1→…→5), retomada de sessão em andamento
- **Player**: checklist por seção, timer de descanso automático (60s, +30s/90s, beep+vibração), carga em kg com última carga de referência, vídeos do YouTube (thumbnail com fallback), barra de progresso gradiente, fechamento com status automático (`done` ≥80% · `partial` · `skipped`), emoji "como se sentiu", contexto e painFlag da virilha (Michel)
- **Treinos**: biblioteca dos 8 templates, detalhe com vídeos, **edição de doses** persistente
- **Evolução**: 5 cards — aderência (12 semanas + % do mês), sequência (atual + recorde + micro-calendário 4 semanas), cargas (chips por exercício + sparkline + Δ%), corpo (6 medidas com registro manual + sparkline), bem-estar (média semanal + gráfico de painFlag com alerta de fisioterapeuta em 2+/semana)
- **Histórico**: calendário mensal com pontos (feito/parcial/pulado) + lista + detalhe da sessão
- **Perfil**: meta semanal, lembretes (dias + horário + permissão de notificação), toggle IA (Fase 3), **export/import JSON**, sobre
- PWA instalável, offline-first, ícones gerados, cache de thumbnails

**Critérios de aceite do MVP verificados:** sessão persiste offline (IndexedDB) ✓ · reabrir restaura sessão em andamento ✓ (testado com reload) · histórico correto ✓ · export JSON com todas as sessões ✓ · cada card de Evolução renderiza com 0, 1 e N pontos ✓ · legível em 360 px ✓.

## 4. Pendências (o que falta e por quê)

| Item | Fase | Nota |
|---|---|---|
| Push com app fechado | 2 | Exige cron serverless (Cloudflare Worker + KV) — spec §7. UI de lembretes e permissão já prontas |
| ~~Banco de ≥60 frases/perfil~~ | ✅ 2 | **Feito:** 60 por perfil em `src/data/quotes.ts`; rotação verificada — 60 frases distintas em 60 dias, sem repetir dentro de 30 |
| Reordenar exercícios do template | v1.1 | Edição de dose entregue; reordenação adia |
| IA (frases, resumo semanal, coach) | 3 | Toggle e opt-in prontos; falta o proxy Worker (spec §9) |
| Backup em Gist | 3 | Export/import manual entregue |
| Deploy no GitHub Pages | — | `npm run build` gera `dist/` com `base: './'`; copiar para `/app/` no repo `treino-kite` |

## 5. Como rodar

```bash
cd app && npm install && npm run dev
```

Build de produção: `npm run build` (sai em `app/dist/`, pronto para GitHub Pages em subpasta).
