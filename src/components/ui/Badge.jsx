import React from 'react';
import { T } from '../../utils/theme';

function Badge({ estado }) {
  const map = {
    'Agendada':            { bg:'rgba(59,130,246,0.15)', color:'#93c5fd', dot:'#3b82f6' },
    'En espera':           { bg:'rgba(107,133,168,0.15)', color:'#94a3b8', dot:'#6b85a8' },
    'En atención':         { bg:'rgba(245,158,11,0.15)', color:'#fbbf24', dot:'#f59e0b' },
    'Cerrada':             { bg:'rgba(16,185,129,0.15)', color:'#34d399', dot:'#10b981' },
    'Cancelada':           { bg:'rgba(239,68,68,0.15)', color:'#f87171', dot:'#ef4444' },
    'Derivada a urgencia': { bg:'rgba(239,68,68,0.9)', color:'#fff', dot:'#fff' },
  };
  const s = map[estado] || { bg:T.border, color:T.textSecondary, dot:T.textMuted };
  return (
    <span style={{ background:s.bg, color:s.color, padding:'0.2rem 0.6rem 0.2rem 0.5rem', borderRadius:'6px', fontSize:'0.7rem', fontWeight:700, display:'inline-flex', alignItems:'center', gap:'0.35rem', letterSpacing:'0.03em', fontFamily:'DM Mono, monospace' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot, flexShrink:0 }}/>
      {estado}
    </span>
  );
}

export default Badge;
