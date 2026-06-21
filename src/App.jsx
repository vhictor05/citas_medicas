import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { handleSupabaseError } from './utils/errorHandler';
import { Stethoscope, Users, LogOut, Heart } from 'lucide-react';
import { T, css } from './utils/theme';

import Loader from './components/ui/Loader';
import Toast from './components/ui/Toast';
import EcgBackground from './components/ui/EcgBackground';
import DrChat from './components/ui/DrChat';
import RoleButton from './components/ui/RoleButton';
import Btn from './components/ui/Btn';

import FuncDashboard from './components/Funcionario/FuncDashboard';
import FuncNuevaAtencion from './components/Funcionario/FuncNuevaAtencion';
import FuncRetiro from './components/Funcionario/FuncRetiro';

import MedicoDashboard from './components/Medico/MedicoDashboard';
import MedicoAtencion from './components/Medico/MedicoAtencion';

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
    catch(err) {
      console.error(err);
      const handledError = handleSupabaseError(err, text);
      showToast(handledError.message || 'Error al conectar con Supabase', 'error');
    }
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
      { label:'Médico',                    role:'medico',      icon:<Stethoscope size={20}/>, color:T.green, desc:'Agenda de pacientes y registro clínico' }
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
  const roleLabels = { funcionario:'Ventanilla', medico:'Médico' };
  const roleColors = { funcionario:T.blue, medico:T.green };
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
      </main>
    </div>
  );
}
