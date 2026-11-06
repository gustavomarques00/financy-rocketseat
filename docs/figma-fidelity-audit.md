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

Fonte principal: arquivo `CysjIzd5ChP9zqqfXrFtz8`, página Projeto `3:376`. A chamada MCP `get_metadata` voltou o limite do plano Starter e uma nova tentativa manteve o mesmo limite. As seis telas foram lidas no visualizador do arquivo, com zoom suficiente para estrutura, cópia e presença de ícones.

A página Style Guide `3:377` foi reaberta. O quadro `1085:713` foi lido em 100% e 40%. Brand `#124B2B` / `#1F6F43` e a escala de cinza `#111827`, `#374151`, `#4B5563`, `#6B7280`, `#9CA3AF` coincidem com `frontend/src/styles/theme.css`. Laranja, amarelo, verde, rosa e vermelho também coincidem com os tokens já aplicados. A segunda fileira de cinza, azul, roxo, tamanhos tipográficos, raios e sombras não ficaram nítidos o bastante para alterar o código. A família continua Inter.

Os dois quadros da seção Gestão, no nó `3:809`, continuam visíveis: um modal sobre a página escurecida e um calendário. O texto interno permanece `NOT_VERIFIED`. O cartão “Baixar assets” indica `Ctrl+Shift+E`, mas o visualizador anônimo bloqueia exportação.

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
| Style Guide | Página `3:377`, quadro `1085:713`. Brand, cinzas principais e acentos lidos | Tokens atuais de `theme.css` | Segunda fileira de cinza, azul, roxo, escala, raios e sombras ainda sem leitura nítida | P2 | Nenhuma cor nova inventada. Tokens já lidos permanecem | PARTIAL |

Não há divergência estrutural P0 nas seis telas. Adaptação em 390 px continua decisão de implementação: os frames lidos são desktop.

## Execução 14 — capturas do Style Guide

O usuário forneceu cinco capturas locais do Style Guide, feitas em 6 nov 2026. Elas cobrem cores, tipografia e ícones, inputs, botões, links, paginação, tags e tipos. Não são exportações SVG. O logo permanece `LOGO_PARTIAL`: a captura mostra o símbolo de dois elos e a palavra FINANCY, mas o caminho vetorial oficial não foi exportado e não foi redesenhado.

| Item | Figma Evidence | Current UI | Difference | Severity | Action | Verification |
|---|---|---|---|---|---|---|
| Cores | Quadro Cores com brand, cinzas até `#F8F9FA`, feedback `#EF4444` / `#19AD70` e as famílias azul, roxo, rosa, vermelho, laranja, amarelo e verde | Faltavam cinza 300/200, success e os pares azul/roxo | Tags azul e roxa reutilizavam outras cores | P1 | Tokens ausentes entraram em `theme.css`. Tags usam o par claro/escuro da captura | MATCH |
| Tipografia | Inter, sem escala de tamanho | Inter via Google Fonts, pesos 400–700 | Escala, raios e sombras continuam sem medida oficial | P2 | Nenhuma escala inventada | PARTIAL |
| Ícones | Grade Lucide, sem nomes individuais | SVGs inline no traço Lucide | O conjunto da interface é um subconjunto. `lucide-react` não foi instalado | P2 | Ícones de Entrada e Saída adicionados | PARTIAL |
| Inputs | Empty, active, filled, error, disabled e select | Borda única, erro só no texto | Foco, erro e desabilitado sem a cor do guia | P1 | Foco verde, erro vermelho e disabled real no CSS | PARTIAL |
| Botões | Solid, outline, hover, disabled e icon button | Sem hover distinto | Hover, disabled e paginação quadrada | P1 | Estados aplicados nos botões existentes | PARTIAL |
| Links e paginação | Link verde com sublinhado no hover; página ativa verde | Link sem hover; página ativa era botão grande | Controles locais já existiam | P2 | Hover no link e botão de página com `aria-current` | PARTIAL |
| Tags e tipos | Oito tags semânticas; Entrada e Saída com seta circular | Tipo era uma tag colorida | Indicador sem o ícone do guia | P1 | Entrada e Saída usam seta circular e as cores success/danger | PARTIAL |
| Logo | Símbolo de dois elos e FINANCY | Círculo com ponto | Geometria diferente | P1 | Reconstrução mantida. Sem SVG oficial | PARTIAL |
| Overlays de Gestão | Sem captura legível nesta execução | Modais funcionais | Texto interno ainda não comparado | P2 | Formulários preservados. Sem calendário customizado | NOT_VERIFIED |

`FIGMA_PARTIAL` permanece por causa do logo e dos overlays de Gestão.

## Execução 15 — capturas das telas e dos modais

O usuário forneceu, em 6 nov 2026, sete capturas locais além do Style Guide já registrado: Acesso e Cadastro, Dashboard, Transações, Categorias, Perfil, modal de nova transação e modal de nova categoria. Não são exportações SVG.

| Item | Figma Evidence | Current UI | Difference | Severity | Action | Verification |
|---|---|---|---|---|---|---|
| Login e cadastro | Cartão branco, FINANCY, campos com ícone, lembrar-me, recuperar senha, divisor e botão outline | Mesma hierarquia | A captura de cadastro diz “mínimo 6 caracteres” | P2 | A regra real de 8 caracteres foi mantida. Recuperar senha continua desabilitado | PARTIAL |
| Dashboard | Três cartões, recentes, categorias e “Nova transação” | Valores do GraphQL | Totais “do mês” continuam o agregado de todas as transações | P1 | Ícones de seta circular, links “Ver todas” e “Gerenciar”, e o modal aberto na própria dashboard | PARTIAL |
| Transações | Filtros, colunas, Entrada/Saída, ações e paginação | Lista local | Faltavam cabeçalhos e o intervalo de resultados com página anterior/próxima | P1 | Cabeçalhos, intervalo, página ativa e setas desabilitadas nas extremidades | PARTIAL |
| Categorias | Três indicadores e grade de cartões com descrição | Contagens reais | Descrição não existe no modelo | P1 | Indicadores e cartão com ícone, ações, nome, tag e quantidade. Descrição não foi inventada | PARTIAL |
| Perfil | Campos e botão “Salvar alterações” | Consulta de nome e e-mail | Não há mutation de perfil | P1 | Campos somente leitura e aviso de e-mail imutável. O botão sem persistência não voltou | PARTIAL |
| Modal de transação | Despesa/Receita, descrição, data, valor e categoria | CRUD existente | O frame sugere um seletor visual, não um calendário customizado | P1 | Seletor real, data nativa e prefixo R$. Sem calendário próprio | PARTIAL |
| Modal de categoria | Título, descrição, grade de ícones e cores | Só o nome persiste | Descrição, ícone e cor não estão no modelo | P1 | Título, subtítulo e salvar. Os controles sem persistência não foram criados | PARTIAL |
| Logo | Símbolo de dois elos e FINANCY | Círculo com ponto | Geometria diferente da captura | P1 | O marcador passou a usar o traço Lucide `link` como aproximação. Não é o SVG oficial | PARTIAL |

`FIGMA_PARTIAL` e `LOGO_PARTIAL` permanecem. A escala tipográfica não foi medida nas capturas. O calendário expandido de Gestão não aparece nessas imagens e não foi criado.
