# Performance & Scalability Skill — Healthcare Management App (React)

## Contexto
App de gerenciamento (agenda, prontuário, pacientes, fisioterapeutas) em
React, hospedada na Vercel. Objetivo: manter velocidade percebida alta e
capacidade de crescer (mais clínicas/usuários) sem reescrever a base.

Use esta skill para revisar código, sugerir refatorações e sinalizar
gargalos de performance.

---

## 1. Renderização e Re-renders

- Evite re-render desnecessário: `React.memo` em componentes de lista
  (linha de agenda, card de paciente) que recebem props estáveis.
- `useMemo`/`useCallback` só onde o cálculo é caro ou a referência é
  passada a um filho memoizado — não aplique por reflexo, isso também
  tem custo.
- Liste de pacientes/agenda com muitos itens: use virtualização
  (`react-window` ou `@tanstack/virtual`) em vez de renderizar tudo.
- Evite estado global desnecessário (Context reexecuta todo consumidor
  a cada mudança) — para dados de servidor, prefira uma lib de data
  fetching (abaixo) em vez de guardar em Context/Redux.

## 2. Data Fetching e Cache

- Use `TanStack Query` (React Query) ou `SWR` para toda chamada de API:
  cache automático, revalidação, deduplicação de requisições simultâneas.
- Defina `staleTime` por tipo de dado: agenda do dia = cache curto;
  cadastro de paciente = cache mais longo.
- Pagine ou use scroll infinito em listas grandes (histórico de sessões,
  lista de pacientes) — nunca carregue tudo de uma vez.
- Debounce em campos de busca (300ms) para não disparar request a cada
  tecla.

## 3. Code Splitting e Bundle

- Lazy load de rotas com `React.lazy` + `Suspense` — painel admin,
  relatórios e telas pouco usadas não devem entrar no bundle inicial.
- Separe bundle de bibliotecas pesadas (editor de texto rico para
  prontuário, gráficos de relatório) em chunk próprio.
- Rode `vite-bundle-visualizer` (ou equivalente do bundler usado)
  periodicamente para achar dependência inflando o bundle sem necessidade.
- Evite importar biblioteca inteira quando só uma função é usada
  (ex: `import { format } from 'date-fns'`, não a lib toda).

## 4. Imagens e Assets

- Fotos de pacientes/laudos: sirva em formato otimizado (WebP/AVIF),
  com `next/image` se for Next.js, ou lazy loading nativo (`loading="lazy"`)
  caso contrário.
- Nunca envie imagem em resolução original para thumbnail de lista.

## 5. Backend / API — pontos que afetam a percepção de velocidade do front

- Endpoints de listagem devem paginar por padrão, não devolver tudo.
- Índices no banco para as queries mais frequentes (busca de paciente
  por nome, agenda por data + fisioterapeuta).
- Evite N+1 query ao montar resposta de agenda (paciente + fisioterapeuta
  + histórico em uma única query bem feita, não uma por item da lista).

## 6. Escalabilidade de Infraestrutura (Vercel)

- Funções serverless: evite cold start caro — mantenha dependências
  leves nas API routes usadas com frequência (login, agenda do dia).
- Use ISR (Incremental Static Regeneration) ou cache de edge para
  conteúdo que muda pouco (ex: página institucional da clínica), se
  estiver em Next.js.
- Separe ambiente de dev/staging/produção com variáveis de ambiente
  próprias — evita que teste de carga afete dados reais.

## 7. Monitoramento

- Web Vitals (LCP, INP, CLS) monitorados — Vercel Analytics ou similar.
- Log de tempo de resposta por endpoint para identificar gargalo antes
  que vire reclamação de usuário.

## 8. Checklist rápido para o Cursor aplicar em toda PR

- [ ] Lista nova tem paginação ou virtualização
- [ ] Chamada de API nova usa React Query/SWR, não `useEffect` + `fetch` cru
- [ ] Rota pouco usada está em lazy load
- [ ] Nenhuma imagem sendo servida em tamanho original desnecessário
- [ ] Nenhum `useMemo`/`useCallback` supérfluo adicionando complexidade sem ganho
- [ ] Query nova no backend não gera N+1
