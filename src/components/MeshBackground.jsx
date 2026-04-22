import React, { useEffect, useRef } from 'react';

export default function MeshBackground() {
  const canvasRef = useRef(null);
  const mouse     = useRef({ x: -9999, y: -9999 });
  const particles = useRef([]);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    /* ── resize ── */
    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    /* ── mouse ── */
    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      mouse.current = { x: t.clientX, y: t.clientY };
    };
    const onLeave = () => { mouse.current = { x: -9999, y: -9999 }; };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });
    window.addEventListener('mouseleave', onLeave);

    /* ── spawn particles ── */
    const COUNT = window.innerWidth < 600 ? 55 : 110;
    particles.current = Array.from({ length: COUNT }, () => makeParticle(canvas));

    /* ── animate ── */
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const mx = mouse.current.x;
      const my = mouse.current.y;

      particles.current.forEach(p => {
        /* drift */
        p.x += p.vx;
        p.y += p.vy;

        /* wrap around edges */
        if (p.x < -10) p.x = canvas.width  + 10;
        if (p.x > canvas.width  + 10) p.x = -10;
        if (p.y < -10) p.y = canvas.height + 10;
        if (p.y > canvas.height + 10) p.y = -10;

        /* pulse size */
        p.phase += p.phaseSpeed;
        const pulsed = p.r + Math.sin(p.phase) * p.r * 0.45;

        /* mouse repulsion */
        const dx = p.x - mx;
        const dy = p.y - my;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const REPEL = 120;
        if (dist < REPEL && dist > 0) {
          const force = (1 - dist / REPEL) * 1.8;
          p.x += (dx / dist) * force;
          p.y += (dy / dist) * force;
        }

        /* draw with radial glow */
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, pulsed * 3.5);
        grad.addColorStop(0,   `rgba(${p.rgb}, ${p.alpha})`);
        grad.addColorStop(0.4, `rgba(${p.rgb}, ${p.alpha * 0.4})`);
        grad.addColorStop(1,   `rgba(${p.rgb}, 0)`);

        ctx.beginPath();
        ctx.arc(p.x, p.y, pulsed * 3.5, 0, Math.PI * 2);
        ctx.fillStyle = grad;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <>
      {/* Canvas fireflies */}
      <canvas
        ref={canvasRef}
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          pointerEvents: 'none', display: 'block',
        }}
      />

      {/* Static CSS background layers on top */}
      <div className="mesh-bg" style={{ zIndex: 0 }}>
        <div className="stars" />
        <div className="light-shaft" />
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />
        <div className="orb orb-4" />
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 120,
          background: 'linear-gradient(0deg,rgba(201,136,58,0.06) 0%,transparent 100%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: 0, left: 0, right: 0, height: 80,
          background: 'linear-gradient(180deg,rgba(42,61,50,0.15) 0%,transparent 100%)',
          pointerEvents: 'none',
        }} />
      </div>
      <div className="grain" />
    </>
  );
}

/* ── particle factory ── */
function makeParticle(canvas) {
  /* warm amber / gold palette */
  const palettes = [
    '220, 160, 80',   /* warm amber */
    '245, 190, 100',  /* golden */
    '255, 210, 120',  /* bright gold */
    '200, 140, 60',   /* deep amber */
    '240, 200, 140',  /* pale straw */
    '255, 230, 160',  /* almost white gold */
  ];
  const rgb   = palettes[Math.floor(Math.random() * palettes.length)];
  const speed = 0.12 + Math.random() * 0.22;
  const angle = Math.random() * Math.PI * 2;
  return {
    x:          Math.random() * canvas.width,
    y:          Math.random() * canvas.height,
    r:          0.6 + Math.random() * 1.4,
    vx:         Math.cos(angle) * speed,
    vy:         Math.sin(angle) * speed,
    alpha:      0.12 + Math.random() * 0.28,
    rgb,
    phase:      Math.random() * Math.PI * 2,
    phaseSpeed: 0.008 + Math.random() * 0.016,
  };
}
