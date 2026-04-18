import { useYearbook } from "../context/YearbookContext";
import React from 'react';
import Masonry from 'react-masonry-css';
import MemoryCard from './MemoryCard';
import UploadZone from './UploadZone';
import { useApp } from '../context/AppContext';
import { MEMORY_GRADIENTS } from '../data/sampleData';

const BREAKPOINTS = { default: 3, 900: 2, 500: 1 };

export default function GalleryView({ vault }) {
  const { addMemory } = useApp();
  const { sessionStudent } = useYearbook();
  const userName = sessionStudent?.name || "Anonymous";

  const handleUpload = (results) => {
    const captions = ['What a moment ✨','Golden hour magic','Forever in my heart','Vibes only 🌊','Pure joy','This view though','No caption needed','Core memory unlocked'];
    results.forEach((r, i) => {
      addMemory(vault.id, {
        id: Date.now() + i,
        emoji: '🖼',
        dataUrl: r.dataUrl,
        caption: captions[Math.floor(Math.random() * captions.length)],
        uploader: userName,
        date: new Date().toISOString().slice(0, 10),
        height: 160 + Math.floor(Math.random() * 80),
        reactions: { heart: 0, laugh: 0, fire: 0, wow: 0 },
        comments: [],
        compressed: true,
        savedPct: r.savedPct,
      });
    });
  };

  return (
    <div>
      <UploadZone onUpload={handleUpload} locked={vault.locked} />

      {vault.memories.length === 0 ? (
        <EmptyGallery />
      ) : (
        <Masonry
          breakpointCols={BREAKPOINTS}
          className="masonry-grid"
          columnClassName="masonry-column"
        >
          {vault.memories.map((m, i) => (
            <MemoryCard key={m.id} memory={m} vaultId={vault.id} index={i} />
          ))}
        </Masonry>
      )}
    </div>
  );
}

function EmptyGallery() {
  return (
    <div style={{ textAlign:'center', padding:'64px 20px', color:'#7b78a0' }}>
      <div style={{ fontSize:60, marginBottom:16, opacity:0.55 }}>📸</div>
      <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:'#2d2a45', marginBottom:8 }}>No memories yet</div>
      <div style={{ fontSize:14 }}>Upload your first photo to start building this vault.</div>
    </div>
  );
}
