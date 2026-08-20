const DB_URL = "https://htlyccadeagvimfphadt.supabase.co";
const DB_KEY = "sb_publishable_eug-hn_UvVN-fjH7PXBG2Q_RSDvC069";

document.addEventListener("DOMContentLoaded", () => {

    // 📞 Máscara para formatar o telefone em tempo real: (41) 99999-9999
    const inputTelefone = document.getElementById("telefoneCliente");
    if (inputTelefone) {
        inputTelefone.addEventListener("input", (e) => {
            let value = e.target.value.replace(/\D/g, ""); // Remove tudo que não é número
            value = value.substring(0, 11); // Limita a 11 dígitos

            // Formata DDD e hífen
            value = value.replace(/^(\d{2})(\d)/g, "($1) $2");
            value = value.replace(/(\d{5})(\d)/, "$1-$2");

            e.target.value = value;
        });
    }

    const f1 = document.getElementById("formularioCadastro1");
    if (f1) {
        f1.addEventListener("submit", (e) => {
            e.preventDefault();
            const dados = {
                nome: document.getElementById("nomeCompleto").value.trim(),
                email: document.getElementById("emailCliente").value.trim().toLowerCase(),
                telefone: document.getElementById("telefoneCliente").value.trim()
            };
            localStorage.setItem("cadastroEmAndamento", JSON.stringify(dados));
            window.location.href = "cadastro2.html";
        });
    }

    const f2 = document.getElementById("formularioCadastro2");
    if (f2) {
        f2.addEventListener("submit", (e) => {
            e.preventDefault();
            let dados = JSON.parse(localStorage.getItem("cadastroEmAndamento")) || {};
            dados.empresa = document.getElementById("nomeEmpresa").value.trim();
            dados.setor = document.getElementById("setorComercial").value;
            localStorage.setItem("cadastroEmAndamento", JSON.stringify(dados));
            window.location.href = "cadastro3.html";
        });
    }

    const f3 = document.getElementById("formularioCadastro3");
    if (f3) {
        f3.addEventListener("submit", async (e) => {
            e.preventDefault();

            try {
                const senha = document.getElementById("senhaCliente").value;
                const confirmar = document.getElementById("confirmarSenha").value;

                if (senha !== confirmar) {
                    alert("As senhas não coincidem!");
                    return;
                }

                let dados = JSON.parse(localStorage.getItem("cadastroEmAndamento")) || {};

                // Valida se a biblioteca bcrypt foi importada na cadastro3.html
                if (typeof dcodeIO === "undefined" || !dcodeIO.bcrypt) {
                    alert("Erro: A biblioteca bcrypt.js não foi carregada na cadastro3.html.");
                    return;
                }

                // 🔒 CRIPTOGRAFIA DA SENHA COM BCRYPTJS
                const salt = dcodeIO.bcrypt.genSaltSync(10);
                const senhaCriptografada = dcodeIO.bcrypt.hashSync(senha, salt);

                const usuarioFinal = {
                    nome: dados.nome,
                    email: dados.email,
                    telefone: dados.telefone,
                    nome_empresa: dados.empresa || "Não informado",
                    setor: dados.setor || "Não informado",
                    senha: senhaCriptografada
                };

                const res = await fetch(`${DB_URL}/rest/v1/usuarios`, {
                    method: "POST",
                    headers: {
                        "apikey": DB_KEY,
                        "Authorization": `Bearer ${DB_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify(usuarioFinal)
                });

                if (res.ok) {
                    localStorage.setItem("usuarioLogado", JSON.stringify({ nome: usuarioFinal.nome, email: usuarioFinal.email }));
                    localStorage.removeItem("cadastroEmAndamento");
                    alert("🎉 Cadastro efetuado com sucesso!");
                    window.location.href = "solicitacao.html";
                } else {
                    const erroTxt = await res.text();
                    alert("Erro no Supabase: " + erroTxt);
                }
            } catch (err) {
                alert("Erro no código JavaScript: " + err.message);
            }
        });
    }
});