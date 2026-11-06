# Auditoria de fidelidade visual — Financy

Cópia compartilhada usada nesta auditoria: `CysjIzd5ChP9zqqfXrFtz8`  
URL: https://www.figma.com/design/CysjIzd5ChP9zqqfXrFtz8/Financy--Community-?node-id=3-376

Arquivo anterior: `IR3TQC9ofQKZ2km01tq8EB`  
URL anterior: https://www.figma.com/design/IR3TQC9ofQKZ2km01tq8EB/Financy--Community-?node-id=0-1

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

`FIGMA_PARTIAL` permanece. Na Etapa 9 a API do Figma continuou no limite do plano Starter; nenhuma leitura nova dos frames, da escala tipográfica, do SVG oficial ou dos overlays de Gestão foi obtida. As evidências anteriores continuam válidas. O logo da interface segue a reconstrução geométrica.

## Execução 13 — cópia compartilhada

Fonte principal: arquivo `CysjIzd5ChP9zqqfXrFtz8`, página Projeto `3:376`. A chamada MCP `get_metadata` voltou o limite do plano Starter e não foi repetida. As seis telas foram lidas no visualizador do arquivo, com zoom suficiente para estrutura, cópia e presença de ícones. A página Style Guide `3:377` não foi reaberta. Os dois quadros da seção Gestão continuam visíveis apenas em zoom de 13%; o texto interno permanece `NOT_VERIFIED`.

O SVG oficial do logo não pôde ser exportado: o visualizador anônimo bloqueia inspeção e exportação. O marcador atual (círculo com ponto) permanece uma aproximação. Não foi desenhado um caminho novo.

| Item | Figma Evidence | Current UI | Difference | Severity | Action | Verification |
|---|---|---|---|---|---|---|
| Login | Frame `3101:353`. Logo, campos com ícone, senha com alternância de visibilidade, divisor e “Criar conta” com ícone | Cartão, títulos e botões já existiam; campos sem ícone | Ícones de e-mail, cadeado e olho; ícone no link secundário | P1 | Ícones e alternância local da senha adicionados. Logo oficial não substituído | PARTIAL |
| Cadastro | Frame `3103:1915`. Nome, e-mail e senha com ícones; “Fazer login” com ícone | Mesma hierarquia, sem ícones | Ícones de entrada e do link | P1 | Ícones e alternância local da senha adicionados | PARTIAL |
| Dashboard | Frame `3103:1987`, 1280×800. Três cartões com ícones; linhas e chips | Três cartões e duas colunas, valores do GraphQL | Ícones ilustrativos ausentes. Totais “do mês” continuam o agregado de todas as transações | P1 | Ícones de carteira e tendência nos cartões. Valores não foram fixados | PARTIAL |
| Transações | Frame `3104:362`. Busca, tipo, categoria, período, cabeçalhos e ações em ícone | Filtros locais e lista, sem período | Faltavam período, ícone de busca e ações em ícone | P1 | Período local, padrão “Todos”, sobre as transações já carregadas. Ações com `aria-label` Editar e Excluir | PARTIAL |
| Categorias | Frame `3104:2028`. Cartões com ícone, descrição e ações | Cartões, contagens reais e nome repetido no chip | Descrições e ícones por categoria não existem no modelo | P1 | Ações viraram ícones com os mesmos nomes acessíveis. Descrições não foram inventadas | PARTIAL |
| Perfil | Frame `3104:2925`. Campos com ícone e botão “Salvar alterações” habilitado | Nome e e-mail somente leitura; “Sair da conta” | O design mostra salvamento. Não há mutation de perfil | P1 | O botão inoperante continua ausente. Ícone de saída adicionado. Divergência intencional | PARTIAL |
| Modal categoria | Quadro de Gestão, texto ilegível | Modal com nome | Texto do frame não lido | P2 | Nenhuma mudança de contrato | NOT_VERIFIED |
| Modal transação | Quadro de Gestão com calendário, texto ilegível | Descrição, valor, tipo, data nativa e categoria | Calendário expandido não lido | P2 | Nenhuma mudança de contrato | NOT_VERIFIED |
| Style Guide | Página `3:377` não reaberta nesta execução | Tokens já documentados do quadro `1085:713` e Inter | Escala, raios e sombras sem nova leitura | P2 | Nenhuma cor nova inventada | NOT_VERIFIED |

Não há divergência estrutural P0 nas seis telas. Adaptação em 390 px continua decisão de implementação: os frames lidos são desktop.
