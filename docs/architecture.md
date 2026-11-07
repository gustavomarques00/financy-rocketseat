# Arquitetura — Financy

Decisões técnicas das Etapas 1–3. Objetivo: aplicação simples, consistente e fácil de avaliar.

## Organização frontend / backend

```text
financy-rocketseat/
├── backend/          # API GraphQL (Node.js + TypeScript)
│   ├── prisma/       # Schema e migrações
│   └── src/          # Servidor, auth, serviços, schema GraphQL
├── frontend/         # SPA React + Vite + TypeScript
│   └── src/          # Auth, páginas, cliente GraphQL, UI
└── docs/
```

- Monorepo com dois pacotes npm independentes.
- Sem compartilhamento de código tipado entre apps nesta fase.

## Frontend (Etapa 3)

### Estrutura

- `auth/` — `AuthProvider`, token em memória + `sessionStorage`, `useAuth`
- `lib/graphql/` — cliente tipado (`api`), operations, erros
- `lib/money.ts` — conversão centavos ↔ exibição (`Intl.NumberFormat`)
- `pages/` — Login, Register, Dashboard, Transactions, Categories, Account
- `components/` — shell, modais de categoria/transação, UI base
- `routes/` — `ProtectedRoute` / `PublicOnlyRoute`

### Rotas

| Path | Guard | Página |
|------|-------|--------|
| `/login`, `/register` | público | autenticação |
| `/` | privado | dashboard |
| `/transactions` | privado | CRUD transações |
| `/categories` | privado | CRUD categorias |
| `/account` | privado | perfil + logout |

### Sessão

- Access JWT em `Authorization: Bearer <token>`
- Sem Lembrar-me: memória + `sessionStorage` (XSS ainda pode ler o access token da aba)
- Com Lembrar-me: refresh HttpOnly + access em memória; bootstrap via `/auth/refresh`
- Logout limpa o estado local imediatamente; a revogação remota é best-effort
- Após logout, `financy.auth.suppress-restore` impede restauração automática via cookie na mesma aba
- Access expirado: o cliente GraphQL faz um único refresh coordenado e repete a operação uma vez (somente após `UNAUTHENTICATED` GraphQL; sem retry em falha de rede/5xx)
- Mutations autenticadas só são repetidas quando o erro GraphQL comprova rejeição pré-resolver (`requireAuth`)
- Páginas privadas não renderizam conteúdo antes do bootstrap da sessão
- Rotas `/forgot-password` e `/reset-password` são públicas
- Rate limiting in-memory é por processo (sem Redis); adequado ao deploy single-node do desafio

### Modais

1. Categoria (criar/editar)
2. Transação (criar/editar)

Visual alinhado ao preview Community + tema existente; fidelidade pixel-perfect **não** afirmada (`FIGMA_PARTIAL` em `docs/figma-screen-inventory.md`).

## Comunicação GraphQL

- Endpoint único: `POST /graphql` (GraphQL Yoga + `node:http`).
- Cliente previsto no frontend: `graphql-request`.
- Query pública de diagnóstico: `health`.
- Operações públicas: `health`, `register`, `login`, `requestPasswordReset`, `resetPassword`.
- REST auxiliar: `POST /auth/refresh`, `POST /auth/logout`.
- Operações privadas: `me`, `updateMe`, CRUD de `categories` / `transactions`.

## Responsabilidades do servidor

1. Validar variáveis de ambiente no boot.
2. Servir o schema GraphQL.
3. Aplicar CORS restrito.
4. Autenticar JWT no context factory.
5. Autorizar por ownership (`userId` do token).
6. Persistência via Prisma Client.
7. Mapear erros de domínio para GraphQL errors tipados.

## Persistência — Prisma / SQLite

| Model | Papel |
|-------|--------|
| `User` | Conta; e-mail único; `passwordHash`; `sessionVersion` para revogar JWTs |
| `PasswordResetToken` | Hash SHA-256 de token opaco de recuperação; uso único; expiração curta |
| `RefreshSession` | Hash do refresh token HttpOnly (Lembrar-me); rotação e revogação |
| `Category` | Categorias por usuário (`userId`, nome único por usuário). `description` opcional, `icon` e `color` com padrão `tag` e `green` |
| `Transaction` | Transações por usuário; `amount` em centavos (`Int`); tipo `INCOME` \| `EXPENSE` |

- Remoção de usuário cascateia categorias e transações.
- Remoção de categoria com transações vinculadas é **bloqueada** (`onDelete: Restrict` + regra de domínio `CATEGORY_IN_USE`).
- SQLite local; PostgreSQL permanece opção futura do enunciado.
- A migration `20261106172000_category_appearance` adiciona os campos novos sem alterar a migration inicial. Categorias já existentes preservam id, nome, dono e transações; descrição fica nula e a aparência recebe os padrões.
- Ícone e cor aceitos são identificadores de allowlist, validados no servidor. SVG, caminho de arquivo e CSS livre são rejeitados. A descrição tem no máximo 160 caracteres.
- `updateMe` atualiza apenas o nome do usuário identificado pelo JWT. Não recebe `userId`, não altera e-mail e não altera senha. Essa mutation aproxima o botão do frame de perfil; o enunciado acadêmico consultado não a lista como requisito separado.
- O dashboard calcula saldo, receitas do mês e despesas do mês no cliente, sobre a lista completa já filtrada por dono. O saldo usa todo o histórico. Os cartões mensais usam a data financeira da transação e o mês local corrente. A data é gravada às 12:00 UTC para o dia escolhido não retroceder no fuso UTC−3.

### Política monetária

| Aspecto | Decisão |
|---------|---------|
| Unidade armazenada | Centavos inteiros (`Int`) |
| Tipo GraphQL | `Int!` |
| Sinal | Sempre positivo; direção via `type` |
| Zero / negativo | Rejeitados (`BAD_USER_INPUT`) |
| Limite máximo | `99_999_999_999` centavos |
| Arredondamento | Não aplicável (inteiro) |
| Moeda múltipla | Fora de escopo |

## Autenticação

| Item | Decisão |
|------|---------|
| Cadastro / login | Mutations GraphQL `register` / `login` (`rememberMe` opcional) |
| Hash de senha | `bcryptjs` (12 rounds) |
| Access token | JWT HS256 via `jose`, claim `sv` = `sessionVersion` |
| Transporte do access | `Authorization: Bearer <token>` |
| Secret | `JWT_SECRET` (mín. 16 chars, só ambiente) |
| Expiração (remember) | `JWT_EXPIRES_IN` (padrão `15m`) + refresh cookie |
| Expiração (sessão de aba) | `JWT_EXPIRES_IN_SESSION` (padrão `8h`) em `sessionStorage` |
| Refresh | Cookie HttpOnly `financy_refresh` em `Path=/auth`; hash no banco; rotação |
| CSRF | Header obrigatório `X-Financy-CSRF: 1` em `/auth/refresh` e `/auth/logout` |
| Recuperação de senha | Tokens opacos CSPRNG (≥256 bits), só hash persistido; e-mail via transporte configurável |
| Rate limiting IP | TCP peer por padrão; `X-Forwarded-For` só se o peer estiver em `TRUSTED_PROXIES` |
| Issuer / audience | `financy-backend` / `financy-frontend` |
| Algoritmo aceito | apenas `HS256` |

Fluxo do contexto:

1. Extrair Bearer token.
2. Verificar assinatura, algoritmo, issuer, audience e expiração.
3. Confirmar que o usuário existe e que `sessionVersion` do JWT coincide com o banco.
4. Expor `userId` aos resolvers; **nunca** aceitar `userId` do cliente.

Fail-closed: token ausente, inválido, expirado ou revogado por `sessionVersion` → `UNAUTHENTICATED`.

### Lembrar-me

- Desmarcado: access token em memória + `sessionStorage` (sobrevive a reload da aba; não cria cookie de refresh).
- Marcado: access curto + cookie HttpOnly de refresh; bootstrap tenta `POST /auth/refresh` com `credentials: include`.
- Em desenvolvimento local, o Vite faz proxy de `/graphql` e `/auth` para o backend, mantendo cookies first-party.
- Logout chama `POST /auth/logout`, revoga a sessão no banco e limpa o cookie.
- Reset de senha incrementa `sessionVersion` e revoga todos os refresh tokens.

### Recuperação de senha

1. `requestPasswordReset(email)` — resposta genérica (sem enumeração); rate limit por IP+e-mail.
2. Transporte `file` grava o e-mail em `MAIL_DIR` (padrão `backend/.mail`) para demonstração local.
3. Transporte `smtp` usa Nodemailer com variáveis `SMTP_*` (sem credenciais no Git).
4. `resetPassword(token, newPassword)` consome o token em transação, troca o hash e invalida sessões.

### Prisma

- Runtime: Prisma ORM **7.10.1** + `@prisma/adapter-better-sqlite3` + `better-sqlite3`.
- CLI: `prisma.config.ts` fornece `DATABASE_URL`; client gerado em `backend/src/generated/prisma`.
- Advisory `GHSA-ggr8-5vv4-36mx` (`deepmerge-ts` &lt; 8): árvore efetiva usa `deepmerge-ts@8.0.2` via `@prisma/config@7.10.1`. `npm audit --omit=dev` = 0 vulnerabilidades.

## Isolamento / ownership

- Toda leitura/escrita de Category e Transaction filtra por `{ id, userId }`.
- Categoria de outro usuário é tratada como `NOT_FOUND` (sem vazamento).
- Associação de transação a categoria alheia é bloqueada.
- Listagens nunca cruzam dados entre usuários.

## Contratos GraphQL (Etapa 2)

### Públicas

```graphql
mutation Register($input: RegisterInput!) {
  register(input: $input) { token user { id name email } }
}

mutation Login($input: LoginInput!) {
  login(input: $input) { token user { id name email } }
}

query Health { health { status service timestamp database } }
```

### Privadas (Bearer)

```graphql
query Me { me { id name email createdAt updatedAt } }
mutation UpdateMe($input: UpdateMeInput!) { updateMe(input: $input) { id name email } }

query Categories { categories { id name description icon color createdAt updatedAt } }
mutation CreateCategory($input: CreateCategoryInput!) {
  createCategory(input: $input) { id name }
}
mutation UpdateCategory($id: ID!, $input: UpdateCategoryInput!) {
  updateCategory(id: $id, input: $input) { id name }
}
mutation DeleteCategory($id: ID!) { deleteCategory(id: $id) { id name } }

query Transactions {
  transactions {
    id description amount type date categoryId
    category { id name }
  }
}
mutation CreateTransaction($input: CreateTransactionInput!) {
  createTransaction(input: $input) {
    id description amount type date categoryId category { id name }
  }
}
mutation UpdateTransaction($id: ID!, $input: UpdateTransactionInput!) {
  updateTransaction(id: $id, input: $input) { id description amount }
}
mutation DeleteTransaction($id: ID!) { deleteTransaction(id: $id) { id } }
```

Códigos de erro previstos em `extensions.code`:

- `UNAUTHENTICATED`
- `BAD_USER_INPUT`
- `NOT_FOUND`
- `CONFLICT`
- `CATEGORY_IN_USE`
- `INTERNAL_SERVER_ERROR`

## Tratamento de erros

- Mensagens de login genéricas (`Invalid email or password.`) — sem revelar existência de conta.
- Sem exposição de `passwordHash`, tokens ou stack traces ao cliente.
- Unicidade (e-mail / nome de categoria) → `CONFLICT`.
- Logs sem senhas, JWTs ou hashes.

## Política de CORS

- Origem: `CORS_ORIGIN` (padrão `http://localhost:5173`).
- Headers permitidos incluem `Authorization`.
- Sem `origin: '*'`.

## Variáveis de ambiente

| Variável | App | Uso |
|----------|-----|-----|
| `JWT_SECRET` | backend | Assinatura JWT (obrigatória) |
| `JWT_EXPIRES_IN` | backend | Access token com Lembrar-me (padrão `15m`) |
| `JWT_EXPIRES_IN_SESSION` | backend | Access token sem Lembrar-me (padrão `8h`) |
| `REFRESH_TOKEN_TTL_DAYS` | backend | Validade do refresh cookie (padrão `30`) |
| `TRUSTED_PROXIES` | backend | Allowlist de proxies para `X-Forwarded-For` (vazio = ignorar forwarded) |
| `DATABASE_URL` | backend | Prisma/SQLite |
| `PORT` | backend | Porta HTTP (padrão `4000`) |
| `CORS_ORIGIN` | backend | Origem frontend |
| `FRONTEND_URL` | backend | Base dos links de reset de senha |
| `MAIL_TRANSPORT` | backend | `file` \| `smtp` \| `memory` |
| `VITE_BACKEND_URL` | frontend | Endpoint GraphQL (`/graphql` via proxy local) |
| `VITE_DEV_PROXY_TARGET` | frontend | Destino do proxy Vite (`http://127.0.0.1:4000`) |

`.env` não versionado. Ver `backend/.env.example` e `frontend/.env.example` para o conjunto completo.

## Estratégia de testes

| Nível | Cobertura atual |
|-------|-----------------|
| Smoke | `health` |
| Integração GraphQL | Auth, CRUD, ownership, reset, refresh, rate limit — SQLite temporário |
| Frontend | AuthContext, páginas, retry GraphQL, logout resiliente |
| Aceitação / E2E browser | Playwright desktop e mobile |

## Dependências backend relevantes

- `graphql-yoga`, `graphql`
- `@prisma/client`, `prisma`, `@prisma/adapter-better-sqlite3`, `better-sqlite3`
- `bcryptjs`, `jose`, `nodemailer`
- `zod`, `dotenv`
- `vitest`

## Decisões conscientemente adiadas

- OAuth / RBAC / multi-instância com rate limit distribuído
- Next.js, REST, serviços cloud pagos
- Medição tipográfica Figma (`FIGMA_MEASUREMENT_BLOCKED`)
