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
└── docs/        # Requisitos, arquitetura, plano, inventário Figma
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

## Scripts

**Backend:** `dev`, `typecheck`, `test`, `build`, `prisma:migrate`

**Frontend:** `dev`, `typecheck`, `lint`, `test`, `build`

## Documentação

- [Requisitos](docs/requirements.md)
- [Arquitetura](docs/architecture.md)
- [Plano de implementação](docs/implementation-plan.md)
- [Inventário Figma](docs/figma-screen-inventory.md)

## Fontes oficiais

- [Enunciado Rocketseat](https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy?module_slug=avaliacao-de-expansao-de-habilidades)
- [Figma Community — Financy](https://www.figma.com/community/file/1580994817007013257/financy)

## Status atual

- **Etapa 1 — Foundation:** concluída
- **Etapa 2 — Backend Core:** concluída
- **Etapa 3 — Frontend Functional:** autenticação, dashboard e CRUD via GraphQL real (Figma `FIGMA_PARTIAL`)
- **Etapa 4 — Acceptance & Submission:** pendente

## Licença

Projeto acadêmico — Rocketseat Tech Developer 360.
