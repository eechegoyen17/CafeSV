# Imagen base de Node.js
FROM node:18-slim

WORKDIR /app

# Copiamos archivos de dependencias
COPY package*.json ./

# Instalamos librerías de React
RUN npm install

# Copiamos el código del frontend
COPY . .

# Exponemos el puerto de desarrollo de React
EXPOSE 3000

# Arrancamos la aplicación
CMD ["npm", "start"]