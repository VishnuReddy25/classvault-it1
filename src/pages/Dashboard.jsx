import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useYearbook } from '../context/YearbookContext';
import MemberAvatars from '../components/MemberAvatars';
import TrustBadge from '../components/TrustBadge';
import CreateVaultModal from '../components/CreateVaultModal';

const COVER_GRADIENTS = {
  Trip:    'linear-gradient(135deg,#c7d2fe,#a5f3fc)',
  Party:   'linear-gradient(135deg,#fbcfe8,#fde68a)',
  College: 'linear-gradient(135deg,#bbf7d0,#a5f3fc)',
  Other:   'linear-gradient(135deg,#e9d5ff,#fbcfe8)',
  Locked:  'linear-gradient(135deg,#fef3c7,#fde68a)',
};

const PRIVACY_ICONS = { public:'🌐', password:'🔑', invite:'🔗' };

export default function Dashboard() {
  const { vaults, enterVault } = useApp();
  const { sessionStudent } = useYearbook();
  const [showCreate, setShowCreate] = useState(false);

  const firstName = sessionStudent ? sessionStudent.name.split(' ')[0] : 'there';

  return (
    <div style={{ position:'relative', zIndex:2, maxWidth:960, margin:'0 auto', padding:'36px 20px 60px' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:36, flexWrap:'wrap', gap:16 }}>
        <div>
          <div className="fade-up" style={{ fontFamily:"'Fraunces',serif", fontSize:34, fontWeight:700, lineHeight:1.1, color:'#fff' }}>
            Hey {firstName} 👋<br />
            <span style={{ color:'#d4af37' }}>Class Vaults</span>
          </div>
          <p style={{ fontSize:15, color:'rgba(255,255,255,0.5)', marginTop:8 }}>
            Private group memory spaces for your batch ✦
          </p>
          <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginTop:18 }}>
            <TrustBadge icon="🔐" label="End-to-end private"      theme="green"  />
            <TrustBadge icon="🔒" label="PIN protected"            theme="purple" />
            <TrustBadge icon="🚫" label="No ads · No data selling" theme="blue"   />
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          style={{
            padding:'12px 26px', borderRadius:100, fontSize:15, fontWeight:600,
            background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'#fff',
            border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif", flexShrink:0,
          }}
        >
          + Create Vault
        </button>
      </div>

      {/* Grid */}
      {vaults.length === 0 ? (
        <div style={{ textAlign:'center', padding:'80px 20px' }}>
          <div style={{ fontSize:48, marginBottom:16 }}>🔒</div>
          <p style={{ color:'rgba(255,255,255,0.4)', fontSize:15, lineHeight:1.7 }}>
            No vaults yet.<br />Create your first shared memory space!
          </p>
          <button
            onClick={() => setShowCreate(true)}
            style={{
              marginTop:24, padding:'12px 28px', borderRadius:100, fontSize:14, fontWeight:600,
              background:'linear-gradient(135deg,#7c3aed,#4338ca)', color:'#fff',
              border:'none', cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
            }}
          >
            + Create First Vault
          </button>
        </div>
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(260px,1fr))', gap:18 }}>
          {vaults.map((v, i) => (
            <VaultCard key={v.id} vault={v} onClick={() => enterVault(v.id)} delay={i * 0.07} />
          ))}
          <CreateCard onClick={() => setShowCreate(true)} />
        </div>
      )}

      {showCreate && <CreateVaultModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

function VaultCard({ vault: v, onClick, delay }) {
  const coverGrad = v.locked ? COVER_GRADIENTS.Locked : (COVER_GRADIENTS[v.theme] || COVER_GRADIENTS.Other);
  return (
    <div
      className="fade-up"
      onClick={onClick}
      style={{
        borderRadius:24, overflow:'hidden', background:'#fff',
        border:'1px solid rgba(255,255,255,0.7)',
        boxShadow:'0 4px 20px rgba(108,71,255,0.07)',
        cursor:'pointer', animationDelay:`${delay}s`,
        transition:'transform 0.2s, box-shadow 0.2s',
      }}
      onMouseEnter={e=>{e.currentTarget.style.transform='translateY(-4px)';e.currentTarget.style.boxShadow='0 12px 32px rgba(108,71,255,0.15)';}}
      onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 4px 20px rgba(108,71,255,0.07)';}}
    >
      <div style={{ height:154, position:'relative', overflow:'hidden', background:coverGrad, display:'flex', alignItems:'center', justifyContent:'center', fontSize:56 }}>
        <span>{v.locked ? '🔒' : v.emoji}</span>
        <div style={{
          position:'absolute', top:10, right:10,
          background: v.locked?'rgba(245,158,11,0.75)':v.privacy==='public'?'rgba(20,184,166,0.75)':'rgba(0,0,0,0.45)',
          backdropFilter:'blur(10px)', color:'#fff', fontSize:10, fontWeight:500,
          padding:'4px 11px', borderRadius:100, display:'flex', alignItems:'center', gap:5,
        }}>
          {v.locked ? '🔒 Sealed' : `${PRIVACY_ICONS[v.privacy]||'🌐'} ${v.privacy==='password'?'Password':v.privacy==='invite'?'Invite only':'Public'}`}
        </div>
      </div>
      <div style={{ padding:'16px 18px' }}>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:17, fontWeight:600, color:'#0d0b18', marginBottom:10 }}>{v.name}</div>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
          <MemberAvatars members={v.members} names={v.memberNames} max={4} size={26} />
          <span style={{ fontSize:12, color:'#b8b5d6' }}>{v.memories?.length||0} photos</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:5, fontSize:11, color:'#0f6e56', fontWeight:500, background:'rgba(20,184,166,0.07)', border:'1px solid rgba(20,184,166,0.2)', padding:'3px 10px', borderRadius:100, width:'fit-content' }}>
          <span>🔐</span>
          {v.locked ? 'Time capsule · Sealed' : 'Private vault · Members only'}
        </div>
      </div>
    </div>
  );
}

function CreateCard({ onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        borderRadius:24, border:'2px dashed rgba(108,71,255,0.25)',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        gap:10, minHeight:220, cursor:'pointer', background:'rgba(108,71,255,0.025)',
        transition:'all 0.22s',
      }}
      onMouseEnter={e=>{e.currentTarget.style.borderColor='#6c47ff';e.currentTarget.style.background='rgba(108,71,255,0.07)';e.currentTarget.style.transform='translateY(-4px)';}}
      onMouseLeave={e=>{e.currentTarget.style.borderColor='rgba(108,71,255,0.25)';e.currentTarget.style.background='rgba(108,71,255,0.025)';e.currentTarget.style.transform='';}}
    >
      <div style={{ width:52,height:52,borderRadius:'50%',background:'rgba(108,71,255,0.1)',border:'1.5px solid rgba(108,71,255,0.25)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,color:'#6c47ff' }}>+</div>
      <div style={{ fontSize:14, fontWeight:500, color:'#6c47ff' }}>Create new vault</div>
    </div>
  );
}
