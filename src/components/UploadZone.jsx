import React, { useState, useRef } from 'react';
import { compressImage, fileToDataURL } from '../utils/helpers';

export default function UploadZone({ onUpload, locked }) {
  const [drag, setDrag]         = useState(false);
  const [compressing, setComp]  = useState(false);
  const [saved, setSaved]       = useState(null);
  const inputRef                = useRef();

  if (locked) return null;

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    setComp(true); setSaved(null);

    const results = [];
    for (const file of Array.from(files).slice(0, 5)) {
      try {
        const { file: compressed, savedPct } = await compressImage(file);
        const dataUrl = await fileToDataURL(compressed);
        results.push({ file: compressed, dataUrl, savedPct, originalName: file.name });
      } catch {
        // Fallback if compression fails
        const dataUrl = await fileToDataURL(file);
        results.push({ file, dataUrl, savedPct: 0, originalName: file.name });
      }
    }

    const avgSaved = Math.round(results.reduce((s, r) => s + r.savedPct, 0) / results.length);
    setComp(false);
    setSaved(avgSaved);
    onUpload(results);
    setTimeout(() => setSaved(null), 4500);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      {/* Compression feedback */}
      {compressing && (
        <div className="pop-in" style={{
          display:'flex', alignItems:'center', gap:10,
          background:'rgba(108,71,255,0.07)', border:'1px solid rgba(108,71,255,0.2)',
          color:'#4338ca', fontSize:13, fontWeight:500,
          padding:'10px 18px', borderRadius:100, marginBottom:12, width:'fit-content',
        }}>
          <span className="spinner" />
          Optimizing — resizing to 1920px · converting to WebP...
        </div>
      )}
      {saved !== null && !compressing && (
        <div className="pop-in" style={{
          display:'flex', alignItems:'center', gap:8,
          background:'rgba(20,184,166,0.08)', border:'1px solid rgba(20,184,166,0.25)',
          color:'#0f6e56', fontSize:13, fontWeight:500,
          padding:'10px 18px', borderRadius:100, marginBottom:12, width:'fit-content',
        }}>
          ✓ Saved {saved}% space — compressed copy uploaded only
        </div>
      )}

      {/* Drop zone */}
      <div
        className={`upload-zone${drag ? ' drag' : ''}`}
        style={{
          border: '2px dashed rgba(108,71,255,0.28)', borderRadius:24,
          padding:36, textAlign:'center', cursor:'pointer',
          background:'rgba(108,71,255,0.025)', position:'relative', overflow:'hidden',
        }}
        onClick={() => inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
      >
        <div className="upload-ring" style={{
          width:64, height:64, borderRadius:'50%', margin:'0 auto 14px',
          background:'linear-gradient(135deg,rgba(108,71,255,0.12),rgba(59,130,246,0.12))',
          border:'1.5px solid rgba(108,71,255,0.25)',
          display:'flex', alignItems:'center', justifyContent:'center', fontSize:26,
        }}>
          📸
        </div>
        <div style={{ fontSize:15, fontWeight:500, color:'#2d2a45', marginBottom:5 }}>
          {drag ? 'Drop to upload!' : 'Drop photos here or click to upload'}
        </div>
        <div style={{ fontSize:12, color:'#7b78a0' }}>
          Auto-compressed · WebP · Max 1920px · ~300–700 KB
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display:'none' }}
        onChange={e => handleFiles(e.target.files)}
      />
    </div>
  );
}
