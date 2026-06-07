import React from 'react';
import { supabase } from '../../supabaseClient';
import { RefreshCw, Clock } from 'lucide-react';
import { Card, Badge, Btn } from '../ui';

export default function MedicoDashboard({ consultas, goTo, showToast, load, loadAgenda, setActiveConsulta, setActivePatient }) {
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
