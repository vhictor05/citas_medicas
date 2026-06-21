import React, { useState } from 'react';
import { T } from '../../utils/theme';

function Textarea({ ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <textarea {...props}
      onFocus={e=>{setFoc(true); props.onFocus && props.onFocus(e);}}
      onBlur={e=>{setFoc(false); props.onBlur && props.onBlur(e);}}
      style={{ width:'100%', padding:'0.6rem 0.9rem', background:T.bgInput, border:`1px solid ${foc?T.blue:T.border}`, borderRadius:'9px', color:T.textPrimary, fontSize:'0.875rem', fontFamily:'DM Sans, sans-serif', outline:'none', resize:'vertical', minHeight:'90px', transition:'border 0.15s, box-shadow 0.15s', boxShadow: foc ? `0 0 0 3px rgba(59,130,246,0.12)` : 'none', ...props.style }}/>
  );
}

export default Textarea;
