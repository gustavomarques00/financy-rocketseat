# Financy

Aplicação full stack de gerenciamento financeiro — desafio prático da fase 3 (Expansão de Habilidades) da pós-graduação Full Stack com IA da Rocketseat (Tech Developer 360).

## Stack

| Camada   | Tecnologias                                                         |
|----------|---------------------------------------------------------------------|
| Backend  | Node.js, TypeScript, GraphQL Yoga, Prisma, SQLite, Zod, bcryptjs, jose |
| Frontend | React, TypeScript, Vite, GraphQL                                    |

## Estrutura

```text
financy-rocketseat/
├── backend/     # API GraphQL + Prisma/SQLite
├── frontend/    # React + Vite
└── docs/        # Requisitos, arquitetura e plano
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

Servidor padrão: `http://localhost:4000/graphql`

Scripts úteis:

```bash
npm run typecheck
npm run test
npm run build
npx prisma migrate dev   # criar novas migrations em desenvolvimento
npx prisma studio
```

Variáveis opcionais: `PORT`, `CORS_ORIGIN`, `JWT_EXPIRES_IN` (padrão `7d`).

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_BACKEND_URL=http://localhost:4000/graphql
npm install
npm run dev
```

App padrão: `http://localhost:5173`

## Contratos GraphQL (backend)

Públicas: `health`, `register`, `login`.

Privadas (header `Authorization: Bearer <token>`): `me`, CRUD de `categories` e `transactions`.

Valores monetários usam **centavos inteiros** (`amount: Int!`), sempre positivos; a direção é `INCOME` | `EXPENSE`.

Exemplos e códigos de erro: [docs/architecture.md](docs/architecture.md).

## Documentação

- [Requisitos](docs/requirements.md)
- [Arquitetura](docs/architecture.md)
- [Plano de implementação](docs/implementation-plan.md)

## Fontes oficiais

- [Enunciado Rocketseat](https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy?module_slug=avaliacao-de-expansao-de-habilidades)
- [Figma Community — Financy](https://www.figma.com/community/file/1580994817007013257/financy)

## Status atual

- **Etapa 1 — Foundation:** concluída.
- **Etapa 2 — Backend Core:** autenticação JWT, CRUD de categorias/transações e isolamento por usuário.
- **Etapa 3 — Frontend Functional:** pendente (UI completa e alinhamento Figma).

## Licença

Projeto acadêmico — Rocketseat Tech Developer 360.
