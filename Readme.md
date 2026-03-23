# Proyecto CAFESV: Inteligencia de Feedback del Cliente ☕🤖

Solución integral diseñada para **Café de El Salvador** que automatiza la captura, análisis y visualización de la experiencia del cliente. El sistema transforma mensajes de texto desestructurados (WhatsApp/Webhooks) en indicadores estratégicos y métricas de sentimiento mediante Inteligencia Artificial de última generación.

---

## 🚀 Configuración y Ejecución Local

La aplicación utiliza **Docker Compose** para orquestar los microservicios, garantizando que el entorno de desarrollo sea idéntico al de producción.

### Requisitos Previos
* Docker y Docker Compose instalados.
* Una API Key de **Groq** (para el modelo Llama 3.1).

### Instrucciones de Despliegue
1. **Clonar el repositorio:**
   ```bash
   git clone [https://github.com/tu-usuario/cafe-sv-analitica.git](https://github.com/tu-usuario/cafe-sv-analitica.git)
   cd cafe-sv-analitica

2. **Configuración de Variables de Entorno:**
Crea un archivo .env dentro de la carpeta backend/ con los siguientes parámetros:
    ```Code snippet
    GROQ_API_KEY=tu_api_key_aqui
    MONGO_URI=mongodb://db:27017/cafesv

3. **Levantar el Stack Tecnológico:**
    ```Bash
    docker-compose up --build

4. **Acceso a los Servicios:**
* Dashboard (Frontend): http://localhost:3000
* Documentación API (Swagger): http://localhost:8000/docs

## 🛠️ Decisiones Técnicas
* FastAPI (Python): Seleccionado por su alto rendimiento asíncrono y su integración nativa con Pydantic, fundamental para la Gobernanza de Datos.
* React: Utilizado para construir un Dashboard dinámico e interactivo que permite a la gerencia visualizar KPIs en tiempo real.
* MongoDB: Base de datos NoSQL elegida por su flexibilidad para manejar documentos JSON con esquemas variables (feedback multitemático).
* Llama 3.1 (vía Groq): Implementado para realizar inferencias de lenguaje natural con latencia ultra baja, asegurando respuestas y análisis en milisegundos.
* Docker Compose: Facilita la portabilidad y escalabilidad del sistema mediante la contenerización de servicios independientes.

## 🧠 Ingeniería de Prompts
El sistema implementa una estrategia de Structured Output Prompting para garantizar que la IA actúe como un analista experto en hospitalidad.
* Contexto del Sistema: Se define un rol especializado que comprende el lenguaje coloquial y técnico del sector gastronómico.
* Few-Shot Learning: Se incluyen ejemplos de clasificación de temas (Limpieza, Sabor, Tiempo de Espera, Infraestructura) para minimizar el sesgo.
* Validación de Esquema: Se fuerza la salida en formato JSON, permitiendo que el backend valide cada campo mediante Pydantic antes de la persistencia en base de datos.

## 📊 Arquitectura y Experiencia
El desarrollo se fundamenta en estándares de ingeniería de software y diseño de servicios:
* Modelo C4: Documentación completa en sus niveles de Contexto, Contenedores, Componentes y Código.
* Customer Journey Map: Alineación del flujo técnico con los puntos de contacto reales del cliente en las sucursales de CafeSV.
* Trazabilidad: Inyección de metadatos (ejecucion_id, latencia, timestamp) en cada transacción para auditoría técnica y de negocio.