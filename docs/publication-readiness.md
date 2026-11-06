# Checklist de publicação — Financy

A visibilidade pública foi aplicada depois das etapas de desenvolvimento, nas quais o repositório permaneceu privado. O envio à Rocketseat **não foi executado**.

## Estado atual

- Repositório: `gustavomarques00/financy-rocketseat`
- Visibilidade: **PUBLIC**
- A versão atual da branch `main` deve ser consultada diretamente no GitHub. Os SHAs abaixo são marcos históricos de validação e publicação.
- Baseline funcional validado: `be4e0790eee0c397edc4d67518c6cf6b99b7c500`
- Atualização documental pública posteriormente confirmada: `52505461829e39fb655a4555d86561ee24f75222`
- Os commits entre esse baseline e o marco documental alteram somente Markdown. As suítes não foram reexecutadas nesses commits.
- Figma: `FIGMA_PARTIAL` (Style Guide conferido por cinco capturas do usuário; logo oficial, escala tipográfica e texto dos overlays de Gestão ainda incompletos)
- Conta: nome e e-mail somente para consulta; sem mutation de perfil
- Submissão acadêmica: não realizada

## Requisitos obrigatórios

| Área | Estado | Observação |
|------|--------|------------|
| Backend TypeScript, GraphQL, Prisma, SQLite | PASS | Evidência na matriz |
| Cadastro, login, JWT, hash | PASS | Testes GraphQL |
| CRUD e isolamento por usuário | PASS | Testes GraphQL e Playwright |
| Frontend React, TypeScript, Vite, GraphQL | PASS | Sem Next.js |
| Dashboard, categorias, transações, modais | PASS | Playwright desktop e mobile |
| Referência visual ao Figma | PARTIAL | Seis telas comparadas na cópia compartilhada; Style Guide e overlays de Gestão ainda incompletos |
| `.env.example` em backend e frontend | PASS | Sem valores reais |
| README reproduzível | PASS | Instalação, migration, testes e E2E |

## Testes reexecutados na Execução 13

| Gate | Resultado |
|------|-----------|
| Backend typecheck, `npm test`, build | PASS — 24 testes |
| Frontend typecheck, lint, `npm test`, build | PASS — 15 testes |
| Playwright desktop e mobile | PASS — 6 |
| QA visual local | SQLite temporário em `%TEMP%\financy-visual-13`; telas e os dois modais abertos em 1280×800; transações em 390×844 sem overflow horizontal |

## Testes reexecutados na Etapa 9

| Gate | Resultado |
|------|-----------|
| Backend typecheck, `npm test`, build | PASS — 24 testes |
| Frontend typecheck, lint, `npm test`, build | PASS — 15 testes |
| Playwright desktop e mobile | PASS — 6 |
| Isolamento entre usuários | PASS — suíte GraphQL e Playwright |

## Segurança

- Nenhum `.env` ou banco SQLite está versionado.
- O histórico Git não contém `JWT_SECRET` real; só o placeholder documentado.
- Logs do servidor não imprimem senha, hash ou token.
- Ownership continua no servidor, filtrado por `userId`.
- CORS usa a origem configurada, sem `*`.
- JWT em `sessionStorage` não equivale a cookie HttpOnly. Risco residual de XSS documentado em `docs/architecture.md`.
- `npm audit --omit=dev` no backend ainda aponta `prisma`, `@prisma/config` e `deepmerge-ts` (GHSA-ggr8-5vv4-36mx). O pacote afetado é o CLI, dependência de desenvolvimento. `@prisma/client` não aparece no relatório. A correção indicada é Prisma 7, um upgrade major, e não foi aplicada.

## Pendências

1. Leitura restante do Style Guide, do SVG oficial e dos overlays de Gestão. O limite do plano Starter impediu nova leitura via MCP. Isso mantém `FIGMA_PARTIAL`.
2. Envio manual na plataforma Rocketseat. A publicação no GitHub não registra esse envio.

## Publicação

1. A visibilidade foi alterada para pública com autorização explícita.
2. Nenhum `.env` ou `.db` faz parte da árvore Git.
3. O README continua descrevendo instalação, migration e execução local.
4. Secrets não entram no README nem em issues.

## Submissão manual futura

1. Usar o repositório público como entrega.
2. Seguir o enunciado em https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy?module_slug=avaliacao-de-expansao-de-habilidades
3. Informar as limitações visuais `FIGMA_PARTIAL` se a plataforma pedir observações.
4. Registrar o envio fora deste repositório apenas depois de concluído.
