import React from 'react';
import { MEMORY_GRADIENTS, REACTION_KEYS } from '../data/sampleData';
import { formatDate } from '../utils/helpers';

export default function TimelineView({ vault }) {
  const memories = [...(vault.memories || [])].sort((a, b) => new Date(b.date) - new Date(a.date));

  if (memories.length === 0) {
    return (
      <div style={{ textAlign:'center', padding:'64px 20px', color:'#7b78a0' }}>
        <div style={{ fontSize:56, marginBottom:16, opacity:0.55 }}>📅</div>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:20, color:'#2d2a45', marginBottom:8 }}>No timeline yet</div>
        <div style={{ fontSize:14 }}>Upload memories to see the story unfold here.</div>
      </div>
    );
  }

  // Group by date
  const grouped = memories.reduce((acc, m) => {
    const d = m.date || new Date().toISOString().slice(0,10);
    if (!acc[d]) acc[d] = [];
    acc[d].push(m);
    return acc;
  }, {});

  return (
    <div style={{ position:'relative', paddingLeft:32, paddingTop:4 }}>
      {/* Vertical spine */}
      <div style={{
        position:'absolute', left:10, top:8, bottom:0, width:2,
        background:'linear-gradient(180deg,#6c47ff,#3b82f6,rgba(59,130,246,0))',
        borderRadius:2,
      }} />

      {Object.entries(grouped).map(([date, items], gi) => (
        <div key={date}>
          {/* Date label */}
          <div style={{
            position:'relative', marginBottom:16,
            animationDelay:`${gi * 0.08}s`,
          }} className="fade-up">
            {/* Dot */}
            <div style={{
              position:'absolute', left:-26, top:3,
              width:14, height:14, borderRadius:'50%',
              background:'linear-gradient(135deg,#6c47ff,#3b82f6)',
              border:'2.5px solid #f7f5ff',
              boxShadow:'0 0 0 3px rgba(108,71,255,0.18)',
            }} />
            <div style={{
              fontSize:11, fontWeight:500, color:'#7b78a0',
              letterSpacing:0.3, textTransform:'uppercase', marginBottom:10,
            }}>
              {formatDate(date)}
            </div>
          </div>

          {/* Cards for this date */}
          {items.map((m, i) => (
            <TimelineCard key={m.id} memory={m} index={gi * 10 + i} />
          ))}
        </div>
      ))}
    </div>
  );
}

function TimelineCard({ memory: m, index }) {
  const grad = m.dataUrl ? null : MEMORY_GRADIENTS[index % MEMORY_GRADIENTS.length];
  const activeReactions = REACTION_KEYS.filter(r => m.reactions[r.key] > 0);

  return (
    <div
      className="timeline-card fade-up"
      style={{
        background: '#fff',
        border: '1px solid rgba(108,71,255,0.1)',
        borderRadius: 18, overflow: 'hidden',
        boxShadow: '0 2px 12px rgba(108,71,255,0.06)',
        marginBottom: 20,
        animationDelay: `${index * 0.05}s`,
        maxWidth: 520,
      }}
    >
      {/* Image */}
      {m.dataUrl ? (
        <img src={m.dataUrl} alt={m.caption} style={{ width:'100%', maxHeight:240, objectFit:'cover', display:'block' }} />
      ) : (
        <div style={{ height:200, background:grad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:52 }}>
          {m.emoji}
        </div>
      )}

      {/* Body */}
      <div style={{ padding:'14px 16px' }}>
        <div style={{ fontSize:14, fontWeight:500, color:'#0d0b18', marginBottom:4 }}>{m.caption}</div>
        <div style={{ fontSize:11, color:'#7b78a0', marginBottom:10 }}>📸 {m.uploader}</div>

        {activeReactions.length > 0 && (
          <div style={{ display:'flex', gap:6, flexWrap:'wrap' }}>
            {activeReactions.map(r => (
              <span key={r.key} style={{
                display:'flex', alignItems:'center', gap:4,
                background:'rgba(108,71,255,0.06)', border:'1px solid rgba(108,71,255,0.15)',
                color:'#2d2a45', fontSize:11, padding:'3px 9px', borderRadius:100,
              }}>
                {r.emoji} {m.reactions[r.key]}
              </span>
            ))}
            {m.comments?.length > 0 && (
              <span style={{
                display:'flex', alignItems:'center', gap:4,
                background:'rgba(108,71,255,0.06)', border:'1px solid rgba(108,71,255,0.15)',
                color:'#7b78a0', fontSize:11, padding:'3px 9px', borderRadius:100,
              }}>
                💬 {m.comments.length}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
