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
| FE-DASH | Dashboard autenticado com totais reais | Obrigatório | soma em centavos | `DashboardPage.tsx`, `lib/money.ts` | Playwright confere `R$ 750,00` | PASS | — |
| FE-CAT | CRUD de categorias na UI | Obrigatório | página + modal | `CategoriesPage.tsx` | `CategoriesPage.test.tsx`, Playwright | PASS | — |
| FE-TX | CRUD de transações na UI | Obrigatório | página + modal | `TransactionsPage.tsx` | Playwright | PASS | Sem teste unitário dedicado da página |
| FE-GQL | Cliente GraphQL real | Obrigatório | `graphql-request` | `frontend/src/lib/graphql/client.ts` | E2E contra API local | PASS | — |
| FE-MODAL | Dois formulários modais | Obrigatório | categoria e transação | `components/categories`, `components/transactions` | Playwright abre e salva os dois | PASS | Nomes oficiais dos frames não verificados |
| FE-ENV | `frontend/.env.example` | Obrigatório | `VITE_BACKEND_URL` | `frontend/.env.example` | inspeção | PASS | — |
| FE-FIGMA | Interface baseada no Figma | Obrigatório no produto final | tema claro, cards e lista | `docs/figma-screen-inventory.md` | smoke visual desktop/mobile via Playwright | PARTIAL | `FIGMA_PARTIAL`; sem pixel-perfect |
| FE-RESP | Desktop e mobile | Obrigatório no brief da Etapa 4 | CSS com breakpoint | `frontend/src/App.css` | projetos Playwright desktop e Pixel 5 | PASS | Não compara com frames mobile oficiais |
| DEL-LAYOUT | Pastas `backend/` e `frontend/` | Obrigatório | monorepo | raiz do repositório | inspeção | PASS | — |
| DEL-README | Instalação e execução documentadas | Obrigatório | README | `README.md` | comandos reexecutados nesta etapa | PASS | — |
| DEL-SECRETS | Sem `.env` ou SQLite versionados | Obrigatório | `.gitignore` | `git ls-files` sem `.env`/`.db` | inspeção | PASS | — |
| DEL-PUBLIC | Repositório público na entrega | Obrigatório só na submissão | repositório PRIVATE | `gh repo view` | inspeção | NOT_APPLICABLE | Publicação exige autorização posterior |
| DEL-SUBMIT | Envio à Rocketseat | Obrigatório só na submissão | não executado | — | — | NOT_APPLICABLE | Fora desta execução |
| SEC-SESSION | Sessão no browser | Obrigatório documentar | memória + `sessionStorage` | `frontend/src/auth/tokenStorage.ts` | `AuthContext.test.tsx` | PARTIAL | Risco residual de XSS; não é cookie HttpOnly |
| SEC-PRISMA-ADV | Advisory em `prisma`/`deepmerge-ts` | Observação | CLI de desenvolvimento | `npm audit --omit=dev` no backend | auditoria | PARTIAL | Não afeta o runtime GraphQL; sem upgrade major |

## Contagem

| Estado | Quantidade |
|--------|------------|
| PASS | 24 |
| PARTIAL | 3 |
| FAIL | 0 |
| NOT_VERIFIED | 0 |
| NOT_APPLICABLE | 2 |

## Validação desta etapa

- Backend: typecheck, 24 testes, build — PASS
- Frontend: typecheck, lint, 13 testes, build — PASS após o ajuste do parser monetário
- Playwright: 3 cenários em desktop e 3 em mobile — PASS
- E2E usa SQLite temporário em `e2e/.tmp`, ignorado pelo Git
