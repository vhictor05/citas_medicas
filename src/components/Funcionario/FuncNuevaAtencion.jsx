import React, { useState } from 'react';
import { Search, UserPlus, CalendarPlus, CheckCircle2, AlertTriangle } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { T } from '../../utils/theme';
import { formatRut, isValidRut, isValidEmail } from '../../utils/formatters';
import BackBtn from '../ui/BackBtn';
import Breadcrumb from '../ui/Breadcrumb';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';
import Field from '../ui/Field';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Btn from '../ui/Btn';
import PatientCard from '../ui/PatientCard';

function FuncNuevaAtencion({ goTo, showToast, load, activePatient, setActivePatient }) {
  const [paso, setPaso]           = useState(1);
  const [rut, setRut]             = useState('');
  const [showCrear, setShowCrear] = useState(false);
  const [nuevoPac, setNuevoPac]   = useState({ nombre:'', edad:'', direccion:'', telefono:'', email:'', alergias:'' });
  const [atencion, setAtencion]   = useState({ motivo:'', medico:'', urgencia:false, fecha:new Date().toISOString().split('T')[0], hora:'' });
  const HORAS = ['08:00','08:30','09:00','09:30','10:00','10:30','11:00','11:30','12:00','14:00','14:30','15:00','15:30','16:00'];

  const buscar = () => load(async()=>{
    if (!rut.trim()) { showToast('Ingrese un RUT','warning'); return; }
    if (!isValidRut(rut.trim())) { showToast('RUT inválido', 'error'); return; }
    setActivePatient(null); setShowCrear(false);
    const { data, error } = await supabase.from('pacientes').select('*').eq('rut',rut.trim()).single();
    if (error && error.code!=='PGRST116') throw error;
    if (data) { setActivePatient(data); setPaso(2); showToast('Paciente encontrado ✓'); }
    else { setShowCrear(true); showToast('RUT no encontrado. Complete los datos.','warning'); }
  },'Buscando paciente...');

  const crear = () => load(async()=>{
    if (!isValidRut(rut.trim())) { showToast('RUT inválido', 'error'); return; }
    if (!nuevoPac.nombre.trim()) { showToast('El nombre es obligatorio','error'); return; }
    if (nuevoPac.edad && parseInt(nuevoPac.edad) <= 0) { showToast('La edad debe ser mayor a 0', 'error'); return; }
    if (nuevoPac.email && !isValidEmail(nuevoPac.email)) { showToast('El email ingresado no es válido', 'error'); return; }

    const { data, error } = await supabase.from('pacientes').insert([{ rut:rut.trim(), nombre:nuevoPac.nombre.trim(), edad:parseInt(nuevoPac.edad)||null, direccion:nuevoPac.direccion||null, telefono:nuevoPac.telefono||null, email:nuevoPac.email||null, alergias:nuevoPac.alergias||null }]).select().single();
    if (error) throw error;
    setActivePatient(data); setShowCrear(false); setPaso(2);
    showToast('Paciente registrado exitosamente ✓');
  },'Registrando paciente...');

  const agendar = () => load(async()=>{
    if (!atencion.motivo.trim()) { showToast('El motivo es obligatorio','error'); return; }
    if (!atencion.fecha) { showToast('Seleccione una fecha','error'); return; }
    if (!atencion.hora) { showToast('Seleccione una hora','error'); return; }
    
    // Validar topes de horario para el mismo médico
    if (atencion.medico.trim()) {
      const { data: conflict } = await supabase.from('consultas')
        .select('id')
        .eq('fecha', atencion.fecha)
        .eq('hora', atencion.hora)
        .eq('medico_asignado', atencion.medico.trim())
        .in('estado', ['Agendada', 'En espera', 'En atención']);
      if (conflict && conflict.length > 0) {
        showToast('El médico ya tiene una cita agendada en esa fecha y hora', 'error');
        return;
      }
    }

    const estado = atencion.urgencia ? 'Derivada a urgencia' : 'Agendada';
    const { error } = await supabase.from('consultas').insert([{ paciente_rut:activePatient.rut, fecha:atencion.fecha, hora:atencion.hora, motivo:atencion.motivo.trim(), estado, urgencia:atencion.urgencia, medico_asignado:atencion.medico.trim()||null }]);
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
                <Input placeholder="12.345.678-9" value={rut} onChange={e=>setRut(formatRut(e.target.value))} onKeyDown={e=>e.key==='Enter'&&buscar()}/>
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
              <Field label="Médico Asignado">
                <Input placeholder="Nombre del médico" value={atencion.medico} onChange={e=>setAtencion({...atencion,medico:e.target.value})}/>
              </Field>
              <Field label="Seleccione Fecha *">
                <Input type="date" value={atencion.fecha} onChange={e=>setAtencion({...atencion,fecha:e.target.value})} />
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

export default FuncNuevaAtencion;
