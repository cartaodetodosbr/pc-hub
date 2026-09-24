/* ==========================================================================
   P&C HUB — One Pages (acervo mensal)

   Fluxo: data/onepages.json -> este arquivo -> seletor Ano/Mês + visualizador
   de PDF embutido. Os relatórios em si continuam sendo os PDFs originais
   (já com a identidade de P&C aplicada) — nada é convertido para HTML.

   Para adicionar um mês novo no futuro: colocar os PDFs em
   assets/onepages/<ano>/<mes>/ e acrescentar um objeto em "periodos" no
   JSON. Nenhum HTML/CSS/JS precisa mudar.
   ========================================================================== */

var OP_DATA_URL = "data/onepages.json";
var opDados = null;

/* Preenchido por okrs.js antes de navegar para #one-pages, quando o usuário
   clica em "Ver no One Page de..." a partir do detalhe de um KR/KPI. */
var opSelecaoPendente = null;

function opCarregarDados() {
  return fetch(OP_DATA_URL).then(function (resp) {
    if (!resp.ok) throw new Error("Não foi possível carregar " + OP_DATA_URL);
    return resp.json();
  });
}

function opPeriodosOrdenados() {
  var periodos = (opDados && opDados.periodos) || [];
  return periodos.slice().sort(function (a, b) {
    if (a.ano !== b.ano) return b.ano - a.ano;
    return (b.mesNum || 0) - (a.mesNum || 0);
  });
}

function opAnosDisponiveis() {
  var anos = [];
  opPeriodosOrdenados().forEach(function (p) {
    if (anos.indexOf(p.ano) === -1) anos.push(p.ano);
  });
  return anos;
}

function opPeriodosDoAno(ano) {
  return opPeriodosOrdenados().filter(function (p) { return p.ano === ano; });
}

function opPopularSeletorAno(anoSelecionado) {
  var select = document.getElementById("op-select-ano");
  if (!select) return;
  select.innerHTML = "";
  opAnosDisponiveis().forEach(function (ano) {
    var option = document.createElement("option");
    option.value = String(ano);
    option.textContent = String(ano);
    select.appendChild(option);
  });
  if (anoSelecionado) select.value = String(anoSelecionado);
}

function opPopularSeletorMes(ano, mesSelecionado) {
  var select = document.getElementById("op-select-mes");
  if (!select) return;
  select.innerHTML = "";
  opPeriodosDoAno(ano).forEach(function (periodo) {
    var option = document.createElement("option");
    option.value = periodo.mes;
    option.textContent = periodo.mesLabel || periodo.mes;
    select.appendChild(option);
  });
  if (mesSelecionado) select.value = mesSelecionado;
}

function opEncontrarPeriodo(ano, mes) {
  return opPeriodosOrdenados().filter(function (p) {
    return p.ano === Number(ano) && p.mes === mes;
  })[0];
}

function opFecharVisualizador() {
  var viewer = document.getElementById("op-viewer");
  var iframe = document.getElementById("op-iframe");
  if (viewer) viewer.hidden = true;
  if (iframe) iframe.src = "";
}

function opAbrirItem(item) {
  var viewer = document.getElementById("op-viewer");
  var iframe = document.getElementById("op-iframe");
  var titulo = document.getElementById("op-viewer-titulo");
  var baixar = document.getElementById("op-viewer-baixar");
  if (!viewer || !iframe) return;

  if (titulo) titulo.textContent = item.titulo;
  if (baixar) baixar.href = item.arquivo;
  iframe.src = item.arquivo;
  viewer.hidden = false;
  viewer.scrollIntoView({ behavior: "smooth", block: "start" });
}

function opRenderizarGrade(periodo) {
  var grid = document.getElementById("op-grid");
  if (!grid) return;
  grid.innerHTML = "";
  opFecharVisualizador();

  if (!periodo || !periodo.itens || !periodo.itens.length) {
    grid.innerHTML = '<p class="op-vazio">Nenhum One Page cadastrado para este período ainda.</p>';
    return;
  }

  periodo.itens.forEach(function (item) {
    var card = document.createElement("button");
    card.type = "button";
    card.className = "op-card";
    card.innerHTML =
      '<span class="op-card__icone"><svg class="icon"><use href="#icon-file-text"></use></svg></span>' +
      '<span class="op-card__titulo">' + item.titulo + "</span>" +
      '<span class="op-card__acao">Abrir <svg class="icon icon--sm"><use href="#icon-arrow-right"></use></svg></span>';
    card.addEventListener("click", function () { opAbrirItem(item); });
    grid.appendChild(card);
  });
}

function opAtualizarView(ano, mes) {
  opPopularSeletorMes(ano);
  var mesEl = document.getElementById("op-select-mes");
  if (mes && mesEl) mesEl.value = mes;
  var mesEfetivo = mesEl ? mesEl.value : mes;
  var periodo = opEncontrarPeriodo(ano, mesEfetivo);
  opRenderizarGrade(periodo);
  return periodo;
}

function opMostrarErro() {
  var grid = document.getElementById("op-grid");
  if (grid) grid.innerHTML = '<p class="op-vazio">Não foi possível carregar o acervo de One Pages no momento.</p>';
}

/* Chamado pelo detalhe de KR/KPI (okrs.js) para abrir um One Page específico
   assim que a rota #one-pages terminar de renderizar. */
function opAbrirSelecaoPendente() {
  if (!opSelecaoPendente || !opDados) return;
  var alvo = opSelecaoPendente;
  opSelecaoPendente = null;

  opPopularSeletorAno(alvo.ano);
  var anoEl = document.getElementById("op-select-ano");
  if (anoEl) anoEl.value = String(alvo.ano);
  var periodo = opAtualizarView(alvo.ano, alvo.mes);
  if (periodo) {
    var item = periodo.itens.filter(function (i) { return i.arquivo === alvo.arquivo; })[0];
    if (item) opAbrirItem(item);
  }
}

function pcInitOnePages() {
  var secao = document.getElementById("view-one-pages");
  if (!secao) return;

  opCarregarDados()
    .then(function (dados) {
      opDados = dados;
      var periodos = opPeriodosOrdenados();
      if (!periodos.length) { opMostrarErro(); return; }

      var maisRecente = periodos[0];
      opPopularSeletorAno(maisRecente.ano);
      opAtualizarView(maisRecente.ano, maisRecente.mes);

      var anoEl = document.getElementById("op-select-ano");
      var mesEl = document.getElementById("op-select-mes");
      if (anoEl) {
        anoEl.addEventListener("change", function () {
          opAtualizarView(Number(anoEl.value));
        });
      }
      if (mesEl) {
        mesEl.addEventListener("change", function () {
          opAtualizarView(Number(anoEl.value), mesEl.value);
        });
      }

      var fecharBtn = document.getElementById("op-viewer-fechar");
      if (fecharBtn) fecharBtn.addEventListener("click", opFecharVisualizador);

      // Se o usuário chegou aqui via link contextual do detalhe de um KR/KPI
      if (opSelecaoPendente) opAbrirSelecaoPendente();
    })
    .catch(opMostrarErro);

  // Reabre a seleção pendente também quando a view já estava carregada e o
  // usuário navega de novo para #one-pages a partir de outro link contextual.
  window.addEventListener("hashchange", function () {
    if (window.location.hash.replace(/^#/, "") === "one-pages" && opSelecaoPendente && opDados) {
      opAbrirSelecaoPendente();
    }
  });
}
