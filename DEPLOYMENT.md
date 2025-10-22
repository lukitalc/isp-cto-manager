# Guia de Implantação com Docker

Este guia descreve o processo para implantar a aplicação **ISP CTO Manager** em qualquer servidor com Docker e Docker Compose instalados. A containerização garante que o ambiente de execução seja consistente e simplifica o processo de deploy.

---

## Pré-requisitos

Antes de começar, garanta que você tenha os seguintes softwares instalados na sua máquina ou servidor de produção:

1.  **Docker:** [Instruções de Instalação](https://docs.docker.com/engine/install/)
2.  **Docker Compose:** [Instruções de Instalação](https://docs.docker.com/compose/install/)

---

## Passo a Passo da Implantação

### 1. Preparação do Ambiente

Clone ou envie o código-fonte completo deste projeto para o seu servidor.

Navegue até o diretório raiz do projeto:

```bash
cd /caminho/para/isp-cto-manager
```

### 2. Configuração das Variáveis de Ambiente

O backend e o banco de dados precisam de um arquivo de configuração `.env`. O arquivo já está incluído no diretório `/backend`, mas você pode revisar e alterar os valores se necessário (especialmente a senha do banco de dados para um ambiente de produção).

**Arquivo:** `/backend/.env`

```
# Configuração do Banco de Dados
DATABASE_HOST=db
DATABASE_PORT=5432
DATABASE_USER=isp_admin
DATABASE_PASSWORD=secret_password_change_me # <-- MUDE ESTA SENHA!
DATABASE_NAME=isp_cto_manager

# Configuração da Aplicação
NODE_ENV=production
PORT=3000
```

**Importante:** O `DATABASE_HOST` deve ser mantido como `db`, pois é o nome do serviço do banco de dados definido no `docker-compose.yml`.

### 3. Construção e Execução dos Contêineres

Com o Docker e o Docker Compose instalados, execute o seguinte comando a partir do diretório raiz do projeto (`/isp-cto-manager`):

```bash
# Constrói as imagens e inicia os contêineres em background (-d)
docker-compose up --build -d
```

Este comando fará o seguinte:

-   **Construirá as imagens Docker** para o `backend` e o `frontend` com base nos seus respectivos `Dockerfiles`.
-   **Baixará a imagem oficial do PostgreSQL**.
-   **Criará e iniciará os três contêineres** (backend, frontend, db) em uma rede privada.
-   **Persistirá os dados do banco de dados** em um volume Docker chamado `postgres_data`.

### 4. Acesso à Aplicação

Após a conclusão do comando, a aplicação estará disponível nos seguintes endereços:

-   **Aplicação Web (Frontend):** `http://<IP_DO_SEU_SERVIDOR>:8080`
-   **API (Backend):** `http://<IP_DO_SEU_SERVIDOR>:3000`

O frontend já está configurado para se comunicar com o backend dentro do ambiente Docker. A porta `8080` foi usada para o frontend para evitar conflitos com outras aplicações web que possam estar rodando na porta `80` padrão.

### 5. Populando o Banco de Dados (Opcional)

Se desejar popular o banco de dados com os dados de exemplo, você pode executar o script `seed-data.sh` dentro do contêiner do backend:

```bash
# Executa o script de seed dentro do contêiner do backend
docker-compose exec backend sh -c "./seed-data.sh"
```

### 6. Gerenciamento dos Serviços

-   **Para parar a aplicação:**

    ```bash
    docker-compose down
    ```

-   **Para ver os logs dos contêineres:**

    ```bash
    # Ver logs de todos os serviços
    docker-compose logs -f

    # Ver logs de um serviço específico (ex: backend)
    docker-compose logs -f backend
    ```

---

Com isso, a aplicação está implantada de forma robusta e escalável. Para produção, recomenda-se colocar a aplicação por trás de um proxy reverso como o Nginx ou Traefik para gerenciar certificados SSL (HTTPS) e domínios personalizados.

