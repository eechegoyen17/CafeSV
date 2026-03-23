# Usamos una imagen ligera de Python [Punto 7]
FROM python:3.10-slim

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Copiamos el archivo de requisitos primero (para aprovechar el cache de Docker)
COPY requirements.txt .

# Instalamos las dependencias
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el resto del código del backend
COPY . .

# Exponemos el puerto que usa FastAPI
EXPOSE 8000

# Comando para arrancar el servidor con Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]