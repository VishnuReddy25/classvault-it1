import React from 'react';

export default function MeshBackground() {
  return (
    <>
      <div className="mesh-bg">
        <div className="stars" />
        <div className="light-shaft" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        {/* Warm horizon glow at bottom — like sunlight on a classroom floor */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height: 120,
          background: 'linear-gradient(0deg, rgba(201,136,58,0.06) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
        {/* Chalkboard tint at top */}
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0,
          height: 80,
          background: 'linear-gradient(180deg, rgba(42,61,50,0.15) 0%, transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>
      <div className="grain" />
    </>
  );
}
