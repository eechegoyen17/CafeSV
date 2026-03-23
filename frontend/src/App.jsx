import React, { useState, useEffect, useMemo } from 'react';
import { getMensajesRecientes } from './api';
import SentimentPie from './components/SentimentPie';
import TopicsBar from './components/TopicsBar';
import MessageFeed from './components/MessageFeed';

const App = () => {
  const [mensajes, setMensajes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtroSentimiento, setFiltroSentimiento] = useState('todos');
  const [filtroTopico, setFiltroTopico] = useState('todos');
  const [limite, setLimite] = useState(3);
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  
  // 1. Unificamos la lógica de detección de móvil
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMensajesRecientes();
        // Validamos: ¿res.data es una lista? Si no, enviamos []
        const dataSegura = Array.isArray(res.data) ? res.data : [];
        setMensajes(dataSegura);
      } catch (e) { 
        console.error("Error en API:", e); 
        setMensajes([]); // Si falla la conexión, lista vacía
      } finally { 
        setLoading(false); 
      }
    };
    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, []);

  const clean = (v) => v?.toString().toUpperCase().trim() || '';

  const resetFiltros = () => {
    setFiltroSentimiento('todos');
    setFiltroTopico('todos');
    setFechaInicio('');
    setFechaFin('');
  };

  const menuTemas = useMemo(() => {
  const temasSet = new Set();
  if (Array.isArray(mensajes)) {
    mensajes.forEach(m => m.hallazgos?.forEach(h => h.tema && temasSet.add(clean(h.tema))));
  }
  return Array.from(temasSet).sort();
}, [mensajes]);

 const mensajesFiltrados = useMemo(() => {
  // ESCUDO: Si mensajes no es un array, devolvemos lista vacía de inmediato
  if (!Array.isArray(mensajes)) return [];

  return mensajes.filter(m => {
    // 1. Filtros de sentimiento y tema
    // Usamos el encadenamiento opcional (?.) por si hallazgos es null
    const matchS = filtroSentimiento === 'todos' || 
                   m.hallazgos?.some(h => clean(h.sentimiento) === clean(filtroSentimiento));
    
    const matchT = filtroTopico === 'todos' || 
                   m.hallazgos?.some(h => clean(h.tema) === clean(filtroTopico));

    // 2. Lógica de fecha
    const fechaMensaje = m.timestamp ? m.timestamp.split('T')[0] : ''; 
    const matchFechaInicio = !fechaInicio || fechaMensaje >= fechaInicio;
    const matchFechaFin = !fechaFin || fechaMensaje <= fechaFin;

    // 3. Retorno de la condición (Aquí era donde faltaban las variables)
    return matchS && matchT && matchFechaInicio && matchFechaFin;
  });
}, [mensajes, filtroSentimiento, filtroTopico, fechaInicio, fechaFin]);

  const hallazgosGraficas = useMemo(() => {
    const puros = [];
    mensajesFiltrados.forEach(m => {
      m.hallazgos?.forEach(h => {
        const cumpleS = filtroSentimiento === 'todos' || clean(h.sentimiento) === clean(filtroSentimiento);
        const cumpleT = filtroTopico === 'todos' || clean(h.tema) === clean(filtroTopico);
        if (cumpleS && cumpleT) puros.push(h);
      });
    });
    return puros;
  }, [mensajesFiltrados, filtroSentimiento, filtroTopico]);

  const exportarACSV = () => {
    if (mensajesFiltrados.length === 0) return alert("No hay datos para exportar");
    const headers = ["Fecha", "Telefono", "Tema", "Sentimiento", "Mensaje","Analisis"];
    const rows = mensajesFiltrados.flatMap(m => 
      m.hallazgos.map(h => [
        m.timestamp || '',
        m.numero_remitente || '',
        h.tema || '',
        h.sentimiento || '',
        `"${m.texto_mensaje?.replace(/"/g, '""')}"`,
        `"${h.resumen?.replace(/"/g, '""')}"`
      ])
    );
    const csvContent = [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `reporte_cafesv_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 2. DEFINICIÓN DE ESTILOS DINÁMICOS (ADENTRO DE APP)
  const styles = {
    container: { backgroundColor: '#0b1120', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif', overflowX: 'hidden' },
    header: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      padding: isMobile ? '15px' : '15px 40px', 
      borderBottom: '1px solid #1e293b',
      gap: '15px'
    },
    logo: { fontSize: '20px', fontWeight: '900' },
    pill: { display: 'flex', alignItems: 'center', gap: '10px', background: '#161e2e', padding: '6px 15px', borderRadius: '12px', border: '1px solid #1e293b' },
    badgeLabel: { fontSize: '8px', fontWeight: 'bold', opacity: 0.5 },
    badgeValue: { fontSize: '14px', fontWeight: '800' },
    btnAction: { background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#3b82f6', padding: '10px', cursor: 'pointer' },
    mainLayout: { 
      display: 'flex', 
      flexDirection: isMobile ? 'column' : 'row', 
      padding: isMobile ? '15px' : '25px', 
      gap: '25px' 
    },
    sidebar: { 
      width: isMobile ? '100%' : '380px', 
      display: 'flex', 
      flexDirection: 'column', 
      gap: '25px' 
    },
    glassCard: { background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '24px', border: '1px solid #1e293b', height: '340px', display: 'flex', flexDirection: 'column' },
    cardHeader: { color: '#475569', fontSize: '10px', letterSpacing: '2px', textAlign: 'center', marginBottom: '15px', fontWeight: '800' },
    filterBar: { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap', paddingBottom: '15px' },
    select: { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 12px', borderRadius: '10px', fontSize: '11px', outline: 'none' },
    dateGroup: { display: 'flex', gap: '5px', background: '#1e293b', padding: '4px', borderRadius: '10px', border: '1px solid #334155' },
    dateInput: { background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '11px', padding: '2px', outline: 'none', width: '95px' },
    btnReset: { background: 'transparent', border: 'none', color: '#ef4444', fontSize: '18px', cursor: 'pointer', padding: '0 5px' },
    feedContainer: { flex: 1, overflowY: 'auto' },
    loading: { color: 'white', padding: '100px', textAlign: 'center', fontSize: '20px' }
  };

  if (loading) return <div style={styles.loading}>Cargando Insights...</div>;

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div style={styles.logo}><i className="fas fa-th-large dashboard-icon"></i> CAFESV <span style={{ color: '#3b82f6' }}>INSIGHTS</span></div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={styles.pill}>
            <span style={{ opacity: 0.6 }}>💬</span>
            <div style={{ lineHeight: '1' }}>
              <div style={styles.badgeLabel}>TOTAL MSG</div>
              <div style={styles.badgeValue}>{mensajesFiltrados.length}</div>
            </div>
          </div>
          <div style={{ ...styles.pill, backgroundColor: '#1e293b' }}>
            <span style={{ color: '#3b82f6' }}>#</span>
            <div style={{ lineHeight: '1' }}>
              <div style={{ ...styles.badgeLabel, color: '#3b82f6' }}>INSIGHTS</div>
              <div style={styles.badgeValue}>{hallazgosGraficas.length}</div>
            </div>
          </div>
          <button style={styles.btnAction} onClick={exportarACSV} title="Exportar a CSV"><i className='fas fa-download'></i></button>
        </div>
      </header>

      <div style={styles.mainLayout}>
        <aside style={styles.sidebar}>
          <div style={styles.glassCard}>
            <h4 style={styles.cardHeader}>SENTIMENT CORE</h4>
            <div style={{ flex: 1 }}><SentimentPie data={hallazgosGraficas} /></div>
          </div>
          <div style={styles.glassCard}>
            <h4 style={styles.cardHeader}>TOPIC DISTRIBUTION</h4>
            <div style={{ flex: 1 }}><TopicsBar data={hallazgosGraficas} /></div>
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={styles.filterBar}>
            <select value={limite} onChange={e => setLimite(Number(e.target.value))} style={styles.select}>
              <option value={3}>Ver 3</option>
              <option value={5}>Ver 5</option>
              <option value={10}>Ver 10</option>
              <option value={100}>Ver 100</option>
            </select>

            <select value={filtroTopico} onChange={e => setFiltroTopico(e.target.value)} style={styles.select}>
              <option value="todos">Todos los Temas</option>
              {menuTemas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select value={filtroSentimiento} onChange={e => setFiltroSentimiento(e.target.value)} style={styles.select}>
              <option value="todos">Todos los Sentimientos</option>
              <option value="POSITIVO">Positivo</option>
              <option value="NEGATIVO">Negativo</option>
              <option value="NEUTRO">Neutro</option>
            </select>

            <div style={styles.dateGroup}>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={styles.dateInput} />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={styles.dateInput} />
            </div>

            <button onClick={resetFiltros} style={styles.btnReset}>ⓧ</button>
          </div>
          
          <div style={styles.feedContainer}>
            <MessageFeed mensajes={mensajesFiltrados.slice(0, limite)} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default App;