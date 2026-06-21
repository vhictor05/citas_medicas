import React, { useState } from 'react';
import { Search, Pill, AlertTriangle, CheckCircle2, AlertCircle, UserPlus } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { T } from '../../utils/theme';
import { formatRut } from '../../utils/formatters';
import BackBtn from '../ui/BackBtn';
import Breadcrumb from '../ui/Breadcrumb';
import Card from '../ui/Card';
import SectionTitle from '../ui/SectionTitle';
import Field from '../ui/Field';
import Input from '../ui/Input';
import Btn from '../ui/Btn';

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
    await supabase.from('consultas').update({ estado: 'Completada' }).eq('id', resultado.receta.consulta_id);
    showToast(esIncidente?'Incidente registrado':'Entrega registrada y paciente archivado ✓');
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
            <Input placeholder="12.345.678-9" value={rutPac} onChange={e=>setRutPac(formatRut(e.target.value))}/>
          </Field>
          <Field label="RUT de quien retira">
            <Input placeholder="RUT del retirador" value={rutRet} onChange={e=>setRutRet(formatRut(e.target.value))}/>
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

export default FuncRetiro;
