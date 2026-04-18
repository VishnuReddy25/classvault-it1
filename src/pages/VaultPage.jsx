import { useYearbook } from "../context/YearbookContext";
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { vaultStats, formatShortDate } from '../utils/helpers';
import MemberAvatars from '../components/MemberAvatars';
import TrustBadge from '../components/TrustBadge';
import GalleryView from '../components/GalleryView';
import TimelineView from '../components/TimelineView';
import StoryMode from '../components/StoryMode';
import LockVaultModal from '../components/LockVaultModal';

const TABS = [
  { id: 'gallery',  label: '🖼 Gallery'  },
  { id: 'timeline', label: '📅 Timeline' },
];

export default function VaultPage() {
  const { activeVault, lockVault, exitVault } = useApp();
  const { sessionStudent } = useYearbook();
  const userName = sessionStudent?.name || "";
  const [tab, setTab]             = useState('gallery');
  const [storyOpen, setStoryOpen] = useState(false);
  const [lockModal, setLockModal] = useState(false);

  if (!activeVault) return null;

  const vault   = activeVault;
  const stats   = vaultStats(vault);
  const isOwner = vault.memberNames[0] === userName;

  const handleLock = () => {
    lockVault(vault.id);
    setLockModal(false);
  };

  return (
    <div style={{ position:'relative', zIndex:2, maxWidth:1060, margin:'0 auto', padding:'28px 20px 60px' }}>

      {/* Story mode */}
      {storyOpen && vault.memories.length > 0 && (
        <StoryMode memories={vault.memories} onClose={() => setStoryOpen(false)} />
      )}

      {/* Lock confirm */}
      {lockModal && <LockVaultModal onConfirm={handleLock} onClose={() => setLockModal(false)} />}

      {/* Back button */}
      <button
        onClick={exitVault}
        style={{
          display:'flex', alignItems:'center', gap:6,
          color:'#6c47ff', fontSize:14, fontWeight:500,
          background:'none', border:'none', padding:'0 0 20px', cursor:'pointer',
          fontFamily:"'DM Sans',sans-serif",
        }}
      >
        ← Back to vaults
      </button>

      {/* Vault header */}
      <div
        className="fade-up"
        style={{
          marginBottom:28, borderRadius:24, padding:'26px 30px',
          background:'linear-gradient(135deg,rgba(108,71,255,0.07),rgba(59,130,246,0.05))',
          border:'1px solid rgba(108,71,255,0.14)',
        }}
      >
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', flexWrap:'wrap', gap:16 }}>
          {/* Info */}
          <div>
            <div style={{
              display:'flex', alignItems:'center', gap:12, flexWrap:'wrap',
              fontFamily:"'Fraunces',serif", fontSize:30, fontWeight:700, color:'#0d0b18', lineHeight:1.1, marginBottom:10,
            }}>
              <span>{vault.emoji}</span>
              <span>{vault.name}</span>
              {vault.locked && (
                <span style={{
                  display:'inline-flex', alignItems:'center', gap:6,
                  background:'rgba(245,158,11,0.12)', color:'#92400e',
                  border:'1px solid rgba(245,158,11,0.3)',
                  padding:'5px 14px', borderRadius:100, fontSize:13, fontWeight:500,
                }}>
                  🔒 Sealed
                </span>
              )}
            </div>

            {/* Meta row */}
            <div style={{ display:'flex', gap:16, flexWrap:'wrap', fontSize:13, color:'#7b78a0', marginBottom:14 }}>
              <span style={{ display:'flex', alignItems:'center', gap:5 }}>
                <MemberAvatars members={vault.members} names={vault.memberNames} max={5} size={22} />
                <span style={{ marginLeft:6 }}>{vault.memberNames.join(', ')}</span>
              </span>
              <span>📸 {stats.photos} memories</span>
              <span>❤️ {stats.reactions} reactions</span>
              <span>💬 {stats.comments} comments</span>
              {vault.lockedAt && <span>🕰 Sealed {formatShortDate(vault.lockedAt)}</span>}
            </div>

            {/* Trust badges */}
            <div style={{ display:'flex', gap:8, flexWrap:'wrap' }}>
              <TrustBadge icon="🔐" label="Only members can view" theme="green" />
              {vault.privacy === 'password' && <TrustBadge icon="🔑" label="Password protected"   theme="purple" />}
              {vault.privacy === 'invite'   && <TrustBadge icon="🔗" label="Invite only"           theme="blue"   />}
              {vault.privacy === 'public'   && <TrustBadge icon="🌐" label="Public vault"          theme="blue"   />}
              {vault.locked                 && <TrustBadge icon="🕰" label="Time capsule"          theme="gold"   />}
            </div>
          </div>

          {/* Actions */}
          <div style={{ display:'flex', gap:10, alignItems:'flex-start', flexWrap:'wrap', flexShrink:0 }}>
            <button
              onClick={() => setStoryOpen(true)}
              className="btn-primary"
              disabled={vault.memories.length === 0}
              style={{
                padding:'11px 22px', borderRadius:100, fontSize:14, fontWeight:500,
                cursor: vault.memories.length === 0 ? 'not-allowed' : 'pointer',
                fontFamily:"'DM Sans',sans-serif", border:'none',
                opacity: vault.memories.length === 0 ? 0.5 : 1,
              }}
            >
              ▶ Play Memories
            </button>

            {isOwner && !vault.locked && (
              <button
                onClick={() => setLockModal(true)}
                style={{
                  padding:'11px 22px', borderRadius:100, fontSize:14, fontWeight:500,
                  cursor:'pointer', fontFamily:"'DM Sans',sans-serif",
                  background:'rgba(245,158,11,0.09)',
                  border:'1px solid rgba(245,158,11,0.3)',
                  color:'#92400e',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background='rgba(245,158,11,0.16)'; }}
                onMouseLeave={e => { e.currentTarget.style.background='rgba(245,158,11,0.09)'; }}
              >
                🔒 Lock Vault
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Locked banner */}
      {vault.locked && <LockedBanner vault={vault} stats={stats} />}

      {/* Tab bar */}
      <div style={{
        display:'flex', gap:3,
        background:'rgba(108,71,255,0.06)',
        border:'1px solid rgba(108,71,255,0.1)',
        borderRadius:100, padding:4, width:'fit-content', marginBottom:26,
      }}>
        {TABS.map(t => (
          <button
            key={t.id}
            className={`tab-item${tab === t.id ? ' active' : ''}`}
            onClick={() => setTab(t.id)}
            style={{
              padding:'9px 22px', borderRadius:100,
              fontSize:13, fontWeight:500, cursor:'pointer',
              fontFamily:"'DM Sans',sans-serif", border:'none',
              color: tab === t.id ? '#fff' : '#7b78a0',
              background: 'transparent',
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === 'gallery'  && <GalleryView  vault={vault} />}
      {tab === 'timeline' && <TimelineView vault={vault} />}
    </div>
  );
}

function LockedBanner({ vault, stats }) {
  return (
    <div
      className="fade-up"
      style={{
        borderRadius:24, overflow:'hidden',
        border:'1px solid rgba(245,158,11,0.25)',
        marginBottom:28,
      }}
    >
      <div style={{
        background:'linear-gradient(135deg,rgba(245,158,11,0.09),rgba(251,191,36,0.06))',
        padding:'28px 32px', textAlign:'center',
      }}>
        <div
          className="lock-ring"
          style={{
            width:72, height:72, borderRadius:'50%', margin:'0 auto 16px',
            background:'linear-gradient(135deg,rgba(245,158,11,0.15),rgba(251,191,36,0.1))',
            border:'1.5px solid rgba(245,158,11,0.3)',
            display:'flex', alignItems:'center', justifyContent:'center', fontSize:28,
          }}
        >
          🔒
        </div>
        <div style={{ fontFamily:"'Fraunces',serif", fontSize:22, fontWeight:700, color:'#92400e', marginBottom:8 }}>
          This memory is sealed
        </div>
        <div style={{ fontSize:13, color:'#a16207', lineHeight:1.65, maxWidth:420, margin:'0 auto 16px' }}>
          This vault is now a permanent time capsule. No further uploads or edits are allowed. Beautifully frozen in time.
        </div>
        <div style={{
          display:'inline-flex', alignItems:'center', gap:7,
          background:'rgba(245,158,11,0.12)', border:'1px solid rgba(245,158,11,0.3)',
          color:'#92400e', fontSize:12, fontWeight:500, padding:'6px 16px', borderRadius:100,
        }}>
          🕰 Sealed · {vault.lockedAt ? formatShortDate(vault.lockedAt) : 'recently'}
        </div>
      </div>

      {/* Stats footer */}
      <div style={{
        background:'#fff', padding:'14px 24px',
        borderTop:'1px solid rgba(245,158,11,0.12)',
        display:'flex', gap:24, flexWrap:'wrap', justifyContent:'center',
      }}>
        {[
          ['📸', stats.photos, 'memories preserved'],
          ['👥', vault.members.length, 'members'],
          ['❤️', stats.reactions, 'reactions'],
          ['💬', stats.comments, 'comments'],
        ].map(([icon, val, label]) => (
          <div key={label} style={{ fontSize:13, color:'#7b78a0', display:'flex', alignItems:'center', gap:5 }}>
            <span>{icon}</span>
            <strong style={{ color:'#0d0b18', fontWeight:500 }}>{val}</strong>
            {label}
          </div>
        ))}
      </div>
    </div>
  );
}
