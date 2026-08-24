# P&C Hub — Pessoas, Cultura & Facilidades

Portal de ferramentas e facilidades do time de Pessoas & Cultura da TODOS Empreendimentos. Site estático (HTML + CSS + JavaScript puro), sem backend, sem login e sem banco de dados — pensado para publicação direta no GitHub Pages.

## O que já está pronto (v1)

- Layout completo e navegável: cabeçalho, menu lateral, faixas coloridas institucionais.
- Home com banner de boas-vindas, cards de acesso rápido e destaque para a ferramenta funcional.
- Menu lateral com Início, Ferramentas (Banco de Horas, Calculadoras, Modelos e Templates, Guia Rápido), Indicadores, Documentos, Automações, Ajuda e Fale com o time — as seções ainda não construídas mostram uma tela "Em breve".
- **Conversor de Banco de Horas totalmente funcional**: upload (arrastar/soltar ou selecionar, múltiplos arquivos/meses de uma vez), processamento e validação, prévia do resultado convertido e download do CSV pronto para o Power BI — tudo processado localmente no navegador, sem envio de dados a nenhum servidor.
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
│   └── vendor/papaparse.min.js → biblioteca PapaParse (MIT), hospedada localmente
├── assets/
│   ├── logos/                 → logo TODOS Empreendimentos, logo Pessoas e Cultura
│   ├── mascot/                → QIA (versão em glow, reservada para uso pontual)
│   ├── images/                → favicon.svg
│   └── fonts/                 → **pendente**: arquivos da fonte Panton (ver abaixo)
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

Nenhuma etapa de build é necessária — é HTML/CSS/JS puro, funciona abrindo o `index.html` direto no navegador (inclusive localmente, com duplo clique, para testar antes de publicar).

**Nota sobre dependências externas:** a única biblioteca JavaScript usada (PapaParse, para leitura do CSV) está hospedada dentro do próprio projeto, em `js/vendor/papaparse.min.js`, em vez de vir de um CDN externo — assim o Conversor de Banco de Horas continua funcionando mesmo se a rede da empresa bloquear domínios externos. A única chamada a um serviço externo é o Google Fonts (para a fonte Poppins, usada como substituta temporária da Panton); se isso também for bloqueado na rede corporativa, o navegador usa automaticamente a fonte padrão do sistema, sem quebrar o site.

## Pendências conhecidas

- **Fonte Panton**: os arquivos ainda não foram recebidos. O site usa Poppins (Google Fonts) como fallback visual. Para trocar: coloque os arquivos `.woff2`/`.woff` em `assets/fonts/`, descomente o bloco `@font-face` no topo de `css/variables.css` e ajuste os nomes de arquivo — nada mais precisa mudar.
- **Coruja mascote (versão verde/ilustrada)**: hoje é recriada como um SVG simples embutido no próprio `index.html` (não depende de nenhum arquivo externo). Se você tiver o arquivo oficial da ilustração (PNG/SVG com fundo transparente), ela pode substituir o SVG atual para ficar idêntica à peça original.
- **Painéis "Novidades" e "Acessos Rápidos"** do mockup original não foram incluídos nesta v1 (decisão tomada em conjunto: eles traziam notícias de exemplo e links para SharePoint/Power BI/Calendário/Teams, fora do escopo desta primeira versão). Podem ser adicionados depois, quando essas integrações existirem de fato.
- **Indicadores, Documentos, Automações, Calculadoras, Modelos e Templates, Guia Rápido**: só têm a tela "Em breve" — o conteúdo real entra em versões futuras.

## Conversor de Banco de Horas — como funciona

A lógica de conversão está inteiramente em `js/banco-horas.js` e foi validada contra um arquivo real de julho/2026 e o respectivo arquivo já convertido (os totais batem exatamente com a tabela de referência do documento de regras: 191 registros, +334,07h positivo, -362,65h negativo, -28,58h de saldo do mês).

Resumo das regras implementadas:

1. **Entrada esperada**: CSV separado por `;`, com as colunas `Nome do funcionário`, `Número de matrícula`, `Nome do departamento`, `CPF do funcionário`, `Banco Positivo`, `Banco Negativo`, `Banco Saldo`.
2. **Limpeza**: remove automaticamente linhas de teste do sistema (departamento "TESTE", matrícula "10000" ou nome contendo "TESTE INTERPONTO") e linhas sem CPF válido (vazio ou com menos de 4 caracteres). Linhas com apenas o saldo acumulado preenchido (sem movimento no mês) são mantidas.
3. **Conversão de horas**: `HH:MM` → decimal (`horas + minutos/60`), preservando o sinal negativo. Vazio, `NaN` ou valor não reconhecido vira `0`.
4. **Setor**: mapeado a partir do departamento seguindo a ordem de regras definida (DADOS/ENGENHARIA/TI → TI; Melhoria Contínua/Financeiro/Contabilidade/FP&A → Finanças Estratégicas; Consultoria/Qualidade/Suporte/Projetos/Produto → Operações; e assim por diante). Departamento sem regra correspondente vira `NONE` e gera um aviso na tela de prévia.
5. **Competência**: como o nome do arquivo exportado pelo sistema não segue um padrão confiável (ex.: `relatorio_202686_0942_julho_1.CSV`), a ferramenta tenta sugerir a competência a partir do nome do arquivo, mas sempre pede confirmação manual no formato `AAAA/MM` antes de converter.
6. **Múltiplos meses de uma vez**: é possível enviar mais de um arquivo (um por competência); a ferramenta converte cada um e gera um único CSV já unificado, ordenado por competência crescente — reproduzindo a rotina mensal descrita no documento de regras.
7. **Saída**: CSV separado por `;`, com BOM UTF-8 (para abrir corretamente com acentuação no Excel/Power BI), decimal com ponto, colunas na ordem: `Competência; Nome do funcionário; Número de matrícula; CPF do funcionário; Nome do departamento; Setor; Banco Positivo Dec; Banco Negativo Dec; Saldo Mês; Saldo Acumulado`.

### Ponto de atenção encontrado durante a validação

O arquivo de exemplo já convertido que foi usado como referência apresenta **matrícula com sufixo `.0`** (ex.: `131.0`) e **CPF sem o zero à esquerda** (ex.: `8930499643` em vez de `08930499643`) em alguns registros — um efeito colateral comum de planilhas/Python quando uma coluna de texto é lida como número. Isso contraria a própria regra escrita no documento ("nunca converter para número — causa notação científica"), e pode causar problema de correspondência (matching) por CPF em cruzamentos futuros. **O Conversor do P&C Hub não repete esse comportamento**: matrícula e CPF são sempre tratados como texto puro, preservando zeros à esquerda e sem o sufixo `.0`. Vale considerar aplicar a mesma correção na rotina Python/Power BI atual, se ela ainda estiver em uso em paralelo.

## Próximos passos sugeridos

- Enviar os arquivos da fonte Panton para deixar a identidade visual 100% fiel à marca.
- Validar a ferramenta de Banco de Horas com um mês real completo (upload de ponta a ponta) antes de divulgar para o time.
- Quando fizer sentido, avaliar a integração futura com SharePoint (fora do escopo desta v1, por decisão explícita).
