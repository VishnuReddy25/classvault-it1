import React from 'react';

export default function LockVaultModal({ onConfirm, onClose }) {
  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(13,11,24,0.6)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      }}
    >
      <div
        className="scale-in"
        style={{
          background: '#fff', borderRadius: 28, padding: '40px 36px',
          width: '100%', maxWidth: 420, textAlign: 'center',
          boxShadow: '0 24px 80px rgba(108,71,255,0.18)',
        }}
      >
        {/* Animated lock */}
        <div
          className="lock-ring"
          style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 20px',
            background: 'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(251,191,36,0.1))',
            border: '1.5px solid rgba(245,158,11,0.35)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
          }}
        >
          🔒
        </div>

        <div style={{ fontFamily:"'Fraunces',serif", fontSize:24, fontWeight:700, color:'#0d0b18', marginBottom:12 }}>
          Lock this vault?
        </div>

        <p style={{ fontSize:14, color:'#7b78a0', lineHeight:1.65, marginBottom:28 }}>
          Once sealed, no new photos or edits are allowed.<br />
          This vault becomes a <strong style={{ color:'#92400e' }}>permanent time capsule</strong> — beautifully frozen in time.
        </p>

        <div style={{ display:'flex', gap:10, justifyContent:'center' }}>
          <button
            onClick={onClose}
            className="btn-ghost"
            style={{ padding:'12px 24px', borderRadius:100, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:"'DM Sans',sans-serif", border:'1px solid rgba(108,71,255,0.22)' }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            style={{
              padding:'12px 24px', borderRadius:100, fontSize:14, fontWeight:500, cursor:'pointer',
              fontFamily:"'DM Sans',sans-serif", border:'none',
              background:'linear-gradient(135deg,#f59e0b,#d97706)',
              color:'#fff', boxShadow:'0 4px 18px rgba(245,158,11,0.35)',
              transition:'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.transform='translateY(-2px)'; e.currentTarget.style.boxShadow='0 8px 28px rgba(245,158,11,0.45)'; }}
            onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 4px 18px rgba(245,158,11,0.35)'; }}
          >
            🔒 Seal the vault
          </button>
        </div>
      </div>
    </div>
  );
}
