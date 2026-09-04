/* ==========================================================================
   P&C HUB — Conversor de Banco de Horas
   Regras de conversão definidas em "Regras de Conversão — Banco de Horas"
   (TODOS Empreendimentos · Pessoas e Cultura, agosto/2026), validadas contra
   um arquivo original real e o respectivo arquivo já convertido.
   Todo o processamento acontece localmente no navegador — nenhum arquivo é
   enviado para servidores.
   ========================================================================== */

/* ---- Colunas obrigatórias no arquivo de entrada -------------------------- */
var BH_REQUIRED_COLUMNS = [
  "Nome do funcionário",
  "Número de matrícula",
  "Nome do departamento",
  "CPF do funcionário",
  "Banco Positivo",
  "Banco Negativo",
  "Banco Saldo"
];

/* ---- Colunas e ordem exata do arquivo de saída ---------------------------- */
var BH_OUTPUT_COLUMNS = [
  "Competência",
  "Nome do funcionário",
  "Número de matrícula",
  "CPF do funcionário",
  "Nome do departamento",
  "Setor",
  "Banco Positivo Dec",
  "Banco Negativo Dec",
  "Saldo Mês",
  "Saldo Acumulado"
];

var BH_MAX_FILES = 6;
var BH_PREVIEW_ROWS = 12;

/* Estado em memória da sessão de conversão atual */
var bhSelectedFiles = [];     // [{ id, file, competencia }]
var bhConvertedRows = [];     // linhas já transformadas, prontas para exportar
var bhConvertedCsvBlob = null;
var bhConvertedFileName = "";
var bhFileIdCounter = 0;
var bhUltimosAvisos = null; // último resumo de avisos (teste/CPF/setor) do processamento atual

/* --------------------------------------------------------------------------
   Utilitários
   -------------------------------------------------------------------------- */

function bhFoldAccents(str) {
  return (str || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function bhFormatBytes(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1).replace(".", ",") + " KB";
  return (bytes / (1024 * 1024)).toFixed(1).replace(".", ",") + " MB";
}

/* Converte "HH:MM" (com sinal opcional) para número decimal.
   Vazio, "nan" ou valores não reconhecidos viram 0, conforme a regra. */
function bhParseHoraParaDecimal(valor) {
  if (valor === null || valor === undefined) return 0;
  var texto = String(valor).trim();
  if (texto === "" || texto.toLowerCase() === "nan") return 0;
  var match = texto.match(/^(-)?(\d+):(\d{1,2})$/);
  if (!match) return 0;
  var sinal = match[1] ? -1 : 1;
  var horas = parseInt(match[2], 10);
  var minutos = parseInt(match[3], 10);
  return sinal * (horas + minutos / 60);
}

/* Tenta adivinhar a competência (AAAA/MM) a partir do nome do arquivo, só
   como sugestão inicial — o campo continua editável e é sempre conferido
   antes de converter. */
var BH_MESES = {
  "janeiro": "01", "jan": "01",
  "fevereiro": "02", "fev": "02",
  "marco": "03", "mar": "03",
  "abril": "04", "abr": "04",
  "maio": "05", "mai": "05",
  "junho": "06", "jun": "06",
  "julho": "07", "jul": "07",
  "agosto": "08", "ago": "08",
  "setembro": "09", "set": "09",
  "outubro": "10", "out": "10",
  "novembro": "11", "nov": "11",
  "dezembro": "12", "dez": "12"
};

function bhGuessCompetencia(fileName) {
  var nome = bhFoldAccents(fileName || "").toLowerCase();

  var isoMatch = nome.match(/(20\d{2})[-_\/](0[1-9]|1[0-2])/);
  if (isoMatch) return isoMatch[1] + "/" + isoMatch[2];

  var mesEncontrado = null;
  for (var chave in BH_MESES) {
    if (nome.indexOf(chave) !== -1) {
      mesEncontrado = BH_MESES[chave];
      break;
    }
  }
  var anoMatch = nome.match(/20\d{2}/);
  if (mesEncontrado && anoMatch) return anoMatch[0] + "/" + mesEncontrado;

  return "";
}

function bhCompetenciaValida(valor) {
  return /^\d{4}\/(0[1-9]|1[0-2])$/.test((valor || "").trim());
}

/* --------------------------------------------------------------------------
   Regra de mapeamento Departamento → Setor
   Ordem de avaliação segue exatamente o documento de regras — a primeira
   condição satisfeita decide o setor.
   -------------------------------------------------------------------------- */
function bhMapearSetor(departamentoBruto) {
  var d = bhFoldAccents((departamentoBruto || "").trim().toUpperCase());

  if (d === "DADOS") return "TI";
  if (d === "ENGENHARIA") return "TI";
  if (d.indexOf("TI ") === 0) return "TI";
  if (d.indexOf("TI-") === 0) return "TI";
  if (d === "TI") return "TI";
  if (d.indexOf("SEGURANCA") !== -1) return "TI";

  if (d.indexOf("MELHORIA CONTINUA") !== -1) return "Finanças Estratégicas";
  if (d.indexOf("FINANCEIRO") !== -1) return "Finanças Estratégicas";
  if (d.indexOf("CONTABILIDADE") !== -1) return "Finanças Estratégicas";
  if (d.indexOf("FP&A") !== -1) return "Finanças Estratégicas";

  if (d.indexOf("CONSULTORIA") !== -1) return "Operações";
  if (d.indexOf("QUALIDADE") !== -1) return "Operações";
  if (d.indexOf("SUPORTE") !== -1) return "Operações";
  if (d.indexOf("PROJETOS") !== -1) return "Operações";
  if (d.indexOf("PRODUTO") !== -1) return "Operações";

  if (d.indexOf("PESSOAS E CULTURA") !== -1) return "Pessoas e Cultura";
  if (d.indexOf("CRM") !== -1) return "CRM";
  if (d.indexOf("PRESID") !== -1) return "Presidência";
  if (d.indexOf("JOVENS PROFISSIONAIS") !== -1) return "Jovens Profissionais";
  if (d.indexOf("SECRETARIA") !== -1) return "Secretaria";

  return "NONE";
}

/* --------------------------------------------------------------------------
   Referências de DOM
   -------------------------------------------------------------------------- */
function bhEls() {
  return {
    dropzone: document.getElementById("bh-dropzone"),
    fileInput: document.getElementById("bh-file-input"),
    fileList: document.getElementById("bh-file-list"),
    fileCardTemplate: document.getElementById("bh-file-card-template"),
    addMoreWrap: document.getElementById("bh-add-more-wrap"),
    addMoreBtn: document.getElementById("bh-add-more"),
    errorSlot: document.getElementById("bh-error-slot"),
    uploadActions: document.getElementById("bh-upload-actions"),
    continueBtn: document.getElementById("bh-continue-btn"),
    flowSteps: document.getElementById("bh-flow-steps"),
    previewCount: document.getElementById("bh-preview-count"),
    previewAlertSlot: document.getElementById("bh-preview-alert-slot"),
    previewHead: document.getElementById("bh-preview-head"),
    previewBody: document.getElementById("bh-preview-body"),
    previewBack: document.getElementById("bh-preview-back"),
    previewContinue: document.getElementById("bh-preview-continue"),
    successFilename: document.getElementById("bh-success-filename"),
    successCount: document.getElementById("bh-success-count"),
    successWarnings: document.getElementById("bh-success-warnings"),
    successWarningList: document.getElementById("bh-success-warning-list"),
    downloadBtn: document.getElementById("bh-download-btn"),
    successRestart: document.getElementById("bh-success-restart")
  };
}

function bhSwitchView(viewName) {
  var panels = document.querySelectorAll("#view-banco-horas .bh-panel[data-bh-view]");
  for (var i = 0; i < panels.length; i++) {
    panels[i].classList.toggle("is-active", panels[i].getAttribute("data-bh-view") === viewName);
  }
  bhUpdateFlowSteps(viewName);
}

function bhUpdateFlowSteps(viewName) {
  var stepByView = { upload: 1, processing: 2, preview: 3, success: 4 };
  var current = stepByView[viewName] || 1;
  var els = bhEls();
  if (!els.flowSteps) return;
  var steps = els.flowSteps.querySelectorAll(".flow-step[data-flow-step]");
  for (var i = 0; i < steps.length; i++) {
    var n = parseInt(steps[i].getAttribute("data-flow-step"), 10);
    steps[i].classList.toggle("is-active", n === current);
    steps[i].classList.toggle("is-done", n < current);
  }
}

function bhShowError(message, title) {
  var els = bhEls();
  if (!els.errorSlot) return;
  els.errorSlot.innerHTML = "";
  var alertEl = document.createElement("div");
  alertEl.className = "alert alert--error";
  var iconWrap = document.createElement("span");
  iconWrap.innerHTML = '<svg class="icon"><use href="#icon-alert-triangle"></use></svg>';
  var textWrap = document.createElement("div");
  var titleEl = document.createElement("p");
  titleEl.className = "alert__title";
  titleEl.textContent = title || "Não foi possível continuar";
  var msgEl = document.createElement("p");
  msgEl.style.margin = "0";
  msgEl.textContent = message;
  textWrap.appendChild(titleEl);
  textWrap.appendChild(msgEl);
  alertEl.appendChild(iconWrap);
  alertEl.appendChild(textWrap);
  els.errorSlot.appendChild(alertEl);
}

function bhClearError() {
  var els = bhEls();
  if (els.errorSlot) els.errorSlot.innerHTML = "";
}

/* --------------------------------------------------------------------------
   Gestão da lista de arquivos selecionados (Etapa 01)
   -------------------------------------------------------------------------- */
function bhValidarArquivo(file) {
  var nomeLower = file.name.toLowerCase();
  if (nomeLower.indexOf(".csv") === -1) {
    return "\"" + file.name + "\" não parece ser um arquivo CSV. Verifique se você selecionou o arquivo correto e tente novamente.";
  }
  if (file.size === 0) {
    return "O arquivo \"" + file.name + "\" está vazio. Verifique se você escolheu o arquivo correto.";
  }
  return null;
}

function bhAdicionarArquivos(fileListLike) {
  bhClearError();
  var files = Array.prototype.slice.call(fileListLike);
  if (!files.length) return;

  if (bhSelectedFiles.length + files.length > BH_MAX_FILES) {
    bhShowError("Você pode enviar até " + BH_MAX_FILES + " arquivos por vez. Remova algum arquivo da lista antes de adicionar outro.");
    return;
  }

  for (var i = 0; i < files.length; i++) {
    var file = files[i];
    var erro = bhValidarArquivo(file);
    if (erro) {
      bhShowError(erro);
      continue;
    }
    bhFileIdCounter += 1;
    bhSelectedFiles.push({
      id: "bh-file-" + bhFileIdCounter,
      file: file,
      competencia: bhGuessCompetencia(file.name)
    });
  }

  bhRenderFileList();
}

function bhRemoverArquivo(id) {
  bhSelectedFiles = bhSelectedFiles.filter(function (item) { return item.id !== id; });
  bhRenderFileList();
}

function bhRenderFileList() {
  var els = bhEls();
  if (!els.fileList || !els.fileCardTemplate) return;

  els.fileList.innerHTML = "";

  if (!bhSelectedFiles.length) {
    els.fileList.hidden = true;
    els.addMoreWrap.hidden = true;
    els.uploadActions.hidden = true;
    return;
  }

  els.fileList.hidden = false;
  els.addMoreWrap.hidden = false;
  els.uploadActions.hidden = false;

  bhSelectedFiles.forEach(function (item) {
    var node = els.fileCardTemplate.content.firstElementChild.cloneNode(true);
    node.setAttribute("data-file-id", item.id);
    node.querySelector(".file-card__name").textContent = item.file.name;
    node.querySelector(".file-card__meta").textContent = bhFormatBytes(item.file.size);

    var input = node.querySelector(".file-card__competencia");
    input.value = item.competencia || "";
    input.addEventListener("input", function () {
      item.competencia = input.value;
      input.classList.remove("is-invalid");
      node.querySelector(".file-card__competencia-error").hidden = true;
    });

    node.querySelector(".bh-file-remove-btn").addEventListener("click", function () {
      bhRemoverArquivo(item.id);
    });

    els.fileList.appendChild(node);
  });
}

function bhValidarCompetencias() {
  var todasValidas = true;
  var nodes = document.querySelectorAll("#bh-file-list .file-card");
  nodes.forEach(function (node) {
    var id = node.getAttribute("data-file-id");
    var item = bhSelectedFiles.filter(function (f) { return f.id === id; })[0];
    var input = node.querySelector(".file-card__competencia");
    var errorEl = node.querySelector(".file-card__competencia-error");
    if (!item || !bhCompetenciaValida(item.competencia)) {
      input.classList.add("is-invalid");
      errorEl.hidden = false;
      todasValidas = false;
    } else {
      input.classList.remove("is-invalid");
      errorEl.hidden = true;
    }
  });
  return todasValidas;
}

/* --------------------------------------------------------------------------
   Processamento (Etapa 02) — parse + limpeza + transformação
   -------------------------------------------------------------------------- */
function bhIniciarProcessamento() {
  bhClearError();

  if (!bhSelectedFiles.length) {
    bhShowError("Selecione ao menos um arquivo CSV para continuar.");
    return;
  }
  if (!bhValidarCompetencias()) {
    bhShowError("Preencha a competência (no formato AAAA/MM) de todos os arquivos antes de continuar.");
    return;
  }

  bhSwitchView("processing");

  // Pequeno atraso proposital para que o estado "Processando" seja percebido
  // mesmo em arquivos pequenos, além de dar tempo do navegador liberar a tela.
  setTimeout(bhProcessarTodosArquivos, 500);
}

function bhProcessarTodosArquivos() {
  var pendentes = bhSelectedFiles.length;
  var linhasConvertidas = [];
  var avisos = { testeRemovidas: 0, cpfInvalidoRemovidas: 0, setorNaoIdentificado: 0 };
  var houveErroEstrutura = false;

  bhSelectedFiles.forEach(function (item) {
    Papa.parse(item.file, {
      header: true,
      delimiter: ";",
      skipEmptyLines: true,
      complete: function (results) {
        pendentes -= 1;

        var campos = (results.meta && results.meta.fields) || [];
        var faltando = BH_REQUIRED_COLUMNS.filter(function (col) { return campos.indexOf(col) === -1; });

        if (faltando.length > 0) {
          houveErroEstrutura = true;
        } else {
          results.data.forEach(function (row) {
            var resultado = bhTransformarLinha(row, item.competencia, avisos);
            if (resultado) linhasConvertidas.push(resultado);
          });
        }

        if (pendentes === 0) {
          bhFinalizarProcessamento(linhasConvertidas, avisos, houveErroEstrutura);
        }
      },
      error: function () {
        pendentes -= 1;
        houveErroEstrutura = true;
        if (pendentes === 0) {
          bhFinalizarProcessamento(linhasConvertidas, avisos, houveErroEstrutura);
        }
      }
    });
  });
}

function bhTransformarLinha(row, competencia, avisos) {
  var departamento = (row["Nome do departamento"] || "").trim();
  var departamentoNormalizado = bhFoldAccents(departamento.toUpperCase());
  var matricula = (row["Número de matrícula"] || "").toString().trim();
  var nome = (row["Nome do funcionário"] || "").trim();
  var nomeNormalizado = bhFoldAccents(nome.toUpperCase());
  var cpf = (row["CPF do funcionário"] || "").toString().trim();

  // 2.1 — remove registros de teste do sistema (TESTE INTERPONTO)
  if (departamentoNormalizado === "TESTE" || matricula === "10000" || nomeNormalizado.indexOf("TESTE INTERPONTO") !== -1) {
    avisos.testeRemovidas += 1;
    return null;
  }

  // 2.2 — remove registros sem CPF válido (nulo ou com menos de 4 caracteres)
  if (cpf === "" || cpf.length < 4) {
    avisos.cpfInvalidoRemovidas += 1;
    return null;
  }

  var positivoDec = bhParseHoraParaDecimal(row["Banco Positivo"]);
  var negativoDec = bhParseHoraParaDecimal(row["Banco Negativo"]);
  var saldoAcumulado = bhParseHoraParaDecimal(row["Banco Saldo"]);
  var setor = bhMapearSetor(departamento);

  if (setor === "NONE") avisos.setorNaoIdentificado += 1;

  var linha = {};
  linha["Competência"] = competencia;
  linha["Nome do funcionário"] = nome;
  linha["Número de matrícula"] = matricula;
  linha["CPF do funcionário"] = cpf;
  linha["Nome do departamento"] = departamento;
  linha["Setor"] = setor;
  linha["Banco Positivo Dec"] = positivoDec;
  linha["Banco Negativo Dec"] = negativoDec;
  linha["Saldo Mês"] = positivoDec + negativoDec;
  linha["Saldo Acumulado"] = saldoAcumulado;
  return linha;
}

function bhFinalizarProcessamento(linhas, avisos, houveErroEstrutura) {
  if (houveErroEstrutura) {
    bhSwitchView("upload");
    bhShowError("Não conseguimos identificar a estrutura esperada neste arquivo. Verifique se você selecionou o arquivo correto e tente novamente.");
    return;
  }

  // Ordena por competência crescente (mês mais antigo primeiro) — o formato
  // AAAA/MM permite ordenação direta como texto.
  linhas.sort(function (a, b) {
    return a["Competência"] < b["Competência"] ? -1 : (a["Competência"] > b["Competência"] ? 1 : 0);
  });

  bhConvertedRows = linhas;
  bhUltimosAvisos = avisos;
  bhPrepararDownload(linhas);
  bhRenderPreview(linhas, avisos);
  bhSwitchView("preview");
}

/* --------------------------------------------------------------------------
   Prévia (Etapa 03)
   -------------------------------------------------------------------------- */
function bhRenderPreview(linhas, avisos) {
  var els = bhEls();
  if (els.previewCount) els.previewCount.textContent = linhas.length;

  els.previewAlertSlot.innerHTML = "";
  var totalAvisos = avisos.testeRemovidas + avisos.cpfInvalidoRemovidas + avisos.setorNaoIdentificado;
  if (totalAvisos > 0) {
    var alertEl = document.createElement("div");
    alertEl.className = "alert alert--warning";
    var iconWrap = document.createElement("span");
    iconWrap.innerHTML = '<svg class="icon"><use href="#icon-alert-triangle"></use></svg>';
    var textWrap = document.createElement("div");
    var titleEl = document.createElement("p");
    titleEl.className = "alert__title";
    titleEl.textContent = totalAvisos + " aviso(s) neste processamento";
    textWrap.appendChild(titleEl);
    bhListaDeAvisos(avisos).forEach(function (texto) {
      var p = document.createElement("p");
      p.style.margin = "0";
      p.textContent = texto;
      textWrap.appendChild(p);
    });
    alertEl.appendChild(iconWrap);
    alertEl.appendChild(textWrap);
    els.previewAlertSlot.appendChild(alertEl);
  }

  els.previewHead.innerHTML = "";
  BH_OUTPUT_COLUMNS.forEach(function (col) {
    var th = document.createElement("th");
    th.textContent = col;
    els.previewHead.appendChild(th);
  });

  els.previewBody.innerHTML = "";
  linhas.slice(0, BH_PREVIEW_ROWS).forEach(function (linha) {
    var tr = document.createElement("tr");
    BH_OUTPUT_COLUMNS.forEach(function (col) {
      var td = document.createElement("td");
      var valor = linha[col];
      td.textContent = typeof valor === "number" ? bhFormatarNumero(valor) : valor;
      tr.appendChild(td);
    });
    els.previewBody.appendChild(tr);
  });
}

function bhFormatarNumero(valor) {
  // Mantém casas decimais suficientes para conferência visual, sem cortar
  // o valor exportado no CSV (que usa a precisão completa).
  return Math.round(valor * 100) / 100;
}

function bhListaDeAvisos(avisos) {
  var lista = [];
  if (avisos.testeRemovidas > 0) {
    lista.push(avisos.testeRemovidas + " registro(s) de teste do sistema (TESTE INTERPONTO) foram removidos automaticamente.");
  }
  if (avisos.cpfInvalidoRemovidas > 0) {
    lista.push(avisos.cpfInvalidoRemovidas + " registro(s) sem CPF válido foram removidos.");
  }
  if (avisos.setorNaoIdentificado > 0) {
    lista.push(avisos.setorNaoIdentificado + " registro(s) ficaram com Setor não identificado (revise o campo \"Nome do departamento\").");
  }
  return lista;
}

/* --------------------------------------------------------------------------
   Download (Etapa 04)
   -------------------------------------------------------------------------- */
function bhPrepararDownload(linhas) {
  var csv = Papa.unparse(linhas, {
    columns: BH_OUTPUT_COLUMNS,
    delimiter: ";"
  });
  // BOM (utf-8-sig) para abrir corretamente com acentos no Excel/Power BI
  var conteudo = "﻿" + csv;
  bhConvertedCsvBlob = new Blob([conteudo], { type: "text/csv;charset=utf-8;" });

  // Nome fixo — o Power BI aponta para esse nome permanentemente.
  // O usuário só precisa substituir o arquivo na pasta; sem editar código.
  bhConvertedFileName = "banco_de_horas.csv";
}

function bhBaixarArquivo() {
  if (!bhConvertedCsvBlob) return;
  var url = URL.createObjectURL(bhConvertedCsvBlob);
  var a = document.createElement("a");
  a.href = url;
  a.download = bhConvertedFileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(function () { URL.revokeObjectURL(url); }, 1000);
}

function bhMostrarSucesso(avisos) {
  var els = bhEls();
  els.successFilename.textContent = bhConvertedFileName;
  els.successCount.textContent = bhConvertedRows.length;

  // Instrução de destino — exibe o caminho e o atalho para abrir a pasta
  var instrucaoSlot = document.getElementById("bh-folder-instrucao");
  if (instrucaoSlot) {
    var pastaOneDrive = "C:\\Users\\Regiane\\OneDrive - Todos Empreendimentos\\01 - PROJETOS ATIVOS\\DEPARTAMENTO PESSOAL\\PAINEL GERENCIAL\\BancoDeHorasCSV";
    instrucaoSlot.innerHTML =
      '<div class="bh-folder-card">' +
        '<svg class="icon icon--sm" style="color:var(--color-teal);flex-shrink:0"><use href="#icon-folder"></use></svg>' +
        '<div>' +
          '<p class="bh-folder-card__title">Onde salvar o arquivo</p>' +
          '<p class="bh-folder-card__path">' + pastaOneDrive + '</p>' +
          '<p class="bh-folder-card__hint">⚠️ Substitua o arquivo <strong>banco_de_horas.csv</strong> existente na pasta.</p>' +
        '</div>' +
        '<a href="' + encodeURI("file:///" + pastaOneDrive.replace(/\\/g, "/")) + '" ' +
           'class="btn btn--secondary btn--sm" ' +
           'title="Abrir pasta no Explorer">' +
          '<svg class="icon icon--sm"><use href="#icon-folder"></use></svg>' +
          'Abrir pasta' +
        '</a>' +
      '</div>';
  }
  var totalAvisos = avisos ? (avisos.testeRemovidas + avisos.cpfInvalidoRemovidas + avisos.setorNaoIdentificado) : 0;
  els.successWarnings.textContent = totalAvisos;
  els.successWarningList.innerHTML = "";
  if (avisos) {
    bhListaDeAvisos(avisos).forEach(function (texto) {
      var p = document.createElement("p");
      p.className = "text-secondary";
      p.style.fontSize = "var(--fs-xs)";
      p.textContent = "• " + texto;
      els.successWarningList.appendChild(p);
    });
  }
}

/* --------------------------------------------------------------------------
   Reset / navegação entre etapas
   -------------------------------------------------------------------------- */
function pcResetBancoHoras() {
  bhSelectedFiles = [];
  bhConvertedRows = [];
  bhConvertedCsvBlob = null;
  bhConvertedFileName = "";
  bhUltimosAvisos = null;
  bhClearError();
  bhRenderFileList();
  var els = bhEls();
  if (els.fileInput) els.fileInput.value = "";
  bhSwitchView("upload");
}

/* --------------------------------------------------------------------------
   Inicialização
   -------------------------------------------------------------------------- */
function pcInitBancoHoras() {
  var els = bhEls();
  if (!els.dropzone) return; // view ainda não existe nesta página

  els.dropzone.addEventListener("click", function () { els.fileInput.click(); });
  els.dropzone.addEventListener("keydown", function (e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      els.fileInput.click();
    }
  });
  els.dropzone.addEventListener("dragover", function (e) {
    e.preventDefault();
    els.dropzone.classList.add("is-dragover");
  });
  els.dropzone.addEventListener("dragleave", function () {
    els.dropzone.classList.remove("is-dragover");
  });
  els.dropzone.addEventListener("drop", function (e) {
    e.preventDefault();
    els.dropzone.classList.remove("is-dragover");
    bhAdicionarArquivos(e.dataTransfer.files);
  });

  els.fileInput.addEventListener("change", function () {
    bhAdicionarArquivos(els.fileInput.files);
    els.fileInput.value = "";
  });

  els.addMoreBtn.addEventListener("click", function () { els.fileInput.click(); });

  els.continueBtn.addEventListener("click", bhIniciarProcessamento);

  els.previewBack.addEventListener("click", function () { bhSwitchView("upload"); });
  els.previewContinue.addEventListener("click", function () {
    bhSwitchView("success");
    // avisos já computados durante o processamento; recuperamos a contagem
    // a partir dos textos já renderizados na prévia para manter uma única
    // fonte de verdade simples, sem estado global adicional.
    var avisos = bhUltimosAvisos || { testeRemovidas: 0, cpfInvalidoRemovidas: 0, setorNaoIdentificado: 0 };
    bhMostrarSucesso(avisos);
  });

  els.downloadBtn.addEventListener("click", bhBaixarArquivo);
  els.successRestart.addEventListener("click", pcResetBancoHoras);

  bhSwitchView("upload");
}
