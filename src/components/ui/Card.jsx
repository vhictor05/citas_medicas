import React from 'react';
import { T } from '../../utils/theme';

function Card({ children, accent, style: ex }) {
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'14px', padding:'1.5rem', boxShadow:'0 4px 24px rgba(0,0,0,0.25)', borderTop: accent ? `2px solid ${accent}` : `1px solid ${T.border}`, ...ex }}>
      {children}
    </div>
  );
}

export default Card;
