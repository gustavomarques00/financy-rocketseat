# Plano de implementação — Financy

Entregas verificáveis sem datas arbitrárias. Cada etapa possui critérios objetivos de conclusão.

---

## Etapa 1 — Foundation

**Objetivo:** estrutura inicial e infraestrutura mínima de desenvolvimento.

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
11. Fundação integrada na `main`

**Status:** concluída (PR #1 mergeada).

---

## Etapa 2 — Backend Core

**Objetivo:** domínio autenticado e CRUD completo via GraphQL.

### Entregáveis

- Cadastro e login com JWT
- Contexto GraphQL autenticado (`Authorization: Bearer`)
- Autorização por proprietário (`userId`)
- CRUD de categorias
- CRUD de transações
- Política monetária em centavos inteiros
- Testes de integração (auth + ownership + CRUD)
- Documentação de contratos GraphQL

### Critérios de conclusão

1. Usuário consegue se cadastrar e autenticar via GraphQL
2. Token JWT inválido/ausente/expirado bloqueia operações protegidas
3. Usuário A não lê/altera/exclui dados do usuário B
4. CRUD de categorias e transações cobre create/list/update/delete
5. Validação de entrada (campos, valores, ownership de categoria)
6. Exclusão de categoria com transações é bloqueada
7. Testes de integração passam contra SQLite temporário
8. Typecheck e build do backend passam
9. Frontend existente continua compilando
10. Nenhum secret commitado
11. PR `feat/financy-backend-core` aberta (sem merge automático nesta execução)

**Status:** concluída (PR #2 mergeada).

---

## Etapa 3 — Frontend Functional

**Objetivo:** aplicação utilizável alinhada às referências Figma verificáveis.

### Entregáveis

- Fluxos de autenticação (cadastro/login/logout)
- Sessão no cliente (Bearer JWT)
- Dashboard autenticado com dados reais
- CRUD de categorias e transações via GraphQL
- Dois modais de formulário
- Estados de erro e carregamento
- Inventário Figma (`FIGMA_PARTIAL` quando frames oficiais inacessíveis)

### Critérios de conclusão

1. Cadastro e login funcionam pela interface contra o backend local
2. Rotas autenticadas redirecionam usuário não logado
3. Dashboard reflete dados reais do usuário autenticado
4. CRUD de categorias e transações operável pela UI
5. Erros de API compreensíveis; `CATEGORY_IN_USE` tratado
6. Limitações do Figma documentadas sem inventar frames
7. Lint, typecheck, testes e build do frontend passam
8. Backend continua passando nos testes
9. PR `feat/financy-frontend-functional` integrada

**Status:** concluída (PR #3 mergeada).

---

## Etapa 4 — Acceptance & Submission

**Objetivo:** prontidão para entrega na Rocketseat.

### Entregáveis

- Testes funcionais de aceitação
- Revisão checklist de requisitos
- Verificação visual final
- README de execução completo
- Auditoria de segurança
- Preparação para publicação (pública **somente** com autorização explícita)
- Submissão na Rocketseat

### Critérios de conclusão desta execução

1. PR #3 integrada na `main`
2. Matriz de requisitos criada com evidência de código e testes
3. Playwright cobre cadastro, CRUD, totais, logout, rota protegida e isolamento visual
4. README permite instalar, migrar, executar e testar
5. Auditoria de segurança documentada, sem correção fora do escopo obrigatório
6. Repositório permanece privado
7. Submissão à Rocketseat **não** é feita nesta execução

**Status da etapa:** PR #4 integrada na `main`. O checklist `docs/publication-readiness.md` registra a revisão da época. Nesta etapa a publicação e o envio permaneceram pendentes.

---

## Dependências entre etapas

```text
Etapa 1 (Foundation) ✓
    └── Etapa 2 (Backend Core) ✓
            └── Etapa 3 (Frontend Functional) ✓
                    └── Etapa 4 (Acceptance & Submission) ← atual
```

## Fora de escopo até autorização explícita

- Merge da PR da Etapa 4
- Deploy em produção
- Tornar o repositório público
- Submissão na Rocketseat
- Publicação no LinkedIn
- Alterações na Engineering Knowledge Base

A visibilidade pública foi aplicada depois dessas etapas, com autorização explícita. O envio à Rocketseat permanece pendente e não está registrado neste repositório.
