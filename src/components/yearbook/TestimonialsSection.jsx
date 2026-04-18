import React, { useState } from 'react';
import { useYearbook } from '../../context/YearbookContext';

export default function TestimonialsSection({ student, tv }) {
  const { testimonials, addTestimonial, deleteTestimonial, sessionId, sessionStudent, isAdmin, useLocalMode } = useYearbook();
  const [message, setMessage] = useState('');
  const [anon, setAnon]       = useState(false);
  const [done, setDone]       = useState(false);
  const [error, setError]     = useState('');

  // ✅ Filter testimonials for this student only
  const mine = testimonials.filter(p => p.toId === student.id);

  const handleSubmit = async () => {
    if (!message.trim() || !sessionId) return;
    try {
      // ✅ addTestimonial(toId, from, message)
      await addTestimonial(
        student.id,
        anon ? 'Anonymous' : (sessionStudent?.name || 'Anonymous'),
        message.trim()
      );
      setMessage('');
      setDone(true);
      setError('');
      setTimeout(() => setDone(false), 3000);
    } catch (err) {
      setError(err.message || 'Failed to send message.');
      console.error('Message submit failed:', err);
    }
  };

  return (
    <div style={{ paddingBottom: 24 }}>
      {/* Compose */}
      <div style={{ background: tv.sectionBg, border: `1px solid ${tv.sectionBorder}`, borderRadius: 18, padding: '18px 20px', marginBottom: 24 }}>
        <div style={{ fontSize: 13, ...tv.heading, fontWeight: 600, marginBottom: 14, opacity: 0.85 }}>
          Leave a message for {student.name.split(' ')[0]} 💬
        </div>

        {!sessionId && (
          <p style={{ fontSize: 13, ...tv.muted, fontStyle: 'italic', marginBottom: 12 }}>
            🔒 Sign in to a profile to leave a message.
          </p>
        )}

        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          placeholder={sessionId ? `What do you want to say to ${student.name.split(' ')[0]}?` : 'Sign in first…'}
          rows={3}
          disabled={!sessionId}
          style={{
            width: '100%', padding: '11px 14px', borderRadius: 12, resize: 'vertical',
            background: tv.inputBg, border: `1.5px solid ${tv.inputBorder}`,
            color: tv.inputText || tv.text, fontSize: 13, fontFamily: "'DM Sans',sans-serif",
            outline: 'none', lineHeight: 1.65, marginBottom: 12, boxSizing: 'border-box',
            opacity: sessionId ? 1 : 0.5,
          }}
        />

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, ...tv.muted, cursor: 'pointer' }}>
            <div
              onClick={() => setAnon(v => !v)}
              style={{ width: 34, height: 18, borderRadius: 100, position: 'relative', background: anon ? '#7c3aed' : tv.inputBorder, transition: 'background 0.2s', cursor: 'pointer' }}
            >
              <div style={{ position: 'absolute', top: 2, left: anon ? 17 : 2, width: 14, height: 14, borderRadius: '50%', background: '#fff', transition: 'left 0.2s' }} />
            </div>
            Post anonymously
          </label>

          <button
            onClick={handleSubmit}
            disabled={!message.trim() || !sessionId}
            style={{
              padding: '10px 22px', borderRadius: 100, fontSize: 13, fontWeight: 600,
              background: (message.trim() && sessionId) ? 'linear-gradient(135deg,#7c3aed,#4338ca)' : tv.inputBg,
              color: (message.trim() && sessionId) ? '#fff' : tv.muted.color,
              border: 'none', cursor: (message.trim() && sessionId) ? 'pointer' : 'not-allowed',
              fontFamily: "'DM Sans',sans-serif", transition: 'all 0.2s',
            }}
          >
            {done ? '✓ Sent!' : 'Post Message →'}
          </button>
        </div>

        {error && <p style={{ color: '#fb7185', fontSize: 13, marginTop: 10 }}>{error}</p>}
        {useLocalMode && (
          <p style={{ color: '#facc15', fontSize: 13, marginTop: 10 }}>
            ⚠ Demo mode is active. Messages are not permanently stored until Firestore is connected.
          </p>
        )}
      </div>

      {/* Messages list */}
      {mine.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '32px 0', ...tv.muted, fontSize: 14, fontStyle: 'italic' }}>
          No messages yet. Be the first to leave one! 💌
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {mine.map(p => {
            const createdAt = p.createdAt?.toDate ? p.createdAt.toDate() : new Date(p.createdAt || Date.now());
            return (
              <div key={p.id} style={{ background: tv.sectionBg, border: `1px solid ${tv.sectionBorder}`, borderRadius: 16, padding: '14px 18px', position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: `hsl(${(p.id.charCodeAt(0) % 360)}, 60%, 55%)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700, color: '#fff', flexShrink: 0,
                  }}>
                    {p.from === 'Anonymous' ? '?' : p.from[0].toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, ...tv.heading, opacity: 0.9 }}>{p.from}</div>
                    <div style={{ fontSize: 10, ...tv.muted }}>{createdAt.toLocaleDateString()}</div>
                  </div>
                  {/* ✅ Profile owner (student.id === sessionId) OR admin can delete */}
                  {(isAdmin || student.id === sessionId) && (
                    <button
                      onClick={() => deleteTestimonial(p.id)}
                      style={{
                        marginLeft: 'auto', width: 24, height: 24, borderRadius: '50%',
                        background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)',
                        color: '#ef4444', fontSize: 11, cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >✕</button>
                  )}
                </div>
                <p style={{ fontSize: 14, ...tv.heading, opacity: 0.82, lineHeight: 1.7, margin: 0 }}>{p.message}</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}