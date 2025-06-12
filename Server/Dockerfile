# Étape 1 : base Node
FROM node:18

# Dossier de travail
WORKDIR /app

# Copie des fichiers nécessaires
COPY package*.json ./
RUN npm install

# Copie du code backend
COPY . .

# Création des dossiers nécessaires pour le bon fonctionnement (temp, photos, vidéos, logs)
RUN mkdir -p uploads/tmp uploads/photos uploads/videos logs

# Expose le port utilisé par le serveur
EXPOSE 3000

# Démarrage de l'app
CMD ["node", "server.js"]
