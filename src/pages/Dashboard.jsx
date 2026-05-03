import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { useYearbook } from '../context/YearbookContext';
import MemberAvatars from '../components/MemberAvatars';
import TrustBadge from '../components/TrustBadge';
import CreateVaultModal from '../components/CreateVaultModal';
import VaultPasswordModal from '../components/VaultPasswordModal';

const COVER_GRADIENTS = {
  Trip:    'linear-gradient(135deg,#c7d2fe,#a5f3fc)',
  Party:   'linear-gradient(135deg,#fbcfe8,#fde68a)',
  College: 'linear-gradient(135deg,#bbf7d0,#a5f3fc)',
  Other:   'linear-gradient(135deg,#e9d5ff,#fbcfe8)',
  Locked:  'linear-gradient(135deg,#fef3c7,#fde68a)',
};

export default function Dashboard() {
  const { vaults, enterVault }      = useApp();
  const { sessionStudent, isAdmin } = useYearbook();

  const [showCreate,   setShowCreate]   = useState(false);
  const [pendingVault, setPendingVault] = useState(null);

  const firstName = sessionStudent ? sessionStudent.name.split(' ')[0] : 'there';

  /* ── Gate check before entering ── */
  const handleVaultClick = (vault) => {
    /* password-protected AND has a stored hash AND current user is NOT a member */
    const needsPassword =
      vault.privacy === 'password' &&
      vault.passwordHash &&
      !vault.memberNames?.includes(sessionStudent?.name);

    if (needsPassword) {
      setPendingVault(vault);  /* show password modal */
      return;
    }
    enterVault(vault.id);
  };

  return (
    <div style={{ position: 'relative', zIndex: 2, maxWidth: 960, margin: '0 auto', padding: 'clamp(24px,5vh,44px) clamp(16px,4vw,20px) 80px' }}>

      {/* Password modal */}
      {pendingVault && (
        <VaultPasswordModal
          vault={pendingVault}
          onSuccess={() => { enterVault(pendingVault.id); setPendingVault(null); }}
          onClose={() => setPendingVault(null)}
        />
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 40, flexWrap: 'wrap', gap: 16 }}>
        <div className="fade-up">
          <div style={{
            fontFamily: "'Playfair Display',serif",
            fontSize: 'clamp(28px,5vw,40px)', fontWeight: 700,
            lineHeight: 1.1, color: '#f0ead8', marginBottom: 8,
          }}>
            Hey {firstName} 👋<br />
            <span style={{
              background: 'linear-gradient(135deg,#c9883a,#e8a84c)',
              WebkitBackgroundClip: 'text', backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>Class Vaults</span>
          </div>
          <p style={{ fontSize: 15, color: 'rgba(240,234,216,0.45)', fontWeight: 300 }}>
            Private group memory spaces for your batch ✦
          </p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 16 }}>
            <TrustBadge icon="🔐" label="End-to-end private"      theme="green"  />
            <TrustBadge icon="🔒" label="PIN protected"            theme="purple" />
            <TrustBadge icon="🚫" label="No ads · No data selling" theme="blue"   />
          </div>
        </div>

        <button
          onClick={() => setShowCreate(true)}
          className="btn-amber"
          style={{
            padding: 'clamp(10px,2vw,13px) clamp(20px,4vw,28px)',
            borderRadius: 100, fontSize: 14, fontWeight: 700,
            fontFamily: "'DM Sans',sans-serif", flexShrink: 0,
          }}
        >
          + Create Vault
        </button>
      </div>

      {/* Grid */}
      {vaults.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px' }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>🔒</div>
          <h3 style={{ fontFamily: "'Playfair Display',serif", fontSize: 22, color: '#f0ead8', marginBottom: 10 }}>
            No vaults yet
          </h3>
          <p style={{ color: 'rgba(255,255,255,0.35)', fontSize: 15, lineHeight: 1.7, maxWidth: 320, margin: '0 auto 28px' }}>
            Create your first shared memory space for your batch.
          </p>
          <button
            onClick={() => setShowCreate(true)}
            className="btn-amber"
            style={{ padding: '13px 30px', borderRadius: 100, fontSize: 14, fontFamily: "'DM Sans',sans-serif" }}
          >
            + Create First Vault
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 18 }}>
          {vaults.map((v, i) => (
            <VaultCard
              key={v.id}
              vault={v}
              onClick={() => handleVaultClick(v)}
              delay={i * 0.07}
              currentUser={sessionStudent?.name}
              isAdmin={isAdmin}
            />
          ))}
          <CreateCard onClick={() => setShowCreate(true)} />
        </div>
      )}

      {showCreate && <CreateVaultModal onClose={() => setShowCreate(false)} />}
    </div>
  );
}

/* ── Vault card ─────────────────────────────────────────── */
function VaultCard({ vault: v, onClick, delay, currentUser, isAdmin }) {
  const { deleteVault }   = useApp();
  const [confirmDel, setConfirmDel] = useState(false);
  const [hov,        setHov]        = useState(false);

  const isCreator = v.memberNames?.[0] === currentUser;
  const isMember  = v.memberNames?.includes(currentUser);
  const canDelete = isCreator || isAdmin;

  const coverGrad = v.locked
    ? COVER_GRADIENTS.Locked
    : (COVER_GRADIENTS[v.theme] || COVER_GRADIENTS.Other);

  const handleDelete = (e) => {
    e.stopPropagation();
    if (!confirmDel) { setConfirmDel(true); return; }
    deleteVault(v.id);
  };

  const privacyLabel =
    v.locked           ? '🔒 Sealed'     :
    v.privacy === 'password' ? '🔑 Password'   :
    v.privacy === 'invite'   ? '🔗 Invite only' :
                               '🌐 Public';

  const privacyBg =
    v.locked                 ? 'rgba(245,158,11,0.85)'  :
    v.privacy === 'password' ? 'rgba(201,136,58,0.88)'  :
    v.privacy === 'invite'   ? 'rgba(59,130,246,0.78)'  :
                               'rgba(16,185,129,0.78)';

  /* Blur overlay on card for non-members of password vaults */
  const showLockOverlay =
    v.privacy === 'password' && v.passwordHash && !isMember && !v.locked;

  return (
    <div
      className="fade-up vault-card"
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => { setHov(false); setConfirmDel(false); }}
      style={{
        borderRadius: 22, overflow: 'hidden',
        cursor: 'pointer', animationDelay: `${delay}s`,
        position: 'relative',
      }}
    >
      {/* Cover area */}
      <div style={{
        height: 158, position: 'relative', overflow: 'hidden',
        background: coverGrad,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 58, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))' }}>
          {v.locked ? '🔒' : v.emoji}
        </span>

        {/* Password overlay for non-members */}
        {showLockOverlay && (
          <div style={{
            position: 'absolute', inset: 0,
            background: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(3px)',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 6,
          }}>
            <span style={{ fontSize: 30 }}>🔐</span>
            <span style={{
              fontFamily: "'Caveat',cursive",
              fontSize: 15, color: '#fff', fontWeight: 600,
            }}>
              Password required
            </span>
          </div>
        )}

        {/* Privacy badge */}
        <div style={{
          position: 'absolute', top: 10, right: 10,
          background: privacyBg, backdropFilter: 'blur(10px)',
          color: '#fff', fontSize: 10, fontWeight: 600,
          padding: '4px 12px', borderRadius: 100, letterSpacing: 0.3,
        }}>
          {privacyLabel}
        </div>

        {/* Delete */}
        {canDelete && (
          <button
            onClick={handleDelete}
            style={{
              position: 'absolute', top: 10, left: 10,
              padding: '4px 12px', borderRadius: 100,
              fontSize: 11, fontWeight: 600,
              background: confirmDel ? '#ef4444' : 'rgba(239,68,68,0.82)',
              border: 'none', color: '#fff',
              cursor: 'pointer', backdropFilter: 'blur(8px)',
              transition: 'all 0.18s',
              boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
            }}
          >
            {confirmDel ? '✓ Confirm' : '🗑 Delete'}
          </button>
        )}

        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 56,
          background: 'linear-gradient(0deg,rgba(14,11,7,0.5),transparent)',
        }} />
      </div>

      {/* Body */}
      <div style={{ padding: '16px 18px 18px' }}>
        <div style={{
          fontFamily: "'Playfair Display',serif",
          fontSize: 17, fontWeight: 700,
          color: '#f0ead8', marginBottom: 10, lineHeight: 1.2,
        }}>
          {v.name}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <MemberAvatars members={v.members} names={v.memberNames} max={4} size={26} />
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>
            {v.memories?.length || 0} photos
          </span>
        </div>

        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, color: '#3ab89a', fontWeight: 600,
          background: 'rgba(58,184,154,0.08)',
          border: '1px solid rgba(58,184,154,0.2)',
          padding: '3px 10px', borderRadius: 100,
        }}>
          🔐 Members only
        </div>

        {isCreator && (
          <div style={{ marginTop: 7, fontSize: 11, color: 'rgba(201,136,58,0.55)', fontWeight: 600 }}>
            ✦ You created this vault
          </div>
        )}
        {isMember && !isCreator && (
          <div style={{ marginTop: 7, fontSize: 11, color: 'rgba(58,184,154,0.55)', fontWeight: 600 }}>
            ✦ You're a member
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Create card ────────────────────────────────────────── */
function CreateCard({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        borderRadius: 22, minHeight: 240,
        border: `1.5px dashed ${hov ? 'rgba(201,136,58,0.55)' : 'rgba(201,136,58,0.2)'}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center', gap: 12,
        cursor: 'pointer',
        background: hov ? 'rgba(201,136,58,0.05)' : 'transparent',
        transform: hov ? 'translateY(-4px)' : 'none',
        transition: 'all 0.25s',
      }}
    >
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        background: hov ? 'rgba(201,136,58,0.15)' : 'rgba(201,136,58,0.07)',
        border: `1.5px solid ${hov ? 'rgba(201,136,58,0.5)' : 'rgba(201,136,58,0.2)'}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24, color: '#c9883a', transition: 'all 0.25s',
        boxShadow: hov ? '0 0 20px rgba(201,136,58,0.18)' : 'none',
      }}>+</div>
      <div style={{
        fontSize: 14, fontWeight: 500,
        color: hov ? '#e8a84c' : 'rgba(201,136,58,0.5)',
        transition: 'color 0.25s',
      }}>
        Create new vault
      </div>
    </div>
  );
}
