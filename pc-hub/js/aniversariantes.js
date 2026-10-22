/* ==========================================================================
   P&C HUB — Aniversariantes do mês (Home)

   Fluxo: data/aniversariantes.json -> este arquivo -> componente visual.
   Para atualizar os aniversariantes no futuro, basta editar o JSON — nada
   aqui precisa mudar. Não depende do ano: cada pessoa tem só dia/mês.
   ========================================================================== */

var AN_MESES = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro"
];

var AN_DATA_URL = "data/aniversariantes.json";

function anPad2(n) {
  return n < 10 ? "0" + n : String(n);
}

/* Converte "DD/MM" em { dia, mes } (mes 1-12). Retorna null se o formato
   não for reconhecido, para não quebrar a página com um dado mal formatado. */
function anParseData(str) {
  if (typeof str !== "string") return null;
  var partes = str.split("/");
  if (partes.length !== 2) return null;
  var dia = parseInt(partes[0], 10);
  var mes = parseInt(partes[1], 10);
  if (!dia || !mes || mes < 1 || mes > 12 || dia < 1 || dia > 31) return null;
  return { dia: dia, mes: mes };
}

function anCarregarDados() {
  return fetch(AN_DATA_URL).then(function (resp) {
    if (!resp.ok) throw new Error("Não foi possível carregar " + AN_DATA_URL);
    return resp.json();
  });
}

/* Quantos dias faltam (a partir de hoje, sem considerar o ano do registro)
   até o próximo dia/mês informado — cicla para o ano seguinte quando a data
   já passou neste ano. */
function anDiasAte(hojeSemHora, dia, mes) {
  var ano = hojeSemHora.getFullYear();
  var alvo = new Date(ano, mes - 1, dia);
  if (alvo < hojeSemHora) {
    alvo = new Date(ano + 1, mes - 1, dia);
  }
  return Math.round((alvo - hojeSemHora) / 86400000);
}

function anRenderizar(pessoas) {
  var hoje = new Date();
  var hojeSemHora = new Date(hoje.getFullYear(), hoje.getMonth(), hoje.getDate());
  var mesAtual = hoje.getMonth() + 1;

  var validos = [];
  for (var i = 0; i < pessoas.length; i++) {
    var d = anParseData(pessoas[i] && pessoas[i].aniversario);
    if (d) {
      validos.push({ nome: pessoas[i].nome, dia: d.dia, mes: d.mes });
    }
  }

  var tituloEl = document.getElementById("aniversariantes-titulo");
  var listaEl = document.getElementById("aniversariantes-lista");
  var vazioEl = document.getElementById("aniversariantes-vazio");
  var proximoEl = document.getElementById("aniversariante-proximo");

  if (tituloEl) {
    tituloEl.textContent = "Aniversariantes de " + AN_MESES[mesAtual - 1];
  }

  var doMes = validos
    .filter(function (p) { return p.mes === mesAtual; })
    .sort(function (a, b) { return a.dia - b.dia; });

  if (listaEl) {
    listaEl.innerHTML = "";
    doMes.forEach(function (p) {
      var item = document.createElement("li");
      item.className = "birthday-item";

      var avatar = document.createElement("span");
      avatar.className = "birthday-item__avatar";
      avatar.setAttribute("aria-hidden", "true");
      avatar.textContent = p.nome.trim().charAt(0).toUpperCase();

      var nome = document.createElement("span");
      nome.className = "birthday-item__name";
      nome.textContent = p.nome;

      var data = document.createElement("span");
      data.className = "birthday-item__date";
      data.textContent = anPad2(p.dia) + " de " + AN_MESES[p.mes - 1];

      item.appendChild(avatar);
      item.appendChild(nome);
      item.appendChild(data);
      listaEl.appendChild(item);
    });
  }

  if (vazioEl) vazioEl.hidden = doMes.length > 0;

  if (proximoEl) {
    if (validos.length === 0) {
      proximoEl.hidden = true;
    } else {
      var comDiferenca = validos.map(function (p) {
        return {
          nome: p.nome,
          dia: p.dia,
          mes: p.mes,
          diferenca: anDiasAte(hojeSemHora, p.dia, p.mes)
        };
      });
      comDiferenca.sort(function (a, b) { return a.diferenca - b.diferenca; });
      var proximo = comDiferenca[0];

      var quando;
      if (proximo.diferenca === 0) quando = "é hoje";
      else if (proximo.diferenca === 1) quando = "é amanhã";
      else quando = "em " + proximo.diferenca + " dias";

      proximoEl.innerHTML =
        '<span class="next-birthday__label">Próximo aniversário</span>' +
        '<span class="next-birthday__name">' + proximo.nome + "</span>" +
        '<span class="next-birthday__meta">' +
          anPad2(proximo.dia) + " de " + AN_MESES[proximo.mes - 1] + " · " + quando +
        "</span>";
      proximoEl.hidden = false;
    }
  }
}

function anMostrarErro() {
  var listaEl = document.getElementById("aniversariantes-lista");
  var vazioEl = document.getElementById("aniversariantes-vazio");
  var proximoEl = document.getElementById("aniversariante-proximo");
  if (listaEl) listaEl.innerHTML = "";
  if (proximoEl) proximoEl.hidden = true;
  if (vazioEl) {
    vazioEl.hidden = false;
    vazioEl.textContent = "Não foi possível carregar os aniversariantes no momento.";
  }
}

function pcInitAniversariantes() {
  var secao = document.getElementById("aniversariantes-secao");
  if (!secao) return;

  anCarregarDados()
    .then(anRenderizar)
    .catch(anMostrarErro);
}
