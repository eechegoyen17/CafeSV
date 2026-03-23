import os
import urllib.parse
from datetime import datetime
from typing import List, Dict
import json

from fastapi import FastAPI, Request, Form
from fastapi.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from groq import Groq
from dotenv import load_dotenv

import time
from schemas import MensajeValidado, MetadataAuditoria, HallazgoSchema # Importamos los nuevos esquemas

load_dotenv()
app = FastAPI(title="CafeSV Multi-Sentiment API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Conexión DB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://mongodb:27017/cafe_db")
db_client = AsyncIOMotorClient(MONGO_URI)
db = db_client.cafe_db
groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))

async def analizar_multisentimiento_ia(texto: str) -> Dict:
    start_time = time.time() # Iniciar cronómetro para latencia
    try:
        completion = groq_client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[
                {"role": "system", "content": (
                    "Eres un experto en análisis de datos para CafeSV. "
                    "Analiza el mensaje y extrae CADA punto relevante. "
                    "Responde UNICAMENTE en JSON con este formato: "
                    '{"analisis": [{"sentimiento": "positivo/negativo/neutro", '
                    '"tema": "Limpieza/Calidad del Producto/Atencion/Precio/Infraestructura/Otros", '
                    '"resumen": "frase corta del punto"}]}'
                )},
                {"role": "user", "content": texto}
            ],
            response_format={"type": "json_object"}
        )
        
        latencia = int((time.time() - start_time) * 1000) # Latencia en ms
        res_json = json.loads(completion.choices[0].message.content)
        
        return {
            "hallazgos": res_json.get("analisis", []),
            "latencia_ms": latencia,
            "error": None
        }
    except Exception as e:
        return {"error": str(e), "latencia_ms": 0}

@app.post("/webhook")
async def webhook(Body: str = Form(...), From: str = Form(...)):
    res_ia = await analizar_multisentimiento_ia(Body)
    
    try:
        # PUNTO 5.1 & 5.2: Validación y Enriquecimiento
        documento_final = MensajeValidado(
            texto_mensaje=Body,
            numero_remitente=From,
            timestamp=datetime.utcnow(),
            status="analizado" if not res_ia["error"] else "error",
            hallazgos=res_ia["hallazgos"],
            metadata_auditoria=MetadataAuditoria(
                latencia_ms=res_ia["latencia_ms"]
            )
        )
        
        # Persistir solo si el esquema es válido
        await db.mensajes.insert_one(documento_final.dict())
        return {"status": "ok", "ejecucion_id": documento_final.metadata_auditoria.ejecucion_id}
        
    except Exception as e:
        # Si la validación falla, guardamos el error para auditoría
        error_doc = {
            "texto_mensaje": Body,
            "numero_remitente": From,
            "timestamp": datetime.utcnow(),
            "status": "error_validacion",
            "error_log": str(e)
        }
        await db.mensajes.insert_one(error_doc)
        return {"status": "error", "detail": "Fallo de gobernanza de datos"}

# --- Endpoints para React con Agregaciones $unwind ---

@app.get("/api/sentimientos")
async def stats_sentimientos():
    pipeline = [
        {"$unwind": "$hallazgos"}, # Desglosa el array para contar cada punto
        {"$group": {"_id": "$hallazgos.sentimiento", "count": {"$sum": 1}}}
    ]
    cursor = db.mensajes.aggregate(pipeline)
    res = await cursor.to_list(10)
    return {item["_id"]: item["count"] for item in res if item["_id"]}

@app.get("/api/temas")
async def stats_temas():
    pipeline = [
        {"$unwind": "$hallazgos"},
        {"$group": {"_id": "$hallazgos.tema", "frecuencia": {"$sum": 1}}},
        {"$sort": {"frecuencia": -1}}
    ]
    cursor = db.mensajes.aggregate(pipeline)
    res = await cursor.to_list(20)
    return {item["_id"]: item["frecuencia"] for item in res if item["_id"]}

@app.get("/api/mensajes/recientes")
async def mensajes_recientes():
    # Traemos los documentos y sus hallazgos
    cursor = db.mensajes.find({"status": "analizado"}).sort("timestamp", -1).limit(10)
    mensajes = await cursor.to_list(10)
    for m in mensajes:
        m["_id"] = str(m["_id"])
    return mensajes