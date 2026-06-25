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
3. Abra uma janela de query neste novo banco e execute o script SQL completo fornecido pelo grupo (que cria e popula todas as tabelas).

### Passo 2: Configurar o Backend (API Python)

1. Abra o terminal na pasta onde está o arquivo `app.py`.
2. Instale as bibliotecas necessárias rodando o comando:
   \`\`\`bash
   pip install Flask Flask-CORS psycopg2
   \`\`\`
3. **ATENÇÃO:** Abra o arquivo `app.py` e verifique a função `get_db_connection()`. Se a senha do seu PostgreSQL local for diferente de `123456`, altere-a no código:
   \`\`\`python
   # Altere as credenciais se necessário
   host="localhost",
   database="ProjetoFinal", 
   user="postgres",               
   password="SUA_SENHA",          
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
