import React, { useState, useEffect } from 'react';

function EcgBackground() {
  const [pulsos, setPulsos] = useState([]);

  // Path de un pulso corto: línea base + 1 ciclo QRS + línea base
  // Ancho total ~80px, centrado en y=40 dentro de viewBox 80x80
  const pulsePath = "M0,40 L15,40 L18,37 L20,40 L24,40 L26,15 L28,58 L30,40 L36,33 L40,40 L55,40";

  useEffect(() => {
    const COLORS = ['#ef4444', '#10b981']; // rojo y verde únicamente
    let idCounter = 0;

    const spawnPulso = () => {
      const id      = idCounter++;
      const topPct  = 10 + Math.random() * 80;          // posición vertical aleatoria
      const color   = COLORS[Math.floor(Math.random() * COLORS.length)];
      const dur     = 6000 + Math.random() * 5000;      // duración 6s–11s (cruce lento)
      const scale   = 0.7 + Math.random() * 0.6;        // tamaño variable
      const opacity = 0.25 + Math.random() * 0.2;       // opacidad variable

      setPulsos(prev => [...prev, { id, topPct, color, dur, scale, opacity, born: Date.now() }]);

      setTimeout(() => {
        setPulsos(prev => prev.filter(p => p.id !== id));
      }, dur + 200);
    };

    // Solo 1 pulso inicial al arrancar
    setTimeout(spawnPulso, 600);

    // Nuevos pulsos esporádicos: cada 3s–7s
    const scheduleNext = () => {
      const wait = 3000 + Math.random() * 4000;
      return setTimeout(() => {
        spawnPulso();
        timeoutRef.current = scheduleNext();
      }, wait);
    };
    const timeoutRef = { current: null };
    timeoutRef.current = scheduleNext();

    return () => clearTimeout(timeoutRef.current);
  }, []);

  return (
    <div style={{ position:'absolute', inset:0, pointerEvents:'none', overflow:'hidden' }}>
      {pulsos.map(p => {
        const w = 55 * p.scale; // ancho del SVG en px
        const h = 80 * p.scale;
        return (
          <div key={p.id} style={{
            position: 'absolute',
            top: `${p.topPct}%`,
            left: '-80px',
            transform: 'translateY(-50%)',
            width: `${w}px`,
            height: `${h}px`,
            animation: `ecgPulso ${p.dur}ms linear forwards`,
          }}>
            <svg width={w} height={h} viewBox="0 0 55 80" preserveAspectRatio="none">
              <defs>
                <linearGradient id={`pg${p.id}`} x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%"   stopColor={p.color} stopOpacity="0"/>
                  <stop offset="25%"  stopColor={p.color} stopOpacity={p.opacity}/>
                  <stop offset="75%"  stopColor={p.color} stopOpacity={p.opacity}/>
                  <stop offset="100%" stopColor={p.color} stopOpacity="0"/>
                </linearGradient>
              </defs>
              <path
                d={pulsePath}
                fill="none"
                stroke={`url(#pg${p.id})`}
                strokeWidth={1.4}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        );
      })}
      <style>{`
        @keyframes ecgPulso {
          from { transform: translateY(-50%) translateX(0); }
          to   { transform: translateY(-50%) translateX(120vw); }
        }
      `}</style>
    </div>
  );
}

export default EcgBackground;
