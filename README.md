# Financy

Aplicação full stack de gerenciamento financeiro — desafio prático da fase 3 (Expansão de Habilidades) da pós-graduação Full Stack com IA da Rocketseat (Tech Developer 360).

## Stack

| Camada   | Tecnologias |
|----------|-------------|
| Backend  | Node.js, TypeScript, GraphQL Yoga, Prisma, SQLite, Zod, bcryptjs, jose |
| Frontend | React, TypeScript, Vite, GraphQL (`graphql-request`), React Router, React Hook Form, Zod |

## Estrutura

```text
financy-rocketseat/
├── backend/     # API GraphQL + Prisma/SQLite
├── frontend/    # React + Vite
├── e2e/         # Playwright (aceitação)
└── docs/        # Requisitos, arquitetura, plano, matriz e Figma
```

## Pré-requisitos

- Node.js 20+
- npm 10+

## Configuração rápida

### Backend

```bash
cd backend
cp .env.example .env
# JWT_SECRET=... (mín. 16 chars)
# DATABASE_URL=file:./dev.db
npm install
npx prisma migrate deploy
npm run dev
```

Servidor: `http://localhost:4000/graphql`

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_BACKEND_URL=http://localhost:4000/graphql
npm install
npm run dev
```

App: `http://localhost:5173`

## Rotas do frontend

| Rota | Acesso | Função |
|------|--------|--------|
| `/login` | público | Login |
| `/register` | público | Cadastro |
| `/` | autenticado | Dashboard (saldo, receitas, despesas, recentes) |
| `/transactions` | autenticado | CRUD de transações |
| `/categories` | autenticado | CRUD de categorias |
| `/account` | autenticado | Dados do usuário + logout |

Sessão: JWT em memória + `sessionStorage` (documentado em `docs/architecture.md`). Header `Authorization: Bearer <token>`.

## Testes

```bash
cd backend && npm test
cd frontend && npm test
cd e2e && npm install && npx playwright install chromium && npm test
```

O E2E sobe backend e frontend locais em portas isoladas (`4100` e `5174`), aplica as migrations em um SQLite temporário (`e2e/.tmp`) e cobre desktop e mobile. Não usa serviços externos.

## Scripts

**Backend:** `dev`, `typecheck`, `test`, `build`, `prisma:migrate`

**Frontend:** `dev`, `typecheck`, `lint`, `test`, `build`

**E2E:** `test`

## Documentação

- [Requisitos](docs/requirements.md)
- [Arquitetura](docs/architecture.md)
- [Plano de implementação](docs/implementation-plan.md)
- [Inventário Figma](docs/figma-screen-inventory.md)
- [Matriz de conformidade](docs/submission-requirements-matrix.md)
- [Checklist de publicação](docs/publication-readiness.md)

## Fontes oficiais

- [Enunciado Rocketseat](https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy?module_slug=avaliacao-de-expansao-de-habilidades)
- [Figma Community — Financy](https://www.figma.com/community/file/1580994817007013257/financy)

## Status atual

- **Etapa 1 — Foundation:** concluída
- **Etapa 2 — Backend Core:** concluída
- **Etapa 3 — Frontend Functional:** concluída (PR #3)
- **Etapa 4 — Acceptance:** matriz, E2E e revisão de segurança preparados para revisão. O repositório permanece privado e o desafio ainda não foi enviado.

## Licença

Projeto acadêmico — Rocketseat Tech Developer 360.
