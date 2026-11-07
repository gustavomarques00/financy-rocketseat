# Financy

Aplicação full stack de gerenciamento financeiro — desafio prático da fase 3 (Expansão de Habilidades) da pós-graduação Full Stack com IA da Rocketseat (Tech Developer 360).

## Stack

| Camada   | Tecnologias |
|----------|-------------|
| Backend  | Node.js, TypeScript, GraphQL Yoga, Prisma 7 + SQLite (`better-sqlite3`), Zod, bcryptjs, jose, Nodemailer |
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
# MAIL_TRANSPORT=file
# MAIL_DIR=./.mail
npm install
npx prisma migrate deploy
npm run dev
```

Servidor: `http://localhost:4000/graphql`

Inbox local de recuperação de senha: arquivos em `backend/.mail/` (criados sob demanda).

Para SMTP real, defina `MAIL_TRANSPORT=smtp` e as variáveis `SMTP_*` / `MAIL_FROM` / `FRONTEND_URL` descritas em `backend/.env.example`.

### Frontend

```bash
cd frontend
cp .env.example .env
# VITE_BACKEND_URL=/graphql
# VITE_DEV_PROXY_TARGET=http://127.0.0.1:4000
npm install
npm run dev
```

App: `http://localhost:5173`

O proxy do Vite encaminha `/graphql` e `/auth` ao backend para que o cookie HttpOnly de “Lembrar-me” seja first-party em desenvolvimento.

## Rotas do frontend

| Rota | Acesso | Função |
|------|--------|--------|
| `/login` | público | Login (inclui Lembrar-me e link de recuperação) |
| `/register` | público | Cadastro |
| `/forgot-password` | público | Solicitar link de redefinição |
| `/reset-password` | público | Definir nova senha a partir do token do e-mail |
| `/` | autenticado | Dashboard (saldo, receitas, despesas, recentes) |
| `/transactions` | autenticado | CRUD de transações |
| `/categories` | autenticado | CRUD de categorias |
| `/account` | autenticado | Edição do nome, e-mail somente leitura e logout |

### Sessão

- **Sem Lembrar-me:** access JWT em memória + `sessionStorage` (reload da aba mantém a sessão; fechar o navegador não deve persistir).
- **Com Lembrar-me:** refresh token rotativo em cookie HttpOnly (`financy_refresh`, `Path=/auth`) + access curto; restauração via `POST /auth/refresh`.
- **Logout:** limpa o estado local imediatamente e tenta `POST /auth/logout` em paralelo (best-effort). Falha de rede não mantém a UI autenticada.
- **Access expirado:** refresh coordenado + retry único da operação GraphQL autenticada (não há retry em falha de rede).
- **Reset de senha:** incrementa `sessionVersion` e revoga refresh tokens; JWTs antigos deixam de autenticar.
- **Rate limiting:** usa o IP do socket por padrão. Só confia em `X-Forwarded-For` quando o peer está listado em `TRUSTED_PROXIES` (veja `backend/.env.example`).

## Testes

```bash
cd backend && npm test
cd frontend && npm test
cd e2e && npm install && npx playwright install chromium && npm test
```

O E2E sobe backend e frontend locais em portas isoladas (`4100` e `5174`), aplica as migrations em um SQLite temporário (`e2e/.tmp`) e cobre desktop e mobile. Não usa serviços externos pagos.

## Scripts

**Backend:** `dev`, `typecheck`, `test`, `build`, `prisma:migrate`, `prisma:generate`

**Frontend:** `dev`, `typecheck`, `lint`, `test`, `build`

**E2E:** `test`

## Documentação

- [Requisitos](docs/requirements.md)
- [Arquitetura](docs/architecture.md)
- [Plano de implementação](docs/implementation-plan.md)
- [Inventário Figma](docs/figma-screen-inventory.md)
- [Matriz de conformidade](docs/submission-requirements-matrix.md)
- [Checklist de publicação](docs/publication-readiness.md)
- [Auditoria visual](docs/figma-fidelity-audit.md)
- [Checklist final de entrega](docs/final-release-checklist.md)

## Fontes oficiais

- [Enunciado Rocketseat](https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy?module_slug=avaliacao-de-expansao-de-habilidades)
- [Figma — Financy Community](https://www.figma.com/design/IR3TQC9ofQKZ2km01tq8EB/Financy--Community-?node-id=0-1)

## Limitações

- A interface segue a estrutura dos frames oficiais, mas a fidelidade visual permanece `FIGMA_PARTIAL` quanto à escala tipográfica não medida.
- O e-mail real via SMTP só é exercitado quando `MAIL_TRANSPORT=smtp` está configurado; a demonstração acadêmica padrão usa o transporte `file`.
- Rate limiting de reset é in-memory (por processo), adequado ao deploy single-node do desafio.
- O saldo do dashboard considera todo o histórico do usuário. “Receitas do mês” e “Despesas do mês” consideram apenas a data financeira no mês local corrente.

## Status atual

**Status:** repositório público no GitHub, disponível para avaliação acadêmica. A submissão à Rocketseat é realizada separadamente.

## Licença

Projeto acadêmico — Rocketseat Tech Developer 360.
