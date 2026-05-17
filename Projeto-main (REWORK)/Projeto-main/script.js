// ===============================
// 🔹 STORAGE HELPERS
// ===============================

function carregarDadosUsuario() {
  const user = getUsuarioLogado();
  if (!user) return;

  const nomeEl = document.getElementById("user-nome");
  const emailEl = document.getElementById("user-email");
  const saldoEl = document.getElementById("user-saldo");

  if (nomeEl) nomeEl.textContent = user.nome || "Não informado";
  if (emailEl) emailEl.textContent = user.email;
  if (saldoEl) saldoEl.textContent = "R$ " + (user.saldo || 0).toFixed(2);

  const avatar = document.querySelector(".avatar");
  if (avatar) {
    avatar.textContent = user.nome
      ? user.nome[0].toUpperCase()
      : user.email[0].toUpperCase();
  }
}

function getUsuarios() {
  return JSON.parse(localStorage.getItem("usuarios")) || [];
}

function setUsuarios(lista) {
  localStorage.setItem("usuarios", JSON.stringify(lista));
}

function getUsuarioLogado() {
  return JSON.parse(localStorage.getItem("usuarioLogado"));
}

function setUsuarioLogado(user) {
  localStorage.setItem("usuarioLogado", JSON.stringify(user));
}

function logout() {
  localStorage.removeItem("usuarioLogado");
  window.location.href = "login.html";
}

const mapaAtivos = {
  PETR4: {
    pais: "Brasil",
    flag: "https://flagcdn.com/w40/br.png"
  },
  VALE3: {
    pais: "Brasil",
    flag: "https://flagcdn.com/w40/br.png"
  },
  AAPL: {
    pais: "EUA",
    flag: "https://flagcdn.com/w40/us.png"
  },
  INFY: {
    pais: "Índia",
    flag: "https://flagcdn.com/w40/in.png"
  },
  SAP: {
    pais: "Alemanha",
    flag: "https://flagcdn.com/w40/de.png"
  }
};

// ===============================
// 🔹 CONTROLE DE PÁGINA
// ===============================

const isLoginPage = window.location.pathname.includes("login.html");
const isIndexPage = window.location.pathname.includes("index.html");

let usuarioLogado = getUsuarioLogado();

if (isIndexPage && !usuarioLogado) {
  window.location.href = "login.html";
}

// ===============================
// 🔹 AUTH (LOGIN / CADASTRO)
// ===============================

function Cadastro() {
  const nome = document.getElementById("nome").value;
  const email = document.getElementById("signup-email").value;
  const senha = document.getElementById("signup-senha").value;
  const confirmar = document.getElementById("confirmar-senha").value;

  if (!nome || !email || !senha || !confirmar) {
    alert("Preencha todos os campos");
    return;
  }

  if (senha !== confirmar) {
    alert("As senhas não coincidem");
    return;
  }

  let usuarios = getUsuarios();

  if (usuarios.find(u => u.email === email)) {
    alert("Usuário já existe");
    return;
  }

  const novoUsuario = {
    nome,
    email,
    senha,
    saldo: 1000,
    historico: [],
    carteira: {}
  };

  usuarios.push(novoUsuario);
  setUsuarios(usuarios);

  alert("Cadastro realizado!");
  window.location.href = "login.html";
}

function Login() {
  const email = document.getElementById("login-email").value;
  const senha = document.getElementById("login-senha").value;

  if (!email || !senha) {
    alert("Preencha todos os campos");
    return;
  }

  let usuarios = getUsuarios();

  const user = usuarios.find(u => u.email === email && u.senha === senha);

  if (!user) {
    alert("Login inválido");
    return;
  }

  setUsuarioLogado(user);
  window.location.href = "index.html";
}

// ===============================
// 🔹 DASHBOARD INIT
// ===============================

function initDashboard() {
  if (!isIndexPage) return;

  const avatar = document.querySelector(".avatar");

  if (avatar && usuarioLogado) {
    avatar.textContent = usuarioLogado.nome
      ? usuarioLogado.nome[0].toUpperCase()
      : usuarioLogado.email[0].toUpperCase();
  }

  updateOrderSafe();
}



// ===============================
// 🔹 UPDATE ORDER (SAFE)
// ===============================

function updateOrderSafe() {
  const ativoEl = document.getElementById("pay-ativo");
  const qtdEl = document.getElementById("pay-qtd");

  if (!ativoEl || !qtdEl) return;

  const sel = ativoEl.value.split('|');
  const sym = sel[0];
  const cur = sel[1];
  const price = parseFloat(sel[2]);

  const qtd = parseInt(qtdEl.value) || 1;
  const tipo = document.getElementById('pay-tipo')?.value || "Compra";

  const total = price * qtd;

  document.getElementById('ord-ativo').textContent = sym;
  document.getElementById('ord-tipo').textContent = tipo;
  document.getElementById('ord-qtd').textContent = qtd;
  document.getElementById('ord-preco').textContent = cur + ' ' + price.toFixed(2);

  document.getElementById('ord-cash').textContent =
    cur + ' ' + (total * 0.005).toFixed(2);

  document.getElementById('ord-total').textContent =
    cur + ' ' + (total + 2.5).toFixed(2);
}

const mercado = {
  PETR4: { preco: 38.42, anterior: 38.42 },
  AAPL: { preco: 189.30, anterior: 189.30 },
  INFY: { preco: 1420, anterior: 1420 },
  SAP: { preco: 172.50, anterior: 172.50 }
};

// ===============================
// 🔹 ATUALIZAR USUÁRIO
// ===============================

function atualizarUsuario(dadosAtualizados) {
  let usuarios = getUsuarios();

  usuarios = usuarios.map(u =>
    u.email === dadosAtualizados.email ? dadosAtualizados : u
  );

  setUsuarios(usuarios);
  setUsuarioLogado(dadosAtualizados);
}

function calcularCashback(user) {
  if (!user.historico) return 0;

  let total = 0;

  user.historico.forEach(op => {
    total += op.total * 0.005; // 0.5%
  });

  return total;
}

function atualizarCashbackUI() {
  const user = getUsuarioLogado();
  if (!user) return;

  const el = document.getElementById("cashback-total");
  if (!el) return;

  const cashback = calcularCashback(user);

  el.textContent = "R$ " + cashback.toFixed(2);
}

function calcularDashboard(user) {
  if (!user || !user.historico) {
    return {
      patrimonio: user?.saldo || 0,
      lucro: 0,
      posicoes: 0
    };
  }

  let totalOperado = 0;
  let posicoes = 0;

  user.historico.forEach(op => {
    totalOperado += op.total;

    if (op.tipo === "Compra") posicoes++;
  });

  return {
    patrimonio: user.saldo,
    lucro: totalOperado * 0.02, // simulação simples (2%)
    posicoes
  };
}


function gerarVariacao() {
  return (Math.random() * 4 - 2); // entre -2% e +2%
}

function atualizarVariacoesTabela() {
  const linhas = document.querySelectorAll("table tbody tr");

  linhas.forEach(linha => {
    const variacaoEl = linha.children[2]; // coluna de variação

    const variacao = gerarVariacao();

    variacaoEl.textContent =
      (variacao > 0 ? "+" : "") + variacao.toFixed(2) + "%";

    variacaoEl.classList.remove("up", "down");

    if (variacao > 0) {
      variacaoEl.classList.add("up");
    } else {
      variacaoEl.classList.add("down");
    }
  });
}

function atualizarMercado() {
  Object.keys(mercado).forEach(ativo => {
    const variacao = (Math.random() * 2 - 1); // -1% a +1%

    mercado[ativo].anterior = mercado[ativo].preco;
    mercado[ativo].preco *= (1 + variacao / 100);
  });
}

function calcularVariacao(ativo) {
  const atual = mercado[ativo].preco;
  const anterior = mercado[ativo].anterior;

  return ((atual - anterior) / anterior) * 100;
}

function atualizarTabelaMercado() {
  const linhas = document.querySelectorAll("#page-dashboard table tbody tr");

  linhas.forEach(linha => {
    const ativo = linha.children[1].innerText.trim();

    if (!mercado[ativo]) return;

    const paisEl = linha.children[0];
    const variacaoEl = linha.children[2];
    const precoEl = linha.children[3];

    const preco = mercado[ativo].preco;
    const variacao = calcularVariacao(ativo);


    precoEl.textContent = "R$ " + preco.toFixed(2);


    variacaoEl.textContent =
      (variacao > 0 ? "+" : "") + variacao.toFixed(2) + "%";

    variacaoEl.classList.remove("up", "down");
    variacaoEl.classList.add(variacao >= 0 ? "up" : "down");


    const info = mapaAtivos[ativo];

    if (info && paisEl) {
      paisEl.innerHTML = `
        <img src="${info.flag}" class="flag-img">
        ${info.pais}
      `;
    }
  });
}

function calcularPatrimonio(user) {
  let total = user.saldo;

  if (!user.carteira) return total;

  Object.keys(user.carteira).forEach(ativo => {
    const qtd = user.carteira[ativo];
    const preco = mercado[ativo]?.preco || 0;

    total += qtd * preco;
  });

  return total;
}

function atualizarDashboardUI() {
  const user = getUsuarioLogado();
  if (!user) return;

  const patrimonioEl = document.getElementById("patrimonio-total");

  const patrimonio = calcularPatrimonio(user);

  if (patrimonioEl)
    patrimonioEl.textContent = "R$ " + patrimonio.toFixed(2);
}

function calcularStats(user) {
  if (!user?.historico) {
    return {
      totalOperado: 0,
      compras: 0,
      vendas: 0,
      resultado: 0,
      lucroMes: 0
    };
  }

  let totalOperado = 0;
  let compras = 0;
  let vendas = 0;

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

  let lucroMes = 0;

  user.historico.forEach(op => {
    totalOperado += op.total;

    if (op.tipo === "Compra") compras += op.total;
    if (op.tipo === "Venda") vendas += op.total;

    const data = new Date(op.data.split("/").reverse().join("-"));

    if (data.getMonth() === mesAtual && data.getFullYear() === anoAtual) {
      lucroMes += op.tipo === "Venda" ? op.total : -op.total;
    }
  });

  return {
    totalOperado,
    compras,
    vendas,
    resultado: vendas - compras,
    lucroMes
  };
}

function atualizarNegociacoesUI() {
  const user = getUsuarioLogado();
  if (!user) return;

  const stats = calcularStats(user);

  const page = document.querySelector("#page-negociacoes");
  if (!page) return;

  const cards = page.querySelectorAll(".grid-4 .card-value");

  if (cards.length >= 4) {
    cards[0].textContent = "R$ " + stats.totalOperado.toFixed(2);
    cards[1].textContent = "R$ " + stats.compras.toFixed(2);
    cards[2].textContent = "R$ " + stats.vendas.toFixed(2);

    const res = cards[3];
    res.textContent = (stats.resultado >= 0 ? "+R$ " : "-R$ ") +
      Math.abs(stats.resultado).toFixed(2);

    res.style.color = stats.resultado >= 0 ? "var(--green)" : "var(--red)";
  }
}

function atualizarLucroMes() {
  const user = getUsuarioLogado();
  if (!user) return;

  const stats = calcularStats(user);

  const el = document.getElementById("lucro-mes");
  if (!el) return;

  el.textContent =
    (stats.lucroMes >= 0 ? "+R$ " : "-R$ ") +
    Math.abs(stats.lucroMes).toFixed(2);

  el.style.color = stats.lucroMes >= 0 ? "var(--green)" : "var(--red)";
}

function gerarAlertaRealtime() {
  const ativos = Object.keys(mercado);
  const ativo = ativos[Math.floor(Math.random() * ativos.length)];

  const variacao = (Math.random() * 2 - 1).toFixed(2);

  const list = document.querySelector(".alert-list");
  if (!list) return;

  const div = document.createElement("div");
  div.className = "alert-item";

  div.innerHTML = `
    <div class="alert-icon alert-neutral">⚡</div>
    <div class="dot ${variacao >= 0 ? 'dot-green' : 'dot-red'}"></div>
    <div class="alert-info">
      <div class="alert-title">${ativo} — variação de ${variacao}%</div>
      <div class="alert-desc">Atualização automática do mercado em tempo real</div>
    </div>
    <div class="alert-time">${new Date().toLocaleTimeString()}</div>
  `;

  list.prepend(div);

  if (list.children.length > 8) {
    list.removeChild(list.lastChild);
  }
}
// ===============================
// 🔹 INICIALIZAÇÃO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  carregarDadosUsuario();
  atualizarImpactoUI();
  atualizarCashbackUI();
  atualizarDashboardUI();
  atualizarVariacoesTabela();
  atualizarTabelaMercado();
  atualizarNegociacoesUI();
  atualizarLucroMes();

  setInterval(() => {
    atualizarMercado();
    atualizarTabelaMercado();
    atualizarDashboardUI();
    atualizarNegociacoesUI();
    atualizarLucroMes();
  }, 3000);
}, 3000);
setInterval(atualizarVariacoesTabela, 5000);


// ===============================
// 🔹 NAVEGAÇÃO ENTRE PÁGINAS
// ===============================

function showPage(page, btn) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.getElementById('page-' + page).classList.add('active');

  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const titles = {
    dashboard: ["Dashboard", "Visão geral da carteira"],
    alertas: ["Alertas", "Monitoramento em tempo real"],
    negociacoes: ["Negociações", "Histórico de operações"],
    pagamento: ["Pagamento", "Executar ordem"],
    meusdados: ["Meus Dados", "Informações da conta"]
  };

  document.getElementById("page-title").textContent = titles[page][0];
  document.getElementById("page-sub").textContent = titles[page][1];
}

// ===============================
// 🔹 ALERTA
// ===============================

function alertCreated() {
  const el = document.getElementById("alert-confirm");
  if (!el) return;

  el.style.display = "block";
  setTimeout(() => el.style.display = "none", 2000);
}

// ===============================
// 🔹 FORMATADORES
// ===============================

function fmtCard(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 16);
  el.value = v.replace(/(\d{4})(?=\d)/g, '$1 ');
}

function fmtDate(el) {
  let v = el.value.replace(/\D/g, '').slice(0, 4);
  if (v.length >= 3) {
    el.value = v.slice(0, 2) + '/' + v.slice(2);
  } else {
    el.value = v;
  }
}

// ===============================
// 🔹 MODAL (COMPRA / VENDA)
// ===============================

let modalAtivo = null;
let modalPreco = 0;
let modalTipo = "Compra";

function openBuy(ativo, preco) {
  openModal("Compra", ativo, preco);
}

function openSell(ativo, preco) {
  openModal("Venda", ativo, preco);
}

function openModal(tipo, ativo, preco) {
  modalTipo = tipo;
  modalAtivo = ativo;
  modalPreco = parseFloat(preco.replace(/[^\d.]/g, ''));

  document.getElementById("modal-title").textContent = `${tipo} ${ativo}`;
  document.getElementById("modal-overlay").style.display = "flex";

  updateModal();
}

function closeModal() {
  document.getElementById("modal-overlay").style.display = "none";
}

function updateModal() {
  const qtd = parseInt(document.getElementById("modal-qtd").value) || 1;
  const total = qtd * modalPreco;

  document.getElementById("modal-price").textContent = modalPreco.toFixed(2);
  document.getElementById("modal-total").textContent = "R$ " + total.toFixed(2);
}

const ativo = (modalAtivo || "").toString().trim().toUpperCase();
function confirmModal() {
  let user = getUsuarioLogado();
  const qtd = parseInt(document.getElementById("modal-qtd").value) || 1;
  const total = qtd * modalPreco;

  if (modalTipo === "Compra") {
    if (user.saldo < total) {
      alert("Saldo insuficiente");
      return;
    }
    user.saldo -= total;
  } else {
    user.saldo += total;
  }

  if (!user.carteira) user.carteira = {};

  const ativo = modalAtivo.trim().toUpperCase();
  const atual = Number(user.carteira[ativo]) || 0;



  salvarHistorico(user, ativo, modalTipo, qtd, modalPreco, total);
  atualizarUsuario(user);

  atualizarSaldoUI();
  atualizarImpactoUI();
  atualizarCashbackUI();
  renderHistorico();
  atualizarDashboardUI();


  closeModal();
  alert(`${modalTipo} realizada com sucesso!`);
}
carregarDadosUsuario();

function salvarHistorico(user, ativo, tipo, qtd, preco, total) {
  if (!user.historico) user.historico = [];

  const operacao = {
    data: new Date().toLocaleDateString(),
    ativo,
    tipo,
    qtd: Number(qtd),
    preco: Number(preco),
    total: Number(total)
  };

  user.historico.unshift(operacao);
}

function updateOrder() {
  updateOrderSafe();
}

function processPay() {
  const user = getUsuarioLogado();
  if (!user) return;

  const ativoEl = document.getElementById("pay-ativo").value.split('|');
  const ativo = ativoEl[0];
  const moeda = ativoEl[1];
  const preco = parseFloat(ativoEl[2]);

  const qtd = parseInt(document.getElementById("pay-qtd").value) || 1;
  const tipo = document.getElementById("pay-tipo").value;

  const total = preco * qtd + 2.5;

  if (tipo === "Compra" && user.saldo < total) {
    alert("Saldo insuficiente");
    return;
  }

  if (tipo === "Compra") {
    user.saldo -= total;
  } else {
    user.saldo += total;
  }

  salvarHistorico(user, ativo, tipo, qtd, preco, total);
  atualizarUsuario(user);

  atualizarSaldoUI();
  renderHistorico();

  document.getElementById("receipt").style.display = "block";
  document.getElementById("receipt-msg").textContent =
    `${tipo} de ${qtd} ${ativo} executada com sucesso.`;

  document.getElementById("receipt-id").textContent =
    "ID: " + Math.random().toString(36).substr(2, 9).toUpperCase();
}

function atualizarSaldoUI() {
  const user = getUsuarioLogado();
  const saldoEl = document.getElementById("user-saldo");

  if (saldoEl && user) {
    saldoEl.textContent = "R$ " + user.saldo.toFixed(2);
  }
}

function renderHistorico() {
  const user = getUsuarioLogado();
  const tbody = document.getElementById("neg-tbody");

  if (!tbody || !user || !user.historico) return;

  tbody.innerHTML = "";

  user.historico.forEach(op => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${op.data}</td>
      <td>${op.ativo}</td>
      <td><span class="tag ${op.tipo === 'Compra' ? 'tag-green' : 'tag-red'}">${op.tipo}</span></td>
      <td>${op.qtd}</td>
      <td>R$ ${op.preco.toFixed(2)}</td>
      <td>R$ ${op.total.toFixed(2)}</td>
      <td>-</td>
    `;

    tbody.appendChild(tr);
  });
}

function atualizarImpactoUI() {
  const user = getUsuarioLogado();
  if (!user || !user.historico) return;

  let impacto = 0;

  user.historico.forEach(op => {
    impacto += op.total * 0.001;
  });

  const el = document.getElementById("impacto-total");
  if (el) {
    el.textContent = impacto.toFixed(2) + " kg CO₂";
  }
}

