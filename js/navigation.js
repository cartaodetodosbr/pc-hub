/* ==========================================================================
   P&C HUB — Navegação (roteamento simples por hash, sem reload de página)
   ========================================================================== */

/* Configuração de rotas. Cada chave corresponde ao valor depois do "#" na URL.
   "view" aponta para o id da <section class="view"> que deve ficar visível.
   Rotas que caem em "view-em-breve" recebem título/texto próprios. */
var PC_ROUTES = {
  "inicio": { view: "view-inicio" },
  "ferramentas/banco-horas": { view: "view-banco-horas" },
  "indicadores": {
    view: "view-em-breve",
    title: "Indicadores",
    text: "Em breve você vai encontrar aqui os dashboards e indicadores estratégicos de Pessoas & Cultura. Estamos preparando esta funcionalidade."
  },
  "documentos": {
    view: "view-em-breve",
    title: "Documentos",
    text: "Em breve você vai encontrar aqui políticas, manuais e documentos importantes do time. Estamos preparando esta funcionalidade."
  },
  "ferramentas/calculadoras": {
    view: "view-em-breve",
    title: "Calculadoras",
    text: "Em breve você vai encontrar aqui calculadoras para o dia a dia de Pessoas & Cultura. Estamos preparando esta funcionalidade."
  },
  "ferramentas/modelos": {
    view: "view-em-breve",
    title: "Modelos e Templates",
    text: "Em breve você vai encontrar aqui modelos e templates prontos para uso. Estamos preparando esta funcionalidade."
  },
  "ferramentas/guia-rapido": {
    view: "view-em-breve",
    title: "Guia Rápido",
    text: "Em breve você vai encontrar aqui um guia rápido com os principais processos do time. Estamos preparando esta funcionalidade."
  },
  "automacoes": {
    view: "view-em-breve",
    title: "Automações",
    text: "Em breve você vai encontrar aqui soluções para simplificar processos do dia a dia. Estamos preparando esta funcionalidade."
  },
  "ajuda": {
    view: "view-em-breve",
    title: "Ajuda",
    text: "Nossa central de ajuda está a caminho. Estamos preparando esta funcionalidade."
  },
  "nosso-dia": {
    view: "view-em-breve",
    title: "Nosso Dia",
    text: "Em breve você vai encontrar aqui aniversários, a agenda de P&C e outras informações rápidas do dia a dia. Estamos preparando esta funcionalidade."
  },
  "projetos": {
    view: "view-em-breve",
    title: "Projetos / Iniciativas",
    text: "Em breve você vai acompanhar aqui os projetos e iniciativas em andamento no time de Pessoas & Cultura. Estamos preparando esta funcionalidade."
  },
  "qia": {
    view: "view-em-breve",
    title: "QIA",
    text: "Em breve você vai encontrar aqui mais sobre a QIA, nossa assistente de Pessoas & Cultura. Estamos preparando esta funcionalidade."
  }
};

var PC_DEFAULT_ROUTE = "inicio";

function pcGetCurrentRoute() {
  var hash = window.location.hash.replace(/^#/, "");
  return PC_ROUTES.hasOwnProperty(hash) ? hash : PC_DEFAULT_ROUTE;
}

function pcCloseMobileSidebar() {
  var sidebar = document.getElementById("app-sidebar");
  var overlay = document.getElementById("sidebar-overlay");
  var toggle = document.getElementById("sidebar-toggle");
  if (sidebar) sidebar.classList.remove("is-open");
  if (overlay) overlay.classList.remove("is-visible");
  if (toggle) toggle.setAttribute("aria-expanded", "false");
}

function pcRenderRoute() {
  var route = pcGetCurrentRoute();
  var config = PC_ROUTES[route];

  // Alterna qual <section class="view"> está visível
  var views = document.querySelectorAll(".view");
  for (var i = 0; i < views.length; i++) {
    views[i].classList.toggle("is-active", views[i].id === config.view);
  }

  // Preenche o conteúdo da tela "Em breve" quando aplicável
  if (config.view === "view-em-breve") {
    var titleEl = document.getElementById("eb-title");
    var textEl = document.getElementById("eb-text");
    if (titleEl) titleEl.textContent = config.title || "Em breve";
    if (textEl) textEl.textContent = config.text || "Estamos preparando esta funcionalidade.";
  }

  // Atualiza o item ativo no menu lateral
  var navItems = document.querySelectorAll(".app-sidebar .nav-item[data-nav]");
  for (var j = 0; j < navItems.length; j++) {
    navItems[j].classList.toggle("is-active", navItems[j].getAttribute("data-nav") === route);
  }

  // Expande automaticamente o grupo "Ferramentas" quando a rota é filha dele
  var ferramentasGroup = document.getElementById("nav-group-ferramentas");
  var ferramentasTrigger = document.getElementById("nav-group-ferramentas-trigger");
  if (ferramentasGroup && route.indexOf("ferramentas/") === 0) {
    ferramentasGroup.classList.add("is-open");
    if (ferramentasTrigger) ferramentasTrigger.setAttribute("aria-expanded", "true");
  }

  // Se a ferramenta Banco de Horas está sendo aberta, garante que ela comece
  // sempre na etapa de upload (evita "vazar" um estado de uma visita anterior)
  if (route === "ferramentas/banco-horas" && typeof pcResetBancoHoras === "function") {
    pcResetBancoHoras();
  }

  pcCloseMobileSidebar();

  var main = document.getElementById("app-main");
  if (main) main.scrollTop = 0;
}

function pcInitNavigation() {
  window.addEventListener("hashchange", pcRenderRoute);

  var toggleBtn = document.getElementById("sidebar-toggle");
  var overlay = document.getElementById("sidebar-overlay");
  var sidebar = document.getElementById("app-sidebar");

  if (toggleBtn && sidebar && overlay) {
    toggleBtn.addEventListener("click", function () {
      var isOpen = sidebar.classList.toggle("is-open");
      overlay.classList.toggle("is-visible", isOpen);
      toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
    overlay.addEventListener("click", pcCloseMobileSidebar);
  }

  var ferramentasTrigger = document.getElementById("nav-group-ferramentas-trigger");
  var ferramentasGroup = document.getElementById("nav-group-ferramentas");
  if (ferramentasTrigger && ferramentasGroup) {
    ferramentasTrigger.addEventListener("click", function () {
      var isOpen = ferramentasGroup.classList.toggle("is-open");
      ferramentasTrigger.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  pcRenderRoute();
}
