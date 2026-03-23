import React, { useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = { 
  POSITIVO: '#22c55e', 
  NEGATIVO: '#ef4444', 
  NEUTRO: '#64748b' 
};

const SentimentPie = ({ data }) => {
  const chartData = useMemo(() => {
    const counts = { POSITIVO: 0, NEGATIVO: 0, NEUTRO: 0 };
    data.forEach(h => {
      const s = h.sentimiento?.toUpperCase().trim();
      if (counts.hasOwnProperty(s)) counts[s]++;
    });
    return Object.keys(counts)
      .filter(k => counts[k] > 0)
      .map(name => ({ name, value: counts[name] }));
  }, [data]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      display: 'flex', 
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Contenedor del gráfico con altura controlada */}
      <div style={{ width: '100%', height: '200px' }}> 
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie 
              data={chartData} 
              innerRadius="49%" 
              outerRadius="63.5%" 
              paddingAngle={5} 
              dataKey="value" 
              stroke="none"
              cx="50%" 
              cy="30%"
            >
              {chartData.map(e => (
                <Cell 
                  key={e.name} 
                  fill={COLORS[e.name]} 
                  style={{ filter: 'drop-shadow(0px 0px 5px rgba(0,0,0,0.3))' }} 
                />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{ 
                background: '#0f172a', 
                border: '1px solid #1e293b', 
                borderRadius: '8px',
                fontSize: '12px'
              }} 
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Leyenda manual separada del SVG */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '12px', 
        marginTop: '20px',
        width: '100%'
      }}>
        {['NEGATIVO', 'NEUTRO', 'POSITIVO'].map(key => (
          <div key={key} style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '6px', 
            fontSize: '10px', 
            fontWeight: '900',
            color: COLORS[key],
            opacity: chartData.some(d => d.name === key) ? 1 : 0.3
          }}>
            <span style={{ fontSize: '14px' }}>■</span> 
            <span style={{ textTransform: 'lowercase' }}>{key}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SentimentPie;