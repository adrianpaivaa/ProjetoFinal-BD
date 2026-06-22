-- TABELAS FORTES (7 Tabelas)

CREATE TABLE Cliente (
    id_cliente SERIAL PRIMARY KEY,
    nome_completo VARCHAR(150) NOT NULL,
    cpf VARCHAR(14) UNIQUE NOT NULL,                 -- Restrição UNIQUE
    email VARCHAR(100) UNIQUE NOT NULL,
    telefone VARCHAR(20),
    data_cadastro DATE DEFAULT CURRENT_DATE          -- Restrição DEFAULT
);

CREATE TABLE Produto (
    id_produto SERIAL PRIMARY KEY,
    nome_produto VARCHAR(100) NOT NULL,
    descricao TEXT,
    preco_base NUMERIC(10,2) CHECK (preco_base > 0), -- Restrição CHECK simples
    peso_gramas INT,
    status_venda VARCHAR(20) DEFAULT 'Ativo'
);

CREATE TABLE Categoria (
    id_categoria SERIAL PRIMARY KEY,
    nome_categoria VARCHAR(50) UNIQUE NOT NULL,
    descricao TEXT
);

CREATE TABLE Fornecedor (
    id_fornecedor SERIAL PRIMARY KEY,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    razao_social VARCHAR(150) NOT NULL,
    email_contato VARCHAR(100)
);

CREATE TABLE Transportadora (
    id_transportadora SERIAL PRIMARY KEY,
    cnpj VARCHAR(20) UNIQUE NOT NULL,
    nome_fantasia VARCHAR(100) NOT NULL,
    taxa_base_frete NUMERIC(10,2) CHECK (taxa_base_frete >= 0)
);

CREATE TABLE Armazem (
    id_armazem SERIAL PRIMARY KEY,
    codigo_filial VARCHAR(20) UNIQUE NOT NULL,
    cep VARCHAR(10) NOT NULL,
    capacidade_m3 NUMERIC(10,2)
);

CREATE TABLE Pedido (
    id_pedido SERIAL PRIMARY KEY,
    id_cliente INT NOT NULL REFERENCES Cliente(id_cliente),
    id_transportadora INT REFERENCES Transportadora(id_transportadora),
    data_pedido DATE NOT NULL,
    valor_total NUMERIC(10,2) CHECK (valor_total >= 0),
    status_pedido VARCHAR(20) CHECK (status_pedido IN ('Pendente', 'Pago', 'Enviado', 'Entregue'))
);

-- TABELAS FRACAS (5 Tabelas - Chaves Compostas)

CREATE TABLE Endereco_Entrega (
    id_cliente INT REFERENCES Cliente(id_cliente),
    sequencial_endereco INT,
    cep VARCHAR(10) NOT NULL,
    logradouro VARCHAR(150) NOT NULL,
    numero VARCHAR(10) NOT NULL,
    complemento VARCHAR(50),
    apelido VARCHAR(30),
    PRIMARY KEY (id_cliente, sequencial_endereco)
);

CREATE TABLE Imagem_Produto (
    id_produto INT REFERENCES Produto(id_produto),
    sequencial_imagem INT,
    url_imagem VARCHAR(255) NOT NULL,
    is_principal BOOLEAN DEFAULT FALSE,
    PRIMARY KEY (id_produto, sequencial_imagem)
);

CREATE TABLE Atualizacao_Rastreio (
    id_pedido INT REFERENCES Pedido(id_pedido),
    data_hora_atualizacao TIMESTAMP NOT NULL,
    status_rastreio VARCHAR(50) NOT NULL,
    localizacao_atual VARCHAR(100),
    PRIMARY KEY (id_pedido, data_hora_atualizacao)
);

CREATE TABLE Fatura_Pagamento (
    id_pedido INT REFERENCES Pedido(id_pedido),
    numero_parcela INT,
    valor_parcela NUMERIC(10,2) NOT NULL,
    data_vencimento DATE NOT NULL,
    status_pagamento VARCHAR(20) DEFAULT 'Pendente',
    PRIMARY KEY (id_pedido, numero_parcela)
);

CREATE TABLE Cartao_Salvo (
    id_cliente INT REFERENCES Cliente(id_cliente),
    ultimos_quatro_digitos VARCHAR(4),
    nome_titular VARCHAR(100) NOT NULL,
    data_validade VARCHAR(5) NOT NULL,
    PRIMARY KEY (id_cliente, ultimos_quatro_digitos)
);

-- TABELAS ASSOCIATIVAS (4 Tabelas)

-- 1. Relacionamento com atributos próprios (Exigência da Questão 01)
CREATE TABLE Item_Pedido (
    id_pedido INT REFERENCES Pedido(id_pedido),
    id_produto INT REFERENCES Produto(id_produto),
    quantidade INT CHECK (quantidade > 0),
    preco_unitario NUMERIC(10,2) NOT NULL,
    PRIMARY KEY (id_pedido, id_produto)
);

-- 2. Associação simples N:M
CREATE TABLE Produto_Categoria (
    id_produto INT REFERENCES Produto(id_produto),
    id_categoria INT REFERENCES Categoria(id_categoria),
    PRIMARY KEY (id_produto, id_categoria)
);

-- 3. Associação simples N:M
CREATE TABLE Fornecimento (
    id_fornecedor INT REFERENCES Fornecedor(id_fornecedor),
    id_produto INT REFERENCES Produto(id_produto),
    PRIMARY KEY (id_fornecedor, id_produto)
);

-- 4. Associação N:M com atributo (Produto e Armazém)
CREATE TABLE Estoque_Armazem (
    id_produto INT REFERENCES Produto(id_produto),
    id_armazem INT REFERENCES Armazem(id_armazem),
    quantidade_disponivel INT CHECK (quantidade_disponivel >= 0),
    PRIMARY KEY (id_produto, id_armazem)
);

-- Questão 5 (ERROS E COMPORTAMENTOS)
-- 1. Violação da Restrição CHECK simples (Preço Base > 0)
-- Erro esperado: falha na restrição de verificação (check_constraint)
INSERT INTO Produto (nome_produto, descricao, preco_base, peso_gramas) 
VALUES ('Teclado', 'Teclado Mecânico', -50.00, 800);

-- 2. Demonstração da Restrição DEFAULT
-- Resultado esperado: Inserção com sucesso. O campo 'status_venda' receberá 'Ativo'.
INSERT INTO Produto (nome_produto, descricao, preco_base, peso_gramas, status_venda) 
VALUES ('Mousepad Básico', 'Mousepad em tecido', 15.00, 100, DEFAULT);

-- 3. Violação da Restrição CHECK baseado em lista (status_pedido IN (...))
-- Erro esperado: falha na restrição de verificação
INSERT INTO Pedido (id_cliente, data_pedido, valor_total, status_pedido) 
VALUES (1, '2026-06-25', 150.00, 'Cancelado');

-- 4. Violação da Restrição UNIQUE (CPF único)
-- Erro esperado: violação de chave única (duplicate key value)
INSERT INTO Cliente (nome_completo, cpf, email, telefone) VALUES ('Maria Souza', '12345678901', 'maria@email.com', '11999998888');
INSERT INTO Cliente (nome_completo, cpf, email, telefone) VALUES ('Pedro Paulo', '12345678901', 'pedro@email.com', '11999997777');

-- Limpa os dados das tabelas e reseta a contagem dos IDs para 1 (Prevenção de falhas nos inserts)
TRUNCATE TABLE Cliente RESTART IDENTITY CASCADE;
TRUNCATE TABLE Produto RESTART IDENTITY CASCADE;

-- Questão 6 (Inserções)

-- 1. Cliente
INSERT INTO Cliente (nome_completo, cpf, email, telefone) VALUES 
('Ana Clara', '11111111111', 'ana@email.com', '37999990001'),
('Bruno Mendes', '22222222222', 'bruno@email.com', '37999990002'),
('Carlos Dias', '33333333333', 'carlos@email.com', '37999990003'),
('Daniela Silva', '44444444444', 'daniela@email.com', '37999990004'),
('Eduardo Costa', '55555555555', 'eduardo@email.com', '37999990005'),
('Fernanda Lima', '66666666666', 'fernanda@email.com', '37999990006'),
('Gustavo Reis', '77777777777', 'gustavo@email.com', '37999990007'),
('Helena Gomes', '88888888888', 'helena@email.com', '37999990008'),
('Igor Santos', '99999999999', 'igor@email.com', '37999990009'),
('Julia Alves', '10101010101', 'julia@email.com', '37999990010'),
('Cliente Sem Compra', '00000000000', 'semcompra@email.com', '1100000000');

-- 2. Produto
INSERT INTO Produto (nome_produto, descricao, preco_base, peso_gramas) VALUES 
('Notebook', 'Core i7, 16GB RAM', 4500.00, 2000),
('Mouse', 'Mouse sem fio', 80.00, 150),
('Teclado', 'Teclado mecânico', 250.00, 800),
('Monitor', 'Monitor 24 polegadas', 800.00, 3000),
('Cadeira', 'Cadeira ergonômica', 1200.00, 15000),
('Mesa', 'Mesa de escritório', 600.00, 20000),
('Headset', 'Headset gamer', 300.00, 400),
('Webcam', 'Webcam Full HD', 200.00, 200),
('Cabo HDMI', 'Cabo HDMI 2 metros', 30.00, 100),
('Mousepad Extra Grande', 'Mousepad de tecido', 45.00, 300),
('Pen Drive', 'Pen Drive 64GB', 50.00, 50),
('Roteador Wi-Fi 6', 'Roteador de alta velocidade', 450.00, 500),
('Gabinete ATX', 'Gabinete com vidro temperado', 350.00, 4500),
('Filtro de Linha', 'Filtro de linha com 6 tomadas', 40.00, 300),
('Suporte para Monitor', 'Suporte articulado de mesa', 150.00, 2500);

-- 3. Categoria
INSERT INTO Categoria (nome_categoria, descricao) VALUES 
('Informática', 'Equipamentos de TI'),
('Periféricos', 'Acessórios para computadores'),
('Móveis', 'Móveis para escritório'),
('Áudio', 'Equipamentos de som'),
('Vídeo', 'Equipamentos de imagem'),
('Cabos', 'Fios e conexões'),
('Armazenamento', 'Discos e pendrives'),
('Gamer', 'Artigos para jogos'),
('Redes', 'Roteadores e switches'),
('Energia', 'Fontes e nobreaks');

-- 4. Fornecedor
INSERT INTO Fornecedor (cnpj, razao_social, email_contato) VALUES 
('11111111000101', 'Fornecedor Alpha LTDA', 'alpha@fornecedor.com'),
('22222222000102', 'Beta Suprimentos', 'beta@fornecedor.com'),
('33333333000103', 'Gama Tech', 'gama@fornecedor.com'),
('44444444000104', 'Delta Importadora', 'delta@fornecedor.com'),
('55555555000105', 'Epsilon Atacado', 'epsilon@fornecedor.com'),
('66666666000106', 'Zeta Logística', 'zeta@fornecedor.com'),
('77777777000107', 'Eta Equipamentos', 'eta@fornecedor.com'),
('88888888000108', 'Teta Componentes', 'teta@fornecedor.com'),
('99999999000109', 'Iota Distribuidora', 'iota@fornecedor.com'),
('00000000000110', 'Kappa Eletrônicos', 'kappa@fornecedor.com'),
('12345678901234', 'Fornecedor Novo Sem Produto', 'novo@email.com');

-- 5. Transportadora
INSERT INTO Transportadora (cnpj, nome_fantasia, taxa_base_frete) VALUES 
('12312312000111', 'TransRápido', 50.00),
('23423423000122', 'LogExpress', 45.00),
('34534534000133', 'FreteSeguro', 60.00),
('45645645000144', 'ViaNorte', 55.00),
('56756756000155', 'SulCargas', 40.00),
('67867867000166', 'LesteTrans', 65.00),
('78978978000177', 'OesteLog', 70.00),
('89089089000188', 'MinasFrete', 35.00),
('90190190000199', 'BrasilCargas', 80.00),
('01201201000100', 'EcoTransportes', 48.00);

-- 6. Armazem
INSERT INTO Armazem (codigo_filial, cep, capacidade_m3) VALUES 
('ARM-001', '35588-000', 1000.00),
('ARM-002', '35500-000', 2500.00),
('ARM-003', '30130-000', 5000.00),
('ARM-004', '01001-000', 10000.00),
('ARM-005', '20040-000', 8000.00),
('ARM-006', '80010-000', 6000.00),
('ARM-007', '40010-000', 4000.00),
('ARM-008', '70040-000', 3000.00),
('ARM-009', '60030-000', 4500.00),
('ARM-010', '50020-000', 3500.00);

-- 7. Pedido (Atualizado com id_transportadora)
INSERT INTO Pedido (id_cliente, id_transportadora, data_pedido, valor_total, status_pedido) VALUES 
(1, 1, '2026-06-01', 4580.00, 'Entregue'),  
(2, 2, '2026-06-05', 250.00, 'Entregue'),   
(3, 3, '2026-06-10', 1200.00, 'Enviado'),
(4, 4, '2026-06-12', 300.00, 'Enviado'),
(5, 5, '2026-06-15', 600.00, 'Pago'),
(6, 6, '2026-06-18', 800.00, 'Pago'),
(7, 7, '2026-06-20', 30.00, 'Pendente'),
(8, 8, '2026-06-21', 50.00, 'Pendente'),
(9, 9, '2026-06-22', 4500.00, 'Pendente'),
(10, 10, '2026-06-23', 200.00, 'Pendente');

-- 8. Endereco_Entrega
INSERT INTO Endereco_Entrega (id_cliente, sequencial_endereco, cep, logradouro, numero) VALUES 
(1, 1, '35588-000', 'Rua A', '100'),
(2, 1, '35588-001', 'Rua B', '200'),
(3, 1, '35588-002', 'Rua C', '300'),
(4, 1, '35588-003', 'Rua D', '400'),
(5, 1, '35588-004', 'Rua E', '500'),
(6, 1, '35588-005', 'Rua F', '600'),
(7, 1, '35588-006', 'Rua G', '700'),
(8, 1, '35588-007', 'Rua H', '800'),
(9, 1, '35588-008', 'Rua I', '900'),
(10, 1, '35588-009', 'Rua J', '1000');

-- 9. Imagem_Produto
INSERT INTO Imagem_Produto (id_produto, sequencial_imagem, url_imagem, is_principal) VALUES 
(1, 1, 'http://img.com/prod1_1.jpg', TRUE),
(2, 1, 'http://img.com/prod2_1.jpg', TRUE),
(3, 1, 'http://img.com/prod3_1.jpg', TRUE),
(4, 1, 'http://img.com/prod4_1.jpg', TRUE),
(5, 1, 'http://img.com/prod5_1.jpg', TRUE),
(6, 1, 'http://img.com/prod6_1.jpg', TRUE),
(7, 1, 'http://img.com/prod7_1.jpg', TRUE),
(8, 1, 'http://img.com/prod8_1.jpg', TRUE),
(9, 1, 'http://img.com/prod9_1.jpg', TRUE),
(10, 1, 'http://img.com/prod10_1.jpg', TRUE);

-- 10. Atualizacao_Rastreio
INSERT INTO Atualizacao_Rastreio (id_pedido, data_hora_atualizacao, status_rastreio, localizacao_atual) VALUES 
(1, '2026-06-01 10:00:00', 'Pedido Criado', 'Divinópolis-MG'),
(2, '2026-06-05 11:00:00', 'Pedido Criado', 'Ubatuba-SP'),
(3, '2026-06-10 14:00:00', 'Em separação', 'Contagem-MG'),
(4, '2026-06-12 15:00:00', 'Em rota de entrega', 'Betim-MG'),
(5, '2026-06-15 09:00:00', 'Pagamento Confirmado', 'São Paulo-SP'),
(6, '2026-06-18 16:30:00', 'Pagamento Confirmado', 'Itaú de Minas-MG'),
(7, '2026-06-20 08:00:00', 'Aguardando Pagamento', 'Oliveira-MG'),
(8, '2026-06-21 12:00:00', 'Aguardando Pagamento', 'Raulivanlândia-AC'),
(9, '2026-06-22 13:45:00', 'Aguardando Pagamento', 'Metrópolis-BA'),
(10, '2026-06-23 17:20:00', 'Aguardando Pagamento', 'Belo Horizonte-MG');

-- 11. Fatura_Pagamento
INSERT INTO Fatura_Pagamento (id_pedido, numero_parcela, valor_parcela, data_vencimento) VALUES 
(1, 1, 4580.00, '2026-06-10'),
(2, 1, 250.00, '2026-06-15'),
(3, 1, 600.00, '2026-06-20'),
(4, 2, 600.00, '2026-07-20'),
(5, 1, 300.00, '2026-06-22'),
(6, 1, 600.00, '2026-06-25'),
(7, 1, 800.00, '2026-06-28'),
(8, 1, 30.00, '2026-06-30'),
(9, 1, 50.00, '2026-07-01'),
(10, 1, 4500.00, '2026-07-02');

-- 12. Cartao_Salvo
INSERT INTO Cartao_Salvo (id_cliente, ultimos_quatro_digitos, nome_titular, data_validade) VALUES 
(1, '1234', 'ANA C SILVA', '12/28'),
(2, '5678', 'BRUNO MENDES', '11/27'),
(3, '9012', 'CARLOS DIAS', '10/29'),
(4, '3456', 'DANIELA SILVA', '09/26'),
(5, '7890', 'EDUARDO COSTA', '08/30'),
(6, '2345', 'FERNANDA LIMA', '07/31'),
(7, '6789', 'GUSTAVO REIS', '06/28'),
(8, '0123', 'HELENA GOMES', '05/27'),
(9, '4567', 'IGOR SANTOS', '04/29'),
(10, '8901', 'JULIA ALVES', '03/30');

-- 13. Item_Pedido (Corrigido os dados dos produtos)
INSERT INTO Item_Pedido (id_pedido, id_produto, quantidade, preco_unitario) VALUES 
(1, 1, 1, 4500.00),
(2, 2, 1, 80.00),
(3, 3, 1, 250.00),
(4, 4, 1, 1200.00),
(5, 5, 1, 300.00),
(6, 6, 1, 600.00),
(7, 7, 1, 800.00),
(8, 8, 1, 30.00),
(9, 9, 1, 50.00),
(10, 10, 1, 4500.00);

-- 14. Produto_Categoria
INSERT INTO Produto_Categoria (id_produto, id_categoria) VALUES 
(1, 1),
(2, 2),
(3, 2),
(4, 5),
(5, 3),
(6, 3),
(7, 4),
(8, 5),
(9, 6),
(10, 7);

-- 15. Fornecimento
INSERT INTO Fornecimento (id_fornecedor, id_produto) VALUES 
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6),
(7, 7),
(8, 8),
(9, 9),
(10, 10);

-- 16. Estoque_Armazem
INSERT INTO Estoque_Armazem (id_produto, id_armazem, quantidade_disponivel) VALUES 
(1, 1, 50),   -- Notebook no Armazém 1
(2, 1, 200),  -- Mouse no Armazém 1
(3, 2, 150),  -- Teclado no Armazém 2
(4, 2, 80),   -- Monitor no Armazém 2
(5, 3, 30),   -- Cadeira no Armazém 3
(6, 4, 20),   -- Mesa no Armazém 4
(7, 5, 100),  -- Headset no Armazém 5
(8, 6, 75),   -- Webcam no Armazém 6
(9, 7, 500),  -- Cabo HDMI no Armazém 7
(10, 8, 40);  -- Mousepad no Armazém 8

-- Questão 7 (INNER JOIN)
SELECT 
    c.nome_completo AS nome_cliente, 
    p.id_pedido, 
    t.nome_fantasia AS nome_transportadora
FROM Cliente c
INNER JOIN Pedido p ON c.id_cliente = p.id_cliente
INNER JOIN Transportadora t ON p.id_transportadora = t.id_transportadora;

-- Questão 8 (LEFT JOIN)
SELECT 
    prod.nome_produto, 
    arm.codigo_filial,
    est.quantidade_disponivel
FROM Produto prod
LEFT JOIN Estoque_Armazem est ON prod.id_produto = est.id_produto
LEFT JOIN Armazem arm ON est.id_armazem = arm.id_armazem;

-- Questão 9 (RIGHT JOIN)
SELECT c.nome_completo, p.id_pedido, p.valor_total
FROM Pedido p
RIGHT JOIN Cliente c ON p.id_cliente = c.id_cliente;

-- Questão 10 (FULL JOIN)
SELECT 
    f.razao_social, 
    p.nome_produto
FROM Fornecedor f
FULL JOIN Fornecimento fn 
    ON f.id_fornecedor = fn.id_fornecedor
FULL JOIN Produto p 
    ON fn.id_produto = p.id_produto;

-- Questão 11 (GROUP BY E HAVING)
SELECT 
    c.nome_completo,
    p.id_cliente, 
    SUM(p.valor_total) AS total_gasto
FROM Pedido p
INNER JOIN Cliente c ON p.id_cliente = c.id_cliente
GROUP BY p.id_cliente, c.nome_completo
HAVING SUM(p.valor_total) > 500.00
ORDER BY total_gasto DESC;

-- Questão 12 (UNION)
SELECT nome_completo AS nome_contato, email AS email_contato, 'Cliente' AS tipo_contato
FROM Cliente
UNION
SELECT razao_social, email_contato, 'Fornecedor'
FROM Fornecedor;

-- Questão 13 (INTERSECT)
SELECT p.id_produto, p.nome_produto 
FROM Produto p
INNER JOIN Produto_Categoria pc ON p.id_produto = pc.id_produto
INTERSECT
SELECT p.id_produto, p.nome_produto 
FROM Produto p
INNER JOIN Fornecimento f ON p.id_produto = f.id_produto;

-- Questão 14 (EXCEPT)
SELECT id_produto, nome_produto 
FROM Produto
EXCEPT
SELECT p.id_produto, p.nome_produto 
FROM Produto p
INNER JOIN Item_Pedido ip ON p.id_produto = ip.id_produto;
