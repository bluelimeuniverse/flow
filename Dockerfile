
FROM node:20-alpine

WORKDIR /app

# Copia i file di configurazione
COPY package*.json ./

# Installa le dipendenze
RUN npm install

# Copia tutto il resto del codice
COPY . .

# Costruisci il frontend React (Vite)
RUN npm run build

# Espone la porta (Coolify userà questa)
EXPOSE 3000

# Variabile d'ambiente per forzare la porta nel server
ENV PORT=3000

# Avvia il server Node.js
CMD ["node", "server.js"]
