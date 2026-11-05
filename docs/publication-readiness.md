# Checklist de publicação — Financy

Este documento prepara uma decisão futura. A publicação e o envio à Rocketseat **não foram executados**.

## Estado atual

- Repositório: `gustavomarques00/financy-rocketseat`
- Visibilidade: **PRIVATE**
- `main`: merge da PR #4 incluído
- Figma: `FIGMA_PARTIAL` (seis telas comparadas em `docs/figma-fidelity-audit.md`; overlays de Gestão e escala tipográfica ainda incompletos)
- Submissão acadêmica: não realizada

## Requisitos obrigatórios

| Área | Estado | Observação |
|------|--------|------------|
| Backend TypeScript, GraphQL, Prisma, SQLite | PASS | Evidência na matriz |
| Cadastro, login, JWT, hash | PASS | Testes GraphQL |
| CRUD e isolamento por usuário | PASS | Testes GraphQL e Playwright |
| Frontend React, TypeScript, Vite, GraphQL | PASS | Sem Next.js |
| Dashboard, categorias, transações, modais | PASS | Playwright desktop e mobile |
| Referência visual ao Figma | PARTIAL | Frames oficiais inacessíveis |
| `.env.example` em backend e frontend | PASS | Sem valores reais |
| README reproduzível | PASS | Instalação, migration, testes e E2E |

## Testes reexecutados após o merge da PR #4

| Gate | Resultado |
|------|-----------|
| Backend `npm test` | PASS — 24 |
| Frontend `npm test` | PASS — 13 |
| Playwright desktop e mobile | PASS — 6 |
| Typecheck, lint e build | PASS na verificação imediatamente anterior ao merge, sobre o mesmo conteúdo integrado |

## Segurança

- Nenhum `.env` ou banco SQLite está versionado.
- O histórico Git não contém `JWT_SECRET` real; só o placeholder documentado.
- Logs do servidor não imprimem senha, hash ou token.
- Ownership continua no servidor, filtrado por `userId`.
- CORS usa a origem configurada, sem `*`.
- JWT em `sessionStorage` não equivale a cookie HttpOnly. Risco residual de XSS documentado em `docs/architecture.md`.
- Advisory `deepmerge-ts` afeta o CLI do Prisma (`prisma` / `@prisma/config`), não o runtime GraphQL. Sem upgrade major.

## Pendências que não bloqueiam a revisão, mas impedem declarar entrega concluída

1. Autorização explícita para tornar o repositório público.
2. Inspeção dos frames oficiais do Figma, se o arquivo for aberto com chave válida.
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
