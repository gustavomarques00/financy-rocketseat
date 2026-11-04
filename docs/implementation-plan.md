# Plano de implementação — Financy

Entregas verificáveis sem datas arbitrárias. Cada etapa possui critérios objetivos de conclusão.

---

## Etapa 1 — Foundation

**Objetivo:** estrutura inicial e infraestrutura mínima de desenvolvimento.

### Entregáveis

- Repositório GitHub privado independente
- `backend/` com Node.js, TypeScript, GraphQL, Prisma, SQLite
- `frontend/` com React, TypeScript, Vite, cliente GraphQL
- Documentação: `requirements.md`, `architecture.md`, `implementation-plan.md`
- `.env.example` em backend e frontend
- Query de diagnóstico GraphQL
- Tela inicial com estados de carregamento/erro
- Testes básicos e scripts de qualidade
- Branch `feat/financy-foundation` e PR para `main`

### Critérios de conclusão

1. Repositório privado existe
2. Diretórios `backend/` e `frontend/` independentes
3. Backend GraphQL inicia localmente
4. Prisma configurado com SQLite
5. Frontend React/Vite inicia localmente
6. Integração GraphQL básica funcional
7. Requisitos e plano documentados
8. `.env.example` corretos
9. Testes básicos passam
10. Segredos protegidos pelo `.gitignore`
11. PR aberta para revisão (sem merge)

**Status:** esta execução.

---

## Etapa 2 — Backend Core

**Objetivo:** domínio autenticado e CRUD completo via GraphQL.

### Entregáveis

- Modelos Prisma finalizados e migrados
- Cadastro de usuário
- Login com JWT
- Contexto GraphQL autenticado
- Autorização por proprietário (`userId`)
- CRUD de categorias
- CRUD de transações
- Testes de integração (auth + ownership + CRUD)

### Critérios de conclusão

1. Usuário consegue se cadastrar e autenticar via GraphQL
2. Token JWT inválido/ausente bloqueia operações protegidas
3. Usuário A não lê/altera/exclui dados do usuário B
4. CRUD de categorias e transações cobre create/list/update/delete
5. Validação de entrada (campos obrigatórios, tipos, ownership de categoria)
6. Testes de integração passam contra SQLite de teste
7. Typecheck e build do backend passam
8. Nenhum secret commitado

---

## Etapa 3 — Frontend Functional

**Objetivo:** aplicação utilizável alinhada ao Figma.

### Entregáveis

- Fluxos de autenticação (cadastro/login)
- Sessão no cliente (armazenamento seguro do token; sem secrets de servidor)
- Dashboard autenticado
- Listagem e formulários de transações e categorias
- Integração GraphQL com o Backend Core
- Estados de erro e carregamento nas telas de domínio
- Interface conforme Figma oficial (após inspeção adequada dos frames)

### Critérios de conclusão

1. Cadastro e login funcionam ponta a ponta contra o backend local
2. Rotas autenticadas redirecionam usuário não logado
3. Dashboard reflete dados reais do usuário autenticado (sem mock apresentado como real)
4. CRUD de categorias e transações operável pela UI
5. Erros de API são exibidos de forma compreensível
6. Revisão visual mínima contra o Figma (telas principais)
7. Lint, typecheck e build do frontend passam

---

## Etapa 4 — Acceptance & Submission

**Objetivo:** prontidão para entrega na Rocketseat.

### Entregáveis

- Testes funcionais de aceitação
- Revisão checklist de requisitos
- Verificação visual final
- README de execução completo
- Auditoria de segurança (secrets, CORS, authz, `.gitignore`)
- Preparação para publicação (repositório público **somente** com autorização explícita)
- Submissão na plataforma Rocketseat

### Critérios de conclusão

1. Todos os requisitos obrigatórios de `docs/requirements.md` marcados como atendidos
2. README permite a um avaliador subir backend e frontend do zero
3. Auditoria de segurança sem findings bloqueantes
4. Repositório público apenas após autorização e limpeza de histórico sensível (se houver)
5. Entrega registrada na Rocketseat conforme instruções do enunciado

---

## Dependências entre etapas

```text
Etapa 1 (Foundation)
    └── Etapa 2 (Backend Core)
            └── Etapa 3 (Frontend Functional)
                    └── Etapa 4 (Acceptance & Submission)
```

A Etapa 3 pode iniciar parcialmente em paralelo ao final da Etapa 2 (cliente GraphQL/auth UI), mas o dashboard com dados reais depende do Backend Core.

## Fora de escopo até autorização explícita

- Merge da PR de fundação (revisão humana)
- Deploy em produção
- Tornar o repositório público
- Publicação no LinkedIn
- Alterações na Engineering Knowledge Base
