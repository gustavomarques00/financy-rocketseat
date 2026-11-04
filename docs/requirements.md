# Requisitos — Financy

Documento de requisitos obrigatórios para a avaliação prática Financy (Rocketseat — Fase 3, Expansão de Habilidades).

**Fontes prioritárias**

- Enunciado oficial: [TD 360 — Desafio prático Fase 3 Financy](https://ftr.rocketseat.com.br/projects/td-360-desafio-pratico-da-fase-3-financy?module_slug=avaliacao-de-expansao-de-habilidades)
- Design: [Figma Community — Financy](https://www.figma.com/community/file/1580994817007013257/financy)

**Limitação de acesso**

- O enunciado na plataforma FTR exige autenticação de aluno; o conteúdo completo da página não pôde ser extraído automaticamente nesta execução.
- O arquivo do Figma Community não possui `fileKey` compatível com a API/MCP de design (chave numérica de community). Tokens e frames detalhados não foram inspecionados nó a nó. O preview público e a descrição do arquivo foram usados apenas para orientação de tema base.
- Não inventar telas ou regras de negócio além do que estiver documentado aqui e no enunciado/Figma quando acessíveis.

---

## 1. Funcionais do backend

### Obrigatórios (produto final)

| ID | Requisito |
|----|-----------|
| BE-01 | Cadastro de usuário |
| BE-02 | Login de usuário |
| BE-03 | Isolamento das informações por usuário autenticado |
| BE-04 | Criar, listar, editar e excluir transações |
| BE-05 | Criar, listar, editar e excluir categorias |
| BE-06 | API GraphQL como canal de comunicação |

### Escopo da Etapa 1 (Foundation) — obrigatório agora

| ID | Requisito |
|----|-----------|
| BE-F1 | Projeto Node.js com TypeScript |
| BE-F2 | Servidor HTTP com endpoint GraphQL funcional |
| BE-F3 | Prisma configurado com SQLite |
| BE-F4 | Schema inicial fundamentado nos requisitos (User, Category, Transaction) |
| BE-F5 | Carregamento e validação de variáveis de ambiente |
| BE-F6 | CORS explícito e restrito ao frontend local |
| BE-F7 | Tratamento inicial de erros |
| BE-F8 | Scripts de desenvolvimento, build e typecheck |
| BE-F9 | Query de diagnóstico GraphQL testável |

**Fora do escopo da Etapa 1:** autenticação JWT completa, CRUD de categorias/transações, autorização por proprietário.

---

## 2. Funcionais do frontend

### Obrigatórios (produto final)

| ID | Requisito |
|----|-----------|
| FE-01 | Cadastro |
| FE-02 | Login |
| FE-03 | Dashboard autenticado |
| FE-04 | Gerenciamento de transações |
| FE-05 | Gerenciamento de categorias |
| FE-06 | Comunicação com o backend via GraphQL |
| FE-07 | Interface alinhada ao Figma oficial |

### Escopo da Etapa 1 (Foundation) — obrigatório agora

| ID | Requisito |
|----|-----------|
| FE-F1 | React + TypeScript + Vite (sem Next.js) |
| FE-F2 | Estrutura de componentes |
| FE-F3 | Cliente GraphQL configurado |
| FE-F4 | Configuração de ambiente (`VITE_BACKEND_URL`) |
| FE-F5 | Tema base fundamentado no Figma (orientação visual pública) |
| FE-F6 | Tela inicial funcional |
| FE-F7 | Estados básicos de carregamento e erro |
| FE-F8 | Scripts de desenvolvimento, lint e build |
| FE-F9 | Teste básico de renderização |

**Proibido nesta etapa:** dashboard fictício com dados simulados apresentados como reais; telas completas sem inspeção adequada do Figma.

---

## 3. Não funcionais

| ID | Requisito | Obrigatoriedade |
|----|-----------|-----------------|
| NF-01 | TypeScript no backend e no frontend | Obrigatório |
| NF-02 | Persistência via Prisma | Obrigatório |
| NF-03 | SQLite inicialmente (PostgreSQL permitido pelo enunciado como alternativa) | Obrigatório nesta fundação |
| NF-04 | Isolamento de dados por usuário autenticado (produto final) | Obrigatório |
| NF-05 | Não versionar `.env`, bancos SQLite reais ou secrets | Obrigatório |
| NF-06 | CORS restrito (não irrestrito) | Obrigatório |
| NF-07 | JWT secret apenas via ambiente | Obrigatório |
| NF-08 | Código funcional e avaliável | Obrigatório |
| NF-09 | Aplicação simples, consistente e fácil de avaliar | Obrigatório |

---

## 4. Configuração

### Backend — `backend/.env.example` (obrigatório)

```env
JWT_SECRET=
DATABASE_URL=
```

Variáveis previstas adicionais de desenvolvimento (documentadas, não obrigatórias no exemplo mínimo do enunciado):

- `PORT` — porta do servidor GraphQL (padrão `4000`)
- `CORS_ORIGIN` — origem permitida do frontend (padrão `http://localhost:5173`)

### Frontend — `frontend/.env.example` (obrigatório)

```env
VITE_BACKEND_URL=
```

### Estrutura de pastas (obrigatória na entrega)

- `backend/`
- `frontend/`

---

## 5. Design

| ID | Requisito | Obrigatoriedade |
|----|-----------|-----------------|
| DS-01 | Interface baseada no Figma oficial Financy | Obrigatório (produto final) |
| DS-02 | Site desktop de organização financeira | Obrigatório |
| DS-03 | Gestão visual de transações e categorias | Obrigatório (produto final) |
| DS-04 | Tema base alinhado ao preview público (fundo claro, cartões de resumo, lista de transações) | Orientação Etapa 1 |

**Bibliotecas de UI opcionais (quando justificadas):** Tailwind CSS, shadcn/ui, React Query, React Hook Form, Zod.

Não adicionar dependências apenas por preferência.

---

## 6. Entrega (avaliação Rocketseat)

A avaliação exige:

| Critério | Obrigatoriedade | Observação |
|----------|-----------------|------------|
| Repositório **público** na entrega | Obrigatório na entrega | Atendido somente após revisão de segurança e autorização explícita |
| Pastas `backend/` e `frontend/` | Obrigatório | |
| Código funcional | Obrigatório | |
| Arquivos `.env.example` | Obrigatório | |
| Comunicação GraphQL | Obrigatório | |
| Frontend React com Vite | Obrigatório | Sem Next.js |
| Interface baseada no Figma | Obrigatório | |

### Condições desta execução (Foundation)

- Repositório permanece **privado**
- Sem merge automático
- Sem deploy
- Sem publicação no LinkedIn
- Sem alteração da Engineering Knowledge Base (`gustavomarques00/devflow-engineering-knowledge-base`)

---

## 7. Stack tecnológica

### Backend (obrigatório)

- Node.js
- TypeScript
- GraphQL
- Prisma
- SQLite

### Frontend (obrigatório)

- React
- TypeScript
- Vite sem framework
- GraphQL para comunicação com o backend

### Opcional

- Tailwind CSS
- shadcn/ui
- React Query
- React Hook Form
- Zod (usado no backend para validação de ambiente — justificado)
