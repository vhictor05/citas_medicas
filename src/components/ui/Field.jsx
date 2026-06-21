import React from 'react';
import { T } from '../../utils/theme';

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <label style={{ display:'block', fontSize:'0.72rem', fontWeight:600, color:T.textSecondary, marginBottom:'0.4rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</label>
      {children}
    </div>
  );
}

export default Field;
