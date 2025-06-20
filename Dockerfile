FROM node:18

WORKDIR /app

# Copie des fichiers package.json et package-lock.json
COPY package*.json ./

# Installation des dépendances
RUN npm install

# Copie du reste des fichiers
COPY . .

EXPOSE 3000

CMD ["node", "src/index.js"] 