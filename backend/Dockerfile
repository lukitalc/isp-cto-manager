'''# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências
RUN npm install -g pnpm && \
    pnpm fetch && \
    pnpm install --prod --frozen-lockfile

# Copiar o código-fonte
COPY . .

# Gerar o build da aplicação
RUN pnpm run build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Copiar o build e as dependências do stage anterior
COPY --from=builder /usr/src/app/node_modules ./node_modules
COPY --from=builder /usr/src/app/dist ./dist

# Expor a porta que a aplicação vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD [ "node", "dist/main" ]
'''
