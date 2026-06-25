from flask import Flask, jsonify
from flask_cors import CORS
import psycopg2

app = Flask(__name__)
CORS(app)

# Conexão com o PostgreSQL
def get_db_connection():
    return psycopg2.connect(
        host="localhost",
        database="ProjetoFinal", 
        user="postgres",               
        password="123456",          
        port="5432"
    )

# Executar uma query e retorna o resultado como JSON
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
                valor = row[i]
                # Converter date e Decimal pra string
                if valor is not None and type(valor).__name__ in ('date', 'Decimal'):
                    valor = str(valor)
                linha_dict[coluna] = valor
            resultados.append(linha_dict)
            
        cur.close()
        conn.close()
        return jsonify(resultados) # Retornar os dados como JSON pro frontend
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# Questão 7 — INNER JOIN: cruza Cliente, Pedido e Transportadora
@app.route('/api/q7', methods=['GET'])
def q7_inner_join():
    query = """
    SELECT c.nome_completo AS nome_cliente, p.id_pedido, t.nome_fantasia AS nome_transportadora
    FROM Cliente c
    INNER JOIN Pedido p ON c.id_cliente = p.id_cliente
    INNER JOIN Transportadora t ON p.id_transportadora = t.id_transportadora;
    """
    return execute_query(query, ["nome_cliente", "id_pedido", "nome_transportadora"])

# Questão 8 — LEFT JOIN: mostra todos os produtos, mesmo os sem estoque
@app.route('/api/q8', methods=['GET'])
def q8_left_join():
    query = """
    SELECT prod.nome_produto, arm.codigo_filial, est.quantidade_disponivel
    FROM Produto prod
    LEFT JOIN Estoque_Armazem est ON prod.id_produto = est.id_produto
    LEFT JOIN Armazem arm ON est.id_armazem = arm.id_armazem;
    """
    return execute_query(query, ["nome_produto", "codigo_filial", "quantidade_disponivel"])

# Questão 9 — RIGHT JOIN: mostra todos os clientes, mesmo sem pedido
@app.route('/api/q9', methods=['GET'])
def q9_right_join():
    query = """
    SELECT c.nome_completo, p.id_pedido, p.valor_total
    FROM Pedido p
    RIGHT JOIN Cliente c ON p.id_cliente = c.id_cliente;
    """
    return execute_query(query, ["nome_completo", "id_pedido", "valor_total"])

# Questão 10 — FULL JOIN: mostra fornecedores e produtos, incluindo todos
@app.route('/api/q10', methods=['GET'])
def q10_full_join():
    query = """
    SELECT f.razao_social, p.nome_produto
    FROM Fornecedor f
    FULL JOIN Fornecimento fn ON f.id_fornecedor = fn.id_fornecedor
    FULL JOIN Produto p ON fn.id_produto = p.id_produto;
    """
    return execute_query(query, ["razao_social", "nome_produto"])

# Questão 11 — GROUP BY + HAVING: soma gastos por cliente, e filtra os maiores que R$500
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

# Questão 12 — UNION: junta e-mails de Clientes e Fornecedores
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

# Questão 13 — INTERSECT: produtos que têm categoria E são fornecidos
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

# Questão 14 — EXCEPT: produtos que nunca foram comprados
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

# Rota pra puxar todos os dados de uma tabela pela url
@app.route('/api/tabela/<nome_tabela>', methods=['GET'])
def get_tabela_completa(nome_tabela):
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Busca os nomes das colunas da tabela
        cur.execute(f"SELECT column_name FROM information_schema.columns WHERE table_name = '{nome_tabela.lower()}' ORDER BY ordinal_position;")
        colunas = [row[0].upper() for row in cur.fetchall()]
        
        # Puxa todas as linhas da tabela
        cur.execute(f"SELECT * FROM {nome_tabela.lower()}")
        rows = cur.fetchall()
        
        resultados = []
        for row in rows:
            linha_dict = {}
            for i, coluna in enumerate(colunas):
                valor = row[i]
                if valor is not None and type(valor).__name__ in ('date', 'datetime', 'Decimal'):
                    valor = str(valor)
                linha_dict[coluna] = valor
            resultados.append(linha_dict)
            
        cur.close()
        conn.close()
        
        return jsonify({"headers": colunas, "rows": resultados})
        
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

# Rotas do Dashboard
@app.route('/api/dashboard_stats', methods=['GET'])
def get_dashboard_stats():
    try:
        conn = get_db_connection()
        cur = conn.cursor()
        
        # Contar os registros em cada tabela
        cur.execute("SELECT COUNT(*) FROM Cliente")
        clientes = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM Produto")
        produtos = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM Pedido")
        pedidos = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM Armazem")
        armazens = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM Transportadora")
        transportadoras = cur.fetchone()[0]
        
        cur.execute("SELECT COUNT(*) FROM Fornecedor")
        fornecedores = cur.fetchone()[0]
        
        # Calcula o faturamento
        cur.execute("SELECT COALESCE(SUM(valor_total), 0) FROM Pedido")
        faturamento = float(cur.fetchone()[0])
        
        # Calcula o ticket médio
        cur.execute("SELECT COALESCE(AVG(valor_total), 0) FROM Pedido")
        ticket_medio = float(cur.fetchone()[0])
        
        # Puxa os 5 pedidos mais recentes
        cur.execute("""
            SELECT p.id_pedido, c.nome_completo, p.data_pedido, p.valor_total, p.status_pedido
            FROM Pedido p
            JOIN Cliente c ON p.id_cliente = c.id_cliente
            ORDER BY p.data_pedido DESC, p.id_pedido DESC
            LIMIT 5
        """)
        rows = cur.fetchall()
        recent_orders = []
        for r in rows:
            recent_orders.append({
                "id_pedido": r[0],
                "nome_cliente": r[1],
                "data_pedido": str(r[2]),
                "valor_total": float(r[3]),
                "status_pedido": r[4]
            })
            
        cur.close()
        conn.close()
        
        # Retorna tudo como JSON pro frontend montar o dashboard
        return jsonify({
            "status": "connected",
            "clientes": clientes,
            "produtos": produtos,
            "pedidos": pedidos,
            "armazens": armazens,
            "transportadoras": transportadoras,
            "fornecedores": fornecedores,
            "faturamento": faturamento,
            "ticket_medio": round(ticket_medio, 2),
            "recent_orders": recent_orders
        })
    except Exception as e:
        return jsonify({"erro": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
