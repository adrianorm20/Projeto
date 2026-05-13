function Cadastro() {
    let usuario = document.getElementById("usuario").value;
    let senha = document.getElementById("senha").value;

    localStorage.setItem("usuario", usuario);
    localStorage.setItem("senha", senha);

    if (usuario === usuario && senha === senha) {
        window.location.href = "login.html";
    } else {
        alert("Cadastro inválido");
    }


}

function Login() {
    let usuario = document.getElementById("usuario").value;
    let senha = document.getElementById("senha").value;

    let user = localStorage.getItem("usuario");
    let pass = localStorage.getItem("senha");

    if (usuario === user && senha === pass) {
        window.location.href = "login.html";
    } else {
        alert("Login inválido");
    }
}

let _modalPrice=0, _modalSymbol='', _modalType='';

function showPage(id, btn){
  document.querySelectorAll('.page').forEach(p=>p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('page-'+id).classList.add('active');
  btn.classList.add('active');
  const titles={dashboard:['Dashboard','Visão geral da carteira'],alertas:['Alertas de Ações','Monitoramento em tempo real'],negociacoes:['Minhas negociações','Histórico completo'],pagamento:['Pagamento','Executar nova operação'],meusdados:['Meus Dados','Perfil e configurações']};
  document.getElementById('page-title').textContent=titles[id][0];
  document.getElementById('page-sub').textContent=titles[id][1];
}

function fmtCard(el){let v=el.value.replace(/\D/g,'').substring(0,16);el.value=v.replace(/(.{4})/g,'$1 ').trim()}
function fmtDate(el){let v=el.value.replace(/\D/g,'');if(v.length>=2)v=v.substring(0,2)+'/'+v.substring(2,4);el.value=v}

function updateOrder(){
  const sel=document.getElementById('pay-ativo').value.split('|');
  const sym=sel[0],cur=sel[1],price=parseFloat(sel[2]);
  const qtd=parseInt(document.getElementById('pay-qtd').value)||1;
  const tipo=document.getElementById('pay-tipo').value;
  const total=price*qtd;
  document.getElementById('ord-ativo').textContent=sym;
  document.getElementById('ord-tipo').textContent=tipo;
  document.getElementById('ord-qtd').textContent=qtd;
  document.getElementById('ord-preco').textContent=cur+' '+price.toFixed(2).replace('.',',');
  document.getElementById('ord-cash').textContent=cur+' '+(total*0.005).toFixed(2).replace('.',',');
  document.getElementById('ord-total').textContent=cur+' '+(total+2.5).toFixed(2).replace('.',',');
  document.getElementById('receipt').classList.remove('show');
}

function processPay(){
  const nome=document.getElementById('pay-nome').value;
  const card=document.getElementById('pay-card').value;
  if(!nome||card.length<19){alert('Preencha os dados do cartão corretamente.');return;}
  const ativo=document.getElementById('ord-ativo').textContent;
  const tipo=document.getElementById('ord-tipo').textContent;
  const qtd=document.getElementById('ord-qtd').textContent;
  const total=document.getElementById('ord-total').textContent;
  const receipt=document.getElementById('receipt');
  document.getElementById('receipt-msg').textContent=tipo+' de '+qtd+' '+ativo+' executada com sucesso. Total: '+total;
  document.getElementById('receipt-id').textContent='Protocolo: CI-'+Date.now();
  receipt.classList.add('show');
  receipt.style.display='block';
}

function alertCreated(){
  document.getElementById('alert-confirm').style.display='block';
  setTimeout(()=>document.getElementById('alert-confirm').style.display='none',3000);
}

function openBuy(sym,price){
  _modalSymbol=sym;_modalPrice=parseFloat(price.replace(/[^\d.]/g,''));_modalType='Comprar';
  document.getElementById('modal-title').textContent='Comprar '+sym;
  document.getElementById('modal-price').textContent=price;
  document.getElementById('modal-qtd').value=10;
  updateModal();
  const ov=document.getElementById('modal-overlay');ov.style.display='flex';
}
function openSell(sym,price){
  _modalSymbol=sym;_modalPrice=parseFloat(price.replace(/[^\d.]/g,''));_modalType='Vender';
  document.getElementById('modal-title').textContent='Vender '+sym;
  document.getElementById('modal-price').textContent=price;
  document.getElementById('modal-qtd').value=10;
  updateModal();
  document.getElementById('modal-overlay').style.display='flex';
}
function updateModal(){
  const qtd=parseInt(document.getElementById('modal-qtd').value)||1;
  document.getElementById('modal-total').textContent='≈ R$ '+(qtd*_modalPrice).toFixed(2).replace('.',',');
}
function closeModal(){document.getElementById('modal-overlay').style.display='none'}
function confirmModal(){
  closeModal();
  alert('✅ '+_modalType+' de '+document.getElementById('modal-qtd').value+' '+_modalSymbol+' executada com sucesso!');
}

// Simula variações de mercado no dashboard
setInterval(()=>{
  const cells=document.querySelectorAll('#page-dashboard td.up, #page-dashboard td.down');
  cells.forEach(c=>{
    const isUp=Math.random()>0.4;
    const val=(Math.random()*3).toFixed(2);
    c.className=isUp?'up':'down';
    c.textContent=(isUp?'+':'-')+val+'%';
  });
},4000);

updateOrder();