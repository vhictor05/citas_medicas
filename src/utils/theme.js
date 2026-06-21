export const T = {
  bg:       '#0a0f1a',
  bgCard:   '#0e1623',
  bgInput:  '#080d16',
  bgHover:  '#131d2e',
  border:   '#1a2640',
  borderHi: '#2a3f60',
  textPrimary:   '#e8f0fe',
  textSecondary: '#6b85a8',
  textMuted:     '#3d5275',
  blue:    '#3b82f6',
  blueDim: 'rgba(59,130,246,0.12)',
  green:   '#10b981',
  greenDim:'rgba(16,185,129,0.12)',
  red:     '#ef4444',
  redDim:  'rgba(239,68,68,0.12)',
  amber:   '#f59e0b',
  amberDim:'rgba(245,158,11,0.12)',
  purple:  '#8b5cf6',
  purpleDim:'rgba(139,92,246,0.12)',
};

export const css = `
  @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600;700&family=DM+Mono:wght@400;500&display=swap');
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: ${T.bg}; font-family: 'DM Sans', sans-serif; color: ${T.textPrimary}; }
  ::-webkit-scrollbar { width: 6px; }
  ::-webkit-scrollbar-track { background: ${T.bg}; }
  ::-webkit-scrollbar-thumb { background: ${T.border}; border-radius: 3px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
  @keyframes fadeIn { from { opacity:0; } to { opacity:1; } }
  @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:.5; } }
  @keyframes slideIn { from { opacity:0; transform:translateX(-8px); } to { opacity:1; transform:translateX(0); } }
  @keyframes ecgMove { from { transform: translateX(0); } to { transform: translateX(-50%); } }
`;
