import React, { useEffect, useRef } from 'react';

export default function BackgroundAnimation() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;

    // Performance & Motion state
    let isTabActive = !document.hidden;
    let prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    let isScrolling = false;
    let scrollTimeout = null;
    let lastFrameTime = 0;
    const FRAME_INTERVAL = 33; // ~30 FPS limit for ultra-low GPU/CPU overhead

    let mouse = { x: null, y: null };
    let mouseOffset = { x: 0, y: 0 };
    let targetMouseOffset = { x: 0, y: 0 };

    const handleResize = () => {
      // Cap DPR to 1.25 max to prevent high-DPI canvas performance penalties
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      initElements();
    };

    let mouseMoveTicking = false;
    const handleMouseMove = (e) => {
      if (mouseMoveTicking) return;
      mouseMoveTicking = true;
      requestAnimationFrame(() => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
        const cx = window.innerWidth / 2;
        const cy = window.innerHeight / 2;
        targetMouseOffset.x = -(e.clientX - cx) * 0.02;
        targetMouseOffset.y = -(e.clientY - cy) * 0.02;
        mouseMoveTicking = false;
      });
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
      targetMouseOffset.x = 0;
      targetMouseOffset.y = 0;
    };

    // Pause canvas drawing during active page scrolling for butter-smooth 60+ FPS scroll
    const handleScroll = () => {
      isScrolling = true;
      if (scrollTimeout) clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
      }, 100);
    };

    const handleVisibilityChange = () => {
      isTabActive = !document.hidden;
    };

    const handleReducedMotionChange = (e) => {
      prefersReducedMotion = e.matches;
    };

    // Lightweight element configurations
    let particles = [];
    let spatialNodes = [];
    let houseOutlines = [];

    const colors = [
      'rgba(99, 102, 241, 0.22)',  // Indigo
      'rgba(16, 185, 129, 0.22)',  // Emerald
      'rgba(168, 85, 247, 0.22)'   // Purple
    ];

    class Particle {
      constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.18;
        this.vy = (Math.random() - 0.5) * 0.18;
        this.radius = Math.random() * 1.5 + 1;
        this.color = colors[Math.floor(Math.random() * colors.length)];
      }
      update(w, h) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < 0) this.x = w;
        else if (this.x > w) this.x = 0;
        if (this.y < 0) this.y = h;
        else if (this.y > h) this.y = 0;
      }
    }

    class SpatialNode {
      constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.015;
        this.size = Math.random() * 1.5 + 1.5;
      }
      update() {
        this.pulse += this.pulseSpeed;
      }
      draw(mx, my) {
        const rx = this.x + mx * 0.5;
        const ry = this.y + my * 0.5;
        const alpha = Math.sin(this.pulse) * 0.12 + 0.25;

        ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`;
        ctx.beginPath();
        ctx.arc(rx, ry, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    class HouseOutline {
      constructor(w, h) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.06;
        this.vy = (Math.random() - 0.5) * 0.06;
        this.size = Math.random() * 8 + 10;
      }
      update(w, h) {
        this.x += this.vx;
        this.y += this.vy;
        if (this.x < -30) this.x = w + 30;
        else if (this.x > w + 30) this.x = -30;
        if (this.y < -30) this.y = h + 30;
        else if (this.y > h + 30) this.y = -30;
      }
      draw(mx, my) {
        const rx = this.x + mx * 0.3;
        const ry = this.y + my * 0.3;
        const s = this.size;

        ctx.strokeStyle = 'rgba(99, 102, 241, 0.035)';
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(rx, ry - s * 0.4);
        ctx.lineTo(rx - s * 0.5, ry);
        ctx.lineTo(rx + s * 0.5, ry);
        ctx.closePath();
        ctx.rect(rx - s * 0.5, ry, s, s * 0.4);
        ctx.stroke();
      }
    }

    const initElements = () => {
      particles = [];
      spatialNodes = [];
      houseOutlines = [];

      const w = window.innerWidth;
      const h = window.innerHeight;
      
      // Feather-light counts: just enough for high-tech ambiance, zero lag
      const particleCount = 14;
      const nodeCount = 5;
      const houseCount = 3;

      for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle(w, h));
      }
      for (let i = 0; i < nodeCount; i++) {
        spatialNodes.push(new SpatialNode(w, h));
      }
      for (let i = 0; i < houseCount; i++) {
        houseOutlines.push(new HouseOutline(w, h));
      }
    };

    const animate = (timestamp) => {
      animationFrameId = requestAnimationFrame(animate);

      // Skip frame if tab is inactive, or if user is actively scrolling, or if time delta is too small
      if (!isTabActive || isScrolling) return;

      const elapsed = timestamp - lastFrameTime;
      if (elapsed < FRAME_INTERVAL) return;
      lastFrameTime = timestamp - (elapsed % FRAME_INTERVAL);

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      if (prefersReducedMotion) {
        spatialNodes.forEach(n => n.draw(0, 0));
        houseOutlines.forEach(h => h.draw(0, 0));
        return;
      }

      // Smooth mouse lerp
      mouseOffset.x += (targetMouseOffset.x - mouseOffset.x) * 0.06;
      mouseOffset.y += (targetMouseOffset.y - mouseOffset.y) * 0.06;

      const mx = mouseOffset.x;
      const my = mouseOffset.y;

      // Draw faint architectural houses
      for (let i = 0; i < houseOutlines.length; i++) {
        const ho = houseOutlines[i];
        ho.update(w, h);
        ho.draw(mx, my);
      }

      // Draw pulsing nodes
      for (let i = 0; i < spatialNodes.length; i++) {
        const sn = spatialNodes[i];
        sn.update();
        sn.draw(mx, my);
      }

      // Draw floating particles
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.update(w, h);
        const rx = p.x + mx * 0.4;
        const ry = p.y + my * 0.4;

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(rx, ry, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }

      // Batch linkages in a single stroke call with a smaller connection radius (85px)
      ctx.beginPath();
      ctx.strokeStyle = 'rgba(99, 102, 241, 0.035)';
      ctx.lineWidth = 0.5;
      const maxDistSq = 85 * 85;

      for (let i = 0; i < particles.length; i++) {
        const pi = particles[i];
        const pix = pi.x + mx * 0.4;
        const piy = pi.y + my * 0.4;

        for (let j = i + 1; j < particles.length; j++) {
          const pj = particles[j];
          const dx = pi.x - pj.x;
          const dy = pi.y - pj.y;

          if (Math.abs(dx) < 85 && Math.abs(dy) < 85) {
            if (dx * dx + dy * dy < maxDistSq) {
              const pjx = pj.x + mx * 0.4;
              const pjy = pj.y + my * 0.4;
              ctx.moveTo(pix, piy);
              ctx.lineTo(pjx, pjy);
            }
          }
        }
      }
      ctx.stroke();
    };

    window.addEventListener('resize', handleResize, { passive: true });
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });
    document.addEventListener('visibilitychange', handleVisibilityChange);

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    motionQuery.addEventListener('change', handleReducedMotionChange);

    handleResize();
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      if (scrollTimeout) clearTimeout(scrollTimeout);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('scroll', handleScroll, true);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      motionQuery.removeEventListener('change', handleReducedMotionChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 opacity-70"
      style={{
        width: '100vw',
        height: '100vh',
        transform: 'translateZ(0)'
      }}
    />
  );
}
