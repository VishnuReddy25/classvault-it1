import React, { useState, useEffect, useRef, useCallback } from 'react';
import { MEMORY_GRADIENTS } from '../data/sampleData';

export default function StoryMode({ memories, onClose }) {
  const [idx, setIdx]         = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const timerRef  = useRef(null);
  const progRef   = useRef(null);
  const DURATION  = 3500; // ms per slide

  const current = memories[idx];

  const goNext = useCallback(() => {
    setProgress(0);
    setIdx(i => {
      if (i < memories.length - 1) return i + 1;
      setPlaying(false);
      return i;
    });
  }, [memories.length]);

  const goPrev = () => {
    setProgress(0);
    setIdx(i => Math.max(0, i - 1));
    setPlaying(true);
  };

  // Progress bar ticker
  useEffect(() => {
    if (!playing) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const pct = Math.min(100, (elapsed / DURATION) * 100);
      setProgress(pct);
      if (pct < 100) {
        progRef.current = requestAnimationFrame(tick);
      } else {
        goNext();
      }
    };
    progRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(progRef.current);
  }, [playing, idx, goNext]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'ArrowRight') goNext();
      if (e.key === 'ArrowLeft')  goPrev();
      if (e.key === 'Escape')     onClose();
      if (e.key === ' ')          setPlaying(p => !p);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [goNext, onClose]);

  if (!current) return null;

  const imgSrc = current.photoUrl || current.dataUrl;
  const grad = imgSrc ? null : MEMORY_GRADIENTS[idx % MEMORY_GRADIENTS.length];

  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 300,
        background: '#070510',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      {/* Progress bars */}
      <div style={{
        position: 'absolute', top: 20, left: 20, right: 20,
        display: 'flex', gap: 5, zIndex: 10,
      }}>
        {memories.map((_, i) => (
          <div key={i} className="story-bar-bg" style={{ flex: 1 }}>
            <div
              className="story-bar-fill progress-fill"
              style={{
                width: i < idx ? '100%' : i === idx ? `${progress}%` : '0%',
              }}
            />
          </div>
        ))}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 44, right: 20, zIndex: 10,
          width: 38, height: 38, borderRadius: '50%',
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff', fontSize: 16, cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'background 0.2s',
          fontFamily: 'sans-serif',
        }}
        onMouseEnter={e => e.currentTarget.style.background='rgba(255,255,255,0.22)'}
        onMouseLeave={e => e.currentTarget.style.background='rgba(255,255,255,0.12)'}
      >
        ✕
      </button>

      {/* Slide */}
      <div
        key={idx}
        className="story-slide-enter"
        style={{ textAlign: 'center', padding: '0 20px', maxWidth: 640, width: '100%' }}
      >
        {/* Image / emoji */}
        {imgSrc ? (
          <img
            src={imgSrc}
            alt={current.caption}
            style={{
              width: '100%', maxHeight: '62vh', objectFit: 'contain',
              borderRadius: 20, marginBottom: 24,
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
            }}
          />
        ) : (
          <div style={{
            height: '52vh', borderRadius: 20, marginBottom: 24,
            background: grad,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 100,
            boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          }}>
            {current.emoji}
          </div>
        )}

        <div style={{
          fontFamily: "'Fraunces',serif",
          fontSize: 22, fontStyle: 'italic', fontWeight: 300,
          color: 'rgba(255,255,255,0.9)', marginBottom: 8, lineHeight: 1.4,
        }}>
          "{current.caption}"
        </div>
        <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.4)', letterSpacing: 0.3 }}>
          📸 {current.uploader} · {current.date}
        </div>

        {/* Slide counter */}
        <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', marginTop: 10 }}>
          {idx + 1} / {memories.length}
        </div>
      </div>

      {/* Controls */}
      <div style={{
        position: 'absolute', bottom: 32,
        display: 'flex', gap: 12, alignItems: 'center',
      }}>
        <StoryBtn onClick={goPrev}>← Prev</StoryBtn>
        <StoryBtn
          onClick={() => setPlaying(p => !p)}
          primary
        >
          {playing ? '⏸ Pause' : '▶ Play'}
        </StoryBtn>
        <StoryBtn onClick={goNext}>Next →</StoryBtn>
      </div>
    </div>
  );
}

function StoryBtn({ children, onClick, primary }) {
  return (
    <button
      onClick={onClick}
      style={{
        background: primary
          ? 'linear-gradient(135deg,#6c47ff,#3b82f6)'
          : 'rgba(255,255,255,0.1)',
        border: primary ? 'none' : '1px solid rgba(255,255,255,0.18)',
        color: '#fff', padding: '10px 24px', borderRadius: 100,
        fontSize: 14, fontWeight: 500, cursor: 'pointer',
        fontFamily: "'DM Sans',sans-serif",
        boxShadow: primary ? '0 4px 20px rgba(108,71,255,0.4)' : 'none',
        transition: 'all 0.2s',
      }}
      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.05)'}
      onMouseLeave={e => e.currentTarget.style.transform = ''}
    >
      {children}
    </button>
  );
}