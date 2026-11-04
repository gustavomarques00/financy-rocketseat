# Financy

Aplicação full stack de gerenciamento financeiro — desafio prático da fase 3 (Expansão de Habilidades) da pós-graduação Full Stack com IA da Rocketseat (Tech Developer 360).

## Stack

| Camada   | Tecnologias                                      |
|----------|--------------------------------------------------|
| Backend  | Node.js, TypeScript, GraphQL Yoga, Prisma, SQLite |
| Frontend | React, TypeScript, Vite, GraphQL                 |

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
# Preencha JWT_SECRET e DATABASE_URL
npm install
npx prisma migrate dev
npm run dev
```

Servidor padrão: `http://localhost:4000/graphql`

### Frontend

```bash
cd frontend
cp .env.example .env
# Defina VITE_BACKEND_URL=http://localhost:4000/graphql
npm install
npm run dev
```

App padrão: `http://localhost:5173`

## Documentação

- [Requisitos](docs/requirements.md)
- [Arquitetura](docs/architecture.md)
- [Plano de implementação](docs/implementation-plan.md)

## Fontes oficiais

- [Enunciado Rocketseat](https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy?module_slug=avaliacao-de-expansao-de-habilidades)
- [Figma Community — Financy](https://www.figma.com/community/file/1580994817007013257/financy)

## Status atual

**Etapa 1 — Foundation** em andamento: estrutura, servidor GraphQL de diagnóstico, Prisma/SQLite, cliente GraphQL e UI inicial.

Autenticação, CRUD e aderência completa ao Figma serão implementados nas etapas seguintes.

## Licença

Projeto acadêmico — Rocketseat Tech Developer 360.
