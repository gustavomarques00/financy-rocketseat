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

**Status:** esta execução.

---

## Etapa 3 — Frontend Functional

**Objetivo:** aplicação utilizável alinhada ao Figma.

### Entregáveis

- Fluxos de autenticação (cadastro/login)
- Sessão no cliente
- Dashboard autenticado
- Listagem e formulários de transações e categorias
- Integração GraphQL com o Backend Core
- Estados de erro e carregamento
- Interface conforme Figma oficial

### Critérios de conclusão

1. Cadastro e login funcionam ponta a ponta contra o backend local
2. Rotas autenticadas redirecionam usuário não logado
3. Dashboard reflete dados reais do usuário autenticado
4. CRUD operável pela UI
5. Erros de API compreensíveis
6. Revisão visual mínima contra o Figma
7. Lint, typecheck e build do frontend passam

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

### Critérios de conclusão

1. Requisitos obrigatórios atendidos
2. README permite subir backend e frontend do zero
3. Auditoria de segurança sem findings bloqueantes
4. Repositório público apenas após autorização
5. Entrega registrada na Rocketseat

---

## Dependências entre etapas

```text
Etapa 1 (Foundation) ✓
    └── Etapa 2 (Backend Core) ← atual
            └── Etapa 3 (Frontend Functional)
                    └── Etapa 4 (Acceptance & Submission)
```

## Fora de escopo até autorização explícita

- Merge da PR da Etapa 2 (revisão humana)
- Deploy em produção
- Tornar o repositório público
- Publicação no LinkedIn
- Alterações na Engineering Knowledge Base
