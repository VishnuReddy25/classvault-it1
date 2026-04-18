import React from 'react';

const THEMES = {
  green:  { bg:'rgba(20,184,166,0.08)',  border:'rgba(20,184,166,0.28)',  color:'#0f6e56' },
  purple: { bg:'rgba(108,71,255,0.08)',  border:'rgba(108,71,255,0.24)',  color:'#4338ca' },
  gold:   { bg:'rgba(245,158,11,0.08)',  border:'rgba(245,158,11,0.28)',  color:'#92400e' },
  blue:   { bg:'rgba(59,130,246,0.08)',  border:'rgba(59,130,246,0.24)',  color:'#1e40af' },
  rose:   { bg:'rgba(244,63,94,0.08)',   border:'rgba(244,63,94,0.24)',   color:'#9f1239' },
};

export default function TrustBadge({ icon, label, theme = 'green', style = {} }) {
  const t = THEMES[theme] || THEMES.green;
  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 7,
        padding: '7px 14px', borderRadius: 100, fontSize: 12, fontWeight: 500,
        background: t.bg, border: `1px solid ${t.border}`, color: t.color,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
        ...style,
      }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(0,0,0,0.07)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
    >
      <span style={{ fontSize: 14, lineHeight: 1 }}>{icon}</span>
      {label}
    </div>
  );
}
