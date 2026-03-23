import React, { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, LabelList } from 'recharts';

const TopicsBar = ({ data }) => {
  const chartData = useMemo(() => {
    const tops = {};
    data.forEach(h => { if (h.tema) { const n = h.tema.trim().toUpperCase(); tops[n] = (tops[n] || 0) + 1; } });
    return Object.keys(tops).map(name => ({ name, count: tops[name] })).sort((a,b) => b.count - a.count).slice(0, 5);
  }, [data]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 30, right: 10, left: 10, bottom: 45 }}>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <XAxis 
          dataKey="name" 
          axisLine={false} 
          tickLine={false} 
          interval={0}
          tick={(p) => (
            <g transform={`translate(${p.x},${p.y})`}>
              <text dy={12} textAnchor="middle" fill="#64748b" transform="rotate(-35)" style={{ fontSize: '9px', fontWeight: '700' }}>
                {p.payload.value.length > 12 ? `${p.payload.value.substring(0, 10)}..` : p.payload.value}
              </text>
            </g>
          )} 
        />
        <YAxis hide />
        <Tooltip cursor={{fill: 'rgba(255,255,255,0.01)'}} contentStyle={{ background: '#0f172a', border: 'none', borderRadius: '8px' }} />
        <Bar dataKey="count" radius={[5, 5, 0, 0]} barSize={28}>
          {chartData.map((_, i) => (
            <Cell 
              key={i} 
              fill={i === 0 ? '#3b82f6' : 'rgba(30, 41, 59, 0.6)'} 
              filter={i === 0 ? "url(#glow)" : "none"}
            />
          ))}
          <LabelList dataKey="count" position="top" style={{ fill: '#94a3b8', fontSize: '11px', fontWeight: '900' }} offset={12} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TopicsBar;