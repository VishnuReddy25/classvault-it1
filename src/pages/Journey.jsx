import React, { useEffect, useRef, useState } from 'react';

const MILESTONES = [
  { year: '2022', label: 'The Beginning', icon: '🌱', desc: 'Orientation, new faces, first lectures. The journey starts.' },
  { year: '2023', label: 'Finding Our Feet', icon: '⚡', desc: 'Late nights, lab sessions, friendships forged under pressure.' },
  { year: '2024', label: 'Rising Higher', icon: '🔥', desc: 'Projects, fests, internships. We started becoming who we are.' },
  { year: '2025', label: 'Final Chapter', icon: '🌟', desc: 'Placements, memories sealed forever.' },
  { year: '2026', label: 'The Goodbye', icon: '🎓', desc: 'Not an end ... but a launchpad. Batch 2022–26 forever.' },
];

export default function Journey({ onNavigate }) {
  const [scrolled, setScrolled] = useState(0);
  const containerRef = useRef();

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => {
      const pct = el.scrollTop / (el.scrollHeight - el.clientHeight);
      setScrolled(pct);
    };
    el.addEventListener('scroll', handler);
    return () => el.removeEventListener('scroll', handler);
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', zIndex: 2,
        height: 'calc(100vh - 60px)',
        overflowY: 'auto',
        scrollBehavior: 'smooth',
      }}
    >
      {/* ── Hero ── */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center', padding: '40px 20px',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Cinematic vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 30%, rgba(13,11,24,0.65) 100%)',
          pointerEvents: 'none', zIndex: 1,
        }} />

        {/* Floating orbs */}
        <div style={{ position:'absolute', width:600, height:600, borderRadius:'50%', background:'radial-gradient(circle,rgba(212,175,55,0.12),transparent 70%)', top:'10%', left:'50%', transform:'translateX(-50%)', animation:'drift 10s ease-in-out infinite alternate', pointerEvents:'none' }} />
        <div style={{ position:'absolute', width:350, height:350, borderRadius:'50%', background:'radial-gradient(circle,rgba(108,71,255,0.1),transparent 70%)', bottom:'15%', right:'10%', animation:'drift 13s ease-in-out infinite alternate-reverse', pointerEvents:'none' }} />

        <div style={{ position:'relative', zIndex:2 }}>
          {/* Badge */}
          <div className="fade-up" style={{
            display:'inline-flex', alignItems:'center', gap:8,
            background:'rgba(212,175,55,0.1)', border:'1px solid rgba(212,175,55,0.35)',
            color:'#d4af37', fontSize:12, fontWeight:600, letterSpacing:2,
            padding:'7px 20px', borderRadius:100, marginBottom:28,
            textTransform:'uppercase',
          }}>
            ✦ Batch 2022 – 2026
          </div>

          <h1 className="fade-up" style={{
            fontFamily:"'Fraunces',serif",
            fontSize:'clamp(42px, 8vw, 88px)',
            fontWeight:700, lineHeight:1.05,
            color:'#fff',
            marginBottom:20,
            animationDelay:'0.1s',
            textShadow:'0 4px 40px rgba(212,175,55,0.2)',
          }}>
            Four Years.<br />
            <span style={{ color:'#d4af37' }}>One Story.</span>
          </h1>

          <p className="fade-up" style={{
            fontSize:'clamp(15px, 2vw, 19px)',
            color:'rgba(255,255,255,0.6)',
            lineHeight:1.7, maxWidth:520, margin:'0 auto 40px',
            animationDelay:'0.2s',
          }}>
            From nervous freshers to confident graduates —<br />
            this is our journey, sealed in memory forever.
          </p>

          <div className="fade-up" style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap', animationDelay:'0.3s' }}>
            <button
              onClick={() => containerRef.current?.scrollTo({ top: window.innerHeight, behavior:'smooth' })}
              style={{
                padding:'15px 36px', borderRadius:100,
                background:'linear-gradient(135deg,#d4af37,#f5c842)',
                color:'#0d0b18', fontSize:16, fontWeight:700,
                border:'none', cursor:'pointer',
                boxShadow:'0 8px 32px rgba(212,175,55,0.4)',
                fontFamily:"'DM Sans',sans-serif",
                transition:'all 0.25s',
              }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 14px 44px rgba(212,175,55,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 8px 32px rgba(212,175,55,0.4)'; }}
            >
              Start the Journey →
            </button>
            <button
              onClick={() => onNavigate('yearbook')}
              style={{
                padding:'15px 36px', borderRadius:100,
                background:'rgba(255,255,255,0.07)',
                border:'1px solid rgba(255,255,255,0.2)',
                color:'#fff', fontSize:16, fontWeight:500,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                transition:'all 0.25s',
              }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.13)'}
              onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.07)'}
            >
              View Yearbook
            </button>
          </div>

          {/* Scroll hint */}
          <div style={{ marginTop:64, opacity:0.4, animation:'bounce 2s ease-in-out infinite', fontSize:22 }}>↓</div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section style={{ maxWidth:760, margin:'0 auto', padding:'80px 24px' }}>
        <div className="fade-up" style={{ textAlign:'center', marginBottom:64 }}>
          <div style={{ color:'#d4af37', fontSize:11, fontWeight:600, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>Our Story</div>
          <div style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(28px,5vw,46px)', fontWeight:700, color:'#fff', lineHeight:1.15 }}>
            The Road We Walked
          </div>
        </div>

        <div style={{ position:'relative' }}>
          {/* Spine */}
          <div style={{
            position:'absolute', left:'50%', top:0, bottom:0, width:2,
            background:'linear-gradient(180deg,#d4af37,rgba(212,175,55,0.1))',
            transform:'translateX(-50%)', borderRadius:2,
          }} />

          {MILESTONES.map((m, i) => (
            <div
              key={m.year}
              className="fade-up"
              style={{
                display:'flex',
                flexDirection: i % 2 === 0 ? 'row' : 'row-reverse',
                alignItems:'center', gap:32,
                marginBottom:48,
                animationDelay:`${i * 0.12}s`,
              }}
            >
              {/* Card */}
              <div style={{
                flex:1,
                background:'rgba(255,255,255,0.04)',
                border:'1px solid rgba(212,175,55,0.18)',
                borderRadius:20, padding:'22px 26px',
                backdropFilter:'blur(12px)',
                boxShadow:'0 4px 24px rgba(0,0,0,0.2)',
                textAlign: i % 2 === 0 ? 'right' : 'left',
                transition:'all 0.3s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(212,175,55,0.45)'; e.currentTarget.style.transform='translateY(-4px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(212,175,55,0.18)'; e.currentTarget.style.transform=''; }}
              >
                <div style={{ fontSize:11, color:'#d4af37', fontWeight:600, letterSpacing:2, textTransform:'uppercase', marginBottom:6 }}>{m.year}</div>
                <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, fontWeight:600, color:'#fff', marginBottom:8 }}>{m.label}</div>
                <div style={{ fontSize:14, color:'rgba(255,255,255,0.55)', lineHeight:1.65 }}>{m.desc}</div>
              </div>

              {/* Center node */}
              <div style={{
                width:52, height:52, borderRadius:'50%', flexShrink:0,
                background:'linear-gradient(135deg,rgba(212,175,55,0.2),rgba(245,200,66,0.1))',
                border:'2px solid rgba(212,175,55,0.5)',
                display:'flex', alignItems:'center', justifyContent:'center',
                fontSize:22, zIndex:2,
                boxShadow:'0 0 0 6px rgba(212,175,55,0.08)',
              }}>
                {m.icon}
              </div>

              <div style={{ flex:1 }} />
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{
        textAlign:'center', padding:'80px 24px 120px',
        background:'linear-gradient(180deg,transparent,rgba(212,175,55,0.04))',
      }}>
        <div className="fade-up" style={{
          fontFamily:"'Fraunces',serif",
          fontSize:'clamp(26px,5vw,42px)',
          fontWeight:700, color:'#fff', marginBottom:16, lineHeight:1.2,
        }}>
          Ready to relive the memories?
        </div>
        <p style={{ color:'rgba(255,255,255,0.5)', fontSize:16, marginBottom:36 }}>
          Explore the yearbook, the wall, and everything in between.
        </p>
        <div style={{ display:'flex', gap:14, justifyContent:'center', flexWrap:'wrap' }}>
          {[
            { label:'📖 Yearbook', page:'yearbook' },
            { label:'🖼 Media Vault', page:'media' },
            { label:'📝 The Wall', page:'wall' },
          ].map(btn => (
            <button
              key={btn.page}
              onClick={() => onNavigate(btn.page)}
              style={{
                padding:'13px 28px', borderRadius:100,
                background:'rgba(212,175,55,0.1)',
                border:'1px solid rgba(212,175,55,0.35)',
                color:'#d4af37', fontSize:15, fontWeight:500,
                cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                transition:'all 0.22s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background='rgba(212,175,55,0.2)'; e.currentTarget.style.transform='translateY(-3px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background='rgba(212,175,55,0.1)'; e.currentTarget.style.transform=''; }}
            >
              {btn.label}
            </button>
          ))}
        </div>
      </section>

      <style>{`
        @keyframes bounce { 0%,100%{transform:translateY(0)} 50%{transform:translateY(8px)} }
      `}</style>
    </div>
  );
}
