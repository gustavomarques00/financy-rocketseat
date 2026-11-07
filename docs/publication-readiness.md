# Checklist de publicação — Financy

A visibilidade pública foi aplicada depois das etapas de desenvolvimento, nas quais o repositório permaneceu privado. O envio à Rocketseat **não foi executado**.

## Estado atual

- Repositório: `gustavomarques00/financy-rocketseat`
- Visibilidade: **PUBLIC**
- HEAD da `main` validado na Execução 20: `dd095a04ec23be2e2c4005abb790e35869639ebc` (merge da PR #11)
- Autenticação completa: cadastro, login, Lembrar-me (refresh HttpOnly), logout resiliente, recuperação e redefinição de senha
- Prisma ORM **7.10.1** + adapter SQLite (`better-sqlite3`); advisory `GHSA-ggr8-5vv4-36mx` resolvido (`deepmerge-ts@8.0.2`)
- Figma: `FIGMA_PARTIAL`. Logo oficial em `frontend/src/assets/logo.svg`. A escala tipográfica não foi medida (`FIGMA_MEASUREMENT_BLOCKED`)
- Conta: o nome é editado por `updateMe`; o e-mail permanece somente leitura
- Submissão acadêmica: **não realizada** (`NOT_SUBMITTED`)

## Requisitos obrigatórios

| Área | Estado | Observação |
|------|--------|------------|
| Backend TypeScript, GraphQL, Prisma, SQLite | PASS | Prisma 7 + SQLite |
| Cadastro, login, JWT, hash | PASS | Testes GraphQL |
| Recuperação de senha e Lembrar-me | PASS | PR #11 |
| CRUD e isolamento por usuário | PASS | Testes GraphQL e Playwright |
| Frontend React, TypeScript, Vite, GraphQL | PASS | Sem Next.js |
| Dashboard, categorias, transações, modais | PASS | Playwright desktop e mobile |
| Referência visual ao Figma | PARTIAL | Tipografia não medida |
| `.env.example` em backend e frontend | PASS | Sem valores reais |
| README reproduzível | PASS | Instalação, migration, testes e E2E |

## Testes reexecutados na Execução 20 (pós-merge)

| Gate | Resultado |
|------|-----------|
| Backend typecheck, `npm test`, build | PASS — 46 testes |
| Frontend typecheck, lint, `npm test`, build | PASS — 22 testes |
| Playwright desktop e mobile | PASS — 6 |
| `npm audit --omit=dev` (backend) | PASS — 0 vulnerabilidades |
| Clone limpo público + `npm ci` + smoke register/`me`/logout | PASS |

## Segurança

- Nenhum `.env` ou banco SQLite está versionado.
- O histórico Git não contém `JWT_SECRET` real; só o placeholder documentado.
- Logs do servidor não imprimem senha, hash ou token bruto de reset.
- Ownership continua no servidor, filtrado por `userId`.
- CORS usa a origem configurada, sem `*` com credentials.
- Access JWT em memória/`sessionStorage` ainda é legível por XSS na aba; o refresh fica em cookie HttpOnly.
- Rate limiting usa o IP do socket por padrão; `X-Forwarded-For` só com `TRUSTED_PROXIES`.
- Logout limpa o estado local imediatamente; a revogação remota é best-effort se a rede falhar.
- `npm audit --omit=dev` no backend: 0 vulnerabilidades após Prisma 7.10.1.

## Pendências

1. Medir a escala tipográfica Figma (`FIGMA_MEASUREMENT_BLOCKED`). `FIGMA_PARTIAL` permanece por isso.
2. Envio manual na plataforma Rocketseat. A publicação no GitHub não registra esse envio.

## Publicação

1. A visibilidade foi alterada para pública com autorização explícita.
2. Nenhum `.env` ou `.db` faz parte da árvore Git.
3. O README descreve instalação, migration, e-mail local, Lembrar-me e execução local.
4. Secrets não entram no README nem em issues.

## Submissão manual futura

1. Usar o repositório público como entrega: https://github.com/gustavomarques00/financy-rocketseat
2. Seguir o enunciado em https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy?module_slug=avaliacao-de-expansao-de-habilidades
3. Informar as limitações visuais `FIGMA_PARTIAL` se a plataforma pedir observações.
4. Registrar o envio fora deste repositório apenas depois de concluído.
