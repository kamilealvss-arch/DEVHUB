document.addEventListener("DOMContentLoaded", () => {
    const DB_URL = "https://htlyccadeagvimfphadt.supabase.co";
    const DB_KEY = "sb_publishable_eug-hn_UvVN-fjH7PXBG2Q_RSDvC069";

    const usuarioLogado = JSON.parse(localStorage.getItem("usuarioLogado"));
    if (usuarioLogado) {
        if (document.getElementById("nomeCliente")) document.getElementById("nomeCliente").value = usuarioLogado.nome || "";
        if (document.getElementById("emailCliente")) document.getElementById("emailCliente").value = usuarioLogado.email || "";
    }

    const formSolicitacao = document.getElementById("formularioSolicitacao");
    if (formSolicitacao) {
        formSolicitacao.addEventListener("submit", async (e) => {
            e.preventDefault();

            let urlPublicaDoArquivo = null;
            const inputArquivo = document.querySelector('input[type="file"]') || document.getElementById("arquivoCliente");

            if (inputArquivo && inputArquivo.files.length > 0) {
                const arquivo = inputArquivo.files[0];
                const nomeUnico = `${Date.now()}_${arquivo.name}`;

                try {
                    const uploadRes = await fetch(`${DB_URL}/storage/v1/object/briefings/${nomeUnico}`, {
                        method: "POST",
                        headers: {
                            "apikey": DB_KEY,
                            "Authorization": `Bearer ${DB_KEY}`,
                            "Content-Type": arquivo.type
                        },
                        body: arquivo
                    });

                    if (uploadRes.ok) {
                        urlPublicaDoArquivo = `${DB_URL}/storage/v1/object/public/briefings/${nomeUnico}`;
                    } else {
                        console.error("Falha ao subir arquivo para o Storage.");
                    }
                } catch (storageErr) {
                    console.error("Erro na comunicação com o Storage:", storageErr);
                }
            }

            const checkboxes = document.querySelectorAll('input[name="recursos"]:checked');
            const recursosArray = [];
            checkboxes.forEach(cb => recursosArray.push(cb.value));

            // Dentro de formSolicitacao.addEventListener("submit", ...)

            const payload = {
                nome_cliente: document.getElementById("nomeCliente").value,
                email_cliente: document.getElementById("emailCliente").value,
                projeto_nome: document.getElementById("projetoNome") ? document.getElementById("projetoNome").value : "", // 👈 CAPTURA O NOME DO PROJETO
                tipo_projeto: document.getElementById("tipoProjeto").value,
                estilo_visual: document.getElementById("estiloVisual").value,
                tipografia: document.getElementById("preferenciaFonte").value,
                cor_principal: document.getElementById("corPrincipal").value,
                orcamento: document.getElementById("faixaOrcamento").value,
                prazo: document.getElementById("prazoEstimado").value,
                recursos: recursosArray.join(", "),
                descricao: document.getElementById("descricao").value,
                status_dev: "PENDENTE",
                arquivo_url: urlPublicaDoArquivo
            };

            try {
                const res = await fetch(`${DB_URL}/rest/v1/solicitacoes`, {
                    method: "POST",
                    headers: {
                        "apikey": DB_KEY,
                        "Authorization": `Bearer ${DB_KEY}`,
                        "Content-Type": "application/json",
                        "Prefer": "return=minimal"
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) {
                    alert(" Solicitação enviada com sucesso para análise!");
                    window.location.href = "cliente.html";
                } else {
                    const erroTxt = await res.text();
                    alert("Erro ao salvar solicitação: " + erroTxt);
                }
            } catch (err) {
                alert("Falha de rede ao enviar solicitação.");
            }
        });
    }


    const btnCancelar = document.getElementById("btnCancelar");
    if (btnCancelar) {
        btnCancelar.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "cliente.html";
        });
    }
});

