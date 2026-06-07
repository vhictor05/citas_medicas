import React, { useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, UserPlus, CalendarPlus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { BackBtn, Breadcrumb, Card, Field, Input, Btn, Textarea, PatientCard } from '../ui';
import { formatRut, isValidRut, isValidEmail } from '../../utils/formatters';

export default function FuncNuevaAtencion({ goTo, showToast, load, activePatient, setActivePatient }) {
  const [paso, setPaso] = useState(1);
  const [rut, setRut] = useState('');
  const [showCrear, setShowCrear] = useState(false);
  const [nuevoPac, setNuevoPac] = useState({ nombre: '', edad: '', direccion: '', telefono: '', email: '', alergias: '' });
  const [atencion, setAtencion] = useState({ motivo: '', medico: '', urgencia: false, hora: '' });
  const HORAS = ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '12:00', '14:00', '14:30', '15:00', '15:30', '16:00'];

  const buscar = () => load(async () => {
    if (!rut.trim()) { showToast('Ingrese un RUT', 'warning'); return; }
    if (!isValidRut(rut)) { showToast('El RUT ingresado no es válido', 'error'); return; }

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
    if (nuevoPac.email && !isValidEmail(nuevoPac.email)) { showToast('El formato del email no es válido', 'error'); return; }
    
    let edadParsed = parseInt(nuevoPac.edad);
    if (nuevoPac.edad && (isNaN(edadParsed) || edadParsed < 0 || edadParsed > 120)) {
      showToast('Ingrese una edad válida (0-120)', 'error'); return;
    }

    const { data, error } = await supabase.from('pacientes').insert([{
      rut: rut.trim(), 
      nombre: nuevoPac.nombre.trim(), 
      edad: isNaN(edadParsed) ? null : edadParsed,
      direccion: nuevoPac.direccion || null, 
      telefono: nuevoPac.telefono || null,
      email: nuevoPac.email || null, 
      alergias: nuevoPac.alergias || null
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
    const medico = atencion.medico.trim() || 'Sin asignar';

    // Verificación de Doble Agendamiento
    const { data: citasExistentes, error: errExist } = await supabase
      .from('consultas')
      .select('id')
      .eq('fecha', fecha)
      .eq('hora', atencion.hora)
      .eq('medico_asignado', medico)
      .in('estado', ['Agendada', 'En espera', 'En atención']);
    
    if (errExist) throw errExist;
    if (citasExistentes && citasExistentes.length > 0) {
      showToast('Ese médico ya tiene una cita agendada en ese horario. Selecciona otra hora o médico.', 'error');
      return;
    }

    const estado = atencion.urgencia ? 'Derivada a urgencia' : 'Agendada';
    const { error } = await supabase.from('consultas').insert([{
      paciente_rut: activePatient.rut, fecha, hora: atencion.hora,
      motivo: atencion.motivo.trim(), estado, urgencia: atencion.urgencia,
      medico_asignado: medico
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

      {paso === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: showCrear ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
          <Card accent="#2563eb">
            <h2 style={{ color: '#f9fafb', margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
              <Search size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#60a5fa' }} />
              Buscar Paciente por RUT
            </h2>
            <Field label="RUT del Paciente">
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <Input 
                  placeholder="12.345.678-9" 
                  value={rut} 
                  onChange={e => setRut(formatRut(e.target.value))} 
                  onKeyDown={e => e.key === 'Enter' && buscar()} 
                />
                <Btn variant="primary" onClick={buscar}><Search size={16} /> Buscar</Btn>
              </div>
            </Field>
            <p style={{ color: '#6b7280', fontSize: '0.8rem', marginTop: '0.5rem' }}>
              Se formateará automáticamente.
            </p>
          </Card>

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

      {paso === 2 && activePatient && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', borderRadius: '10px', padding: '1rem 1.25rem', marginBottom: '1.5rem', animation: 'fadeIn 0.4s forwards' }}>
            <CheckCircle2 size={22} color="#34d399" />
            <div>
              <p style={{ margin: 0, fontWeight: 700, color: '#34d399' }}>Paciente listo. Ahora agenda la hora.</p>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Complete el motivo y seleccione un horario para confirmar la atención.</p>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1.5rem' }}>
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

          <Card accent="#2563eb">
            <h2 style={{ color: '#f9fafb', margin: '0 0 1.5rem', fontSize: '1.1rem' }}>
              <CalendarPlus size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle', color: '#60a5fa' }} />
              Registrar Consulta
            </h2>

            <Field label="Motivo de Consulta *">
              <Textarea placeholder="Describa el motivo..." value={atencion.motivo} onChange={e => setAtencion({ ...atencion, motivo: e.target.value })} style={{ minHeight: '70px' }} />
            </Field>

            <Field label="Médico Asignado *">
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
