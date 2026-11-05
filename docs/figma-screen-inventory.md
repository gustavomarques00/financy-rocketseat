# Inventário visual — Financy (Figma)

**Referência oficial:** https://www.figma.com/community/file/1580994817007013257/financy

**Status geral da auditoria:** `FIGMA_PARTIAL`

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
| Frames, Style Guide, tokens oficiais | **Não acessíveis** nó a nó |
| Enunciado FTR (seis páginas / dois modais) | Confirmado textualmente pelo brief da Etapa 3; nomes oficiais dos frames **não verificados** no arquivo |

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

## Tokens / tipografia (não oficiais)

Derivados do preview e do tema já existente no repositório — **não** afirmados como tokens do Style Guide Rocketseat:

- Fundo claro (`#f3f4f6`), superfície branca
- Marca verde (`#1b7a4e`)
- Acento roxo suave para tags (`#6d5efc`) — presente no preview
- Fonte: Plus Jakarta Sans

## Revisão visual posterior

Quando o arquivo Figma for duplicado/aberto com `fileKey` válido, revalidar:

1. Nomes reais das seis páginas e dos dois modais
2. Style Guide (cores, tipografia, espaçamentos)
3. Ícones e estados (vazio, erro, loading)
4. Fidelidade pixel dos layouts desktop/mobile
