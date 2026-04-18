import { useYearbook } from "../context/YearbookContext";
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { REACTION_KEYS, MEMORY_GRADIENTS } from '../data/sampleData';
import { getInitials, nameGradient } from '../utils/helpers';

export default function MemoryCard({ memory: m, vaultId, index = 0 }) {
  const { react, addComment, activeVault } = useApp();
  const { sessionStudent } = useYearbook();
  const userName = sessionStudent?.name || "Anonymous";
  const [expanded, setExpanded] = useState(false);
  const [comment, setComment]   = useState('');
  const locked = activeVault?.locked;

  const grad = m.dataUrl ? null : MEMORY_GRADIENTS[index % MEMORY_GRADIENTS.length];

  const handleReact = (key) => {
    if (locked) return;
    react(vaultId, m.id, key);
  };

  const handleComment = () => {
    if (!comment.trim() || locked) return;
    addComment(vaultId, m.id, {
      id: Date.now(),
      user: userName,
      text: comment.trim(),
    });
    setComment('');
  };

  return (
    <div
      className="gallery-item fade-up"
      style={{
        breakInside: 'avoid', marginBottom: 14,
        borderRadius: 18, overflow: 'hidden',
        background: '#fff',
        border: '1px solid rgba(255,255,255,0.55)',
        boxShadow: '0 2px 12px rgba(108,71,255,0.07)',
        animationDelay: `${index * 0.06}s`,
        cursor: 'pointer',
      }}
    >
      {/* Image / placeholder */}
      <div style={{ position: 'relative', overflow: 'hidden' }}>
        {m.dataUrl ? (
          <img
            src={m.dataUrl}
            alt={m.caption}
            style={{ width: '100%', display: 'block', maxHeight: 320, objectFit: 'cover' }}
          />
        ) : (
          <div style={{
            width: '100%', height: m.height || 160,
            background: grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: (m.height || 160) > 170 ? 56 : 44,
          }}>
            {m.emoji}
          </div>
        )}

        {/* Hover overlay */}
        <div
          className="gallery-overlay"
          style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(transparent 30%, rgba(13,11,24,0.75))',
            padding: 14,
            display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
          }}
        >
          <div style={{ color: '#fff', fontSize: 13, fontWeight: 500, marginBottom: 3 }}>{m.caption}</div>
          <div style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11, marginBottom: 9 }}>📸 {m.uploader}</div>

          {!locked && (
            <div style={{ display: 'flex', gap: 5 }}>
              {REACTION_KEYS.map(r => (
                <button
                  key={r.key}
                  onClick={e => { e.stopPropagation(); handleReact(r.key); }}
                  style={{
                    background: 'rgba(255,255,255,0.15)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid rgba(255,255,255,0.25)',
                    color: '#fff', fontSize: 12, padding: '3px 9px', borderRadius: 100,
                    cursor: 'pointer', transition: 'all 0.15s', fontFamily: "'DM Sans',sans-serif",
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background='rgba(255,255,255,0.28)'; e.currentTarget.style.transform='scale(1.12)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background='rgba(255,255,255,0.15)'; e.currentTarget.style.transform=''; }}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Card body */}
      <div style={{ padding: '12px 14px', background: '#fff' }}>
        <div style={{ fontSize: 13, color: '#2d2a45', marginBottom: 8, fontWeight: 500 }}>{m.caption}</div>

        {/* Reaction pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
          {REACTION_KEYS.filter(r => m.reactions[r.key] > 0).map(r => (
            <span
              key={r.key}
              className="rx-pill"
              onClick={() => handleReact(r.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 4,
                background: 'rgba(108,71,255,0.06)',
                border: '1px solid rgba(108,71,255,0.15)',
                color: '#2d2a45', fontSize: 12, padding: '3px 9px', borderRadius: 100,
                cursor: locked ? 'default' : 'pointer',
              }}
            >
              {r.emoji} {m.reactions[r.key]}
            </span>
          ))}
        </div>

        {/* Comments toggle */}
        <button
          onClick={() => setExpanded(v => !v)}
          style={{
            fontSize: 12, color: '#6c47ff', cursor: 'pointer',
            background: 'none', border: 'none', padding: 0,
            fontFamily: "'DM Sans',sans-serif", fontWeight: 500,
          }}
        >
          {expanded ? '▲ Hide' : '▼ Comments'} ({m.comments?.length || 0})
        </button>

        {/* Comments section */}
        {expanded && (
          <div className="scale-in" style={{ marginTop: 12, borderTop: '1px solid rgba(108,71,255,0.08)', paddingTop: 12 }}>
            {(m.comments || []).map((c, i) => (
              <div key={c.id || i} style={{ display:'flex', gap:8, marginBottom:10 }}>
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: nameGradient(c.user),
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 10, fontWeight: 600, color: '#fff',
                  border: '1.5px solid rgba(255,255,255,0.7)',
                }}>
                  {getInitials(c.user)}
                </div>
                <div style={{
                  background: '#f9f8ff', border: '1px solid rgba(108,71,255,0.1)',
                  padding: '8px 12px', borderRadius: '4px 14px 14px 14px', flex: 1,
                }}>
                  <div style={{ fontSize: 10, color: '#7b78a0', fontWeight: 500, marginBottom: 3, textTransform: 'uppercase', letterSpacing: 0.2 }}>{c.user}</div>
                  <div style={{ fontSize: 13, color: '#2d2a45' }}>{c.text}</div>
                </div>
              </div>
            ))}

            {!locked && (
              <div style={{ display:'flex', gap:7, marginTop:8 }}>
                <input
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleComment()}
                  placeholder="Add a comment…"
                  style={{
                    flex: 1, padding: '8px 14px', borderRadius: 100,
                    border: '1.5px solid rgba(108,71,255,0.18)',
                    fontSize: 13, fontFamily: "'DM Sans',sans-serif", color: '#0d0b18',
                    background: '#fff', outline: 'none',
                    transition: 'border-color 0.2s',
                  }}
                  onFocus={e => e.target.style.borderColor='#6c47ff'}
                  onBlur={e => e.target.style.borderColor='rgba(108,71,255,0.18)'}
                />
                <button
                  onClick={handleComment}
                  style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg,#6c47ff,#7c3aed)',
                    color: '#fff', border: 'none', fontSize: 15,
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(108,71,255,0.3)',
                    transition: 'transform 0.18s, box-shadow 0.18s',
                    fontFamily: 'sans-serif',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform='scale(1.1)'; e.currentTarget.style.boxShadow='0 4px 18px rgba(108,71,255,0.4)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform=''; e.currentTarget.style.boxShadow='0 2px 10px rgba(108,71,255,0.3)'; }}
                >
                  ↑
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
