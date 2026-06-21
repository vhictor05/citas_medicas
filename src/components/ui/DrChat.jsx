import React, { useState, useEffect } from 'react';
import { ChevronRight } from 'lucide-react';
import { T } from '../../utils/theme';

const DR_INFO = {
  inicio: {
    msg: '¡Hola! Soy el Dr. SaludNet 👨‍⚕️ ¿Sobre qué rol te puedo orientar?',
    opts: [
      { label: '🏥 Funcionario', key: 'funcionario' },
      { label: '🩺 Médico',      key: 'medico'      },
    ],
  },
  funcionario: {
    msg: 'El Funcionario de Ventanilla es la puerta de entrada del sistema. Puede buscar pacientes por RUT, registrar nuevos pacientes, agendar consultas, derivar a urgencias y gestionar el retiro de medicamentos. ¿Quieres saber sobre otro rol?',
    opts: [
      { label: '🩺 Médico',    key: 'medico'    },
      { label: '🔙 Volver',    key: 'inicio'    },
    ],
  },
  medico: {
    msg: 'El Médico tiene acceso a su agenda del día con los pacientes priorizados por urgencia. Desde ahí puede iniciar una atención, registrar signos vitales, diagnósticos, emitir recetas o certificados de reposo y cerrar la consulta. ¿Quieres saber sobre otro rol?',
    opts: [
      { label: '🏥 Funcionario', key: 'funcionario' },
      { label: '🔙 Volver',      key: 'inicio'      },
    ],
  },
};

function DrChat() {
  const [open, setOpen]       = useState(false);
  const [step, setStep]       = useState('inicio');
  const [typing, setTyping]   = useState(false);
  const [shown, setShown]     = useState('');

  const current = DR_INFO[step];

  // Efecto typing cuando cambia el step
  useEffect(() => {
    if (!open) return;
    setTyping(true);
    setShown('');
    const full = current.msg;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setShown(full.slice(0, i));
      if (i >= full.length) { clearInterval(interval); setTyping(false); }
    }, 18);
    return () => clearInterval(interval);
  }, [step, open]);

  const handleOpt = (key) => {
    setStep(key);
  };

  return (
    <div style={{ marginTop:'1.5rem', borderTop:`1px solid ${T.border}`, paddingTop:'1rem' }}>
      {/* Botón para abrir */}
      <button onClick={()=>{ setOpen(!open); setStep('inicio'); }}
        style={{ background:'none', border:'none', color: open ? T.textPrimary : T.textSecondary, fontSize:'0.8rem', cursor:'pointer', display:'flex', alignItems:'center', gap:'0.4rem', padding:0, fontFamily:'DM Sans, sans-serif', transition:'color 0.15s', width:'100%' }}
        onMouseEnter={e=>e.currentTarget.style.color=T.textPrimary}
        onMouseLeave={e=>e.currentTarget.style.color= open ? T.textPrimary : T.textSecondary}>
        <ChevronRight size={14} style={{ transform:open?'rotate(90deg)':'none', transition:'transform 0.2s', flexShrink:0 }}/>
        <span>¿Cómo usar cada rol? <span style={{ color:T.blue, fontWeight:600 }}>Pregúntale al Dr. SaludNet</span></span>
      </button>

      {open && (
        <div style={{ marginTop:'0.875rem', animation:'fadeIn 0.25s forwards' }}>
          {/* Burbuja del doctor */}
          <div style={{ display:'flex', gap:'0.6rem', alignItems:'flex-start', marginBottom:'0.875rem' }}>
            {/* Avatar doctor */}
            <div style={{ width:34, height:34, borderRadius:'50%', background:'linear-gradient(135deg, rgba(37,99,235,0.4), rgba(16,185,129,0.3))', border:`1px solid rgba(59,130,246,0.4)`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', flexShrink:0, marginTop:'2px' }}>
              👨‍⚕️
            </div>
            <div style={{ flex:1 }}>
              <p style={{ margin:'0 0 0.2rem', fontSize:'0.68rem', color:T.textMuted, fontWeight:600, textTransform:'uppercase', letterSpacing:'0.06em' }}>Dr. SaludNet</p>
              <div style={{ background:T.bgHover, border:`1px solid ${T.border}`, borderRadius:'0 10px 10px 10px', padding:'0.7rem 0.875rem', minHeight:'2.5rem' }}>
                <p style={{ margin:0, color:T.textPrimary, fontSize:'0.8rem', lineHeight:1.6 }}>
                  {shown}
                  {typing && <span style={{ display:'inline-block', width:'2px', height:'12px', background:T.blue, marginLeft:'2px', animation:'pulse 0.7s ease-in-out infinite', verticalAlign:'middle' }}/>}
                </p>
              </div>
            </div>
          </div>

          {/* Opciones */}
          {!typing && (
            <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem', paddingLeft:'2.6rem', animation:'fadeUp 0.2s forwards' }}>
              {current.opts.map(opt => (
                <button key={opt.key} onClick={()=>handleOpt(opt.key)}
                  style={{ padding:'0.35rem 0.75rem', borderRadius:'20px', border:`1px solid ${T.borderHi}`, background:T.bgInput, color:T.textSecondary, fontSize:'0.75rem', fontWeight:600, cursor:'pointer', fontFamily:'DM Sans, sans-serif', transition:'all 0.15s' }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor=T.blue; e.currentTarget.style.color=T.textPrimary; e.currentTarget.style.background=T.blueDim; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor=T.borderHi; e.currentTarget.style.color=T.textSecondary; e.currentTarget.style.background=T.bgInput; }}>
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default DrChat;
