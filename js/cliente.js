const DB_URL = "https://htlyccadeagvimfphadt.supabase.co";
const DB_KEY = "sb_publishable_eug-hn_UvVN-fjH7PXBG2Q_RSDvC069";

document.addEventListener("DOMContentLoaded", async () => {
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

    if (!gradeProjetos) return;

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
            return;
        }

        dadosProjetos.forEach(projeto => {
            const dataFormatada = projeto.criado_em
                ? " • Enviado em " + new Date(projeto.criado_em).toLocaleDateString('pt-BR')
                : "";

            const htmlModulos = projeto.recursos
                ? projeto.recursos.split(", ").map(rec => `<span class="etiqueta-modulo">✓ ${rec}</span>`).join("")
                : `<span class="etiqueta-modulo" style="opacity: 0.6;">Nenhum recurso extra selecionado</span>`;

            
            const urlAmostraSegura = projeto.url_amostra || projeto.imagem_amostra || "";

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
                                    <div class="valor-meta-cor">
                                        ${projeto.cor_principal || 'Não informado'}
                                    </div>
                                </div>
                                <div class="item-meta">
                                    <p class="rotulo-meta">Orçamento Recomendado</p>
                                    <p class="valor-meta" style="color: #8B1A1A; font-weight: 600;">${projeto.orcamento || 'Não informado'}</p>
                                </div>
                            </div>

                            <div class="bloco-modulos">
                                <p class="rotulo-modulos">Módulos Interativos Desejados:</p>
                                <div class="lista-modulos">
                                    ${htmlModulos}
                                </div>
                            </div>
                        </div>

                        <div class="coluna-desenvolvedor">
                            <div class="cabecalho-dev">
                                <img src="img/brilho.png" alt="Ícone Dev" class="imagem-etapa" />
                                <h4 class="titulo-dev">Retorno do Desenvolvedor</h4>
                            </div>
                            <div class="conteudo-dev">
                                <p class="mensagem-dev">"${projeto.resposta_dev || 'Aguardando o desenvolvedor analisar o escopo e formular uma proposta.'}"</p>
                                <div class="caixa-viabilidade">
                                    <span class="rotulo-viabilidade">Status da oferta</span>
                                    <span class="status-viabilidade">✓ ${projeto.status_oferta || 'Análise de Viabilidade Pendente'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="rodape-acoes">
                        <button class="botao-acao botao-icone" title="Visualizar Amostra do Tema" onclick="abrirModalTema('${urlAmostraSegura}')">
                            <img src="img/estrelou.png" alt="Visualizar" class="imagem-etapa" />
                        </button>
                        <button class="botao-acao botao-excluir" title="Cancelar Solicitação" onclick="deletarSolicitacao(${projeto.id})">
                            <img src="img/lixeira-de-reciclagem.png" alt="Excluir" class="imagem-etapa" />
                        </button>
                    </div>
                </article>
            `;

            gradeProjetos.insertAdjacentHTML("beforeend", cardHTML);
        });

    } catch (erro) {
        console.error("Falha ao puxar registros:", erro);
        gradeProjetos.innerHTML = `<p style="color:red; text-align:center; padding: 2rem;">Erro crítico ao carregar dados do painel.</p>`;
    }
});


function abrirModalTema(urlImagem) {
    const modal = document.getElementById("modalVisualizarTema");
    const imgElement = document.getElementById("imagemAmostra");
    const textoAviso = document.getElementById("textoSemAmostra");

    if (urlImagem && urlImagem.trim() !== "") {
        imgElement.src = urlImagem;
        imgElement.style.display = "block";
        textoAviso.style.display = "none";
    } else {
        imgElement.src = "";
        imgElement.style.display = "none";
        textoAviso.style.display = "block";
    }

    modal.style.display = "flex";
}

function fecharModalTema() {
    document.getElementById("modalVisualizarTema").style.display = "none";
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
            alert("Solicitação removida do banco de dados.");
            window.location.reload();
        } else {
            alert("Não foi possível excluir o registro.");
        }
    } catch (err) {
        console.error(err);
    }
}
