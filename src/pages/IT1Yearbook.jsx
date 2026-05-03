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
      <div style={{ width:52, height:52, borderRadius:'50%', border:'3px solid rgba(201,136,58,0.2)', borderTopColor:'#c9883a', animation:'spinAnim 0.8s linear infinite' }} />
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:24, color:'rgba(240,234,216,0.8)' }}>Loading Yearbook...</div>
      <div style={{ fontSize:15, color:'rgba(255,255,255,0.4)' }}>Connecting to Firebase</div>
    </div>
  );

  if (error) return (
    <div style={{ ...getThemeVars(theme).page, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:40 }}>
      <div style={{ fontSize:52 }}>⚠️</div>
      <div style={{ fontFamily:"'Playfair Display',serif", fontSize:26, color:'#f87171' }}>Connection Error</div>
      <div style={{ fontSize:15, color:'rgba(255,255,255,0.5)', textAlign:'center', maxWidth:400 }}>{error}</div>
      <button onClick={() => window.location.reload()} style={{ padding:'13px 32px', borderRadius:100, background:'linear-gradient(135deg,#c9883a,#e8a84c)', color:'#1e160a', border:'none', cursor:'pointer', fontSize:15, fontFamily:"'DM Sans',sans-serif", fontWeight:700 }}>Retry</button>
    </div>
  );

  const filled  = students.filter(s => s.bio || s.legacy || s.photo).length;
  const claimed = students.filter(s => isClaimed(s.id)).length;

  return (
    <div style={{ ...tv.page, position:'relative', zIndex:2, minHeight:'100vh' }}>
      <div style={{ maxWidth:1160, margin:'0 auto', padding:'44px clamp(16px,4vw,24px) 0' }}>

        {/* ── Top bar ── */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:40 }}>
          <div className="fade-up">
            <div style={{ ...tv.label, fontSize:13, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:10, fontFamily:"'Caveat',cursive" }}>
              IT-1 · Batch 2022–26
            </div>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(30px,6vw,58px)', fontWeight:700, lineHeight:1.08, ...tv.heading }}>
              The Yearbook
            </h1>
            <p style={{ ...tv.muted, fontSize:15, marginTop:10, lineHeight:1.65 }}>
              {students.length} students · {claimed} claimed · {filled} filled · Class of 2026
            </p>

            {/* ── Flip hint — big amber pill ── */}
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 10,
              marginTop: 16,
              background: 'rgba(201,136,58,0.12)',
              border: '1.5px solid rgba(201,136,58,0.38)',
              borderRadius: 100,
              padding: '10px 22px',
              boxShadow: '0 4px 18px rgba(201,136,58,0.15)',
            }}>
              <span style={{ fontSize: 20 }}>↻</span>
              <span style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 18,
                color: '#e8a84c',
                fontWeight: 700,
                letterSpacing: 0.4,
              }}>
                Tap any card to flip &amp; see their legacy
              </span>
            </div>
          </div>

          <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
            <ThemeToggle theme={theme} setTheme={setTheme} themeVars={tv} />
            <button
              onClick={() => setShowAdmin(v => !v)}
              style={{
                padding:'10px 20px', borderRadius:100, fontSize:13, fontWeight:600,
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

        {/* ── Progress bar ── */}
        <div className="fade-up" style={{ marginBottom:32, animationDelay:'0.1s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:13, ...tv.muted, marginBottom:8 }}>
            <span>Profiles claimed</span>
            <span>{claimed} / {students.length}</span>
          </div>
          <div style={{ height:6, borderRadius:100, background:tv.progressBg, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:100,
              background:'linear-gradient(90deg,#c9883a,#e8a84c)',
              width:`${students.length ? (claimed / students.length) * 100 : 0}%`,
              transition:'width 0.9s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
        </div>

        {/* ── Controls ── */}
        <div className="fade-up" style={{ display:'flex', gap:10, flexWrap:'wrap', marginBottom:28, alignItems:'center', animationDelay:'0.15s' }}>
          <div style={{ flex:1, minWidth:200, position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:16, opacity:0.4 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search name or roll…"
              style={{ width:'100%', padding:'11px 14px 11px 40px', borderRadius:100, fontSize:14, background:tv.inputBg, border:`1.5px solid ${tv.inputBorder}`, color:tv.text, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' }}
            />
          </div>
          {FILTER_OPTIONS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={pillStyle(filter===f, tv)}>{f}</button>
          ))}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{ padding:'10px 16px', borderRadius:100, fontSize:13, fontWeight:500, background:tv.inputBg, border:`1.5px solid ${tv.inputBorder}`, color:tv.text, cursor:'pointer', outline:'none', fontFamily:"'DM Sans',sans-serif" }}
          >
            {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        {/* Showing count */}
        <div style={{ fontSize:14, ...tv.muted, marginBottom:20 }}>
          Showing {filtered.length} of {students.length} students
        </div>

        {/* ── Card grid ── */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:20, paddingBottom:80 }}>
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
              <div style={{ fontSize:48, marginBottom:14 }}>🔍</div>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:22, ...tv.heading }}>No students found</div>
            </div>
          )}
        </div>
      </div>

      {activeId && <StudentProfile studentId={activeId} themeVars={tv} onClose={() => setActiveId(null)} />}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} themeVars={tv} />}

      <style>{`
        .yb-flip-inner { transform-style:preserve-3d; transition:transform 0.62s cubic-bezier(.4,0,.2,1); }
        .yb-flip-inner.flipped { transform:rotateY(180deg); }
        .yb-face { backface-visibility:hidden; -webkit-backface-visibility:hidden; }
        .yb-back { transform:rotateY(180deg); }
      `}</style>
    </div>
  );
}

/* ── FLIP CARD ──────────────────────────────────────────── */
function StudentCard({ student: s, index, tv, isClaimed, isOwn, onClick }) {
  const [flipped, setFlipped] = useState(false);
  const hasContent = s.bio || s.legacy || s.photo;

  const handleClick    = () => setFlipped(f => !f);
  const handleViewProfile = (e) => { e.stopPropagation(); setFlipped(false); onClick(); };

  return (
    <div
      className="fade-up"
      onClick={handleClick}
      style={{
        perspective: 900,
        height: 290,
        cursor: 'pointer',
        animationDelay: `${Math.min(index * 0.035, 0.9)}s`,
        position: 'relative',
      }}
    >
      <div className={`yb-flip-inner${flipped ? ' flipped' : ''}`}
        style={{ position:'relative', width:'100%', height:'100%' }}>

        {/* ── FRONT ── */}
        <div className="yb-face" style={{
          position:'absolute', inset:0,
          borderRadius:18, overflow:'hidden',
          background:tv.card, border:`1px solid ${tv.cardBorder}`,
          boxShadow:'0 4px 20px rgba(0,0,0,0.18)',
        }}>
          {/* Avatar / photo */}
          <div style={{ height:148, position:'relative', overflow:'hidden', background:s.gradient, display:'flex', alignItems:'center', justifyContent:'center' }}>
            {s.photo
              ? <img src={s.photo} alt={s.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
              : <span style={{ fontSize:44, fontWeight:700, color:'rgba(255,255,255,0.9)', fontFamily:"'Playfair Display',serif" }}>{s.initials}</span>
            }

            {/* Claimed badge */}
            <div style={{ position:'absolute', top:9, left:10, fontSize:11, padding:'3px 10px', borderRadius:100, fontWeight:600, background:isClaimed ? 'rgba(16,185,129,0.88)' : 'rgba(0,0,0,0.5)', color:'#fff', backdropFilter:'blur(8px)' }}>
              {isClaimed ? (isOwn ? '✓ You' : '🔒 Claimed') : '○ Unclaimed'}
            </div>

            {/* Filled dot */}
            {hasContent && (
              <div style={{ position:'absolute', top:9, right:10, width:11, height:11, borderRadius:'50%', background:'#10b981', border:'2px solid white', boxShadow:'0 0 8px rgba(16,185,129,0.7)' }} />
            )}

            {/* Flip hint — bigger, more visible */}
            <div style={{
              position:'absolute', bottom:0, left:0, right:0,
              padding:'6px 10px',
              background:'linear-gradient(0deg,rgba(0,0,0,0.65),transparent)',
              display:'flex', alignItems:'center', justifyContent:'flex-end', gap:5,
            }}>
              <span style={{ fontFamily:"'Caveat',cursive", fontSize:14, color:'rgba(255,255,255,0.75)', letterSpacing:0.5 }}>tap to flip</span>
              <span style={{ fontSize:16, color:'rgba(255,255,255,0.75)' }}>↻</span>
            </div>
          </div>

          {/* Info */}
          <div style={{ padding:'13px 15px' }}>
            <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:600, lineHeight:1.25, ...tv.heading, marginBottom:3, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
              {s.name}
            </div>
            <div style={{ fontSize:11, ...tv.muted, fontFamily:'monospace', marginBottom:8 }}>
              {s.roll}
            </div>
            {s.superlative
              ? <div style={{ fontSize:11, fontWeight:600, background:tv.tagBg, color:tv.tagColor, border:`1px solid ${tv.tagBorder}`, padding:'3px 10px', borderRadius:100, display:'inline-block', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                  🏆 {s.superlative}
                </div>
              : <div style={{ fontSize:12, ...tv.placeholder, fontStyle:'italic' }}>
                  {hasContent ? '✦ profile filled' : 'not yet filled'}
                </div>
            }
          </div>
        </div>

        {/* ── BACK ── */}
        <div className="yb-face yb-back" style={{
          position:'absolute', inset:0,
          borderRadius:18, overflow:'hidden',
          background:'linear-gradient(155deg,#1e160a 0%,#120e08 100%)',
          border:'1px solid rgba(201,136,58,0.32)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.45)',
          display:'flex', flexDirection:'column',
          padding:'18px 16px 16px',
        }}>
          {/* Mini header */}
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:13, paddingBottom:13, borderBottom:'1px solid rgba(255,255,255,0.07)' }}>
            <div style={{ width:38, height:38, borderRadius:'50%', background:s.gradient, flexShrink:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, fontWeight:700, color:'#fff', border:'2px solid rgba(255,255,255,0.2)' }}>
              {s.initials}
            </div>
            <div style={{ minWidth:0 }}>
              <div style={{ fontFamily:"'Playfair Display',serif", fontSize:14, fontWeight:600, color:'#f0ead8', lineHeight:1.2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                {s.name}
              </div>
              <div style={{ fontSize:11, color:'rgba(201,136,58,0.65)', fontFamily:'monospace', marginTop:2 }}>
                {s.roll}
              </div>
            </div>
          </div>

          {/* Superlative */}
          {s.superlative && (
            <div style={{ marginBottom:11 }}>
              <div style={{ fontSize:11, color:'rgba(201,136,58,0.6)', letterSpacing:1.5, textTransform:'uppercase', fontFamily:"'Caveat',cursive", marginBottom:4 }}>
                Superlative
              </div>
              <div style={{ fontSize:13, color:'#e8a84c', fontWeight:600 }}>🏆 {s.superlative}</div>
            </div>
          )}

          {/* Legacy */}
          <div style={{ flex:1, overflow:'hidden', marginBottom:12 }}>
            <div style={{ fontSize:11, color:'rgba(201,136,58,0.6)', letterSpacing:1.5, textTransform:'uppercase', fontFamily:"'Caveat',cursive", marginBottom:5 }}>
              {s.legacy ? 'Legacy' : 'No legacy yet'}
            </div>
            {s.legacy ? (
              <p style={{
                fontFamily:"'Caveat',cursive", fontSize:15,
                color:'rgba(240,234,216,0.75)', lineHeight:1.6,
                fontStyle:'italic',
                display:'-webkit-box', WebkitLineClamp:4,
                WebkitBoxOrient:'vertical', overflow:'hidden',
                margin:0,
              }}>
                "{s.legacy}"
              </p>
            ) : (
              <p style={{ fontSize:13, color:'rgba(255,255,255,0.28)', fontStyle:'italic', lineHeight:1.5, margin:0 }}>
                Profile not yet filled in.
              </p>
            )}
          </div>

          {/* View full profile button */}
          <button
            onClick={handleViewProfile}
            style={{
              width:'100%', padding:'10px',
              borderRadius:12, fontSize:13, fontWeight:600,
              background:'rgba(201,136,58,0.14)',
              border:'1px solid rgba(201,136,58,0.32)',
              color:'#e8a84c', cursor:'pointer',
              fontFamily:"'DM Sans',sans-serif",
              transition:'background 0.18s',
              letterSpacing: 0.3,
            }}
            onMouseOver={e => e.currentTarget.style.background='rgba(201,136,58,0.28)'}
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
    padding:'9px 16px', borderRadius:100, fontSize:13, fontWeight:500,
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
