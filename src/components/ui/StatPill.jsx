import React from 'react';
import { T } from '../../utils/theme';

function StatPill({ icon, label, value, color, alert }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', padding:'0.5rem 0.875rem', background: alert ? `rgba(239,68,68,0.08)` : T.bgCard, border:`1px solid ${alert ? 'rgba(239,68,68,0.3)' : T.border}`, borderRadius:'9px', transition:'all 0.3s' }}>
      <span style={{ color }}>{icon}</span>
      <div>
        <p style={{ margin:0, fontSize:'0.65rem', color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.07em', fontWeight:600 }}>{label}</p>
        <p style={{ margin:0, fontSize:'0.9rem', fontWeight:700, color: alert ? T.red : T.textPrimary }}>{value}</p>
      </div>
    </div>
  );
}

export default StatPill;
