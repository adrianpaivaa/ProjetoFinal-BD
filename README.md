# 🛒 Dashboard - Gestão de Banco de Dados (E-commerce)

Este projeto é um painel administrativo web criado para visualizar e testar as consultas SQL do Projeto Final de Banco de Dados. A arquitetura é dividida em um frontend (HTML/CSS/JS) e uma API backend em Python (Flask) que se conecta a um banco PostgreSQL.

## 🛠️ Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* **PostgreSQL** (rodando localmente na porta padrão `5432`).
* **Python 3.x** (para rodar a API do servidor).

---

## 🚀 Como rodar o projeto

### Passo 1: Configurar o Banco de Dados
1. Abra o seu gerenciador do PostgreSQL.
2. Crie um novo banco de dados vazio chamado `ProjetoFinal`.
3. Abra uma janela de query neste novo banco e execute o script SQL completo fornecido pelo grupo (que cria as tabelas e insere os dados iniciais).

### Passo 2: Configurar o Backend (API Python)

1. Abra o terminal na pasta onde está o arquivo `app.py`.
2. Instale as bibliotecas necessárias rodando o comando:
   \`\`\`bash
   pip install Flask Flask-CORS psycopg2
   \`\`\`
3. **ATENÇÃO:** Abra o arquivo `app.py` em um editor de texto e verifique a função `get_db_connection()`. Se a senha do seu PostgreSQL local for diferente de `123456`, altere-a no código:
   \`\`\`python
   # Altere as credenciais se necessário
   host="localhost",
   database="ProjetoFinal", 
   user="postgres",               
   password="SUA_SENHA_AQUI",          
   port="5432"
   \`\`\`
4. Inicie o servidor da API rodando:
   \`\`\`bash
   python app.py
   \`\`\`
5. O terminal exibirá uma mensagem informando que o servidor está rodando em `http://127.0.0.1:5000`. **Deixe este terminal aberto e rodando.**

### Passo 3: Abrir o Site (Frontend)
Com o banco populado e a API rodando, o site já pode buscar os dados.

Vá até a pasta do projeto e dê um clique duplo no arquivo `index.html` para abri-lo no seu navegador.

Pronto! Navegue pelo menu lateral para visualizar os dados de todas as 15 tabelas, ver os testes de integridade e os resultados das junções (JOINs, GROUP BY, UNION, etc.).

---

## 🛑 Possíveis Erros

* **Erro "psycopg2.OperationalError: FATAL: password authentication failed"**: Significa que a senha do PostgreSQL no arquivo `app.py` está incorreta para a sua máquina.
* **Os dados não aparecem no site**: Verifique se a janela do terminal rodando o `python app.py` ainda está aberta. O site precisa dela para buscar os dados.
* **Erro de porta (Port already in use)**: Algo já está usando a porta 5000. Reinicie o computador ou mude a porta no final do arquivo `app.py`.
