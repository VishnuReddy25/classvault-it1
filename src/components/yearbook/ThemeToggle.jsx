import React from 'react';

const THEMES = [
  { id: 'dark',  label: '🌑 Dark'  },
  { id: 'light', label: '☀️ Light' },
  { id: 'retro', label: '📼 Retro' },
];

export default function ThemeToggle({ theme, setTheme, themeVars: tv }) {
  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3,
      background: tv.inputBg, border: `1px solid ${tv.inputBorder}`,
      borderRadius: 100,
    }}>
      {THEMES.map(t => (
        <button
          key={t.id}
          onClick={() => setTheme(t.id)}
          style={{
            padding: '6px 14px', borderRadius: 100, fontSize: 11, fontWeight: 500,
            border: 'none', cursor: 'pointer',
            background: theme === t.id ? '#7c3aed' : 'transparent',
            color: theme === t.id ? '#fff' : tv.muted.color,
            fontFamily: "'DM Sans',sans-serif",
            transition: 'all 0.18s',
          }}
        >{t.label}</button>
      ))}
    </div>
  );
}
