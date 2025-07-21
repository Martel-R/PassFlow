# 1. Base Image: Use uma imagem oficial do Node.js. Alpine é uma boa escolha por ser leve.
FROM node:20-alpine AS base

# 2. Build Tools: Instale as dependências necessárias para compilar pacotes nativos como `better-sqlite3`.
RUN apk add --no-cache libc6-compat python3 make g++

# 3. Set Working Directory: Defina o diretório de trabalho dentro do container.
WORKDIR /app

# 4. Copy and Install Dependencies: Copie os arquivos de dependência e instale-os.
# Copiar esses arquivos primeiro aproveita o cache de camadas do Docker.
COPY package.json ./
COPY package-lock.json* ./

RUN npm install --production=false

# 5. Copy Application Code: Copie o restante do código da aplicação.
COPY . .

# 6. Build the Application: Execute o script de build do Next.js.
RUN npm run build

# 7. Start the Application: Configure o comando para iniciar a aplicação quando o container for executado.
CMD ["npm", "start"]
