import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '../context/AppContext';

export default function UploadZone({ onUpload, locked }) {
  const [drag,      setDrag]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status,    setStatus]   = useState('');
  const inputRef = useRef();

  if (locked) return null;

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    const arr = Array.from(files).slice(0, 5);
    setUploading(true);
    setStatus(`Uploading 0 / ${arr.length}…`);

    const results = [];
    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      try {
        const url = await uploadToCloudinary(file);
        results.push({ photoUrl: url, originalName: file.name });
        setStatus(`Uploading ${i + 1} / ${arr.length}…`);
      } catch (err) {
        console.error('Cloudinary upload failed:', file.name, err);
        setStatus(`⚠ Failed: ${file.name}`);
      }
    }

    setUploading(false);
    setStatus('');
    if (results.length > 0) onUpload(results);
  };

  return (
    <div style={{ marginBottom: 28 }}>
      {uploading && (
        <div className="pop-in" style={{
          display:'flex', alignItems:'center', gap:10,
          background:'rgba(108,71,255,0.07)', border:'1px solid rgba(108,71,255,0.2)',
          color:'#4338ca', fontSize:13, fontWeight:500,
          padding:'10px 18px', borderRadius:100, marginBottom:12, width:'fit-content',
        }}>
          <span className="spinner" />
          {status || 'Uploading to Cloudinary…'}
        </div>
      )}

      <div
        className={`upload-zone${drag ? ' drag' : ''}`}
        style={{
          border:'2px dashed rgba(108,71,255,0.28)', borderRadius:24,
          padding:36, textAlign:'center',
          cursor: uploading ? 'wait' : 'pointer',
          background:'rgba(108,71,255,0.025)',
          opacity: uploading ? 0.7 : 1,
        }}
        onClick={() => !uploading && inputRef.current?.click()}
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
          {uploading ? '⏳' : '📸'}
        </div>
        <div style={{ fontSize:15, fontWeight:500, color:'#2d2a45', marginBottom:5 }}>
          {uploading ? status : drag ? 'Drop to upload!' : 'Drop photos here or click to upload'}
        </div>
        <div style={{ fontSize:12, color:'#7b78a0' }}>
          Uploaded to Cloudinary · Max 5 photos · Auto-compressed
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display:'none' }}
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}