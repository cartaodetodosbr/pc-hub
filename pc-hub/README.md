# P&C Hub — Pessoas, Cultura & Facilidades

Portal de ferramentas e facilidades do time de Pessoas & Cultura da TODOS Empreendimentos. Site estático (HTML + CSS + JavaScript puro), sem backend, sem login e sem banco de dados — pensado para publicação direta no GitHub Pages.

## O que já está pronto (v1)

- Layout completo e navegável: cabeçalho, menu lateral, faixas coloridas institucionais.
- Home pensada como o ambiente de trabalho do próprio time de P&C (não um portal de atendimento ao colaborador): banner de boas-vindas, cards de acesso rápido em "Nosso ambiente de trabalho" — primeiro os já funcionais (Ferramentas, Painéis, OKRs & Metas, One Pages), depois os "Em breve" (Nosso Dia, Indicadores, Projetos/Iniciativas, Documentos/Materiais, Asas da Qia, Orçamento, Cashback) —, um bloco "Nossos Pilares" e destaque para a ferramenta funcional.
- Menu lateral com Início, Painéis, OKRs & Metas, One Pages, Indicadores, Documentos, Ferramentas (Banco de Horas, Calculadoras, Modelos e Templates — grupo recolhido por padrão, expansível pela seta ao lado) e Ajuda — as seções ainda não construídas mostram uma tela "Em breve". "Guia Rápido" e "Automações" existem como rotas internas, mas ficam ocultas do menu por decisão do time (não têm conteúdo ainda).
- **Conversor de Banco de Horas totalmente funcional**: upload (arrastar/soltar ou selecionar, múltiplos arquivos/meses de uma vez), processamento e validação, prévia do resultado convertido e download do CSV pronto para o Power BI — tudo processado localmente no navegador, sem envio de dados a nenhum servidor.
- **Aniversariantes do mês, na Home**: identifica o mês atual automaticamente e lista quem faz aniversário nele (ordenado por dia), além de destacar o próximo aniversário do time. Os dados vêm de `data/aniversariantes.json` — para atualizar quem faz aniversário quando alguém entra, sai ou muda a data, basta editar esse arquivo, sem tocar em HTML/CSS/JS.
- **Painéis**: página nova, funcional, reunindo os 13 painéis Power BI já em produção do time de P&C em uma central de acesso — busca por nome, filtro por área/pilar, contador de painéis, e cards que abrem cada painel em nova aba. Os dados vêm de `data/paineis.json` — para adicionar, remover ou editar um painel, basta editar esse arquivo.
- **OKRs & Metas**: página no menu como "OKRs & Metas" (`#okrs-metas`), com visão hierárquica Objetivo → KR → KPI, mapa estratégico em árvore e aba de Projetos/Entregáveis — tudo a partir dos dados já transcritos dos relatórios da Qulture.Rocks para `data/okrs.json`. A Qulture continua sendo a fonte oficial; o Hub é só uma camada de visualização, sem criar, editar ou excluir nada. Ver seção própria mais abaixo.
- **One Pages**: página no menu como "One Pages" (`#one-pages`), com o acervo mensal dos relatórios de P&C (seletor Ano/Mês + visualizador de PDF embutido). Os KRs de OKRs & Metas que têm um One Page correspondente linkam direto para o relatório do mês. Ver seção própria mais abaixo.
- Responsivo: desktop grande, notebook, tablet e celular (menu lateral vira off-canvas em telas menores).

## Estrutura de pastas

```
pc-hub/
├── index.html                 → única página da aplicação (SPA simples, navegação por #hash)
├── css/
│   ├── variables.css          → cores, tipografia, espaçamentos (design tokens)
│   ├── global.css             → reset e estilos base
│   ├── layout.css             → shell da aplicação (header, sidebar, faixas coloridas)
│   ├── components.css         → cards, botões, upload, estados, tabela de prévia etc.
│   └── responsive.css         → breakpoints (desktop grande / notebook / tablet / mobile)
├── js/
│   ├── app.js                 → inicialização
│   ├── navigation.js          → roteamento por hash e menu lateral
│   ├── banco-horas.js         → lógica completa do Conversor de Banco de Horas
│   ├── aniversariantes.js     → lê data/aniversariantes.json e monta a seção "Aniversariantes do mês" da Home
│   ├── paineis.js              → lê data/paineis.json e monta a página "Painéis" (grade de cards, busca, filtro e contador)
│   ├── okrs.js                 → lê data/okrs.json e monta a página "OKRs & Metas" (lista hierárquica, mapa estratégico, projetos, filtros, painel de detalhe)
│   ├── onepages.js             → lê data/onepages.json e monta a página "One Pages" (seletor Ano/Mês, grade de cards, visualizador de PDF embutido)
│   └── vendor/papaparse.min.js → biblioteca PapaParse (MIT), hospedada localmente
├── data/
│   ├── aniversariantes.json   → lista de nome + data de aniversário (DD/MM) — única fonte de dados da seção
│   ├── paineis.json           → lista dos painéis Power BI (nome, área/pilar, descrição, link, ícone) — única fonte de dados da página Painéis
│   ├── okrs.json               → objetivos/KRs/KPIs e projetos/entregáveis transcritos da Qulture.Rocks — única fonte de dados da página OKRs & Metas
│   └── onepages.json           → manifesto do acervo de One Pages (ano/mês/itens) — única fonte de dados da página One Pages
├── assets/
│   ├── logos/                 → logo TODOS Empreendimentos, logo Pessoas e Cultura
│   ├── mascot/                → mascote oficial (coruja "Pessoas e Cultura") usada no banner da Home, no rodapé do menu e nas telas "Em breve"; e QIA em glow, reservada para uso pontual
│   ├── images/                → favicon.png (ícone da aba do navegador, derivado da mascote oficial)
│   ├── fonts/                 → família Panton completa (18 arquivos .woff2 — 9 pesos x normal/itálico)
│   └── onepages/<ano>/<mes>/  → PDFs originais dos relatórios mensais de P&C (ex.: assets/onepages/2026/agosto/kr1-formacao-liderancas.pdf)
└── README.md
```

## Como publicar no GitHub Pages

1. Crie um repositório novo no GitHub (pode ser público ou privado, desde que o plano permita Pages em repositório privado).
2. Copie todo o conteúdo desta pasta `pc-hub/` para a raiz do repositório (o `index.html` precisa ficar na raiz, não dentro de uma subpasta).
3. Suba os arquivos:
   ```bash
   git init
   git add .
   git commit -m "Primeira versão do P&C Hub"
   git branch -M main
   git remote add origin https://github.com/SEU-USUARIO/SEU-REPOSITORIO.git
   git push -u origin main
   ```
4. No GitHub, vá em **Settings → Pages**.
5. Em **Source**, selecione **Deploy from a branch**, escolha a branch `main` e a pasta `/ (root)`.
6. Salve. Em alguns minutos o site estará disponível em `https://SEU-USUARIO.github.io/SEU-REPOSITORIO/`.
7. Para atualizar o site depois, basta editar os arquivos localmente e repetir `git add` / `git commit` / `git push` — o GitHub Pages publica automaticamente a cada push na branch configurada.

Nenhuma etapa de build é necessária — é HTML/CSS/JS puro. No GitHub Pages (ou em qualquer servidor local, como `python -m http.server`) tudo funciona normalmente, inclusive a seção de aniversariantes. **Só a seção de aniversariantes é uma exceção ao "abrir com duplo clique"**: ela busca o arquivo `data/aniversariantes.json` com `fetch`, e por segurança os navegadores bloqueiam esse tipo de leitura quando a página é aberta direto do disco (`file://`) — o restante do site (incluindo o Conversor de Banco de Horas) continua funcionando normalmente nesse modo. Para testar tudo localmente antes de publicar, use um servidor simples, por exemplo `python -m http.server` na pasta do projeto e abra `http://localhost:8000`.

**Nota sobre dependências externas:** a única biblioteca JavaScript usada (PapaParse, para leitura do CSV) está hospedada dentro do próprio projeto, em `js/vendor/papaparse.min.js`, em vez de vir de um CDN externo — assim o Conversor de Banco de Horas continua funcionando mesmo se a rede da empresa bloquear domínios externos. A fonte Panton também está hospedada localmente (`assets/fonts/`). A única chamada a um serviço externo é o Google Fonts (para a fonte Poppins, mantida como alternativa visual caso algum peso da Panton falhe ao carregar); se isso também for bloqueado na rede corporativa, o navegador usa automaticamente a fonte padrão do sistema, sem quebrar o site.

## Tipografia — Panton

Os 18 arquivos da família (Thin, ExtraLight, Light, Regular, SemiBold, Bold, ExtraBold, Black e ExtraBlack, cada um em normal e itálico) foram recebidos em `.otf` e convertidos para `.woff2` — mesmo desenho, arquivo bem mais leve para carregar na web. Todos os pesos estão declarados em `css/variables.css`, mas o navegador só baixa o arquivo do peso que a página realmente usa (os demais ficam "em espera"), então ter a família toda disponível não deixa o site mais pesado. Os `.woff2` já usados pelo layout (Regular, Bold e ExtraBold) têm `<link rel="preload">` no `index.html` para carregar o quanto antes e evitar o texto "piscar" com a fonte de fallback.

Se precisar reprocessar os arquivos originais (`.otf`) no futuro — por exemplo, para adicionar um peso que não veio nesta leva —, qualquer conversor otf → woff2 resolve (o comando `fonttools` do Python foi o usado aqui: `python -m fontTools.ttLib.woff2 compress arquivo.otf`).

## Pendências conhecidas

- **Coruja mascote**: desde 08/09/2026 é a ilustração oficial fornecida por Regi, em `assets/mascot/mascote-pessoas-cultura.png`, referenciada por `<img>` nos três lugares em que a mascote aparece (banner da Home, rodapé do menu lateral, telas "Em breve"). O favicon (`assets/images/favicon.png`) também foi gerado a partir dessa mesma imagem. Para trocar a ilustração no futuro, basta substituir esses dois arquivos com um PNG de fundo transparente — não é preciso mexer em HTML/CSS.
- **Painéis "Novidades" e "Acessos Rápidos"** do mockup original não foram incluídos nesta v1 (decisão tomada em conjunto: eles traziam notícias de exemplo e links para SharePoint/Power BI/Calendário/Teams, fora do escopo desta primeira versão). Podem ser adicionados depois, quando essas integrações existirem de fato.
- **"Fale com o time P&C"** foi removido do menu e da Home: quem acessa o Hub já é do time de P&C, então essa opção não fazia sentido como canal de atendimento externo.
- **Nosso Dia, Indicadores, Documentos, Projetos/Iniciativas, Asas da Qia, Orçamento, Cashback, Calculadoras, Modelos e Templates**: só têm a tela "Em breve" — o conteúdo real entra em versões futuras. "Guia Rápido" e "Automações" também estão nesse estado, mas ficam ocultas do menu lateral (só acessíveis por link direto) por não terem previsão próxima de conteúdo. O bloco "Nossos Pilares" na Home (DHO, R&S, Remuneração, Administração de Pessoal, Comunicação, People Analytics) também é só visual por enquanto, sem links — é a estrutura pronta para quando cada pilar tiver conteúdo próprio.

## Conversor de Banco de Horas — como funciona

A lógica de conversão está inteiramente em `js/banco-horas.js` e foi validada contra um arquivo real de julho/2026 e o respectivo arquivo já convertido (os totais batem exatamente com a tabela de referência do documento de regras: 191 registros, +334,07h positivo, -362,65h negativo, -28,58h de saldo do mês).

Resumo das regras implementadas:

1. **Entrada esperada**: CSV com as colunas `Nome do funcionário`, `Número de matrícula`, `Nome do departamento`, `CPF do funcionário`, `Banco Positivo`, `Banco Negativo`, `Banco Saldo`. O separador (`;` ou `,`) é detectado automaticamente, e espaços extras no nome das colunas são ignorados — para tolerar pequenas variações de como o arquivo foi salvo/reaberto antes do upload.
2. **Limpeza**: remove automaticamente linhas de teste do sistema (departamento "TESTE", matrícula "10000" ou nome contendo "TESTE INTERPONTO") e linhas sem CPF válido (vazio ou com menos de 4 caracteres). Linhas com apenas o saldo acumulado preenchido (sem movimento no mês) são mantidas.
3. **Conversão de horas**: `HH:MM` → decimal (`horas + minutos/60`), preservando o sinal negativo. Vazio, `NaN` ou valor não reconhecido vira `0`.
4. **Setor**: mapeado a partir do departamento seguindo a ordem de regras definida (DADOS/ENGENHARIA/TI → TI; Melhoria Contínua/Financeiro/Contabilidade/FP&A → Finanças Estratégicas; Consultoria/Qualidade/Suporte/Projetos/Produto → Operações; e assim por diante). Departamento sem regra correspondente vira `NONE` e gera um aviso na tela de prévia — listando nome do funcionário e o "Nome do departamento" exatamente como veio no arquivo, um por linha, para facilitar identificar quem precisa de ajuste (departamento sem valor no arquivo aparece como "(não informado)").
5. **Competência**: como o nome do arquivo exportado pelo sistema não segue um padrão confiável (ex.: `relatorio_202686_0942_julho_1.CSV`), a ferramenta tenta sugerir a competência a partir do nome do arquivo assim que ele é selecionado; quando não consegue reconhecer nada no nome, preenche com o mês atual como ponto de partida. De qualquer forma, o campo fica sempre editável e a validação (`AAAA/MM`) é sempre conferida antes de converter — o preenchimento automático é só uma sugestão, nunca a palavra final.
6. **Estrutura inesperada**: se o arquivo não tiver as colunas esperadas (nome diferente, arquivo errado, exportação incompleta), a tela mostra exatamente quais colunas não foram encontradas e o nome do arquivo com problema, em vez de um erro genérico — facilita identificar se é o arquivo errado ou se alguma coluna foi renomeada/removida antes do upload.
7. **Múltiplos meses de uma vez**: é possível enviar mais de um arquivo (um por competência); a ferramenta converte cada um e gera um único CSV já unificado, ordenado por competência crescente — reproduzindo a rotina mensal descrita no documento de regras.
8. **Saída**: CSV separado por `;`, com BOM UTF-8 (para abrir corretamente com acentuação no Excel/Power BI), decimal com ponto, colunas na ordem: `Competência; Nome do funcionário; Número de matrícula; CPF do funcionário; Nome do departamento; Setor; Banco Positivo Dec; Banco Negativo Dec; Saldo Mês; Saldo Acumulado`. O nome do arquivo baixado é sempre `banco_de_horas.csv` (fixo, de propósito) — assim o Power BI aponta para um nome/caminho permanente e ninguém precisa reconfigurar a fonte de dados a cada mês; a cada conversão, o arquivo baixado deve substituir o anterior na pasta do SharePoint (ver item abaixo).
9. **Onde salvar o arquivo**: a tela final mostra um atalho "Abrir pasta", que leva para a pasta do SharePoint onde o `banco_de_horas.csv` deve ser substituído (o link atual é o da pasta `BancoDeHorasCSV` em Painel Gerencial). Se esse link mudar no futuro, é só editar a constante `BH_PASTA_SHAREPOINT_URL` bem no topo de `js/banco-horas.js` — é o único lugar do projeto que guarda esse endereço.

### Ponto de atenção encontrado durante a validação

O arquivo de exemplo já convertido que foi usado como referência apresenta **matrícula com sufixo `.0`** (ex.: `131.0`) e **CPF sem o zero à esquerda** (ex.: `8930499643` em vez de `08930499643`) em alguns registros — um efeito colateral comum de planilhas/Python quando uma coluna de texto é lida como número. Isso contraria a própria regra escrita no documento ("nunca converter para número — causa notação científica"), e pode causar problema de correspondência (matching) por CPF em cruzamentos futuros. **O Conversor do P&C Hub não repete esse comportamento**: matrícula e CPF são sempre tratados como texto puro, preservando zeros à esquerda e sem o sufixo `.0`. Vale considerar aplicar a mesma correção na rotina Python/Power BI atual, se ela ainda estiver em uso em paralelo.

## Aniversariantes do mês — como funciona

A seção fica na Home, logo abaixo do banner de boas-vindas, e segue o fluxo `data/aniversariantes.json → js/aniversariantes.js → seção visual`:

1. O JavaScript identifica o mês atual pela data do dispositivo do usuário (não depende do ano — cada pessoa no JSON tem só `"DD/MM"`).
2. Filtra e ordena (por dia) quem faz aniversário nesse mês, mostrando nome e data no formato `DD de mês`.
3. Se ninguém do time fizer aniversário no mês, mostra a mensagem "Ninguém faz aniversário este mês." no lugar da lista.
4. Destaca também o **próximo aniversário** do time a partir de hoje (considerando todos os cadastrados, não só os do mês atual), com nome, data e "em quantos dias" — inclusive virando o ano quando o próximo aniversário só cai no ano seguinte.

Para atualizar (alguém novo no time, mudança de data, etc.), basta editar `data/aniversariantes.json` — nenhum outro arquivo precisa mudar:

```json
{ "nome": "Nome da pessoa", "aniversario": "DD/MM" }
```

## Painéis — como funciona

A página fica disponível pelo menu lateral ("Painéis") e segue o mesmo padrão das demais seções orientadas a dados: `data/paineis.json → js/paineis.js → página visual`.

1. Cada painel no JSON tem `nome`, `categoria` (usada no filtro por área/pilar), `areaLabel` (o texto completo exibido no card, ex.: "DHO / Cultura & Clima"), `descricao`, `link` (URL do Power BI) e `icon` (id de um ícone do sprite SVG do `index.html`, usado na composição visual do card — nenhuma imagem externa é carregada).
2. A busca (por nome, ignorando acentos e caixa) e o filtro por categoria funcionam em conjunto e filtram os cards instantaneamente, sem recarregar a página.
3. O contador no topo mostra "13 painéis disponíveis" por padrão, e passa a mostrar "X de 13 painéis encontrados" quando a busca ou o filtro reduzem o resultado.
4. Cada card é inteiramente clicável (além do texto "Acessar painel") e abre o link do Power BI em uma nova aba (`target="_blank"`) — nenhum painel é incorporado por iframe dentro do Hub.
5. A cor de destaque de cada card vem da categoria (mapeamento em `PN_COR_POR_CATEGORIA`, no topo de `js/paineis.js`), reaproveitando as 4 cores já usadas em outros cards do Hub — é só um indicador visual discreto, sem introduzir cores novas na identidade.

Para adicionar, remover, renomear ou trocar o link de um painel no futuro, basta editar `data/paineis.json` — nenhum outro arquivo precisa mudar. Para usar um ícone diferente em um card, escolha outro `id` já existente no sprite SVG do `index.html` (ou adicione um novo `<symbol>` lá) e referencie esse id no campo `icon` do painel.

```json
{
  "nome": "Nome do painel",
  "categoria": "Categoria usada no filtro",
  "areaLabel": "Texto de área/pilar exibido no card",
  "descricao": "Descrição objetiva do painel.",
  "link": "https://app.powerbi.com/links/...",
  "icon": "icon-bar-chart"
}
```

## OKRs & Metas — como funciona

Página no menu lateral, em "OKRs & Metas" (rota `#okrs-metas`), inspirada na experiência de acompanhamento de OKRs de uma referência de mercado, mas com identidade visual e escopo de dados próprios do P&C Hub. Segue o mesmo padrão das demais páginas orientadas a dados: `data/okrs.json → js/okrs.js → página visual`.

**Escopo — só consulta.** A Qulture.Rocks continua sendo a fonte oficial dos OKRs; o Hub não cria, edita nem apaga nada por lá. Os dados de `data/okrs.json` foram transcritos manualmente dos relatórios da Qulture (prints enviados pela Regi em 24/09/2026) — não há integração automática ainda (ver "Próximos passos" abaixo). Essa informação é só técnica/de manutenção — não aparece mais na interface para quem usa o Hub no dia a dia (ver revisão de UX logo abaixo).

1. **Estrutura dos dados**: cada nó em `okrs.json` tem `tipo` (`objetivo`, `kr` ou `kpi`), `nome`, `progresso` (0–100), e opcionalmente `area`, `meta`, `progressoMediaKpis` (quando a Qulture reporta o KR com um número no resumo do objetivo e outro próprio — normalmente a média dos KPIs filhos —, exibido como "Média dos KPIs filhos" no painel de detalhe, ao lado do `progresso` principal), `onePage` (link contextual para o relatório mensal correspondente, ver seção "One Pages" abaixo) e `filhos` (array de nós-filho, formando a hierarquia Objetivo → KR → KPI). Um campo `observacao` livre é usado para registrar qualquer inconsistência ou ambiguidade encontrada nos dados de origem — quando presente, aparece como uma nota discreta no painel de detalhe do item, sem ícone de alerta. Um objetivo-pai que não apareceu nos prints recebidos faz o KR ficar listado direto na raiz, sem inventar uma hierarquia que não foi confirmada.
2. **Status é calculado, não é nativo da Qulture**: como o campo "status" não foi identificado no material recebido, a página calcula um status próprio a partir da faixa de progresso (≥100% Concluído, ≥70% Em andamento, ≥40% Atenção, abaixo disso Crítico). Essa explicação não aparece mais como aviso fixo na tela — fica num rodapé discreto ("Fonte: Qulture.Rocks · Atualizado em [data]") com um ícone "i" que mostra a explicação em tooltip só para quem passa o mouse/foco nele. A lógica está isolada em `okStatusDoProgresso()`, em `js/okrs.js`, caso a faixa precise ser ajustada.
3. **Campos sem fonte confirmada não aparecem**: responsável, contribuintes, ciclo, peso, meta inicial/final, comentários, tarefas relacionadas e histórico de atualização foram pedidos no briefing original, mas não têm fonte confirmada — em vez de inventar ou listar "Não disponível nesta versão" (mensagem que só fazia sentido para quem construiu a ferramenta, não para quem consulta), o painel de detalhe simplesmente não exibe esses campos até existirem de verdade. Assim que esses dados existirem (por exemplo, via exportação oficial da Qulture), basta preenchê-los no JSON e ajustar `okAbrirDetalhe()`, em `js/okrs.js`, para exibi-los.
4. **Três visões da mesma hierarquia**: "Lista" (tabela expansível, com indentação por nível), "Mapa estratégico" (a mesma árvore em caixas conectadas) e "Projetos" (cards de projeto com seus entregáveis — dado extra do relatório, sem vínculo confirmado com um Objetivo/KR específico, por isso aparece à parte). As três abas usam os mesmos dados e o mesmo painel de detalhe lateral.
5. **Filtros**: busca por nome (ignorando acentos e caixa), filtro por tipo (Objetivo/KR/KPI) e por status calculado — todos client-side, sem recarregar a página, e combináveis entre si. A busca preserva a ancestralidade: se um KPI bate com o termo buscado, o Objetivo e o KR acima dele continuam visíveis para dar contexto.
6. **Alertas de prazo (aba Projetos)**: um entregável não entregue com prazo em até 14 dias aparece como "Prazo próximo"; com prazo já vencido, como "Atrasado". A janela de 14 dias está na constante `OK_ALERTA_DIAS`, no topo de `js/okrs.js`.
7. **Sem rankings individuais**: por decisão explícita, a página não expõe nenhuma comparação ou ranking entre pessoas — o foco é execução estratégica agregada (objetivos, KRs, KPIs, projetos), nunca desempenho individual.
8. **Link contextual para o One Page do mês**: quando um KR tem um `onePage` cadastrado no JSON, o painel de detalhe mostra "Ver no One Page de [mês]" — clicar leva direto para a página One Pages já com o PDF certo aberto, sem duplicar nenhum texto do relatório dentro do painel de OKRs. KRs sem `onePage` cadastrado (ex.: `kr-5-3`, que não tem relatório mensal correspondente no material recebido) simplesmente não mostram esse link.

Para atualizar os dados (novo ciclo, progresso atualizado, KR novo), basta editar `data/okrs.json` seguindo a mesma estrutura — nenhum outro arquivo precisa mudar, a menos que a própria hierarquia ou os campos disponíveis mudem.

### Próximos passos (fora do escopo atual)

- **Automatizar a atualização dos dados.** Hoje a atualização de `data/okrs.json` é manual. Os caminhos avaliados (e não implementados ainda) foram: (a) continuar manual, copiando os números do relatório da Qulture a cada ciclo; (b) exportação da Qulture em XLSX/CSV → SharePoint → Power Automate → conversão para JSON → commit no repositório, sem nenhuma credencial exposta no GitHub Pages; (c) uso futuro da API da Qulture.Rocks, só se e quando a TI/administrador da conta liberar acesso a token — tratado como possibilidade futura, nunca como requisito. Detalhes completos da análise (viabilidade, segurança, frequência de atualização, esforço de manutenção) estão no doc "OKRs & Metas no P&C Hub — Auditoria Técnica".
- **Confirmar dados pendentes** (responsável, contribuintes, ciclo formal, peso, histórico) assim que houver uma fonte confiável para eles.
- ~~Revisar a ambiguidade do "KR 1.3"~~ — resolvido em 22/10/2026: o One Page de KR3/Setembro confirma que é o mesmo KR (nome oficial de entropia, acompanhado operacionalmente pelos KPIs de Cargos e Salários/GPTW) — `kr-1-3` agora segue o mesmo padrão de dois números que `kr-1-1` e `kr-1-2` (`progresso` + `progressoMediaKpis`).
- ~~Confirmar o KPI 1.3 de Liderança Transformadora (Assessores)~~ — resolvido em 22/10/2026: o One Page de agosto mostrava 72% (dado de agosto); o print atual da Qulture mostra 85% — a diferença é só a evolução natural entre agosto e outubro (mais Assessores concluíram a formação), não um erro de transcrição.

## One Pages — como funciona

Página no menu lateral, em "One Pages" (rota `#one-pages`): o acervo mensal dos relatórios de P&C, com um seletor de Ano/Mês e um visualizador de PDF embutido. Segue o mesmo padrão manifesto-driven das demais páginas orientadas a dados: `data/onepages.json → js/onepages.js → página visual`.

**Papel desta página em relação a "OKRs & Metas"**: OKRs & Metas responde "o que precisamos alcançar, e como estamos indo?" (a visão consolidada e sempre atualizada). One Pages responde "o que aconteceu especificamente naquele mês?" (o retrato point-in-time que a Qulture gerou naquele momento, com contexto e leitura qualitativa que não fazem sentido re-digitar em `okrs.json`). Por isso os relatórios em si continuam sendo os PDFs originais — nada do conteúdo deles é duplicado ou reescrito na página de OKRs, e a página de One Pages não tenta recriar a árvore de Objetivo/KR/KPI que já existe em OKRs & Metas.

1. **Estrutura dos dados**: `onepages.json` tem uma lista `periodos`, cada um com `ano`, `mesNum` (1–12, usado só para ordenar), `mes` (chave curta, ex. `"agosto"`), `mesLabel` (texto exibido, ex. `"Agosto/2026"`) e `itens` (lista de relatórios daquele mês, cada um com `titulo` e `arquivo`, o caminho do PDF). A página monta os seletores de Ano e Mês e a grade de cards inteiramente a partir desse arquivo.
2. **Os PDFs são os arquivos originais**: cada `arquivo` aponta para o PDF de verdade em `assets/onepages/<ano>/<mes>/`, exatamente como veio da Qulture/da Regi — a página só embute esse PDF num `<iframe>` (visualização nativa do navegador), sem convertê-lo para HTML ou imagem. Isso preserva a formatação e o design originais do relatório sem esforço extra de manutenção.
3. **Como adicionar um mês novo**: (a) colocar os PDFs em uma pasta nova `assets/onepages/<ano>/<mes>/`; (b) acrescentar um objeto em `periodos`, em `data/onepages.json`, apontando para esses arquivos. Nenhum HTML, CSS ou JS precisa mudar — a página detecta automaticamente os novos períodos e os exibe nos seletores (o mês mais recente já abre selecionado por padrão).
4. **Link contextual a partir de OKRs & Metas**: ao abrir o detalhe de um KR que tem `onePage` cadastrado em `okrs.json` e clicar em "Ver no One Page de [mês]", a navegação guarda qual item deve abrir (variável `opSelecaoPendente`, compartilhada entre `js/okrs.js` e `js/onepages.js`), muda para `#one-pages` e, assim que a página carrega, seleciona o Ano/Mês certos e já abre o PDF correspondente — sem o usuário precisar procurar manualmente.
5. **Estado vazio**: um período sem nenhum item cadastrado (ou uma falha ao carregar o JSON) mostra uma mensagem simples no lugar da grade, em vez de deixar a tela em branco ou quebrada.

Para adicionar, remover ou reorganizar relatórios, basta editar `data/onepages.json` e a pasta `assets/onepages/` — nenhum outro arquivo precisa mudar.

## Próximos passos sugeridos

- Validar a ferramenta de Banco de Horas com um mês real completo (upload de ponta a ponta) antes de divulgar para o time.
- Manter `data/aniversariantes.json` atualizado conforme o time muda (entradas, saídas, correções de data).
- Quando fizer sentido, avaliar a integração futura com SharePoint (fora do escopo desta v1, por decisão explícita).
- Avaliar com o time se/quando vale investir em automatizar a atualização de `data/okrs.json` (ver "Próximos passos" da seção OKRs & Metas acima).
