import { useEffect, useRef } from 'react';

const MAX    = 10;
const LIFE   = 680;
const COLORS = [
  [245, 190, 90],
  [255, 215, 120],
  [230, 165, 70],
  [255, 240, 160],
  [210, 145, 55],
];

export default function CursorTrail() {
  const canvasRef = useRef(null);
  const sparks    = useRef([]);
  const rafRef    = useRef(null);
  const lastPos   = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const spawn = (x, y) => {
      if (sparks.current.length >= MAX) return;
      if (lastPos.current) {
        const dx = x - lastPos.current.x;
        const dy = y - lastPos.current.y;
        if (dx * dx + dy * dy < 36) return;
      }
      lastPos.current = { x, y };
      const col = COLORS[Math.floor(Math.random() * COLORS.length)];
      sparks.current.push({
        x, y,
        vx: (Math.random() - 0.5) * 1.4,
        vy: 0.5 + Math.random() * 1.4,
        r:  1.2 + Math.random() * 1.8,
        col,
        born: performance.now(),
        angle: Math.random() * Math.PI * 2,
        spin:  (Math.random() - 0.5) * 0.18,
        elongate: 0.4 + Math.random() * 0.6,
      });
    };

    const onMove = (e) => {
      const t = e.touches ? e.touches[0] : e;
      spawn(t.clientX, t.clientY);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('touchmove', onMove, { passive: true });

    const draw = (now) => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      sparks.current = sparks.current.filter(s => now - s.born < LIFE);

      sparks.current.forEach(s => {
        const age      = now - s.born;
        const progress = age / LIFE;
        const alpha    = (1 - progress) * 0.72;
        const scale    = 1 - progress * 0.5;

        s.x += s.vx;
        s.y += s.vy * (0.6 + progress * 0.4);
        s.vx *= 0.985;
        s.angle += s.spin;

        if (alpha <= 0) return;

        const [r, g, b] = s.col;
        const radius = s.r * scale;

        ctx.save();
        ctx.translate(s.x, s.y);
        ctx.rotate(s.angle);
        ctx.globalAlpha = alpha;

        ctx.beginPath();
        ctx.ellipse(0, 0, radius, radius * (0.3 + s.elongate * 0.7), 0, 0, Math.PI * 2);

        const grad = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.5);
        grad.addColorStop(0,   'rgba(' + r + ',' + g + ',' + b + ',1)');
        grad.addColorStop(0.5, 'rgba(' + r + ',' + g + ',' + b + ',0.5)');
        grad.addColorStop(1,   'rgba(' + r + ',' + g + ',' + b + ',0)');
        ctx.fillStyle = grad;
        ctx.fill();
        ctx.restore();
      });

      rafRef.current = requestAnimationFrame(draw);
    };
    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchmove', onMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        pointerEvents: 'none', display: 'block',
      }}
    />
  );
}
