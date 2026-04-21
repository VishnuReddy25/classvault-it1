import React, { useState } from 'react';
import { useYearbook } from '../context/YearbookContext';

export default function ProfileNudge({ children }) {
  const { sessionStudent } = useYearbook();
  const [hovered, setHovered] = useState(false);

  if (!sessionStudent) return <>{children}</>;

  const isUnfilled =
    !sessionStudent.bio &&
    !sessionStudent.legacy &&
    !sessionStudent.superlative;

  if (!isUnfilled) return <>{children}</>;

  return (
    <div
      style={{ position: 'relative', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Subtle pulse indicator so user knows something is hoverable */}
      <div style={{
        position: 'absolute',
        top: -4,
        right: -4,
        width: 10,
        height: 10,
        borderRadius: '50%',
        background: '#f59e0b',
        boxShadow: '0 0 0 3px rgba(245,158,11,0.3)',
        zIndex: 10,
        animation: 'pulseDot 2s ease-in-out infinite',
      }} />

      {children}

      {hovered && (
        <div
          style={{
            position: 'fixed',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            background: 'rgba(15,10,30,0.95)',
            backdropFilter: 'blur(16px)',
            border: '1px solid rgba(124,58,237,0.4)',
            borderRadius: 16,
            padding: '16px 20px',
            minWidth: 220,
            fontSize: 13,
            color: '#fff',
            fontWeight: 500,
            boxShadow: '0 8px 40px rgba(124,58,237,0.35)',
            zIndex: 9999,
            fontFamily: "'DM Sans',sans-serif",
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <span style={{ fontSize: 14, fontWeight: 600 }}>Complete your profile</span>
          </div>
          <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.6)', marginBottom: 12, lineHeight: 1.5 }}>
            Add your bio, legacy, or superlative so classmates can remember you!
          </p>
          <a
            href="/yearbook"
            style={{
              display: 'inline-block',
              padding: '8px 14px',
              background: 'linear-gradient(135deg, #7c3aed, #4338ca)',
              color: '#fff',
              textDecoration: 'none',
              borderRadius: 10,
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Edit Profile →
          </a>
        </div>
      )}
    </div>
  );
}