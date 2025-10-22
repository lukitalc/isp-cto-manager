'''# Stage 1: Build the React application
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN npm install -g pnpm && \
    pnpm fetch && \
    pnpm install --frozen-lockfile

# Copiar o código-fonte
COPY . .

# Criar o build de produção
RUN pnpm run build

# Stage 2: Serve the application with Nginx
FROM nginx:stable-alpine

# Copiar os arquivos de build do stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar a configuração do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expor a porta 80
EXPOSE 80

# Comando para iniciar o Nginx
CMD [ "nginx", "-g", "daemon off;" ]
'''
