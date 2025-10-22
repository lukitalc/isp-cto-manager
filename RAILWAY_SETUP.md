# Setup Completo no Railway - Passo a Passo

Este guia detalha exatamente como configurar o projeto no Railway.

---

## Passo 1: Criar Conta e Projeto

1. Acesse [railway.app](https://railway.app)
2. Faça login com sua conta do GitHub
3. Clique em **"New Project"**
4. Selecione **"Empty Project"** (não use "Deploy from GitHub" ainda)

---

## Passo 2: Adicionar PostgreSQL

1. No projeto vazio, clique em **"+ New"**
2. Selecione **"Database"** → **"Add PostgreSQL"**
3. O Railway criará automaticamente o banco de dados
4. Clique no card do PostgreSQL e vá em **"Variables"**
5. Anote os valores de:
   - `PGHOST`
   - `PGPORT`
   - `PGUSER`
   - `PGPASSWORD`
   - `PGDATABASE`

---

## Passo 3: Adicionar o Backend

1. No projeto, clique em **"+ New"**
2. Selecione **"GitHub Repo"**
3. Escolha o repositório **`isp-cto-manager`**
4. O Railway detectará o projeto

### Configurar o Backend

1. Clique no card do serviço criado
2. Vá em **"Settings"**
3. Em **"Root Directory"**, digite: `backend`
4. Em **"Build Command"**, digite: `pnpm install && pnpm run build`
5. Em **"Start Command"**, digite: `node dist/main`
6. Clique em **"Save"**

### Adicionar Variáveis de Ambiente

1. Vá na aba **"Variables"**
2. Clique em **"+ New Variable"**
3. Adicione as seguintes variáveis (uma por uma):

```
DATABASE_HOST = ${{Postgres.PGHOST}}
DATABASE_PORT = ${{Postgres.PGPORT}}
DATABASE_USER = ${{Postgres.PGUSER}}
DATABASE_PASSWORD = ${{Postgres.PGPASSWORD}}
DATABASE_NAME = ${{Postgres.PGDATABASE}}
NODE_ENV = production
PORT = 3000
```

**Importante:** Use exatamente `${{Postgres.PGHOST}}` (com as chaves duplas) para referenciar as variáveis do PostgreSQL.

4. Clique em **"Deploy"** para reiniciar o serviço

### Obter a URL do Backend

1. Vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. Copie a URL gerada (ex: `https://seu-backend.up.railway.app`)

---

## Passo 4: Adicionar o Frontend

1. No projeto, clique em **"+ New"**
2. Selecione **"GitHub Repo"**
3. Escolha o repositório **`isp-cto-manager`** novamente
4. O Railway criará outro serviço

### Configurar o Frontend

1. Clique no card do novo serviço
2. Vá em **"Settings"**
3. Em **"Root Directory"**, digite: `frontend`
4. Em **"Build Command"**, digite: `pnpm install && pnpm run build`
5. Em **"Start Command"**, digite: `npx serve -s dist -l $PORT`
6. Clique em **"Save"**

### Adicionar Variável de Ambiente

1. Vá na aba **"Variables"**
2. Adicione a variável:

```
VITE_API_URL = https://[URL_DO_SEU_BACKEND]
```

Substitua `[URL_DO_SEU_BACKEND]` pela URL que você copiou no Passo 3.

3. Clique em **"Deploy"**

### Obter a URL do Frontend

1. Vá em **"Settings"**
2. Role até **"Networking"**
3. Clique em **"Generate Domain"**
4. Copie a URL gerada (ex: `https://seu-frontend.up.railway.app`)

---

## Passo 5: Testar a Aplicação

1. Acesse a URL do frontend no navegador
2. Você deve ver a aplicação carregando
3. Teste criar uma CTO e conectar um cliente

---

## Solução de Problemas

### Erro: "Deployment failed during the build process"

**Causa:** O Railway não conseguiu encontrar o diretório correto.

**Solução:**
- Verifique se o **Root Directory** está configurado corretamente (`backend` ou `frontend`)
- Certifique-se de que os comandos de build e start estão corretos

### Erro: "Cannot connect to database"

**Causa:** As variáveis de ambiente do banco de dados não foram configuradas corretamente.

**Solução:**
- Verifique se todas as variáveis `DATABASE_*` estão configuradas
- Certifique-se de usar `${{Postgres.PGHOST}}` (com chaves duplas)
- Reinicie o serviço do backend

### Erro: "API request failed" no frontend

**Causa:** A variável `VITE_API_URL` não está configurada ou está incorreta.

**Solução:**
- Verifique se a variável `VITE_API_URL` aponta para a URL correta do backend
- A URL deve começar com `https://`
- Reinicie o serviço do frontend

---

## Estrutura Final no Railway

Seu projeto no Railway deve ter **3 serviços**:

```
📦 isp-cto-manager (Projeto)
├── 🗄️ Postgres (Database)
├── 🚀 backend (Web Service)
│   └── Root Directory: backend
└── 🌐 frontend (Web Service)
    └── Root Directory: frontend
```

---

## Custos

O Railway oferece:
- **$5 de crédito gratuito por mês**
- Após esgotar o crédito, você pode adicionar um cartão de crédito
- Custo estimado: **$5-10/mês** para este projeto

---

## Alternativa: Render

Se você preferir uma opção 100% gratuita (com algumas limitações), siga o guia no arquivo `DEPLOY_GUIDE.md` para usar o **Render**.

---

**Pronto! Sua aplicação está no ar! 🎉**

