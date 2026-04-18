import React, { useState, useRef } from 'react';
import { useYearbook } from '../context/YearbookContext';

const TABS = ['All', '1st Year', '2nd Year', '3rd Year', 'Final Year', 'Fiesta', 'Other'];

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function MediaVault() {
  const { mediaWallet, uploadMedia, deleteMedia, sessionId, students, isAdmin, useLocalMode } = useYearbook();
  const fileRef  = useRef();
  const [activeTab, setActiveTab]   = useState('All');
  const [lightbox, setLightbox]     = useState(null);
  const [caption, setCaption]       = useState('');
  const [uploadTag, setUploadTag]   = useState('Other');
  const [uploading, setUploading]   = useState(false);
  const [error, setError]           = useState('');

  // Flatten all media across all students into one array
  const allMedia = Object.entries(mediaWallet).flatMap(([studentId, items]) =>
    items.map(item => {
      const { caption: rawCaption, tag } = parseCaption(item.caption);
      return {
        ...item,
        caption: rawCaption,
        tag,
        studentId,
        uploaderName: students.find(s => s.id === studentId)?.name || 'Unknown',
      };
    })
  ).sort((a, b) => new Date(b.uploadedAt) - new Date(a.uploadedAt));

  const filtered = activeTab === 'All'
    ? allMedia
    : allMedia.filter(m => m.tag === activeTab);

  // Upload handler
  function handleFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('Only image files are supported.'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('File too large (max 10 MB).'); return; }
    setUploading(true);
    setError('');
    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        // We'll add tag and caption to the item
        const dataUrl = ev.target.result;
        await uploadMediaWithMeta(sessionId, dataUrl, caption.trim(), uploadTag);
        setCaption('');
        setError(''); // Clear any previous errors on success
      } catch (err) {
        setError(`Upload failed: ${err.message || 'Unknown error'}`);
        console.error('Upload error:', err);
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => { setError('Failed to read file.'); setUploading(false); };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  async function uploadMediaWithMeta(studentId, dataUrl, cap, tag) {
    // We extend uploadMedia by embedding tag into caption with a separator
    const combined = `${cap}||${tag}`;
    await uploadMedia(studentId, dataUrl, combined);
  }

  function parseCaption(raw) {
    if (!raw) return { caption: '', tag: 'Other' };
    const parts = raw.split('||');
    if (parts.length >= 2) return { caption: parts[0], tag: parts[1] };
    return { caption: raw, tag: 'Other' };
  }

  return (
    <div style={{ position:'relative', zIndex:2, maxWidth:1100, margin:'0 auto', padding:'36px 20px 80px' }}>

      {/* Header */}
      <div className="fade-up" style={{ textAlign:'center', marginBottom:48 }}>
        <div style={{ color:'#d4af37', fontSize:11, fontWeight:600, letterSpacing:3, textTransform:'uppercase', marginBottom:12 }}>
          Memories · 2022–2026
        </div>
        <h1 style={{ fontFamily:"'Fraunces',serif", fontSize:'clamp(32px,6vw,56px)', fontWeight:700, color:'#fff', lineHeight:1.1, marginBottom:14 }}>
          Media Vault
        </h1>
        <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', lineHeight:1.7 }}>
          {allMedia.length > 0
            ? `${allMedia.length} photo${allMedia.length!==1?'s':''} shared by the batch`
            : 'No photos yet — be the first to upload a memory!'}
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
          textAlign: 'center'
        }}>
          <div style={{ color: '#ffc107', fontSize: 14, fontWeight: 600, marginBottom: 4 }}>
            ⚠️ Demo Mode Active
          </div>
          <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13 }}>
            Images uploaded in demo mode are temporary and will be lost on reload. 
            Connect to Firestore for permanent storage.
          </div>
        </div>
      )}

      {/* Upload panel (only when signed in) */}
      {sessionId ? (
        <div className="fade-up" style={{
          maxWidth:560, margin:'0 auto 44px',
          background:'rgba(255,255,255,0.04)',
          border:'1.5px solid rgba(212,175,55,0.2)',
          borderRadius:20, padding:24,
        }}>
          <div style={{ fontSize:13, fontWeight:600, color:'#d4af37', marginBottom:14 }}>
            📸 Upload a photo
          </div>

          <input
            style={{
              width:'100%', padding:'11px 14px', borderRadius:12,
              border:'1.5px solid rgba(255,255,255,0.1)',
              background:'rgba(255,255,255,0.05)', color:'#fff',
              fontSize:14, fontFamily:"'DM Sans',sans-serif",
              marginBottom:10, boxSizing:'border-box',
            }}
            placeholder="Caption (optional)"
            value={caption}
            onChange={e=>setCaption(e.target.value)}
          />

          <select
            value={uploadTag}
            onChange={e=>setUploadTag(e.target.value)}
            style={{
              width:'100%', padding:'11px 14px', borderRadius:12,
              border:'1.5px solid rgba(255,255,255,0.1)',
              background:'rgba(20,16,40,0.95)', color:'rgba(255,255,255,0.8)',
              fontSize:14, fontFamily:"'DM Sans',sans-serif",
              marginBottom:14, boxSizing:'border-box',
            }}
          >
            {TABS.filter(t=>t!=='All').map(t=><option key={t} value={t}>{t}</option>)}
          </select>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            style={{
              width:'100%', padding:'12px', borderRadius:100,
              background:'linear-gradient(135deg,#d4af37,#b8960c)',
              color:'#0d0b18', fontWeight:700, fontSize:14,
              border:'none', cursor:'pointer',
              fontFamily:"'DM Sans',sans-serif",
            }}
          >
            {uploading ? 'Uploading…' : '+ Upload Photo'}
          </button>
          <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={handleFile} />

          {error && <p style={{ color:'#fb7185', fontSize:13, marginTop:10 }}>⚠ {error}</p>}
        </div>
      ) : (
        <div style={{ textAlign:'center', marginBottom:36 }}>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:13 }}>🔒 Sign in to upload photos</p>
        </div>
      )}

      {/* Tab bar */}
      <div className="fade-up" style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:36 }}>
        {TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding:'9px 20px', borderRadius:100, fontSize:13, fontWeight:500,
              border:`1.5px solid ${activeTab===tab?'rgba(212,175,55,0.6)':'rgba(255,255,255,0.1)'}`,
              background: activeTab===tab?'rgba(212,175,55,0.15)':'rgba(255,255,255,0.04)',
              color: activeTab===tab?'#d4af37':'rgba(255,255,255,0.5)',
              cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Gallery */}
      {filtered.length === 0 ? (
        <div style={{ textAlign:'center', padding:'60px 20px' }}>
          <div style={{ fontSize:40, marginBottom:16 }}>🖼</div>
          <p style={{ color:'rgba(255,255,255,0.35)', fontSize:15 }}>
            {activeTab === 'All' ? 'No photos uploaded yet.' : `No photos tagged "${activeTab}" yet.`}
          </p>
        </div>
      ) : (
        <div style={{ columns:'auto 260px', columnGap:16 }}>
          {filtered.map(item => {
            const { caption: cap, tag } = parseCaption(item.caption);
            const canDelete = isAdmin || item.studentId === sessionId;
            return (
              <div key={item.id} style={{
                breakInside:'avoid', marginBottom:16, borderRadius:16, overflow:'hidden',
                background:'rgba(255,255,255,0.05)',
                border:'1px solid rgba(255,255,255,0.08)',
                position:'relative', cursor:'pointer',
              }}
                onClick={() => setLightbox(item)}
              >
                <img
                  src={item.url}
                  alt={cap || 'Memory'}
                  style={{ width:'100%', display:'block', borderRadius:'16px 16px 0 0' }}
                />
                <div style={{ padding:'10px 14px 12px' }}>
                  {cap && <div style={{ fontSize:13, color:'rgba(255,255,255,0.8)', marginBottom:4 }}>{cap}</div>}
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontSize:11, color:'rgba(255,255,255,0.35)' }}>
                      {item.uploaderName.split(' ')[0]} · {timeAgo(item.uploadedAt)}
                    </div>
                    {tag && tag !== 'Other' && (
                      <span style={{
                        fontSize:10, padding:'2px 8px', borderRadius:100,
                        background:'rgba(212,175,55,0.15)', color:'#d4af37', fontWeight:600,
                      }}>{tag}</span>
                    )}
                  </div>
                </div>

                {canDelete && (
                  <button
                    onClick={e => { e.stopPropagation(); deleteMedia(item.studentId, item.id); }}
                    title="Delete"
                    style={{
                      position:'absolute', top:8, right:8,
                      width:28, height:28, borderRadius:'50%',
                      background:'rgba(0,0,0,0.55)', border:'none',
                      color:'rgba(255,255,255,0.7)', cursor:'pointer', fontSize:12,
                      display:'flex', alignItems:'center', justifyContent:'center',
                    }}
                  >✕</button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position:'fixed', inset:0, zIndex:1000,
            background:'rgba(0,0,0,0.88)',
            display:'flex', alignItems:'center', justifyContent:'center',
            padding:20,
          }}
        >
          <div style={{ maxWidth:800, width:'100%', textAlign:'center' }} onClick={e=>e.stopPropagation()}>
            <img src={lightbox.url} alt="" style={{ maxWidth:'100%', maxHeight:'80vh', borderRadius:16 }} />
            {(() => { const { caption: cap } = parseCaption(lightbox.caption); return cap ? (
              <p style={{ color:'rgba(255,255,255,0.7)', marginTop:14, fontSize:15 }}>{cap}</p>
            ) : null; })()}
            <button onClick={()=>setLightbox(null)} style={{ marginTop:20, background:'none', border:'1px solid rgba(255,255,255,0.2)', color:'#fff', padding:'8px 20px', borderRadius:100, cursor:'pointer' }}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
