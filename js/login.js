const DB_URL = "https://htlyccadeagvimfphadt.supabase.co";
const DB_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0bHljY2FkZWFndmltZnBoYWR0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODAwNzM4ODQsImV4cCI6MjA5NTY0OTg4NH0.DyvzRvWBkKCzPwz8H45_SOlyGK1nAIWu6t31VVnDU7E";

// 1. AO CARREGAR A PÁGINA: Verifica o sistema de "Lembrar-me"
document.addEventListener("DOMContentLoaded", () => {
    const emailSalvo = localStorage.getItem("lembrarEmail");
    const senhaSalva = localStorage.getItem("lembrarSenha");
   
    const inputEmail = document.getElementById("loginEmail");
    const inputSenha = document.getElementById("loginSenha");
    const checkLembrar = document.getElementById("lembrarMe");

    if (emailSalvo && senhaSalva) {
        if (inputEmail) inputEmail.value = emailSalvo;
        if (inputSenha) inputSenha.value = senhaSalva;
        if (checkLembrar) checkLembrar.checked = true;
    }
});

// 2. EVENTO DE LOGIN
const formLogin = document.getElementById("formularioLogin");
if (formLogin) {
    // 💡 A PALAVRA `async` AQUI É ESSENCIAL PARA O `await` FUNCIONAR
    formLogin.addEventListener("submit", async (evento) => {
        evento.preventDefault();

        const emailInput = document.getElementById("loginEmail");
        const senhaInput = document.getElementById("loginSenha");
        const lembrarMeInput = document.getElementById("lembrarMe");

        if (!emailInput || !senhaInput) {
            alert("Erro: Elementos do formulário não foram encontrados no HTML.");
            return;
        }

        const email = emailInput.value.trim().toLowerCase();
        const senha = senhaInput.value;
        const lembrarMe = lembrarMeInput ? lembrarMeInput.checked : false;

        try {
            // 1. Busca no banco APENAS pelo e-mail do usuário
            const resposta = await fetch(`${DB_URL}/rest/v1/usuarios?email=ilike.${email}`, {
                method: "GET",
                headers: {
                    "apikey": DB_KEY,
                    "Authorization": `Bearer ${DB_KEY}`,
                    "Content-Type": "application/json"
                }
            });

            if (!resposta.ok) {
                throw new Error("Falha na resposta do servidor Supabase.");
            }

            const usuariosEncontrados = await resposta.json();

            if (usuariosEncontrados && usuariosEncontrados.length > 0) {
                const usuarioLogado = usuariosEncontrados[0];

                // 🔑 2. COMPARA A SENHA DIGITADA COM O HASH BCRYPT DO BANCO
                const senhaValida = dcodeIO.bcrypt.compareSync(senha, usuarioLogado.senha);

                if (senhaValida) {
                    localStorage.setItem("usuarioLogado", JSON.stringify(usuarioLogado));

                    if (lembrarMe) {
                        localStorage.setItem("lembrarEmail", email);
                        localStorage.setItem("lembrarSenha", senha);
                    } else {
                        localStorage.removeItem("lembrarEmail");
                        localStorage.removeItem("lembrarSenha");
                    }

                    alert(`Olá, ${usuarioLogado.nome}! Login realizado com sucesso.`);
                    window.location.href = "cliente.html"; 
                } else {
                    alert("E-mail ou senha incorretos.");
                }
            } else {
                alert("E-mail ou senha incorretos.");
            }
        } catch (erro) {
            console.error("Erro completo no login:", erro);
            alert("Erro de comunicação com o servidor.");
        }
    });
}

// 3. FUNÇÃO DO OLHINHO DE MOSTRAR SENHA
const btnToggleSenha = document.getElementById("toggleSenha");
const inputSenhaGlobal = document.getElementById("loginSenha");

if (btnToggleSenha && inputSenhaGlobal) {
    btnToggleSenha.addEventListener("click", () => {
        if (inputSenhaGlobal.type === "password") {
            inputSenhaGlobal.type = "text";
            btnToggleSenha.classList.remove("fa-eye");
            btnToggleSenha.classList.add("fa-eye-slash");
        } else {
            inputSenhaGlobal.type = "password";
            btnToggleSenha.classList.remove("fa-eye-slash");
            btnToggleSenha.classList.add("fa-eye");
        }
    });
}