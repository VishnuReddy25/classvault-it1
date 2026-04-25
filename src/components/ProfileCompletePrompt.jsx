import React, { useState, useEffect } from 'react';
import { useYearbook } from '../context/YearbookContext';

/* Fields that MUST be filled (photo + social excluded) */
const REQUIRED = [
  { key: 'bio',         label: 'Bio',         hint: 'Write something about yourself'      },
  { key: 'legacy',      label: 'Legacy',       hint: 'Leave your message to the batch'    },
  { key: 'superlative', label: 'Superlative',  hint: 'Pick your class superlative'        },
  { key: 'tags',        label: 'Fun Tags',     hint: 'Add at least one tag about yourself' },
];

function isFilled(student, key) {
  const v = student?.[key];
  if (!v) return false;
  if (Array.isArray(v)) return v.length > 0;
  return v.trim().length > 0;
}

function getMissing(student) {
  if (!student) return [];
  return REQUIRED.filter(f => !isFilled(student, f.key));
}

export default function ProfileCompletePrompt({ onOpenProfile }) {
  const { sessionStudent, sessionId, isClaimed } = useYearbook();

  const [dismissed, setDismissed] = useState(false);
  const [expanded,  setExpanded]  = useState(false);
  const [pulse,     setPulse]     = useState(false);

  const missing = getMissing(sessionStudent);
  const allDone = missing.length === 0;

  /* pulse the banner every 60s if not dismissed */
  useEffect(() => {
    if (allDone || dismissed) return;
    const iv = setInterval(() => {
      setPulse(true);
      setTimeout(() => setPulse(false), 900);
    }, 60000);
    return () => clearInterval(iv);
  }, [allDone, dismissed]);

  /* re-surface banner if more fields go missing (edge case) */
  useEffect(() => {
    if (!allDone) setDismissed(false);
  }, [missing.length]); // eslint-disable-line

  /* don't show if: not signed in, no profile, all fields filled, or dismissed */
  if (!sessionId || !sessionStudent) return null;
  if (!isClaimed(sessionId))         return null;
  if (allDone)                       return <AllDoneToast />;
  if (dismissed && !expanded)        return <MiniBadge missing={missing} onClick={() => { setDismissed(false); setExpanded(true); }} />;

  return (
    <>
      {/* ── Backdrop when expanded ── */}
      {expanded && (
        <div
          onClick={() => setExpanded(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 499,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(6px)',
            animation: 'fadeIn 0.2s ease',
          }}
        />
      )}

      {/* ── Main prompt ── */}
      <div
        className={pulse ? 'pop-in' : ''}
        style={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 500,
          width: expanded ? 'min(400px, calc(100vw - 32px))' : 'min(360px, calc(100vw - 32px))',
          background: 'linear-gradient(145deg, #1a1208 0%, #120e08 100%)',
          border: '1px solid rgba(201,136,58,0.35)',
          borderRadius: expanded ? 22 : 18,
          boxShadow: '0 24px 64px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,136,58,0.1)',
          overflow: 'hidden',
          transition: 'width 0.35s cubic-bezier(.4,0,.2,1), border-radius 0.35s, box-shadow 0.35s',
          animation: 'slideUpIn 0.45s cubic-bezier(.34,1.4,.64,1) both',
        }}
      >
        {/* Amber top accent bar */}
        <div style={{
          height: 3,
          background: 'linear-gradient(90deg, #c9883a, #e8a84c, #f5c87a)',
        }} />

        {/* Header row */}
        <div
          onClick={() => setExpanded(v => !v)}
          style={{
            display: 'flex', alignItems: 'center', gap: 12,
            padding: '16px 18px',
            cursor: 'pointer',
            borderBottom: expanded ? '1px solid rgba(255,255,255,0.06)' : 'none',
            transition: 'border-color 0.25s',
          }}
        >
          {/* Pulsing icon */}
          <div style={{
            width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
            background: 'rgba(201,136,58,0.12)',
            border: '1.5px solid rgba(201,136,58,0.4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
            animation: 'lockRing 3.5s ease-in-out infinite',
          }}>
            📝
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{
              fontFamily: "'Playfair Display', serif",
              fontSize: 14, fontWeight: 700,
              color: '#f0ead8', lineHeight: 1.2, marginBottom: 3,
            }}>
              Complete your profile
            </div>
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 13, color: 'rgba(201,136,58,0.7)',
            }}>
              {missing.length} of {REQUIRED.length} fields missing
            </div>
          </div>

          {/* Progress ring */}
          <ProgressRing
            filled={REQUIRED.length - missing.length}
            total={REQUIRED.length}
          />

          {/* Chevron */}
          <div style={{
            fontSize: 10, color: 'rgba(255,255,255,0.3)',
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s ease',
            marginLeft: 4, flexShrink: 0,
          }}>▲</div>

          {/* Dismiss X */}
          <button
            onClick={e => { e.stopPropagation(); setExpanded(false); setDismissed(true); }}
            style={{
              width: 26, height: 26, borderRadius: '50%',
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.3)', fontSize: 11,
              cursor: 'pointer', flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'background 0.18s, color 0.18s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = 'rgba(255,255,255,0.7)'; }}
            onMouseOut={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.06)'; e.currentTarget.style.color = 'rgba(255,255,255,0.3)'; }}
          >✕</button>
        </div>

        {/* Expanded body */}
        {expanded && (
          <div style={{ padding: '16px 18px 18px', animation: 'fadeUp 0.3s ease both' }}>

            {/* Student identity */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 10,
              marginBottom: 18,
              padding: '12px 14px',
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 12,
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                background: sessionStudent.gradient,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, fontWeight: 700, color: '#fff',
                border: '2px solid rgba(255,255,255,0.18)',
              }}>
                {sessionStudent.initials}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ead8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sessionStudent.name}
                </div>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', marginTop: 1, fontFamily: 'monospace' }}>
                  {sessionStudent.roll}
                </div>
              </div>
            </div>

            {/* Missing fields list */}
            <div style={{
              fontFamily: "'Caveat', cursive",
              fontSize: 12, letterSpacing: 2,
              color: 'rgba(201,136,58,0.55)',
              textTransform: 'uppercase', marginBottom: 10,
            }}>
              Still needed
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
              {REQUIRED.map(f => {
                const done = isFilled(sessionStudent, f.key);
                return (
                  <div
                    key={f.key}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 13px', borderRadius: 10,
                      background: done
                        ? 'rgba(16,185,129,0.07)'
                        : 'rgba(201,136,58,0.06)',
                      border: `1px solid ${done
                        ? 'rgba(16,185,129,0.2)'
                        : 'rgba(201,136,58,0.18)'}`,
                      transition: 'all 0.3s',
                    }}
                  >
                    {/* Status icon */}
                    <div style={{
                      width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
                      background: done
                        ? 'rgba(16,185,129,0.2)'
                        : 'rgba(201,136,58,0.12)',
                      border: `1.5px solid ${done
                        ? 'rgba(16,185,129,0.5)'
                        : 'rgba(201,136,58,0.35)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10,
                      color: done ? '#6ee7b7' : '#e8a84c',
                    }}>
                      {done ? '✓' : '!'}
                    </div>

                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: 12, fontWeight: 600,
                        color: done ? 'rgba(110,231,183,0.8)' : '#e8a84c',
                        lineHeight: 1.2,
                      }}>
                        {f.label}
                      </div>
                      {!done && (
                        <div style={{
                          fontSize: 10, color: 'rgba(255,255,255,0.32)',
                          marginTop: 1, lineHeight: 1.3,
                          fontFamily: "'Caveat', cursive", fontSize: 12,
                        }}>
                          {f.hint}
                        </div>
                      )}
                    </div>

                    {done && (
                      <div style={{
                        fontSize: 10, fontWeight: 600,
                        color: 'rgba(16,185,129,0.7)',
                        letterSpacing: 0.5,
                      }}>
                        Done
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* CTA button */}
            <button
              onClick={() => { setExpanded(false); onOpenProfile(sessionId); }}
              style={{
                width: '100%', padding: '13px',
                borderRadius: 100, fontSize: 13, fontWeight: 700,
                background: 'linear-gradient(135deg, #c9883a, #e8a84c)',
                color: '#1e160a', border: 'none', cursor: 'pointer',
                fontFamily: "'DM Sans', sans-serif",
                boxShadow: '0 6px 24px rgba(201,136,58,0.35)',
                transition: 'transform 0.2s, box-shadow 0.2s',
                letterSpacing: 0.3,
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,136,58,0.5)'; }}
              onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,136,58,0.35)'; }}
            >
              Fill My Profile Now →
            </button>

            <p style={{
              fontSize: 11, color: 'rgba(255,255,255,0.22)',
              textAlign: 'center', marginTop: 10,
              fontFamily: "'Caveat', cursive", fontSize: 12,
            }}>
              Your profile is part of the batch yearbook forever ✦
            </p>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUpIn {
          from { opacity:0; transform:translateY(28px) scale(0.95); }
          to   { opacity:1; transform:translateY(0) scale(1); }
        }
      `}</style>
    </>
  );
}

/* ── SVG progress ring ─────────────────────────────────── */
function ProgressRing({ filled, total }) {
  const R   = 14;
  const C   = 2 * Math.PI * R;
  const pct = total > 0 ? filled / total : 0;
  const dash = pct * C;
  return (
    <svg width={36} height={36} style={{ flexShrink: 0, transform: 'rotate(-90deg)' }}>
      <circle cx={18} cy={18} r={R} fill="none"
        stroke="rgba(201,136,58,0.15)" strokeWidth={2.5} />
      <circle cx={18} cy={18} r={R} fill="none"
        stroke={pct >= 1 ? '#10b981' : '#e8a84c'}
        strokeWidth={2.5}
        strokeDasharray={`${dash} ${C}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dasharray 0.5s ease, stroke 0.4s' }}
      />
      {/* filled count text */}
      <text
        x={18} y={18}
        textAnchor="middle" dominantBaseline="central"
        style={{ transform: 'rotate(90deg)', transformOrigin: '18px 18px' }}
        fontSize={9} fontWeight={700}
        fill={pct >= 1 ? '#6ee7b7' : '#e8a84c'}
        fontFamily="'DM Sans',sans-serif"
      >
        {filled}/{total}
      </text>
    </svg>
  );
}

/* ── Mini badge shown after dismiss ────────────────────── */
function MiniBadge({ missing, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      title={`${missing.length} profile field${missing.length > 1 ? 's' : ''} missing`}
      style={{
        position: 'fixed', bottom: 24, right: 24, zIndex: 500,
        width: 48, height: 48, borderRadius: '50%',
        background: 'linear-gradient(135deg, #c9883a, #e8a84c)',
        border: 'none', cursor: 'pointer',
        boxShadow: hov
          ? '0 10px 36px rgba(201,136,58,0.55)'
          : '0 6px 24px rgba(201,136,58,0.38)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        transform: hov ? 'translateY(-3px) scale(1.08)' : 'scale(1)',
        transition: 'all 0.25s cubic-bezier(.34,1.4,.64,1)',
        animation: 'slideUpIn 0.4s cubic-bezier(.34,1.4,.64,1) both',
      }}
    >
      <span style={{ fontSize: 20 }}>📝</span>
      {/* Missing count badge */}
      <div style={{
        position: 'absolute', top: -4, right: -4,
        width: 18, height: 18, borderRadius: '50%',
        background: '#ef4444', border: '2px solid #1a1208',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 9, fontWeight: 700, color: '#fff',
        fontFamily: "'DM Sans',sans-serif",
      }}>
        {missing.length}
      </div>
    </button>
  );
}

/* ── All done toast ─────────────────────────────────────── */
function AllDoneToast() {
  const [visible, setVisible] = useState(true);
  useEffect(() => {
    const t = setTimeout(() => setVisible(false), 4000);
    return () => clearTimeout(t);
  }, []);
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 500,
      background: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(16,185,129,0.08))',
      border: '1px solid rgba(16,185,129,0.35)',
      borderRadius: 16, padding: '14px 18px',
      display: 'flex', alignItems: 'center', gap: 12,
      boxShadow: '0 12px 40px rgba(0,0,0,0.5)',
      animation: 'slideUpIn 0.4s cubic-bezier(.34,1.4,.64,1) both',
      maxWidth: 280,
    }}>
      <div style={{ fontSize: 24 }}>🎉</div>
      <div>
        <div style={{ fontFamily: "'Playfair Display',serif", fontSize: 13, fontWeight: 600, color: '#6ee7b7', marginBottom: 2 }}>
          Profile complete!
        </div>
        <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', fontFamily: "'Caveat',cursive", fontSize: 12 }}>
          You're in the yearbook ✦
        </div>
      </div>
    </div>
  );
}
