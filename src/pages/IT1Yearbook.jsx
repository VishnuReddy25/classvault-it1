import React, { useState, useMemo } from 'react';
import { useYearbook } from '../context/YearbookContext';
import StudentProfile from '../components/yearbook/StudentProfile';
import AdminPanel from '../components/yearbook/AdminPanel';
import ThemeToggle from '../components/yearbook/ThemeToggle';

const FILTER_OPTIONS = ['All', 'Filled', 'Empty'];
const SORT_OPTIONS   = [
  { id: 'roll',   label: 'Roll No.' },
  { id: 'name',   label: 'Name (A–Z)' },
  { id: 'legacy', label: 'Has Legacy' },
];

export default function IT1Yearbook() {
  const { students, isClaimed, sessionId, isAdmin, theme, setTheme, loading, error } = useYearbook();

  const [activeId, setActiveId]   = useState(null);
  const [search, setSearch]       = useState('');
  const [sortBy, setSortBy]       = useState('roll');
  const [filter, setFilter]       = useState('All');
  const [showAdmin, setShowAdmin] = useState(false);

  const tv = getThemeVars(theme);

  const filtered = useMemo(() => {
    if (!students) return [];
    let list = students.filter(s => s.approved !== false || isAdmin);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.roll.toLowerCase().includes(q) ||
        s.superlative?.toLowerCase().includes(q)
      );
    }
    if (filter === 'Filled') list = list.filter(s => s.bio || s.legacy || s.photo);
    if (filter === 'Empty')  list = list.filter(s => !s.bio && !s.legacy && !s.photo);
    if (sortBy === 'name')   list = [...list].sort((a, b) => a.name.localeCompare(b.name));
    if (sortBy === 'legacy') list = [...list].sort((a, b) => (b.legacy ? 1 : 0) - (a.legacy ? 1 : 0));
    return list;
  }, [students, search, sortBy, filter, isAdmin]);

  if (loading) return (
    <div style={{ ...getThemeVars(theme).page, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
      <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid rgba(201,136,58,0.2)', borderTopColor:'#c9883a', animation:'spinAnim 0.8s linear infinite' }} />
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, color:'rgba(240,234,216,0.7)' }}>Loading Yearbook...</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)' }}>Connecting to Firebase</div>
    </div>
  );

  if (error) return (
    <div style={{ ...getThemeVars(theme).page, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:40 }}>
      <div style={{ fontSize:48 }}>⚠️</div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:'#f87171' }}>Connection Error</div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', textAlign:'center', maxWidth:400 }}>{error}</div>
      <button onClick={() => window.location.reload()} style={{ padding:'11px 28px', borderRadius:100, background:'linear-gradient(135deg,#c9883a,#e8a84c)', color:'#1e160a', border:'none', cursor:'pointer', fontSize:14, fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>Retry</button>
    </div>
  );

  const filled  = students.filter(s => s.bio || s.legacy || s.photo).length;
  const claimed = students.filter(s => isClaimed(s.id)).length;

  return (
    <div style={{ ...tv.page, position:'relative', zIndex:2, minHeight:'100vh' }}>
      <div style={{ maxWidth:1160, margin:'0 auto', padding:'44px clamp(16px,4vw,24px) 0' }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:40 }}>
          <div className="fade-up">
            <div style={{ ...tv.label, fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:10, fontFamily:"'Caveat',cursive" }}>
              IT-1 · Batch 2022–26
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(30px,6vw,58px)', fontWeight:700, lineHeight:1.08, ...tv.heading }}>
              The Yearbook
            </h1>
            <p style={{ ...tv.muted, fontSize:14, marginTop:10, lineHeight:1.65 }}>
              {students.length} students · {claimed} claimed · {filled} filled · Class of 2026
            </p>
            <p style={{ fontSize:11, color:'rgba(201,136,58,0.55)', marginTop:6, fontFamily:"'Caveat',cursive", letterSpacing:0.5 }}>
              Tap any card to flip it and see their legacy ✦
            </p>
          </div>

          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <ThemeToggle theme={theme} setTheme={setTheme} themeVars={tv} />
            <button
              onClick={() => setShowAdmin(v => !v)}
              style={{
                padding:'9px 18px', borderRadius:100, fontSize:12, fontWeight:600,
                background: isAdmin ? 'rgba(16,185,129,0.15)' : tv.btnBg,
                border: `1px solid ${isAdmin ? 'rgba(16,185,129,0.4)' : tv.btnBorder}`,
                color: isAdmin ? '#10b981' : tv.btnColor,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
              }}
            >
              {isAdmin ? '🛡 Admin' : '🔑 Admin'}
            </button>
          </div>
        </div>

        {/* Progress bar */}
        <div className="fade-up" style={{ marginBottom:32, animationDelay:'0.1s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, ...tv.muted, marginBottom:8 }}>
            <span>Profiles claimed</span>
            <span>{claimed} / {students.length}</span>
          </div>
          <div style={{ height:5, borderRadius:100, background:tv.progressBg, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:100,
              background:'linear-gradient(90deg,#c9883a,#e8a84c)',
              width:`${students.length ? (claimed / students.length) * 100 : 0}%`,
              transition:'width 0.9s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
        </div>

        {/* Controls */}
        <div className="fade-up" style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:28, alignItems:'center', animationDelay:'0.15s' }}>
          <div style={{ flex:1, minWidth:180, position:'relative' }}>
            <span style={{ position:'absolute', left:13, top:'50%', transform:'translateY(-50%)', fontSize:14, opacity:0.4 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or roll…"
              style={{ width:'100%', padding:'10px 13px 10px 38px', borderRadius:100, fontSize:13, background:tv.inputBg, border:`1.5px solid ${tv.inputBorder}`, color:tv.text, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' }}
            />
          </div>
          {FILTER_OPTIONS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={pillStyle(filter===f, tv)}>{f}</button>
          ))}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding:'9px 14px', borderRadius:100, fontSize:12, fontWeight:500, background:tv.inputBg, border:`1.5px solid ${tv.inputBorder}`, color:tv.text, cursor:'pointer', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
          >
            {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        <div style={{ fontSize:12, ...tv.muted, marginBottom:20 }}>
          Showing {filtered.length} of {students.length} students
        </div>

        {/* Grid — fixed height for flip cards */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(190px,1fr))', gap:18, paddingBottom:80 }}>
          {filtered.map((s, i) => (
            <StudentCard
              key={s.id} student={s} index={i} tv={tv}
              isClaimed={isClaimed(s.id)}
              isOwn={s.id === sessionId}
              onClick={() => setActiveId(s.id)}
            />
          ))}
          {filtered.length === 0 && (
            <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'80px 0', ...tv.muted }}>
              <div style={{ fontSize:44, marginBottom:12 }}>🔍</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:20, ...tv.heading }}>No students found</div>
            </div>
          )}
        </div>
      </div>

      {activeId && <StudentProfile studentId={activeId} themeVars={tv} onClose={() => setActiveId(null)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} themeVars={tv} />}

      {/* 3D flip styles */}
      <style>{`
        .yb-flip-inner { transform-style: preserve-3d; transition: transform 0.62s cubic-bezier(.4,0,.2,1); }
        .yb-flip-inner.flipped { transform: rotateY(180deg); }
        .yb-face { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .yb-back { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}

/* ── FLIP CARD ──────────────────────────────────────────── */
function StudentCard({ student: s, index, tv, isClaimed, isOwn, onClick }) {
  const [flipped, setFlipped] = useState(false);
  const hasContent = s.bio || s.legacy || s.photo;

  const handleClick = () => setFlipped(f => !f);
  const handleViewProfile = (e) => { e.stopPropagation(); setFlipped(false); onClick(); };

  return (
    <div
      className="fade-up"
      onClick={handleClick}
      style={{
        perspective: 900,
        height: 265,
        cursor: 'pointer',
        animationDelay: `${Math.min(index * 0.035, 0.9)}s`,
        position: 'relative',
      }}
    >
      <div className={`yb-flip-inner${flipped ? ' flipped' : ''}`} style={{ position:'relative', width:'100%', height:'100%' }}>

        {/* ── FRONT ── */}
        <div className="yb-face" style={{
          position:'absolute', inset:0,
          borderRadius:18, overflow:'hidden',
          background:tv.card, border:`1px solid ${tv.cardBorder}`,
          boxShadow:'0 4px 20px rgba(0,0,0,0.18)',
        }}>
          {/* Photo / avatar */}
          <div style={{ height:138, position:'relative', overflow:'hidden', background:s.gradient, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {s.photo
              ? <img src={s.photo} alt={s.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span style={{ fontSize:40, fontWeight:700, color:'rgba(255,255,255,0.9)', fontFamily:"'Playfair Display',serif" }}>{s.initials}</span>
            }
            <div style={{ position:'absolute', top:8, left:10, fontSize:9, padding:'2px 8px', borderRadius:100, fontWeight:600, background:isClaimed ? 'rgba(16,185,129,0.85)' : 'rgba(0,0,0,0.45)', color:'#fff', backdropFilter:'blur(8px)' }}>
              {isClaimed ? (isOwn ? '✓ You' : '🔒 Claimed') : '○ Unclaimed'}
            </div>
            {hasContent && <div style={{ position:'absolute', top:8, right:10, width:9, height:9, borderRadius:'50%', background:'#10b981', border:'2px solid white', boxShadow:'0 0 7px rgba(16,185,129,0.6)' }} />}
            {/* flip hint */}
            <div style={{ position:'absolute', bottom:7, right:9, fontSize:9, color:'rgba(255,255,255,0.4)', fontFamily:"'Caveat',cursive", letterSpacing:0.5 }}>tap ↻</div>
          </div>
          {/* info */}
          <div style={{ padding:'11px 14px' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:13, fontWeight:600, lineHeight:1.25, ...tv.heading, marginBottom:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
            <div style={{ fontSize:9, ...tv.muted, fontFamily:'monospace', marginBottom:7 }}>{s.roll}</div>
            {s.superlative
              ? <div style={{ fontSize:9, fontWeight:600, background:tv.tagBg, color:tv.tagColor, border:`1px solid ${tv.tagBorder}`, padding:'2px 8px', borderRadius:100, display:'inline-block', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>🏆 {s.superlative}</div>
              : <div style={{ fontSize:10, ...tv.placeholder, fontStyle:'italic' }}>{hasContent ? '✦ profile filled' : 'not yet filled'}</div>
            }
          </div>
        </div>

        {/* ── BACK ── */}
        <div className="yb-face yb-back" style={{
          position:'absolute', inset:0,
          borderRadius:18, overflow:'hidden',
          background:'linear-gradient(155deg,#1e160a 0%,#120e08 100%)',
          border:'1px solid rgba(201,136,58,0.28)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.45)',
          display:'flex', flexDirection:'column',
          padding:'16px 15px 14px',
        }}>
          {/* mini header */}
          <div style={{ display:'flex', alignItems:'center', gap:9, marginBottom:11, paddingBottom:11, borderBottom:'1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ width:34, height:34, borderRadius:'50%', background:s.gradient, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, color:'#fff', border:'2px solid rgba(255,255,255,0.18)' }}>{s.initials}</div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:12, fontWeight:600, color:'#f0ead8', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{s.name}</div>
              <div style={{ fontSize:9, color:'rgba(201,136,58,0.55)', fontFamily:'monospace' }}>{s.roll}</div>
            </div>
          </div>

          {/* superlative */}
          {s.superlative && (
            <div style={{ marginBottom:9 }}>
              <div style={{ fontSize:8, color:'rgba(201,136,58,0.5)', letterSpacing:1.5, textTransform:'uppercase', fontFamily:"'Caveat',cursive", marginBottom:3 }}>Superlative</div>
              <div style={{ fontSize:11, color:'#e8a84c', fontWeight:500 }}>🏆 {s.superlative}</div>
            </div>
          )}

          {/* legacy */}
          <div style={{ flex:1, overflow:'hidden', marginBottom:10 }}>
            <div style={{ fontSize:8, color:'rgba(201,136,58,0.5)', letterSpacing:1.5, textTransform:'uppercase', fontFamily:"'Caveat',cursive", marginBottom:4 }}>
              {s.legacy ? 'Legacy' : 'Message'}
            </div>
            {s.legacy ? (
              <p style={{ fontFamily:"'Caveat',cursive", fontSize:13, color:'rgba(240,234,216,0.62)', lineHeight:1.55, fontStyle:'italic', display:'-webkit-box', WebkitLineClamp:4, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                "{s.legacy}"
              </p>
            ) : (
              <p style={{ fontSize:11, color:'rgba(255,255,255,0.22)', fontStyle:'italic', lineHeight:1.5 }}>
                Profile not yet filled in.
              </p>
            )}
          </div>

          {/* view full profile */}
          <button
            onClick={handleViewProfile}
            style={{ width:'100%', padding:'8px', borderRadius:10, fontSize:11, fontWeight:600, background:'rgba(201,136,58,0.14)', border:'1px solid rgba(201,136,58,0.28)', color:'#e8a84c', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'background 0.18s' }}
            onMouseOver={e => e.currentTarget.style.background='rgba(201,136,58,0.26)'}
            onMouseOut={e => e.currentTarget.style.background='rgba(201,136,58,0.14)'}
          >
            View Full Profile →
          </button>
        </div>
      </div>
    </div>
  );
}

function pillStyle(active, tv) {
  return {
    padding:'8px 14px', borderRadius:100, fontSize:12, fontWeight:500,
    border:`1.5px solid ${active ? '#c9883a' : tv.inputBorder}`,
    background: active ? 'rgba(201,136,58,0.14)' : tv.inputBg,
    color: active ? '#e8a84c' : tv.text,
    cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.18s',
  };
}

export function getThemeVars(theme) {
  if (theme === 'light') return {
    page:{ background:'#f8f7ff' }, heading:{ color:'#1a1040' }, text:'#1a1040',
    muted:{ color:'#6b7280' }, placeholder:{ color:'#9ca3af' }, label:{ color:'#7c3aed' },
    card:'rgba(255,255,255,0.95)', cardBorder:'rgba(124,58,237,0.15)',
    cardHoverShadow:'0 16px 48px rgba(124,58,237,0.18)',
    inputBg:'rgba(255,255,255,0.9)', inputBorder:'rgba(124,58,237,0.2)',
    progressBg:'rgba(124,58,237,0.1)', tagBg:'rgba(124,58,237,0.08)', tagColor:'#4338ca',
    tagBorder:'rgba(124,58,237,0.25)', modalBg:'#ffffff', modalBorder:'rgba(124,58,237,0.15)',
    sectionBg:'rgba(124,58,237,0.04)', sectionBorder:'rgba(124,58,237,0.12)',
    btnBg:'rgba(124,58,237,0.08)', btnBorder:'rgba(124,58,237,0.25)', btnColor:'#4338ca',
    divider:'rgba(0,0,0,0.08)', inputText:'#1a1040', overlay:'rgba(0,0,0,0.4)',
  };
  if (theme === 'retro') return {
    page:{ background:'#1a0e05', fontFamily:"'Courier New',monospace" }, heading:{ color:'#f5c842' },
    text:'#f5c842', muted:{ color:'#a0845c' }, placeholder:{ color:'#6b4c2a' }, label:{ color:'#f5c842' },
    card:'rgba(255,200,80,0.06)', cardBorder:'rgba(245,200,66,0.25)',
    cardHoverShadow:'0 0 32px rgba(245,200,66,0.25)',
    inputBg:'rgba(245,200,66,0.06)', inputBorder:'rgba(245,200,66,0.3)',
    progressBg:'rgba(245,200,66,0.12)', tagBg:'rgba(245,200,66,0.1)', tagColor:'#f5c842',
    tagBorder:'rgba(245,200,66,0.35)', modalBg:'#1a0e05', modalBorder:'rgba(245,200,66,0.3)',
    sectionBg:'rgba(245,200,66,0.05)', sectionBorder:'rgba(245,200,66,0.2)',
    btnBg:'rgba(245,200,66,0.08)', btnBorder:'rgba(245,200,66,0.3)', btnColor:'#f5c842',
    divider:'rgba(245,200,66,0.15)', inputText:'#f5c842', overlay:'rgba(0,0,0,0.75)',
  };
  return {
    page:{ background:'#0e0b07' }, heading:{ color:'#f0ead8' }, text:'#f0ead8',
    muted:{ color:'rgba(240,234,216,0.42)' }, placeholder:{ color:'rgba(240,234,216,0.22)' }, label:{ color:'#e8a84c' },
    card:'rgba(255,255,255,0.05)', cardBorder:'rgba(201,136,58,0.12)',
    cardHoverShadow:'0 16px 48px rgba(201,136,58,0.18)',
    inputBg:'rgba(255,255,255,0.04)', inputBorder:'rgba(201,136,58,0.18)',
    progressBg:'rgba(201,136,58,0.12)', tagBg:'rgba(201,136,58,0.1)', tagColor:'#e8a84c',
    tagBorder:'rgba(201,136,58,0.28)', modalBg:'#1a1208', modalBorder:'rgba(201,136,58,0.2)',
    sectionBg:'rgba(201,136,58,0.05)', sectionBorder:'rgba(201,136,58,0.14)',
    btnBg:'rgba(201,136,58,0.1)', btnBorder:'rgba(201,136,58,0.28)', btnColor:'#e8a84c',
    divider:'rgba(255,255,255,0.06)', inputText:'#f0ead8', overlay:'rgba(0,0,0,0.75)',
  };
}
