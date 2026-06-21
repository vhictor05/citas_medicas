import React, { useState } from 'react';
import { FileText, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { T } from '../../utils/theme';
import BackBtn from '../ui/BackBtn';
import Breadcrumb from '../ui/Breadcrumb';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';
import Field from '../ui/Field';
import Input from '../ui/Input';
import Textarea from '../ui/Textarea';
import Btn from '../ui/Btn';
import PatientCard from '../ui/PatientCard';

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

export default MedicoAtencion;
