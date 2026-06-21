import React from 'react';
import { ChevronRight } from 'lucide-react';
import { T } from '../../utils/theme';

function Breadcrumb({ steps }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.35rem', marginBottom:'1.75rem', fontSize:'0.775rem' }}>
      {steps.map((s,i) => (
        <React.Fragment key={i}>
          {i>0 && <ChevronRight size={12} color={T.textMuted}/>}
          <span onClick={s.onClick} style={{ color: i===steps.length-1 ? T.textPrimary : T.blue, fontWeight: i===steps.length-1 ? 600 : 400, cursor: i<steps.length-1 && s.onClick ? 'pointer' : 'default', transition:'color 0.15s' }}>
            {s.label}
          </span>
        </React.Fragment>
      ))}
    </div>
  );
}

export default Breadcrumb;
