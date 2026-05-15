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
    historico: []
  };

  usuarios.push(novoUsuario);
  setUsuarios(usuarios);

  alert("Cadastro realizado!");
  window.location.href = "login.html";
}

function Login() {
  const emailEl = document.getElementById("login-email");
  const senhaEl = document.getElementById("login-senha");

  if (!emailEl || !senhaEl) return;

  const email = emailEl.value;
  const senha = senhaEl.value;

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
    avatar.textContent = usuarioLogado.email[0].toUpperCase();
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

// ===============================
// 🔹 INICIALIZAÇÃO
// ===============================

document.addEventListener("DOMContentLoaded", () => {
  initDashboard();
  carregarDadosUsuario();
});

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

  salvarHistorico(user, modalAtivo, modalTipo, qtd, modalPreco, total);
  atualizarUsuario(user);

  atualizarSaldoUI();
  atualizarImpactoUI();
  renderHistorico();

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
    qtd,
    preco,
    total
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
    impacto += op.total * 0.001; // exemplo simples
  });

  console.log("Impacto ambiental:", impacto);
}