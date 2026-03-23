from pydantic import BaseModel, Field
from typing import List, Literal, Optional
from datetime import datetime
import uuid

# Define los temas permitidos según tu prompt de sistema
TemasValidos = Literal[
    'Limpieza', 'Calidad del Producto', 'Atencion', 
    'Precio', 'Infraestructura', 'Otros'
]

# Define los sentimientos permitidos
SentimientosValidos = Literal['positivo', 'negativo', 'neutro']

class HallazgoSchema(BaseModel):
    sentimiento: SentimientosValidos
    tema: TemasValidos
    resumen: str = Field(..., max_length=200)

class MetadataAuditoria(BaseModel):
    # Punto 5.2: Trazabilidad
    ejecucion_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    modelo_id: str = "llama-3.1-8b-instant"
    prompt_version: str = "v1.5.0-production"
    latencia_ms: int
    fecha_proceso: datetime = Field(default_factory=datetime.utcnow)

class MensajeValidado(BaseModel):
    texto_mensaje: str
    numero_remitente: str
    timestamp: datetime
    status: str
    hallazgos: List[HallazgoSchema]
    metadata_auditoria: MetadataAuditoria