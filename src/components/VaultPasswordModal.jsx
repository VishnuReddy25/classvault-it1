import React, { useState, useRef, useEffect } from 'react';
import { simpleHash } from '../utils/helpers';

export default function VaultPasswordModal({ vault, onSuccess, onClose }) {
  const [input, setInput]   = useState('');
  const [error, setError]   = useState('');
  const [shake, setShake]   = useState(false);
  const [show,  setShow]    = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 80);
  }, []);

  const attempt = () => {
    if (!input.trim()) { setError('Enter the password.'); return; }
    const correct = simpleHash(input.trim()) === vault.passwordHash;
    if (correct) {
      setError('');
      onSuccess();
    } else {
      setError('Wrong password. Try again.');
      setInput('');
      setShake(true);
      setTimeout(() => setShake(false), 600);
    }
  };

  return (
    <>
      {/* ── Backdrop ── */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 900,
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
        }}
      />

      {/* ── Centered wrapper — this is the real centering layer ── */}
      <div
        style={{
          position: 'fixed',
          top: 0, left: 0, right: 0, bottom: 0,
          zIndex: 901,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          pointerEvents: 'none', /* clicks pass through to backdrop */
        }}
      >
        {/* ── Modal box ── */}
        <div
          className="scale-in"
          style={{
            pointerEvents: 'all', /* re-enable clicks on the modal itself */
            width: '100%',
            maxWidth: 420,
            background: 'linear-gradient(145deg, #1a1208 0%, #120e08 100%)',
            border: '1px solid rgba(201,136,58,0.3)',
            borderRadius: 24,
            padding: '36px 32px',
            boxShadow: '0 32px 80px rgba(0,0,0,0.75), 0 0 0 1px rgba(255,255,255,0.04)',
            position: 'relative',
            animation: shake ? 'shakeModal 0.55s ease' : undefined,
          }}
        >
          {/* Amber top bar */}
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: 3,
            borderRadius: '24px 24px 0 0',
            background: 'linear-gradient(90deg,#c9883a,#e8a84c,#f5c87a)',
          }} />

          {/* Key icon */}
          <div style={{
            width: 64, height: 64, borderRadius: '50%',
            background: 'rgba(201,136,58,0.12)',
            border: '1.5px solid rgba(201,136,58,0.38)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 28, margin: '0 auto 20px',
            animation: 'lockRing 3.5s ease-in-out infinite',
          }}>🔑</div>

          {/* Vault name */}
          <div style={{ textAlign: 'center', marginBottom: 24 }}>
            <div style={{
              fontFamily: "'Playfair Display',serif",
              fontSize: 22, fontWeight: 700,
              color: '#f0ead8', marginBottom: 6, lineHeight: 1.2,
            }}>
              {vault.emoji} {vault.name}
            </div>
            <p style={{
              fontFamily: "'Caveat',cursive",
              fontSize: 16, color: 'rgba(201,136,58,0.65)',
              lineHeight: 1.6, margin: 0,
            }}>
              This vault is password protected.<br />
              Enter the password to continue.
            </p>
          </div>

          {/* Password input */}
          <div style={{ position: 'relative', marginBottom: 6 }}>
            <input
              ref={inputRef}
              type={show ? 'text' : 'password'}
              value={input}
              onChange={e => { setInput(e.target.value); setError(''); }}
              onKeyDown={e => e.key === 'Enter' && attempt()}
              placeholder="Enter vault password…"
              style={{
                width: '100%',
                padding: '13px 46px 13px 18px',
                borderRadius: 12,
                border: `1.5px solid ${error
                  ? 'rgba(239,68,68,0.55)'
                  : 'rgba(201,136,58,0.25)'}`,
                background: 'rgba(255,255,255,0.05)',
                color: '#f0ead8', fontSize: 15,
                fontFamily: "'DM Sans',sans-serif",
                outline: 'none', boxSizing: 'border-box',
                caretColor: '#c9883a',
                transition: 'border-color 0.2s, box-shadow 0.2s',
                boxShadow: error
                  ? '0 0 0 3px rgba(239,68,68,0.1)'
                  : 'none',
              }}
              onFocus={e => {
                if (!error) {
                  e.target.style.borderColor = 'rgba(201,136,58,0.6)';
                  e.target.style.boxShadow   = '0 0 0 3px rgba(201,136,58,0.1)';
                }
              }}
              onBlur={e => {
                if (!error) {
                  e.target.style.borderColor = 'rgba(201,136,58,0.25)';
                  e.target.style.boxShadow   = 'none';
                }
              }}
            />
            {/* Show/hide */}
            <button
              onClick={() => setShow(v => !v)}
              tabIndex={-1}
              style={{
                position: 'absolute', right: 14, top: '50%',
                transform: 'translateY(-50%)',
                background: 'none', border: 'none',
                color: 'rgba(255,255,255,0.35)',
                cursor: 'pointer', fontSize: 16,
                lineHeight: 1, padding: 0,
                transition: 'color 0.18s',
              }}
              onMouseOver={e => e.currentTarget.style.color = 'rgba(255,255,255,0.75)'}
              onMouseOut={e => e.currentTarget.style.color  = 'rgba(255,255,255,0.35)'}
            >
              {show ? '🙈' : '👁'}
            </button>
          </div>

          {/* Error message */}
          <div style={{
            minHeight: 24, marginBottom: 16,
            fontFamily: "'Caveat',cursive",
            fontSize: 14, color: '#fca5a5',
            paddingLeft: 4,
            display: 'flex', alignItems: 'center', gap: 5,
          }}>
            {error && <><span>⚠</span>{error}</>}
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10 }}>
            <button
              onClick={onClose}
              style={{
                flex: 1, padding: '12px', borderRadius: 100, fontSize: 14,
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                transition: 'all 0.18s',
              }}
              onMouseOver={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = '#fff'; }}
              onMouseOut={e =>  { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
            >
              Cancel
            </button>
            <button
              onClick={attempt}
              style={{
                flex: 2, padding: '12px', borderRadius: 100, fontSize: 14, fontWeight: 700,
                background: 'linear-gradient(135deg,#c9883a,#e8a84c)',
                color: '#1e160a', border: 'none',
                cursor: 'pointer', fontFamily: "'DM Sans',sans-serif",
                boxShadow: '0 6px 24px rgba(201,136,58,0.35)',
                transition: 'transform 0.18s, box-shadow 0.18s',
              }}
              onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 32px rgba(201,136,58,0.5)'; }}
              onMouseOut={e =>  { e.currentTarget.style.transform = '';               e.currentTarget.style.boxShadow = '0 6px 24px rgba(201,136,58,0.35)'; }}
            >
              Unlock Vault →
            </button>
          </div>

          <p style={{
            textAlign: 'center', marginTop: 14,
            fontFamily: "'Caveat',cursive",
            fontSize: 13, color: 'rgba(255,255,255,0.22)',
          }}>
            Ask the vault creator for the password
          </p>
        </div>
      </div>

      <style>{`
        @keyframes shakeModal {
          0%,100%{ transform:translateX(0); }
          15%    { transform:translateX(-10px); }
          30%    { transform:translateX(10px); }
          45%    { transform:translateX(-7px); }
          60%    { transform:translateX(7px); }
          75%    { transform:translateX(-4px); }
          90%    { transform:translateX(4px); }
        }
      `}</style>
    </>
  );
}
