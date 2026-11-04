# Arquitetura — Financy

Decisões técnicas da fundação (Etapa 1). O objetivo é uma aplicação simples, consistente e fácil de avaliar — sem abstrações desnecessárias.

## Organização frontend / backend

```text
financy-rocketseat/
├── backend/          # API GraphQL (Node.js + TypeScript)
│   ├── prisma/       # Schema e migrações
│   └── src/          # Servidor, schema GraphQL, env, Prisma client
├── frontend/         # SPA React + Vite + TypeScript
│   └── src/          # UI, cliente GraphQL, tema
└── docs/             # Requisitos, arquitetura, plano
```

- Repositório monorepo simples (dois pacotes npm independentes).
- Sem workspace tooling adicional nesta etapa.
- Sem compartilhamento de código tipado entre apps (pode ser revisado depois se necessário).

## Comunicação GraphQL

- Backend expõe um único endpoint HTTP GraphQL (`/graphql`) via **GraphQL Yoga** sobre `node:http`.
- Frontend consome o endpoint com **graphql-request** (cliente mínimo, sem cache complexo nesta etapa).
- Query de diagnóstico inicial: `health` — verifica disponibilidade da API e conectividade Prisma/SQLite.
- Mutations e queries de domínio (auth, categorias, transações) entram na Etapa 2/3.

**Por que GraphQL Yoga:** setup enxuto, CORS nativo, alinhado a Node HTTP padrão, sem acoplamento a framework web completo.

## Responsabilidades do servidor

1. Carregar e validar variáveis de ambiente.
2. Servir o schema GraphQL.
3. Aplicar política de CORS restrita.
4. Encapsular acesso ao banco via Prisma Client.
5. Propagar erros de forma previsível (GraphQL errors + falha controlada na inicialização).
6. (Futuro) Autenticar JWT e autorizar por proprietário dos recursos.

## Persistência — Prisma / SQLite

- Provider: `sqlite`
- URL via `DATABASE_URL` (exemplo: `file:./dev.db`)
- Schema inicial:

| Model | Papel |
|-------|--------|
| `User` | Conta; base do isolamento |
| `Category` | Categorias por usuário |
| `Transaction` | Transações por usuário, ligadas a categoria |

- Relacionamentos com `onDelete: Cascade` onde o proprietário é removido.
- Valores monetários em centavos (`Int`) para evitar imprecisão de ponto flutuante.
- Tipo de transação: enum `INCOME` | `EXPENSE`.

SQLite simplifica execução local. Migração para PostgreSQL permanece compatível com o enunciado se necessário na entrega.

## Estratégia prevista de autenticação

| Item | Decisão |
|------|---------|
| Mecanismo | JWT (Bearer) |
| Secret | `JWT_SECRET` apenas via ambiente |
| Hash de senha | Algoritmo dedicado (ex.: bcrypt) na Etapa 2 — não improvisar agora |
| Contexto GraphQL | `userId` resolvido a partir do token no context factory |
| Expiração / refresh | Definidos na Etapa 2 com critérios explícitos |

Nesta fundação o schema já prevê `passwordHash`; fluxos de cadastro/login **não** estão implementados.

## Isolamento de dados por usuário

- Toda Category e Transaction possui `userId`.
- Operações de leitura/escrita filtrarão e validarão ownership no servidor.
- Frontend nunca é fonte de confiança para autorização.
- Ausência de contexto autenticado ≠ permissão global.

## Tratamento de erros

**Backend**

- Falha de env na boot: processo encerra com mensagem clara.
- Erros GraphQL: mensagens tipadas; detalhes internos não vazam em produção.
- Erro de banco na query `health`: reportado no payload de diagnóstico sem derrubar o processo.

**Frontend**

- Estados explícitos: `idle` | `loading` | `success` | `error` na tela inicial de diagnóstico.
- Mensagens amigáveis; sem expor stack traces.

## Política de CORS

- Origem permitida configurável via `CORS_ORIGIN` (padrão: `http://localhost:5173`).
- Credentials habilitados para suporte futuro a cookies se necessário; autenticação prevista via Authorization header.
- Sem `origin: '*'`.

## Variáveis de ambiente

| Variável | App | Uso |
|----------|-----|-----|
| `JWT_SECRET` | backend | Assinatura JWT (obrigatória; validada no boot) |
| `DATABASE_URL` | backend | Conexão Prisma/SQLite |
| `PORT` | backend | Porta HTTP (padrão 4000) |
| `CORS_ORIGIN` | backend | Origem frontend permitida |
| `VITE_BACKEND_URL` | frontend | URL do endpoint GraphQL |

Arquivos `.env` não são versionados. Apenas `.env.example`.

## Estratégia de testes

| Nível | Etapa 1 | Próximas etapas |
|-------|---------|-----------------|
| Unitário / smoke | Query GraphQL `health`; renderização React | Serviços de domínio |
| Integração | — | Auth + CRUD com banco de teste |
| Aceitação | — | Fluxos ponta a ponta e revisão visual Figma |

Validações de qualidade da fundação: typecheck, lint, build, smoke GraphQL, renderização, `git diff --check`.

## Decisões conscientemente adiadas

- Next.js (proibido pelo enunciado)
- Tailwind / shadcn (opcionais; tema CSS variables suficiente na Etapa 1)
- React Query / RHF (justificáveis quando houver formulários e cache de lista)
- Camadas DDD / repositories genéricos
- Deploy e repositório público
