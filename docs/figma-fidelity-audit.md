# Auditoria de fidelidade visual — Financy

Arquivo oficial: `IR3TQC9ofQKZ2km01tq8EB`  
URL: https://www.figma.com/design/IR3TQC9ofQKZ2km01tq8EB/Financy--Community-?node-id=0-1

A API MCP do Figma recusou novas leituras por limite do plano Starter. A inspeção foi feita no arquivo aberto no editor, nos frames indicados. Não há percentual de similaridade.

## Style Guide

Página `3:377`. O quadro de cores `1085:713` foi lido em zoom de 80%.

| Token lido | Valor |
|---|---|
| brand-dark | `#124B2B` |
| brand-base | `#1F6F43` |
| gray-800 | `#111827` |
| gray-700 | `#374151` |
| gray-600 | `#4B5563` |
| gray-500 | `#6B7280` |
| gray-400 | `#9CA3AF` |
| gray-100 | `#F8F9FA` |
| danger | `#EF4444` |
| pink-base / pink-light | `#DB2777` / `#FCE7F3` |
| red-base / red-light | `#DC2626` / `#FEE2E2` |
| orange-base / orange-light | `#EA580C` / `#FFEDD5` |
| yellow-base | `#CA8A04` |
| green-base / green-light | `#16A34A` / `#E0FAE9` |

A família tipográfica visível é **Inter**, com indicação de acesso pelo Google Fonts. Tamanhos, line-heights, raios e sombras do restante do Style Guide não foram lidos número a número: o quadro ficou parcialmente fora da área ampliada. O logotipo oficial não pôde ser exportado; o marcador da interface é uma reconstrução geométrica, não o SVG do arquivo.

## Gestão

Na página Projeto (`3:376`), a seção Gestão aparece à direita do Perfil com dois quadros de 1280×800. Em zoom de 13% dá para ver um modal claro sobre a página escurecida e um segundo quadro com um calendário. O texto interno desses overlays não foi legível. Os modais da aplicação seguem o contrato atual (nome da categoria; descrição, valor, tipo, data e categoria da transação) e o tratamento visual de cartão branco sobre fundo escurecido.

## Matriz

| Screen | Figma Node | Baseline | Differences | Severity | Resolution |
|---|---|---|---|---|---|
| Login | `3101:353` | Cartão genérico, fonte Plus Jakarta, título "Entrar" | Logo, título "Fazer login", subtítulo, divisor "ou", botão secundário "Criar conta", lembrar-me e recuperar senha | P1 | Layout e cópia alinhados. Lembrar-me não altera a sessão. Recuperar senha fica desabilitado: não há endpoint. |
| Cadastro | `3103:1915` | Título e campos sem a hierarquia do frame | Logo, "Criar conta", nome completo, aviso de 8 caracteres, divisor e "Fazer login" | P1 | Corrigido. A senha mínima de 8 caracteres já era a regra do backend. |
| Dashboard | `3103:1987` | Barra lateral escura e três cards genéricos | Topo com logo, navegação central e avatar; cards Saldo total, Receitas do mês e Despesas do mês; colunas de recentes e categorias | P0 | Estrutura corrigida. Ícones ilustrativos dos cards e totais mensais filtrados por calendário não foram reproduzidos. Os totais continuam sendo o agregado real das transações do usuário. |
| Transações | `3104:362` | Lista simples | Tabela com busca, tipo, categoria, badges Entrada/Saída e paginação | P1 | Busca, tipo, categoria e páginas de 10 itens são locais, sem novo contrato GraphQL. O seletor de período do frame não foi adicionado. |
| Categorias | `3104:2028` | Lista simples | Título, três indicadores e cards | P1 | Cards e contagens reais. Descrição e ícone por categoria não existem no modelo e não foram inventados. |
| Perfil | `3104:2925` | Página "Conta" com grade de metadados | Cartão central, avatar, nome, e-mail bloqueado, salvar e sair | P1 | O botão inoperante foi removido. Nome e e-mail são texto somente leitura, com aviso de consulta. Logout permanece. O frame oficial não foi relido nesta etapa por limite da API. |
| Modal categoria | Gestão, id não lido | Modal funcional com nome | Overlay e cartão | P2 | Mantido o campo Nome. Texto interno do frame não foi lido. |
| Modal transação | Gestão, id não lido | Modal com os campos do CRUD | Overlay; o frame também sugere calendário | P2 | Campos do CRUD preservados. O calendário expandido do frame não foi inspecionado em detalhe. |

Adaptação mobile (390 px) é decisão de implementação: o arquivo inspecionado mostra frames desktop de 1280×800. A navegação superior empilha e as grades viram uma coluna.

## Estado

`FIGMA_PARTIAL` permanece. Na Etapa 9 a API do Figma continuou no limite do plano Starter; nenhuma leitura nova dos frames, da escala tipográfica, do SVG oficial ou dos overlays de Gestão foi obtida. As evidências anteriores continuam válidas. O logo da interface segue a reconstrução geométrica. Filtro de período, descrições e ícones de categoria e calendário expandido não foram adicionados: não fazem parte do contrato funcional.
