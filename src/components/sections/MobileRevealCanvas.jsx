import { useEffect, useRef, useState } from 'react';
import { MEDIA } from '@/data/media';

/**
 * Lightweight HTML5 2D Canvas reveal for mobile/touch devices.
 * Bypasses Three.js to save memory/main-thread compute.
 */
export default function MobileRevealCanvas({ inView }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  
  // Smooth tracking coordinates using LERP
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const target = useRef({ x: 0.5, y: 0.5 });

  useEffect(() => {
    const img = new Image();
    img.src = MEDIA.hero.reveal;
    img.onload = () => { imageRef.current = img; };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: false });

    let rafId;
    const render = () => {
      if (!inView || !imageRef.current) {
        rafId = requestAnimationFrame(render);
        return;
      }

      // LERP
      mouse.current.x += (target.current.x - mouse.current.x) * 0.12;
      mouse.current.y += (target.current.y - mouse.current.y) * 0.12;

      const { width, height } = canvas;
      
      // Draw base (handled by the img behind in Hero.jsx, but we can draw it here for safety or keep it transparent)
      // Actually, we want to reveal the SECOND image (reveal.webp) over the first one.
      // So we clear and draw only the reveal part.
      ctx.clearRect(0, 0, width, height);

      ctx.save();
      
      // Diagonal Slash Mask
      const mx = mouse.current.x * width;
      const my = mouse.current.y * height;
      const slashSize = Math.max(width, height) * 0.4;
      
      ctx.beginPath();
      ctx.moveTo(mx - slashSize, my - slashSize);
      ctx.lineTo(mx + slashSize, my - slashSize);
      ctx.lineTo(mx - slashSize, my + slashSize);
      ctx.closePath();
      ctx.clip();

      // Draw the reveal image
      // Simple object-cover math
      const img = imageRef.current;
      const imgRatio = img.width / img.height;
      const canvasRatio = width / height;
      let drawW, drawH, drawX, drawY;

      if (imgRatio > canvasRatio) {
        drawH = height;
        drawW = height * imgRatio;
        drawX = (width - drawW) * 0.43; // Match object-position 43%
        drawY = 0;
      } else {
        drawW = width;
        drawH = width / imgRatio;
        drawX = 0;
        drawY = (height - drawH) * 0.46; // Match object-position 46%
      }

      ctx.drawImage(img, drawX, drawY, drawW, drawH);
      
      // Optional: sharp accent line at the edge of the slash
      ctx.strokeStyle = '#D2FF00';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(mx + slashSize, my - slashSize);
      ctx.lineTo(mx - slashSize, my + slashSize);
      ctx.stroke();

      ctx.restore();

      rafId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(rafId);
  }, [inView]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouch = (e) => {
      const touch = e.touches[0];
      const r = el.getBoundingClientRect();
      target.current.x = (touch.clientX - r.left) / r.width;
      target.current.y = (touch.clientY - r.top) / r.height;
    };

    el.addEventListener('touchstart', onTouch, { passive: true });
    el.addEventListener('touchmove', onTouch, { passive: true });
    
    return () => {
      el.removeEventListener('touchstart', onTouch);
      el.removeEventListener('touchmove', onTouch);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-auto">
      <canvas
        ref={canvasRef}
        width={window.innerWidth}
        height={window.innerHeight}
        className="w-full h-full object-cover"
      />
    </div>
  );
}
