import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useYearbook } from '../context/YearbookContext';
import { simpleHash, generateInviteLink, getInitials } from '../utils/helpers';
import { THEMES, THEME_EMOJIS } from '../data/sampleData';

export default function CreateVaultModal({ onClose }) {
  const { createVault }    = useApp();
  const { sessionStudent } = useYearbook();

  const [name, setName]       = useState('');
  const [pass, setPass]       = useState('');
  const [privacy, setPrivacy] = useState('password');
  const [theme, setTheme]     = useState('Trip');
  const [inviteLink]          = useState(generateInviteLink());

  const ownerName = sessionStudent?.name || 'Member';

  const submit = () => {
    if (!name.trim()) return;
    createVault({
      name: name.trim(),
      emoji: THEME_EMOJIS[theme] || '📁',
      theme, privacy,
      members: [getInitials(ownerName)],
      memberNames: [ownerName],
      passwordHash: pass ? simpleHash(pass) : null,
      inviteLink,
      createdAt: new Date().toISOString().slice(0, 10),
      locked: false,
    });
    onClose();
  };

  return (
    <div
      onClick={e => e.target===e.currentTarget && onClose()}
      style={{ position:'fixed', inset:0, zIndex:200, background:'rgba(13,11,24,0.55)', backdropFilter:'blur(8px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}
    >
      <div className="scale-in" style={{ background:'#fff', borderRadius:28, padding:'32px 36px', width:'100%', maxWidth:480, boxShadow:'0 24px 80px rgba(108,71,255,0.18)' }}>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:'#0d0b18', marginBottom:26 }}>Create a new vault ✦</div>

        <label style={labelStyle}>Vault name</label>
        <input className="cv-input" placeholder='"Goa Trip 2026" or "Farewell Night"' value={name} onChange={e=>setName(e.target.value)} style={inputStyle} autoFocus />

        <label style={labelStyle}>Privacy</label>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:8, marginBottom:18 }}>
          {[
            { value:'public',   icon:'🌐', label:'Public'     },
            { value:'password', icon:'🔑', label:'Password'   },
            { value:'invite',   icon:'🔗', label:'Invite only' },
          ].map(opt => (
            <div key={opt.value} onClick={()=>setPrivacy(opt.value)} style={{ padding:'12px 8px', borderRadius:14, textAlign:'center', cursor:'pointer', border:`1.5px solid ${privacy===opt.value?'#6c47ff':'rgba(108,71,255,0.15)'}`, background:privacy===opt.value?'rgba(108,71,255,0.07)':'transparent', transition:'all 0.18s' }}>
              <div style={{ fontSize:18, marginBottom:4 }}>{opt.icon}</div>
              <div style={{ fontSize:11, fontWeight:500, color:privacy===opt.value?'#6c47ff':'#2d2a45' }}>{opt.label}</div>
            </div>
          ))}
        </div>

        {privacy==='password' && (
          <div style={{ marginBottom:18 }}>
            <label style={labelStyle}>Vault password</label>
            <input className="cv-input" type="password" placeholder="Choose a strong password" value={pass} onChange={e=>setPass(e.target.value)} style={inputStyle} />
            <div style={{ display:'flex', alignItems:'center', gap:6, fontSize:12, color:'#0f6e56', background:'rgba(20,184,166,0.06)', border:'1px solid rgba(20,184,166,0.18)', borderRadius:10, padding:'8px 12px' }}>
              🔒 Stored as a hash — never in plain text
            </div>
          </div>
        )}

        {privacy==='invite' && (
          <div style={{ marginBottom:18 }}>
            <label style={labelStyle}>Invite link</label>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'rgba(108,71,255,0.05)', border:'1.5px solid rgba(108,71,255,0.18)', borderRadius:14, padding:'11px 14px' }}>
              <span style={{ flex:1, fontSize:12, color:'#6c47ff', fontFamily:'monospace', wordBreak:'break-all' }}>{inviteLink}</span>
              <button onClick={()=>navigator.clipboard?.writeText('https://'+inviteLink)} style={{ background:'#6c47ff', color:'#fff', border:'none', padding:'7px 16px', borderRadius:100, fontSize:12, fontWeight:500, cursor:'pointer', whiteSpace:'nowrap' }}>Copy</button>
            </div>
          </div>
        )}

        <label style={labelStyle}>Theme</label>
        <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:24 }}>
          {THEMES.map(t => (
            <div key={t} onClick={()=>setTheme(t)} style={{ padding:'8px 16px', borderRadius:100, cursor:'pointer', border:`1.5px solid ${theme===t?'#6c47ff':'rgba(108,71,255,0.15)'}`, background:theme===t?'rgba(108,71,255,0.09)':'transparent', color:theme===t?'#6c47ff':'#2d2a45', fontSize:13, fontWeight:theme===t?500:400, transition:'all 0.18s' }}>
              {THEME_EMOJIS[t]} {t}
            </div>
          ))}
        </div>

        <div style={{ display:'flex', gap:10, justifyContent:'flex-end' }}>
          <button onClick={onClose} className="btn-ghost" style={btnStyle}>Cancel</button>
          <button onClick={submit}  className="btn-primary" style={btnStyle}>Create Vault →</button>
        </div>
      </div>
    </div>
  );
}

const labelStyle = { fontSize:12, fontWeight:500, color:'#2d2a45', letterSpacing:0.3, marginBottom:8, display:'block', textTransform:'uppercase' };
const inputStyle  = { width:'100%', padding:'13px 16px', borderRadius:14, fontSize:14, color:'#0d0b18', fontFamily:"'DM Sans',sans-serif", marginBottom:18, display:'block' };
const btnStyle    = { padding:'11px 24px', borderRadius:100, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", border:'none' };
