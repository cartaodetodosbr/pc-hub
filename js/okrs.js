/* ==========================================================================
   P&C HUB — OKRs & Metas (v1, somente consulta)

   Fluxo: data/okrs.json -> este arquivo -> componente visual, no mesmo
   padrão das demais seções orientadas a dados do Hub (aniversariantes,
   paineis). Esta é uma v1 de CONSULTA: nada aqui cria, edita ou apaga OKRs
   na Qulture.Rocks — só lê o que já foi transcrito manualmente para o JSON.

   Vários campos pedidos no briefing (responsável, contribuintes, ciclo,
   peso, comentários, tarefas, histórico) não têm fonte confirmada ainda —
   em vez de inventar valores, o painel de detalhe mostra "Não disponível
   nesta versão" para eles. O "status" (Concluído/Em andamento/Atenção/
   Crítico) também não vem da Qulture: é calculado aqui a partir do
   progresso, e isso fica dito na própria tela.
   ========================================================================== */

var OK_DATA_URL = "data/okrs.json";
var OK_ALERTA_DIAS = 14; // janela de "prazo próximo" para entregáveis

var okDados = null;
var okAbaAtiva = "lista";
var okExpandido = {}; // id do nó -> true/false

function okNormalizar(texto) {
  var DIACRITICOS = new RegExp("[̀-ͯ]", "g");
  return (texto || "").toString().normalize("NFD").replace(DIACRITICOS, "").toLowerCase();
}

function okCarregarDados() {
  return fetch(OK_DATA_URL).then(function (resp) {
    if (!resp.ok) throw new Error("Não foi possível carregar " + OK_DATA_URL);
    return resp.json();
  });
}

function okFormatarData(iso) {
  if (!iso) return "—";
  var partes = iso.split("-");
  if (partes.length !== 3) return iso;
  return partes[2] + "/" + partes[1] + "/" + partes[0];
}

function okFormatarProgresso(valor) {
  if (typeof valor !== "number") return "—";
  var arredondado = Math.round(valor * 10) / 10;
  return (arredondado % 1 === 0 ? arredondado.toFixed(0) : String(arredondado).replace(".", ",")) + "%";
}

/* Status é uma heurística nossa por faixa de progresso — não é um campo
   nativo da Qulture.Rocks (não identificado no material recebido). */
function okStatusDoProgresso(progresso) {
  if (typeof progresso !== "number") return { label: "Sem dado", cor: "muted" };
  if (progresso >= 100) return { label: "Concluído", cor: "teal" };
  if (progresso >= 70) return { label: "Em andamento", cor: "teal" };
  if (progresso >= 40) return { label: "Atenção", cor: "orange" };
  return { label: "Crítico", cor: "pink" };
}

var OK_TIPO_LABEL = { objetivo: "Objetivo", kr: "KR", kpi: "KPI" };

function okTodosOsNos(nos, acc) {
  acc = acc || [];
  (nos || []).forEach(function (no) {
    acc.push(no);
    if (no.filhos && no.filhos.length) okTodosOsNos(no.filhos, acc);
  });
  return acc;
}

function okDiasAte(iso) {
  if (!iso) return null;
  var alvo = new Date(iso + "T00:00:00");
  var hoje = new Date();
  var hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  return Math.round((alvo - hojeSemHora) / 86400000);
}

function okCalcularStats(dados) {
  var todos = okTodosOsNos(dados.nos);
  var objetivos = todos.filter(function (n) { return n.tipo === "objetivo"; });
  var krs = todos.filter(function (n) { return n.tipo === "kr"; });
  var kpis = todos.filter(function (n) { return n.tipo === "kpi"; });

  var somaKrs = krs.reduce(function (soma, kr) { return soma + (typeof kr.progresso === "number" ? kr.progresso : 0); }, 0);
  var progressoMedioKrs = krs.length ? somaKrs / krs.length : null;

  var objetivosConcluidos = objetivos.filter(function (o) { return o.progresso >= 100; }).length;
  var objetivosPendentes = objetivos.length - objetivosConcluidos;

  var entregaveis = [];
  (dados.projetos || []).forEach(function (p) {
    (p.entregaveis || []).forEach(function (e) { entregaveis.push(e); });
  });
  var alertasPrazo = entregaveis.filter(function (e) {
    if (e.status === "entregue") return false;
    var dias = okDiasAte(e.prazo);
    return dias !== null && dias <= OK_ALERTA_DIAS;
  }).length;

  return {
    totalObjetivos: objetivos.length,
    totalKrs: krs.length,
    totalKpis: kpis.length,
    progressoMedioKrs: progressoMedioKrs,
    objetivosConcluidos: objetivosConcluidos,
    objetivosPendentes: objetivosPendentes,
    alertasPrazo: alertasPrazo
  };
}

function okRenderizarStats(stats) {
  var container = document.getElementById("okrs-stats");
  if (!container) return;
  var cards = [
    { label: "Objetivos ativos", valor: String(stats.totalObjetivos) },
    { label: "Total de KRs", valor: String(stats.totalKrs) },
    { label: "Total de KPIs", valor: String(stats.totalKpis) },
    { label: "Progresso médio dos KRs", valor: okFormatarProgresso(stats.progressoMedioKrs) },
    { label: "Objetivos concluídos", valor: stats.objetivosConcluidos + " de " + (stats.objetivosConcluidos + stats.objetivosPendentes) },
    { label: "Entregáveis com prazo próximo", valor: String(stats.alertasPrazo) }
  ];
  container.innerHTML = "";
  cards.forEach(function (c) {
    var item = document.createElement("div");
    item.className = "okr-stat";
    item.innerHTML = '<div class="okr-stat__value">' + c.valor + '</div><div class="okr-stat__label">' + c.label + "</div>";
    container.appendChild(item);
  });
}

function okPopularFiltroTipo() {
  var select = document.getElementById("okrs-filtro-tipo");
  if (!select || select.dataset.populado) return;
  Object.keys(OK_TIPO_LABEL).forEach(function (tipo) {
    var option = document.createElement("option");
    option.value = tipo;
    option.textContent = OK_TIPO_LABEL[tipo];
    select.appendChild(option);
  });
  select.dataset.populado = "true";
}

function okCriarLinha(no, nivel) {
  var linha = document.createElement("div");
  linha.className = "okr-node okr-node--nivel-" + nivel + " okr-node--" + no.tipo;
  linha.dataset.nome = okNormalizar(no.nome);
  linha.dataset.tipo = no.tipo;

  var status = okStatusDoProgresso(no.progresso);
  var temFilhos = no.filhos && no.filhos.length > 0;
  var aberto = okExpandido[no.id] !== false; // padrão: aberto

  var toggleHtml = temFilhos
    ? '<button type="button" class="okr-node__toggle' + (aberto ? " is-open" : "") + '" data-okr-toggle="' + no.id + '" aria-label="Expandir/recolher"><svg class="icon icon--sm"><use href="#icon-chevron-right"></use></svg></button>'
    : '<span class="okr-node__toggle-spacer"></span>';

  linha.innerHTML =
    '<div class="okr-node__row" data-okr-abrir="' + no.id + '" style="--okr-indent:' + (nivel * 22) + 'px;">' +
      toggleHtml +
      '<span class="okr-node__badge okr-node__badge--' + no.tipo + '">' + OK_TIPO_LABEL[no.tipo] + "</span>" +
      '<span class="okr-node__nome">' + no.nome + "</span>" +
      '<span class="okr-node__area">' + (no.area || "—") + "</span>" +
      '<span class="okr-node__progresso"><span class="okr-node__progresso-dot okr-node__progresso-dot--' + status.cor + '"></span>' + okFormatarProgresso(no.progresso) + "</span>" +
      '<span class="okr-node__status okr-node__status--' + status.cor + '">' + status.label + "</span>" +
      '<span class="okr-node__periodo">' + (no.periodo ? okFormatarData(no.periodo) : "—") + "</span>" +
    "</div>";

  var wrap = document.createElement("div");
  wrap.appendChild(linha);

  if (temFilhos) {
    var filhosWrap = document.createElement("div");
    filhosWrap.className = "okr-node__filhos";
    filhosWrap.hidden = !aberto;
    no.filhos.forEach(function (filho) {
      filhosWrap.appendChild(okCriarLinha(filho, nivel + 1));
    });
    wrap.appendChild(filhosWrap);
  }

  return wrap;
}

function okRenderizarLista(nos) {
  var container = document.getElementById("okrs-lista");
  if (!container) return;
  container.innerHTML = "";
  if (!nos.length) {
    container.innerHTML = '<p class="okr-vazio">Nenhum item encontrado para essa busca ou filtro.</p>';
    return;
  }
  nos.forEach(function (no) {
    container.appendChild(okCriarLinha(no, 0));
  });

  container.querySelectorAll("[data-okr-toggle]").forEach(function (btn) {
    btn.addEventListener("click", function (ev) {
      ev.stopPropagation();
      var id = btn.getAttribute("data-okr-toggle");
      okExpandido[id] = !(okExpandido[id] !== false);
      okRenderizarLista(okDados.nos);
    });
  });

  container.querySelectorAll("[data-okr-abrir]").forEach(function (row) {
    row.addEventListener("click", function () {
      var id = row.getAttribute("data-okr-abrir");
      var no = okTodosOsNos(okDados.nos).filter(function (n) { return n.id === id; })[0];
      if (no) okAbrirDetalhe(no);
    });
  });
}

function okAbrirDetalhe(no) {
  var painel = document.getElementById("okrs-detalhe");
  if (!painel) return;
  var status = okStatusDoProgresso(no.progresso);

  var camposConfirmados =
    '<dt>Tipo</dt><dd>' + OK_TIPO_LABEL[no.tipo] + "</dd>" +
    '<dt>Progresso</dt><dd>' + okFormatarProgresso(no.progresso) + "</dd>" +
    '<dt>Status (calculado)</dt><dd>' + status.label + "</dd>" +
    '<dt>Área</dt><dd>' + (no.area || "—") + "</dd>" +
    '<dt>Período</dt><dd>' + (no.periodo ? okFormatarData(no.periodo) : "—") + "</dd>";

  if (no.meta) camposConfirmados += '<dt>Meta / resultado</dt><dd>' + no.meta + "</dd>";
  if (typeof no.progressoMediaKpis === "number") {
    camposConfirmados += '<dt>Média dos KPIs filhos</dt><dd>' + okFormatarProgresso(no.progressoMediaKpis) + "</dd>";
  }

  var naoDisponivel = ["Responsável", "Contribuintes", "Ciclo", "Peso", "Meta inicial/final", "Comentários", "Tarefas relacionadas", "Histórico de atualização"];
  var naoDisponivelHtml = naoDisponivel.map(function (campo) {
    return '<dt>' + campo + '</dt><dd class="text-muted">Não disponível nesta versão</dd>';
  }).join("");

  painel.innerHTML =
    '<div class="okr-detalhe__header">' +
      '<span class="okr-node__badge okr-node__badge--' + no.tipo + '">' + OK_TIPO_LABEL[no.tipo] + "</span>" +
      '<button type="button" class="btn btn--ghost btn--sm" id="okrs-detalhe-fechar"><svg class="icon icon--sm"><use href="#icon-close"></use></svg></button>' +
    "</div>" +
    '<h3 class="okr-detalhe__titulo">' + no.nome + "</h3>" +
    (no.observacao ? '<p class="okr-detalhe__observacao"><svg class="icon icon--sm"><use href="#icon-alert-triangle"></use></svg>' + no.observacao + "</p>" : "") +
    '<dl class="okr-detalhe__campos">' + camposConfirmados + naoDisponivelHtml + "</dl>";

  painel.hidden = false;
  var fecharBtn = document.getElementById("okrs-detalhe-fechar");
  if (fecharBtn) fecharBtn.addEventListener("click", function () { painel.hidden = true; });
}

/* ---- Filtros (busca por nome + tipo + faixa de status) ------------------ */
function okFiltrarNo(no, termo, tipo, statusFiltro) {
  var statusNo = okStatusDoProgresso(no.progresso).label;
  var combinaEsteNo =
    (!termo || okNormalizar(no.nome).indexOf(termo) !== -1) &&
    (!tipo || no.tipo === tipo) &&
    (!statusFiltro || statusNo === statusFiltro);

  var filhosFiltrados = (no.filhos || [])
    .map(function (f) { return okFiltrarNo(f, termo, tipo, statusFiltro); })
    .filter(Boolean);

  if (combinaEsteNo || filhosFiltrados.length) {
    var copia = Object.assign({}, no);
    copia.filhos = filhosFiltrados.length ? filhosFiltrados : (combinaEsteNo ? no.filhos : []);
    return copia;
  }
  return null;
}

function okAplicarFiltros() {
  var buscaEl = document.getElementById("okrs-busca");
  var tipoEl = document.getElementById("okrs-filtro-tipo");
  var statusEl = document.getElementById("okrs-filtro-status");
  if (!okDados) return;

  var termo = okNormalizar(buscaEl ? buscaEl.value : "");
  var tipo = tipoEl ? tipoEl.value : "";
  var statusFiltro = statusEl ? statusEl.value : "";

  var filtrados = okDados.nos
    .map(function (no) { return okFiltrarNo(no, termo, tipo, statusFiltro); })
    .filter(Boolean);

  okRenderizarLista(filtrados);
}

/* ---- Mapa estratégico (visão em árvore, com os mesmos dados da lista) --- */
function okCriarCaixaMapa(no) {
  var status = okStatusDoProgresso(no.progresso);
  var caixa = document.createElement("div");
  caixa.className = "okr-mapa__caixa okr-mapa__caixa--" + no.tipo;
  caixa.innerHTML =
    '<span class="okr-node__badge okr-node__badge--' + no.tipo + '">' + OK_TIPO_LABEL[no.tipo] + "</span>" +
    '<p class="okr-mapa__nome">' + no.nome + "</p>" +
    '<span class="okr-node__status okr-node__status--' + status.cor + '">' + okFormatarProgresso(no.progresso) + "</span>";
  caixa.addEventListener("click", function () { okAbrirDetalhe(no); });

  var coluna = document.createElement("div");
  coluna.className = "okr-mapa__coluna";
  coluna.appendChild(caixa);

  if (no.filhos && no.filhos.length) {
    var filhosRow = document.createElement("div");
    filhosRow.className = "okr-mapa__filhos";
    no.filhos.forEach(function (filho) {
      filhosRow.appendChild(okCriarCaixaMapa(filho));
    });
    coluna.appendChild(filhosRow);
  }

  return coluna;
}

function okRenderizarMapa(nos) {
  var container = document.getElementById("okrs-mapa");
  if (!container) return;
  container.innerHTML = "";
  nos.forEach(function (no) {
    container.appendChild(okCriarCaixaMapa(no));
  });
}

/* ---- Projetos & Entregáveis ---------------------------------------------
   Dado extra confirmado nos prints (tabela separada de Objetivos/KRs), sem
   vínculo declarado com um Objetivo/KR específico — por isso aparece como
   uma aba própria, não aninhado na hierarquia. ------------------------- */
function okStatusEntregavel(entregavel) {
  if (entregavel.status === "entregue") return { label: "Entregue", cor: "teal", icon: "icon-check-circle" };
  var dias = okDiasAte(entregavel.prazo);
  if (dias !== null && dias < 0) return { label: "Atrasado", cor: "pink", icon: "icon-alert-triangle" };
  if (dias !== null && dias <= OK_ALERTA_DIAS) return { label: "Prazo próximo", cor: "orange", icon: "icon-alert-triangle" };
  return { label: "Não entregue", cor: "muted", icon: "icon-alert-triangle" };
}

function okRenderizarProjetos(projetos) {
  var container = document.getElementById("okrs-projetos");
  if (!container) return;
  container.innerHTML = "";

  projetos.forEach(function (projeto) {
    var card = document.createElement("div");
    card.className = "okr-projeto-card";

    var entregaveisHtml = (projeto.entregaveis || []).map(function (e) {
      var st = okStatusEntregavel(e);
      return (
        '<li class="okr-projeto-card__entregavel">' +
          '<div class="okr-projeto-card__entregavel-principal">' +
            '<svg class="icon icon--sm okr-projeto-card__entregavel-icon okr-projeto-card__entregavel-icon--' + st.cor + '"><use href="#' + st.icon + '"></use></svg>' +
            '<span class="okr-projeto-card__entregavel-nome">' + e.nome + "</span>" +
          "</div>" +
          '<div class="okr-projeto-card__entregavel-meta">' +
            '<span class="okr-node__status okr-node__status--' + st.cor + '">' + st.label + "</span>" +
            '<span class="okr-projeto-card__entregavel-prazo">Prazo: ' + okFormatarData(e.prazo) + "</span>" +
          "</div>" +
        "</li>"
      );
    }).join("");

    card.innerHTML =
      '<div class="okr-projeto-card__header">' +
        '<h3 class="okr-projeto-card__titulo">' + projeto.nome + "</h3>" +
        '<span class="okr-node__progresso"><span class="okr-node__progresso-dot okr-node__progresso-dot--' + okStatusDoProgresso(projeto.progresso).cor + '"></span>' + okFormatarProgresso(projeto.progresso) + "</span>" +
      "</div>" +
      '<ul class="okr-projeto-card__lista">' + entregaveisHtml + "</ul>";

    container.appendChild(card);
  });
}

/* ---- Abas (Lista / Mapa estratégico / Projetos) ------------------------- */
function okAlternarAba(aba) {
  okAbaAtiva = aba;
  document.querySelectorAll("[data-okr-aba]").forEach(function (btn) {
    btn.classList.toggle("is-active", btn.getAttribute("data-okr-aba") === aba);
  });
  document.querySelectorAll("[data-okr-aba-painel]").forEach(function (painel) {
    painel.hidden = painel.getAttribute("data-okr-aba-painel") !== aba;
  });
}

function okMostrarErro() {
  var container = document.getElementById("okrs-lista");
  if (container) container.innerHTML = '<p class="okr-vazio">Não foi possível carregar os dados de OKRs no momento.</p>';
}

function pcInitOkrs() {
  var secao = document.getElementById("view-okrs");
  if (!secao) return;

  okCarregarDados()
    .then(function (dados) {
      okDados = dados;

      var cicloEl = document.getElementById("okrs-ciclo-atual");
      if (cicloEl) cicloEl.textContent = dados.ciclo || "Ciclo atual";
      var atualizadoEl = document.getElementById("okrs-atualizado-em");
      if (atualizadoEl) atualizadoEl.textContent = dados.atualizadoEm ? "Dados de " + okFormatarData(dados.atualizadoEm) : "";

      okPopularFiltroTipo();
      okRenderizarStats(okCalcularStats(dados));
      okRenderizarLista(dados.nos);
      okRenderizarMapa(dados.nos);
      okRenderizarProjetos(dados.projetos || []);

      var buscaEl = document.getElementById("okrs-busca");
      var tipoEl = document.getElementById("okrs-filtro-tipo");
      var statusEl = document.getElementById("okrs-filtro-status");
      if (buscaEl) buscaEl.addEventListener("input", okAplicarFiltros);
      if (tipoEl) tipoEl.addEventListener("change", okAplicarFiltros);
      if (statusEl) statusEl.addEventListener("change", okAplicarFiltros);

      document.querySelectorAll("[data-okr-aba]").forEach(function (btn) {
        btn.addEventListener("click", function () { okAlternarAba(btn.getAttribute("data-okr-aba")); });
      });
      okAlternarAba("lista");
    })
    .catch(okMostrarErro);
}
