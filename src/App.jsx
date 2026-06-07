import React, { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import { Stethoscope, Users, LogOut, ChevronRight } from 'lucide-react';
import { Loader, Toast, Btn } from './components/ui';
import { handleSupabaseError } from './utils/errorHandler';

import FuncDashboard from './components/Funcionario/Dashboard';
import FuncNuevaAtencion from './components/Funcionario/NuevaAtencion';
import FuncRetiro from './components/Funcionario/RetiroMedicamentos';

import MedicoDashboard from './components/Medico/Dashboard';
import MedicoAtencion from './components/Medico/Atencion';

export default function App() {
  const [role, setRole] = useState(null);
  const [view, setView] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('Procesando...');
  const [toast, setToast] = useState(null);
  const [consultas, setConsultas] = useState([]);
  const [activePatient, setActivePatient] = useState(null);
  const [activeConsulta, setActiveConsulta] = useState(null);
  const [helpOpen, setHelpOpen] = useState(false);

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
      const friendlyMsg = handleSupabaseError(err);
      showToast(friendlyMsg, 'error');
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
      .in('estado', ['Agendada', 'En espera', 'En atención', 'Derivada a urgencia'])
      .order('created_at', { ascending: true })
      .limit(20);
    if (error) throw error;
    
    const sortedData = (data || []).sort((a, b) => {
      if (a.estado === 'En atención' && b.estado !== 'En atención') return -1;
      if (b.estado === 'En atención' && a.estado !== 'En atención') return 1;
      if (a.urgencia && !b.urgencia) return -1;
      if (!a.urgencia && b.urgencia) return 1;
      return new Date(a.created_at || 0) - new Date(b.created_at || 0);
    });
    setConsultas(sortedData);
  };

  useEffect(() => {
    if (!role) return;
    if (role === 'funcionario') load(loadConsultas, 'Cargando consultas...').catch(e => showToast(handleSupabaseError(e), 'error'));
    if (role === 'medico') load(loadAgendaMedica, 'Cargando agenda...').catch(e => showToast(handleSupabaseError(e), 'error'));
  }, [role]);

  const goTo = (v) => setView(v);

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
              { label: 'Médico', role: 'medico', icon: <Stethoscope size={18} />, color: '#059669' }
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
          
          <div style={{ marginTop: '2rem', textAlign: 'left' }}>
            <button onClick={() => setHelpOpen(!helpOpen)} style={{ background: 'none', border: 'none', color: '#9ca3af', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', width: '100%', padding: 0 }}>
              <ChevronRight size={16} style={{ transform: helpOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
              ¿Cómo usar cada rol?
            </button>
            {helpOpen && (
              <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem', animation: 'fadeIn 0.3s forwards' }}>
                <div style={{ background: 'rgba(37,99,235,0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #2563eb' }}>
                  <p style={{ margin: '0 0 0.5rem', color: '#60a5fa', fontWeight: 600, fontSize: '0.85rem' }}>Funcionario de Ventanilla</p>
                  <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    Encargado de la recepción. Puede buscar pacientes por RUT, registrarlos, agendar consultas (o derivarlas a urgencia), y gestionar el retiro de medicamentos.
                  </p>
                </div>
                <div style={{ background: 'rgba(5,150,105,0.1)', padding: '1rem', borderRadius: '8px', borderLeft: '3px solid #059669' }}>
                  <p style={{ margin: '0 0 0.5rem', color: '#34d399', fontWeight: 600, fontSize: '0.85rem' }}>Médico</p>
                  <p style={{ margin: 0, color: '#d1d5db', fontSize: '0.8rem', lineHeight: 1.5 }}>
                    Visualiza la agenda con urgencias al inicio. Puede registrar signos, diagnósticos, emitir recetas o certificados y cerrar consultas.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', background: '#111827', fontFamily: 'Inter, sans-serif' }}>
      {loading && <Loader text={loadingText} />}
      <Toast toast={toast} />

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
        {role === 'funcionario' && view === 'dashboard' && <FuncDashboard consultas={consultas} goTo={goTo} showToast={showToast} load={load} loadConsultas={loadConsultas} setLoadingText={setLoadingText} />}
        {role === 'funcionario' && view === 'nueva-atencion' && <FuncNuevaAtencion goTo={goTo} showToast={showToast} load={load} activePatient={activePatient} setActivePatient={setActivePatient} />}
        {role === 'funcionario' && view === 'retiro' && <FuncRetiro goTo={goTo} showToast={showToast} load={load} />}

        {role === 'medico' && view === 'dashboard' && <MedicoDashboard consultas={consultas} goTo={goTo} showToast={showToast} load={load} loadAgenda={loadAgendaMedica} setActiveConsulta={setActiveConsulta} setActivePatient={setActivePatient} />}
        {role === 'medico' && view === 'atencion' && <MedicoAtencion consulta={activeConsulta} paciente={activePatient} goTo={goTo} showToast={showToast} load={load} />}
      </main>
    </div>
  );
}
