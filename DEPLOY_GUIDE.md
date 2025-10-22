# Guia de Deploy em Produção

Este guia descreve como fazer o deploy da aplicação **ISP CTO Manager** em plataformas de hospedagem gratuitas ou de baixo custo.

---

## Opção 1: Deploy com Railway (Recomendado)

O **Railway** oferece um plano gratuito generoso e suporta PostgreSQL, Node.js e deploy automático via GitHub.

### Passo a Passo

1. **Criar conta no Railway:**
   - Acesse [railway.app](https://railway.app)
   - Faça login com sua conta do GitHub

2. **Criar novo projeto:**
   - Clique em "New Project"
   - Selecione "Deploy from GitHub repo"
   - Escolha o repositório `isp-cto-manager`

3. **Adicionar PostgreSQL:**
   - No projeto, clique em "+ New"
   - Selecione "Database" → "PostgreSQL"
   - O Railway criará automaticamente o banco de dados

4. **Configurar o Backend:**
   - Clique no serviço do backend
   - Vá em "Variables" e adicione:
     ```
     DATABASE_HOST=${{Postgres.PGHOST}}
     DATABASE_PORT=${{Postgres.PGPORT}}
     DATABASE_USER=${{Postgres.PGUSER}}
     DATABASE_PASSWORD=${{Postgres.PGPASSWORD}}
     DATABASE_NAME=${{Postgres.PGDATABASE}}
     NODE_ENV=production
     PORT=3000
     ```
   - Em "Settings" → "Build Command": `cd backend && pnpm install && pnpm run build`
   - Em "Settings" → "Start Command": `cd backend && node dist/main`

5. **Configurar o Frontend:**
   - Clique no serviço do frontend
   - Em "Variables" adicione:
     ```
     VITE_API_URL=https://[URL_DO_BACKEND]
     ```
   - Em "Settings" → "Build Command": `cd frontend && pnpm install && pnpm run build`
   - Em "Settings" → "Start Command": `cd frontend && npx serve -s dist -l 3000`

6. **Deploy:**
   - O Railway fará o deploy automaticamente
   - Acesse as URLs geradas para backend e frontend

---

## Opção 2: Deploy com Render

O **Render** também oferece plano gratuito e é muito fácil de usar.

### Passo a Passo

1. **Criar conta no Render:**
   - Acesse [render.com](https://render.com)
   - Faça login com sua conta do GitHub

2. **Criar PostgreSQL:**
   - No dashboard, clique em "New +"
   - Selecione "PostgreSQL"
   - Escolha o plano gratuito
   - Anote as credenciais geradas

3. **Deploy do Backend:**
   - Clique em "New +" → "Web Service"
   - Conecte ao repositório `isp-cto-manager`
   - Configure:
     - **Name:** isp-backend
     - **Root Directory:** `backend`
     - **Build Command:** `pnpm install && pnpm run build`
     - **Start Command:** `node dist/main`
   - Adicione as variáveis de ambiente do banco de dados
   - Clique em "Create Web Service"

4. **Deploy do Frontend:**
   - Clique em "New +" → "Static Site"
   - Conecte ao repositório `isp-cto-manager`
   - Configure:
     - **Name:** isp-frontend
     - **Root Directory:** `frontend`
     - **Build Command:** `pnpm install && pnpm run build`
     - **Publish Directory:** `dist`
   - Adicione a variável `VITE_API_URL` com a URL do backend
   - Clique em "Create Static Site"

---

## Opção 3: Deploy com Vercel (Frontend) + Railway (Backend)

Esta é uma combinação poderosa: **Vercel** para o frontend (extremamente rápido) e **Railway** para o backend.

### Frontend no Vercel

1. **Instalar Vercel CLI:**
   ```bash
   npm install -g vercel
   ```

2. **Fazer login:**
   ```bash
   vercel login
   ```

3. **Deploy do frontend:**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Configurar variável de ambiente:**
   - No dashboard do Vercel, vá em Settings → Environment Variables
   - Adicione `VITE_API_URL` com a URL do backend do Railway

### Backend no Railway

Siga os passos da **Opção 1** para o backend e PostgreSQL.

---

## Opção 4: Deploy Manual com VPS (DigitalOcean, Vultr, etc.)

Se você preferir ter controle total, pode usar um VPS (Virtual Private Server).

### Passo a Passo

1. **Criar um droplet/VPS:**
   - Escolha Ubuntu 22.04 LTS
   - Tamanho mínimo: 2GB RAM

2. **Conectar via SSH:**
   ```bash
   ssh root@seu-ip
   ```

3. **Instalar Docker e Docker Compose:**
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   apt install docker-compose -y
   ```

4. **Clonar o repositório:**
   ```bash
   git clone https://github.com/lukitalc/isp-cto-manager.git
   cd isp-cto-manager
   ```

5. **Configurar variáveis de ambiente:**
   ```bash
   nano backend/.env
   # Edite as configurações do banco de dados
   ```

6. **Iniciar a aplicação:**
   ```bash
   docker-compose up -d
   ```

7. **Configurar Nginx como proxy reverso (opcional):**
   ```bash
   apt install nginx -y
   nano /etc/nginx/sites-available/isp-cto-manager
   ```

   Adicione a configuração:
   ```nginx
   server {
       listen 80;
       server_name seu-dominio.com;

       location / {
           proxy_pass http://localhost:8080;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }

       location /api {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

   Ative o site:
   ```bash
   ln -s /etc/nginx/sites-available/isp-cto-manager /etc/nginx/sites-enabled/
   nginx -t
   systemctl restart nginx
   ```

8. **Configurar SSL com Let's Encrypt (recomendado):**
   ```bash
   apt install certbot python3-certbot-nginx -y
   certbot --nginx -d seu-dominio.com
   ```

---

## Resumo das Opções

| Plataforma | Custo | Facilidade | Escalabilidade | Recomendação |
|:-----------|:------|:-----------|:---------------|:-------------|
| **Railway** | Gratuito (com limites) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Melhor para começar |
| **Render** | Gratuito (com limites) | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | Alternativa ao Railway |
| **Vercel + Railway** | Gratuito | ⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Melhor performance |
| **VPS Manual** | ~$5-10/mês | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ | Controle total |

---

## Próximos Passos

Após o deploy, você pode:

1. **Configurar um domínio personalizado**
2. **Habilitar HTTPS** (essencial para produção)
3. **Configurar backups automáticos** do banco de dados
4. **Implementar monitoramento** (Sentry, LogRocket, etc.)
5. **Adicionar autenticação** para proteger a aplicação

Para dúvidas, consulte a documentação da plataforma escolhida ou entre em contato com o suporte.

