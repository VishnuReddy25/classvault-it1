import React, { useState, useRef } from 'react';
import { uploadToCloudinary } from '../context/AppContext';
import { compressFile, formatBytes } from '../utils/compressImage';

export default function UploadZone({ onUpload, locked }) {
  const [drag,      setDrag]     = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress,  setProgress] = useState(null); // { current, total, stage, saved }
  const inputRef = useRef();

  if (locked) return null;

  const handleFiles = async (files) => {
    if (!files || !files.length) return;
    const arr = Array.from(files).slice(0, 5);
    setUploading(true);

    const results     = [];
    let   totalSaved  = 0;
    let   totalOrig   = 0;

    for (let i = 0; i < arr.length; i++) {
      const file = arr[i];
      const origBytes = file.size;
      totalOrig += origBytes;

      try {
        /* ── 1. Compress ── */
        setProgress({
          current: i + 1, total: arr.length,
          stage: 'compressing',
          name: file.name,
          origBytes,
        });

        const compressed      = await compressFile(file, {
          maxWidth:  1600,
          maxHeight: 1600,
          quality:   0.82,
          maxSizeKB: 800,
        });
        const compressedBytes = compressed.size;
        const savedPct        = Math.max(
          0,
          Math.round((1 - compressedBytes / origBytes) * 100)
        );
        totalSaved += (origBytes - compressedBytes);

        console.log(
          `[UploadZone] ${file.name}: ` +
          `${formatBytes(origBytes)} → ${formatBytes(compressedBytes)} ` +
          `(−${savedPct}%)`
        );

        /* ── 2. Upload compressed blob ── */
        setProgress({
          current: i + 1, total: arr.length,
          stage: 'uploading',
          name: file.name,
          origBytes,
          compressedBytes,
          savedPct,
        });

        const { url, publicId } = await uploadToCloudinary(compressed);
        results.push({ photoUrl: url, publicId, originalName: file.name });

      } catch (err) {
        console.error('Upload failed:', file.name, err);
        setProgress(p => ({ ...p, stage: 'error', name: file.name }));
        await new Promise(r => setTimeout(r, 1200)); // brief error flash
      }
    }

    /* ── Done ── */
    const savedPctTotal = totalOrig > 0
      ? Math.max(0, Math.round((totalSaved / totalOrig) * 100))
      : 0;

    setProgress({
      stage: 'done',
      total: arr.length,
      current: arr.length,
      totalSaved,
      savedPctTotal,
    });

    await new Promise(r => setTimeout(r, 2200)); // show "done" state briefly
    setUploading(false);
    setProgress(null);

    if (results.length > 0) onUpload(results);
  };

  return (
    <div style={{ marginBottom: 28 }}>

      {/* ── Progress indicator ── */}
      {uploading && progress && (
        <div className="fade-up" style={{
          marginBottom: 14,
          background: 'rgba(201,136,58,0.07)',
          border: '1px solid rgba(201,136,58,0.22)',
          borderRadius: 14,
          padding: '14px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: 8,
        }}>

          {/* Stage row */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            {progress.stage === 'done'
              ? <span style={{ fontSize: 18 }}>✅</span>
              : progress.stage === 'error'
              ? <span style={{ fontSize: 18 }}>⚠️</span>
              : <span className="spinner" />
            }
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#f0ead8' }}>
                {progress.stage === 'compressing' && `Compressing ${progress.name}…`}
                {progress.stage === 'uploading'   && `Uploading ${progress.name}…`}
                {progress.stage === 'error'       && `Failed: ${progress.name}`}
                {progress.stage === 'done'        && `${progress.total} photo${progress.total > 1 ? 's' : ''} uploaded!`}
              </div>
              <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.38)', marginTop: 2, fontFamily: "'Caveat',cursive", fontSize: 12 }}>
                {progress.stage === 'compressing' && (
                  `Original: ${formatBytes(progress.origBytes)} — compressing…`
                )}
                {progress.stage === 'uploading' && (
                  `${formatBytes(progress.origBytes)} → ${formatBytes(progress.compressedBytes)} · saved ${progress.savedPct}%`
                )}
                {progress.stage === 'done' && progress.totalSaved > 0 && (
                  `Saved ${formatBytes(progress.totalSaved)} total (${progress.savedPctTotal}% smaller)`
                )}
              </div>
            </div>

            {/* File counter */}
            {progress.stage !== 'done' && (
              <div style={{
                fontSize: 11, fontWeight: 700,
                color: 'rgba(201,136,58,0.65)',
                background: 'rgba(201,136,58,0.1)',
                border: '1px solid rgba(201,136,58,0.22)',
                borderRadius: 100,
                padding: '2px 10px',
                fontFamily: "'DM Sans',sans-serif",
                flexShrink: 0,
              }}>
                {progress.current}/{progress.total}
              </div>
            )}
          </div>

          {/* Thin progress bar */}
          {progress.stage !== 'done' && (
            <div style={{ height: 3, borderRadius: 100, background: 'rgba(201,136,58,0.15)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 100,
                background: 'linear-gradient(90deg, #c9883a, #e8a84c)',
                width: `${((progress.current - 1) / progress.total) * 100 + (progress.stage === 'uploading' ? 50 / progress.total : 10 / progress.total)}%`,
                transition: 'width 0.4s ease',
              }} />
            </div>
          )}

          {/* Compression savings badge */}
          {progress.stage === 'uploading' && progress.savedPct > 0 && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              alignSelf: 'flex-start',
              background: 'rgba(16,185,129,0.1)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 100,
              padding: '3px 12px',
              fontSize: 11, fontWeight: 600,
              color: '#6ee7b7',
              fontFamily: "'DM Sans',sans-serif",
            }}>
              🗜 {progress.savedPct}% smaller — faster upload
            </div>
          )}
        </div>
      )}

      {/* ── Drop zone ── */}
      <div
        className={`upload-zone${drag ? ' drag' : ''}`}
        style={{
          border: '2px dashed rgba(201,136,58,0.28)',
          borderRadius: 20,
          padding: 32,
          textAlign: 'center',
          cursor: uploading ? 'wait' : 'pointer',
          background: 'rgba(201,136,58,0.02)',
          opacity: uploading ? 0.65 : 1,
          transition: 'all 0.25s',
        }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDragOver={e => { e.preventDefault(); setDrag(true); }}
        onDragLeave={() => setDrag(false)}
        onDrop={e => { e.preventDefault(); setDrag(false); handleFiles(e.dataTransfer.files); }}
      >
        <div style={{
          width: 58, height: 58, borderRadius: '50%',
          margin: '0 auto 12px',
          background: 'linear-gradient(135deg,rgba(201,136,58,0.12),rgba(201,136,58,0.06))',
          border: '1.5px solid rgba(201,136,58,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 24,
          transition: 'all 0.25s',
        }}>
          {uploading ? '⏳' : drag ? '📂' : '📸'}
        </div>

        <div style={{ fontSize: 14, fontWeight: 500, color: 'rgba(240,234,216,0.75)', marginBottom: 5 }}>
          {uploading
            ? 'Upload in progress…'
            : drag
            ? 'Drop to upload!'
            : 'Drop photos here or click to browse'
          }
        </div>

        <div style={{
          fontSize: 11, color: 'rgba(255,255,255,0.3)',
          fontFamily: "'Caveat',cursive", fontSize: 13,
        }}>
          Up to 5 photos · Auto-compressed before upload · Saved to Cloudinary
        </div>
      </div>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept="image/*"
        style={{ display: 'none' }}
        onChange={e => { handleFiles(e.target.files); e.target.value = ''; }}
      />
    </div>
  );
}
