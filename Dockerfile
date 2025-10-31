FROM node:18

# Diretório de trabalho
WORKDIR /main

# Copia só os manifests da subpasta para aproveitar cache
COPY main/package*.json ./

# Instala as dependências
RUN npm install

# Copia o restante do código da subpasta "main" para o /main do container
COPY main/. .

EXPOSE 3000

CMD ["npm", "start"]
