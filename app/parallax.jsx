'use client';

import { useEffect, useRef } from 'react';

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function offset(element, property, value) {
  element.style.setProperty(property, `${value.toFixed(2)}px`);
}

export default function Parallax({ children }) {
  const main = useRef(null);

  useEffect(() => {
    const container = main.current;
    const hero = container.querySelector('.hero-stage');
    const media = [...container.querySelectorAll('[data-parallax-media]')];
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    let pointer = null;
    let frame = 0;

    function render() {
      frame = 0;
      if (reducedMotion.matches) return;

      const bounds = hero.getBoundingClientRect();
      const viewportHeight = window.innerHeight;
      if (bounds.bottom > 0 && bounds.top < viewportHeight) {
        const scrolled = clamp(-bounds.top, 0, bounds.height);
        const x = pointer ? clamp((pointer.x - bounds.left) / bounds.width - 0.5, -0.5, 0.5) : 0;
        const y = pointer ? clamp((pointer.y - bounds.top) / bounds.height - 0.5, -0.5, 0.5) : 0;
        offset(hero, '--depth-x', x * 38);
        offset(hero, '--depth-y', scrolled * 0.31 + y * 28);
        offset(hero, '--grid-y', scrolled * 0.13 - y * 16);
        offset(hero, '--model-y', Math.min(scrolled * 0.12, 64));
      }

      for (const element of media) {
        const rect = element.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > viewportHeight) continue;
        const center = (rect.top + rect.height / 2) / viewportHeight;
        const travel = Math.min(rect.height * 0.105, 42);
        offset(element, '--media-y', clamp((0.5 - center) * 2, -1, 1) * travel);
      }
    }

    function schedule() {
      if (!frame && !reducedMotion.matches) frame = requestAnimationFrame(render);
    }

    function move(event) {
      if (!finePointer.matches || event.pointerType === 'touch') return;
      pointer = { x: event.clientX, y: event.clientY };
      schedule();
    }

    function resetPointer() {
      pointer = null;
      schedule();
    }

    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    reducedMotion.addEventListener('change', schedule);
    finePointer.addEventListener('change', resetPointer);
    hero.addEventListener('pointermove', move, { passive: true });
    hero.addEventListener('pointerleave', resetPointer);
    const layout = new ResizeObserver(schedule);
    layout.observe(container);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      layout.disconnect();
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      reducedMotion.removeEventListener('change', schedule);
      finePointer.removeEventListener('change', resetPointer);
      hero.removeEventListener('pointermove', move);
      hero.removeEventListener('pointerleave', resetPointer);
    };
  }, []);

  return <main id="main" ref={main}>{children}</main>;
}
