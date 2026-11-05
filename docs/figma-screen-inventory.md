# Inventário visual — Financy (Figma)

**Referência oficial:** https://www.figma.com/design/IR3TQC9ofQKZ2km01tq8EB/Financy--Community-?node-id=0-1

**Status geral da auditoria:** `FIGMA_PARTIAL`

Revisão da Etapa 7: o arquivo `IR3TQC9ofQKZ2km01tq8EB` foi aberto no editor. As seis telas oficiais e o quadro de cores `1085:713` foram comparados. A estrutura passou a usar a navegação superior, Inter e as cores lidas. O detalhe interno dos overlays de Gestão e a escala tipográfica completa continuam sem leitura número a número. Na Etapa 9 a API continuou limitada; a página de conta passou a ser somente consulta. Ver `docs/figma-fidelity-audit.md`.

Revisão da Etapa 5 (5 nov 2026):

- A API de design rejeitou o identificador público `1580994817007013257` (`Invalid fileKey`).
- A página Community chegou a expor o título Financy, o autor Rocketseat e o texto “site desktop de organização de finanças, com gestão de transações e categorias”, além dos controles Open in Figma e Preview.
- O fluxo seguinte abriu as preferências de cookies e não revelou frames, Style Guide, tokens, tipografia ou espaçamentos oficiais.
- Nenhuma divergência visual nova foi comprovada contra um frame oficial. Por isso nenhuma tela foi redesenhada nesta execução.

Classificação desta revisão: todas as telas abaixo permanecem `PARTIAL` ou `NOT_VERIFIED`. Nenhuma recebeu `MATCH`.

## Limitações de acesso

| Tentativa | Resultado |
|-----------|-----------|
| Community page (browser) | Preview público e descrição acessíveis em execuções anteriores; nesta execução a UI ficou obstruída por preferências de cookies / login |
| MCP Figma (`create_session`) | `fileKey` numérico de Community rejeitado (`Invalid fileKey`) |
| Frames oficiais no arquivo `IR3TQC9ofQKZ2km01tq8EB` | Login `3101:353`, Cadastro `3103:1915`, Dashboard `3103:1987`, Transações `3104:362`, Categorias `3104:2028`, Perfil `3104:2925` inspecionados na Etapa 7 |
| Style Guide e Gestão | Cores principais lidas; escala tipográfica e texto interno dos dois overlays de Gestão ainda incompletos |

**Regra seguida:** não inventar nomes oficiais de frames/tokens. Implementação visual alinhada ao preview público (dashboard claro, cartões de resumo, lista de transações, identidade verde) e aos requisitos textuais.

---

## Inventário funcional (derivado de requisitos + preview)

| Screen | Frame / Reference | Purpose | Main Components | Required Behavior | Responsive Notes | Status |
|--------|-------------------|---------|-----------------|-------------------|------------------|--------|
| Login | Community preview / requisitos | Autenticar usuário existente | Formulário e-mail/senha, CTA, link para cadastro | `login` GraphQL; redireciona ao dashboard | Desktop prioritário (enunciado); layout mobile adaptado | Parcial |
| Cadastro | Requisitos textuais | Criar conta | Nome, e-mail, senha | `register` GraphQL; inicia sessão | Adaptado | Parcial |
| Dashboard (`/`) | Preview Community (cards + lista) | Resumo financeiro autenticado | Cards saldo/receitas/despesas; transações recentes | Dados reais via `transactions`; login se deslogado | Desktop + mobile | Parcial |
| Transações | Preview Community (lista) | CRUD de transações | Tabela/lista, filtros tipológicos, ações | Listar/criar/editar/excluir via GraphQL | Desktop + mobile | Parcial |
| Categorias | Requisitos textuais | CRUD de categorias | Lista, ações, confirmação de exclusão | Listar/criar/editar/excluir; tratar `CATEGORY_IN_USE` | Desktop + mobile | Parcial |
| Conta | Requisitos (`me`) | Exibir usuário e encerrar sessão | Dados do `me`, logout | Consulta autenticada; limpa sessão | Adaptado | Parcial |
| Modal Categoria | Brief: 2 modais | Criar/editar categoria | Campo nome, submit, cancelar/Esc | Mutations de categoria | Overlay responsivo | Parcial |
| Modal Transação | Brief: 2 modais | Criar/editar transação | Descrição, valor, tipo, data, categoria | Mutations de transação; centavos | Overlay responsivo | Parcial |

## Tokens / tipografia

Cores de marca, cinzas e acentos lidos no quadro `1085:713` estão em `frontend/src/styles/theme.css`. A escala tipográfica completa do Style Guide não foi extraída. A família usada é Inter.

## Revisão visual posterior

Ainda falta reler, com zoom suficiente:

1. Texto interno dos dois overlays da seção Gestão
2. Escala tipográfica, raios e sombras do Style Guide
3. SVG oficial do logotipo
4. Ícones ilustrativos dos cards do dashboard
