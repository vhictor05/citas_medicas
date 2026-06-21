import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { T } from '../../utils/theme';

function BackBtn({ onClick, label = 'Volver' }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:hov?T.bgHover:'transparent', border:`1px solid ${hov?T.borderHi:T.border}`, color:T.blue, fontWeight:600, fontSize:'0.825rem', cursor:'pointer', marginBottom:'1.5rem', padding:'0.4rem 0.75rem', borderRadius:'8px', transition:'all 0.2s', fontFamily:'inherit' }}>
      <ArrowLeft size={14}/> {label}
    </button>
  );
}

export default BackBtn;
