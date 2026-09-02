# SPEC — App Fitness "Treino em Casa" (nome provisório)

**Versão:** 1.0 · Setembro/2026
**Autores:** Michel de Faria + Claude
**Status:** MVP implementado em `app/` (ver `AVALIACAO-E-EXECUCAO.md` — inclui correções à spec: 5 treinos da Gabriella, snapshot de sessão, campo `context` casa/ar-livre/kite, nome escolhido "Vento a Favor")
**Público desta spec:** desenvolvedor(a) ou agente de IA de código (ex.: Claude Code) que vai construir o app.

---

## 1. Contexto e problema

Hoje existem duas páginas estáticas publicadas no GitHub Pages:

- **Treino Kite Prep** (`/index.html`) — preparação física para kitesurf do Michel: 3 dias/semana, 30 min, foco em core/lombar e prevenção de dor na virilha.
- **Treino Gabriella** (`/gabriella.html`) — 4 opções de treino full body de 45 min (3 em blocos estilo NatFlix + 1 circuito estilo Madi Fitness).

Repositório: `github.com/michelfaria/treino-kite` · Site: `michelfaria.github.io/treino-kite/`

As páginas têm checklists por exercício, mas **o estado se perde ao recarregar**: nada é registrado, não há histórico, lembrete, métrica nem acompanhamento. O objetivo é evoluir isso para um app de verdade.

## 2. Objetivos do produto (v1)

1. **Registrar treinos feitos e não feitos** — por sessão e por exercício, com histórico persistente.
2. **Lembrar e motivar** — notificações nos dias/horários de treino com frases de incentivo (banco local + geradas por IA).
3. **Mostrar evolução** — métricas do usuário ao longo do tempo (aderência, sequência, cargas, peso/medidas corporais) em visual **moderno e minimalista**.
4. **IA integrada** — assistente que personaliza mensagens, sugere progressão de carga e produz um resumo semanal.

### Não-objetivos (v1)

- Multiusuário público, cadastro aberto, social/feed, gamificação complexa.
- Prescrição de dieta ou contagem de calorias.
- Integração com wearables (Apple Watch/Garmin) — fica para v2+.
- Backend próprio robusto — v1 usa armazenamento local + sincronização simples (ver §5).

## 3. Usuários

| Usuário | Perfil | Treinos | Identidade visual |
|---|---|---|---|
| **Michel** | 36 anos, saindo do sedentarismo, meta: kitesurf semiprofissional. Atenção à dor na virilha (posterior/adutores). | Kite Prep: Dias A, B, C (30 min) | Tema "oceano": fundo `#0b1520`, accent teal `#2dd4bf`, azul `#38bdf8` |
| **Gabriella** | Treina em casa/academia com halteres e step. | Treinos 1–4 (45 min) | Tema "rosa": fundo `#1a0f1d`, accent rosa `#f472b6`, lilás `#c084fc` |

Sem cadastro público: **seletor de perfil na primeira abertura** (2 perfis pré-criados), trocável nas configurações. Cada perfil tem dados, tema e treinos próprios.

## 4. Plataforma e arquitetura

**Decisão: PWA mobile-first** (instalável pelo navegador, offline-first).

- **Front-end:** React + Vite + TypeScript (ou Preact para bundle menor). CSS custom com design tokens (§8) — sem framework pesado de UI.
- **Persistência local:** IndexedDB (via `Dexie.js`) — fonte de verdade do app. `localStorage` apenas para preferências leves.
- **Offline:** Service Worker com cache dos assets (Workbox). O app abre e registra treino sem internet; IA e thumbnails degradam graciosamente.
- **Sincronização entre aparelhos (v1, simples):** exportar/importar backup JSON manualmente + backup automático opcional em um Gist privado do GitHub do Michel (token configurável). **v1.1:** avaliar Supabase (Postgres + auth anônima) se o manual incomodar.
- **Hospedagem:** GitHub Pages no mesmo repositório (`/app/`), mantendo as páginas estáticas atuais no ar como fallback/documentação dos treinos.
- **Notificações:** Web Push via service worker (§7). Requisito iOS: iOS ≥ 16.4 **e** app adicionado à tela de início.
- **IA:** chamadas à API da Anthropic (Claude) através de um proxy serverless mínimo (Cloudflare Worker gratuito) para não expor a chave no cliente (§9).

## 5. Modelo de dados

Entidades em IndexedDB (todas com `id` uuid, `createdAt`, `updatedAt`; datas ISO-8601 no fuso `America/Sao_Paulo`):

```ts
Profile {
  id: 'michel' | 'gabriella'
  name: string
  theme: 'ocean' | 'rose'
  weeklyGoal: number            // sessões/semana alvo (Michel 3, Gabriella 3)
  reminders: Reminder[]
  aiOptIn: boolean
}

WorkoutTemplate {                // os treinos existentes viram templates versionados
  id: string                     // 'kite-a', 'kite-b', 'kite-c', 'gab-1'..'gab-4'
  profileId: string
  title: string                  // "Dia A — Base de força + Core estável"
  durationMin: number            // 30 | 45
  sections: Section[]            // aquecimento, blocos/circuito, alongamento
}
Section { title, note?, exercises: Exercise[] }
Exercise {
  id, name, dose,                // "10–12 reps · halter no peito"
  note?, videoUrl?, videoThumb?,
  metricType: 'reps' | 'time' | 'none',
  tracksLoad: boolean            // se o usuário registra carga (kg)
}

Session {                        // um treino executado (ou pulado)
  id, profileId, templateId
  date: string                   // dia planejado/realizado
  status: 'done' | 'partial' | 'skipped' | 'planned'
  startedAt?, finishedAt?
  checks: { exerciseId, done: boolean, load?: number, note?: string }[]
  feeling?: 1|2|3|4|5            // como se sentiu (emoji picker pós-treino)
  painFlag?: boolean             // Michel: "senti a virilha hoje" (relevante p/ IA)
}

BodyMetric {                     // registro manual periódico
  id, profileId, date
  type: 'weight' | 'waist' | 'hip' | 'chest' | 'arm' | 'thigh'
  value: number                  // kg ou cm
}

Reminder { id, profileId, daysOfWeek: number[], time: 'HH:mm', enabled: boolean }

Quote {                          // frases de incentivo
  id, text, source: 'builtin' | 'ai', profileId?, usedAt?
}
```

**Seed inicial:** os 7 treinos existentes (3 do Michel + 4 da Gabriella) convertidos em `WorkoutTemplate`, com os mesmos vídeos/thumbnails do YouTube já mapeados nas páginas atuais.

## 6. Funcionalidades

### F1 — Gestão de treinos (feitos e não feitos)

- **Tela "Hoje":** mostra o treino sugerido do dia (baseado nos lembretes/rotina), com botão único **Começar treino**. Se não houver treino agendado, oferece a lista de templates.
- **Player de treino:** a experiência das páginas atuais, evoluída — lista de exercícios com checkbox, foto→vídeo, cronômetro/descanso de 60/90s com aviso sonoro-vibração, campo opcional de carga (kg) nos exercícios com `tracksLoad`. Barra de progresso da sessão.
- **Fechamento da sessão:** ao concluir (ou abandonar), grava `Session` com status: `done` (≥80% dos exercícios), `partial` (1–79%), `skipped` (0%, registrado no fim do dia por job local). Pergunta "como se sentiu?" (1 toque) e, para o Michel, o `painFlag` da virilha.
- **Não feito é dado, não culpa:** dias planejados sem sessão viram `skipped` automaticamente à meia-noite, alimentando as métricas de aderência — sem tom punitivo na UI (§8).
- **Histórico:** calendário mensal com pontos coloridos (feito/parcial/pulado) + lista cronológica; tocar abre o detalhe da sessão.
- **Edição de treinos:** v1 permite ajustar dose/carga alvo e reordenar exercícios de um template; criação de treino do zero fica para v1.1 (ou via IA, §F4).

**Critérios de aceite:** registrar sessão offline; reabrir o app restaura sessão em andamento; histórico correto após virada de dia; export JSON contém todas as sessões.

### F2 — Lembretes e frases de incentivo

- Configuração por perfil: dias da semana + horário (padrão: seg/qua/sex 07:00 Michel, ter/qui/sáb 08:00 Gabriella — ajustável).
- **Push notification** no horário: título curto + frase de incentivo + deep-link para a tela Hoje. Ex.: *"Dia C hoje, Michel — 30 min pela virilha que não vai mais reclamar no downwind. 🪁"*
- **Frases:** banco embutido com ≥60 frases em PT-BR por perfil (tom: encorajador, específico do contexto — kite/downwind para Michel; força/constância para Gabriella; **nunca** culpa, punição ou body-shaming). Quando IA disponível, frases personalizadas com base no histórico recente (§F4); fallback sempre no banco local.
- **Regras anti-spam:** máx. 1 push/dia por perfil + 1 opcional de "resgate" se o treino do dia não foi iniciado até 20h (configurável, off por padrão).
- **Streak suave:** notificação celebra marcos (5, 10, 20 sessões; 4 semanas na meta) — sem alarme de "você perdeu sua sequência".
- **Fallback iOS/permissão negada:** badge no ícone + destaque na tela Hoje; instruções claras de instalação na tela de onboarding.

**Critérios de aceite:** push chega no horário com app fechado (Android e iOS ≥16.4 instalado); frase nunca repete dentro de 30 dias; desativar lembrete cessa pushes.

### F3 — Evolução visual de métricas

Tela **Evolução**, minimalista, uma métrica em foco por vez (cards empilhados, scroll vertical):

1. **Aderência semanal** — barras finas (sessões feitas vs. meta) das últimas 12 semanas; percentual do mês no topo em tipografia grande.
2. **Sequência (streak)** — número atual + recorde, com micro-calendário das últimas 4 semanas (pontos).
3. **Cargas por exercício** — sparkline da carga registrada nos exercícios-chave (goblet, stiff, hip thrust…); seleção por chip. Mostra Δ% desde o início.
4. **Corpo** — linha do peso e da cintura ao longo do tempo (registro manual semanal com lembrete próprio opcional); média móvel de 7 dias, sem julgamentos na copy.
5. **Bem-estar** — média do "como se sentiu" por semana; para Michel, frequência do `painFlag` (tendência da dor na virilha — o gráfico mais importante do app para ele).

**Diretrizes visuais (obrigatórias):** gráficos sem grade pesada, sem 3D, sem legenda redundante; 1 cor de série (accent do tema) + neutros; eixos mínimos com 2–3 ticks; números grandes como protagonistas; animação sutil de entrada; estados vazios bonitos ("registre seu primeiro peso para ver a curva"). Renderização com SVG próprio ou `uPlot`/`Chart.js` tree-shaken — bundle de gráficos < 30 kB.

**Critérios de aceite:** cada card renderiza com 0, 1 e N pontos de dados; tudo legível em tela de 360 px; dark theme nativo.

### F4 — IA (assistente de treino)

Camada de IA via API Claude (proxy serverless; §9). Funções em v1:

1. **Frases personalizadas:** 1×/semana o app envia um resumo anônimo do histórico (contagens, streak, cargas — sem nome/dados sensíveis) e recebe 7 frases novas contextualizadas, que abastecem o banco local.
2. **Resumo semanal:** domingo à noite, card "Sua semana" — 3 frases: o que foi feito, um destaque de progresso, um foco para a próxima semana. Ex.: *"3 de 3 treinos, melhor semana do mês. O stiff subiu para 14 kg. Semana que vem: atenção ao alongamento do Dia C."*
3. **Sugestão de progressão:** quando o usuário completa todas as reps com folga em 2 sessões seguidas (dado dos checks + carga), o app sugere aumento de carga/tempo, com justificativa curta. Regra determinística local; a IA só redige a mensagem.
4. **Pergunte ao coach (chat simples):** dúvidas de execução/substituição de exercício, com contexto do treino atual. Disclaimer fixo: não substitui profissional; dor aguda → parar e procurar avaliação. Para Michel, se `painFlag` aparecer 2×/semana, o app recomenda fisioterapeuta (regra local, não IA).

**Privacidade:** IA é opt-in por perfil (`aiOptIn`); sem IA, tudo funciona com o banco local de frases e regras determinísticas. Nenhum dado corporal é enviado sem consentimento explícito na primeira ativação.

**Critérios de aceite:** app 100% funcional com IA desligada/sem rede; nenhuma chamada contém nome ou métricas corporais se o usuário não consentiu; custo estimado < US$ 2/mês (chamadas semanais + chat esporádico, modelo Haiku).

## 7. Notificações — detalhes técnicos

- Web Push (VAPID) + service worker; agendamento no servidor é desnecessário: usar **Push API com trigger local** onde suportado e, como plano geral, um **cron serverless** (mesmo Cloudflare Worker da IA) que dispara os pushes nos horários configurados (assinaturas push salvas no Worker KV).
- iOS: exigir instalação na tela de início (onboarding com GIF curto ensinando); pedir permissão só após o primeiro treino concluído (momento de boa vontade), nunca na primeira abertura.
- Toda notificação abre direto a tela relevante (deep-link via `notificationclick`).

## 8. UX / UI

- **Navegação:** tab bar inferior com 4 itens — **Hoje · Treinos · Evolução · Perfil**.
- **Estilo:** herda a estética das páginas atuais (dark, cards arredondados 14 px, chips, thumbnails de vídeo), refinada: espaçamento generoso, tipografia system-ui com números tabulares nos dados, micro-interações discretas (checkbox com haptic/anim 150 ms).
- **Design tokens por tema** (ocean/rose) — mesmos hex das páginas atuais; componentes 100% tematizáveis por CSS variables.
- **Tom de voz:** parceiro de treino, direto e caloroso; sem jargão fitness agressivo; sem culpa. Português do Brasil.
- **Acessibilidade:** contraste AA, alvos de toque ≥ 44 px, `prefers-reduced-motion` respeitado, textos de gráfico com alternativa textual.

### Telas (v1)

1. **Onboarding** (1ª abertura): escolha de perfil → instalar na tela de início → lembretes (opcional) → pronto.
2. **Hoje:** saudação + frase do dia, card do treino sugerido (CTA Começar), streak discreto no topo.
3. **Player de treino:** lista seccionada com checks, timer de descanso, campo de carga, barra de progresso, finalizar.
4. **Treinos:** biblioteca de templates (os 7 atuais), detalhe com vídeos, botão de editar doses.
5. **Evolução:** cards de métricas (§F3).
6. **Histórico:** calendário + lista (acessível a partir de Evolução).
7. **Perfil/Config:** lembretes, tema, meta semanal, IA on/off, exportar/importar backup, sobre.

## 9. Segurança e privacidade

- Dados ficam no aparelho (IndexedDB); backup externo é opcional e explícito.
- Chave da API de IA **nunca** no cliente: proxy Cloudflare Worker com allowlist de origem e rate-limit.
- Sem analytics de terceiros em v1. Sem cookies. Página de privacidade curta em PT-BR no app.

## 10. Fases de entrega

| Fase | Escopo | Definição de pronto |
|---|---|---|
| **MVP (Fase 1)** | PWA instalável com os 7 templates, player com checks + carga + timer, Sessions persistidas, tela Hoje, histórico simples, export/import JSON | Michel e Gabriella registram 1 semana real de treinos sem perda de dados |
| **Fase 2** | Lembretes push + banco de frases, tela Evolução completa (5 cards), streaks, encerramento automático de dias | Push confiável nos 2 aparelhos; métricas conferem com o histórico |
| **Fase 3** | IA: frases personalizadas, resumo semanal, sugestão de progressão, chat coach; backup em Gist | Custo de IA dentro do orçado; app íntegro com IA off |
| **v2 (backlog)** | Multiusuário/Supabase, criação de treinos por IA, wearables, fotos de progresso, PT/EN | — |

## 11. Riscos e decisões em aberto

- **Push no iOS** depende de instalação correta como PWA — mitigar com onboarding caprichado; aceitar fallback de badge.
- **Thumbnails/links do YouTube** podem quebrar — tratar `onerror` (já feito nas páginas) e revisar links a cada 6 meses.
- **Sync entre aparelhos** manual pode incomodar — gatilho para antecipar Supabase se houver reclamação real.
- **Nome do app** — decidir antes do MVP (sugestões: *Constância*, *Vento a Favor*, *Treino da Casa*).

## 12. Métricas de sucesso (90 dias pós-MVP)

- ≥ 80% das sessões planejadas registradas (feitas OU puladas — o que importa é registrar).
- Michel: tendência de queda no `painFlag`; 3 treinos/semana em ≥ 60% das semanas.
- Gabriella: 2–3 treinos/semana em ≥ 60% das semanas.
- Zero perda de dados reportada.

---

*Anexos de referência: páginas atuais em `michelfaria.github.io/treino-kite/` (index.html e gabriella.html) — servem como spec visual e fonte dos templates de treino, incluindo links de vídeo por exercício.*
