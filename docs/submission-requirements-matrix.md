# Matriz de conformidade — Financy

Fonte primária: requisitos registrados em `docs/requirements.md` e o enunciado informado pelo usuário. O conteúdo autenticado da plataforma FTR não foi extraído nesta execução.

Estados: `PASS`, `FAIL`, `PARTIAL`, `NOT_VERIFIED`, `NOT_APPLICABLE`.

Nada abaixo foi marcado `PASS` apenas por relatório anterior. As evidências apontam para código e testes reexecutados na Etapa 4.

| ID | Descrição | Classe | Implementação | Evidência | Teste | Resultado | Pendência |
|----|-----------|--------|---------------|-----------|-------|-----------|-----------|
| BE-STACK | Node, TypeScript, GraphQL, Prisma, SQLite | Obrigatório | Yoga + Prisma SQLite | `backend/package.json`, `backend/prisma/schema.prisma` | `npm test` / `npm run build` no backend | PASS | PostgreSQL não foi adotado; o enunciado permite SQLite |
| BE-AUTH | Cadastro e login | Obrigatório | `register` / `login` | `backend/src/services/auth.ts` | `backend/src/graphql.integration.test.ts` | PASS | — |
| BE-HASH | Senha com hash, sem retorno do hash | Obrigatório | bcryptjs, 12 rounds | `backend/src/auth/password.ts` | teste “without exposing password hash” | PASS | — |
| BE-JWT | JWT com expiração e secret de ambiente | Obrigatório | jose HS256 | `backend/src/auth/jwt.ts`, `backend/src/env.ts` | testes de token ausente, inválido e expirado | PASS | — |
| BE-OWN | Isolamento por usuário | Obrigatório | filtros `{ id, userId }` | `backend/src/services/categories.ts`, `transactions.ts` | suíte “user isolation” | PASS | — |
| BE-CAT | CRUD de categorias | Obrigatório | queries/mutations GraphQL | `backend/src/graphql/schema.ts` | suíte “categories” | PASS | — |
| BE-TX | CRUD de transações | Obrigatório | queries/mutations GraphQL | `backend/src/services/transactions.ts` | suíte “transactions” | PASS | — |
| BE-MONEY | Valor inteiro em centavos | Obrigatório | `amount Int` | `schema.prisma`, `validation/inputs.ts` | teste de amount inválido | PASS | — |
| BE-CAT-USE | Não apagar categoria em uso | Obrigatório | erro `CATEGORY_IN_USE` | `services/categories.ts` | teste de bloqueio + E2E | PASS | — |
| BE-CORS | CORS restrito | Obrigatório | origem `CORS_ORIGIN` | `backend/src/server.ts` | inspeção de código | PASS | Sem teste automatizado de origem rejeitada |
| BE-ENV | `backend/.env.example` | Obrigatório | `JWT_SECRET` e `DATABASE_URL` | `backend/.env.example` | inspeção | PASS | — |
| BE-LOCAL | Execução local e migrations | Obrigatório | `prisma migrate deploy` | `backend/prisma/migrations/` | E2E aplica migration em SQLite temporário | PASS | — |
| FE-STACK | React, TypeScript, Vite, GraphQL | Obrigatório | sem Next.js | `frontend/package.json` | typecheck, lint, build | PASS | — |
| FE-AUTH | Cadastro, login, logout, rotas privadas | Obrigatório | páginas e `ProtectedRoute` | `frontend/src/pages/`, `routes/ProtectedRoute.tsx` | `App.test.tsx`, Playwright | PASS | — |
| FE-DASH | Dashboard autenticado com totais reais | Obrigatório | saldo histórico e totais do mês corrente, em centavos | `DashboardPage.tsx`, `lib/money.ts` | Playwright confere saldo `R$ 1.250,00`, receitas do mês `R$ 1.000,00` e despesas do mês `R$ 250,00` | PASS | — |
| FE-CAT | CRUD de categorias na UI | Obrigatório | página + modal | `CategoriesPage.tsx` | `CategoriesPage.test.tsx`, Playwright | PASS | — |
| FE-TX | CRUD de transações na UI | Obrigatório | página + modal | `TransactionsPage.tsx` | Playwright | PASS | Sem teste unitário dedicado da página |
| FE-GQL | Cliente GraphQL real | Obrigatório | `graphql-request` | `frontend/src/lib/graphql/client.ts` | E2E contra API local | PASS | — |
| FE-MODAL | Dois formulários modais | Obrigatório | categoria e transação | `components/categories`, `components/transactions` | Playwright abre e salva os dois | PASS | Nomes oficiais dos frames não verificados |
| FE-ENV | `frontend/.env.example` | Obrigatório | `VITE_BACKEND_URL` | `frontend/.env.example` | inspeção | PASS | — |
| FE-FIGMA | Interface baseada no Figma | Obrigatório no produto final | tema claro, cards e lista | `docs/figma-fidelity-audit.md` | SHA-256 do logo e comparação dos paths exportados | PARTIAL | Logo e ícones conferidos por bytes. Escala tipográfica `FIGMA_MEASUREMENT_BLOCKED`. |
| FE-RESP | Desktop e mobile | Obrigatório no brief da Etapa 4 | CSS com breakpoint | `frontend/src/App.css` | projetos Playwright desktop e Pixel 5 | PASS | Não compara com frames mobile oficiais |
| DEL-LAYOUT | Pastas `backend/` e `frontend/` | Obrigatório | monorepo | raiz do repositório | inspeção | PASS | — |
| DEL-README | Instalação e execução documentadas | Obrigatório | README | `README.md` | comandos reexecutados nesta etapa | PASS | — |
| DEL-SECRETS | Sem `.env` ou SQLite versionados | Obrigatório | `.gitignore` | `git ls-files` sem `.env`/`.db` | inspeção | PASS | — |
| DEL-PUBLIC | Repositório público na entrega | Obrigatório só na submissão | repositório PUBLIC | `gh repo view` | inspeção em 5 nov 2026 | PASS | A submissão acadêmica continua pendente |
| DEL-SUBMIT | Envio à Rocketseat | Obrigatório só na submissão | não executado | — | — | NOT_APPLICABLE | Fora desta execução |
| SEC-SESSION | Sessão no browser | Obrigatório documentar | access JWT + refresh HttpOnly (Lembrar-me) | `sessions.ts`, `tokenStorage.ts`, `/auth/*` | `auth.security.test.ts`, `AuthContext.test.tsx` | PASS | Access em sessionStorage ainda legível por XSS na aba; refresh não é acessível via JS |
| SEC-PRISMA-ADV | Advisory em `prisma`/`deepmerge-ts` | Observação | Prisma 7.10.1 + `deepmerge-ts@8.0.2` | `npm ls deepmerge-ts`, `npm audit --omit=dev` | auditoria Execução 18 | PASS | GHSA-ggr8-5vv4-36mx eliminado da árvore efetiva |

## Contagem

| Estado | Quantidade |
|--------|------------|
| PASS | 27 |
| PARTIAL | 1 |
| FAIL | 0 |
| NOT_VERIFIED | 0 |
| NOT_APPLICABLE | 1 |

## Validação desta etapa

- Backend: typecheck, 24 testes, build — PASS
- Frontend: typecheck, lint, 15 testes, build — PASS
- Playwright: 3 cenários em desktop e 3 em mobile — PASS, incluindo consulta da conta e ausência do botão de salvamento
- E2E usa SQLite temporário em `e2e/.tmp`, ignorado pelo Git
- Contagem após a publicação: 25 PASS, 3 PARTIAL, 0 FAIL, 0 NOT_VERIFIED, 1 NOT_APPLICABLE. `DEL-PUBLIC` passou a PASS porque o GitHub está público. `DEL-SUBMIT` permanece NOT_APPLICABLE.
- Execução 13, na branch de fidelidade visual: backend typecheck, 24 testes e build PASS; frontend typecheck, lint, 15 testes e build PASS; Playwright 6 PASS (desktop e mobile). `FE-FIGMA` permanece PARTIAL. `SEC-SESSION` e `SEC-PRISMA-ADV` não mudaram.
- Execução 14: as cinco capturas do Style Guide atualizaram tokens, estados e indicadores. Backend 24, frontend 15 e Playwright 6 passaram de novo. `FE-FIGMA` continua PARTIAL.
- Execução 15: as capturas das telas e dos modais atualizaram layout, paginação e formulários persistidos. Backend 24, frontend 15 e Playwright 6 passaram de novo. `FE-FIGMA` continua PARTIAL. `SEC-SESSION` e `SEC-PRISMA-ADV` não mudaram.
- Execução 16: migration de aparência de categoria, `updateMe`, totais mensais e calendário. Backend typecheck, 28 testes e build PASS; frontend typecheck, lint, 18 testes e build PASS; Playwright 6 PASS em desktop e mobile. `FE-FIGMA` continua PARTIAL. `SEC-SESSION` e `SEC-PRISMA-ADV` não mudaram. A contagem permanece 25 PASS, 3 PARTIAL, 0 FAIL, 0 NOT_VERIFIED, 1 NOT_APPLICABLE.
- O SVG oficial do logo e os ícones preenchidos exportados foram incorporados depois, sem alterar caminhos. `FE-FIGMA` continua PARTIAL somente pela escala tipográfica não medida.
- Auditoria final no HEAD `7f3edc1`: backend typecheck, 28 testes e build PASS; frontend typecheck, lint, 18 testes e build PASS; Playwright 6 PASS nos projetos Desktop Chrome e Pixel 5. Logo conferido por SHA-256. Nova medição Figma bloqueada (`FIGMA_MEASUREMENT_BLOCKED`). `SEC-SESSION` e `SEC-PRISMA-ADV` permanecem PARTIAL. Contagem inalterada: 25 PASS, 3 PARTIAL, 0 FAIL, 0 NOT_VERIFIED, 1 NOT_APPLICABLE.
- Execução 18: recuperação de senha, Lembrar-me com refresh HttpOnly, Prisma 7.10.1 + adapter SQLite. Backend typecheck, 34 testes e build PASS; frontend typecheck, lint, 18 testes e build PASS; `npm audit --omit=dev` = 0; `deepmerge-ts@8.0.2`. `SEC-SESSION` e `SEC-PRISMA-ADV` passam a PASS. Contagem: 27 PASS, 1 PARTIAL (`FE-FIGMA`), 0 FAIL, 0 NOT_VERIFIED, 1 NOT_APPLICABLE.
- Execução 19: IP de rate limiting só via peer/trusted proxies; refresh+retry GraphQL coordenado; logout local imediato com barreira de restauração. Backend 46 testes PASS; frontend 22 testes PASS.
