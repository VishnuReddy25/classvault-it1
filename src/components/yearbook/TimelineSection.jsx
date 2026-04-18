import React, { useState } from 'react';
import { useYearbook } from '../../context/YearbookContext';

const YEAR_OPTIONS = ['2022', '2023', '2024', '2025', '2026'];

export default function TimelineSection({ student, tv, editing }) {
  const { addTimelineEvent, removeTimelineEvent, sessionId, isAdmin } = useYearbook();
  const [adding, setAdding] = useState(false);
  const [form, setForm]     = useState({ year:'2022', event:'' });

  // Can add entries: the owner (session matches student) or admin
  const canAdd = isAdmin || sessionId === student.id;

  const handleAdd = () => {
    if (!form.event.trim()) return;
    addTimelineEvent(student.id, { year:form.year, event:form.event.trim() });
    setForm({ year:'2022', event:'' });
    setAdding(false);
  };

  const canRemoveItem = (item) => isAdmin || sessionId === student.id;

  const sorted = [...(student.timeline||[])].sort((a,b)=>a.year-b.year);

  return (
    <div style={{ paddingBottom:24 }}>
      {canAdd && !adding && (
        <button onClick={() => setAdding(true)} style={{
          marginBottom:24, padding:'10px 20px', borderRadius:100,
          background:tv.sectionBg, border:`1.5px dashed ${tv.sectionBorder}`,
          color:tv.tagColor, fontSize:13, fontWeight:500,
          cursor:'pointer', fontFamily:"'DM Sans',sans-serif", width:'100%',
        }}>
          + Add a Memory / Milestone
        </button>
      )}

      {adding && (
        <div style={{ background:tv.sectionBg, border:`1px solid ${tv.sectionBorder}`, borderRadius:18, padding:'18px 20px', marginBottom:20 }}>
          <div style={{ display:'flex', gap:10, marginBottom:12 }}>
            <select value={form.year} onChange={e=>setForm(f=>({...f,year:e.target.value}))} style={selectStyle(tv)}>
              {YEAR_OPTIONS.map(y=><option key={y} value={y}>{y}</option>)}
            </select>
            <input value={form.event} onChange={e=>setForm(f=>({...f,event:e.target.value}))} onKeyDown={e=>e.key==='Enter'&&handleAdd()} placeholder="What happened? (e.g. Won the hackathon 🏆)" autoFocus style={{ ...inputSt(tv), flex:1 }} />
          </div>
          <div style={{ display:'flex', gap:8 }}>
            <button onClick={handleAdd} style={primaryBtn}>Add →</button>
            <button onClick={()=>setAdding(false)} style={ghostBtn(tv)}>Cancel</button>
          </div>
        </div>
      )}

      {sorted.length === 0 ? (
        <div style={{ textAlign:'center', padding:'40px 0', ...tv.muted, fontSize:14, fontStyle:'italic' }}>
          No milestones yet. {canAdd ? 'Add your first memory above! 🌟' : 'Nothing added yet.'}
        </div>
      ) : (
        <div style={{ position:'relative', paddingLeft:28 }}>
          <div style={{ position:'absolute', left:8, top:8, bottom:0, width:2, background:'linear-gradient(180deg,#7c3aed,rgba(124,58,237,0.1))', borderRadius:2 }} />
          {sorted.map(item => (
            <div key={item.id} style={{ marginBottom:18, position:'relative' }}>
              <div style={{ position:'absolute', left:-23, top:6, width:12, height:12, borderRadius:'50%', background:'linear-gradient(135deg,#7c3aed,#4338ca)', border:`2px solid ${tv.modalBg}`, boxShadow:'0 0 0 3px rgba(124,58,237,0.2)' }} />
              <div style={{ background:tv.sectionBg, border:`1px solid ${tv.sectionBorder}`, borderRadius:14, padding:'12px 16px', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
                <div style={{ flex:1 }}>
                  <span style={{ fontSize:10, fontWeight:700, color:'#7c3aed', background:'rgba(124,58,237,0.12)', padding:'2px 8px', borderRadius:100, marginRight:10, letterSpacing:1 }}>{item.year}</span>
                  <span style={{ fontSize:14, ...tv.heading, opacity:0.88 }}>{item.event}</span>
                </div>
                {canRemoveItem(item) && (
                  <button onClick={()=>removeTimelineEvent(student.id,item.id)} style={{ width:26,height:26,borderRadius:'50%',flexShrink:0,background:'rgba(239,68,68,0.08)',border:'1px solid rgba(239,68,68,0.2)',color:'#ef4444',fontSize:12,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center' }}>✕</button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const selectStyle = (tv) => ({ padding:'10px 14px', borderRadius:12, background:tv.inputBg, border:`1.5px solid ${tv.inputBorder}`, color:tv.text, fontSize:13, cursor:'pointer', outline:'none', fontFamily:"'DM Sans',sans-serif" });
const inputSt = (tv) => ({ padding:'10px 14px', borderRadius:12, background:tv.inputBg, border:`1.5px solid ${tv.inputBorder}`, color:tv.inputText||tv.text, fontSize:13, outline:'none', fontFamily:"'DM Sans',sans-serif", boxSizing:'border-box' });
const primaryBtn = { padding:'9px 20px', borderRadius:100, fontSize:13, fontWeight:600, background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'#fff', border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif" };
const ghostBtn = (tv) => ({ padding:'9px 18px', borderRadius:100, fontSize:13, background:tv.btnBg, border:`1px solid ${tv.btnBorder}`, color:tv.btnColor, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" });
