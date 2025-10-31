# Dockerfile
FROM node:18-alpine

# diretório de trabalho dentro da imagem
WORKDIR /app

# copiar apenas manifestos primeiro (cache de dependências)
COPY package*.json ./

# instale dependências (produção)
RUN npm ci --omit=dev

# agora copie o restante do código
COPY . .

ENV NODE_ENV=production
EXPOSE 3000

# inicializa a app
CMD ["node", "server.js"]
