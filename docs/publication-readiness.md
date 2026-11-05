# Checklist de publicação — Financy

Este documento prepara uma decisão futura. A publicação e o envio à Rocketseat **não foram executados**.

## Estado atual

- Repositório: `gustavomarques00/financy-rocketseat`
- Visibilidade: **PRIVATE**
- `main` conhecida antes desta etapa: `a81e6ef6e76bc964fdbdf017ebb722b8f86cb4d1`
- Figma: `FIGMA_PARTIAL` (estrutura das seis telas; logo oficial, escala tipográfica e texto dos overlays de Gestão ainda incompletos)
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
| Referência visual ao Figma | PARTIAL | Estrutura comparada; detalhes do Style Guide e dos overlays ainda incompletos |
| `.env.example` em backend e frontend | PASS | Sem valores reais |
| README reproduzível | PASS | Instalação, migration, testes e E2E |

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

## Pendências que não bloqueiam a revisão, mas impedem declarar entrega concluída

1. Autorização explícita para tornar o repositório público.
2. Leitura restante do Style Guide, do SVG oficial e dos overlays de Gestão, se a API do Figma voltar a responder.
3. Envio manual na plataforma Rocketseat depois da publicação.

## Publicação manual futura

1. Reler este checklist e a matriz.
2. Confirmar que nenhum `.env` ou `.db` entrou no Git.
3. Alterar a visibilidade para pública somente com autorização.
4. Conferir se o README permite clonar, instalar, migrar e subir os dois apps.
5. Não incluir secrets no README nem em issues.

## Submissão manual futura

1. Usar o repositório público como entrega.
2. Seguir o enunciado em https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy?module_slug=avaliacao-de-expansao-de-habilidades
3. Informar as limitações visuais `FIGMA_PARTIAL` se a plataforma pedir observações.
4. Registrar o envio fora deste repositório apenas depois de concluído.
