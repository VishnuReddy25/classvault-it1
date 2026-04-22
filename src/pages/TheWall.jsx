import React, { useState, useEffect, useRef } from 'react';
import { useYearbook } from '../context/YearbookContext';

/* ── helpers ─────────────────────────────────────────────── */
function timeAgo(val) {
  const date = val?.toDate ? val.toDate() : new Date(val || Date.now());
  const diff = Date.now() - date.getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  return Math.floor(h / 24) + 'd ago';
}

/* deterministic tilt per post id — avoids re-random on re-render */
function tilt(id) {
  let h = 0;
  for (let i = 0; i < (id || '').length; i++) h = (Math.imul(31, h) + id.charCodeAt(i)) | 0;
  return ((h % 7) - 3) * 0.9; // -2.7° to +2.7°
}

/* chalk colour families — all soft, desaturated */
const CHALK_COLORS = [
  { text: 'rgba(240,230,210,0.90)', glow: 'rgba(240,230,210,0.08)' }, // white chalk
  { text: 'rgba(180,220,195,0.85)', glow: 'rgba(180,220,195,0.07)' }, // sage
  { text: 'rgba(220,200,170,0.85)', glow: 'rgba(220,200,170,0.07)' }, // warm tan
  { text: 'rgba(200,185,230,0.85)', glow: 'rgba(200,185,230,0.07)' }, // lavender
  { text: 'rgba(230,200,175,0.85)', glow: 'rgba(230,200,175,0.07)' }, // peach
  { text: 'rgba(175,215,225,0.82)', glow: 'rgba(175,215,225,0.07)' }, // sky
];

function chalkColor(id) {
  let h = 0;
  for (let i = 0; i < (id || '').length; i++) h = (Math.imul(17, h) + id.charCodeAt(i)) | 0;
  return CHALK_COLORS[Math.abs(h) % CHALK_COLORS.length];
}

/* ── SVG chalk-texture filter id ────────────────────────── */
const FILTER_ID = 'chalk-rough';

/* ── ChalkPost card ──────────────────────────────────────── */
function ChalkPost({ post, canDelete, onDelete }) {
  const [hov, setHov] = useState(false);
  const [delConfirm, setDelConfirm] = useState(false);
  const deg  = tilt(post.id);
  const col  = chalkColor(post.id);
  const init = post.anonymous ? '?' : (post.name?.[0] || '?');

  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setDelConfirm(false); }}
      style={{
        breakInside: 'avoid',
        marginBottom: 24,
        position: 'relative',
        transform: `rotate(${hov ? 0 : deg}deg)`,
        transition: 'transform 0.4s cubic-bezier(.34,1.3,.64,1), box-shadow 0.3s ease',
        boxShadow: hov
          ? '0 20px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.06)'
          : '0 4px 18px rgba(0,0,0,0.45)',
        borderRadius: 3,
        cursor: 'default',
      }}
    >
      {/* Chalkboard card surface */}
      <div style={{
        background: 'linear-gradient(145deg, #243b2e 0%, #1e3228 50%, #1a2c24 100%)',
        borderRadius: 3,
        padding: 'clamp(18px,3vw,26px) clamp(16px,3vw,24px)',
        border: '1px solid rgba(255,255,255,0.06)',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {/* Smudge / erased area behind text — SVG blur overlay */}
        <div style={{
          position: 'absolute',
          inset: 0,
          background: col.glow,
          filter: 'blur(18px)',
          borderRadius: 3,
          pointerEvents: 'none',
          opacity: hov ? 0.9 : 0.55,
          transition: 'opacity 0.3s',
        }} />

        {/* Chalk line-ruled subtle lines */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 28px, rgba(255,255,255,0.025) 28px, rgba(255,255,255,0.025) 29px)',
          pointerEvents: 'none', borderRadius: 3,
        }} />

        {/* Chalk-dusty edge vignette */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.35) 100%)',
          pointerEvents: 'none', borderRadius: 3,
        }} />

        {/* Delete button */}
        {canDelete && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!delConfirm) { setDelConfirm(true); return; }
              onDelete(post.id);
            }}
            style={{
              position: 'absolute', top: 10, right: 10,
              background: delConfirm ? 'rgba(239,68,68,0.25)' : 'rgba(255,255,255,0.07)',
              border: '1px solid ' + (delConfirm ? 'rgba(239,68,68,0.5)' : 'rgba(255,255,255,0.12)'),
              color: delConfirm ? '#fca5a5' : 'rgba(255,255,255,0.35)',
              fontSize: 10, fontWeight: 600,
              padding: '3px 9px', borderRadius: 100,
              cursor: 'pointer', transition: 'all 0.18s',
              fontFamily: "'DM Sans',sans-serif", zIndex: 2,
            }}
          >
            {delConfirm ? 'confirm' : '✕'}
          </button>
        )}

        {/* Message — chalk handwritten style */}
        <p style={{
          position: 'relative', zIndex: 1,
          fontFamily: "'Caveat', cursive",
          fontSize: 'clamp(17px,2.5vw,21px)',
          color: col.text,
          lineHeight: 1.7,
          letterSpacing: '0.3px',
          margin: 0,
          marginBottom: 16,
          /* Chalk texture: slightly ragged shadow */
          textShadow: '1px 1px 0 rgba(0,0,0,0.4), -0.5px -0.5px 0 rgba(255,255,255,0.06)',
          filter: 'url(#' + FILTER_ID + ')',
          wordBreak: 'break-word',
          paddingRight: canDelete ? 40 : 0,
        }}>
          {post.message}
        </p>

        {/* Footer: avatar + name + time */}
        <div style={{
          position: 'relative', zIndex: 1,
          display: 'flex', alignItems: 'center', gap: 10,
          borderTop: '1px solid rgba(255,255,255,0.07)',
          paddingTop: 12,
        }}>
          {/* Chalk-circle avatar */}
          <div style={{
            width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            border: '1.5px solid ' + col.text.replace('0.90', '0.4').replace('0.85', '0.35').replace('0.82', '0.32'),
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontFamily: "'Caveat',cursive", fontSize: 13, fontWeight: 700,
            color: col.text,
            background: 'rgba(255,255,255,0.04)',
          }}>
            {init}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontFamily: "'Caveat',cursive",
              fontSize: 14, color: col.text,
              opacity: 0.75, lineHeight: 1.2,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>
              {post.anonymous ? 'Anonymous' : (post.name || 'Unknown')}
            </div>
            <div style={{
              fontFamily: "'Caveat',cursive",
              fontSize: 11, color: 'rgba(255,255,255,0.28)',
            }}>
              {timeAgo(post.createdAt)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Compose box — styled as a chalk input area ─────────── */
function ChalkCompose({ sessionId, sessionStudent, onSubmit }) {
  const [message, setMessage]   = useState('');
  const [anon, setAnon]         = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]       = useState('');
  const [focused, setFocused]   = useState(false);
  const taRef = useRef(null);

  const submit = async () => {
    if (!message.trim()) { setError('Write something first!'); return; }
    try {
      await onSubmit(message.trim(), anon);
      setMessage('');
      setSubmitted(true);
      setError('');
      setTimeout(() => setSubmitted(false), 2800);
    } catch (err) {
      setError('Failed to post: ' + (err.message || 'Check your connection.'));
    }
  };

  return (
    <div style={{
      maxWidth: 580, margin: '0 auto 56px',
      background: 'linear-gradient(145deg, #243b2e 0%, #1e3228 100%)',
      border: '1px solid ' + (focused ? 'rgba(201,136,58,0.4)' : 'rgba(255,255,255,0.08)'),
      borderRadius: 4,
      padding: 'clamp(20px,4vw,28px)',
      boxShadow: focused
        ? '0 0 0 3px rgba(201,136,58,0.1), 0 12px 40px rgba(0,0,0,0.5)'
        : '0 8px 32px rgba(0,0,0,0.4)',
      transition: 'border-color 0.25s, box-shadow 0.25s',
      position: 'relative', overflow: 'hidden',
    }}>

      {/* Ruled lines */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'repeating-linear-gradient(180deg, transparent, transparent 32px, rgba(255,255,255,0.03) 32px, rgba(255,255,255,0.03) 33px)',
        pointerEvents: 'none',
      }} />

      {/* "Write here" label */}
      <div style={{
        fontFamily: "'Caveat',cursive",
        fontSize: 11, letterSpacing: 3,
        color: 'rgba(201,136,58,0.45)',
        textTransform: 'uppercase',
        marginBottom: 12,
        position: 'relative',
      }}>
        ✦ &nbsp; Leave your mark on the board &nbsp; ✦
      </div>

      <textarea
        ref={taRef}
        rows={4}
        placeholder={sessionId ? 'Write your message to the batch…' : 'Sign in to leave a message'}
        value={message}
        disabled={!sessionId}
        onChange={e => { setMessage(e.target.value); setError(''); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: "'Caveat',cursive",
          fontSize: 'clamp(18px,3vw,22px)',
          color: 'rgba(240,230,210,0.88)',
          lineHeight: 1.75,
          letterSpacing: '0.3px',
          boxSizing: 'border-box',
          opacity: sessionId ? 1 : 0.4,
          position: 'relative', zIndex: 1,
          caretColor: '#c9883a',
          textShadow: '1px 1px 0 rgba(0,0,0,0.3)',
        }}
      />

      {/* Bottom bar */}
      <div style={{
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', flexWrap: 'wrap', gap: 10,
        marginTop: 12, paddingTop: 12,
        borderTop: '1px solid rgba(255,255,255,0.06)',
        position: 'relative', zIndex: 1,
      }}>
        <label style={{
          display: 'flex', alignItems: 'center', gap: 7,
          cursor: 'pointer', fontFamily: "'Caveat',cursive",
          fontSize: 15, color: 'rgba(240,230,210,0.5)',
        }}>
          <input
            type="checkbox"
            checked={anon}
            onChange={e => setAnon(e.target.checked)}
            style={{ accentColor: '#c9883a', width: 14, height: 14 }}
          />
          Post anonymously
        </label>

        <button
          onClick={submit}
          disabled={!sessionId}
          style={{
            padding: '9px 22px', borderRadius: 100,
            fontSize: 13, fontWeight: 700,
            background: submitted
              ? 'rgba(16,185,129,0.2)'
              : 'linear-gradient(135deg,#c9883a,#e8a84c)',
            color: submitted ? '#6ee7b7' : '#1e160a',
            border: submitted ? '1px solid rgba(16,185,129,0.4)' : 'none',
            cursor: sessionId ? 'pointer' : 'not-allowed',
            opacity: sessionId ? 1 : 0.4,
            fontFamily: "'DM Sans',sans-serif",
            transition: 'all 0.25s',
            boxShadow: submitted ? 'none' : '0 4px 16px rgba(201,136,58,0.35)',
          }}
        >
          {submitted ? '✓ Chalked up!' : 'Post to The Wall'}
        </button>
      </div>

      {error && (
        <p style={{
          color: '#fca5a5', fontSize: 12, marginTop: 8,
          fontFamily: "'Caveat',cursive", position: 'relative', zIndex: 1,
        }}>
          ⚠ {error}
        </p>
      )}
      {!sessionId && (
        <p style={{
          color: 'rgba(240,230,210,0.28)', fontSize: 12,
          marginTop: 8, textAlign: 'center',
          fontFamily: "'Caveat',cursive", position: 'relative', zIndex: 1,
        }}>
          🔒 Sign in to post
        </p>
      )}
    </div>
  );
}

/* ── Main page ───────────────────────────────────────────── */
export default function TheWall() {
  const {
    wallPosts, addWallPost, deleteWallPost,
    sessionId, sessionStudent, isAdmin, useLocalMode,
  } = useYearbook();

  const handleSubmit = (message, anonymous) => {
    const name = anonymous ? '' : (sessionStudent?.name || '');
    return addWallPost(sessionId, name, message, anonymous);
  };

  return (
    <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh' }}>

      {/* Hidden SVG filter for chalk texture on text */}
      <svg width="0" height="0" style={{ position: 'absolute' }}>
        <defs>
          <filter id={FILTER_ID} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65 0.45"
              numOctaves="2"
              seed="8"
              result="noise"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="1.2"
              xChannelSelector="R"
              yChannelSelector="G"
            />
          </filter>
        </defs>
      </svg>

      {/* Chalkboard room background overlay for this page */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 100% 80% at 50% 0%, rgba(30,50,38,0.35) 0%, transparent 65%)',
      }} />

      <div style={{ maxWidth: 1060, margin: '0 auto', padding: 'clamp(28px,5vh,44px) clamp(16px,4vw,24px) 80px', position: 'relative', zIndex: 1 }}>

        {/* ── Header ── */}
        <div className="fade-up" style={{ textAlign: 'center', marginBottom: 52 }}>
          {/* Decorative chalk tray line */}
          <div style={{
            width: 'min(480px,90vw)', height: 6,
            margin: '0 auto 28px',
            background: 'linear-gradient(90deg, transparent, rgba(42,61,50,0.8) 20%, rgba(42,61,50,0.9) 50%, rgba(42,61,50,0.8) 80%, transparent)',
            borderRadius: 2,
            boxShadow: '0 2px 0 rgba(0,0,0,0.3)',
          }} />

          <div style={{
            fontFamily: "'Caveat',cursive",
            fontSize: 13, letterSpacing: 4,
            color: 'rgba(201,136,58,0.6)',
            textTransform: 'uppercase', marginBottom: 14,
          }}>
            ✦ &nbsp; Speak your heart &nbsp; ✦
          </div>

          <h1 style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 'clamp(30px,6vw,54px)',
            fontWeight: 700, color: '#f0ead8',
            lineHeight: 1.1, marginBottom: 14,
          }}>
            The Wall
          </h1>

          <p style={{
            fontFamily: "'Caveat',cursive",
            fontSize: 'clamp(15px,2.5vw,18px)',
            color: 'rgba(240,234,216,0.45)',
            lineHeight: 1.7, maxWidth: 440, margin: '0 auto',
          }}>
            Leave a message for your batchmates. Anonymous or signed — it lives here forever.
          </p>

          {/* Chalk rule */}
          <div style={{
            width: 'min(480px,90vw)', height: 1,
            margin: '24px auto 0',
            background: 'linear-gradient(90deg, transparent, rgba(240,234,216,0.15), transparent)',
          }} />
        </div>

        {/* Demo mode banner */}
        {useLocalMode && (
          <div style={{
            background: 'rgba(201,136,58,0.08)', border: '1px solid rgba(201,136,58,0.22)',
            borderRadius: 8, padding: '14px 18px', marginBottom: 32,
            textAlign: 'center', maxWidth: 540, marginLeft: 'auto', marginRight: 'auto',
          }}>
            <div style={{ fontFamily: "'Caveat',cursive", color: '#e8a84c', fontSize: 15, marginBottom: 4 }}>
              ⚠ Demo mode — messages are temporary
            </div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>
              Connect Firestore to save messages permanently.
            </div>
          </div>
        )}

        {/* ── Compose ── */}
        <ChalkCompose
          sessionId={sessionId}
          sessionStudent={sessionStudent}
          onSubmit={handleSubmit}
        />

        {/* ── Posts ── */}
        {wallPosts.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 20px' }}>
            {/* Empty chalkboard */}
            <div style={{
              width: 'min(400px,90vw)', margin: '0 auto 24px',
              background: 'linear-gradient(145deg,#243b2e,#1a2c24)',
              border: '1px solid rgba(255,255,255,0.06)',
              borderRadius: 4,
              padding: '36px 28px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}>
              <div style={{
                fontFamily: "'Caveat',cursive",
                fontSize: 22, color: 'rgba(240,230,210,0.3)',
                lineHeight: 1.6,
              }}>
                The board is empty...<br />
                <span style={{ fontSize: 16, opacity: 0.7 }}>Be the first to leave a mark</span>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div style={{
              fontFamily: "'Caveat',cursive",
              fontSize: 12, letterSpacing: 3,
              color: 'rgba(201,136,58,0.4)',
              textTransform: 'uppercase',
              textAlign: 'center',
              marginBottom: 28,
            }}>
              {wallPosts.length} {wallPosts.length === 1 ? 'message' : 'messages'} on the board
            </div>

            {/* Masonry columns */}
            <div style={{ columns: 'auto 300px', columnGap: 20 }}>
              {wallPosts.map(post => (
                <ChalkPost
                  key={post.id}
                  post={post}
                  canDelete={isAdmin || post.studentId === sessionId}
                  onDelete={deleteWallPost}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
