import React, { useState } from 'react';
import { useYearbook } from '../../context/YearbookContext';

export default function AdminPanel({ onClose, themeVars: tv }) {
  const { isAdmin, loginAdmin, logoutAdmin, students, approveStudent, resetAllData, isClaimed, wallPosts, deleteAllVaults, deleteAllWallPosts, deleteAllTestimonials } = useYearbook();
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');

  const handleLogin = () => {
    const ok = loginAdmin(pin);
    if (!ok) { setErr('Incorrect PIN'); setPin(''); }
  };

  const filled    = students.filter(s => s.bio||s.legacy||s.photo).length;
  const claimed   = students.filter(s => isClaimed(s.id)).length;
  const pending   = students.filter(s => !s.approved).length;

  return (
    <div onClick={e => e.target===e.currentTarget && onClose()} style={{ position:'fixed', inset:0, zIndex:500, background:tv.overlay, backdropFilter:'blur(12px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <div className="scale-in" style={{ width:'100%', maxWidth:540, background:tv.modalBg, border:`1px solid ${tv.modalBorder}`, borderRadius:24, padding:'32px 36px', boxShadow:'0 32px 80px rgba(0,0,0,0.5)' }}>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:28 }}>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, ...tv.heading }}>🛡 Admin Panel</div>
          <button onClick={onClose} style={{ width:32,height:32,borderRadius:'50%',background:tv.btnBg,border:`1px solid ${tv.btnBorder}`,color:tv.btnColor,cursor:'pointer',fontSize:13,display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
        </div>

        {!isAdmin ? (
          <div>
            <div style={{ fontSize:14, ...tv.muted, marginBottom:20, lineHeight:1.65 }}>Enter the admin PIN to access moderation controls.</div>
            <input type="password" value={pin} onChange={e=>setPin(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleLogin()} placeholder="Admin PIN" autoFocus style={{ width:'100%', padding:'13px 18px', borderRadius:14, background:tv.inputBg, border:`1.5px solid ${err?'#ef4444':tv.inputBorder}`, color:tv.inputText||tv.text, fontSize:15, fontFamily:"'DM Sans',sans-serif", outline:'none', marginBottom:12, boxSizing:'border-box' }} />
            {err && <div style={{ fontSize:12, color:'#ef4444', marginBottom:12 }}>{err}</div>}
            <button onClick={handleLogin} style={{ width:'100%', padding:'13px', borderRadius:100, fontSize:15, fontWeight:600, background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'#fff', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>Unlock →</button>
            <div style={{ fontSize:11, ...tv.muted, marginTop:14, textAlign:'center' }}></div>
          </div>
        ) : (
          <div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:28 }}>
              {[
                { label:'Total Students',   val:students.length,    color:'#7c3aed' },
                { label:'Claimed Profiles', val:claimed,             color:'#10b981' },
                { label:'Profiles Filled',  val:filled,              color:'#f59e0b' },
                { label:'Wall Posts',        val:wallPosts.length,   color:'#3b82f6' },
              ].map(s => (
                <div key={s.label} style={{ background:tv.sectionBg, border:`1px solid ${tv.sectionBorder}`, borderRadius:16, padding:'16px 18px' }}>
                  <div style={{ fontSize:26, fontWeight:700, color:s.color, fontFamily:"'Fraunces',serif" }}>{s.val}</div>
                  <div style={{ fontSize:12, ...tv.muted, marginTop:4 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {pending > 0 && (
              <div style={{ background:'rgba(245,158,11,0.08)', border:'1px solid rgba(245,158,11,0.25)', borderRadius:14, padding:'14px 18px', marginBottom:20 }}>
                <div style={{ fontSize:13, color:'#f59e0b', fontWeight:600, marginBottom:8 }}>⚠️ {pending} profiles pending approval</div>
                <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                  {students.filter(s=>!s.approved).map(s => (
                    <div key={s.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:10 }}>
                      <span style={{ fontSize:13, ...tv.heading, opacity:0.8 }}>{s.name}</span>
                      <button onClick={()=>approveStudent(s.id,true)} style={{ padding:'5px 14px', borderRadius:100, fontSize:11, fontWeight:600, background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.35)', color:'#10b981', cursor:'pointer' }}>Approve</button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div style={{ background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.2)', borderRadius:14, padding:'14px 18px', marginBottom:20 }}>
              <div style={{ fontSize:12, color:'#ef4444', fontWeight:700, marginBottom:12, textTransform:'uppercase', letterSpacing:1 }}>⚠️ Danger Zone</div>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                <button onClick={resetAllData} style={{ padding:'9px 18px', borderRadius:100, fontSize:12, fontWeight:600, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", textAlign:'left' }}>
                  🗑 Reset All Profiles & Claims
                </button>
                <button onClick={deleteAllVaults} style={{ padding:'9px 18px', borderRadius:100, fontSize:12, fontWeight:600, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", textAlign:'left' }}>
                  🗑 Delete All Vaults & Media
                </button>
                <button onClick={deleteAllWallPosts} style={{ padding:'9px 18px', borderRadius:100, fontSize:12, fontWeight:600, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", textAlign:'left' }}>
                  🗑 Delete All Wall Posts
                </button>
                <button onClick={deleteAllTestimonials} style={{ padding:'9px 18px', borderRadius:100, fontSize:12, fontWeight:600, background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', color:'#ef4444', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", textAlign:'left' }}>
                  🗑 Delete All Testimonials
                </button>
              </div>
            </div>

            <button onClick={logoutAdmin} style={{ width:'100%', padding:'11px', borderRadius:100, fontSize:13, fontWeight:500, background:tv.btnBg, border:`1px solid ${tv.btnBorder}`, color:tv.btnColor, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" }}>
              Log Out of Admin
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
