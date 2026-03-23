import React from 'react';
import './MessageFeed.css';

const MessageFeed = ({ mensajes }) => {
  return (
    <div className="feed-wrapper">
      {mensajes.map((msg) => {
        const mainSentiment = msg.hallazgos?.[0]?.sentimiento?.toLowerCase() || 'neutro';

        return (
          <div key={msg._id} className={`message-card card-${mainSentiment}`}>
            {/* HEADER: EXTREMOS */}
            <div className="card-header">
              <div className="sender-info">
                <i className="fab fa-whatsapp whatsapp-icon"></i>
                <span className="sender-phone">{msg.numero_remitente}</span>
              </div>
              <span className="timestamp">
                {new Date(msg.timestamp).toLocaleString('en-US', { 
                  month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' 
                })}
              </span>
            </div>

            {/* MENSAJE: CENTRADO */}
            <div className="message-content">
              <p className="message-text">"{msg.texto_mensaje}"</p>
            </div>

            {/* TAGS: IZQUIERDA */}
            <div className="tags-row">
              {msg.hallazgos?.map((h, i) => (
                <div key={i} className={`sentiment-tag tag-${h.sentimiento?.toLowerCase()}`}>
                  <i className="far fa-tag tag-icon"></i> {/* ICONO DINÁMICO */}
                  <span className="tag-label">{h.tema}</span>
                  
                  {/* HOVER / TOOLTIP */}
                  <div className="tag-tooltip">
                    <p className="tooltip-resumen">{h.resumen}</p>
                    <div className="tooltip-footer">
                      SENTIMIENTO: <span className="footer-sent">{h.sentimiento?.toUpperCase()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MessageFeed;