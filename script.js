// Formata número como moeda brasileira
function formatarMoeda(valor) {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(valor);
}

// Converte data de yyyy-mm-dd pra dd/mm/yyyy
function formatarData(dataStr) {
    if (!dataStr) return '-';
    const partes = dataStr.split('-');
    if (partes.length === 3) {
        return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }
    return dataStr;
}

// Busca dados da API e monta a tabela com o SQL visível
function buscarEDesenharTabela(url, query_sql, headers, campos_json) {
    const areaDados = document.getElementById('area-dados');

    areaDados.innerHTML = `
        <div class="card">
            <p>Carregando dados do banco de dados...</p>
        </div>
    `;

    fetch(url)
        .then(response => response.json())
        .then(dados => {
            if (dados.erro) {
                areaDados.innerHTML = `<div class="card"><p style="color: var(--danger);">erro ao conectar a api</p></div>`;
                return;
            }

            // Monta as linhas da tabela
            let linhas = '';
            dados.forEach(item => {
                linhas += '<tr>';
                campos_json.forEach(campo => {
                    let valor = item[campo] !== null ? item[campo] : '<span style="color: var(--text-muted)">Nenhum</span>';

                    // Formata valores monetários
                    if (campo === 'valor_total' || campo === 'total_gasto') {
                        if (!isNaN(parseFloat(valor))) {
                            valor = formatarMoeda(valor);
                        }
                    }

                    linhas += `<td>${valor}</td>`;
                });
                linhas += '</tr>';
            });

            let thead = headers.map(h => `<th>${h}</th>`).join('');

            // Injeta a tabela no HTML
            areaDados.innerHTML = `
                <div class="card">
                    <div class="codigo-sql">${query_sql}</div>
                    <div class="table-wrapper">
                        <table class="tabela-profissional">
                            <thead><tr>${thead}</tr></thead>
                            <tbody>${linhas}</tbody>
                        </table>
                    </div>
                </div>
            `;
            lucide.createIcons();
        })
        .catch(erro => {
            areaDados.innerHTML = `<div class="card"><p style="color: var(--danger);">erro ao conectar a api</p></div>`;
        });
}

// Monta o Dashboard com os dados da API
function desenharDashboard(data) {
    const areaDados = document.getElementById('area-dados');

    // Status da conexão com o banco
    const statusText = 'Banco de Dados Conectado';
    const statusClass = 'connected';

    // Monta a lista dos últimos pedidos
    let transacoesHtml = '';
    if (data.recent_orders && data.recent_orders.length > 0) {
        data.recent_orders.forEach(order => {
            const avatarLetra = order.nome_cliente ? order.nome_cliente.charAt(0).toUpperCase() : 'C';
            const statusLabel = order.status_pedido ? order.status_pedido.toLowerCase() : 'pendente';

            transacoesHtml += `
                <div class="transaction-item">
                    <div class="transaction-info">
                        <div class="transaction-avatar">${avatarLetra}</div>
                        <div class="transaction-details">
                            <h4>${order.nome_cliente}</h4>
                            <p>Pedido #${order.id_pedido} • ${formatarData(order.data_pedido)}</p>
                        </div>
                    </div>
                    <div class="transaction-meta">
                        <span class="transaction-amount">${formatarMoeda(order.valor_total)}</span>
                        <span class="status-badge ${statusLabel}">${order.status_pedido}</span>
                    </div>
                </div>
            `;
        });
    } else {
        transacoesHtml = '<p style="color: var(--text-muted); padding: 20px; text-align: center;">Nenhum pedido recente registrado.</p>';
    }

    // Injeta os cards de métricas e a lista de pedidos
    areaDados.innerHTML = `
        <div class="dashboard-grid">
            <div class="card metric-card">
                <div class="metric-icon-wrapper">
                    <i data-lucide="dollar-sign"></i>
                </div>
                <div class="metric-card-content">
                    <h3>Faturamento</h3>
                    <p class="numero">${formatarMoeda(data.faturamento)}</p>
                </div>
            </div>
            
            <div class="card metric-card">
                <div class="metric-icon-wrapper">
                    <i data-lucide="users"></i>
                </div>
                <div class="metric-card-content">
                    <h3>Clientes</h3>
                    <p class="numero">${data.clientes}</p>
                </div>
            </div>

            <div class="card metric-card">
                <div class="metric-icon-wrapper">
                    <i data-lucide="shopping-bag"></i>
                </div>
                <div class="metric-card-content">
                    <h3>Pedidos</h3>
                    <p class="numero">${data.pedidos}</p>
                </div>
            </div>

            <div class="card metric-card">
                <div class="metric-icon-wrapper">
                    <i data-lucide="package"></i>
                </div>
                <div class="metric-card-content">
                    <h3>Produtos</h3>
                    <p class="numero">${data.produtos}</p>
                </div>
            </div>
        </div>

        <div class="overview-grid">
            <!-- Últimos Pedidos -->
            <div class="card">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
                    <h3 style="font-size:1.05rem; text-transform:none; letter-spacing:0; color:var(--text-main); font-weight:700;">
                        Últimos Pedidos
                    </h3>
                    <span style="font-size:0.75rem; color:var(--text-muted);">Atualização em tempo real</span>
                </div>
                <div class="transactions-list">
                    ${transacoesHtml}
                </div>
            </div>

            <!-- Status do Banco e métricas auxiliares -->
            <div class="card connection-card">
                <h3 style="font-size:1.05rem; text-transform:none; letter-spacing:0; color:var(--text-main); font-weight:700; margin-bottom:4px;">
                    Conexão & Auxiliares
                </h3>
                <div class="connection-status">
                    <div class="status-dot ${statusClass}"></div>
                    <span>${statusText}</span>
                </div>

                <div class="connection-stats-list">
                    <div class="connection-stat-row">
                        <span>Ticket Médio</span>
                        <span>${formatarMoeda(data.ticket_medio)}</span>
                    </div>
                    <div class="connection-stat-row">
                        <span>Armazéns ativos</span>
                        <span>${data.armazens}</span>
                    </div>
                    <div class="connection-stat-row">
                        <span>Transportadoras</span>
                        <span>${data.transportadoras}</span>
                    </div>
                    <div class="connection-stat-row">
                        <span>Fornecedores</span>
                        <span>${data.fornecedores}</span>
                    </div>
                </div>
            </div>
        </div>
    `;
    lucide.createIcons();
}

// Carrega o conteúdo da página conforme o item clicado no menu
function carregarConteudo(questao) {
    // Marca o item ativo no menu lateral
    const itensMenu = document.querySelectorAll('#menu-lista li');
    itensMenu.forEach(item => item.classList.remove('ativo'));
    event.currentTarget.classList.add('ativo');

    const titulo = document.getElementById('titulo-pagina');
    const subtitulo = document.getElementById('subtitulo-pagina');
    const areaDados = document.getElementById('area-dados');

    // Queries SQL exibidas na tela pra cada questão
    const queries = {
        q7: `SELECT c.nome_completo AS nome_cliente, p.id_pedido, t.nome_fantasia AS nome_transportadora \nFROM Cliente c\nINNER JOIN Pedido p ON c.id_cliente = p.id_cliente\nINNER JOIN Transportadora t ON p.id_transportadora = t.id_transportadora;`,
        q8: `SELECT prod.nome_produto, arm.codigo_filial, est.quantidade_disponivel \nFROM Produto prod\nLEFT JOIN Estoque_Armazem est ON prod.id_produto = est.id_produto\nLEFT JOIN Armazem arm ON est.id_armazem = arm.id_armazem;`,
        q9: `SELECT c.nome_completo, p.id_pedido, p.valor_total\nFROM Pedido p\nRIGHT JOIN Cliente c ON p.id_cliente = c.id_cliente;`,
        q10: `SELECT f.razao_social, p.nome_produto\nFROM Fornecedor f\nFULL JOIN Fornecimento fn ON f.id_fornecedor = fn.id_fornecedor\nFULL JOIN Produto p ON fn.id_produto = p.id_produto;`,
        q11: `SELECT c.nome_completo, p.id_cliente, SUM(p.valor_total) AS total_gasto\nFROM Pedido p\nINNER JOIN Cliente c ON p.id_cliente = c.id_cliente\nGROUP BY p.id_cliente, c.nome_completo\nHAVING SUM(p.valor_total) > 500.00\nORDER BY total_gasto DESC;`,
        q12: `SELECT nome_completo AS nome_contato, email AS email_contato, 'Cliente' AS tipo_contato\nFROM Cliente\nUNION\nSELECT razao_social, email_contato, 'Fornecedor'\nFROM Fornecedor;`,
        q13: `SELECT p.id_produto, p.nome_produto \nFROM Produto p\nINNER JOIN Produto_Categoria pc ON p.id_produto = pc.id_produto\nINTERSECT\nSELECT p.id_produto, p.nome_produto \nFROM Produto p\nINNER JOIN Fornecimento f ON p.id_produto = f.id_produto\nORDER BY id_produto ASC;`,
        q14: `SELECT id_produto, nome_produto \nFROM Produto\nEXCEPT\nSELECT p.id_produto, p.nome_produto \nFROM Produto p\nINNER JOIN Item_Pedido ip ON p.id_produto = ip.id_produto;`
    };

    // Visão Geral — puxa estatísticas do Flask
    if (questao === 'inicio') {
        titulo.innerText = "Visão Geral";
        subtitulo.innerText = "Métricas e status do banco de dados.";

        areaDados.innerHTML = `
            <div class="card">
                <p>Carregando métricas e histórico de transações...</p>
            </div>
        `;

        fetch('http://localhost:5000/api/dashboard_stats')
            .then(response => {
                if (!response.ok) throw new Error("Erro de conexão");
                return response.json();
            })
            .then(data => {
                if (data.erro || data.error) throw new Error("Erro no banco");
                desenharDashboard(data);
            })
            .catch(erro => {
                areaDados.innerHTML = `<div class="card"><p style="color: var(--danger);">erro ao conectar a api</p></div>`;
            });
    }
    // Questão 5 — violações de restrições (conteúdo estático)
    else if (questao === 'q5') {
        titulo.innerHTML = '<div class="label-topo">INTEGRIDADE DO BANCO</div>Erros esperados e Comportamentos';
        subtitulo.innerText = "Exemplos de violações de restrições e demonstração de valores padrão.";

        areaDados.innerHTML = `
            <div class="violacoes-grid">
                <div class="card-violacao">
                    <div>
                        <span class="badge-erro"><i data-lucide="x-circle" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> 1. Erro esperado</span>
                        <h3>CHECK simples</h3>
                        <p>Preço base precisa ser maior que zero.</p>
                    </div>
                    <div class="codigo-sql">INSERT INTO Produto (nome_produto, descricao, preco_base, peso_gramas) VALUES ('Teclado', 'Teclado Mecânico', -50.00, 800);</div>
                    <p class="erro-mensagem"><i data-lucide="alert-triangle" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Falha na restrição de verificação: o banco impede preço negativo.</p>
                </div>
                
                <div class="card-violacao sucesso-esperado">
                    <div>
                        <span class="badge-erro"><i data-lucide="check-circle" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> 2. Sucesso esperado</span>
                        <h3>Restrição DEFAULT</h3>
                        <p>A palavra-chave DEFAULT aciona o valor padrão definido na tabela.</p>
                    </div>
                    <div class="codigo-sql">INSERT INTO Produto (nome_produto, descricao, preco_base, peso_gramas, status_venda)<br>VALUES ('Mousepad Básico', 'Mousepad em tecido', 15.00, 100, DEFAULT);</div>
                    <p class="erro-mensagem"><i data-lucide="check" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> O campo 'status_venda' receberá 'Ativo'.</p>
                </div>

                <div class="card-violacao">
                    <div>
                        <span class="badge-erro"><i data-lucide="x-circle" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> 3. Erro esperado</span>
                        <h3>CHECK com lista permitida</h3>
                        <p>O status do pedido precisa estar no conjunto permitido.</p>
                    </div>
                    <div class="codigo-sql">INSERT INTO Pedido (id_cliente, data_pedido, valor_total, status_pedido) VALUES (1, '2026-06-25', 150.00, 'Cancelado');</div>
                    <p class="erro-mensagem"><i data-lucide="alert-triangle" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Falha na restrição de verificação: 'Cancelado' não é um status permitido.</p>
                </div>

                <div class="card-violacao">
                    <div>
                        <span class="badge-erro"><i data-lucide="x-circle" style="width:12px;height:12px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> 4. Erro esperado</span>
                        <h3>UNIQUE em CPF</h3>
                        <p>Dois clientes não podem compartilhar o mesmo CPF.</p>
                    </div>
                    <div class="codigo-sql">INSERT INTO Cliente (nome_completo, cpf, email, telefone) VALUES ('Maria Souza', '12345678901'...<br>INSERT INTO Cliente (nome_completo, cpf, email, telefone) VALUES ('Pedro Paulo', '12345678901'...</div>
                    <p class="erro-mensagem"><i data-lucide="alert-triangle" style="width:14px;height:14px;display:inline-block;vertical-align:middle;margin-right:4px;"></i> Violação de chave única: CPF duplicado.</p>
                </div>
            </div>
        `;
        lucide.createIcons();
    }
    // Questão 6 — visualizador de tabelas populadas
    else if (questao === 'q6') {
        titulo.innerHTML = '<div class="label-topo">TABELAS POPULADAS</div>Visualizador de inserts';
        subtitulo.innerText = "As amostras abaixo resumem o conteúdo inserido nas tabelas do banco.";

        areaDados.innerHTML = `
            <div class="grupo-botoes">
                <div class="pill-container">
                    <button class="pill-btn ativo" onclick="renderizarTabelaQ6('Cliente', this)">Cliente</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Produto', this)">Produto</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Categoria', this)">Categoria</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Fornecedor', this)">Fornecedor</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Transportadora', this)">Transportadora</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Armazem', this)">Armazem</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Pedido', this)">Pedido</button>
                </div>
                <div class="pill-container fracas">
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Endereco_Entrega', this)">Endereco_Entrega</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Imagem_Produto', this)">Imagem_Produto</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Atualizacao_Rastreio', this)">Atualizacao_Rastreio</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Fatura_Pagamento', this)">Fatura_Pagamento</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Cartao_Salvo', this)">Cartao_Salvo</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Item_Pedido', this)">Item_Pedido</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Produto_Categoria', this)">Produto_Categoria</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Fornecimento', this)">Fornecimento</button>
                    <button class="pill-btn" onclick="renderizarTabelaQ6('Estoque_Armazem', this)">Estoque_Armazem</button>
                </div>
            </div>
            
            <div class="card">
                <div id="area-amostra-tabela" class="table-wrapper">
                </div>
            </div>
        `;

        renderizarTabelaQ6('Cliente', document.querySelector('.pill-btn.ativo'));
    }
    // Questões 7 a 14 — busca os dados e monta a tabela
    else if (questao === 'q7') {
        titulo.innerText = "Questão 7: INNER JOIN";
        subtitulo.innerText = "Clientes, Pedidos e Transportadoras associadas.";
        buscarEDesenharTabela('http://localhost:5000/api/q7', queries.q7, ['Nome Cliente', 'ID Pedido', 'Transportadora'], ['nome_cliente', 'id_pedido', 'nome_transportadora']);
    }
    else if (questao === 'q8') {
        titulo.innerText = "Questão 8: LEFT JOIN";
        subtitulo.innerText = "Produtos e seus respectivos estoques nos armazéns.";
        buscarEDesenharTabela('http://localhost:5000/api/q8', queries.q8, ['Nome do Produto', 'Cód. Filial', 'Qtd. Disponível'], ['nome_produto', 'codigo_filial', 'quantidade_disponivel']);
    }
    else if (questao === 'q9') {
        titulo.innerText = "Questão 9: RIGHT JOIN";
        subtitulo.innerText = "Pedidos garantidos, junto com dados do cliente.";
        buscarEDesenharTabela('http://localhost:5000/api/q9', queries.q9, ['Nome Completo', 'ID Pedido', 'Valor Total (R$)'], ['nome_completo', 'id_pedido', 'valor_total']);
    }
    else if (questao === 'q10') {
        titulo.innerText = "Questão 10: FULL JOIN";
        subtitulo.innerText = "Fornecedores e produtos (incluindo órfãos).";
        buscarEDesenharTabela('http://localhost:5000/api/q10', queries.q10, ['Razão Social', 'Nome Produto'], ['razao_social', 'nome_produto']);
    }
    else if (questao === 'q11') {
        titulo.innerText = "Questão 11: GROUP BY e HAVING";
        subtitulo.innerText = "Clientes com gastos totais superiores a R$ 500,00.";
        buscarEDesenharTabela('http://localhost:5000/api/q11', queries.q11, ['Nome Cliente', 'ID Cliente', 'Total Gasto (R$)'], ['nome_completo', 'id_cliente', 'total_gasto']);
    }
    else if (questao === 'q12') {
        titulo.innerText = "Questão 12: UNION";
        subtitulo.innerText = "Lista consolidada de e-mails (Clientes e Fornecedores).";
        buscarEDesenharTabela('http://localhost:5000/api/q12', queries.q12, ['Nome de Contato', 'E-mail', 'Tipo de Vínculo'], ['nome_contato', 'email_contato', 'tipo_contato']);
    }
    else if (questao === 'q13') {
        titulo.innerText = "Questão 13: INTERSECT";
        subtitulo.innerText = "Produtos categorizados E já fornecidos.";
        buscarEDesenharTabela('http://localhost:5000/api/q13', queries.q13, ['ID Produto', 'Nome Produto'], ['id_produto', 'nome_produto']);
    }
    else if (questao === 'q14') {
        titulo.innerText = "Questão 14: EXCEPT";
        subtitulo.innerText = "Produtos que nunca foram comprados em nenhum pedido.";
        buscarEDesenharTabela('http://localhost:5000/api/q14', queries.q14, ['ID Produto', 'Nome Produto'], ['id_produto', 'nome_produto']);
    }
}

// Inicializa os ícones e carrega a tela inicial
document.addEventListener('DOMContentLoaded', () => {
    lucide.createIcons();
    document.querySelector('#menu-lista li.ativo').click();
});

// Puxa os dados de uma tabela específica e monta a amostra (Q6)
function renderizarTabelaQ6(nomeTabela, elementoBotao) {
    const botoes = document.querySelectorAll('.pill-btn');
    botoes.forEach(btn => btn.classList.remove('ativo'));
    if (elementoBotao) elementoBotao.classList.add('ativo');

    const areaAmostra = document.getElementById('area-amostra-tabela');

    areaAmostra.innerHTML = `
        <div class="header-tabela-amostra">
            <h3>${nomeTabela}</h3>
            <p>Buscando dados no PostgreSQL...</p>
        </div>
    `;

    fetch(`http://localhost:5000/api/tabela/${nomeTabela.toLowerCase()}`)
        .then(response => response.json())
        .then(dados => {
            if (dados.erro) {
                areaAmostra.innerHTML = `<p style="color: var(--danger); padding: 20px;">erro ao conectar a api</p>`;
                return;
            }

            let htmlHeaders = dados.headers.map(h => `<th>${h}</th>`).join('');
            let htmlRows = dados.rows.map(row => {
                let colunasHtml = dados.headers.map(h => {
                    let valor = row[h] !== null ? row[h] : '<span style="color: var(--text-muted)">NULL</span>';

                    // Formata colunas monetárias
                    if (h === 'PRECO_BASE' || h === 'VALOR_TOTAL' || h === 'VALOR_PARCELA' || h === 'TAXA_BASE_FRETE') {
                        if (!isNaN(parseFloat(valor))) {
                            valor = formatarMoeda(valor);
                        }
                    }

                    return `<td>${valor}</td>`;
                }).join('');
                return `<tr>${colunasHtml}</tr>`;
            }).join('');

            areaAmostra.innerHTML = `
                <div class="header-tabela-amostra">
                    <div>
                        <h3>Amostra: ${nomeTabela}</h3>
                        <p>Total de registros encontrados: <strong>${dados.rows.length}</strong></p>
                    </div>
                </div>
                <table class="tabela-profissional" style="min-width: 600px;">
                    <thead>
                        <tr>${htmlHeaders}</tr>
                    </thead>
                    <tbody>
                        ${htmlRows}
                    </tbody>
                </table>
            `;
            lucide.createIcons();
        })
        .catch(erro => {
            areaAmostra.innerHTML = `<p style="color: var(--danger); padding: 20px;">erro ao conectar a api</p>`;
        });
}