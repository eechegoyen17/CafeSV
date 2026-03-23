import time
from .schemas import MensajeInsight, MetadataAuditoria

def validar_y_enriquecer(raw_llm_json: dict, start_time: float):
    """
    Implementa Validación de Esquema y Trazabilidad (Punto 5).
    """
    try:
        # 1. Validación Estricta (Gobernanza)
        mensaje_validado = MensajeInsight(**raw_llm_json)
        
        # 2. Cálculo de Latencia (Trazabilidad)
        latencia = int((time.time() - start_time) * 1000)
        
        # 3. Enriquecimiento con Metadatos
        mensaje_validado.metadata_auditoria = MetadataAuditoria(
            latencia_ms=latencia,
            modelo_id="gemini-1.5-flash",
            prompt_version="v1.2.0-cafesv"
        )
        
        return mensaje_validado.dict()
    except Exception as e:
        # Si falla el esquema, no se persiste nada (Calidad de datos)
        print(f"❌ ERROR GOBERNANZA: {e}")
        return None