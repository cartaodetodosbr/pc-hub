# P&C Hub — Pessoas, Cultura & Facilidades

Portal de ferramentas e facilidades do time de Pessoas & Cultura da TODOS Empreendimentos. Site estático (HTML + CSS + JavaScript puro), sem backend, sem login e sem banco de dados — pensado para publicação direta no GitHub Pages.

## O que já está pronto (v1)

- Layout completo e navegável: cabeçalho, menu lateral, faixas coloridas institucionais.
- Home pensada como o ambiente de trabalho do próprio time de P&C (não um portal de atendimento ao colaborador): banner de boas-vindas, cards de acesso rápido organizados por módulo (Nosso Dia, Indicadores, Ferramentas, Projetos/Iniciativas, Documentos/Materiais, QIA), um bloco "Nossos Pilares" e destaque para a ferramenta funcional.
- Menu lateral com Início, Ferramentas (Banco de Horas, Calculadoras, Modelos e Templates, Guia Rápido), Indicadores, Documentos, Automações e Ajuda — as seções ainda não construídas mostram uma tela "Em breve".
- **Conversor de Banco de Horas totalmente funcional**: upload (arrastar/soltar ou selecionar, múltiplos arquivos/meses de uma vez), processamento e validação, prévia do resultado convertido e download do CSV pronto para o Power BI — tudo processado localmente no navegador, sem envio de dados a nenhum servidor.
- **Aniversariantes do mês, na Home**: identifica o mês atual automaticamente e lista quem faz aniversário nele (ordenado por dia), além de destacar o próximo aniversário do time. Os dados vêm de `data/aniversariantes.json` — para atualizar quem faz aniversário quando alguém entra, sai ou muda a data, basta editar esse arquivo, sem tocar em HTML/CSS/JS.
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
│   └── vendor/papaparse.min.js → biblioteca PapaParse (MIT), hospedada localmente
├── data/
│   └── aniversariantes.json   → lista de nome + data de aniversário (DD/MM) — única fonte de dados da seção
├── assets/
│   ├── logos/                 → logo TODOS Empreendimentos, logo Pessoas e Cultura
│   ├── mascot/                → mascote (coruja) usado no banner da Home, no rodapé do menu e nas telas "Em breve"; e QIA em glow, reservada para uso pontual
│   ├── images/                → favicon.svg
│   └── fonts/                 → família Panton completa (18 arquivos .woff2 — 9 pesos x normal/itálico)
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

- **Coruja mascote**: hoje é a ilustração em `assets/mascot/favicon.svg`, referenciada por `<img>` nos três lugares em que a mascote aparece (banner da Home, rodapé do menu lateral, telas "Em breve"). Se um dia fizer sentido trocar pela ilustração oficial (PNG/SVG com fundo transparente), basta substituir esse arquivo — não é preciso mexer em HTML/CSS.
- **Painéis "Novidades" e "Acessos Rápidos"** do mockup original não foram incluídos nesta v1 (decisão tomada em conjunto: eles traziam notícias de exemplo e links para SharePoint/Power BI/Calendário/Teams, fora do escopo desta primeira versão). Podem ser adicionados depois, quando essas integrações existirem de fato.
- **"Fale com o time P&C"** foi removido do menu e da Home: quem acessa o Hub já é do time de P&C, então essa opção não fazia sentido como canal de atendimento externo.
- **Nosso Dia, Indicadores, Documentos, Projetos/Iniciativas, QIA, Automações, Calculadoras, Modelos e Templates, Guia Rápido**: só têm a tela "Em breve" — o conteúdo real entra em versões futuras. O bloco "Nossos Pilares" na Home (DHO, R&S, Remuneração, Administração de Pessoal, Comunicação, People Analytics) também é só visual por enquanto, sem links — é a estrutura pronta para quando cada pilar tiver conteúdo próprio.

## Conversor de Banco de Horas — como funciona

A lógica de conversão está inteiramente em `js/banco-horas.js` e foi validada contra um arquivo real de julho/2026 e o respectivo arquivo já convertido (os totais batem exatamente com a tabela de referência do documento de regras: 191 registros, +334,07h positivo, -362,65h negativo, -28,58h de saldo do mês).

Resumo das regras implementadas:

1. **Entrada esperada**: CSV com as colunas `Nome do funcionário`, `Número de matrícula`, `Nome do departamento`, `CPF do funcionário`, `Banco Positivo`, `Banco Negativo`, `Banco Saldo`. O separador (`;` ou `,`) é detectado automaticamente, e espaços extras no nome das colunas são ignorados — para tolerar pequenas variações de como o arquivo foi salvo/reaberto antes do upload.
2. **Limpeza**: remove automaticamente linhas de teste do sistema (departamento "TESTE", matrícula "10000" ou nome contendo "TESTE INTERPONTO") e linhas sem CPF válido (vazio ou com menos de 4 caracteres). Linhas com apenas o saldo acumulado preenchido (sem movimento no mês) são mantidas.
3. **Conversão de horas**: `HH:MM` → decimal (`horas + minutos/60`), preservando o sinal negativo. Vazio, `NaN` ou valor não reconhecido vira `0`.
4. **Setor**: mapeado a partir do departamento seguindo a ordem de regras definida (DADOS/ENGENHARIA/TI → TI; Melhoria Contínua/Financeiro/Contabilidade/FP&A → Finanças Estratégicas; Consultoria/Qualidade/Suporte/Projetos/Produto → Operações; e assim por diante). Departamento sem regra correspondente vira `NONE` e gera um aviso na tela de prévia.
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

## Próximos passos sugeridos

- Validar a ferramenta de Banco de Horas com um mês real completo (upload de ponta a ponta) antes de divulgar para o time.
- Manter `data/aniversariantes.json` atualizado conforme o time muda (entradas, saídas, correções de data).
- Quando fizer sentido, avaliar a integração futura com SharePoint (fora do escopo desta v1, por decisão explícita).
