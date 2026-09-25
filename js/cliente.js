const DB_URL = "https://htlyccadeagvimfphadt.supabase.co";
const DB_KEY = "sb_publishable_eug-hn_UvVN-fjH7PXBG2Q_RSDvC069";

document.addEventListener("DOMContentLoaded", async () => {
    // --------------------------------------------------------------------------
    // 1. AUTENTICAÇÃO E CARREGAMENTO DE PEDIDOS (SUPABASE)
    // --------------------------------------------------------------------------
    const usuarioLogado = localStorage.getItem("usuarioLogado");
    if (!usuarioLogado) {
        window.location.href = "login.html";
        return;
    }

    const usuario = JSON.parse(usuarioLogado);
    const gradeProjetos = document.querySelector(".grade-projetos");

    const btnSair = document.getElementById("btnSair");
    if (btnSair) {
        btnSair.addEventListener("click", (evento) => {
            evento.preventDefault();
            localStorage.removeItem("usuarioLogado");
            alert("Sessão encerrada com sucesso!");
            window.location.href = "login.html";
        });
    }

    if (gradeProjetos) {
        try {
            const resposta = await fetch(`${DB_URL}/rest/v1/solicitacoes?email_cliente=eq.${usuario.email}&order=id.desc`, {
                method: "GET",
                headers: {
                    "apikey": DB_KEY,
                    "Authorization": `Bearer ${DB_KEY}`,
                    "Content-Type": "application/json"
                }
            });

            const dadosProjetos = await resposta.json();
            gradeProjetos.innerHTML = "";

            if (dadosProjetos.length === 0) {
                gradeProjetos.innerHTML = `
                    <div style="grid-column: 1/-1; text-align: center; padding: 3rem; background: white; border-radius: 8px; border: 1px dashed #e5e7eb;">
                        <p style="color: #6b7280; font-size: 0.95rem;">Você ainda não enviou nenhuma solicitação. Clique em "Fazer Novo Pedido" para começar!</p>
                    </div>
                `;
            } else {
                dadosProjetos.forEach(projeto => {
                    const dataFormatada = projeto.criado_em
                        ? " • Enviado em " + new Date(projeto.criado_em).toLocaleDateString('pt-BR')
                        : "";

                    const htmlModulos = projeto.recursos
                        ? projeto.recursos.split(", ").map(rec => `<span class="etiqueta-modulo">✓ ${rec}</span>`).join("")
                        : `<span class="etiqueta-modulo" style="opacity: 0.6;">Nenhum recurso extra selecionado</span>`;

                    const urlAmostraSegura = projeto.url_amostra || projeto.imagem_amostra || "";
                    const temValorDev = projeto.valor_final !== null && projeto.valor_final !== undefined;
                    const valorFinalFormatado = temValorDev
                        ? `R$ ${parseFloat(projeto.valor_final).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
                        : null;

                    const cardHTML = `
                        <article class="cartao-projeto">
                            <div class="cabecalho-cartao">
                                <div class="info-basica">
                                    <span class="id-projeto">Projeto ID: #${projeto.id}${dataFormatada}</span>
                                    <h3 class="nome-projeto">${projeto.tipo_projeto}</h3>
                                </div>
                                <div class="status-projeto">
                                    <span class="etiqueta-status status-analise">● ${projeto.status_dev || 'Em Análise pelo Desenvolvedor'}</span>
                                </div>
                            </div>

                            <div class="corpo-cartao">
                                <div class="coluna-briefing">
                                    <div class="bloco-escopo">
                                        <h4 class="titulo-bloco">Escopo Solicitado</h4>
                                        <p class="texto-escopo" style="overflow-wrap: break-word; word-break: break-word;">"${projeto.descricao || 'Sem descrição cadastrada.'}"</p>
                                    </div>

                                    <div class="grade-metadados">
                                        <div class="item-meta">
                                            <p class="rotulo-meta">Estilo Estético</p>
                                            <p class="valor-meta">${projeto.estilo_visual || 'Não informado'}</p>
                                        </div>
                                        <div class="item-meta">
                                            <p class="rotulo-meta">Filtro de Fonte</p>
                                            <p class="valor-meta">${projeto.tipografia || 'Não informado'}</p>
                                        </div>
                                        <div class="item-meta">
                                            <p class="rotulo-meta">Cor de Marca</p>
                                            <div class="valor-meta-cor">${projeto.cor_principal || 'Não informado'}</div>
                                        </div>
                                        <div class="item-meta">
                                            <p class="rotulo-meta">Orçamento Estimado</p>
                                            <p class="valor-meta" style="color: #6b7280;">${projeto.orcamento || 'Não informado'}</p>
                                        </div>
                                    </div>

                                    <div class="bloco-modulos">
                                        <p class="rotulo-modulos">Módulos Interativos Desejados:</p>
                                        <div class="lista-modulos">${htmlModulos}</div>
                                    </div>
                                </div>

                                <div class="coluna-desenvolvedor">
                                    <div class="cabecalho-dev">
                                        <img src="img/brilho.png" alt="Ícone Dev" class="imagem-etapa" />
                                        <h4 class="titulo-dev">Retorno do Desenvolvedor</h4>
                                    </div>
                                    <div class="conteudo-dev">
                                        <p class="mensagem-dev">"${projeto.resposta_dev || 'Aguardando o desenvolvedor analisar o escopo e formular uma proposta.'}"</p>
                                        
                                        ${valorFinalFormatado ? `
                                            <div style="margin: 10px 0; padding: 10px; background: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 6px;">
                                                <span style="font-size: 11px; color: #047857; font-weight: bold; display: block; text-transform: uppercase;">Valor Final Aprovado:</span>
                                                <strong style="font-size: 18px; color: #059669;">${valorFinalFormatado}</strong>
                                            </div>
                                        ` : ''}

                                        <div class="caixa-viabilidade">
                                            <span class="rotulo-viabilidade">Status da oferta</span>
                                            <span class="status-viabilidade">✓ ${projeto.status_oferta || 'Análise de Viabilidade Pendente'}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div class="rodape-acoes" style="display: flex; justify-content: space-between; align-items: center; padding-top: 15px;">
                                <div style="display: flex; gap: 8px;">
                                    <button class="botao-acao botao-icone" title="Visualizar Amostra do Tema" onclick="abrirModalTema('${urlAmostraSegura}')">
                                        <img src="img/estrelou.png" alt="Visualizar" class="imagem-etapa" />
                                    </button>
                                    <button class="botao-acao botao-excluir" title="Cancelar Solicitação" onclick="deletarSolicitacao(${projeto.id})">
                                        <img src="img/lixeira-de-reciclagem.png" alt="Excluir" class="imagem-etapa" />
                                    </button>
                                </div>

                                ${valorFinalFormatado ? `
                                    <button class="botao-pagar" onclick="abrirPagamento('${valorFinalFormatado}')" style="background-color: #9F2B2B; color: #ffffff; border: none; padding: 10px 20px; border-radius: 8px; font-weight: bold; cursor: pointer;">
                                         Finalizar Compra (${valorFinalFormatado})
                                    </button>
                                ` : ''}
                            </div>
                        </article>
                    `;
                    gradeProjetos.insertAdjacentHTML("beforeend", cardHTML);
                });
            }
        } catch (erro) {
            console.error("Falha ao carregar solicitações:", erro);
        }
    }

    // --------------------------------------------------------------------------
    // 2. LÓGICA DE GERENCIAMENTO DAS ABAS DE PAGAMENTO
    // --------------------------------------------------------------------------
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    function ativarAba(targetKey) {
        if (!targetKey) return;

        // Limpa a chave tirando a palavra 'Tab' para padronizar busca
        const key = targetKey.replace("Tab", "").toLowerCase();

        // Remove a classe 'active' de todos
        tabBtns.forEach(btn => btn.classList.remove("active"));
        tabContents.forEach(content => {
            content.classList.remove("active");
            content.style.display = "none";
        });

        // Encontra o conteúdo equivalente pelo ID (ex: pixTab, boletoTab, cardTab)
        tabContents.forEach(content => {
            if (content.id.toLowerCase().includes(key)) {
                content.classList.add("active");
                content.style.display = "block";
            }
        });

        // Marca o botão clicado como ativo
        tabBtns.forEach(btn => {
            const btnTabAttr = (btn.getAttribute("data-tab") || "").toLowerCase();
            const btnText = btn.innerText.toLowerCase();
            if (btnTabAttr.includes(key) || btnText.includes(key)) {
                btn.classList.add("active");
            }
        });
    }

    tabBtns.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault();
            const target = btn.getAttribute("data-tab") || btn.innerText;
            ativarAba(target);
        });
    });

    // Torna a função global para a abertura do modal acionar o Pix automaticamente
    window.ativarAbaPagamento = ativarAba;

    // --------------------------------------------------------------------------
    // 3. MÁSCARAS E RECURSOS DO PIX / BOLETO / CARTÃO
    // --------------------------------------------------------------------------
    const copyBtn = document.getElementById("copyPixBtn");
    const pixKeyInput = document.getElementById("pixKey");
    const timerDisplay = document.getElementById("pixTimer");

    if (copyBtn && pixKeyInput) {
        copyBtn.addEventListener("click", () => {
            navigator.clipboard.writeText(pixKeyInput.value).then(() => {
                const txtOriginal = copyBtn.innerHTML;
                copyBtn.innerHTML = `✓ Copiado!`;
                copyBtn.style.background = "#10b981";
                setTimeout(() => {
                    copyBtn.innerHTML = txtOriginal;
                    copyBtn.style.background = "#2563eb";
                }, 2000);
            });
        });
    }

    if (timerDisplay) {
        let timerSeconds = 899;
        setInterval(() => {
            if (timerSeconds <= 0) return;
            timerSeconds--;
            const m = Math.floor(timerSeconds / 60).toString().padStart(2, "0");
            const s = (timerSeconds % 60).toString().padStart(2, "0");
            timerDisplay.innerText = `${m}:${s}`;
        }, 1000);
    }

    // Máscara para o CPF no boleto
    const boletoCpfInput = document.getElementById("boletoCpf");
    if (boletoCpfInput) {
        boletoCpfInput.addEventListener("input", (e) => {
            let val = e.target.value.replace(/\D/g, "").substring(0, 11);
            val = val.replace(/(\d{3})(\d)/, "$1.$2");
            val = val.replace(/(\d{3})(\d)/, "$1.$2");
            val = val.replace(/(\d{3})(\d{1,2})$/, "$1-$2");
            e.target.value = val;
        });
    }
});

// --------------------------------------------------------------------------
// 4. ABERTURA E FECHAMENTO DO MODAL DE PAGAMENTO
// --------------------------------------------------------------------------
function abrirPagamento(valorFormatado) {
    const modal = document.getElementById("paymentModal");
    if (!modal) return;

    // Atualiza os seletores com o valor da compra
    const elementosValor = modal.querySelectorAll(".summary-total strong, #displayTotal, .valor-total");
    elementosValor.forEach(el => el.innerText = valorFormatado);

    modal.classList.add("active");
    modal.style.display = "flex";

    // Exibe a aba do Pix por padrão ao abrir
    if (window.ativarAbaPagamento) {
        window.ativarAbaPagamento("pix");
    }
}

function fecharPagamento() {
    const modal = document.getElementById("paymentModal");
    if (modal) {
        modal.classList.remove("active");
        modal.style.display = "none";
    }
}

// Fechamento via clique no fundo escuro do modal ou no botão 'X'
document.addEventListener("click", (e) => {
    const modal = document.getElementById("paymentModal");
    if (!modal) return;

    if (
        e.target === modal || 
        e.target.closest("#closeModalBtn") || 
        e.target.closest(".close-modal") ||
        e.target.innerText.trim() === "✕" ||
        e.target.innerText.trim() === "×"
    ) {
        fecharPagamento();
    }
});

// --------------------------------------------------------------------------
// 5. FUNÇÕES AUXILIARES (TEMA E DELEÇÃO)
// --------------------------------------------------------------------------
function abrirModalTema(urlImagem) {
    const modal = document.getElementById("modalVisualizarTema");
    const imgElement = document.getElementById("imagemAmostra");
    const textoAviso = document.getElementById("textoSemAmostra");

    if (!modal) return;

    if (urlImagem && urlImagem.trim() !== "") {
        imgElement.src = urlImagem;
        imgElement.style.display = "block";
        if (textoAviso) textoAviso.style.display = "none";
    } else {
        imgElement.src = "";
        imgElement.style.display = "none";
        if (textoAviso) textoAviso.style.display = "block";
    }

    modal.style.display = "flex";
}

function fecharModalTema() {
    const modal = document.getElementById("modalVisualizarTema");
    if (modal) modal.style.display = "none";
}

async function deletarSolicitacao(id) {
    if (!confirm("Tem certeza de que deseja excluir esta solicitação?")) return;

    try {
        const resposta = await fetch(`${DB_URL}/rest/v1/solicitacoes?id=eq.${id}`, {
            method: "DELETE",
            headers: {
                "apikey": DB_KEY,
                "Authorization": `Bearer ${DB_KEY}`
            }
        });

        if (resposta.ok) {
            alert("Solicitação removida com sucesso.");
            window.location.reload();
        } else {
            alert("Não foi possível excluir o registro.");
        }
    } catch (err) {
        console.error(err);
    }
}