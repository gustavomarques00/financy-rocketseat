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

- Token JWT enviado como `Authorization: Bearer <token>`
- Persistência: memória + `sessionStorage` (não sobrevive ao fechar o navegador)
- **Não** é equivalente a cookie HttpOnly; XSS ainda pode ler o token
- Logout e falha `UNAUTHENTICATED` limpam token, usuário e estado financeiro carregado
- Páginas privadas não renderizam conteúdo antes do bootstrap da sessão

### Modais

1. Categoria (criar/editar)
2. Transação (criar/editar)

Visual alinhado ao preview Community + tema existente; fidelidade pixel-perfect **não** afirmada (`FIGMA_PARTIAL` em `docs/figma-screen-inventory.md`).

## Comunicação GraphQL

- Endpoint único: `POST /graphql` (GraphQL Yoga + `node:http`).
- Cliente previsto no frontend: `graphql-request`.
- Query pública de diagnóstico: `health`.
- Operações públicas: `health`, `register`, `login`.
- Operações privadas: `me`, CRUD de `categories` / `transactions`.

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
| `User` | Conta; e-mail único; `passwordHash` |
| `Category` | Categorias por usuário (`userId`, nome único por usuário) |
| `Transaction` | Transações por usuário; `amount` em centavos (`Int`); tipo `INCOME` \| `EXPENSE` |

- Remoção de usuário cascateia categorias e transações.
- Remoção de categoria com transações vinculadas é **bloqueada** (`onDelete: Restrict` + regra de domínio `CATEGORY_IN_USE`).
- SQLite local; PostgreSQL permanece opção futura do enunciado.

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
| Cadastro / login | Mutations GraphQL `register` / `login` |
| Hash de senha | `bcryptjs` (12 rounds) |
| Token | JWT HS256 via `jose` |
| Transporte | `Authorization: Bearer <token>` |
| Secret | `JWT_SECRET` (mín. 16 chars, só ambiente) |
| Expiração | `JWT_EXPIRES_IN` (padrão `7d`) |
| Issuer / audience | `financy-backend` / `financy-frontend` |
| Algoritmo aceito | apenas `HS256` |

Fluxo do contexto:

1. Extrair Bearer token.
2. Verificar assinatura, algoritmo, issuer, audience e expiração.
3. Confirmar que o usuário ainda existe.
4. Expor `userId` aos resolvers; **nunca** aceitar `userId` do cliente.

Fail-closed: token ausente, inválido ou expirado → `UNAUTHENTICATED` nas rotas privadas.

### Risco residual da sessão

O JWT fica em memória e em `sessionStorage`. Isso não equivale a cookie `HttpOnly`: um XSS na origem do frontend pode ler o token até a aba ser fechada. A autorização continua no servidor. Não há refresh token, OAuth ou RBAC porque não são requisitos obrigatórios.

A dependência de desenvolvimento `prisma` (via `deepmerge-ts`) possui advisory de alta severidade no CLI. Ela não entra no runtime do servidor GraphQL (`@prisma/client` usado pela API). Não houve upgrade major forçado nesta etapa.

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

query Categories { categories { id name createdAt updatedAt } }
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
| `JWT_EXPIRES_IN` | backend | Expiração JWT (padrão `7d`) |
| `DATABASE_URL` | backend | Prisma/SQLite |
| `PORT` | backend | Porta HTTP (padrão `4000`) |
| `CORS_ORIGIN` | backend | Origem frontend |
| `VITE_BACKEND_URL` | frontend | Endpoint GraphQL |

`.env` não versionado. `.env.example` contém apenas as chaves obrigatórias do enunciado no backend (`JWT_SECRET`, `DATABASE_URL`).

## Estratégia de testes

| Nível | Cobertura atual |
|-------|-----------------|
| Smoke | `health` |
| Integração GraphQL | Auth, CRUD, ownership, valores inválidos — SQLite temporário por suíte |
| Frontend | Renderização da tela inicial (Etapa 1) |
| Aceitação / E2E browser | Etapa 4 |

## Dependências backend relevantes

- `graphql-yoga`, `graphql`
- `@prisma/client`, `prisma`
- `bcryptjs`, `jose`
- `zod`, `dotenv`
- `vitest`

## Decisões conscientemente adiadas

- Frontend funcional (Etapa 3)
- Refresh tokens, OAuth, recuperação de senha, RBAC
- Next.js, REST, serviços cloud
- Deploy e repositório público
