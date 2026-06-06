import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Stethoscope, Users, Search, CalendarPlus, LogOut, Pill,
  Clock, CheckCircle2, AlertCircle, ArrowLeft, UserPlus,
  RefreshCw, AlertTriangle, FileText, ChevronRight, Activity,
  Heart, Shield, ClipboardList
} from 'lucide-react';

// ========================
// DESIGN TOKENS
// ========================
const T = {
  // Fondos
  bg:       '#0a0f1a',
  bgCard:   '#0e1623',
  bgInput:  '#080d16',
  bgHover:  '#131d2e',
  // Bordes
  border:   '#1a2640',
  borderHi: '#2a3f60',
  // Texto
  textPrimary:   '#e8f0fe',
  textSecondary: '#6b85a8',
  textMuted:     '#3d5275',
  // Acentos
  blue:    '#3b82f6',
  blueDim: 'rgba(59,130,246,0.12)',
  green:   '#10b981',
  greenDim:'rgba(16,185,129,0.12)',
  red:     '#ef4444',
  redDim:  'rgba(239,68,68,0.12)',
  amber:   '#f59e0b',
  amberDim:'rgba(245,158,11,0.12)',
  purple:  '#8b5cf6',
  purpleDim:'rgba(139,92,246,0.12)',
};

const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; font-family: 'DM Sans', sans-serif; color: ${T.textPrimary}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
  @keyframes ecgMove { from { transform: translateX(0); } to { transform: translateX(-50%); } }
`;

// ========================
// UTILITY COMPONENTS
// ========================

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

function BackBtn({ onClick, label = 'Volver' }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', gap:'0.4rem', background:hov?T.bgHover:'transparent', border:`1px solid ${hov?T.borderHi:T.border}`, color:T.blue, fontWeight:600, fontSize:'0.825rem', cursor:'pointer', marginBottom:'1.5rem', padding:'0.4rem 0.75rem', borderRadius:'8px', transition:'all 0.2s', fontFamily:'inherit' }}>
      <ArrowLeft size={14}/> {label}
    </button>
  );
}

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

function Badge({ estado }) {
  const map = {
    'Agendada':            { bg:'rgba(59,130,246,0.15)', color:'#93c5fd', dot:'#3b82f6' },
    'En espera':           { bg:'rgba(107,133,168,0.15)', color:'#94a3b8', dot:'#6b85a8' },
    'En atención':         { bg:'rgba(245,158,11,0.15)', color:'#fbbf24', dot:'#f59e0b' },
    'Cerrada':             { bg:'rgba(16,185,129,0.15)', color:'#34d399', dot:'#10b981' },
    'Cancelada':           { bg:'rgba(239,68,68,0.15)', color:'#f87171', dot:'#ef4444' },
    'Derivada a urgencia': { bg:'rgba(239,68,68,0.9)', color:'#fff', dot:'#fff' },
  };
  const s = map[estado] || { bg:T.border, color:T.textSecondary, dot:T.textMuted };
  return (
    <span style={{ background:s.bg, color:s.color, padding:'0.2rem 0.6rem 0.2rem 0.5rem', borderRadius:'6px', fontSize:'0.7rem', fontWeight:700, display:'inline-flex', alignItems:'center', gap:'0.35rem', letterSpacing:'0.03em', fontFamily:'DM Mono, monospace' }}>
      <span style={{ width:5, height:5, borderRadius:'50%', background:s.dot, flexShrink:0 }}/>
      {estado}
    </span>
  );
}

function Card({ children, accent, style: ex }) {
  return (
    <div style={{ background:T.bgCard, border:`1px solid ${T.border}`, borderRadius:'14px', padding:'1.5rem', boxShadow:'0 4px 24px rgba(0,0,0,0.25)', borderTop: accent ? `2px solid ${accent}` : `1px solid ${T.border}`, ...ex }}>
      {children}
    </div>
  );
}

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

function Field({ label, children }) {
  return (
    <div style={{ marginBottom:'1rem' }}>
      <label style={{ display:'block', fontSize:'0.72rem', fontWeight:600, color:T.textSecondary, marginBottom:'0.4rem', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <input {...props}
      onFocus={e=>{setFoc(true); props.onFocus && props.onFocus(e);}}
      onBlur={e=>{setFoc(false); props.onBlur && props.onBlur(e);}}
      style={{ width:'100%', padding:'0.6rem 0.9rem', background:T.bgInput, border:`1px solid ${foc?T.blue:T.border}`, borderRadius:'9px', color:T.textPrimary, fontSize:'0.875rem', fontFamily:'DM Sans, sans-serif', outline:'none', transition:'border 0.15s, box-shadow 0.15s', boxShadow: foc ? `0 0 0 3px rgba(59,130,246,0.12)` : 'none', ...props.style }}/>
  );
}

function Textarea({ ...props }) {
  const [foc, setFoc] = useState(false);
  return (
    <textarea {...props}
      onFocus={e=>{setFoc(true); props.onFocus && props.onFocus(e);}}
      onBlur={e=>{setFoc(false); props.onBlur && props.onBlur(e);}}
      style={{ width:'100%', padding:'0.6rem 0.9rem', background:T.bgInput, border:`1px solid ${foc?T.blue:T.border}`, borderRadius:'9px', color:T.textPrimary, fontSize:'0.875rem', fontFamily:'DM Sans, sans-serif', outline:'none', resize:'vertical', minHeight:'90px', transition:'border 0.15s, box-shadow 0.15s', boxShadow: foc ? `0 0 0 3px rgba(59,130,246,0.12)` : 'none', ...props.style }}/>
  );
}

function Btn({ children, variant='primary', onClick, disabled, style:extra, size='md' }) {
  const [hov, setHov] = useState(false);
  const vars = {
    primary:      { bg:'#1d4ed8', hbg:'#2563eb', color:'#fff', border:'none', shadow:'0 4px 12px rgba(37,99,235,0.35)' },
    success:      { bg:'#065f46', hbg:'#047857', color:'#6ee7b7', border:`1px solid #059669`, shadow:'0 4px 12px rgba(5,150,105,0.25)' },
    danger:       { bg:T.redDim, hbg:'rgba(239,68,68,0.2)', color:'#f87171', border:`1px solid rgba(239,68,68,0.35)`, shadow:'none' },
    'danger-solid':{ bg:'#991b1b', hbg:'#b91c1c', color:'#fecaca', border:'none', shadow:'0 4px 12px rgba(185,28,28,0.4)' },
    secondary:    { bg:T.bgHover, hbg:'#1a2a40', color:T.textPrimary, border:`1px solid ${T.border}`, shadow:'none' },
    warning:      { bg:T.amberDim, hbg:'rgba(245,158,11,0.2)', color:'#fbbf24', border:`1px solid rgba(245,158,11,0.35)`, shadow:'none' },
  };
  const v = vars[variant] || vars.primary;
  const pad = size==='sm' ? '0.3rem 0.7rem' : '0.6rem 1.1rem';
  const fs  = size==='sm' ? '0.78rem' : '0.85rem';
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'inline-flex', alignItems:'center', justifyContent:'center', gap:'0.4rem', padding:pad, fontSize:fs, fontWeight:600, borderRadius:'9px', border:v.border, background:hov?v.hbg:v.bg, color:v.color, cursor:disabled?'not-allowed':'pointer', opacity:disabled?0.45:1, transition:'all 0.18s', fontFamily:'DM Sans, sans-serif', boxShadow: hov ? v.shadow : 'none', letterSpacing:'0.01em', ...extra }}>
      {children}
    </button>
  );
}

function Avatar({ name, size=44 }) {
  const initials = name ? name.split(' ').slice(0,2).map(w=>w[0]).join('').toUpperCase() : '?';
  return (
    <div style={{ width:size, height:size, borderRadius:'10px', background:'linear-gradient(135deg, rgba(59,130,246,0.2), rgba(139,92,246,0.2))', border:`1px solid rgba(59,130,246,0.25)`, color:'#93c5fd', display:'flex', alignItems:'center', justifyContent:'center', fontWeight:700, fontSize:size*0.32, flexShrink:0, letterSpacing:'0.02em' }}>
      {initials}
    </div>
  );
}

function PatientCard({ pac }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', padding:'0.875rem', background:T.bgInput, borderRadius:'10px', border:`1px solid ${T.border}`, marginBottom:'1rem' }}>
      <Avatar name={pac.nombre}/>
      <div style={{ flex:1, minWidth:0 }}>
        <p style={{ margin:0, fontWeight:700, color:T.textPrimary, fontSize:'0.9rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{pac.nombre}</p>
        <p style={{ margin:'0.15rem 0 0', fontSize:'0.75rem', color:T.textSecondary, fontFamily:'DM Mono, monospace' }}>RUT: {pac.rut} · {pac.edad ?? '—'} años</p>
        {pac.patologias?.length>0 && <p style={{ margin:'0.2rem 0 0', fontSize:'0.72rem', color:'#f87171' }}>⚠ {pac.patologias.join(', ')}</p>}
        {pac.alergias && <p style={{ margin:0, fontSize:'0.72rem', color:T.amber }}>💊 {pac.alergias}</p>}
      </div>
    </div>
  );
}

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

// ========================
// ECG BACKGROUND — pulsos sueltos
// ========================
function EcgBackground() {
  const [pulsos, setPulsos] = useState([]);

  // Path de un pulso corto: línea base + 1 ciclo QRS + línea base
  // Ancho total ~80px, centrado en y=40 dentro de viewBox 80x80
  const pulsePath = "M0,40 L15,40 L18,37 L20,40 L24,40 L26,15 L28,58 L30,40 L36,33 L40,40 L55,40";

  useEffect(() => {
    const COLORS = ['#ef4444', '#10b981']; // rojo y verde únicamente
    let idCounter = 0;

    const spawnPulso = () => {
      const id      = idCounter++;
      const topPct  = 10 + Math.random() * 80;          // posición vertical aleatoria
      const color   = COLORS[Math.floor(Math.random() * COLORS.length)];
      const dur     = 6000 + Math.random() * 5000;      // duración 6s–11s (cruce lento)
      const scale   = 0.7 + Math.random() * 0.6;        // tamaño variable
      const opacity = 0.25 + Math.random() * 0.2;       // opacidad variable

      setPulsos(prev => [...prev, { id, topPct, color, dur, scale, opacity, born: Date.now() }]);

      setTimeout(() => {
        setPulsos(prev => prev.filter(p => p.id !== id));
      }, dur + 200);
    };

    // Solo 1 pulso inicial al arrancar
    setTimeout(spawnPulso, 600);

    // Nuevos pulsos esporádicos: cada 3s–7s
    const scheduleNext = () => {
      const wait = 3000 + Math.random() * 4000;
      return setTimeout(() => {
        spawnPulso();
        timeoutRef.current = scheduleNext();
      }, wait);
    };
    const timeoutRef = { current: null };
    timeoutRef.current = scheduleNext();

    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
      {pulsos.map(p => {
        const w = 55 * p.scale; // ancho del SVG en px
        const h = 80 * p.scale;
        return (
          <div key={p.id} style={{
            position: 'absolute',
            top: `${p.topPct}%`,
            left: '-80px',
            transform: 'translateY(-50%)',
            width: `${w}px`,
            height: `${h}px`,
            animation: `ecgPulso ${p.dur}ms linear forwards`,
          }}>
            <svg width={w} height={h} viewBox="0 0 55 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`pg${p.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor={p.color} stopOpacity="0"/>
                  <stop offset="25%"  stopColor={p.color} stopOpacity={p.opacity}/>
                  <stop offset="75%"  stopColor={p.color} stopOpacity={p.opacity}/>
                  <stop offset="100%" stopColor={p.color} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path
                d={pulsePath}
                fill="none"
                stroke={`url(#pg${p.id})`}
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      })}
      <style>{`
        @keyframes ecgPulso {
          from { transform: translateY(-50%) translateX(0); }
          to   { transform: translateY(-50%) translateX(120vw); }
        }
      `}</style>
    </div>
  );
}

// ========================
// DR. CHAT — asistente del login
// ========================
const DR_INFO = {
  inicio: {
    msg: '¡Hola! Soy el Dr. SaludNet 👨‍⚕️ ¿Sobre qué rol te puedo orientar?',
    opts: [
      { label: '🏥 Funcionario', key: 'funcionario' },
      { label: '🩺 Médico',      key: 'medico'      },
      { label: '💉 Enfermero',   key: 'enfermero'   },
    ],
  },
  funcionario: {
    msg: 'El Funcionario de Ventanilla es la puerta de entrada del sistema. Puede buscar pacientes por RUT, registrar nuevos pacientes, agendar consultas, derivar a urgencias y gestionar el retiro de medicamentos. ¿Quieres saber sobre otro rol?',
    opts: [
      { label: '🩺 Médico',    key: 'medico'    },
      { label: '💉 Enfermero', key: 'enfermero' },
      { label: '🔙 Volver',    key: 'inicio'    },
    ],
  },
  medico: {
    msg: 'El Médico tiene acceso a su agenda del día con los pacientes priorizados por urgencia. Desde ahí puede iniciar una atención, registrar signos vitales, diagnósticos, emitir recetas o certificados de reposo y cerrar la consulta. ¿Quieres saber sobre otro rol?',
    opts: [
      { label: '🏥 Funcionario', key: 'funcionario' },
      { label: '💉 Enfermero',   key: 'enfermero'   },
      { label: '🔙 Volver',      key: 'inicio'      },
    ],
  },
  enfermero: {
    msg: 'El módulo de Enfermero está en construcción. Próximamente permitirá gestionar procedimientos de enfermería, curaciones y administración de medicamentos directamente desde el sistema. ¿Quieres saber sobre otro rol?',
    opts: [
      { label: '🏥 Funcionario', key: 'funcionario' },
      { label: '🩺 Médico',      key: 'medico'      },
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

// ========================
// APP ROOT
// ========================

export default function App() {
  const [role, setRole]               = useState(null);
  const [view, setView]               = useState('dashboard');
  const [loading, setLoading]         = useState(false);
  const [loadingText, setLoadingText] = useState('Procesando...');
  const [toast, setToast]             = useState(null);
  const [consultas, setConsultas]     = useState([]);
  const [activePatient, setActivePatient]   = useState(null);
  const [activeConsulta, setActiveConsulta] = useState(null);

  const showToast = (msg, type='success', duration=4000) => {
    setToast({ msg, type });
    setTimeout(()=>setToast(null), duration);
  };

  const load = async (fn, text='Cargando...') => {
    setLoadingText(text); setLoading(true);
    try { await fn(); }
    catch(err) { console.error(err); showToast(err?.message||'Error al conectar con Supabase','error'); }
    finally { setLoading(false); }
  };

  const loadConsultas = async () => {
    const { data, error } = await supabase.from('consultas').select('*, pacientes(nombre,rut,edad)').order('created_at',{ascending:false}).limit(30);
    if (error) throw error;
    setConsultas(data||[]);
  };

  const loadAgendaMedica = async () => {
    const { data, error } = await supabase.from('consultas').select('*, pacientes(*)').in('estado',['Agendada','En espera','En atención','Derivada a urgencia']).order('created_at',{ascending:true}).limit(20);
    if (error) throw error;
    const sorted = (data||[]).sort((a,b)=>{
      if (a.estado==='En atención' && b.estado!=='En atención') return -1;
      if (b.estado==='En atención' && a.estado!=='En atención') return 1;
      if (a.urgencia && !b.urgencia) return -1;
      if (!a.urgencia && b.urgencia) return 1;
      return new Date(a.created_at||0)-new Date(b.created_at||0);
    });
    setConsultas(sorted);
  };

  useEffect(()=>{
    if (!role) return;
    if (role==='funcionario') load(loadConsultas,'Cargando consultas...').catch(e=>showToast(e.message,'error'));
    if (role==='medico') load(loadAgendaMedica,'Cargando agenda...').catch(e=>showToast(e.message,'error'));
  },[role]);

  const goTo = (v) => setView(v);

  // ── Pantalla Selección de Rol ──
  if (!role) {
    const roles = [
      { label:'Funcionario de Ventanilla', role:'funcionario', icon:<Users size={20}/>, color:T.blue,   desc:'Recepción, agendamiento y retiro de medicamentos' },
      { label:'Médico',                    role:'medico',      icon:<Stethoscope size={20}/>, color:T.green, desc:'Agenda de pacientes y registro clínico' },
      { label:'Enfermero',                 role:'enfermero',   icon:<Activity size={20}/>,    color:T.purple, desc:'Módulo en construcción — próximamente disponible', disabled:true },
    ];
    return (
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:T.bg, position:'relative', overflow:'hidden' }}>
        <style>{css}</style>
        {/* Fondo decorativo */}
        <div style={{ position:'absolute', top:'-20%', left:'-10%', width:'60vw', height:'60vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(59,130,246,0.06) 0%, transparent 70%)', pointerEvents:'none' }}/>
        <div style={{ position:'absolute', bottom:'-15%', right:'-5%', width:'45vw', height:'45vw', borderRadius:'50%', background:'radial-gradient(circle, rgba(139,92,246,0.05) 0%, transparent 70%)', pointerEvents:'none' }}/>
        {/* Grid decorativo */}
        <div style={{ position:'absolute', inset:0, backgroundImage:`linear-gradient(${T.border} 1px, transparent 1px), linear-gradient(90deg, ${T.border} 1px, transparent 1px)`, backgroundSize:'60px 60px', opacity:0.3, pointerEvents:'none' }}/>
        {/* ECG animado */}
        <EcgBackground/>

        <div style={{ position:'relative', zIndex:1, background:`linear-gradient(160deg, ${T.bgCard} 0%, rgba(14,22,35,0.97) 100%)`, border:`1px solid ${T.border}`, borderRadius:'20px', padding:'2.5rem 2rem', maxWidth:'400px', width:'90%', boxShadow:'0 32px 64px rgba(0,0,0,0.6)', animation:'fadeUp 0.5s forwards' }}>
          {/* Logo */}
          <div style={{ textAlign:'center', marginBottom:'2rem' }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'0.6rem', margin:'0 auto 1rem' }}>
              <div style={{ width:60, height:60, borderRadius:'16px', background:'linear-gradient(135deg, rgba(29,78,216,0.4), rgba(37,99,235,0.2))', border:`1px solid rgba(59,130,246,0.35)`, display:'flex', alignItems:'center', justifyContent:'center', color:T.blue, boxShadow:'0 8px 24px rgba(37,99,235,0.2)' }}>
                <Stethoscope size={28}/>
              </div>
              <div style={{ width:60, height:60, borderRadius:'16px', background:'linear-gradient(135deg, rgba(220,38,38,0.35), rgba(239,68,68,0.15))', border:'1px solid rgba(239,68,68,0.4)', display:'flex', alignItems:'center', justifyContent:'center', boxShadow:'0 8px 24px rgba(239,68,68,0.2)' }}>
                <Heart size={28} color="#ef4444" fill="#ef4444"/>
              </div>
            </div>
            <h1 style={{ color:T.textPrimary, margin:'0 0 0.25rem', fontSize:'1.6rem', fontWeight:800, letterSpacing:'-0.02em' }}>SaludNet</h1>
            <p style={{ color:T.textSecondary, margin:0, fontSize:'0.825rem' }}>Sistema de Gestión de Atención Médica</p>
          </div>

          {/* Botones de rol */}
          <div style={{ display:'flex', flexDirection:'column', gap:'0.625rem' }}>
            {roles.map(r=>(
              <RoleButton key={r.role} {...r} onClick={()=>{ if(!r.disabled){ setRole(r.role); setView('dashboard'); } }}/>
            ))}
          </div>

          {/* Mini chat Dr. SaludNet */}
          <DrChat />
        </div>
      </div>
    );
  }

  // ── App Shell ──
  const roleLabels = { funcionario:'Ventanilla', medico:'Médico', enfermero:'Enfermero' };
  const roleColors = { funcionario:T.blue, medico:T.green, enfermero:T.purple };
  return (
    <div style={{ minHeight:'100vh', background:T.bg, fontFamily:'DM Sans, sans-serif' }}>
      <style>{css}</style>
      {loading && <Loader text={loadingText}/>}
      <Toast toast={toast}/>

      {/* Header */}
      <header style={{ background:`linear-gradient(90deg, ${T.bgCard} 0%, rgba(14,22,35,0.98) 100%)`, borderBottom:`1px solid ${T.border}`, padding:'0.875rem 2rem', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:100, backdropFilter:'blur(8px)' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ background:'linear-gradient(135deg, #1d4ed8, #2563eb)', color:'#fff', padding:'0.45rem', borderRadius:'9px', display:'flex', boxShadow:'0 4px 12px rgba(37,99,235,0.4)' }}>
            <Stethoscope size={18}/>
          </div>
          <div>
            <span style={{ color:T.textPrimary, fontWeight:800, fontSize:'1rem', letterSpacing:'-0.01em' }}>SaludNet</span>
            <span style={{ color:T.textMuted, fontSize:'0.7rem', display:'block', marginTop:'-1px' }}>Sistema de Gestión Médica</span>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'0.75rem' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', padding:'0.3rem 0.75rem', background:T.bgHover, border:`1px solid ${T.border}`, borderRadius:'8px' }}>
            <div style={{ width:7, height:7, borderRadius:'50%', background:roleColors[role], boxShadow:`0 0 6px ${roleColors[role]}` }}/>
            <span style={{ color:T.textSecondary, fontSize:'0.78rem', fontWeight:600 }}>{roleLabels[role]}</span>
          </div>
          <Btn variant="secondary" onClick={()=>{ setRole(null); setView('dashboard'); }}><LogOut size={14}/> Cambiar Rol</Btn>
        </div>
      </header>

      <main style={{ maxWidth:'1200px', margin:'0 auto', padding:'2rem' }}>
        {role==='funcionario' && view==='dashboard'      && <FuncDashboard consultas={consultas} goTo={goTo} showToast={showToast} load={load} loadConsultas={loadConsultas}/>}
        {role==='funcionario' && view==='nueva-atencion' && <FuncNuevaAtencion goTo={goTo} showToast={showToast} load={load} activePatient={activePatient} setActivePatient={setActivePatient}/>}
        {role==='funcionario' && view==='retiro'         && <FuncRetiro goTo={goTo} showToast={showToast} load={load}/>}
        {role==='medico'      && view==='dashboard'      && <MedicoDashboard consultas={consultas} goTo={goTo} showToast={showToast} load={load} loadAgenda={loadAgendaMedica} setActiveConsulta={setActiveConsulta} setActivePatient={setActivePatient}/>}
        {role==='medico'      && view==='atencion'       && <MedicoAtencion consulta={activeConsulta} paciente={activePatient} goTo={goTo} showToast={showToast} load={load}/>}
        {role==='enfermero'   && view==='dashboard'      && (
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', minHeight:'60vh', gap:'1.5rem', animation:'fadeUp 0.4s forwards' }}>
            <div style={{ width:72, height:72, borderRadius:'20px', background:T.purpleDim, border:`1px solid rgba(139,92,246,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', color:T.purple }}>
              <Activity size={32}/>
            </div>
            <div style={{ textAlign:'center' }}>
              <h2 style={{ color:T.textPrimary, margin:'0 0 0.5rem', fontWeight:700 }}>Módulo en construcción</h2>
              <p style={{ color:T.textSecondary, fontSize:'0.875rem' }}>El panel de Enfermero estará disponible próximamente.</p>
            </div>
            <Btn variant="secondary" onClick={()=>setRole(null)}><ArrowLeft size={15}/> Volver a Selección de Rol</Btn>
          </div>
        )}
      </main>
    </div>
  );
}

function RoleButton({ label, icon, color, desc, disabled, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} onMouseEnter={()=>!disabled&&setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ display:'flex', alignItems:'center', gap:'0.875rem', width:'100%', padding:'0.875rem 1rem', background: hov ? `rgba(${color==='#3b82f6'?'59,130,246':color===T.green?'16,185,129':'139,92,246'},0.1)` : T.bgInput, border:`1px solid ${hov?color:T.border}`, borderRadius:'11px', cursor:disabled?'not-allowed':'pointer', fontFamily:'DM Sans, sans-serif', transition:'all 0.18s', textAlign:'left', opacity:disabled?0.45:1 }}>
      <div style={{ width:36, height:36, borderRadius:'9px', background:`rgba(${color==='#3b82f6'?'59,130,246':color===T.green?'16,185,129':'139,92,246'},0.15)`, border:`1px solid rgba(${color==='#3b82f6'?'59,130,246':color===T.green?'16,185,129':'139,92,246'},0.3)`, display:'flex', alignItems:'center', justifyContent:'center', color, flexShrink:0 }}>
        {icon}
      </div>
      <div style={{ flex:1 }}>
        <p style={{ margin:0, fontWeight:700, color:T.textPrimary, fontSize:'0.875rem' }}>{label}</p>
        <p style={{ margin:0, color:T.textSecondary, fontSize:'0.72rem', marginTop:'0.1rem' }}>{desc}</p>
      </div>
      {!disabled && <ChevronRight size={16} color={hov?color:T.textMuted} style={{ flexShrink:0, transition:'color 0.18s' }}/>}
      {disabled && <span style={{ fontSize:'0.65rem', color:T.purple, background:T.purpleDim, padding:'0.15rem 0.5rem', borderRadius:'5px', flexShrink:0, fontWeight:600 }}>PRONTO</span>}
    </button>
  );
}

// ========================
// FUNCIONARIO – DASHBOARD
// ========================
function FuncDashboard({ consultas, goTo, showToast, load, loadConsultas }) {
  const marcarLlegada = (id) => load(async()=>{
    const { error } = await supabase.from('consultas').update({estado:'En espera'}).eq('id',id);
    if (error) throw error;
    showToast('Paciente marcado como En espera');
    await loadConsultas();
  },'Actualizando...');

  const reasignarMedico = (id) => {
    const nuevo = window.prompt('Ingrese el nombre del nuevo médico:');
    if (!nuevo) return;
    load(async()=>{
      const { error } = await supabase.from('consultas').update({medico_asignado:nuevo}).eq('id',id);
      if (error) throw error;
      showToast('Médico reasignado');
      await loadConsultas();
    },'Reasignando...');
  };

  const stats = {
    total: consultas.length,
    urgencias: consultas.filter(c=>c.urgencia).length,
    enAtencion: consultas.filter(c=>c.estado==='En atención').length,
  };

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ animation:'fadeUp 0.4s forwards' }}>

      {/* Banner de bienvenida Funcionario */}
      <div style={{ background:'linear-gradient(120deg, rgba(29,78,216,0.18) 0%, rgba(37,99,235,0.08) 100%)', border:`1px solid rgba(59,130,246,0.2)`, borderLeft:`4px solid ${T.blue}`, borderRadius:'14px', padding:'1.25rem 1.5rem', marginBottom:'1.75rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ width:48, height:48, borderRadius:'12px', background:'rgba(59,130,246,0.15)', border:`1px solid rgba(59,130,246,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', color:T.blue, flexShrink:0 }}>
            <Users size={24}/>
          </div>
          <div>
            <p style={{ margin:0, fontSize:'0.75rem', color:T.blue, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Ventanilla de Recepción</p>
            <h1 style={{ margin:'0.1rem 0 0', color:T.textPrimary, fontSize:'1.3rem', fontWeight:800, letterSpacing:'-0.02em' }}>{saludo}, Funcionario</h1>
            <p style={{ margin:0, color:T.textSecondary, fontSize:'0.8rem' }}>{new Date().toLocaleDateString('es-CL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}</p>
          </div>
        </div>
        <div style={{ display:'flex', gap:'0.6rem', flexWrap:'wrap' }}>
          <Btn variant="secondary" onClick={()=>load(loadConsultas,'Actualizando...')}><RefreshCw size={14}/> Actualizar</Btn>
          <Btn variant="secondary" onClick={()=>goTo('retiro')}><Pill size={14}/> Retiro Medicamentos</Btn>
          <Btn variant="primary" onClick={()=>goTo('nueva-atencion')}><CalendarPlus size={14}/> Nueva Atención</Btn>
        </div>
      </div>

      {/* Stats dinámicos */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <StatPill icon={<ClipboardList size={16}/>} label="Total" value={stats.total} color={T.blue}/>
        <StatPill icon={<Activity size={16}/>} label="En Atención" value={stats.enAtencion} color={stats.enAtencion>0?T.amber:T.textMuted}/>
        <StatPill icon={<AlertTriangle size={16}/>} label="Urgencias" value={stats.urgencias} color={stats.urgencias>0?T.red:T.textMuted} alert={stats.urgencias>0}/>
      </div>

      <Card>
        {consultas.length===0 ? (
          <div style={{ textAlign:'center', padding:'3.5rem 0', color:T.textMuted }}>
            <ClipboardList size={40} style={{ margin:'0 auto 1rem', display:'block', opacity:0.4 }}/>
            <p style={{ margin:0, fontSize:'0.9rem' }}>No hay consultas registradas hoy.</p>
          </div>
        ) : consultas.map((c,i)=>(
          <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1.1rem 0', borderBottom: i<consultas.length-1 ? `1px solid ${T.border}` : 'none', gap:'1rem', flexWrap:'wrap', animation:'slideIn 0.3s forwards', animationDelay:`${i*0.04}s`, opacity:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', flex:1, minWidth:0 }}>
              <Avatar name={c.pacientes?.nombre||c.paciente_rut} size={38}/>
              <div style={{ minWidth:0 }}>
                <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.35rem', flexWrap:'wrap' }}>
                  <Badge estado={c.estado}/>
                  {c.urgencia && <Badge estado="Derivada a urgencia"/>}
                </div>
                <p style={{ margin:0, fontWeight:700, color:T.textPrimary, fontSize:'0.875rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{c.pacientes?.nombre||c.paciente_rut}</p>
                <p style={{ margin:'0.15rem 0 0', fontSize:'0.75rem', color:T.textSecondary, fontFamily:'DM Mono, monospace' }}>
                  {c.paciente_rut} · {c.motivo}
                </p>
              </div>
            </div>
            <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'0.45rem', flexShrink:0 }}>
              <span style={{ color:T.textMuted, fontSize:'0.72rem', display:'flex', alignItems:'center', gap:'0.3rem', fontFamily:'DM Mono, monospace' }}>
                <Clock size={11}/> {c.hora||'--:--'} · {c.medico_asignado||'Sin médico'}
              </span>
              {c.estado==='Agendada' && (
                <div style={{ display:'flex', gap:'0.4rem' }}>
                  <Btn size="sm" variant="secondary" onClick={()=>reasignarMedico(c.id)}>Reasignar</Btn>
                  <Btn size="sm" variant="primary" onClick={()=>marcarLlegada(c.id)}><CheckCircle2 size={12}/> Llegada</Btn>
                </div>
              )}
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}

// ========================
// FUNCIONARIO – NUEVA ATENCIÓN
// ========================
function FuncNuevaAtencion({ goTo, showToast, load, activePatient, setActivePatient }) {
  const [paso, setPaso]           = useState(1);
  const [rut, setRut]             = useState('');
  const [showCrear, setShowCrear] = useState(false);
  const [nuevoPac, setNuevoPac]   = useState({ nombre:'', edad:'', direccion:'', telefono:'', email:'', alergias:'' });
  const [atencion, setAtencion]   = useState({ motivo:'', medico:'', urgencia:false, hora:'' });
  const HORAS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00'];

  const buscar = () => load(async()=>{
    if (!rut.trim()) { showToast('Ingrese un RUT','warning'); return; }
    setActivePatient(null); setShowCrear(false);
    const { data, error } = await supabase.from('pacientes').select('*').eq('rut',rut.trim()).single();
    if (error && error.code!=='PGRST116') throw error;
    if (data) { setActivePatient(data); setPaso(2); showToast('Paciente encontrado ✓'); }
    else { setShowCrear(true); showToast('RUT no encontrado. Complete los datos.','warning'); }
  },'Buscando paciente...');

  const crear = () => load(async()=>{
    if (!nuevoPac.nombre.trim()) { showToast('El nombre es obligatorio','error'); return; }
    const { data, error } = await supabase.from('pacientes').insert([{ rut:rut.trim(), nombre:nuevoPac.nombre.trim(), edad:parseInt(nuevoPac.edad)||null, direccion:nuevoPac.direccion||null, telefono:nuevoPac.telefono||null, email:nuevoPac.email||null, alergias:nuevoPac.alergias||null }]).select().single();
    if (error) throw error;
    setActivePatient(data); setShowCrear(false); setPaso(2);
    showToast('Paciente registrado exitosamente ✓');
  },'Registrando paciente...');

  const agendar = () => load(async()=>{
    if (!atencion.motivo.trim()) { showToast('El motivo es obligatorio','error'); return; }
    if (!atencion.hora) { showToast('Seleccione una hora','error'); return; }
    const fecha = new Date().toISOString().split('T')[0];
    const estado = atencion.urgencia ? 'Derivada a urgencia' : 'Agendada';
    const { error } = await supabase.from('consultas').insert([{ paciente_rut:activePatient.rut, fecha, hora:atencion.hora, motivo:atencion.motivo.trim(), estado, urgencia:atencion.urgencia, medico_asignado:atencion.medico.trim()||null }]);
    if (error) throw error;
    showToast(atencion.urgencia ? '🚨 Derivado a Urgencia' : 'Consulta agendada correctamente ✓');
    goTo('dashboard');
  },'Agendando consulta...');

  return (
    <div style={{ animation:'fadeUp 0.4s forwards', maxWidth:820, margin:'0 auto' }}>
      <BackBtn onClick={()=>goTo('dashboard')}/>
      <Breadcrumb steps={[{label:'Dashboard',onClick:()=>goTo('dashboard')},{label:'Nueva Atención'},...(paso>=2?[{label:'Agendar Hora'}]:[])]}/>

      {paso===1 && (
        <div style={{ display:'grid', gridTemplateColumns: showCrear ? '1fr 1fr' : '1fr', gap:'1.5rem' }}>
          <Card accent={T.blue}>
            <SectionTitle icon={<Search size={16}/>} title="Buscar Paciente" subtitle="Ingrese el RUT para buscar en el sistema"/>
            <Field label="RUT del Paciente">
              <div style={{ display:'flex', gap:'0.5rem' }}>
                <Input placeholder="12.345.678-9" value={rut} onChange={e=>setRut(e.target.value)} onKeyDown={e=>e.key==='Enter'&&buscar()}/>
                <Btn variant="primary" onClick={buscar}><Search size={15}/> Buscar</Btn>
              </div>
            </Field>
            <p style={{ color:T.textMuted, fontSize:'0.75rem', marginTop:'0.5rem' }}>
              Prueba: 12.345.678-9 · 9.876.543-2 · 15.432.100-K · 11.111.111-1
            </p>
          </Card>

          {showCrear && (
            <Card accent={T.amber}>
              <SectionTitle icon={<UserPlus size={16}/>} title="Registrar Nuevo Paciente" subtitle={`RUT: ${rut}`}/>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'0.75rem' }}>
                <div style={{ gridColumn:'1 / -1' }}>
                  <Field label="Nombre Completo *"><Input placeholder="Juan Pérez González" value={nuevoPac.nombre} onChange={e=>setNuevoPac({...nuevoPac,nombre:e.target.value})}/></Field>
                </div>
                <Field label="Edad"><Input type="number" placeholder="25" value={nuevoPac.edad} onChange={e=>setNuevoPac({...nuevoPac,edad:e.target.value})}/></Field>
                <Field label="Teléfono"><Input placeholder="+56 9 1234 5678" value={nuevoPac.telefono} onChange={e=>setNuevoPac({...nuevoPac,telefono:e.target.value})}/></Field>
                <div style={{ gridColumn:'1 / -1' }}>
                  <Field label="Dirección"><Input placeholder="Av. Principal 123" value={nuevoPac.direccion} onChange={e=>setNuevoPac({...nuevoPac,direccion:e.target.value})}/></Field>
                </div>
                <div style={{ gridColumn:'1 / -1' }}>
                  <Field label="Email"><Input type="email" placeholder="correo@ejemplo.cl" value={nuevoPac.email} onChange={e=>setNuevoPac({...nuevoPac,email:e.target.value})}/></Field>
                </div>
                <div style={{ gridColumn:'1 / -1' }}>
                  <Field label="Alergias conocidas"><Input placeholder="Ej: Penicilina, Ibuprofeno" value={nuevoPac.alergias} onChange={e=>setNuevoPac({...nuevoPac,alergias:e.target.value})}/></Field>
                </div>
              </div>
              <Btn variant="success" onClick={crear} style={{ width:'100%', marginTop:'0.5rem' }}>
                <UserPlus size={15}/> Guardar Paciente y Continuar
              </Btn>
            </Card>
          )}
        </div>
      )}

      {paso===2 && activePatient && (
        <div>
          <div style={{ display:'flex', alignItems:'center', gap:'0.75rem', background:'rgba(16,185,129,0.08)', border:`1px solid rgba(16,185,129,0.25)`, borderRadius:'10px', padding:'0.875rem 1rem', marginBottom:'1.5rem' }}>
            <CheckCircle2 size={20} color={T.green}/>
            <div>
              <p style={{ margin:0, fontWeight:700, color:T.green, fontSize:'0.875rem' }}>Paciente encontrado. Ahora agenda la hora.</p>
              <p style={{ margin:0, fontSize:'0.75rem', color:T.textSecondary }}>Complete el motivo y seleccione un horario para confirmar.</p>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1.6fr', gap:'1.5rem' }}>
            <Card>
              <h3 style={{ color:T.textSecondary, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 1rem' }}>Paciente</h3>
              <PatientCard pac={activePatient}/>
              <div style={{ fontSize:'0.775rem', color:T.textSecondary, display:'flex', flexDirection:'column', gap:'0.3rem' }}>
                {activePatient.direccion && <span>📍 {activePatient.direccion}</span>}
                {activePatient.telefono  && <span>📞 {activePatient.telefono}</span>}
                {activePatient.email     && <span>✉️ {activePatient.email}</span>}
              </div>
              <Btn size="sm" variant="secondary" onClick={()=>{ setPaso(1); setActivePatient(null); }} style={{ marginTop:'1rem' }}>
                <Search size={13}/> Cambiar Paciente
              </Btn>
            </Card>

            <Card accent={T.blue}>
              <SectionTitle icon={<CalendarPlus size={16}/>} title="Registrar Consulta"/>
              <Field label="Motivo de Consulta *">
                <Textarea placeholder="Describa el motivo..." value={atencion.motivo} onChange={e=>setAtencion({...atencion,motivo:e.target.value})} style={{ minHeight:'70px' }}/>
              </Field>
              <Field label="Médico Asignado (Opcional)">
                <Input placeholder="Nombre del médico" value={atencion.medico} onChange={e=>setAtencion({...atencion,medico:e.target.value})}/>
              </Field>
              <Field label="Seleccione Hora *">
                <div style={{ display:'flex', flexWrap:'wrap', gap:'0.4rem' }}>
                  {HORAS.map(h=>(
                    <button key={h} onClick={()=>setAtencion({...atencion,hora:h})}
                      style={{ padding:'0.35rem 0.7rem', borderRadius:'7px', border:`1px solid ${atencion.hora===h?T.blue:T.border}`, background: atencion.hora===h ? T.blue : T.bgInput, color: atencion.hora===h ? '#fff' : T.textSecondary, fontWeight:600, fontSize:'0.775rem', cursor:'pointer', transition:'all 0.15s', fontFamily:'DM Mono, monospace' }}>
                      {h}
                    </button>
                  ))}
                </div>
              </Field>
              <div onClick={()=>setAtencion({...atencion,urgencia:!atencion.urgencia})}
                style={{ padding:'0.875rem 1rem', background: atencion.urgencia ? 'rgba(239,68,68,0.1)' : T.bgInput, border:`1px solid ${atencion.urgencia?'rgba(239,68,68,0.4)':T.border}`, borderRadius:'9px', display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer', transition:'all 0.2s', marginBottom:'1.25rem' }}>
                <div style={{ width:18, height:18, borderRadius:'5px', background:atencion.urgencia?T.red:'transparent', border:`2px solid ${atencion.urgencia?T.red:T.borderHi}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', flexShrink:0 }}>
                  {atencion.urgencia && <CheckCircle2 size={12} color="white"/>}
                </div>
                <div>
                  <p style={{ margin:0, fontWeight:700, color:atencion.urgencia?'#f87171':T.textPrimary, fontSize:'0.875rem' }}>🚨 Marcar como Urgencia</p>
                  <p style={{ margin:0, fontSize:'0.72rem', color:T.textSecondary }}>Derivación inmediata a urgencias</p>
                </div>
              </div>
              <Btn variant={atencion.urgencia?'danger-solid':'primary'} onClick={agendar} style={{ width:'100%' }}>
                {atencion.urgencia ? <><AlertTriangle size={15}/> Derivar a Urgencia</> : <><CalendarPlus size={15}/> Confirmar Agendamiento</>}
              </Btn>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}

// ========================
// FUNCIONARIO – RETIRO
// ========================
function FuncRetiro({ goTo, showToast, load }) {
  const [rutPac, setRutPac]           = useState('');
  const [rutRet, setRutRet]           = useState('');
  const [resultado, setResultado]     = useState(null);
  const [showRegRep, setShowRegRep]   = useState(false);
  const [nuevoRep, setNuevoRep]       = useState({ nombre:'', vinculo:'' });

  const verificar = () => load(async()=>{
    if (!rutPac.trim()||!rutRet.trim()) { showToast('Ingrese ambos RUT','error'); return; }
    setResultado(null); setShowRegRep(false);
    const { data:fichas, error:ef } = await supabase.from('fichas_medicas').select('*').eq('paciente_rut',rutPac.trim()).eq('emite_receta',true).order('created_at',{ascending:false}).limit(1);
    if (ef) throw ef;
    if (!fichas?.length) { setResultado({tipo:'sin_receta'}); return; }
    const receta = fichas[0];
    let autorizado=false, nombreRetira='Mismo Paciente';
    if (rutPac.trim()===rutRet.trim()) { autorizado=true; }
    else {
      const { data:rep } = await supabase.from('representantes').select('*').eq('paciente_rut',rutPac.trim()).eq('rut_representante',rutRet.trim()).single();
      if (rep) { autorizado=rep.autorizado; nombreRetira=rep.nombre; }
      else { autorizado=false; nombreRetira='No registrado'; }
    }
    setResultado({ tipo:autorizado?'ok':'rechazado', receta, nombreRetira });
  },'Verificando...');

  const registrarRetiro = (esIncidente) => load(async()=>{
    const { error } = await supabase.from('retiros').insert([{ paciente_rut:rutPac.trim(), consulta_id:resultado.receta.consulta_id, rut_retira:rutRet.trim(), autorizado:!esIncidente, fecha:new Date().toISOString().split('T')[0], incidente:esIncidente, motivo_rechazo:esIncidente?'Representante no autorizado':null, retirado_por:resultado.nombreRetira }]);
    if (error) throw error;
    showToast(esIncidente?'Incidente registrado':'Entrega registrada correctamente ✓');
    goTo('dashboard');
  },'Registrando...');

  const registrarRepresentante = () => load(async()=>{
    if (!nuevoRep.nombre.trim()||!nuevoRep.vinculo.trim()) { showToast('Complete los campos','error'); return; }
    const { error } = await supabase.from('representantes').insert([{ paciente_rut:rutPac.trim(), rut_representante:rutRet.trim(), nombre:nuevoRep.nombre.trim(), vinculo:nuevoRep.vinculo.trim(), autorizado:true }]);
    if (error) throw error;
    showToast('Representante registrado y autorizado ✓');
    setResultado({...resultado, tipo:'ok', nombreRetira:nuevoRep.nombre.trim()});
    setShowRegRep(false);
  },'Registrando representante...');

  return (
    <div style={{ animation:'fadeUp 0.4s forwards', maxWidth:900, margin:'0 auto' }}>
      <BackBtn onClick={()=>goTo('dashboard')}/>
      <Breadcrumb steps={[{label:'Dashboard',onClick:()=>goTo('dashboard')},{label:'Retiro de Medicamentos'}]}/>
      <div style={{ display:'grid', gridTemplateColumns: resultado ? '1fr 1fr' : '1fr', gap:'1.5rem' }}>
        <Card accent={T.purple}>
          <SectionTitle icon={<Pill size={16}/>} title="Verificar Autorización" subtitle="Ingrese RUT del titular y del retirador"/>
          <Field label="RUT del Paciente (titular)">
            <Input placeholder="12.345.678-9" value={rutPac} onChange={e=>setRutPac(e.target.value)}/>
          </Field>
          <Field label="RUT de quien retira">
            <Input placeholder="RUT del retirador" value={rutRet} onChange={e=>setRutRet(e.target.value)}/>
          </Field>
          <Btn variant="primary" onClick={verificar} style={{ width:'100%', marginTop:'0.5rem' }}>
            <Search size={15}/> Verificar Autorización
          </Btn>
          <p style={{ color:T.textMuted, fontSize:'0.72rem', marginTop:'0.75rem', textAlign:'center', fontFamily:'DM Mono, monospace' }}>
            Prueba: paciente 12.345.678-9 · retirador 20.111.222-3
          </p>
        </Card>

        {resultado && (
          <Card accent={resultado.tipo==='ok'?T.green:resultado.tipo==='sin_receta'?T.amber:T.red}>
            {resultado.tipo==='sin_receta' && (
              <div style={{ textAlign:'center', padding:'2rem 0' }}>
                <div style={{ width:56, height:56, borderRadius:'14px', background:T.amberDim, border:`1px solid rgba(245,158,11,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 1rem', color:T.amber }}>
                  <AlertTriangle size={26}/>
                </div>
                <h3 style={{ color:T.amber, margin:'0 0 0.5rem', fontWeight:700 }}>Sin Receta Activa</h3>
                <p style={{ color:T.textSecondary, fontSize:'0.85rem' }}>El paciente no tiene recetas pendientes.</p>
              </div>
            )}
            {resultado.tipo==='ok' && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', background:T.greenDim, border:`1px solid rgba(16,185,129,0.25)`, borderRadius:'9px', padding:'0.75rem 1rem', marginBottom:'1.25rem' }}>
                  <CheckCircle2 size={18} color={T.green}/>
                  <span style={{ color:T.green, fontWeight:700, fontSize:'0.875rem' }}>AUTORIZADO</span>
                </div>
                <p style={{ color:T.textSecondary, marginBottom:'0.25rem', fontSize:'0.85rem' }}><strong style={{ color:T.textPrimary }}>Retira:</strong> {resultado.nombreRetira}</p>
                <p style={{ color:T.textSecondary, marginBottom:'1.5rem', fontSize:'0.85rem' }}><strong style={{ color:T.textPrimary }}>Receta:</strong> {resultado.receta.detalle_receta}</p>
                <Btn variant="success" onClick={()=>registrarRetiro(false)} style={{ width:'100%' }}>
                  <CheckCircle2 size={15}/> Registrar Entrega
                </Btn>
              </div>
            )}
            {resultado.tipo==='rechazado' && (
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:'0.6rem', background:T.redDim, border:`1px solid rgba(239,68,68,0.25)`, borderRadius:'9px', padding:'0.75rem 1rem', marginBottom:'1.25rem' }}>
                  <AlertCircle size={18} color={T.red}/>
                  <span style={{ color:T.red, fontWeight:700, fontSize:'0.875rem' }}>NO AUTORIZADO</span>
                </div>
                <p style={{ color:T.textSecondary, marginBottom:'1.25rem', fontSize:'0.85rem' }}>"{resultado.nombreRetira}" no está autorizado para retirar esta receta.</p>
                <div style={{ display:'flex', gap:'0.6rem', marginBottom:'0.75rem' }}>
                  <Btn variant="danger-solid" onClick={()=>registrarRetiro(true)} style={{ flex:1 }}><AlertCircle size={14}/> Registrar Incidente</Btn>
                  <Btn variant="secondary" onClick={()=>setShowRegRep(!showRegRep)} style={{ flex:1 }}><UserPlus size={14}/> Registrar Rep.</Btn>
                </div>
                {showRegRep && (
                  <div style={{ borderTop:`1px solid ${T.border}`, paddingTop:'1rem', display:'flex', flexDirection:'column', gap:'0.75rem' }}>
                    <Field label="Nombre del Representante"><Input placeholder="Nombre completo" value={nuevoRep.nombre} onChange={e=>setNuevoRep({...nuevoRep,nombre:e.target.value})}/></Field>
                    <Field label="Vínculo"><Input placeholder="Ej: Hijo, Cónyuge, Tutor" value={nuevoRep.vinculo} onChange={e=>setNuevoRep({...nuevoRep,vinculo:e.target.value})}/></Field>
                    <Btn variant="success" onClick={registrarRepresentante}><CheckCircle2 size={14}/> Guardar y Autorizar</Btn>
                  </div>
                )}
              </div>
            )}
          </Card>
        )}
      </div>
    </div>
  );
}

// ========================
// MÉDICO – DASHBOARD
// ========================
function MedicoDashboard({ consultas, goTo, showToast, load, loadAgenda, setActiveConsulta, setActivePatient }) {
  const abrirConsulta = async(c)=>{
    setActiveConsulta(c); setActivePatient(c.pacientes);
    if (c.estado!=='En atención') {
      await load(async()=>{
        const { error } = await supabase.from('consultas').update({estado:'En atención'}).eq('id',c.id);
        if (error) throw error;
      },'Iniciando atención...');
    }
    goTo('atencion');
  };

  const urgencias = consultas.filter(c=>c.urgencia).length;

  const hora = new Date().getHours();
  const saludo = hora < 12 ? 'Buenos días' : hora < 19 ? 'Buenas tardes' : 'Buenas noches';

  return (
    <div style={{ animation:'fadeUp 0.4s forwards' }}>

      {/* Banner de bienvenida Médico */}
      <div style={{ background:'linear-gradient(120deg, rgba(5,150,105,0.18) 0%, rgba(16,185,129,0.06) 100%)', border:`1px solid rgba(16,185,129,0.2)`, borderLeft:`4px solid ${T.green}`, borderRadius:'14px', padding:'1.25rem 1.5rem', marginBottom:'1.75rem', display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:'1rem' }}>
        <div style={{ display:'flex', alignItems:'center', gap:'1rem' }}>
          <div style={{ width:48, height:48, borderRadius:'12px', background:'rgba(16,185,129,0.15)', border:`1px solid rgba(16,185,129,0.3)`, display:'flex', alignItems:'center', justifyContent:'center', color:T.green, flexShrink:0 }}>
            <Stethoscope size={24}/>
          </div>
          <div>
            <p style={{ margin:0, fontSize:'0.75rem', color:T.green, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.08em' }}>Consulta Médica</p>
            <h1 style={{ margin:'0.1rem 0 0', color:T.textPrimary, fontSize:'1.3rem', fontWeight:800, letterSpacing:'-0.02em' }}>{saludo}, Dr. SaludNet</h1>
            <p style={{ margin:0, color:T.textSecondary, fontSize:'0.8rem' }}>{consultas.length} paciente{consultas.length!==1?'s':''} en lista · {urgencias} urgencia{urgencias!==1?'s':''}</p>
          </div>
        </div>
        {urgencias > 0 && (
          <div style={{ display:'flex', alignItems:'center', gap:'0.5rem', background:'rgba(239,68,68,0.12)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'10px', padding:'0.6rem 1rem' }}>
            <AlertTriangle size={16} color={T.red}/>
            <span style={{ color:T.red, fontWeight:700, fontSize:'0.82rem' }}>{urgencias} urgencia{urgencias!==1?'s':''} pendiente{urgencias!==1?'s':''}</span>
          </div>
        )}
        <Btn variant="secondary" onClick={()=>load(loadAgenda,'Actualizando...')}><RefreshCw size={14}/> Actualizar</Btn>
      </div>

      {/* Stats dinámicos */}
      <div style={{ display:'flex', gap:'0.75rem', marginBottom:'1.5rem', flexWrap:'wrap' }}>
        <StatPill icon={<Users size={16}/>} label="En Lista" value={consultas.length} color={T.blue}/>
        <StatPill icon={<Activity size={16}/>} label="En Atención" value={consultas.filter(c=>c.estado==='En atención').length} color={consultas.filter(c=>c.estado==='En atención').length>0?T.amber:T.textMuted}/>
        <StatPill icon={<Shield size={16}/>} label="Urgencias" value={urgencias} color={urgencias>0?T.red:T.textMuted} alert={urgencias>0}/>
      </div>

      <Card>
        {consultas.length===0 ? (
          <div style={{ textAlign:'center', padding:'3.5rem 0', color:T.textMuted }}>
            <CheckCircle2 size={40} style={{ margin:'0 auto 1rem', display:'block', opacity:0.4 }}/>
            <p style={{ margin:0, fontSize:'0.9rem' }}>No hay pacientes en espera.</p>
          </div>
        ) : consultas.map((c,i)=>{
          const lineColor = c.estado==='En atención' ? T.amber : c.urgencia ? T.red : T.blue;
          return (
            <div key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'1rem 0', borderBottom:i<consultas.length-1?`1px solid ${T.border}`:'none', borderLeft:`3px solid ${lineColor}`, paddingLeft:'1rem', gap:'1rem', flexWrap:'wrap', animation:'slideIn 0.3s forwards', animationDelay:`${i*0.04}s`, opacity:0 }}>
              <div style={{ display:'flex', alignItems:'center', gap:'0.875rem', flex:1, minWidth:0 }}>
                <Avatar name={c.pacientes?.nombre||c.paciente_rut} size={38}/>
                <div style={{ minWidth:0 }}>
                  <div style={{ display:'flex', gap:'0.4rem', marginBottom:'0.3rem', flexWrap:'wrap' }}>
                    <Badge estado={c.estado}/>
                    {c.urgencia && <Badge estado="Derivada a urgencia"/>}
                  </div>
                  <p style={{ margin:0, fontWeight:700, color:T.textPrimary, fontSize:'0.875rem' }}>{c.pacientes?.nombre||c.paciente_rut}</p>
                  <p style={{ margin:'0.15rem 0 0', fontSize:'0.75rem', color:T.textSecondary }}>
                    {c.motivo} · <span style={{ fontFamily:'DM Mono, monospace' }}>{c.hora||'S/H'}</span>
                  </p>
                </div>
              </div>
              <Btn variant={c.estado==='En atención'?'warning':'primary'} onClick={()=>abrirConsulta(c)}>
                {c.estado==='En atención' ? 'Continuar' : 'Iniciar Atención'}
              </Btn>
            </div>
          );
        })}
      </Card>
    </div>
  );
}

// ========================
// MÉDICO – ATENCIÓN
// ========================
function MedicoAtencion({ consulta, paciente, goTo, showToast, load }) {
  const [form, setForm] = useState({ signos:'', sintomas:'', examen:'', diag1:'', diag2:'', obs:'', instrucciones:'', emiteReceta:false, receta:'', emiteCert:false, reposo:'', reqSegui:false, diasSegui:'' });
  const f = (key,val) => setForm(p=>({...p,[key]:val}));

  const cerrar = async()=>{
    if (!window.confirm('Consulta clínicamente cerrada.\n\n¿Desea cerrar administrativamente?')) return;
    load(async()=>{
      const ficha = { consulta_id:consulta.id, paciente_rut:paciente.rut, fecha:new Date().toISOString().split('T')[0], medico:'Médico Titular', signos_vitales:form.signos, sintomas_detectados:form.sintomas, examen_fisico:form.examen, diagnostico:form.diag1, diagnostico_secundario:form.diag2, observaciones:form.obs, instrucciones_paciente:form.instrucciones, emite_receta:form.emiteReceta, detalle_receta:form.emiteReceta?form.receta:null, emite_certificado:form.emiteCert, dias_reposo:form.emiteCert?parseInt(form.reposo)||null:null, requiere_seguimiento:form.reqSegui, dias_seguimiento:form.reqSegui?parseInt(form.diasSegui)||null:null, estado_cierre:'Cerrada Administrativamente' };
      const { error:e1 } = await supabase.from('fichas_medicas').insert([ficha]);
      if (e1) throw e1;
      const { error:e2 } = await supabase.from('consultas').update({estado:'Cerrada'}).eq('id',consulta.id);
      if (e2) throw e2;
      showToast('Atención finalizada y guardada ✓');
      goTo('dashboard');
    },'Guardando ficha médica...');
  };

  const toggles = [
    { key:'emiteReceta', label:'📋 Emitir Receta Médica',          subKey:'receta',    subLabel:'Detalle de medicamentos y dosis', isText:true },
    { key:'emiteCert',   label:'📄 Emitir Certificado / Licencia', subKey:'reposo',    subLabel:'Días de reposo',                  isText:false },
    { key:'reqSegui',    label:'🔁 Requiere Seguimiento',           subKey:'diasSegui', subLabel:'Control en (días)',               isText:false },
  ];

  return (
    <div style={{ animation:'fadeUp 0.4s forwards' }}>
      <BackBtn onClick={()=>goTo('dashboard')} label="Volver a Agenda"/>
      <Breadcrumb steps={[{label:'Agenda',onClick:()=>goTo('dashboard')},{label:'Atención Clínica'}]}/>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 2.2fr', gap:'1.5rem' }}>
        {/* Columna izquierda */}
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <Card>
            <h3 style={{ color:T.textSecondary, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 1rem' }}>Paciente</h3>
            <PatientCard pac={paciente||{}}/>
            <div style={{ background:T.bgInput, borderRadius:'8px', padding:'0.75rem', marginTop:'0.25rem' }}>
              <p style={{ color:T.textMuted, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.06em', margin:'0 0 0.3rem', fontWeight:600 }}>Motivo de Consulta</p>
              <p style={{ color:T.textSecondary, fontStyle:'italic', margin:0, fontSize:'0.825rem', lineHeight:1.5 }}>"{consulta?.motivo}"</p>
            </div>
          </Card>
          <Card>
            <h3 style={{ color:T.textSecondary, fontSize:'0.7rem', textTransform:'uppercase', letterSpacing:'0.1em', margin:'0 0 0.875rem' }}>Antecedentes</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'0.5rem' }}>
              <div style={{ padding:'0.6rem 0.75rem', background:T.redDim, borderRadius:'7px', border:`1px solid rgba(239,68,68,0.2)` }}>
                <p style={{ margin:0, fontSize:'0.72rem', color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600, marginBottom:'0.15rem' }}>Patologías</p>
                <p style={{ margin:0, color:'#f87171', fontSize:'0.8rem' }}>{paciente?.patologias?.join(', ')||'Ninguna registrada'}</p>
              </div>
              <div style={{ padding:'0.6rem 0.75rem', background:T.amberDim, borderRadius:'7px', border:`1px solid rgba(245,158,11,0.2)` }}>
                <p style={{ margin:0, fontSize:'0.72rem', color:T.textMuted, textTransform:'uppercase', letterSpacing:'0.06em', fontWeight:600, marginBottom:'0.15rem' }}>Alergias</p>
                <p style={{ margin:0, color:'#fbbf24', fontSize:'0.8rem' }}>{paciente?.alergias||'Ninguna'}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Formulario clínico */}
        <Card accent={T.blue}>
          <SectionTitle icon={<FileText size={16}/>} title="Registro Clínico" subtitle="Complete los campos para cerrar la consulta"/>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'1rem' }}>
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="Signos Vitales">
                <Input placeholder="PA 120/80 · FC 75 · T 36.8°C · SpO₂ 98%" value={form.signos} onChange={e=>f('signos',e.target.value)}/>
              </Field>
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="Síntomas Detectados">
                <Textarea placeholder="Síntomas observados durante la consulta..." value={form.sintomas} onChange={e=>f('sintomas',e.target.value)}/>
              </Field>
            </div>
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="Examen Físico">
                <Textarea placeholder="Hallazgos del examen físico..." value={form.examen} onChange={e=>f('examen',e.target.value)}/>
              </Field>
            </div>
            <Field label="Diagnóstico Principal">
              <Input placeholder="CIE-10 o descripción" value={form.diag1} onChange={e=>f('diag1',e.target.value)}/>
            </Field>
            <Field label="Diagnóstico Secundario">
              <Input placeholder="Opcional" value={form.diag2} onChange={e=>f('diag2',e.target.value)}/>
            </Field>
            <div style={{ gridColumn:'1 / -1' }}>
              <Field label="Observaciones Clínicas">
                <Textarea placeholder="Notas adicionales para el expediente..." value={form.obs} onChange={e=>f('obs',e.target.value)} style={{ minHeight:'70px' }}/>
              </Field>
            </div>
          </div>

          <hr style={{ border:'none', borderTop:`1px solid ${T.border}`, margin:'1.25rem 0' }}/>

          {toggles.map(t=>(
            <div key={t.key} style={{ marginBottom:'0.875rem' }}>
              <div onClick={()=>f(t.key,!form[t.key])}
                style={{ display:'flex', alignItems:'center', gap:'0.75rem', cursor:'pointer', padding:'0.75rem 1rem', background:form[t.key]?T.blueDim:T.bgInput, border:`1px solid ${form[t.key]?'rgba(59,130,246,0.4)':T.border}`, borderRadius:'9px', transition:'all 0.18s' }}>
                <div style={{ width:18, height:18, borderRadius:'5px', background:form[t.key]?T.blue:'transparent', border:`2px solid ${form[t.key]?T.blue:T.borderHi}`, display:'flex', alignItems:'center', justifyContent:'center', transition:'all 0.15s', flexShrink:0 }}>
                  {form[t.key] && <CheckCircle2 size={12} color="white"/>}
                </div>
                <span style={{ fontWeight:600, color:form[t.key]?'#93c5fd':T.textPrimary, fontSize:'0.875rem' }}>{t.label}</span>
              </div>
              {form[t.key] && (
                <div style={{ marginTop:'0.5rem', animation:'fadeIn 0.2s forwards' }}>
                  {t.isText
                    ? <Textarea placeholder={t.subLabel} value={form[t.subKey]} onChange={e=>f(t.subKey,e.target.value)} style={{ minHeight:'80px' }}/>
                    : <Input type="number" placeholder={t.subLabel} value={form[t.subKey]} onChange={e=>f(t.subKey,e.target.value)}/>
                  }
                </div>
              )}
            </div>
          ))}

          <Field label="Instrucciones para el Paciente">
            <Textarea placeholder="Indicaciones, cuidados en casa, medicación..." value={form.instrucciones} onChange={e=>f('instrucciones',e.target.value)} style={{ minHeight:'70px' }}/>
          </Field>

          <Btn variant="success" onClick={cerrar} style={{ width:'100%', marginTop:'1rem', padding:'0.85rem' }}>
            <CheckCircle2 size={17}/> Cerrar Consulta y Guardar Ficha Médica
          </Btn>
        </Card>
      </div>
    </div>
  );
}