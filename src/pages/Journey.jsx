import React, { useEffect, useRef, useState } from 'react';

/* ─── DATA ──────────────────────────────────────────────── */
const CHAPTERS = [
  {
    year: '2022', sem: 'Sem I & II',
    label: 'The Nervous Beginning',
    sub: 'When everything was new',
    body: 'Orientation day butterflies. Learning names. Struggling with Python programming at midnight, wondering if we chose the right path. We arrived as strangers.',
    icon: '🌱',
    tags: ['Orientation', 'First friendships', 'PSP', 'Canteen debuts'],
    accent: 'rgba(201,136,58,0.14)',
    border: 'rgba(201,136,58,0.28)',
  },
  {
    year: '2023', sem: 'Sem III & IV',
    label: 'Finding Our Tribe',
    sub: 'Late nights & lifelong bonds',
    body: "Lab sessions, Shared notes, shared panic. The canteen became our second classroom. Strangers became people you'd call at 2am.",
    icon: '⚡',
    tags: ['Data Structures', 'Study groups', 'Lab partners', 'Chai runs'],
    accent: 'rgba(90,122,94,0.14)',
    border: 'rgba(90,122,94,0.28)',
  },
  {
    year: '2024', sem: 'Sem V & VI',
    label: 'Rising to the Challenge',
    sub: 'We started becoming who we are',
    body: 'First internships, projects that actually worked. The future stopped feeling abstract. We built real things and real confidence.',
    icon: '🔥',
    tags: ['Tech Fests', 'Internships', 'Mini projects', 'Presentations'],
    accent: 'rgba(139,58,42,0.14)',
    border: 'rgba(139,58,42,0.28)',
  },
  {
    year: '2025', sem: 'Sem VII',
    label: 'The Weight of Almost',
    sub: 'Counting every last',
    body: 'Placements, final year projects, every class suddenly precious. We started counting lasts without realising — last exam, last canteen lunch, last walk to the lab.',
    icon: '🌟',
    tags: ['Placements', 'Final project', 'Campus walks', 'Last benches'],
    accent: 'rgba(90,80,160,0.14)',
    border: 'rgba(90,80,160,0.28)',
  },
  {
    year: '2026', sem: 'Sem VIII',
    label: "The Goodbye We're Still Writing",
    sub: 'Not an end — a launchpad',
    body: "Batch 2022–26 doesn't stop here. It scatters into a hundred different futures, carrying the same four years. Wherever we go, we carry this place.",
    icon: '🎓',
    tags: ['Graduation', 'New beginnings', 'Forever batch', 'See you around'],
    accent: 'rgba(201,168,76,0.14)',
    border: 'rgba(201,168,76,0.28)',
  },
];

const STATS = [
  { num: '4',   label: 'Years Together' },
  { num: '8',   label: 'Semesters' },
  { num: '75',  label: 'Batchmates' },
  { num: '∞',   label: 'Memories' },
];

/* ─── INTERSECTION REVEAL HOOK ──────────────────────────── */
function useReveal(threshold = 0.15) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function Reveal({ children, delay = 0, x = 0, y = 32, scale = 1, threshold = 0.15 }) {
  const [ref, visible] = useReveal(threshold);
  return (
    <div
      ref={ref}
      style={{
        transition: `opacity 0.72s ${delay}s cubic-bezier(.22,1,.36,1), transform 0.72s ${delay}s cubic-bezier(.22,1,.36,1)`,
        opacity: visible ? 1 : 0,
        transform: visible
          ? 'none'
          : `translate(${x}px, ${y}px) scale(${scale})`,
      }}
    >
      {children}
    </div>
  );
}

/* ─── AMBER GRADIENT TEXT ───────────────────────────────── */
const amberGrad = {
  background: 'linear-gradient(135deg, #c9883a 0%, #e8a84c 50%, #f5c87a 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
};

/* ─── SECTION HEADER ────────────────────────────────────── */
function SectionHeader({ eyebrow, title, accent, sub }) {
  return (
    <Reveal>
      <div style={{ textAlign: 'center', marginBottom: 56 }}>
        <div style={{
          fontFamily: "'Caveat', cursive",
          fontSize: 13, letterSpacing: 4,
          color: 'rgba(201,136,58,0.6)',
          textTransform: 'uppercase', marginBottom: 14,
        }}>
          ✦ &nbsp;{eyebrow}&nbsp; ✦
        </div>
        <h2 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(28px,6vw,48px)',
          fontWeight: 700, lineHeight: 1.1,
          color: '#f0ead8',
        }}>
          {title}{' '}
          <span style={amberGrad}>{accent}</span>
        </h2>
        <div style={{
          width: 56, height: 1, margin: '16px auto',
          background: 'linear-gradient(90deg, transparent, rgba(201,136,58,0.55), transparent)',
        }} />
        {sub && (
          <p style={{
            fontSize: 'clamp(13px,2vw,15px)',
            color: 'rgba(255,255,255,0.36)',
            fontWeight: 300,
          }}>
            {sub}
          </p>
        )}
      </div>
    </Reveal>
  );
}

/* ─── CHAPTER CARD (mobile-first, alternating on desktop) ── */
function ChapterCard({ ch, idx }) {
  const [hov, setHov] = useState(false);

  /* On desktop (≥700px) alternate sides; on mobile always stack */
  const isLeft = idx % 2 === 0;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',        /* mobile default: stack */
      alignItems: 'stretch',
      marginBottom: 48,
      position: 'relative',
    }}>
      {/* Responsive row wrapper — only applies on wider screens via inline trick */}
      <style>{`
        @media (min-width: 700px) {
          .ch-row-${idx} {
            flex-direction: ${isLeft ? 'row' : 'row-reverse'} !important;
            align-items: center !important;
          }
          .ch-spacer-${idx} { display: flex !important; }
        }
      `}</style>

      <div className={`ch-row-${idx}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'stretch', gap: 0 }}>

        {/* Card */}
        <Reveal x={isLeft ? -28 : 28} y={0} delay={0.05}>
          <div
            onMouseEnter={() => setHov(true)}
            onMouseLeave={() => setHov(false)}
            style={{
              background: ch.accent,
              border: `1px solid ${hov ? ch.border.replace('0.28', '0.55') : ch.border}`,
              borderRadius: 18,
              padding: 'clamp(20px,4vw,32px) clamp(18px,4vw,36px)',
              backdropFilter: 'blur(16px)',
              transform: hov ? 'translateY(-5px)' : 'none',
              boxShadow: hov ? '0 18px 48px rgba(0,0,0,0.38)' : 'none',
              transition: 'transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease',
              flex: 1,
            }}
          >
            {/* Year row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 12, fontWeight: 700, letterSpacing: 2,
                color: 'rgba(245,200,120,0.75)', textTransform: 'uppercase',
              }}>{ch.year}</span>
              <span style={{ width: 1, height: 11, background: 'rgba(255,255,255,0.13)' }} />
              <span style={{
                fontFamily: "'Caveat', cursive",
                fontSize: 12, color: 'rgba(255,255,255,0.32)',
              }}>{ch.sem}</span>
            </div>

            <h3 style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 'clamp(17px,3vw,22px)',
              fontWeight: 700, color: '#f0ead8',
              lineHeight: 1.2, marginBottom: 4,
            }}>{ch.label}</h3>

            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 14, color: 'rgba(245,200,120,0.5)',
              marginBottom: 14, fontStyle: 'italic',
            }}>{ch.sub}</div>

            <div style={{
              height: 1, marginBottom: 16,
              background: 'linear-gradient(90deg, rgba(240,234,216,0.12), transparent)',
            }} />

            <p style={{
              fontSize: 'clamp(13px,2vw,14px)',
              color: 'rgba(255,255,255,0.52)',
              lineHeight: 1.8, fontWeight: 300, marginBottom: 16,
            }}>{ch.body}</p>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {ch.tags.map(t => (
                <span key={t} style={{
                  fontFamily: "'Caveat', cursive",
                  fontSize: 12, padding: '3px 11px',
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.09)',
                  borderRadius: 100, color: 'rgba(255,255,255,0.42)',
                }}>{t}</span>
              ))}
            </div>
          </div>
        </Reveal>

        {/* Spine node (hidden on mobile, shown on desktop via CSS) */}
        <div
          className={`ch-spacer-${idx}`}
          style={{
            display: 'none',
            width: 72, flexShrink: 0,
            justifyContent: 'center', alignItems: 'center',
            position: 'relative', zIndex: 2,
          }}
        >
          <Reveal scale={0.7} y={0} delay={0}>
            <div style={{
              width: 46, height: 46, borderRadius: '50%',
              background: 'linear-gradient(145deg,rgba(201,136,58,0.2),rgba(201,136,58,0.06))',
              border: '1.5px solid rgba(201,136,58,0.38)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18,
              boxShadow: '0 0 0 8px rgba(201,136,58,0.05)',
            }}>{ch.icon}</div>
          </Reveal>
        </div>

        {/* Mobile icon (shown on mobile only) */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          margin: '12px 0 0 8px',
        }}>
          <span style={{ fontSize: 20 }}>{ch.icon}</span>
          <div style={{
            flex: 1, height: 1,
            background: 'linear-gradient(90deg, rgba(201,136,58,0.3), transparent)',
          }} />
        </div>

        <div style={{ flex: 1 }} />
      </div>
    </div>
  );
}

/* ─── CLOSING BOARD ─────────────────────────────────────── */
function ClosingBoard({ onNavigate }) {
  return (
    <section style={{
      padding: 'clamp(64px,10vw,100px) clamp(16px,5vw,28px) clamp(80px,12vw,120px)',
      textAlign: 'center', position: 'relative', overflow: 'hidden',
      background: 'linear-gradient(180deg,transparent,rgba(42,61,50,0.1) 50%,rgba(14,11,7,0.55) 100%)',
    }}>
      {/* Chalkboard rect — hidden on tiny screens */}
      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        width: 'min(560px, 90vw)', height: 280,
        background: 'rgba(42,61,50,0.16)',
        border: '1px solid rgba(42,61,50,0.38)',
        borderRadius: 4,
        boxShadow: '0 0 80px rgba(42,61,50,0.12),inset 0 0 40px rgba(0,0,0,0.2)',
        pointerEvents: 'none',
      }} />

      <Reveal>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 12, letterSpacing: 4,
            color: 'rgba(201,136,58,0.5)',
            textTransform: 'uppercase', marginBottom: 22,
          }}>✦ &nbsp;The Memories Live On&nbsp; ✦</div>

          <h2 style={{
            fontFamily: "'Playfair Display', serif",
            fontSize: 'clamp(22px,5vw,40px)',
            fontWeight: 700, color: '#f0ead8',
            lineHeight: 1.2, marginBottom: 14,
          }}>
            Ready to relive the best<br />
            <span style={amberGrad}>years of our lives?</span>
          </h2>

          <div style={{
            fontFamily: "'Caveat', cursive",
            fontSize: 'clamp(16px,3vw,18px)',
            color: 'rgba(240,234,216,0.38)',
            marginBottom: 40, fontStyle: 'italic',
          }}>
            "Not an end — a beginning in disguise."
          </div>

          <div style={{
            display: 'flex', gap: 12,
            justifyContent: 'center', flexWrap: 'wrap',
          }}>
            {[
              { label: '📖 Yearbook',   page: 'yearbook' },
              { label: '🖼 Media Vault', page: 'media'    },
              { label: '📝 The Wall',   page: 'wall'     },
            ].map(b => (
              <button
                key={b.page}
                onClick={() => onNavigate(b.page)}
                className="btn-ghost-amber"
                style={{
                  padding: 'clamp(10px,2vw,13px) clamp(18px,4vw,28px)',
                  borderRadius: 100, fontSize: 'clamp(12px,2vw,14px)',
                  fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
                }}
              >{b.label}</button>
            ))}
          </div>
        </div>
      </Reveal>
    </section>
  );
}

/* ─── MAIN PAGE ─────────────────────────────────────────── */
export default function Journey({ onNavigate }) {
  const containerRef = useRef();
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const handler = () => setScrollY(el.scrollTop);
    el.addEventListener('scroll', handler, { passive: true });
    return () => el.removeEventListener('scroll', handler);
  }, []);

  const heroParallax = scrollY * 0.35;
  const heroOpacity  = Math.max(0, 1 - scrollY / 550);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'relative', zIndex: 2,
        height: 'calc(100vh - 64px)',
        overflowY: 'auto', overflowX: 'hidden',
        scrollBehavior: 'smooth',
      }}
    >

      {/* ══════ HERO ══════ */}
      <section style={{
        minHeight: '100vh',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(80px,12vh,120px) clamp(16px,5vw,40px) clamp(60px,8vh,80px)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Vignette */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          background: 'radial-gradient(ellipse 85% 75% at 50% 50%,transparent 30%,rgba(14,11,7,0.65) 100%)',
        }} />
        {/* Warm ambient orb */}
        <div style={{
          position: 'absolute', top: '18%', left: '50%', transform: 'translateX(-50%)',
          width: 'min(500px,90vw)', height: 'min(500px,90vw)',
          borderRadius: '50%', pointerEvents: 'none',
          background: 'radial-gradient(circle,rgba(201,136,58,0.09) 0%,transparent 70%)',
          animation: 'heroFloat 8s ease-in-out infinite',
          zIndex: 0,
        }} />

        {/* Parallax content */}
        <div style={{
          transform: `translateY(${heroParallax}px)`,
          opacity: heroOpacity,
          position: 'relative', zIndex: 2,
          width: '100%', maxWidth: 680,
        }}>
          {/* Badge */}
          <div className="fade-up" style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            background: 'rgba(201,136,58,0.08)',
            border: '1px solid rgba(201,136,58,0.22)',
            padding: 'clamp(6px,1.5vw,8px) clamp(14px,3vw,22px)',
            borderRadius: 100, marginBottom: 'clamp(24px,4vh,36px)',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9883a', display: 'inline-block' }} />
            <span style={{
              fontFamily: "'Caveat',cursive",
              fontSize: 'clamp(11px,2vw,14px)', fontWeight: 600,
              letterSpacing: 'clamp(1px,0.5vw,3px)',
              color: '#c9883a', textTransform: 'uppercase',
            }}>IT -1 · Batch 2022–2026</span>
            <span style={{ width: 5, height: 5, borderRadius: '50%', background: '#c9883a', display: 'inline-block' }} />
          </div>

          {/* Headline */}
          <h1 className="fade-up" style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 'clamp(44px,11vw,104px)',
            fontWeight: 900, lineHeight: 1.0,
            color: '#f0ead8', marginBottom: 6,
            animationDelay: '0.1s', letterSpacing: -2,
          }}>Four Years.</h1>
          <h1 className="fade-up" style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 'clamp(44px,11vw,104px)',
            fontWeight: 900, lineHeight: 1.0,
            marginBottom: 'clamp(20px,3vh,30px)',
            animationDelay: '0.18s', letterSpacing: -2,
            ...amberGrad,
          }}>One Story.</h1>

          {/* Divider */}
          <div className="fade-up" style={{
            width: 72, height: 1, margin: '0 auto clamp(20px,3vh,32px)',
            background: 'linear-gradient(90deg,transparent,rgba(201,136,58,0.6),transparent)',
            animationDelay: '0.24s',
          }} />

          <p className="fade-up" style={{
            fontSize: 'clamp(14px,2.2vw,18px)',
            color: 'rgba(240,234,216,0.48)',
            lineHeight: 1.8, maxWidth: 480, margin: '0 auto clamp(32px,5vh,48px)',
            fontWeight: 300, animationDelay: '0.28s',
          }}>
            From nervous freshers to confident graduates —<br />
            this is our journey, sealed in memory forever.
          </p>

          {/* CTAs */}
          <div className="fade-up" style={{
            display: 'flex', gap: 12, justifyContent: 'center',
            flexWrap: 'wrap', animationDelay: '0.35s',
          }}>
            <button
              onClick={() => containerRef.current?.scrollTo({ top: window.innerHeight * 0.88, behavior: 'smooth' })}
              className="btn-amber"
              style={{
                padding: 'clamp(12px,2vw,15px) clamp(24px,5vw,38px)',
                borderRadius: 100, fontSize: 'clamp(13px,2vw,15px)',
                fontFamily: "'DM Sans',sans-serif",
              }}
            >Relive the Journey ↓</button>
            <button
              onClick={() => onNavigate('yearbook')}
              className="btn-ghost-amber"
              style={{
                padding: 'clamp(12px,2vw,15px) clamp(24px,5vw,38px)',
                borderRadius: 100, fontSize: 'clamp(13px,2vw,15px)',
                fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
              }}
            >Open Yearbook</button>
          </div>

          {/* Scroll cue */}
          <div style={{
            marginTop: 'clamp(48px,7vh,72px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6,
          }}>
            <div style={{
              width: 1, height: 44,
              background: 'linear-gradient(180deg,transparent,rgba(201,136,58,0.65))',
              animation: 'scrollPulse 2.2s ease-in-out infinite',
            }} />
            <div style={{
              fontFamily: "'Caveat',cursive",
              fontSize: 10, letterSpacing: 3,
              color: 'rgba(201,136,58,0.38)', textTransform: 'uppercase',
            }}>scroll</div>
          </div>
        </div>
      </section>

      {/* ══════ STATS BAND ══════ */}
      <section style={{
        borderTop: '1px solid rgba(201,136,58,0.1)',
        borderBottom: '1px solid rgba(201,136,58,0.1)',
        background: 'rgba(201,136,58,0.03)',
        padding: 'clamp(32px,5vh,48px) clamp(16px,5vw,24px)',
      }}>
        <Reveal>
          <div style={{
            maxWidth: 860, margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'repeat(4,1fr)',
            gap: 'clamp(16px,3vw,32px)',
          }}>
            {STATS.map(s => (
              <div key={s.label} style={{ textAlign: 'center' }}>
                <div style={{
                  fontFamily: "'Playfair Display',serif",
                  fontSize: 'clamp(32px,7vw,56px)',
                  fontWeight: 700, lineHeight: 1, marginBottom: 6,
                  ...amberGrad,
                }}>{s.num}</div>
                <div style={{
                  fontFamily: "'Caveat',cursive",
                  fontSize: 'clamp(10px,1.8vw,13px)',
                  color: 'rgba(255,255,255,0.32)',
                  letterSpacing: 1.5, textTransform: 'uppercase',
                }}>{s.label}</div>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ══════ TIMELINE ══════ */}
      <section style={{
        maxWidth: 900, margin: '0 auto',
        padding: 'clamp(64px,10vh,100px) clamp(16px,5vw,28px) clamp(48px,8vh,80px)',
      }}>
        <SectionHeader
          eyebrow="Our Story"
          title="The Road"
          accent="We Walked"
          sub="Five chapters. One unforgettable batch."
        />

        {/* Spine — desktop only */}
        <div style={{ position: 'relative' }}>
          <style>{`
            @media (min-width: 700px) {
              .ch-spine { display: block !important; }
              .ch-mobile-icon { display: none !important; }
            }
          `}</style>
          <div
            className="ch-spine"
            style={{
              display: 'none',
              position: 'absolute', left: '50%', top: 0, bottom: 0, width: 1,
              transform: 'translateX(-50%)',
              background: 'linear-gradient(180deg,rgba(201,136,58,0.45) 0%,rgba(201,136,58,0.06) 100%)',
              pointerEvents: 'none',
            }}
          />
          {CHAPTERS.map((ch, i) => (
            <ChapterCard key={ch.year} ch={ch} idx={i} />
          ))}
        </div>
      </section>

      {/* ══════ CLOSING BOARD ══════ */}
      <ClosingBoard onNavigate={onNavigate} />

      <style>{`
        @keyframes heroFloat {
          0%,100% { transform:translateX(-50%) translateY(0); }
          50%      { transform:translateX(-50%) translateY(-18px); }
        }
        @keyframes scrollPulse {
          0%,100% { opacity:.38; }
          50%      { opacity:.85; }
        }
        /* Mobile: chapter rows always stack */
        @media (max-width: 699px) {
          .ch-mobile-icon { display:flex !important; }
        }
      `}</style>
    </div>
  );
}
