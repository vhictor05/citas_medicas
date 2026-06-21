import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { T } from '../../utils/theme';

function RoleButton({ label, icon, color, desc, disabled, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>!disabled&&setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:'0.875rem', width:'100%', padding:'0.875rem 1rem', background: hov ? `rgba(${color==='#3b82f6'?'59,130,246':color===T.green?'16,185,129':'139,92,246'},0.1)` : T.bgInput, border:`1px solid ${hov?color:T.border}`, borderRadius:'11px', cursor:disabled?'not-allowed':'pointer', fontFamily:'DM Sans, sans-serif', transition:'all 0.18s', textAlign:'left', opacity:disabled?0.45:1 }}>
      <div style={{ width:36, height:36, borderRadius:'9px', background:`rgba(${color==='#3b82f6'?'59,130,246':color===T.green?'16,185,129':'139,92,246'},0.15)`, border:`1px solid rgba(${color==='#3b82f6'?'59,130,246':color===T.green?'16,185,129':'139,92,246'},0.3)`, display:'flex', alignItems:'center', justifyContent:'center', color, flexShrink:0 }}>
        {icon}
      </div>
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontWeight:700, color:T.textPrimary, fontSize:'0.875rem' }}>{label}</p>
        <p style={{ margin:0, color:T.textSecondary, fontSize:'0.72rem', marginTop:'0.1rem' }}>{desc}</p>
      </div>
      {!disabled && <ChevronRight size={16} color={hov?color:T.textMuted} style={{ flexShrink:0, transition:'color 0.18s' }}/>}
      {disabled && <span style={{ fontSize:'0.65rem', color:T.purple, background:T.purpleDim, padding:'0.15rem 0.5rem', borderRadius:'5px', flexShrink:0, fontWeight:600 }}>PRONTO</span>}
    </button>
  );
}

export default RoleButton;
