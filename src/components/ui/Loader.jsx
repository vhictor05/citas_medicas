import React from 'react';
import { Heart } from 'lucide-react';
import { T, css } from '../../utils/theme';

function Loader({ text = 'Procesando...' }) {
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(10,15,26,0.85)', backdropFilter:'blur(6px)', zIndex:9999, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:'1.25rem' }}>
      <style>{css}</style>
      <div style={{ position:'relative', width:52, height:52 }}>
        <div style={{ position:'absolute', inset:0, border:`3px solid ${T.border}`, borderRadius:'50%' }} />
        <div style={{ position:'absolute', inset:0, border:`3px solid transparent`, borderTopColor:T.blue, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
        <Heart size={20} color={T.blue} style={{ position:'absolute', top:'50%', left:'50%', transform:'translate(-50%,-50%)', animation:'pulse 1.4s ease-in-out infinite' }} />
      </div>
      <p style={{ color:T.textSecondary, fontWeight:500, fontSize:'0.875rem', letterSpacing:'0.02em' }}>{text}</p>
    </div>
  );
}

export default Loader;
