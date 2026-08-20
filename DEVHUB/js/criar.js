const DB_URL = "https://htlyccadeagvimfphadt.supabase.co";
const DB_KEY = "sb_publishable_eug-hn_UvVN-fjH7PXBG2Q_RSDvC069";

  const devLogado = localStorage.getItem("devLogado");
  if (!devLogado) {
  window.location.href = "login-dev.html";} 
  const supabaseClient = supabase.createClient(DB_URL, DB_KEY);

const corpoDaTabela = document.getElementById('corpo-tabela');
const campoBusca = document.querySelector('.campo-busca');
const modal = document.getElementById('modal-avaliacao');
const btnFechar = document.getElementById('btn-fechar-modal');
const btnCancelar = document.getElementById('btn-cancelar-modal');
const btnSalvarModal = document.getElementById('btn-salvar-modal');


let todasAsSolicitacoes = []; 
let filtroAbaAtual = 'Tudo';
let termoBuscaAtual = '';
let idProjetoSendoAvaliado = null; // Guarda o ID do projeto aberto no modal

const opcoesDeStatus = ["PENDENTE", "EM ANÁLISE", "APROVADO", "RECUSADO", "CONCLUÍDO"];
const mapeamentoDeCores = {
  "PENDENTE": "pendente",
  "EM ANÁLISE": "analise",
  "APROVADO": "aprovado",
  "RECUSADO": "recusado",
  "CONCLUÍDO": "concluido"
};
const mapaFiltroParaStatus = {
  "Pendentes": "PENDENTE",
  "Em Análise": "EM ANÁLISE",
  "Aprovados": "APROVADO",
  "Recusados": "RECUSADO",
  "Concluídos": "CONCLUÍDO"
};

// 3. CARREGAR DADOS DO SUPABASE (Read)
async function carregarDadosDoBanco() {
  try {
    const { data, error } = await supabaseClient
      .from('solicitacoes')
      .select('*')
      .order('id', { ascending: false });

    if (error) throw error;

    todasAsSolicitacoes = data || [];
    aplicarFiltros();
    atualizarMetricas();
  } catch (err) {
    console.error("Erro ao carregar solicitações do Supabase:", err);
    corpoDaTabela.innerHTML = `<tr><td colspan="5" style="text-align:center; color:red; padding:20px;">Falha ao conectar ao banco de dados.</td></tr>`;
  }
}

function renderizarTabela(dados) {
  corpoDaTabela.innerHTML = '';

  if (dados.length === 0) {
    corpoDaTabela.innerHTML = `<tr><td colspan="5" style="text-align:center; color:#6b7280; padding:20px;">Nenhuma solicitação encontrada para o filtro atual.</td></tr>`;
    return;
  }

  dados.forEach(solicitacao => {
    const statusAtual = (solicitacao.status_dev || 'PENDENTE').toUpperCase();
    const classeBadge = mapeamentoDeCores[statusAtual] || 'pendente';

    const iniciais = solicitacao.nome_cliente
      ? solicitacao.nome_cliente.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
      : "CL";

    const opcoesSelect = opcoesDeStatus.map(opcao => {
      const isSelected = statusAtual === opcao ? 'selected' : '';
      return `<option value="${opcao}" ${isSelected}>Mudar para ${opcao}</option>`;
    }).join('');

    const linha = document.createElement('tr');
    linha.innerHTML = `
      <td>
        <div class="perfil-cliente">
          <div class="avatar">${iniciais}</div>
          <div>
            <div class="nome-cliente">${solicitacao.nome_cliente || 'Cliente Sem Nome'}</div>
            <div class="tipo-projeto">${solicitacao.tipo_projeto || 'Website'}</div>
          </div>
        </div>
      </td>
      <td class="email-texto">${solicitacao.email_cliente || 'Não informado'}</td>
      <td>
        <p class="descricao-texto">${solicitacao.descricao || 'Sem descrição detalhada.'}</p>
        <div class="tags-escopo" style="display: flex; gap: 8px; align-items: center; flex-wrap: wrap;">
          <span class="tag-estilo">ESTILO: ${(solicitacao.estilo_visual || 'Padrão').toUpperCase()}</span>
          <span class="tag-preco">${solicitacao.orcamento || 'Sob Consulta'}</span>
          
          ${solicitacao.arquivo_url ? `
            <a href="${solicitacao.arquivo_url}" target="_blank" class="tag-recurso" style="background: #e0f2fe; color: #0369a1; border: 1px solid #bae6fd; text-decoration: none; display: inline-flex; align-items: center; gap: 4px; padding: 2px 8px; border-radius: 4px; font-size: 11px; font-weight: bold;">
              📎 Arquivo Anexo
            </a>
          ` : ''}
        </div>
      </td>
      <td class="centro">
        <div class="coluna-status">
          <span class="badge ${classeBadge}">${statusAtual}</span>
          <select class="select-status" data-id="${solicitacao.id}">
            ${opcoesSelect}
          </select>
        </div>
      </td>
      <td class="direita">
        <div class="acoes-container">
          <button class="botao-avaliar" data-id="${solicitacao.id}">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            Avaliar & Proposta
          </button>
        </div>
      </td>
    `;
    corpoDaTabela.appendChild(linha);
  });
}

corpoDaTabela.addEventListener('change', async (e) => {
  if (e.target.classList.contains('select-status')) {
    const id = parseInt(e.target.dataset.id);
    const novoStatus = e.target.value;

    try {
      const { error } = await supabaseClient
        .from('solicitacoes')
        .update({
          status_dev: novoStatus,
          status_oferta: novoStatus === 'CONCLUÍDO' || novoStatus === 'APROVADO' ? 'Proposta Aceita' : 'Sob Revisão do Desenvolvedor'
        })
        .eq('id', id);

      if (error) throw error;

      await carregarDadosDoBanco();
    } catch (err) {
      console.error("Erro ao atualizar status:", err);
      alert("Não foi possível atualizar o status no Supabase.");
    }
  }
});


function abrirModal(id) {
  const projeto = todasAsSolicitacoes.find(item => item.id === id);
  if (!projeto) return;

  idProjetoSendoAvaliado = id;

  let containerArquivo = document.getElementById('modal-arquivo-container');
  
  if (!containerArquivo) {
    containerArquivo = document.createElement('div');
    containerArquivo.id = 'modal-arquivo-container';
    containerArquivo.style.marginTop = '15px';
    containerArquivo.style.padding = '12px';
    containerArquivo.style.borderRadius = '6px';
    containerArquivo.style.background = '#f3f4f6';
    document.getElementById('modal-proposta').parentNode.insertBefore(containerArquivo, document.getElementById('modal-proposta'));
  }

  if (projeto.arquivo_url) {
    containerArquivo.innerHTML = `
      <label style="font-weight: bold; font-size: 12px; color: #4b5563; display: block; margin-bottom: 5px;">📁 ARQUIVO DO CLIENTE:</label>
      <a href="${projeto.arquivo_url}" target="_blank" style="display: inline-flex; align-items: center; gap: 6px; background: #8D1F1F; color: white; padding: 8px 12px; border-radius: 4px; text-decoration: none; font-size: 13px; font-weight: 500;">
         Baixar / Visualizar Arquivo Enviado
      </a>
    `;
  } else {
    containerArquivo.innerHTML = `
      <label style="font-weight: bold; font-size: 12px; color: #4b5563; display: block; margin-bottom: 5px;">📁 ARQUIVO DO CLIENTE:</label>
      <span style="color: #9ca3af; font-size: 13px; font-style: italic;">Nenhum arquivo foi anexado a este briefing.</span>
    `;
  }

  document.getElementById('modal-id-texto').textContent = `#sol-${projeto.id}`;
  document.getElementById('modal-nome-cliente').textContent = projeto.nome_cliente || 'Não Informado';
  document.getElementById('modal-estilo').textContent = projeto.estilo_visual || 'Não Informado';
  document.getElementById('modal-tipografia').textContent = projeto.tipografia || 'Não Informado';
  document.getElementById('modal-cor').textContent = projeto.cor_principal || 'Não Informado';
  document.getElementById('modal-preco').textContent = projeto.orcamento || 'Não Informado';
  document.getElementById('modal-prazo').textContent = projeto.prazo || "A estipular";
  
  document.getElementById('modal-data').textContent = projeto.criado_em
    ? new Date(projeto.criado_em).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short', year: 'numeric' })
    : 'Recentemente';

  const divRecursos = document.getElementById('modal-recursos');
  divRecursos.innerHTML = '';
  if (projeto.recursos) {
    projeto.recursos.split(', ').forEach(recurso => {
      const span = document.createElement('span');
      span.className = 'tag-recurso';
      span.textContent = `✓ ${recurso}`;
      divRecursos.appendChild(span);
    });
  } else {
    divRecursos.innerHTML = '<span class="tag-recurso" style="opacity: 0.6">Nenhum recurso selecionado</span>';
  }

  document.getElementById('modal-descricao').textContent = `"${projeto.descricao || 'Sem descrição.'}"`;
  
  document.getElementById('modal-proposta').value = projeto.resposta_dev || '';
  document.getElementById('modal-notas').value = projeto.notas_internas || '';
  
  const inputArquivo = document.getElementById("modal-arquivo-amostra");
  if (inputArquivo) inputArquivo.value = "";

  modal.classList.add('ativo');
}

function fecharModal() {
  modal.classList.remove('ativo');
  idProjetoSendoAvaliado = null;
}

async function salvarPropostaENotas() {
  if (!idProjetoSendoAvaliado) return;

  const textoProposta = document.getElementById('modal-proposta').value.trim();
  const textoNotas = document.getElementById('modal-notas').value.trim();
  const inputArquivo = document.getElementById("modal-arquivo-amostra");
  
  let urlPublicaImagem = "";


  if (inputArquivo && inputArquivo.files.length > 0) {
    const arquivo = inputArquivo.files[0];
    const extensao = arquivo.name.split('.').pop();
    const nomeArquivo = `amostra_${idProjetoSendoAvaliado}_${Date.now()}.${extensao}`;

    try {
      const { data, error } = await supabaseClient.storage
        .from('amostras') 
        .upload(nomeArquivo, arquivo);

      if (error) throw error;

      const { data: dataUrl } = supabaseClient.storage
        .from('amostras')
        .getPublicUrl(nomeArquivo);
          
      urlPublicaImagem = dataUrl.publicUrl;

    } catch (erroUpload) {
      console.error("Erro ao fazer upload do arquivo:", erroUpload);
      alert("Falha ao enviar o arquivo de imagem para o servidor.");
      return; 
    }
  }

  const dadosAtualizados = {
    resposta_dev: textoProposta,
    notas_internas: textoNotas
  };

  if (urlPublicaImagem !== "") {
    dadosAtualizados.url_amostra = urlPublicaImagem;
    dadosAtualizados.status_dev = "Amostra Disponível";
    dadosAtualizados.status_oferta = "Amostra Enviada";
  }

  try {
    const { error } = await supabaseClient
      .from('solicitacoes')
      .update(dadosAtualizados)
      .eq('id', idProjetoSendoAvaliado);

    if (error) throw error;

    alert("Proposta e dados atualizados com sucesso!");
    fecharModal();
    await carregarDadosDoBanco(); 
  } catch (err) {
    console.error("Erro ao salvar proposta:", err);
    alert("Falha ao salvar as modificações no banco de dados.");
  }
}

corpoDaTabela.addEventListener('click', (e) => {
  const btn = e.target.closest('.botao-avaliar');
  if (btn) abrirModal(parseInt(btn.dataset.id));
});

if (btnSalvarModal) {
  btnSalvarModal.addEventListener('click', salvarPropostaENotas);
} else {
  const btnSalvarPorClasse = document.querySelector('.btn-salvar');
  if (btnSalvarPorClasse) btnSalvarPorClasse.addEventListener('click', salvarPropostaENotas);
}

btnFechar.addEventListener('click', fecharModal);
btnCancelar.addEventListener('click', fecharModal);
modal.addEventListener('click', (e) => { if(e.target === modal) fecharModal(); });

campoBusca.addEventListener('input', (e) => {
  termoBuscaAtual = e.target.value.toLowerCase().trim();
  aplicarFiltros();
});

document.querySelectorAll('.aba').forEach(aba => {
  aba.addEventListener('click', (e) => {
    document.querySelectorAll('.aba').forEach(b => b.classList.remove('ativa'));
    e.target.classList.add('ativa');
    filtroAbaAtual = e.target.textContent.trim();
    aplicarFiltros();
  });
});


function aplicarFiltros() {
  let resultado = todasAsSolicitacoes;

  if (filtroAbaAtual !== 'Tudo') {
    const statusBuscado = mapaFiltroParaStatus[filtroAbaAtual];
    resultado = resultado.filter(i => (i.status_dev || 'PENDENTE').toUpperCase() === statusBuscado);
  }

  if (termoBuscaAtual !== '') {
    resultado = resultado.filter(i =>
      (i.nome_cliente && i.nome_cliente.toLowerCase().includes(termoBuscaAtual)) ||
      (i.email_cliente && i.email_cliente.toLowerCase().includes(termoBuscaAtual)) ||
      (i.descricao && i.descricao.toLowerCase().includes(termoBuscaAtual))
    );
  }

  renderizarTabela(resultado);
}

function atualizarMetricas() {
  document.getElementById('total-pedidos').textContent = todasAsSolicitacoes.length;
  document.getElementById('total-pendentes').textContent = todasAsSolicitacoes.filter(s => (s.status_dev || 'PENDENTE').toUpperCase() === 'PENDENTE').length;
  document.getElementById('total-analise').textContent = todasAsSolicitacoes.filter(s => (s.status_dev || '').toUpperCase() === 'EM ANÁLISE').length;
  document.getElementById('total-finalizados').textContent = todasAsSolicitacoes.filter(s => (s.status_dev || '').toUpperCase() === 'CONCLUÍDO').length;
}

document.addEventListener('DOMContentLoaded', carregarDadosDoBanco);

document.getElementById('btn-sair-dev').addEventListener('click', async () => {
 
    localStorage.removeItem("devLogado");
    await supabaseClient.auth.signOut();
    window.location.href = "login-dev.html";
});