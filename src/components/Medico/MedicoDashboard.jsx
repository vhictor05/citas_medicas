import React from 'react';
import { Stethoscope, RefreshCw, AlertTriangle, Users, Activity, Shield, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../supabaseClient';
import { T } from '../../utils/theme';
import Btn from '../ui/Btn';
import StatPill from '../ui/StatPill';
import Card from '../ui/Card';
import Avatar from '../ui/Avatar';
import Badge from '../ui/Badge';

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

export default MedicoDashboard;
