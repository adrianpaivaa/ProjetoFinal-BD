// ==========================================
// Lógica do Tema (Claro / Escuro)
// ==========================================
const btnTheme = document.getElementById('theme-toggle');
const iconSun = document.getElementById('icon-sun');
const iconMoon = document.getElementById('icon-moon');

if (localStorage.getItem('theme') === 'dark') {
    document.body.classList.add('dark-mode');
    iconSun.style.display = 'none';
    iconMoon.style.display = 'block';
}

function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    if (document.body.classList.contains('dark-mode')) {
        iconSun.style.display = 'none';
        iconMoon.style.display = 'block';
        localStorage.setItem('theme', 'dark');
    } else {
        iconSun.style.display = 'block';
        iconMoon.style.display = 'none';
        localStorage.setItem('theme', 'light');
    }
}

// ==========================================
// Função Auxiliar para Requisições e Tabelas
// ==========================================
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
                areaDados.innerHTML = `<div class="card"><p style="color: red;">Erro no Banco: ${dados.erro}</p></div>`;
                return;
            }

            let linhas = '';
            dados.forEach(item => {
                linhas += '<tr>';
                campos_json.forEach(campo => {
                    let valor = item[campo] !== null ? item[campo] : '<span style="color:#94a3b8">Nenhum</span>';
                    linhas += `<td>${valor}</td>`;
                });
                linhas += '</tr>';
            });

            let thead = headers.map(h => `<th>${h}</th>`).join('');

            areaDados.innerHTML = `
                <div class="card">
                    <div class="codigo-sql">${query_sql}</div>
                    <table class="tabela-profissional">
                        <thead><tr>${thead}</tr></thead>
                        <tbody>${linhas}</tbody>
                    </table>
                </div>
            `;
        })
        .catch(erro => {
            areaDados.innerHTML = `<div class="card"><p style="color: red;">Erro ao conectar com a API: ${erro}</p></div>`;
        });
}

// ==========================================
// Navegação do Dashboard
// ==========================================
function carregarConteudo(questao) {
    const itensMenu = document.querySelectorAll('#menu-lista li');
    itensMenu.forEach(item => item.classList.remove('ativo'));
    event.currentTarget.classList.add('ativo');

    const titulo = document.getElementById('titulo-pagina');
    const subtitulo = document.getElementById('subtitulo-pagina');
    const areaDados = document.getElementById('area-dados');

    // Mapeamento das queries atualizadas
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

    if (questao === 'inicio') {
        titulo.innerText = "Visão Geral";
        subtitulo.innerText = "Dashboard com métricas principais do banco de dados.";
        areaDados.innerHTML = `
            <div class="dashboard-grid">
                <div class="card metric-card">
                    <div class="metric-icon">👥</div>
                    <h3>Clientes</h3>
                    <p class="numero">11</p>
                </div>
                <div class="card metric-card">
                    <div class="metric-icon">📦</div>
                    <h3>Produtos</h3>
                    <p class="numero">15</p>
                </div>
                <div class="card metric-card">
                    <div class="metric-icon">📋</div>
                    <h3>Pedidos</h3>
                    <p class="numero">10</p>
                </div>
                <div class="card metric-card">
                    <div class="metric-icon">🏪</div>
                    <h3>Armazéns</h3>
                    <p class="numero">3</p>
                </div>
                <div class="card metric-card">
                    <div class="metric-icon">🚚</div>
                    <h3>Transportadoras</h3>
                    <p class="numero">4</p>
                </div>
                <div class="card metric-card">
                    <div class="metric-icon">🏢</div>
                    <h3>Fornecedores</h3>
                    <p class="numero">5</p>
                </div>
            </div>
            <div class="card info-card">
                <h3>Como Usar</h3>
                <p>Navegue pelas <strong>Consultas SQL</strong> no menu lateral para visualizar queries relacionadas a diferentes operações de banco de dados. Cada seção contém o script SQL e seus respectivos resultados em tempo real.</p>
                <div class="consultas-grid">
                    <div class="consulta-item">
                        <strong>Q7 - Q10</strong>
                        <span>Operações de JOIN</span>
                    </div>
                    <div class="consulta-item">
                        <strong>Q11 - Q14</strong>
                        <span>Agregação e Set Operations</span>
                    </div>
                    <div class="consulta-item">
                        <strong>Q5 - Q6</strong>
                        <span>Integridade e Visualização</span>
                    </div>
                </div>
            </div>
        `;
    }
    else if (questao === 'q5') {
        document.getElementById('titulo-pagina').innerHTML = '<div class="label-topo">INTEGRIDADE DO BANCO</div>Erros esperados e Comportamentos';
        subtitulo.innerText = "Exemplos de violações de restrições e demonstração de valores padrão.";

        areaDados.innerHTML = `
            <div class="violacoes-grid">
                <div class="card-violacao">
                    <div>
                        <span class="badge-erro">1. Erro esperado</span>
                        <h3>CHECK simples</h3>
                        <p>Preço base precisa ser maior que zero.</p>
                    </div>
                    <div class="codigo-sql">INSERT INTO Produto (nome_produto, descricao, preco_base, peso_gramas) VALUES ('Teclado', 'Teclado Mecânico', -50.00, 800);</div>
                    <p class="erro-mensagem">Falha na restrição de verificação: o banco impede preço negativo.</p>
                </div>
                
                <div class="card-violacao" style="border-left-color: #10b981;">
                    <div>
                        <span class="badge-erro" style="background-color: #d1fae5; color: #059669;">2. Sucesso esperado</span>
                        <h3>Demonstração da Restrição DEFAULT</h3>
                        <p>A palavra-chave DEFAULT aciona o valor padrão definido na tabela.</p>
                    </div>
                    <div class="codigo-sql">INSERT INTO Produto (nome_produto, descricao, preco_base, peso_gramas, status_venda)<br>VALUES ('Mousepad Básico', 'Mousepad em tecido', 15.00, 100, DEFAULT);</div>
                    <p class="erro-mensagem"> O campo 'status_venda' receberá 'Ativo'.</p>
                </div>

                <div class="card-violacao">
                    <div>
                        <span class="badge-erro">3. Erro esperado</span>
                        <h3>CHECK com lista permitida</h3>
                        <p>O status do pedido precisa estar no conjunto permitido.</p>
                    </div>
                    <div class="codigo-sql">INSERT INTO Pedido (id_cliente, data_pedido, valor_total, status_pedido) VALUES (1, '2026-06-25', 150.00, 'Cancelado');</div>
                    <p class="erro-mensagem">Falha na restrição de verificação: 'Cancelado' não é um status permitido.</p>
                </div>

                <div class="card-violacao">
                    <div>
                        <span class="badge-erro">4. Erro esperado</span>
                        <h3>UNIQUE em CPF</h3>
                        <p>Dois clientes não podem compartilhar o mesmo CPF.</p>
                    </div>
                    <div class="codigo-sql">INSERT INTO Cliente (nome_completo, cpf, email, telefone) VALUES ('Maria Souza', '12345678901'...<br>INSERT INTO Cliente (nome_completo, cpf, email, telefone) VALUES ('Pedro Paulo', '12345678901'...</div>
                    <p class="erro-mensagem">Violação de chave única: CPF duplicado.</p>
                </div>
            </div>
        `;
    }
    else if (questao === 'q6') {
        document.getElementById('titulo-pagina').innerHTML = '<div class="label-topo">TABELAS POPULADAS</div>Visualizador de inserts';
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
            
            <div class="card" id="area-amostra-tabela" style="overflow-x: auto;">
            </div>
        `;

        renderizarTabelaQ6('Cliente', document.querySelector('.pill-btn.ativo'));
    }
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

document.addEventListener('DOMContentLoaded', () => {
    document.querySelector('#menu-lista li.ativo').click();
});

// ==========================================
// Lógica Exclusiva da Questão 6 (Visualizador API)
// ==========================================
function renderizarTabelaQ6(nomeTabela, elementoBotao) {
    const botoes = document.querySelectorAll('.pill-btn');
    botoes.forEach(btn => btn.classList.remove('ativo'));
    if (elementoBotao) elementoBotao.classList.add('ativo');

    const areaAmostra = document.getElementById('area-amostra-tabela');

    // Mostra estado de carregamento
    areaAmostra.innerHTML = `
        <div class="header-tabela-amostra">
            <h3>${nomeTabela}</h3>
            <p>Buscando dados no PostgreSQL...</p>
        </div>
    `;

    // Faz a requisição dinâmica para a nova rota do Python
    fetch(`http://localhost:5000/api/tabela/${nomeTabela.toLowerCase()}`)
        .then(response => response.json())
        .then(dados => {
            if (dados.erro) {
                areaAmostra.innerHTML += `<p style="color: red; padding: 20px;">Erro: ${dados.erro}</p>`;
                return;
            }

            // Monta os cabeçalhos (TH) dinamicamente
            let htmlHeaders = dados.headers.map(h => `<th>${h}</th>`).join('');

            // Monta as linhas (TR e TD) dinamicamente
            let htmlRows = dados.rows.map(row => {
                let colunasHtml = dados.headers.map(h => {
                    let valor = row[h] !== null ? row[h] : '<span style="color:#94a3b8">NULL</span>';
                    return `<td>${valor}</td>`;
                }).join('');
                return `<tr>${colunasHtml}</tr>`;
            }).join('');

            // Injeta a tabela pronta
            areaAmostra.innerHTML = `
                <div class="header-tabela-amostra">
                    <h3>${nomeTabela}</h3>
                    <p>Total de registros encontrados: ${dados.rows.length}</p>
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
        })
        .catch(erro => {
            areaAmostra.innerHTML += `<p style="color: red; padding: 20px;">Erro na comunicação com a API: ${erro}</p>`;
        });
}