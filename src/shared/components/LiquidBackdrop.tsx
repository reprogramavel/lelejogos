import { useEffect } from 'react';

const surfaces = '.floating-navbar, .modal';

function useGlassLight() {
  useEffect(() => {
    const enabled = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
    let frame = 0;
    let panel: HTMLElement | null = null;
    let pending: { panel: HTMLElement; x: number; y: number } | null = null;

    function reset() {
      if (frame) window.cancelAnimationFrame(frame);
      frame = 0;
      pending = null;
      panel?.style.removeProperty('--glass-x');
      panel?.style.removeProperty('--glass-y');
      panel = null;
    }

    function move(event: PointerEvent) {
      if (event.pointerType !== 'mouse' || !(event.target instanceof Element)) return;
      const target = event.target.closest<HTMLElement>(surfaces);
      if (!target) { reset(); return; }
      pending = { panel: target, x: event.clientX, y: event.clientY };
      if (frame) return;
      frame = window.requestAnimationFrame(() => {
        frame = 0;
        if (!pending?.panel.isConnected) return;
        if (panel !== pending.panel) {
          panel?.style.removeProperty('--glass-x');
          panel?.style.removeProperty('--glass-y');
        }
        panel = pending.panel;
        const bounds = panel.getBoundingClientRect();
        if (!bounds.width || !bounds.height) return;
        const x = Math.max(0, Math.min(100, (pending.x - bounds.left) / bounds.width * 100));
        const y = Math.max(0, Math.min(100, (pending.y - bounds.top) / bounds.height * 100));
        panel.style.setProperty('--glass-x', `${x.toFixed(1)}%`);
        panel.style.setProperty('--glass-y', `${y.toFixed(1)}%`);
      });
    }

    function update() {
      window.removeEventListener('pointermove', move);
      reset();
      if (enabled.matches) window.addEventListener('pointermove', move, { passive: true });
    }

    update();
    enabled.addEventListener('change', update);
    window.addEventListener('blur', reset);
    return () => {
      enabled.removeEventListener('change', update);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('blur', reset);
      reset();
    };
  }, []);
}

export function LiquidBackdrop() {
  useGlassLight();
  return <div className="liquid-backdrop" aria-hidden="true">
    <div className="liquid-orb orb-mint"/>
    <div className="liquid-orb orb-water"/>
    <div className="liquid-orb orb-pearl"/>
    <div className="liquid-ribbon ribbon-top"/>
    <div className="liquid-ribbon ribbon-bottom"/>
  </div>;
}
