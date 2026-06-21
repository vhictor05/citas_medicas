import React, { useState } from 'react';
import { T } from '../../utils/theme';

function Btn({ children, variant='primary', onClick, disabled, style:extra, size='md' }) {
  const [hov, setHov] = useState(false);
  const vars = {
    primary:      { bg:'#1d4ed8', hbg:'#2563eb', color:'#fff', border:'none', shadow:'0 4px 12px rgba(37,99,235,0.35)' },
    success:      { bg:'#065f46', hbg:'#047857', color:'#6ee7b7', border:`1px solid #059669`, shadow:'0 4px 12px rgba(5,150,105,0.25)' },
    danger:       { bg:T.redDim, hbg:'rgba(239,68,68,0.2)', color:'#f87171', border:`1px solid rgba(239,68,68,0.35)`, shadow:'none' },
    'danger-solid':{ bg:'#991b1b', hbg:'#b91c1c', color:'#fecaca', border:'none', shadow:'0 4px 12px rgba(185,28,28,0.4)' },
    secondary:    { bg:T.bgHover, hbg:'#1a2a40', color:T.textPrimary, border:`1px solid ${T.border}`, shadow:'none' },
    warning:      { bg:T.amberDim, hbg:'rgba(245,158,11,0.2)', color:'#fbbf24', border:`1px solid rgba(245,158,11,0.35)`, shadow:'none' },
  };
  const v = vars[variant] || vars.primary;
  const pad = size==='sm' ? '0.3rem 0.7rem' : '0.6rem 1.1rem';
  const fs  = size==='sm' ? '0.78rem' : '0.85rem';
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', padding:pad, fontSize:fs, fontWeight:600, borderRadius:'9px', border:v.border, background:hov?v.hbg:v.bg, color:v.color, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.45:1, transition:'all 0.18s', fontFamily:'DM Sans, sans-serif', boxShadow: hov ? v.shadow : 'none', letterSpacing:'0.01em', ...extra }}>
      {children}
    </button>
  );
}

export default Btn;
