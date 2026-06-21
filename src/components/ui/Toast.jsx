import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle } from 'lucide-react';
import { T } from '../../utils/theme';

function Toast({ toast }) {
  if (!toast) return null;
  const map = { success:[T.green,'rgba(16,185,129,0.15)'], error:[T.red,'rgba(239,68,68,0.15)'], warning:[T.amber,'rgba(245,158,11,0.15)'] };
  const [clr, bg] = map[toast.type] || map.success;
  return (
    <div style={{ position:'fixed', bottom:'1.75rem', right:'1.75rem', zIndex:10000, background:T.bgCard, padding:'0.875rem 1.25rem', borderRadius:'12px', boxShadow:`0 20px 40px rgba(0,0,0,0.6), 0 0 0 1px ${T.border}`, borderLeft:`3px solid ${clr}`, display:'flex', alignItems:'center', gap:'0.75rem', animation:'fadeUp 0.3s forwards', maxWidth:'360px', backdropFilter:'blur(8px)' }}>
      <div style={{ width:32, height:32, borderRadius:'8px', background:bg, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        {toast.type==='success' ? <CheckCircle2 size={16} color={clr}/> : toast.type==='warning' ? <AlertTriangle size={16} color={clr}/> : <AlertCircle size={16} color={clr}/>}
      </div>
      <span style={{ color:T.textPrimary, fontWeight:500, fontSize:'0.875rem', lineHeight:1.4 }}>{toast.msg}</span>
    </div>
  );
}

export default Toast;
