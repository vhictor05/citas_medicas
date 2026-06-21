import React from 'react';

function Avatar({ name, size=44 }) {
  const initials = name ? name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() : '?';
  return (
    <div style={{ width:size, height:size, borderRadius:'10px', background:'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', border:`1px solid rgba(59,130,246,0.25)`, color:'#93c5fd', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:size*0.32, flexShrink:0, letterSpacing:'0.02em' }}>
      {initials}
    </div>
  );
}

export default Avatar;
