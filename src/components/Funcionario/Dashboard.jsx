import React from 'react';
import { supabase } from '../../supabaseClient';
import { RefreshCw, Pill, CalendarPlus, Clock } from 'lucide-react';
import { Card, Badge, Btn } from '../ui';

export default function FuncDashboard({ consultas, goTo, showToast, load, loadConsultas, setLoadingText }) {
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
