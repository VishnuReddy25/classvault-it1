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
      <div style={{ width:48, height:48, borderRadius:'50%', border:'3px solid rgba(124,58,237,0.2)', borderTopColor:'#7c3aed', animation:'spinAnim 0.8s linear infinite' }} />
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:'rgba(255,255,255,0.7)' }}>Loading IT-1 Yearbook...</div>
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)' }}>Connecting to Firebase</div>
    </div>
  );

  if (error) return (
    <div style={{ ...getThemeVars(theme).page, minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:16, padding:40 }}>
      <div style={{ fontSize:48 }}>⚠️</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, color:'#f87171' }}>Connection Error</div>
      <div style={{ fontSize:14, color:'rgba(255,255,255,0.5)', textAlign:'center', maxWidth:400 }}>{error}</div>
      <button onClick={() => window.location.reload()} style={{ padding:'11px 28px', borderRadius:100, background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'#fff', border:'none', cursor:'pointer', fontSize:14, fontFamily:"'DM Sans',sans-serif" }}>Retry</button>
    </div>
  );

  const filled  = students.filter(s => s.bio || s.legacy || s.photo).length;
  const claimed = students.filter(s => isClaimed(s.id)).length;

  return (
    <div style={{ ...tv.page, position: 'relative', zIndex: 2, minHeight: '100vh' }}>
      <div style={{ maxWidth: 1160, margin: '0 auto', padding: '44px 24px 0' }}>

        {/* Top bar */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16, marginBottom:40 }}>
          <div className="fade-up">
            <div style={{ ...tv.label, fontSize:11, fontWeight:700, letterSpacing:3, textTransform:'uppercase', marginBottom:10 }}>
              IT-1 · Batch 2022–26
            </div>
            <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(34px,6vw,62px)', fontWeight:700, lineHeight:1.08, ...tv.heading }}>
              The Yearbook
            </h1>
            <p style={{ ...tv.muted, fontSize:15, marginTop:10, lineHeight:1.65 }}>
              {students.length} students · {claimed} claimed · {filled} profiles filled · Class of 2026
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
        <div className="fade-up" style={{ marginBottom:36, animationDelay:'0.1s' }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, ...tv.muted, marginBottom:8 }}>
            <span>Profiles claimed</span>
            <span>{claimed} / {students.length}</span>
          </div>
          <div style={{ height:6, borderRadius:100, background:tv.progressBg, overflow:'hidden' }}>
            <div style={{
              height:'100%', borderRadius:100,
              background:'linear-gradient(90deg,#7c3aed,#4338ca)',
              width:`${(claimed / students.length) * 100}%`,
              transition:'width 0.8s cubic-bezier(.4,0,.2,1)',
            }} />
          </div>
        </div>

        {/* Controls */}
        <div className="fade-up" style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:32, alignItems:'center', animationDelay:'0.15s' }}>
          <div style={{ flex:1, minWidth:200, position:'relative' }}>
            <span style={{ position:'absolute', left:14, top:'50%', transform:'translateY(-50%)', fontSize:15, opacity:0.45 }}>🔍</span>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search by name or roll…"
              style={{
                width:'100%', padding:'11px 14px 11px 40px', borderRadius:100, fontSize:13,
                background:tv.inputBg, border:`1.5px solid ${tv.inputBorder}`,
                color:tv.text, fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box',
              }}
            />
          </div>
          {FILTER_OPTIONS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={pillStyle(filter===f, tv)}>{f}</button>
          ))}
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value)}
            style={{
              padding:'10px 16px', borderRadius:100, fontSize:12, fontWeight:500,
              background:tv.inputBg, border:`1.5px solid ${tv.inputBorder}`,
              color:tv.text, cursor:'pointer', outline:'none', fontFamily:"'DM Sans',sans-serif",
            }}
          >
            {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>
        </div>

        <div style={{ fontSize:12, ...tv.muted, marginBottom:24 }}>
          Showing {filtered.length} of {students.length} students
        </div>

        {/* Grid */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(200px,1fr))', gap:18, paddingBottom:80 }}>
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
              <div style={{ fontSize:48, marginBottom:12 }}>🔍</div>
              <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, ...tv.heading }}>No students found</div>
            </div>
          )}
        </div>
      </div>

      {activeId && (
        <StudentProfile
          studentId={activeId}
          themeVars={tv}
          onClose={() => setActiveId(null)}
        />
      )}
      {showAdmin && <AdminPanel onClose={() => setShowAdmin(false)} themeVars={tv} />}
    </div>
  );
}

function StudentCard({ student: s, index, tv, isClaimed, isOwn, onClick }) {
  const hasContent = s.bio || s.legacy || s.photo;
  return (
    <div
      className="fade-up"
      onClick={onClick}
      style={{
        borderRadius:20, overflow:'hidden',
        background:tv.card, border:`1px solid ${tv.cardBorder}`,
        cursor:'pointer', animationDelay:`${Math.min(index*0.04,1)}s`,
        transition:'transform 0.3s, box-shadow 0.3s',
        position:'relative',
      }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-6px) scale(1.02)'; e.currentTarget.style.boxShadow=tv.cardHoverShadow; }}
      onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow=''; }}
    >
      {/* Avatar */}
      <div style={{ height:130, position:'relative', overflow:'hidden', background:s.gradient, display:'flex', alignItems:'center', justifyContent:'center' }}>
        {s.photo
          ? <img src={s.photo} alt={s.name} style={{ width:'100%', height:'100%', objectFit:'cover' }} />
          : <span style={{ fontSize:38, fontWeight:700, color:'rgba(255,255,255,0.9)', fontFamily:"'Fraunces',serif" }}>{s.initials}</span>
        }
        {/* Claimed indicator */}
        <div style={{
          position:'absolute', top:8, left:10,
          fontSize:10, padding:'2px 8px', borderRadius:100, fontWeight:600,
          background: isClaimed ? 'rgba(16,185,129,0.85)' : 'rgba(0,0,0,0.45)',
          color: '#fff', backdropFilter:'blur(8px)',
        }}>
          {isClaimed ? (isOwn ? '✓ You' : '🔒 Claimed') : '○ Unclaimed'}
        </div>
        {hasContent && (
          <div style={{
            position:'absolute', top:8, right:10,
            width:10, height:10, borderRadius:'50%',
            background:'#10b981', border:'2px solid white',
            boxShadow:'0 0 8px rgba(16,185,129,0.6)',
          }} />
        )}
      </div>

      {/* Info */}
      <div style={{ padding:'14px 16px' }}>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:14, fontWeight:600, lineHeight:1.3, ...tv.heading, marginBottom:3 }}>
          {s.name}
        </div>
        <div style={{ fontSize:10, ...tv.muted, fontFamily:'monospace', marginBottom:8 }}>{s.roll}</div>
        {s.superlative
          ? <div style={{ fontSize:10, fontWeight:600, background:tv.tagBg, color:tv.tagColor, border:`1px solid ${tv.tagBorder}`, padding:'3px 9px', borderRadius:100, display:'inline-block', maxWidth:'100%', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>🏆 {s.superlative}</div>
          : <div style={{ fontSize:11, ...tv.placeholder, fontStyle:'italic' }}>{hasContent ? '✦ Profile filled' : 'Profile not yet filled'}</div>
        }
      </div>
    </div>
  );
}

function pillStyle(active, tv) {
  return {
    padding:'9px 16px', borderRadius:100, fontSize:12, fontWeight:500,
    border:`1.5px solid ${active ? '#7c3aed' : tv.inputBorder}`,
    background: active ? 'rgba(124,58,237,0.12)' : tv.inputBg,
    color: active ? '#7c3aed' : tv.text,
    cursor:'pointer', fontFamily:"'DM Sans',sans-serif", transition:'all 0.18s',
  };
}

export function getThemeVars(theme) {
  if (theme === 'light') return {
    page: { background:'#f8f7ff' }, heading:{ color:'#1a1040' }, text:'#1a1040',
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
    page:{ background:'#070510' }, heading:{ color:'#f0eeff' }, text:'#f0eeff',
    muted:{ color:'rgba(240,238,255,0.45)' }, placeholder:{ color:'rgba(240,238,255,0.25)' }, label:{ color:'#a78bfa' },
    card:'rgba(255,255,255,0.04)', cardBorder:'rgba(255,255,255,0.09)',
    cardHoverShadow:'0 16px 48px rgba(124,58,237,0.25)',
    inputBg:'rgba(255,255,255,0.05)', inputBorder:'rgba(255,255,255,0.12)',
    progressBg:'rgba(124,58,237,0.15)', tagBg:'rgba(124,58,237,0.12)', tagColor:'#a78bfa',
    tagBorder:'rgba(124,58,237,0.3)', modalBg:'#0f0c22', modalBorder:'rgba(124,58,237,0.2)',
    sectionBg:'rgba(124,58,237,0.06)', sectionBorder:'rgba(124,58,237,0.15)',
    btnBg:'rgba(124,58,237,0.1)', btnBorder:'rgba(124,58,237,0.3)', btnColor:'#a78bfa',
    divider:'rgba(255,255,255,0.07)', inputText:'#f0eeff', overlay:'rgba(0,0,0,0.75)',
  };
}
