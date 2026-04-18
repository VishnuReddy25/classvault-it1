import React, { useState, useMemo } from 'react';

const BRANCHES = ['All', 'CSE', 'ECE', 'ME', 'CE', 'EEE'];

const SAMPLE_STUDENTS = [
  { id:1,  name:'Aryan Kumar',    branch:'CSE', initials:'AK', quote:'"Code is poetry, bugs are plot twists."',       gradient:'linear-gradient(135deg,#6c47ff,#3b82f6)' },
  { id:2,  name:'Priya Sharma',   branch:'CSE', initials:'PS', quote:'"She debugged her fears and shipped her dreams."', gradient:'linear-gradient(135deg,#f43f5e,#f97316)' },
  { id:3,  name:'Riya Kapoor',    branch:'ECE', initials:'RK', quote:'"Signal in the noise, always."',                 gradient:'linear-gradient(135deg,#14b8a6,#3b82f6)' },
  { id:4,  name:'Kabir Singh',    branch:'ME',  initials:'KS', quote:'"Built things. Broke things. Learned everything."', gradient:'linear-gradient(135deg,#f59e0b,#ef4444)' },
  { id:5,  name:'Tanvi Shah',     branch:'CE',  initials:'TS', quote:'"Laid foundations, literal and metaphorical."',   gradient:'linear-gradient(135deg,#8b5cf6,#ec4899)' },
  { id:6,  name:'Mihir Patel',    branch:'EEE', initials:'MP', quote:'"Ohm\'s law and office law — both are real."',    gradient:'linear-gradient(135deg,#10b981,#3b82f6)' },
  { id:7,  name:'Sneha Reddy',    branch:'CSE', initials:'SR', quote:'"Turned caffeine into features since 2022."',     gradient:'linear-gradient(135deg,#ec4899,#8b5cf6)' },
  { id:8,  name:'Dhruv Nair',     branch:'ECE', initials:'DN', quote:'"If it ain\'t broke, I\'ll find a way."',         gradient:'linear-gradient(135deg,#c7d2fe,#6c47ff)' },
  { id:9,  name:'Anika Joshi',    branch:'ME',  initials:'AJ', quote:'"She moved mountains. Also deadlines."',          gradient:'linear-gradient(135deg,#fde68a,#f59e0b)' },
  { id:10, name:'Neel Verma',     branch:'CSE', initials:'NV', quote:'"404: Sleep not found for 4 years."',             gradient:'linear-gradient(135deg,#a5f3fc,#3b82f6)' },
  { id:11, name:'Ravi Iyer',      branch:'CE',  initials:'RI', quote:'"Concrete plans, abstract execution."',           gradient:'linear-gradient(135deg,#bbf7d0,#10b981)' },
  { id:12, name:'Sara Menon',     branch:'EEE', initials:'SM', quote:'"Charged up. Always grounded."',                  gradient:'linear-gradient(135deg,#fbcfe8,#f43f5e)' },
];

export default function Yearbook() {
  const [search, setSearch] = useState('');
  const [branch, setBranch] = useState('All');
  const [flipped, setFlipped] = useState(null);

  const filtered = useMemo(() => {
    return SAMPLE_STUDENTS.filter(s => {
      const matchBranch = branch === 'All' || s.branch === branch;
      const matchSearch = s.name.toLowerCase().includes(search.toLowerCase());
      return matchBranch && matchSearch;
    });
  }, [search, branch]);

  return (
    <div style={{ position:'relative', zIndex:2, maxWidth:1080, margin:'0 auto', padding:'36px 20px 80px' }}>

      {/* Header */}
      <div className="fade-up" style={{ textAlign:'center', marginBottom:48 }}>
        <div style={{ color:'#d4af37', fontSize:11, fontWeight:600, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>Class of 2026</div>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(32px,6vw,58px)', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:14 }}>
          The Yearbook
        </h1>
        <p style={{ fontSize:16, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
          Every face. Every name. Every legacy.
        </p>
      </div>

      {/* Controls */}
      <div className="fade-up" style={{ display:'flex', gap:12, flexWrap:'wrap', marginBottom:36, alignItems:'center', animationDelay:'0.1s' }}>
        {/* Search */}
        <div style={{ flex:1, minWidth:220, position:'relative' }}>
          <span style={{ position:'absolute', left:16, top:'50%', transform:'translateY(-50%)', fontSize:16, opacity:0.5 }}>🔍</span>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            style={{
              width:'100%', padding:'13px 16px 13px 44px',
              borderRadius:100, fontSize:14,
              background:'rgba(255,255,255,0.06)',
              border:'1.5px solid rgba(255,255,255,0.12)',
              color:'#fff', fontFamily:"'DM Sans',sans-serif",
              outline:'none', transition:'border-color 0.2s',
            }}
            onFocus={e => e.target.style.borderColor='rgba(212,175,55,0.5)'}
            onBlur={e => e.target.style.borderColor='rgba(255,255,255,0.12)'}
          />
        </div>

        {/* Branch filter */}
        <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
          {BRANCHES.map(b => (
            <button
              key={b}
              onClick={() => setBranch(b)}
              style={{
                padding:'9px 18px', borderRadius:100, fontSize:12, fontWeight:500,
                border:`1.5px solid ${branch === b ? 'rgba(212,175,55,0.6)' : 'rgba(255,255,255,0.12)'}`,
                background: branch === b ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                color: branch === b ? '#d4af37' : 'rgba(255,255,255,0.55)',
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                transition:'all 0.18s',
              }}
            >
              {b}
            </button>
          ))}
        </div>
      </div>

      {/* Count */}
      <div style={{ fontSize:13, color:'rgba(255,255,255,0.35)', marginBottom:24 }}>
        Showing {filtered.length} of {SAMPLE_STUDENTS.length} students
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px', color:'rgba(255,255,255,0.35)' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, color:'rgba(255,255,255,0.6)', marginBottom:8 }}>No match found</div>
          <div style={{ fontSize:14 }}>Try a different name or branch</div>
        </div>
      ) : (
        <div style={{
          display:'grid',
          gridTemplateColumns:'repeat(auto-fill,minmax(230px,1fr))',
          gap:20,
        }}>
          {filtered.map((s, i) => (
            <StudentCard
              key={s.id} student={s} index={i}
              flipped={flipped === s.id}
              onFlip={() => setFlipped(flipped === s.id ? null : s.id)}
            />
          ))}
        </div>
      )}

      <style>{`
        .yb-card { transform-style: preserve-3d; transition: transform 0.55s cubic-bezier(.4,0,.2,1); }
        .yb-card.is-flipped { transform: rotateY(180deg); }
        .yb-front, .yb-back { backface-visibility: hidden; -webkit-backface-visibility: hidden; }
        .yb-back { transform: rotateY(180deg); }
      `}</style>
    </div>
  );
}

function StudentCard({ student: s, index, flipped, onFlip }) {
  return (
    <div
      className="fade-up"
      style={{
        perspective:1000,
        height:280,
        animationDelay:`${index * 0.05}s`,
        cursor:'pointer',
      }}
      onClick={onFlip}
    >
      <div className={`yb-card${flipped ? ' is-flipped' : ''}`} style={{ position:'relative', width:'100%', height:'100%' }}>

        {/* Front */}
        <div
          className="yb-front"
          style={{
            position:'absolute', inset:0,
            borderRadius:22,
            background:'rgba(255,255,255,0.04)',
            border:'1px solid rgba(255,255,255,0.1)',
            backdropFilter:'blur(12px)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:24, textAlign:'center',
            overflow:'hidden',
          }}
        >
          {/* Glow */}
          <div style={{ position:'absolute', top:-40, left:'50%', transform:'translateX(-50%)', width:180, height:180, borderRadius:'50%', background:s.gradient, opacity:0.12, filter:'blur(40px)', pointerEvents:'none' }} />

          {/* Avatar */}
          <div style={{
            width:80, height:80, borderRadius:'50%',
            background:s.gradient,
            border:'3px solid rgba(255,255,255,0.15)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontSize:26, fontWeight:700, color:'#fff',
            marginBottom:16,
            boxShadow:'0 8px 32px rgba(0,0,0,0.3)',
            transition:'transform 0.3s',
          }}>
            {s.initials}
          </div>

          <div style={{ fontFamily:"'Fraunces',serif", fontSize:18, fontWeight:600, color:'#fff', marginBottom:4 }}>{s.name}</div>
          <div style={{
            fontSize:11, fontWeight:600, letterSpacing:1.5, textTransform:'uppercase',
            color:'#d4af37', marginBottom:12,
          }}>{s.branch}</div>

          <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>Tap to read legacy →</div>
        </div>

        {/* Back */}
        <div
          className="yb-back"
          style={{
            position:'absolute', inset:0,
            borderRadius:22,
            background:`linear-gradient(135deg, rgba(212,175,55,0.12), rgba(13,11,24,0.95))`,
            border:'1px solid rgba(212,175,55,0.3)',
            backdropFilter:'blur(16px)',
            display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
            padding:28, textAlign:'center',
          }}
        >
          <div style={{ fontSize:32, marginBottom:16 }}>✦</div>
          <div style={{
            fontFamily:"'Fraunces',serif", fontSize:16, fontStyle:'italic',
            color:'rgba(255,255,255,0.85)', lineHeight:1.65, marginBottom:20,
          }}>
            {s.quote}
          </div>
          <div style={{ fontSize:13, fontWeight:600, color:'#d4af37' }}>{s.name}</div>
          <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)', marginTop:4 }}>{s.branch} · Class of 2026</div>
        </div>
      </div>
    </div>
  );
}
