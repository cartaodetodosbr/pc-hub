/* ==========================================================================
   P&C HUB — Painéis (central de acesso aos painéis Power BI em produção)

   Fluxo: data/paineis.json -> este arquivo -> componente visual.
   Para adicionar, remover ou editar um painel no futuro, edite apenas o
   JSON — a busca, o filtro por área/pilar e o contador são genéricos e
   sempre trabalham em cima da lista completa carregada do arquivo.
   ========================================================================== */

var PN_DATA_URL = "data/paineis.json";

/* Cor de destaque por categoria (reaproveita as 4 cores da identidade
   já usadas em .quick-card / .pillar-tag). Mais de uma categoria pode
   compartilhar a mesma cor — é só um indicador visual discreto, não um
   código de cores exclusivo por área. */
var PN_COR_POR_CATEGORIA = {
  "Pessoas & Cultura": "teal",
  "DHO": "purple",
  "Administração de Pessoal": "orange",
  "Recrutamento & Seleção": "pink",
  "Negócio": "teal",
  "Desenvolvimento Organizacional & Remuneração": "purple"
};

var pnTodosPaineis = [];

function pnCarregarDados() {
  return fetch(PN_DATA_URL).then(function (resp) {
    if (!resp.ok) throw new Error("Não foi possível carregar " + PN_DATA_URL);
    return resp.json();
  });
}

/* Remove acentos e caixa para permitir busca "cultura" encontrar "Cultura". */
function pnNormalizar(texto) {
  var DIACRITICOS = new RegExp("[\u0300-\u036f]", "g");
  return (texto || "")
    .toString()
    .normalize("NFD")
    .replace(DIACRITICOS, "")
    .toLowerCase();
}

function pnPopularFiltro(paineis) {
  var select = document.getElementById("paineis-filtro-area");
  if (!select) return;

  var categorias = [];
  paineis.forEach(function (p) {
    if (p.categoria && categorias.indexOf(p.categoria) === -1) {
      categorias.push(p.categoria);
    }
  });
  categorias.sort(function (a, b) { return a.localeCompare(b, "pt-BR"); });

  categorias.forEach(function (categoria) {
    var option = document.createElement("option");
    option.value = categoria;
    option.textContent = categoria;
    select.appendChild(option);
  });
}

function pnCriarCard(painel) {
  var template = document.getElementById("paineis-card-template");
  var node = template.content.firstElementChild.cloneNode(true);
  var cor = PN_COR_POR_CATEGORIA[painel.categoria] || "teal";

  node.classList.add("painel-card--" + cor);
  node.href = painel.link;
  node.setAttribute("aria-label", "Acessar painel " + painel.nome + " (abre em nova aba)");

  var ghostUse = node.querySelector(".painel-card__thumb-ghost use");
  var iconUse = node.querySelector(".painel-card__thumb-icon use");
  if (ghostUse) ghostUse.setAttribute("href", "#" + painel.icon);
  if (iconUse) iconUse.setAttribute("href", "#" + painel.icon);

  var areaTexto = node.querySelector(".painel-card__area-text");
  if (areaTexto) areaTexto.textContent = painel.areaLabel;

  var titulo = node.querySelector(".painel-card__title");
  if (titulo) titulo.textContent = painel.nome;

  var texto = node.querySelector(".painel-card__text");
  if (texto) texto.textContent = painel.descricao;

  node.dataset.nome = pnNormalizar(painel.nome);
  node.dataset.categoria = painel.categoria || "";

  return node;
}

function pnRenderizarGrid(paineis) {
  var grid = document.getElementById("paineis-grid");
  if (!grid) return;
  grid.innerHTML = "";
  paineis.forEach(function (painel) {
    grid.appendChild(pnCriarCard(painel));
  });
}

function pnAtualizarContador(visiveis, total) {
  var contador = document.getElementById("paineis-contador");
  if (!contador) return;
  if (visiveis === total) {
    contador.textContent = total + (total === 1 ? " painel disponível" : " painéis disponíveis");
  } else {
    contador.textContent = visiveis + " de " + total + " painéis encontrados";
  }
}

function pnAplicarFiltros() {
  var buscaEl = document.getElementById("paineis-busca");
  var filtroEl = document.getElementById("paineis-filtro-area");
  var vazioEl = document.getElementById("paineis-vazio");
  var grid = document.getElementById("paineis-grid");
  if (!grid) return;

  var termo = pnNormalizar(buscaEl ? buscaEl.value : "");
  var categoria = filtroEl ? filtroEl.value : "";

  var cards = grid.querySelectorAll(".painel-card");
  var visiveis = 0;

  for (var i = 0; i < cards.length; i++) {
    var card = cards[i];
    var combinaNome = !termo || card.dataset.nome.indexOf(termo) !== -1;
    var combinaCategoria = !categoria || card.dataset.categoria === categoria;
    var mostrar = combinaNome && combinaCategoria;
    card.hidden = !mostrar;
    if (mostrar) visiveis++;
  }

  if (vazioEl) vazioEl.hidden = visiveis > 0;

  pnAtualizarContador(visiveis, pnTodosPaineis.length);
}

function pnMostrarErro() {
  var grid = document.getElementById("paineis-grid");
  var vazioEl = document.getElementById("paineis-vazio");
  if (grid) grid.innerHTML = "";
  if (vazioEl) {
    vazioEl.hidden = false;
    vazioEl.textContent = "Não foi possível carregar os painéis no momento.";
  }
}

function pcInitPaineis() {
  var secao = document.getElementById("view-paineis");
  if (!secao) return;

  pnCarregarDados()
    .then(function (paineis) {
      pnTodosPaineis = paineis || [];
      pnPopularFiltro(pnTodosPaineis);
      pnRenderizarGrid(pnTodosPaineis);
      pnAtualizarContador(pnTodosPaineis.length, pnTodosPaineis.length);

      var buscaEl = document.getElementById("paineis-busca");
      var filtroEl = document.getElementById("paineis-filtro-area");
      if (buscaEl) buscaEl.addEventListener("input", pnAplicarFiltros);
      if (filtroEl) filtroEl.addEventListener("change", pnAplicarFiltros);
    })
    .catch(pnMostrarErro);
}
