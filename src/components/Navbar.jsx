import React from 'react';
import { useApp } from '../context/AppContext';
import { useYearbook } from '../context/YearbookContext';
import ProfileNudge from './ProfileNudge';

export default function Navbar() {
  const { activeVault, exitVault } = useApp();
  const { sessionStudent } = useYearbook();

  if (!sessionStudent) return null;

  return (
    <nav style={{
      position: 'sticky', top: 0, zIndex: 50,
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '12px 24px',
      background: 'rgba(255,255,255,0.95)',
      backdropFilter: 'blur(12px)',
      borderBottom: '1px solid rgba(108,71,255,0.12)',
      boxShadow: '0 1px 0 rgba(108,71,255,0.06)',
    }}>
      <div style={{ fontFamily: "'Fraunces',serif", fontSize: 18, fontWeight: 700, color: '#6c47ff' }}>
        ClassVault ✦
      </div>

      {activeVault && (
        <button onClick={exitVault} style={{
          padding: '7px 16px', borderRadius: 100, fontSize: 13,
          background: 'rgba(108,71,255,0.08)',
          border: '1px solid rgba(108,71,255,0.2)',
          color: '#6c47ff', cursor: 'pointer',
          fontFamily: "'DM Sans',sans-serif",
        }}>
          ← Back to Vaults
        </button>
      )}

      <ProfileNudge>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
          <div style={{
            width: 34, height: 34, borderRadius: '50%',
            background: sessionStudent.gradient,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 700, color: '#fff',
            border: '2px solid rgba(108,71,255,0.2)',
          }}>
            {sessionStudent.initials}
          </div>
          <span style={{ fontSize: 13, fontWeight: 500, color: '#2d2a45' }}>
            {sessionStudent.name.split(' ')[0]}
          </span>
        </div>
      </ProfileNudge>
    </nav>
  );
}