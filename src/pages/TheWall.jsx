import React, { useState } from 'react';
import { useYearbook } from '../context/YearbookContext';

const NOTE_COLORS = [
  { bg:'rgba(252,211,77,0.10)',  border:'rgba(252,211,77,0.30)',  accent:'#fcd34d' },
  { bg:'rgba(167,139,250,0.10)', border:'rgba(167,139,250,0.30)', accent:'#a78bfa' },
  { bg:'rgba(52,211,153,0.10)',  border:'rgba(52,211,153,0.30)',  accent:'#34d399' },
  { bg:'rgba(251,113,133,0.10)', border:'rgba(251,113,133,0.30)', accent:'#fb7185' },
  { bg:'rgba(56,189,248,0.10)',  border:'rgba(56,189,248,0.30)',  accent:'#38bdf8' },
  { bg:'rgba(251,146,60,0.10)',  border:'rgba(251,146,60,0.30)',  accent:'#fb923c' },
];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function TheWall() {
  const { wallPosts, addWallPost, deleteWallPost, sessionId, sessionStudent, useLocalMode } = useYearbook();
  const [message, setMessage]   = useState('');
  const [anonymous, setAnonymous] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError]         = useState('');

  const handleSubmit = async () => {
    if (!message.trim()) { setError('Write something first!'); return; }
    try {
      const name = anonymous ? '' : (sessionStudent?.name || '');
      await addWallPost(sessionId, name, message.trim(), anonymous);
      setMessage('');
      setSubmitted(true);
      setError('');
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err) {
      setError(`Failed to post: ${err.message || 'Check your connection.'}`);
      console.error('Post error:', err);
    }
  };

  const { isAdmin } = useYearbook();

  return (
    <div style={{ position:'relative', zIndex:2, maxWidth:1080, margin:'0 auto', padding:'36px 20px 80px' }}>

      {/* Header */}
      <div className="fade-up" style={{ textAlign:'center', marginBottom:52 }}>
        <div style={{ color:'#d4af37', fontSize:11, fontWeight:600, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>
          Speak Your Heart
        </div>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(32px,6vw,56px)', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:14 }}>
          The Wall of Reflection
        </h1>
        <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.7, maxWidth:480, margin:'0 auto' }}>
          Leave a message for your batchmates. Anonymous or signed — it lives here forever.
        </p>
      </div>

      {/* Demo Mode Warning */}
      {useLocalMode && (
        <div className="fade-up" style={{
          background: 'rgba(255,193,7,0.1)',
          border: '1px solid rgba(255,193,7,0.3)',
          borderRadius: 8,
          padding: '16px 20px',
          marginBottom: 32,
          textAlign: 'center',
          maxWidth: 560,
          marginLeft: 'auto',
          marginRight: 'auto'
        }}>
          <div style={{ color: '#ffc107', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            ⚠️ Demo Mode Active
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
            Messages posted in demo mode are temporary and will be lost on reload. 
            Connect to Firestore for permanent messages.
          </div>
        </div>
      )}

      {/* Compose box */}
      <div className="fade-up" style={{
        maxWidth:560, margin:'0 auto 52px',
        background:'rgba(255,255,255,0.04)',
        border:'1px solid rgba(255,255,255,0.1)',
        borderRadius:20, padding:28, animationDelay:'0.1s',
      }}>
        <textarea
          rows={4}
          placeholder={sessionId ? "Write your message to the batch…" : "Sign in to leave a message"}
          value={message}
          onChange={e => { setMessage(e.target.value); setError(''); }}
          disabled={!sessionId}
          style={{
          width:'100%',
          minHeight:'140px',        // 🔥 bigger writing area
          background:'#fff8dc',
          border:'2px dashed #eab308',
          borderRadius:12,

          color:'#2d2d2d',
          fontSize:22,
          padding:'16px 18px',

          fontFamily:"'Patrick Hand', cursive",

          resize:'vertical',
          lineHeight:1.8,
          letterSpacing:'0.5px',

          boxSizing:'border-box',
          opacity: sessionId ? 1 : 0.5,
        }}
        />

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14, flexWrap:'wrap', gap:10 }}>
          <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontSize:13, color:'rgba(255,255,255,0.55)' }}>
            <input type="checkbox" checked={anonymous} onChange={e=>setAnonymous(e.target.checked)} style={{ accentColor:'#d4af37' }} />
            Post anonymously
          </label>

          <button
            onClick={handleSubmit}
            disabled={!sessionId}
            style={{
              padding:'10px 24px', borderRadius:100, fontSize:13, fontWeight:600,
              background:'linear-gradient(135deg,#d4af37,#b8960c)', color:'#0d0b18',
              border:'none', cursor: sessionId ? 'pointer' : 'not-allowed',
              opacity: sessionId ? 1 : 0.4,
              fontFamily:"'DM Sans',sans-serif",
            }}
          >
            {submitted ? '✓ Posted!' : 'Post to The Wall'}
          </button>
        </div>

        {error && <p style={{ color:'#fb7185', fontSize:13, marginTop:10 }}>⚠ {error}</p>}
        {!sessionId && (
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:12, marginTop:10, textAlign:'center' }}>
            🔒 Sign in to a profile to post
          </p>
        )}
      </div>

      {/* Posts grid */}
      {wallPosts.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>📝</div>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:15 }}>
            No messages yet. Be the first to leave a mark!
          </p>
        </div>
      ) : (
        <div style={{
          columns: 'auto 300px', columnGap:20,
        }}>
          {wallPosts.map(post => {
            const c = NOTE_COLORS[post.color % NOTE_COLORS.length];
            return (
              <div key={post.id} style={{
                breakInside:'avoid',
                marginBottom:20,

                background: 'linear-gradient(135deg, #fff8dc, #fef3c7)',
                color: '#2d2d2d',
                padding:'26px 24px',
                borderRadius:12,
                boxShadow:'0 8px 20px rgba(0,0,0,0.25)',

                fontFamily:"'Caveat', cursive",

                transform:`rotate(${Math.random()*6 - 3}deg)`,

                position:'relative',
              }}>

                {/* 📌 Pin */}
                <div style={{
                  position:'absolute',
                  top:-10,
                  left:'50%',
                  transform:'translateX(-50%)',
                  width:14,
                  height:14,
                  background:'#ef4444',
                  borderRadius:'50%',
                  boxShadow:'0 2px 6px rgba(0,0,0,0.4)'
                }} />

                {/* ❌ Close button FIXED */}
                {(isAdmin || post.studentId === sessionId) && (
                  <button
                    onClick={() => deleteWallPost(post.id)}
                    style={{
                    position:'absolute',
                    top:10,
                    right:12,

                    background:'rgba(0,0,0,0.1)',   
                    border:'none',

                    color:'#000',                   
                    fontSize:18,
                    cursor:'pointer',
                    fontWeight:'bold',

                    borderRadius:'50%',
                    width:28,
                    height:28,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center'
                  }}
                  >
                    ✕
                  </button>
                )}

                {/* ✍️ Message text FIXED */}
                <p style={{
                    fontSize:24,                 // 🔥 bigger
                    color:'#2d2d2d',
                    lineHeight:1.9,
                    letterSpacing:'0.5px',
                    margin:0,
                    fontFamily:"'Caveat', cursive",
                    textShadow:'0.5px 0.5px 0px rgba(0,0,0,0.1)' // ✨ ink feel
                  }}>
                  {post.message}
                </p>

                {/* 👤 Name + time FIXED */}
                <div style={{ marginTop:18, display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{
                    width:28,
                    height:28,
                    borderRadius:'50%',
                    background:`linear-gradient(135deg,${c.accent},rgba(0,0,0,0.3))`,
                    display:'flex',
                    alignItems:'center',
                    justifyContent:'center',
                    fontSize:10,
                    fontWeight:700,
                    color:'#fff',
                  }}>
                    {post.anonymous ? '?' : post.name?.[0]}
                  </div>

                  <div>
                    <div style={{
                      fontSize:15,       // ✅ bigger name
                      color:'#444'
                    }}>
                      {post.name}
                    </div>

                    <div style={{
                      fontSize:13,       // ✅ bigger time
                      color:'#777'
                    }}>
                      {timeAgo(post.createdAt?.toDate?.() || new Date())}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
