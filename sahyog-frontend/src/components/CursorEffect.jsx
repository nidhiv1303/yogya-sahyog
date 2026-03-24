import { useEffect, useRef } from 'react';

export default function CursorEffect() {
  const dotRef   = useRef(null);
  const ringRef  = useRef(null);
  const mousePos = useRef({ x: 0, y: 0 });
  const ringPos  = useRef({ x: 0, y: 0 });
  const lastTrail = useRef(0);
  const rafRef   = useRef(null);

  useEffect(() => {
    const moveDot = (e) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      if (dotRef.current) {
        dotRef.current.style.left = e.clientX + 'px';
        dotRef.current.style.top  = e.clientY + 'px';
      }
      const now = Date.now();
      if (now - lastTrail.current > 32) {
        lastTrail.current = now;
        createTrail(e.clientX, e.clientY);
      }
    };

    const animateRing = () => {
      ringPos.current.x += (mousePos.current.x - ringPos.current.x) * 0.12;
      ringPos.current.y += (mousePos.current.y - ringPos.current.y) * 0.12;
      if (ringRef.current) {
        ringRef.current.style.left = ringPos.current.x + 'px';
        ringRef.current.style.top  = ringPos.current.y + 'px';
      }
      rafRef.current = requestAnimationFrame(animateRing);
    };

    const createTrail = (x, y) => {
      const trail = document.createElement('div');
      trail.className = 'cursor-trail';
      const size = Math.random() * 7 + 3;
      const isOrange = Math.random() > 0.5;
      const hue = isOrange ? '255, 111, 0' : '26, 35, 126';
      trail.style.cssText = `
        left: ${x}px; top: ${y}px;
        width: ${size}px; height: ${size}px;
        background: rgba(${hue}, ${(Math.random() * 0.4 + 0.2).toFixed(2)});
        box-shadow: 0 0 ${size * 2}px rgba(${hue}, 0.35);
      `;
      document.body.appendChild(trail);
      setTimeout(() => trail.remove(), 600);
    };

    const onMouseDown = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = 'translate(-50%,-50%) scale(0.55)';
        dotRef.current.style.boxShadow = '0 0 20px #FF6F00, 0 0 40px #FF6F00';
      }
      if (ringRef.current) {
        ringRef.current.style.transform = 'translate(-50%,-50%) scale(0.7)';
        ringRef.current.style.borderColor = 'rgba(255,111,0,0.9)';
      }
    };

    const onMouseUp = () => {
      if (dotRef.current) {
        dotRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
        dotRef.current.style.boxShadow = '0 0 10px #FF6F00, 0 0 20px #FF6F00';
      }
      if (ringRef.current) {
        ringRef.current.style.transform = 'translate(-50%,-50%) scale(1)';
        ringRef.current.style.borderColor = 'rgba(255,111,0,0.5)';
      }
    };

    const onEnterInteractive = () => {
      if (ringRef.current) {
        ringRef.current.style.width  = '52px';
        ringRef.current.style.height = '52px';
        ringRef.current.style.borderColor = 'rgba(255,111,0,0.8)';
        ringRef.current.style.background  = 'rgba(255,111,0,0.07)';
      }
    };

    const onLeaveInteractive = () => {
      if (ringRef.current) {
        ringRef.current.style.width  = '36px';
        ringRef.current.style.height = '36px';
        ringRef.current.style.borderColor = 'rgba(255,111,0,0.5)';
        ringRef.current.style.background  = 'transparent';
      }
    };

    const bindInteractives = () => {
      document.querySelectorAll('button, a, input, textarea, [role=button], select').forEach(el => {
        el.addEventListener('mouseenter', onEnterInteractive);
        el.addEventListener('mouseleave', onLeaveInteractive);
      });
    };

    document.addEventListener('mousemove', moveDot);
    document.addEventListener('mousedown', onMouseDown);
    document.addEventListener('mouseup', onMouseUp);
    rafRef.current = requestAnimationFrame(animateRing);

    bindInteractives();
    const observer = new MutationObserver(bindInteractives);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      document.removeEventListener('mousemove', moveDot);
      document.removeEventListener('mousedown', onMouseDown);
      document.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(rafRef.current);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      <div ref={dotRef}  className="cursor-dot"  />
      <div ref={ringRef} className="cursor-ring" />
    </>
  );
}
