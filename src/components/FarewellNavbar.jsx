import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'journey',  label: 'The Journey' },
  { id: 'yearbook', label: 'Yearbook'    },
  { id: 'media',    label: 'Media'       },
  { id: 'wall',     label: 'The Wall'    },
  { id: 'vaults',   label: 'Vaults'      },
];

export default function FarewellNavbar({ page, onNavigate, sessionStudent, onLogout }) {
  const { activeVaultId, exitVault } = useApp();
  const [showMenu, setShowMenu]     = useState(false);
  const [showMobile, setShowMobile] = useState(false);
  const [isMobile, setIsMobile]     = useState(window.innerWidth < 680);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 680);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Close mobile drawer on navigate
  const handleNav = (id) => {
    onNavigate(id);
    if (activeVaultId) exitVault();
    setShowMobile(false);
  };

  return (
    <>
      <nav
        className="farewell-nav slide-down"
        style={{
          position: 'sticky', top: 12, zIndex: 200,
          margin: '12px clamp(10px,3vw,20px) 0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '9px clamp(12px,3vw,16px) 9px clamp(14px,3vw,20px)',
          borderRadius: 100,
        }}
      >
        {/* ── Logo ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexShrink: 0 }}>
          <div style={{ position: 'relative', width: 26, height: 26 }}>
            <div style={{
              position: 'absolute', inset: 0, borderRadius: '50%',
              border: '1px solid rgba(201,136,58,0.38)',
              animation: 'lockRing 4s ease-in-out infinite',
            }} />
            <div style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%,-50%)',
              width: 8, height: 8, borderRadius: '50%',
              background: 'linear-gradient(135deg,#c9883a,#f5c87a)',
              boxShadow: '0 0 7px rgba(201,136,58,0.5)',
            }} />
          </div>
          <div>
            <div style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 'clamp(13px,2.5vw,15px)', fontWeight: 700, lineHeight: 1,
            }}>
              <span style={{
                background: 'linear-gradient(135deg,#c9883a,#e8a84c)',
                WebkitBackgroundClip: 'text', backgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}>Class</span>
              <span style={{ color: 'rgba(240,234,216,0.85)' }}>Vault</span>
            </div>
            {!isMobile && (
              <div style={{
                fontSize: 8, color: 'rgba(201,136,58,0.48)',
                letterSpacing: 2, fontWeight: 500, marginTop: 1,
                fontFamily: "'Caveat',cursive",
              }}>BATCH 2022–26</div>
            )}
          </div>
        </div>

        {/* ── Desktop nav links ── */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 2 }}>
            {NAV_ITEMS.map(item => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{
                    padding: '7px 14px', borderRadius: 100,
                    fontSize: 12.5, fontWeight: active ? 500 : 400,
                    border: active ? '1px solid rgba(201,136,58,0.26)' : '1px solid transparent',
                    cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                    background: active ? 'rgba(201,136,58,0.1)' : 'transparent',
                    color: active ? '#e8a84c' : 'rgba(240,234,216,0.4)',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.color='rgba(240,234,216,0.8)'; e.currentTarget.style.background='rgba(255,255,255,0.05)'; }}}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.color='rgba(240,234,216,0.4)'; e.currentTarget.style.background='transparent'; }}}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Right side: user + hamburger ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {/* User avatar pill (desktop) */}
          {sessionStudent && !isMobile && (
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowMenu(v => !v)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  background: showMenu ? 'rgba(201,136,58,0.12)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${showMenu ? 'rgba(201,136,58,0.26)' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 100, padding: '5px 10px 5px 5px',
                  cursor: 'pointer', transition: 'all 0.2s',
                }}
              >
                <div style={{
                  width: 26, height: 26, borderRadius: '50%',
                  background: sessionStudent.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 9, fontWeight: 700, color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.18)',
                }}>{sessionStudent.initials}</div>
                <span style={{ fontSize: 12, fontWeight: 500, color: 'rgba(240,234,216,0.7)', maxWidth: 80, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {sessionStudent.name.split(' ')[0]}
                </span>
                <span style={{ fontSize: 8, color: 'rgba(255,255,255,0.26)', display: 'inline-block', transition: 'transform 0.2s', transform: showMenu ? 'rotate(180deg)' : 'none' }}>▾</span>
              </button>

              {showMenu && (
                <div className="scale-in" style={{
                  position: 'absolute', right: 0, top: 'calc(100% + 10px)',
                  background: 'rgba(14,11,7,0.97)',
                  border: '1px solid rgba(201,136,58,0.16)',
                  borderRadius: 14, padding: 8, minWidth: 172,
                  boxShadow: '0 12px 48px rgba(0,0,0,0.6)',
                  zIndex: 300,
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.05)', marginBottom: 5 }}>
                    <div style={{ fontSize: 9, color: 'rgba(201,136,58,0.48)', letterSpacing: 1.5, fontFamily: "'Caveat',cursive", textTransform: 'uppercase', marginBottom: 3 }}>Signed in as</div>
                    <div style={{ fontSize: 12, color: '#f0ead8', fontWeight: 500 }}>{sessionStudent.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.26)', marginTop: 1 }}>{sessionStudent.roll}</div>
                  </div>
                  <button
                    onClick={() => { setShowMenu(false); onLogout(); }}
                    style={{
                      width: '100%', padding: '8px 12px', textAlign: 'left',
                      background: 'transparent', border: 'none',
                      color: 'rgba(251,113,133,0.75)', fontSize: 12,
                      cursor: 'pointer', borderRadius: 8,
                      fontFamily: "'DM Sans',sans-serif",
                      display: 'flex', alignItems: 'center', gap: 7,
                      transition: 'background 0.15s',
                    }}
                    onMouseOver={e => { e.currentTarget.style.background='rgba(251,113,133,0.08)'; e.currentTarget.style.color='#fb7185'; }}
                    onMouseOut={e => { e.currentTarget.style.background='transparent'; e.currentTarget.style.color='rgba(251,113,133,0.75)'; }}
                  >
                    🔒 Lock & sign out
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Hamburger (mobile only) */}
          {isMobile && (
            <button
              onClick={() => setShowMobile(v => !v)}
              style={{
                width: 36, height: 36, borderRadius: '50%',
                background: showMobile ? 'rgba(201,136,58,0.15)' : 'rgba(255,255,255,0.06)',
                border: `1px solid ${showMobile ? 'rgba(201,136,58,0.3)' : 'rgba(255,255,255,0.1)'}`,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center', gap: 4,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
            >
              {[0, 1, 2].map(i => (
                <span key={i} style={{
                  width: 14, height: 1.5, background: showMobile ? '#e8a84c' : 'rgba(240,234,216,0.65)',
                  borderRadius: 2, transition: 'all 0.2s',
                  transform: showMobile
                    ? i === 0 ? 'translateY(5.5px) rotate(45deg)' : i === 2 ? 'translateY(-5.5px) rotate(-45deg)' : 'scaleX(0)'
                    : 'none',
                  opacity: showMobile && i === 1 ? 0 : 1,
                }} />
              ))}
            </button>
          )}
        </div>
      </nav>

      {/* ── Mobile Drawer ── */}
      {isMobile && showMobile && (
        <div
          className="scale-in"
          style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(14,11,7,0.96)',
            backdropFilter: 'blur(20px)',
            zIndex: 190,
            display: 'flex', flexDirection: 'column',
            padding: '90px 24px 40px',
          }}
        >
          {/* Nav items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
            {NAV_ITEMS.map((item, i) => {
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNav(item.id)}
                  style={{
                    padding: '16px 20px',
                    borderRadius: 14,
                    fontSize: 18,
                    fontFamily: "'Playfair Display',serif",
                    fontWeight: active ? 600 : 400,
                    border: active ? '1px solid rgba(201,136,58,0.25)' : '1px solid transparent',
                    background: active ? 'rgba(201,136,58,0.1)' : 'transparent',
                    color: active ? '#e8a84c' : 'rgba(240,234,216,0.55)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s',
                    animation: `fadeSlideIn 0.35s ${i * 0.06}s cubic-bezier(.22,1,.36,1) both`,
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* User section at bottom of drawer */}
          {sessionStudent && (
            <div style={{
              borderTop: '1px solid rgba(255,255,255,0.06)',
              paddingTop: 20, marginTop: 20,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
                <div style={{
                  width: 40, height: 40, borderRadius: '50%',
                  background: sessionStudent.gradient,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12, fontWeight: 700, color: '#fff',
                  border: '2px solid rgba(255,255,255,0.15)',
                }}>{sessionStudent.initials}</div>
                <div>
                  <div style={{ fontSize: 14, color: '#f0ead8', fontWeight: 500 }}>{sessionStudent.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', marginTop: 2 }}>{sessionStudent.roll}</div>
                </div>
              </div>
              <button
                onClick={() => { setShowMobile(false); onLogout(); }}
                style={{
                  width: '100%', padding: '12px 16px',
                  background: 'rgba(251,113,133,0.08)',
                  border: '1px solid rgba(251,113,133,0.2)',
                  color: '#fb7185', fontSize: 14, fontWeight: 500,
                  borderRadius: 12, cursor: 'pointer',
                  fontFamily: "'DM Sans',sans-serif",
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}
              >
                🔒 Lock & sign out
              </button>
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity:0; transform:translateX(-16px); }
          to   { opacity:1; transform:translateX(0); }
        }
      `}</style>
    </>
  );
}
