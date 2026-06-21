import React from 'react';
import { T } from '../../utils/theme';

function SectionTitle({ icon, title, subtitle }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', marginBottom:'1.5rem' }}>
      {icon && <div style={{ width:34, height:34, borderRadius:'9px', background:T.blueDim, border:`1px solid rgba(59,130,246,0.25)`, display:'flex', alignItems:'center', justifyContent:'center', color:T.blue, flexShrink:0 }}>{icon}</div>}
      <div>
        <h2 style={{ color:T.textPrimary, margin:0, fontSize:'1rem', fontWeight:700 }}>{title}</h2>
        {subtitle && <p style={{ color:T.textSecondary, margin:0, fontSize:'0.775rem', marginTop:'0.1rem' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

export default SectionTitle;
