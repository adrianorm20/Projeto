function Cadastro() {
    let usuario = document.getElementById("usuario").value;
    let senha = document.getElementById("senha").value;

    localStorage.setItem("usuario", usuario);
    localStorage.setItem("senha", senha);

    if (usuario === usuario && senha === senha) {
        window.location.href = "index.html";
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
        window.location.href = "index.html";
    } else {
        alert("Login inválido");
    }
}