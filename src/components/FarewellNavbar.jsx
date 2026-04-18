import React, { useState } from 'react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'journey',  label: 'The Journey' },
  { id: 'yearbook', label: 'Yearbook'    },
  { id: 'media',    label: 'Media Vault' },
  { id: 'wall',     label: 'The Wall'    },
  { id: 'vaults',   label: 'ClassVault'  },
];

export default function FarewellNavbar({ page, onNavigate, sessionStudent, onLogout }) {
  const { activeVaultId, exitVault } = useApp();
  const [showMenu, setShowMenu] = useState(false);

  return (
    <nav
      className="slide-down"
      style={{
        position:'sticky', top:14, zIndex:100,
        margin:'14px 16px 0',
        display:'flex', alignItems:'center', justifyContent:'space-between',
        padding:'10px 20px',
        background:'rgba(13,11,24,0.75)',
        backdropFilter:'saturate(180%) blur(24px)',
        WebkitBackdropFilter:'saturate(180%) blur(24px)',
        border:'1px solid rgba(212,175,55,0.18)',
        borderRadius:100,
        boxShadow:'0 4px 32px rgba(0,0,0,0.35)',
      }}
    >
      {/* Logo */}
      <div style={{ display:'flex', alignItems:'center', gap:8, flexShrink:0 }}>
        <div style={{
          width:8, height:8, borderRadius:'50%',
          background:'linear-gradient(135deg,#d4af37,#f5c842)',
          animation:'pulseDot 2.5s ease-in-out infinite',
        }} />
        <span style={{ fontFamily:"'Fraunces',serif", fontSize:17, fontWeight:700, letterSpacing:-0.3 }}>
          <span style={{ color:'#d4af37' }}>Batch</span>
          <span style={{ color:'rgba(255,255,255,0.9)' }}> 2022</span>
          <span style={{ color:'rgba(255,255,255,0.4)' }}>–26</span>
        </span>
      </div>

      {/* Nav links */}
      <div style={{ display:'flex', gap:2, alignItems:'center' }}>
        {NAV_ITEMS.map(item => (
          <button
            key={item.id}
            onClick={() => { onNavigate(item.id); if (activeVaultId) exitVault(); }}
            style={{
              padding:'7px 16px', borderRadius:100, fontSize:13, fontWeight:500,
              border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
              background: page===item.id ? 'rgba(212,175,55,0.18)' : 'transparent',
              color: page===item.id ? '#d4af37' : 'rgba(255,255,255,0.55)',
              transition:'all 0.18s',
            }}
            onMouseEnter={e=>{ if(page!==item.id) e.currentTarget.style.color='rgba(255,255,255,0.85)'; }}
            onMouseLeave={e=>{ if(page!==item.id) e.currentTarget.style.color='rgba(255,255,255,0.55)'; }}
          >
            {item.label}
          </button>
        ))}
      </div>

      {/* Session user + logout */}
      {sessionStudent && (
        <div style={{ position:'relative', flexShrink:0 }}>
          <button
            onClick={() => setShowMenu(v => !v)}
            style={{
              display:'flex', alignItems:'center', gap:8,
              background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:100, padding:'5px 12px 5px 6px',
              cursor:'pointer', color:'#fff',
            }}
          >
            <div style={{
              width:28, height:28, borderRadius:'50%',
              background:sessionStudent.gradient,
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:10, fontWeight:700, color:'#fff',
            }}>{sessionStudent.initials}</div>
            <span style={{ fontSize:12, fontWeight:500, color:'rgba(255,255,255,0.8)', maxWidth:100, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {sessionStudent.name.split(' ')[0]}
            </span>
            <span style={{ fontSize:10, color:'rgba(255,255,255,0.4)' }}>▾</span>
          </button>

          {showMenu && (
            <div style={{
              position:'absolute', right:0, top:'calc(100% + 8px)',
              background:'rgba(20,16,40,0.97)', border:'1px solid rgba(255,255,255,0.12)',
              borderRadius:14, padding:8, minWidth:160,
              boxShadow:'0 8px 32px rgba(0,0,0,0.5)',
            }}>
              <div style={{ padding:'8px 12px', fontSize:12, color:'rgba(255,255,255,0.4)', borderBottom:'1px solid rgba(255,255,255,0.08)', marginBottom:4 }}>
                Signed in as<br />
                <span style={{ color:'#fff', fontWeight:600 }}>{sessionStudent.name}</span>
              </div>
              <button
                onClick={() => { setShowMenu(false); onLogout(); }}
                style={{
                  width:'100%', padding:'9px 12px', textAlign:'left',
                  background:'transparent', border:'none', color:'#fb7185',
                  fontSize:13, cursor:'pointer', borderRadius:8,
                  fontFamily:"'DM Sans',sans-serif",
                }}
                onMouseOver={e=>e.currentTarget.style.background='rgba(251,113,133,0.1)'}
                onMouseOut={e=>e.currentTarget.style.background='transparent'}
              >
                🔒 Lock & sign out
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
