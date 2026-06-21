import React from 'react';
import { T } from '../../utils/theme';
import Avatar from './Avatar';

function PatientCard({ pac }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.875rem', background:T.bgInput, borderRadius:'10px', border:`1px solid ${T.border}`, marginBottom:'1rem' }}>
      <Avatar name={pac.nombre}/>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontWeight:700, color:T.textPrimary, fontSize:'0.9rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{pac.nombre}</p>
        <p style={{ margin:'0.15rem 0 0', fontSize:'0.75rem', color:T.textSecondary, fontFamily:'DM Mono, monospace' }}>RUT: {pac.rut} · {pac.edad ?? '—'} años</p>
        {pac.patologias?.length>0 && <p style={{ margin:'0.2rem 0 0', fontSize:'0.72rem', color:'#f87171' }}>⚠ {pac.patologias.join(', ')}</p>}
        {pac.alergias && <p style={{ margin:0, fontSize:'0.72rem', color:T.amber }}>💊 {pac.alergias}</p>}
      </div>
    </div>
  );
}

export default PatientCard;
