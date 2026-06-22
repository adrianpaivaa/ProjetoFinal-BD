from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
# Habilita o CORS para permitir requisições do frontend
CORS(app)

# ==========================================
# Configuração da Conexão
# ==========================================
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="ProjetoFinal", 
        user="postgres",               
        password="123456",          
        port="5432"
    )

# Função auxiliar para rodar a query e formatar os dados
def execute_query(query, colunas):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        cur.execute(query)
        rows = cur.fetchall()
        
        resultados = []
        for row in rows:
            linha_dict = {}
            for i, coluna in enumerate(colunas):
                # Converte os dados se não forem nulos
                valor = row[i]
                if valor is not None:
                    # Se for data ou decimal, converte para string
                    if type(valor).__name__ in ('date', 'Decimal'):
                        valor = str(valor)
                linha_dict[coluna] = valor
            resultados.append(linha_dict)
            
        cur.close()
        conn.close()
        return jsonify(resultados)
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# ==========================================
# Rotas das Consultas SQL
# ==========================================

@app.route('/api/q7', methods=['GET'])
def q7_inner_join():
    query = """
    SELECT c.nome_completo AS nome_cliente, p.id_pedido, t.nome_fantasia AS nome_transportadora
    FROM Cliente c
    INNER JOIN Pedido p ON c.id_cliente = p.id_cliente
    INNER JOIN Transportadora t ON p.id_transportadora = t.id_transportadora;
    """
    # Atualizado com as novas colunas da Transportadora
    return execute_query(query, ["nome_cliente", "id_pedido", "nome_transportadora"])

@app.route('/api/q8', methods=['GET'])
def q8_left_join():
    query = """
    SELECT prod.nome_produto, arm.codigo_filial, est.quantidade_disponivel
    FROM Produto prod
    LEFT JOIN Estoque_Armazem est ON prod.id_produto = est.id_produto
    LEFT JOIN Armazem arm ON est.id_armazem = arm.id_armazem;
    """
    # Atualizado com as novas colunas de Estoque e Armazém
    return execute_query(query, ["nome_produto", "codigo_filial", "quantidade_disponivel"])

@app.route('/api/q9', methods=['GET'])
def q9_right_join():
    query = """
    SELECT c.nome_completo, p.id_pedido, p.valor_total
    FROM Pedido p
    RIGHT JOIN Cliente c ON p.id_cliente = c.id_cliente;
    """
    return execute_query(query, ["nome_completo", "id_pedido", "valor_total"])

@app.route('/api/q10', methods=['GET'])
def q10_full_join():
    query = """
    SELECT f.razao_social, p.nome_produto
    FROM Fornecedor f
    FULL JOIN Fornecimento fn ON f.id_fornecedor = fn.id_fornecedor
    FULL JOIN Produto p ON fn.id_produto = p.id_produto;
    """
    return execute_query(query, ["razao_social", "nome_produto"])

@app.route('/api/q11', methods=['GET'])
def q11_group_by():
    query = """
    SELECT c.nome_completo, p.id_cliente, SUM(p.valor_total) AS total_gasto
    FROM Pedido p
    INNER JOIN Cliente c ON p.id_cliente = c.id_cliente
    GROUP BY p.id_cliente, c.nome_completo
    HAVING SUM(p.valor_total) > 500.00
    ORDER BY total_gasto DESC;
    """
    return execute_query(query, ["nome_completo", "id_cliente", "total_gasto"])

@app.route('/api/q12', methods=['GET'])
def q12_union():
    query = """
    SELECT nome_completo AS nome_contato, email AS email_contato, 'Cliente' AS tipo_contato
    FROM Cliente
    UNION
    SELECT razao_social, email_contato, 'Fornecedor'
    FROM Fornecedor;
    """
    return execute_query(query, ["nome_contato", "email_contato", "tipo_contato"])

@app.route('/api/q13', methods=['GET'])
def q13_intersect():
    query = """
    SELECT p.id_produto, p.nome_produto 
    FROM Produto p
    INNER JOIN Produto_Categoria pc ON p.id_produto = pc.id_produto
    INTERSECT
    SELECT p.id_produto, p.nome_produto 
    FROM Produto p
    INNER JOIN Fornecimento f ON p.id_produto = f.id_produto
    ORDER BY id_produto ASC;
    """
    return execute_query(query, ["id_produto", "nome_produto"])

@app.route('/api/q14', methods=['GET'])
def q14_except():
    query = """
    SELECT id_produto, nome_produto 
    FROM Produto
    EXCEPT
    SELECT p.id_produto, p.nome_produto 
    FROM Produto p
    INNER JOIN Item_Pedido ip ON p.id_produto = ip.id_produto;
    """
    return execute_query(query, ["id_produto", "nome_produto"])

# ==========================================
# Rota Dinâmica para a Questão 6 (Visualizador)
# ==========================================

TABELAS_PERMITIDAS = [
    'cliente', 'produto', 'categoria', 'fornecedor', 'transportadora', 
    'armazem', 'pedido', 'endereco_entrega', 'imagem_produto', 
    'atualizacao_rastreio', 'fatura_pagamento', 'cartao_salvo', 
    'item_pedido', 'produto_categoria', 'fornecimento', 'estoque_armazem'
]

@app.route('/api/tabela/<nome_tabela>', methods=['GET'])
def get_tabela_completa(nome_tabela):
    # Proteção contra SQL Injection
    if nome_tabela.lower() not in TABELAS_PERMITIDAS:
        return jsonify({"erro": "Tabela não autorizada ou inexistente"}), 403

    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # 1. Descobre o nome das colunas dinamicamente direto do PostgreSQL
        cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{nome_tabela.lower()}' ORDER BY ordinal_position;")
        colunas = [row[0].upper() for row in cur.fetchall()]
        
        # 2. Busca todos os dados da tabela solicitada
        query = f"SELECT * FROM {nome_tabela.lower()}"
        cur.execute(query)
        rows = cur.fetchall()
        
        # 3. Monta a resposta
        resultados = []
        for row in rows:
            linha_dict = {}
            for i, coluna in enumerate(colunas):
                valor = row[i]
                # Converte datas, timestamps e decimais para string
                if valor is not None and type(valor).__name__ in ('date', 'datetime', 'Decimal'):
                    valor = str(valor)
                linha_dict[coluna] = valor
            resultados.append(linha_dict)
            
        cur.close()
        conn.close()
        
        # Devolve para o JS os nomes das colunas + os dados reais
        return jsonify({"headers": colunas, "rows": resultados})
        
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
