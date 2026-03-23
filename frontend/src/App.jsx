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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await getMensajesRecientes();
        setMensajes(res.data || []);
      } catch (e) { console.error("Error:", e); } 
      finally { setLoading(false); }
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
    mensajes.forEach(m => m.hallazgos?.forEach(h => h.tema && temasSet.add(clean(h.tema))));
    return Array.from(temasSet).sort();
  }, [mensajes]);

  // Lógica de filtrado extendida con fechas
  const mensajesFiltrados = useMemo(() => {
  return mensajes.filter(m => {
    // 1. Filtros existentes de sentimiento y tema
    const matchS = filtroSentimiento === 'todos' || 
                   m.hallazgos?.some(h => clean(h.sentimiento) === clean(filtroSentimiento));
    const matchT = filtroTopico === 'todos' || 
                   m.hallazgos?.some(h => clean(h.tema) === clean(filtroTopico));

    // 2. Lógica de fecha mejorada
    // Forzamos a que m.fecha sea solo YYYY-MM-DD en caso de que traiga horas
    const fechaMensaje = m.timestamp ? m.timestamp.split('T')[0] : ''; 

    const matchFechaInicio = !fechaInicio || fechaMensaje >= fechaInicio;
    const matchFechaFin = !fechaFin || fechaMensaje <= fechaFin;

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

  // 1. Definir encabezados
  const headers = ["Fecha", "Telefono", "Tema", "Sentimiento", "Mensaje","Analisis"];
  
  // 2. Mapear los datos (aplanamos los hallazgos para que cada uno sea una fila)
  const rows = mensajesFiltrados.flatMap(m => 
    m.hallazgos.map(h => [
      m.timestamp || '',
      m.numero_remitente || '',
      h.tema || '',
      h.sentimiento || '',
      `"${m.texto_mensaje?.replace(/"/g, '""')}"`, // Escapamos comillas en el texto
      `"${h.resumen?.replace(/"/g, '""')}"` // Escapamos comillas en el texto
    ])
  );

  // 3. Unir todo con comas y saltos de línea
  const csvContent = [
    headers.join(","),
    ...rows.map(e => e.join(","))
  ].join("\n");

  // 4. Crear el archivo y disparar la descarga
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `reporte_cafesv_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

  if (loading) return <div style={loadingStyle}>Cargando Insights...</div>;

  return (
    <div style={containerStyle}>
      <header style={headerStyle}>
        <div style={logoStyle}><i className="fas fa-th-large dashboard-icon"></i> CAFESV <span style={{ color: '#3b82f6' }}>INSIGHTS</span></div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <div style={pillStyle}>
            <span style={{ opacity: 0.6 }}>💬</span>
            <div style={{ lineHeight: '1' }}>
              <div style={badgeLabel}>TOTAL MSG</div>
              <div style={badgeValue}>{mensajesFiltrados.length}</div>
            </div>
          </div>
          <div style={{ ...pillStyle, backgroundColor: '#1e293b' }}>
            <span style={{ color: '#3b82f6' }}>#</span>
            <div style={{ lineHeight: '1' }}>
              <div style={{ ...badgeLabel, color: '#3b82f6' }}>INSIGHTS</div>
              <div style={badgeValue}>{hallazgosGraficas.length}</div>
            </div>
          </div>
          <button style={btnAction} onClick={exportarACSV} title="Exportar a CSV"><i className='fas fa-download'></i></button>
        </div>
      </header>

      <div style={mainLayout}>
        <aside style={sidebarStyle}>
          <div style={glassCard}>
            <h4 style={cardHeader}>SENTIMENT CORE</h4>
            <div style={{ flex: 1 }}><SentimentPie data={hallazgosGraficas} /></div>
          </div>
          <div style={glassCard}>
            <h4 style={cardHeader}>TOPIC DISTRIBUTION</h4>
            <div style={{ flex: 1 }}><TopicsBar data={hallazgosGraficas} /></div>
          </div>
        </aside>

        <main style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Barra de Filtros Completa */}
          <div style={filterBar}>
            <select value={limite} onChange={e => setLimite(Number(e.target.value))} style={selectStyle}>
              <option value={3}>Ver 3</option>
              <option value={5}>Ver 5</option>
              <option value={10}>Ver 10</option>
              <option value={100}>Ver 100</option>
            </select>

            <select value={filtroTopico} onChange={e => setFiltroTopico(e.target.value)} style={selectStyle}>
              <option value="todos">Todos los Temas</option>
              {menuTemas.map(t => <option key={t} value={t}>{t}</option>)}
            </select>

            <select value={filtroSentimiento} onChange={e => setFiltroSentimiento(e.target.value)} style={selectStyle}>
              <option value="todos">Todos los Sentimientos</option>
              <option value="POSITIVO">Positivo</option>
              <option value="NEGATIVO">Negativo</option>
              <option value="NEUTRO">Neutro</option>
            </select>

            <div style={dateGroup}>
              <input type="date" value={fechaInicio} onChange={e => setFechaInicio(e.target.value)} style={dateInput} />
              <input type="date" value={fechaFin} onChange={e => setFechaFin(e.target.value)} style={dateInput} />
            </div>

            <button onClick={resetFiltros} style={btnReset}>ⓧ</button>
          </div>
          
          <div style={feedContainer}>
            <MessageFeed mensajes={mensajesFiltrados.slice(0, limite)} />
          </div>
        </main>
      </div>
    </div>
  );
};

// Estilos
const containerStyle = { backgroundColor: '#0b1120', minHeight: '100vh', color: 'white', fontFamily: 'sans-serif' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 40px', borderBottom: '1px solid #1e293b' };
const logoStyle = { fontSize: '20px', fontWeight: '900' };
const pillStyle = { display: 'flex', alignItems: 'center', gap: '10px', background: '#161e2e', padding: '6px 15px', borderRadius: '12px', border: '1px solid #1e293b' };
const badgeLabel = { fontSize: '8px', fontWeight: 'bold', opacity: 0.5 };
const badgeValue = { fontSize: '14px', fontWeight: '800' };
const btnAction = { background: '#1e293b', border: '1px solid #334155', borderRadius: '10px', color: '#3b82f6', padding: '10px', cursor: 'pointer' };
const mainLayout = { display: 'flex', padding: '25px', gap: '25px' };
const sidebarStyle = { width: '380px', display: 'flex', flexDirection: 'column', gap: '25px' };
const glassCard = { background: 'rgba(30, 41, 59, 0.3)', borderRadius: '24px', padding: '24px', border: '1px solid #1e293b', height: '340px', display: 'flex', flexDirection: 'column' };
const cardHeader = { color: '#475569', fontSize: '10px', letterSpacing: '2px', textAlign: 'center', marginBottom: '15px', fontWeight: '800' };
const filterBar = { display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'nowrap', overflowX: 'auto', paddingBottom: '5px' };
const selectStyle = { background: '#1e293b', color: '#94a3b8', border: '1px solid #334155', padding: '8px 12px', borderRadius: '10px', fontSize: '11px', outline: 'none' };
const dateGroup = { display: 'flex', gap: '5px', background: '#1e293b', padding: '4px', borderRadius: '10px', border: '1px solid #334155' };
const dateInput = { background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '11px', padding: '2px', outline: 'none', width: '95px' };
const btnReset = { background: 'transparent', border: 'none', color: '#ef4444', fontSize: '18px', cursor: 'pointer', padding: '0 5px' };
const feedContainer = { flex: 1, overflowY: 'auto' };
const loadingStyle = { color: 'white', padding: '100px', textAlign: 'center', fontSize: '20px' };

export default App;