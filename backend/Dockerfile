# Stage 1: Build the application
FROM node:20-alpine AS builder

WORKDIR /usr/src/app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm e todas as dependências (incluindo dev)
RUN npm install -g pnpm && \
    pnpm install --frozen-lockfile

# Copiar o código-fonte
COPY . .

# Gerar o build da aplicação
RUN pnpm run build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /usr/src/app

# Instalar pnpm no stage de produção
RUN npm install -g pnpm

# Copiar package.json para instalar apenas dependências de produção
COPY package.json pnpm-lock.yaml ./

# Instalar apenas dependências de produção
RUN pnpm install --prod --frozen-lockfile

# Copiar o build do stage anterior
COPY --from=builder /usr/src/app/dist ./dist

# Expor a porta que a aplicação vai rodar
EXPOSE 3000

# Comando para iniciar a aplicação
CMD [ "node", "dist/main" ]

