import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import {
  Stethoscope, Users, Search, CalendarPlus, LogOut, Pill,
  Clock, CheckCircle2, AlertCircle, ArrowLeft, UserPlus,
  RefreshCw, AlertTriangle, FileText, ChevronRight
} from 'lucide-react';

// ========================
// UTILITY COMPONENTS
// ========================

function Loader({ text = 'Procesando...' }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(15,23,42,0.75)', backdropFilter: 'blur(4px)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
      <div style={{ width: '44px', height: '44px', border: '4px solid #374151', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: '#f9fafb', fontWeight: 600 }}>{text}</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const colors = { success: '#10b981', error: '#ef4444', warning: '#f59e0b' };
  const color = colors[toast.type] || '#10b981';
  return (
    <div style={{ position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 10000, background: '#1f2937', padding: '1rem 1.5rem', borderRadius: '10px', boxShadow: '0 10px 30px rgba(0,0,0,0.5)', borderLeft: `4px solid ${color}`, display: 'flex', alignItems: 'center', gap: '0.75rem', animation: 'fadeIn 0.3s forwards', maxWidth: '380px' }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }`}</style>
      {toast.type === 'success' ? <CheckCircle2 size={20} color={color} /> : toast.type === 'warning' ? <AlertTriangle size={20} color={color} /> : <AlertCircle size={20} color={color} />}
      <span style={{ color: '#f9fafb', fontWeight: 500 }}>{toast.msg}</span>
    </div>
  );
}

function BackBtn({ onClick, label = 'Volver' }) {
  return (
    <button onClick={onClick} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'none', border: 'none', color: '#60a5fa', fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer', marginBottom: '1.5rem', padding: 0 }}>
      <ArrowLeft size={16} /> {label}
    </button>
  );
}

function Breadcrumb({ steps }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '1.5rem', fontSize: '0.8rem', color: '#6b7280' }}>
      {steps.map((s, i) => (
        <React.Fragment key={i}>
          {i > 0 && <ChevronRight size={14} />}
          <span style={{ color: i === steps.length - 1 ? '#f9fafb' : '#60a5fa', fontWeight: i === steps.length - 1 ? 600 : 400, cursor: i < steps.length - 1 && s.onClick ? 'pointer' : 'default' }} onClick={s.onClick}>{s.label}</span>
        </React.Fragment>
      ))}
    </div>
  );
}

function Badge({ estado }) {
  const map = {
    'Agendada':           { bg: 'rgba(59,130,246,0.2)', color: '#93c5fd' },
    'En espera':          { bg: 'rgba(148,163,184,0.2)', color: '#94a3b8' },
    'En atención':        { bg: 'rgba(245,158,11,0.2)', color: '#fbbf24' },
    'Cerrada':            { bg: 'rgba(16,185,129,0.2)', color: '#34d399' },
    'Cancelada':          { bg: 'rgba(239,68,68,0.2)', color: '#f87171' },
    'Derivada a urgencia':{ bg: '#ef4444', color: '#ffffff' },
  };
  const style = map[estado] || { bg: '#374151', color: '#9ca3af' };
  return (
    <span style={{ background: style.bg, color: style.color, padding: '0.15rem 0.65rem', borderRadius: '9999px', fontSize: '0.72rem', fontWeight: 700, display: 'inline-block', letterSpacing: '0.02em' }}>{estado}</span>
  );
}

function Card({ children, accent, style: extraStyle }) {
  return (
    <div style={{ background: '#1f2937', border: '1px solid #374151', borderRadius: '14px', padding: '1.5rem', boxShadow: '0 4px 12px rgba(0,0,0,0.2)', borderTop: accent ? `3px solid ${accent}` : undefined, ...extraStyle }}>
      {children}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '1rem' }}>
      <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#9ca3af', marginBottom: '0.4rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ ...props }) {
  return (
    <input {...props} style={{ width: '100%', padding: '0.65rem 1rem', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', transition: 'border 0.2s', ...props.style }}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#374151'} />
  );
}

function Textarea({ ...props }) {
  return (
    <textarea {...props} style={{ width: '100%', padding: '0.65rem 1rem', background: '#111827', border: '1px solid #374151', borderRadius: '8px', color: '#f9fafb', fontSize: '0.9rem', fontFamily: 'inherit', outline: 'none', resize: 'vertical', minHeight: '90px', transition: 'border 0.2s', ...props.style }}
      onFocus={e => e.target.style.borderColor = '#3b82f6'}
      onBlur={e => e.target.style.borderColor = '#374151'} />
  );
}

function Btn({ children, variant = 'primary', onClick, disabled, style: extra, size = 'md' }) {
  const vars = {
    primary:   { bg: '#2563eb', color: '#fff', border: 'none', hover: '#1d4ed8' },
    success:   { bg: '#059669', color: '#fff', border: 'none', hover: '#047857' },
    danger:    { bg: 'rgba(239,68,68,0.15)', color: '#f87171', border: '1px solid rgba(239,68,68,0.4)', hover: 'rgba(239,68,68,0.3)' },
    'danger-solid': { bg: '#dc2626', color: '#fff', border: 'none', hover: '#b91c1c' },
    secondary: { bg: '#374151', color: '#d1d5db', border: '1px solid #4b5563', hover: '#4b5563' },
    warning:   { bg: 'rgba(245,158,11,0.15)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.4)', hover: 'rgba(245,158,11,0.3)' },
  };
  const v = vars[variant] || vars.primary;
  const padding = size === 'sm' ? '0.35rem 0.75rem' : '0.65rem 1.25rem';
  const fontSize = size === 'sm' ? '0.78rem' : '0.875rem';
  const [hov, setHov] = useState(false);
  return (
    <button onClick={onClick} disabled={disabled}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.45rem', padding, fontSize, fontWeight: 600, borderRadius: '8px', border: v.border, background: hov ? v.hover : v.bg, color: v.color, cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.5 : 1, transition: 'all 0.2s', fontFamily: 'inherit', ...extra }}>
      {children}
    </button>
  );
}

function Avatar({ name, size = 48 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: '50%', background: 'rgba(59,130,246,0.2)', color: '#60a5fa', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: size * 0.4, flexShrink: 0 }}>
      {name ? name.charAt(0).toUpperCase() : '?'}
    </div>
  );
}

function PatientCard({ pac }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '1rem', background: '#111827', borderRadius: '10px', border: '1px solid #374151', marginBottom: '1rem' }}>
      <Avatar name={pac.nombre} />
      <div>
        <p style={{ margin: 0, fontWeight: 700, color: '#f9fafb' }}>{pac.nombre}</p>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#9ca3af' }}>RUT: {pac.rut} · Edad: {pac.edad ?? 'N/A'} años</p>
        {pac.patologias?.length > 0 && <p style={{ margin: '0.25rem 0 0', fontSize: '0.78rem', color: '#f87171' }}>Patologías: {pac.patologias.join(', ')}</p>}
        {pac.alergias && <p style={{ margin: 0, fontSize: '0.78rem', color: '#fbbf24' }}>Alergias: {pac.alergias}</p>}
      </div>
    </div>
  );
}

// ========================
// APP ROOT
// ========================

export default function App() {
  const [role, setRole] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Procesando...');
  const [toast, setToast] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [activeConsulta, setActiveConsulta] = useState(null);

  const showToast = (msg, type = 'success', duration = 4000) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), duration);
  };

  const load = async (fn, text = 'Cargando...') => {
    setLoadingText(text);
    setLoading(true);
    try {
      await fn();
    } catch (err) {
      console.error(err);
      const msg = err?.message || 'Error desconocido al conectar con Supabase';
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadConsultas = async () => {
    const { data, error } = await supabase
      .from('consultas')
      .select('*, pacientes(nombre, rut, edad)')
      .order('created_at', { ascending: false })
      .limit(30);
    if (error) throw error;
    setConsultas(data || []);
  };

  const loadAgendaMedica = async () => {
    const { data, error } = await supabase
      .from('consultas')
      .select('*, pacientes(*)')
      .in('estado', ['Agendada', 'En espera', 'En atención'])
      .order('created_at', { ascending: true })
      .limit(20);
    if (error) throw error;
    setConsultas(data || []);
  };

  useEffect(() => {
    if (!role) return;
    if (role === 'funcionario') load(loadConsultas, 'Cargando consultas...').catch(e => showToast(e.message, 'error'));
    if (role === 'medico') load(loadAgendaMedica, 'Cargando agenda...').catch(e => showToast(e.message, 'error'));
  }, [role]);

  const goTo = (v) => setView(v);

  // ── Pantalla Selección de Rol ──────────────────────────────────────────
  if (!role) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(ellipse at 60% 30%, #1e3a5f 0%, #111827 70%)' }}>
        <div style={{ background: 'rgba(31,41,55,0.9)', backdropFilter: 'blur(20px)', border: '1px solid #374151', borderRadius: '20px', padding: '3rem 2.5rem', maxWidth: '420px', width: '90%', textAlign: 'center', boxShadow: '0 24px 48px rgba(0,0,0,0.5)', animation: 'fadeIn 0.5s forwards' }}>
          <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }`}</style>
          <div style={{ width: '72px', height: '72px', borderRadius: '18px', background: 'rgba(37,99,235,0.2)', border: '1px solid rgba(59,130,246,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem', color: '#60a5fa' }}>
            <Stethoscope size={36} />
          </div>
          <h1 style={{ color: '#f9fafb', margin: '0 0 0.5rem', fontSize: '1.75rem', fontWeight: 800 }}>CESFAM</h1>
          <p style={{ color: '#6b7280', margin: '0 0 2.5rem', fontSize: '0.9rem' }}>Sistema de Gestión de Atención Médica</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: 'Funcionario de Ventanilla', role: 'funcionario', icon: <Users size={18} />, color: '#2563eb' },
              { label: 'Médico', role: 'medico', icon: <Stethoscope size={18} />, color: '#059669' },
              { label: 'Enfermero', role: 'enfermero', icon: <FileText size={18} />, color: '#7c3aed' },
            ].map(r => (
              <button key={r.role}
                onClick={() => { setRole(r.role); setView('dashboard'); }}
                style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', width: '100%', padding: '0.9rem 1.25rem', background: 'rgba(255,255,255,0.05)', border: '1px solid #374151', borderRadius: '10px', color: '#f9fafb', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600, fontSize: '0.95rem', transition: 'all 0.2s' }}
                onMouseEnter={e => { e.currentTarget.style.background = `${r.color}22`; e.currentTarget.style.borderColor = r.color; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = '#374151'; }}>
                <span style={{ color: r.color }}>{r.icon}</span> Ingresar como {r.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── App Shell ──────────────────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#111827', fontFamily: 'Inter, sans-serif' }}>
      {loading && <Loader text={loadingText} />}
      <Toast toast={toast} />

      {/* Header */}
      <header style={{ background: '#1f2937', borderBottom: '1px solid #374151', padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ background: '#2563eb', color: '#fff', padding: '0.5rem', borderRadius: '8px' }}><Stethoscope size={20} /></div>
          <span style={{ color: '#f9fafb', fontWeight: 800, fontSize: '1.1rem' }}>CESFAM</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <span style={{ background: 'rgba(59,130,246,0.15)', color: '#60a5fa', border: '1px solid rgba(59,130,246,0.3)', padding: '0.3rem 0.9rem', borderRadius: '9999px', fontSize: '0.78rem', fontWeight: 700, textTransform: 'uppercase' }}>{role}</span>
          <Btn variant="secondary" onClick={() => { setRole(null); setView('dashboard'); }}><LogOut size={15} /> Cambiar Rol</Btn>
        </div>
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
        {/* FUNCIONARIO */}
        {role === 'funcionario' && view === 'dashboard' && <FuncDashboard consultas={consultas} goTo={goTo} showToast={showToast} load={load} loadConsultas={loadConsultas} setLoadingText={setLoadingText} />}
        {role === 'funcionario' && view === 'nueva-atencion' && <FuncNuevaAtencion goTo={goTo} showToast={showToast} load={load} activePatient={activePatient} setActivePatient={setActivePatient} />}
        {role === 'funcionario' && view === 'retiro' && <FuncRetiro goTo={goTo} showToast={showToast} load={load} />}

        {/* MÉDICO */}
        {role === 'medico' && view === 'dashboard' && <MedicoDashboard consultas={consultas} goTo={goTo} showToast={showToast} load={load} loadAgenda={loadAgendaMedica} setActiveConsulta={setActiveConsulta} setActivePatient={setActivePatient} />}
        {role === 'medico' && view === 'atencion' && <MedicoAtencion consulta={activeConsulta} paciente={activePatient} goTo={goTo} showToast={showToast} load={load} />}

        {/* ENFERMERO */}
        {role === 'enfermero' && view === 'dashboard' && (
          <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
            <p style={{ color: '#6b7280', fontSize: '1.1rem' }}>Panel de Enfermero en construcción.</p>
            <Btn variant="secondary" style={{ marginTop: '1rem' }} onClick={() => setRole(null)}><ArrowLeft size={16} /> Volver a Selección de Rol</Btn>
          </div>
        )}
      </main>
    </div>
  );
}

// ========================
// FUNCIONARIO – DASHBOARD
// ========================
function FuncDashboard({ consultas, goTo, showToast, load, loadConsultas, setLoadingText }) {
  const marcarLlegada = (id) => load(async () => {
    const { error } = await supabase.from('consultas').update({ estado: 'En espera' }).eq('id', id);
    if (error) throw error;
    showToast('Paciente marcado como En espera');
    await loadConsultas();
  }, 'Actualizando...');

  const reasignarMedico = async (id) => {
    const nuevo = window.prompt('Ingrese el nombre del nuevo médico:');
    if (!nuevo) return;
    load(async () => {
      const { error } = await supabase.from('consultas').update({ medico_asignado: nuevo }).eq('id', id);
      if (error) throw error;
      showToast('Médico reasignado');
      await loadConsultas();
    }, 'Reasignando...');
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s forwards' }}>
      <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }`}</style>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#f9fafb', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Consultas del Día</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{consultas.length} registros cargados</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
          <Btn variant="secondary" onClick={() => load(loadConsultas, 'Actualizando...')}><RefreshCw size={15} /> Actualizar</Btn>
          <Btn variant="secondary" onClick={() => goTo('retiro')}><Pill size={15} /> Retiro de Medicamentos</Btn>
          <Btn variant="primary" onClick={() => goTo('nueva-atencion')}><CalendarPlus size={15} /> Nueva Atención</Btn>
        </div>
      </div>

      <Card>
        {consultas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0' }}>No hay consultas registradas.</p>
        ) : (
          consultas.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: i < consultas.length - 1 ? '1px solid #374151' : 'none', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                  <Badge estado={c.estado} />
                  {c.urgencia && <Badge estado="Derivada a urgencia" />}
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: '#f9fafb', fontSize: '1rem' }}>{c.pacientes?.nombre || c.paciente_rut}</p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
                  RUT: {c.paciente_rut} &middot; Motivo: {c.motivo}
                </p>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
                <span style={{ color: '#6b7280', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                  <Clock size={13} /> {c.hora || 'Sin hora'} &middot; {c.medico_asignado || 'Sin médico'}
                </span>
                {c.estado === 'Agendada' && (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <Btn size="sm" variant="secondary" onClick={() => reasignarMedico(c.id)}>Reasignar Médico</Btn>
                    <Btn size="sm" variant="primary" onClick={() => marcarLlegada(c.id)}>Marcar Llegada</Btn>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

// ========================
// FUNCIONARIO – NUEVA ATENCIÓN
// ========================
function FuncNuevaAtencion({ goTo, showToast, load, activePatient, setActivePatient }) {
  // Paso 1: buscar RUT / Paso 2: datos + horario / Paso 3: confirmación
  const [paso, setPaso] = useState(1);
  const [rut, setRut] = useState('');
  const [showCrear, setShowCrear] = useState(false);
  const [nuevoPac, setNuevoPac] = useState({ nombre: '', edad: '', direccion: '', telefono: '', email: '', alergias: '' });
  const [atencion, setAtencion] = useState({ motivo: '', medico: '', urgencia: false, hora: '' });
  const HORAS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

  const buscar = () => load(async () => {
    if (!rut.trim()) { showToast('Ingrese un RUT', 'warning'); return; }
    setActivePatient(null);
    setShowCrear(false);
    const { data, error } = await supabase.from('pacientes').select('*').eq('rut', rut.trim()).single();
    if (error && error.code !== 'PGRST116') throw error;
    if (data) {
      setActivePatient(data);
      setPaso(2);
      showToast('Paciente encontrado ✓');
    } else {
      setShowCrear(true);
      showToast('RUT no encontrado. Complete los datos para registrar.', 'warning');
    }
  }, 'Buscando paciente...');

  const crear = () => load(async () => {
    if (!nuevoPac.nombre.trim()) { showToast('El nombre es obligatorio', 'error'); return; }
    const { data, error } = await supabase.from('pacientes').insert([{
      rut: rut.trim(), nombre: nuevoPac.nombre.trim(), edad: parseInt(nuevoPac.edad) || null,
      direccion: nuevoPac.direccion || null, telefono: nuevoPac.telefono || null,
      email: nuevoPac.email || null, alergias: nuevoPac.alergias || null
    }]).select().single();
    if (error) throw error;
    setActivePatient(data);
    setShowCrear(false);
    setPaso(2);
    showToast('Paciente registrado exitosamente ✓');
  }, 'Registrando paciente...');

  const agendar = () => load(async () => {
    if (!atencion.motivo.trim()) { showToast('El motivo es obligatorio', 'error'); return; }
    if (!atencion.hora) { showToast('Seleccione una hora', 'error'); return; }
    const fecha = new Date().toISOString().split('T')[0];
    const estado = atencion.urgencia ? 'Derivada a urgencia' : 'Agendada';
    const { error } = await supabase.from('consultas').insert([{
      paciente_rut: activePatient.rut, fecha, hora: atencion.hora,
      motivo: atencion.motivo.trim(), estado, urgencia: atencion.urgencia,
      medico_asignado: atencion.medico.trim() || null
    }]);
    if (error) throw error;
    showToast(atencion.urgencia ? '🚨 Derivado a Urgencia' : 'Consulta agendada correctamente ✓');
    goTo('dashboard');
  }, 'Agendando consulta...');

  return (
    <div style={{ animation: 'fadeIn 0.4s forwards', maxWidth: 800, margin: '0 auto' }}>
      <BackBtn onClick={() => goTo('dashboard')} />
      <Breadcrumb steps={[
        { label: 'Dashboard', onClick: () => goTo('dashboard') },
        { label: 'Nueva Atención' },
        ...(paso >= 2 ? [{ label: 'Agendar Hora' }] : []),
      ]} />

      {/* ── PASO 1: Buscar Paciente ── */}
      {paso === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: showCrear ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          <Card accent="#2563eb">
            <h2 style={{ color: '#f9fafb', margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
              <Search size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#60a5fa' }} />
              Buscar Paciente por RUT
            </h2>
            <Field label="RUT del Paciente">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Input placeholder="12.345.678-9" value={rut} onChange={e => setRut(e.target.value)} onKeyDown={e => e.key === 'Enter' && buscar()} />
                <Btn variant="primary" onClick={buscar}><Search size={16} /> Buscar</Btn>
              </div>
            </Field>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Prueba con: 12.345.678-9 · 9.876.543-2 · 15.432.100-K · 11.111.111-1
            </p>
          </Card>

          {/* ── Formulario Crear Nuevo Paciente ── */}
          {showCrear && (
            <Card accent="#f59e0b">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
                <UserPlus size={18} color="#fbbf24" />
                <h2 style={{ color: '#f9fafb', margin: 0, fontSize: '1.1rem' }}>Registrar Nuevo Paciente</h2>
              </div>
              <p style={{ color: '#6b7280', fontSize: '0.8rem', marginBottom: '1rem' }}>RUT: <strong style={{ color: '#f9fafb' }}>{rut}</strong></p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Nombre Completo *">
                    <Input placeholder="Ej: Juan Pérez González" value={nuevoPac.nombre} onChange={e => setNuevoPac({ ...nuevoPac, nombre: e.target.value })} />
                  </Field>
                </div>
                <Field label="Edad">
                  <Input type="number" placeholder="25" value={nuevoPac.edad} onChange={e => setNuevoPac({ ...nuevoPac, edad: e.target.value })} />
                </Field>
                <Field label="Teléfono">
                  <Input placeholder="+56 9 1234 5678" value={nuevoPac.telefono} onChange={e => setNuevoPac({ ...nuevoPac, telefono: e.target.value })} />
                </Field>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Dirección">
                    <Input placeholder="Av. Principal 123, Santiago" value={nuevoPac.direccion} onChange={e => setNuevoPac({ ...nuevoPac, direccion: e.target.value })} />
                  </Field>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Email">
                    <Input type="email" placeholder="correo@ejemplo.cl" value={nuevoPac.email} onChange={e => setNuevoPac({ ...nuevoPac, email: e.target.value })} />
                  </Field>
                </div>
                <div style={{ gridColumn: '1 / -1' }}>
                  <Field label="Alergias conocidas">
                    <Input placeholder="Ej: Penicilina, Ibuprofeno" value={nuevoPac.alergias} onChange={e => setNuevoPac({ ...nuevoPac, alergias: e.target.value })} />
                  </Field>
                </div>
              </div>
              <Btn variant="success" onClick={crear} style={{ width: '100%', marginTop: '0.5rem' }}>
                <UserPlus size={16} /> Guardar Paciente y Continuar
              </Btn>
            </Card>
          )}
        </div>
      )}

      {/* ── PASO 2: Datos del paciente + motivo + horario ── */}
      {paso === 2 && activePatient && (
        <div>
          {/* Banner de confirmación */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', animation: 'fadeIn 0.4s forwards' }}>
            <CheckCircle2 size={22} color="#34d399" />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#34d399' }}>Paciente listo. Ahora agenda la hora.</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Complete el motivo y seleccione un horario para confirmar la atención.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
          {/* Tarjeta Paciente */}
          <Card>
            <h3 style={{ color: '#9ca3af', fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Paciente Seleccionado</h3>
            <PatientCard pac={activePatient} />
            <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: '0.5rem', display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
              {activePatient.direccion && <p style={{ margin: 0 }}>📍 {activePatient.direccion}</p>}
              {activePatient.telefono && <p style={{ margin: 0 }}>📞 {activePatient.telefono}</p>}
              {activePatient.email && <p style={{ margin: 0 }}>✉️ {activePatient.email}</p>}
            </div>
            <Btn size="sm" variant="secondary" onClick={() => { setPaso(1); setActivePatient(null); }} style={{ marginTop: '1rem' }}>
              <Search size={14} /> Cambiar Paciente
            </Btn>
          </Card>

          {/* Formulario Atención */}
          <Card accent="#2563eb">
            <h2 style={{ color: '#f9fafb', margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
              <CalendarPlus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#60a5fa' }} />
              Registrar Consulta
            </h2>

            <Field label="Motivo de Consulta *">
              <Textarea placeholder="Describa el motivo..." value={atencion.motivo} onChange={e => setAtencion({ ...atencion, motivo: e.target.value })} style={{ minHeight: '70px' }} />
            </Field>

            <Field label="Médico Asignado (Opcional)">
              <Input placeholder="Nombre del médico" value={atencion.medico} onChange={e => setAtencion({ ...atencion, medico: e.target.value })} />
            </Field>

            <Field label="Seleccione Hora *">
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {HORAS.map(h => (
                  <button key={h} onClick={() => setAtencion({ ...atencion, hora: h })}
                    style={{ padding: '0.4rem 0.8rem', borderRadius: '7px', border: `1px solid ${atencion.hora === h ? '#2563eb' : '#374151'}`, background: atencion.hora === h ? '#2563eb' : '#111827', color: atencion.hora === h ? '#fff' : '#d1d5db', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'inherit' }}>
                    {h}
                  </button>
                ))}
              </div>
            </Field>

            {/* Urgencia */}
            <div style={{ padding: '1rem', background: atencion.urgencia ? 'rgba(239,68,68,0.1)' : '#111827', border: `1px solid ${atencion.urgencia ? 'rgba(239,68,68,0.4)' : '#374151'}`, borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', transition: 'all 0.2s', marginBottom: '1.5rem' }}
              onClick={() => setAtencion({ ...atencion, urgencia: !atencion.urgencia })}>
              <input type="checkbox" checked={atencion.urgencia} readOnly style={{ width: '1rem', height: '1rem', accentColor: '#ef4444' }} />
              <div>
                <p style={{ margin: 0, fontWeight: 700, color: atencion.urgencia ? '#f87171' : '#d1d5db' }}>🚨 Marcar como Urgencia</p>
                <p style={{ margin: 0, fontSize: '0.75rem', color: '#6b7280' }}>La consulta será derivada de inmediato a urgencias</p>
              </div>
            </div>

            <Btn variant={atencion.urgencia ? 'danger-solid' : 'primary'} onClick={agendar} style={{ width: '100%' }}>
              {atencion.urgencia ? <><AlertTriangle size={16} /> Derivar a Urgencia</> : <><CalendarPlus size={16} /> Confirmar Agendamiento</>}
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
  const [rutPac, setRutPac] = useState('');
  const [rutRet, setRutRet] = useState('');
  const [resultado, setResultado] = useState(null);
  const [showRegRep, setShowRegRep] = useState(false);
  const [nuevoRep, setNuevoRep] = useState({ nombre: '', vinculo: '' });

  const verificar = () => load(async () => {
    if (!rutPac.trim() || !rutRet.trim()) { showToast('Ingrese ambos RUT', 'error'); return; }
    setResultado(null); setShowRegRep(false);

    // 1. Verificar receta activa
    const { data: fichas, error: ef } = await supabase
      .from('fichas_medicas').select('*').eq('paciente_rut', rutPac.trim())
      .eq('emite_receta', true).order('created_at', { ascending: false }).limit(1);
    if (ef) throw ef;
    if (!fichas?.length) { setResultado({ tipo: 'sin_receta' }); return; }

    const receta = fichas[0];
    let autorizado = false;
    let nombreRetira = 'Mismo Paciente';

    if (rutPac.trim() === rutRet.trim()) {
      autorizado = true;
    } else {
      const { data: rep } = await supabase.from('representantes').select('*')
        .eq('paciente_rut', rutPac.trim()).eq('rut_representante', rutRet.trim()).single();
      if (rep) { autorizado = rep.autorizado; nombreRetira = rep.nombre; }
      else { autorizado = false; nombreRetira = 'No registrado'; }
    }
    setResultado({ tipo: autorizado ? 'ok' : 'rechazado', receta, nombreRetira });
  }, 'Verificando...');

  const registrarRetiro = (esIncidente) => load(async () => {
    const { error } = await supabase.from('retiros').insert([{
      paciente_rut: rutPac.trim(), consulta_id: resultado.receta.consulta_id,
      rut_retira: rutRet.trim(), autorizado: !esIncidente,
      fecha: new Date().toISOString().split('T')[0],
      incidente: esIncidente, motivo_rechazo: esIncidente ? 'Representante no autorizado' : null,
      retirado_por: resultado.nombreRetira
    }]);
    if (error) throw error;
    showToast(esIncidente ? 'Incidente registrado' : 'Entrega registrada correctamente ✓');
    goTo('dashboard');
  }, 'Registrando...');

  const registrarRepresentante = () => load(async () => {
    if (!nuevoRep.nombre.trim() || !nuevoRep.vinculo.trim()) { showToast('Complete los campos', 'error'); return; }
    const { error } = await supabase.from('representantes').insert([{
      paciente_rut: rutPac.trim(), rut_representante: rutRet.trim(),
      nombre: nuevoRep.nombre.trim(), vinculo: nuevoRep.vinculo.trim(), autorizado: true
    }]);
    if (error) throw error;
    showToast('Representante registrado y autorizado ✓');
    setResultado({ ...resultado, tipo: 'ok', nombreRetira: nuevoRep.nombre.trim() });
    setShowRegRep(false);
  }, 'Registrando representante...');

  return (
    <div style={{ animation: 'fadeIn 0.4s forwards', maxWidth: 900, margin: '0 auto' }}>
      <BackBtn onClick={() => goTo('dashboard')} />
      <Breadcrumb steps={[{ label: 'Dashboard', onClick: () => goTo('dashboard') }, { label: 'Retiro de Medicamentos' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: resultado ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
        <Card accent="#7c3aed">
          <h2 style={{ color: '#f9fafb', margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
            <Pill size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#a78bfa' }} />
            Verificar Autorización
          </h2>
          <Field label="RUT del Paciente (titular)">
            <Input placeholder="12.345.678-9" value={rutPac} onChange={e => setRutPac(e.target.value)} />
          </Field>
          <Field label="RUT de quien retira">
            <Input placeholder="RUT del retirador" value={rutRet} onChange={e => setRutRet(e.target.value)} />
          </Field>
          <Btn variant="primary" onClick={verificar} style={{ width: '100%', marginTop: '0.5rem' }}>
            <Search size={16} /> Verificar
          </Btn>
          <p style={{ color: '#6b7280', fontSize: '0.75rem', marginTop: '0.75rem', textAlign: 'center' }}>
            Prueba: paciente 12.345.678-9 · retirador 20.111.222-3 (autorizada)
          </p>
        </Card>

        {resultado && (
          <Card accent={resultado.tipo === 'ok' ? '#059669' : resultado.tipo === 'sin_receta' ? '#f59e0b' : '#ef4444'}>
            {resultado.tipo === 'sin_receta' && (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <AlertTriangle size={48} color="#fbbf24" style={{ margin: '0 auto 1rem' }} />
                <h3 style={{ color: '#fbbf24', margin: '0 0 0.5rem' }}>Sin Receta Activa</h3>
                <p style={{ color: '#6b7280' }}>El paciente no tiene recetas pendientes en el sistema.</p>
              </div>
            )}
            {resultado.tipo === 'ok' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                  <CheckCircle2 size={20} color="#34d399" />
                  <span style={{ color: '#34d399', fontWeight: 700 }}>AUTORIZADO</span>
                </div>
                <p style={{ color: '#d1d5db', marginBottom: '0.25rem' }}><strong>Retira:</strong> {resultado.nombreRetira}</p>
                <p style={{ color: '#d1d5db', marginBottom: '1.5rem' }}><strong>Receta:</strong> {resultado.receta.detalle_receta}</p>
                <Btn variant="success" onClick={() => registrarRetiro(false)} style={{ width: '100%' }}>
                  <CheckCircle2 size={16} /> Registrar Entrega
                </Btn>
              </div>
            )}
            {resultado.tipo === 'rechazado' && (
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: '8px', padding: '0.75rem 1rem', marginBottom: '1.5rem' }}>
                  <AlertCircle size={20} color="#f87171" />
                  <span style={{ color: '#f87171', fontWeight: 700 }}>NO AUTORIZADO</span>
                </div>
                <p style={{ color: '#9ca3af', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                  "{resultado.nombreRetira}" no está autorizado para retirar esta receta.
                </p>
                <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                  <Btn variant="danger-solid" onClick={() => registrarRetiro(true)} style={{ flex: 1 }}>
                    <AlertCircle size={15} /> Registrar Incidente
                  </Btn>
                  <Btn variant="secondary" onClick={() => setShowRegRep(!showRegRep)} style={{ flex: 1 }}>
                    <UserPlus size={15} /> Registrar Representante
                  </Btn>
                </div>
                {showRegRep && (
                  <div style={{ borderTop: '1px solid #374151', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <Field label="Nombre del Representante">
                      <Input placeholder="Nombre completo" value={nuevoRep.nombre} onChange={e => setNuevoRep({ ...nuevoRep, nombre: e.target.value })} />
                    </Field>
                    <Field label="Vínculo">
                      <Input placeholder="Ej: Hijo, Cónyuge, Tutor" value={nuevoRep.vinculo} onChange={e => setNuevoRep({ ...nuevoRep, vinculo: e.target.value })} />
                    </Field>
                    <Btn variant="success" onClick={registrarRepresentante}>
                      <CheckCircle2 size={15} /> Guardar y Autorizar
                    </Btn>
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
  const abrirConsulta = async (c) => {
    setActiveConsulta(c);
    setActivePatient(c.pacientes);
    if (c.estado !== 'En atención') {
      await load(async () => {
        const { error } = await supabase.from('consultas').update({ estado: 'En atención' }).eq('id', c.id);
        if (error) throw error;
      }, 'Iniciando atención...');
    }
    goTo('atencion');
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ color: '#f9fafb', margin: 0, fontSize: '1.5rem', fontWeight: 800 }}>Mi Agenda del Día</h1>
          <p style={{ color: '#6b7280', margin: '0.25rem 0 0', fontSize: '0.875rem' }}>{consultas.length} pacientes en lista</p>
        </div>
        <Btn variant="secondary" onClick={() => load(loadAgenda, 'Actualizando...')}><RefreshCw size={15} /> Actualizar</Btn>
      </div>

      <Card>
        {consultas.length === 0 ? (
          <p style={{ textAlign: 'center', color: '#6b7280', padding: '3rem 0' }}>No hay pacientes en espera.</p>
        ) : (
          consultas.map((c, i) => (
            <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.25rem 0', borderBottom: i < consultas.length - 1 ? '1px solid #374151' : 'none', borderLeft: `3px solid ${c.estado === 'En atención' ? '#f59e0b' : c.urgencia ? '#ef4444' : '#2563eb'}`, paddingLeft: '1rem', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Badge estado={c.estado} />
                  {c.urgencia && <Badge estado="Derivada a urgencia" />}
                </div>
                <p style={{ margin: 0, fontWeight: 700, color: '#f9fafb', fontSize: '1rem' }}>
                  {c.pacientes?.nombre || c.paciente_rut}
                </p>
                <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: '#9ca3af' }}>
                  Motivo: {c.motivo} &middot; <Clock size={12} style={{ display: 'inline', verticalAlign: 'middle' }} /> {c.hora || 'S/H'}
                </p>
              </div>
              <Btn variant={c.estado === 'En atención' ? 'warning' : 'primary'} onClick={() => abrirConsulta(c)}>
                {c.estado === 'En atención' ? 'Continuar Atención' : 'Iniciar Atención'}
              </Btn>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}

// ========================
// MÉDICO – ATENCIÓN
// ========================
function MedicoAtencion({ consulta, paciente, goTo, showToast, load }) {
  const [form, setForm] = useState({
    signos: '', sintomas: '', examen: '', diag1: '', diag2: '', obs: '', instrucciones: '',
    emiteReceta: false, receta: '', emiteCert: false, reposo: '',
    reqSegui: false, diasSegui: ''
  });
  const f = (key, val) => setForm(p => ({ ...p, [key]: val }));

  const derivarUrgencia = () => load(async () => {
    const { error } = await supabase.from('consultas').update({ estado: 'Derivada a urgencia', urgencia: true }).eq('id', consulta.id);
    if (error) throw error;
    showToast('Paciente derivado a urgencias', 'warning');
    goTo('dashboard');
  }, 'Derivando...');

  const cerrar = async () => {
    if (!window.confirm('Consulta clínicamente cerrada.\n\n¿Desea cerrar administrativamente?')) return;
    load(async () => {
      const ficha = {
        consulta_id: consulta.id, paciente_rut: paciente.rut,
        fecha: new Date().toISOString().split('T')[0], medico: 'Médico Titular',
        signos_vitales: form.signos, sintomas_detectados: form.sintomas, examen_fisico: form.examen,
        diagnostico: form.diag1, diagnostico_secundario: form.diag2, observaciones: form.obs,
        instrucciones_paciente: form.instrucciones,
        emite_receta: form.emiteReceta, detalle_receta: form.emiteReceta ? form.receta : null,
        emite_certificado: form.emiteCert, dias_reposo: form.emiteCert ? parseInt(form.reposo) || null : null,
        requiere_seguimiento: form.reqSegui, dias_seguimiento: form.reqSegui ? parseInt(form.diasSegui) || null : null,
        estado_cierre: 'Cerrada Administrativamente'
      };
      const { error: e1 } = await supabase.from('fichas_medicas').insert([ficha]);
      if (e1) throw e1;
      const { error: e2 } = await supabase.from('consultas').update({ estado: 'Cerrada' }).eq('id', consulta.id);
      if (e2) throw e2;
      showToast('Atención finalizada y guardada ✓');
      goTo('dashboard');
    }, 'Guardando ficha médica...');
  };

  return (
    <div style={{ animation: 'fadeIn 0.4s forwards' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '0.5rem' }}>
        <BackBtn onClick={() => goTo('dashboard')} label="Volver a Agenda" />
        <Btn variant="danger-solid" onClick={derivarUrgencia}><AlertTriangle size={15} /> Derivar a Urgencia (Deterioro)</Btn>
      </div>
      <Breadcrumb steps={[{ label: 'Agenda', onClick: () => goTo('dashboard') }, { label: 'Atención Clínica' }]} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1.5rem' }}>
        {/* Info Paciente */}
        <div>
          <Card style={{ marginBottom: '1.5rem' }}>
            <h3 style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Paciente</h3>
            <PatientCard pac={paciente || {}} />
            <div style={{ background: '#111827', borderRadius: '8px', padding: '0.75rem 1rem', marginTop: '0.75rem' }}>
              <p style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: '0 0 0.25rem' }}>Motivo de Consulta</p>
              <p style={{ color: '#d1d5db', fontStyle: 'italic', margin: 0, fontSize: '0.875rem' }}>"{consulta?.motivo}"</p>
            </div>
          </Card>
          <Card>
            <h3 style={{ color: '#9ca3af', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.1em', margin: '0 0 1rem' }}>Antecedentes</h3>
            <p style={{ color: '#f87171', fontSize: '0.85rem', margin: '0 0 0.4rem' }}>
              <strong>Patologías:</strong> {paciente?.patologias?.join(', ') || 'Ninguna registrada'}
            </p>
            <p style={{ color: '#fbbf24', fontSize: '0.85rem', margin: 0 }}>
              <strong>Alergias:</strong> {paciente?.alergias || 'Ninguna'}
            </p>
          </Card>
        </div>

        {/* Formulario Clínico */}
        <Card accent="#2563eb">
          <h2 style={{ color: '#f9fafb', margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
            <FileText size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#60a5fa' }} />
            Registro Clínico
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Signos Vitales">
                <Input placeholder="PA 120/80 · FC 75 · T 36.8 · SO2 98%" value={form.signos} onChange={e => f('signos', e.target.value)} />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Síntomas Principales Detectados">
                <Textarea placeholder="Describa los síntomas observados..." value={form.sintomas} onChange={e => f('sintomas', e.target.value)} />
              </Field>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Examen Físico">
                <Textarea placeholder="Hallazgos del examen físico..." value={form.examen} onChange={e => f('examen', e.target.value)} />
              </Field>
            </div>
            <Field label="Diagnóstico Principal">
              <Input placeholder="CIE-10 o descripción" value={form.diag1} onChange={e => f('diag1', e.target.value)} />
            </Field>
            <Field label="Diagnóstico Secundario">
              <Input placeholder="Opcional" value={form.diag2} onChange={e => f('diag2', e.target.value)} />
            </Field>
            <div style={{ gridColumn: '1 / -1' }}>
              <Field label="Observaciones Clínicas">
                <Textarea placeholder="Notas adicionales para el expediente..." value={form.obs} onChange={e => f('obs', e.target.value)} style={{ minHeight: '70px' }} />
              </Field>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid #374151', margin: '1.25rem 0' }} />

          {/* Toggles */}
          {[
            { key: 'emiteReceta', label: '📋 Emitir Receta Médica', subKey: 'receta', subLabel: 'Detalle de medicamentos y dosis', isText: true },
            { key: 'emiteCert', label: '📄 Emitir Certificado / Licencia', subKey: 'reposo', subLabel: 'Días de reposo', isText: false },
            { key: 'reqSegui', label: '🔁 Requiere Seguimiento', subKey: 'diasSegui', subLabel: 'Control en (días)', isText: false },
          ].map(t => (
            <div key={t.key} style={{ marginBottom: '1rem' }}>
              <div onClick={() => f(t.key, !form[t.key])} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', cursor: 'pointer', padding: '0.75rem 1rem', background: form[t.key] ? 'rgba(59,130,246,0.1)' : '#111827', border: `1px solid ${form[t.key] ? 'rgba(59,130,246,0.4)' : '#374151'}`, borderRadius: '8px', transition: 'all 0.2s' }}>
                <div style={{ width: '20px', height: '20px', borderRadius: '6px', background: form[t.key] ? '#2563eb' : '#374151', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}>
                  {form[t.key] && <CheckCircle2 size={14} color="white" />}
                </div>
                <span style={{ fontWeight: 600, color: form[t.key] ? '#93c5fd' : '#d1d5db' }}>{t.label}</span>
              </div>
              {form[t.key] && (
                <div style={{ marginTop: '0.5rem', animation: 'fadeIn 0.2s forwards' }}>
                  {t.isText
                    ? <Textarea placeholder={t.subLabel} value={form[t.subKey]} onChange={e => f(t.subKey, e.target.value)} style={{ minHeight: '80px' }} />
                    : <Input type="number" placeholder={t.subLabel} value={form[t.subKey]} onChange={e => f(t.subKey, e.target.value)} />
                  }
                </div>
              )}
            </div>
          ))}

          <div style={{ marginTop: '0.5rem' }}>
            <Field label="Instrucciones para el Paciente">
              <Textarea placeholder="Indicaciones, cuidados en casa, medicación..." value={form.instrucciones} onChange={e => f('instrucciones', e.target.value)} style={{ minHeight: '70px' }} />
            </Field>
          </div>

          <Btn variant="success" onClick={cerrar} style={{ width: '100%', marginTop: '1rem', padding: '0.85rem' }}>
            <CheckCircle2 size={18} /> Cerrar Consulta y Guardar Ficha Médica
          </Btn>
        </Card>
      </div>
    </div>
  );
}
