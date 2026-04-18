import React from 'react';
import { getInitials, nameGradient } from '../utils/helpers';

export default function MemberAvatars({ members = [], names = [], max = 4, size = 28 }) {
  const shown = members.slice(0, max);
  const extra = members.length - max;

  return (
    <div style={{ display: 'flex' }}>
      {shown.map((m, i) => (
        <div
          key={i}
          title={names[i] || m}
          style={{
            width: size, height: size, borderRadius: '50%',
            background: nameGradient(names[i] || m),
            border: '2px solid #fff',
            marginLeft: i === 0 ? 0 : -8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.36, fontWeight: 600, color: '#fff',
            boxShadow: '0 1px 5px rgba(0,0,0,0.12)',
            zIndex: shown.length - i,
            position: 'relative',
          }}
        >
          {getInitials(names[i] || m)}
        </div>
      ))}
      {extra > 0 && (
        <div
          style={{
            width: size, height: size, borderRadius: '50%',
            background: '#e5e7eb', border: '2px solid #fff',
            marginLeft: -8, zIndex: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: size * 0.32, fontWeight: 600, color: '#6b7280',
            boxShadow: '0 1px 5px rgba(0,0,0,0.1)',
          }}
        >
          +{extra}
        </div>
      )}
    </div>
  );
}
