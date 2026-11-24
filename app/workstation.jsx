'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { mediaPath } from './media';
import { makeWorkstationRelief, workstationAspect } from './workstation-depth';

const description = 'A clay figure wearing glasses sits behind a vintage computer under a desk lamp.';

export default function Workstation() {
  const host = useRef(null);
  const image = useRef(null);
  const requestDraw = useRef(null);
  const controls = useRef({ paused: false, yaw: 0, pitch: 0, drag: null });
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = host.current;
    const photograph = image.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true });
    if (!context) return;
    const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0, 0);
    element.append(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.01, 8);
    camera.position.z = 2;
    const texture = new THREE.Texture(photograph);
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.anisotropy = Math.min(8, renderer.capabilities.getMaxAnisotropy());
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const geometry = makeWorkstationRelief();
    const relief = new THREE.Mesh(geometry, material);
    scene.add(relief);
    const orbit = controls.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    let frame = 0;
    let clock = 0;
    let previousTime = null;
    let contextLost = false;
    let loaded = false;
    let disposed = false;

    function isMoving() {
      return visible && !motion.matches && !orbit.paused && !orbit.drag;
    }

    function render(time) {
      if (contextLost || !loaded) return;
      if (isMoving()) {
        clock += THREE.MathUtils.clamp((time - (previousTime ?? time)) / 1000, 0, 0.05);
        previousTime = time;
      } else {
        previousTime = null;
      }
      const sweep = Math.sin(clock * 0.82) * 0.10;
      const yaw = THREE.MathUtils.clamp(orbit.yaw + sweep, -0.27, 0.27);
      relief.rotation.set(orbit.pitch, yaw, 0);
      renderer.render(scene, camera);
    }

    function animate(time) {
      frame = 0;
      render(time);
      if (isMoving()) schedule();
    }

    function schedule() {
      if (loaded && visible && !contextLost && !frame) frame = requestAnimationFrame(animate);
    }

    function resize() {
      if (contextLost) return;
      const { clientWidth, clientHeight } = element;
      if (!clientWidth || !clientHeight) return;
      const aspect = clientWidth / clientHeight;
      const halfHeight = Math.max(0.5, aspect / (2 * workstationAspect)) * 1.06;
      camera.left = -halfHeight * aspect;
      camera.right = halfHeight * aspect;
      camera.top = halfHeight;
      camera.bottom = -halfHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(clientWidth, clientHeight);
      render(performance.now());
    }

    function onContextLost(event) {
      event.preventDefault();
      contextLost = true;
      setReady(false);
    }

    function onContextRestored() {
      contextLost = false;
      resize();
      setReady(loaded);
      schedule();
    }

    canvas.addEventListener('webglcontextlost', onContextLost);
    canvas.addEventListener('webglcontextrestored', onContextRestored);
    motion.addEventListener('change', schedule);
    requestDraw.current = schedule;
    const layout = new ResizeObserver(resize);
    layout.observe(element);
    const viewport = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      previousTime = null;
      schedule();
    });
    viewport.observe(element);
    resize();
    photograph.decode().then(() => {
      if (disposed) return;
      texture.needsUpdate = true;
      loaded = true;
      if (contextLost) return;
      resize();
      setReady(true);
      schedule();
    }).catch(() => { if (!disposed) setReady(false); });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      viewport.disconnect();
      layout.disconnect();
      motion.removeEventListener('change', schedule);
      requestDraw.current = null;
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  function turn(x, y) {
    controls.current.yaw = THREE.MathUtils.clamp(controls.current.yaw + x, -0.27, 0.27);
    controls.current.pitch = THREE.MathUtils.clamp(controls.current.pitch + y, -0.17, 0.17);
    requestDraw.current?.();
  }

  return (
    <figure className="workstation" data-ready={ready}>
      <div className="scene-label">{ready ? '3D scene' : 'Workstation'}</div>
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-preview">
        <img ref={image} className="scene-fallback" src={mediaPath('workstation.webp')} alt={description} width={1409} height={1116} fetchPriority="high" />
        <div className="scene-canvas" ref={host} tabIndex={ready ? 0 : undefined}
          role="region" aria-hidden={!ready} aria-label={`${description} Drag or use the arrow keys to tilt the scene.`}
          onPointerDown={(event) => {
            if (!ready || !event.isPrimary || event.button !== 0) return;
            event.currentTarget.setPointerCapture(event.pointerId);
            controls.current.drag = { x: event.clientX, y: event.clientY };
          }}
          onPointerMove={(event) => {
            const { drag } = controls.current;
            if (!event.isPrimary || !drag) return;
            turn((event.clientX - drag.x) * 0.004, (event.clientY - drag.y) * 0.003);
            controls.current.drag = { x: event.clientX, y: event.clientY };
          }}
          onLostPointerCapture={() => {
            controls.current.drag = null;
            requestDraw.current?.();
          }}
          onKeyDown={(event) => {
            const offsets = { ArrowLeft: [-0.08, 0], ArrowRight: [0.08, 0], ArrowUp: [0, -0.06], ArrowDown: [0, 0.06] };
            if (Object.hasOwn(offsets, event.key)) {
              event.preventDefault();
              turn(...offsets[event.key]);
            }
          }}
        />
      </div>
      <figcaption className="scene-caption">
        <span>{ready ? 'Drag to tilt' : 'Retro workstation'}</span>
        {ready && <button type="button" className="motion" onClick={() => {
          controls.current.paused = !controls.current.paused;
          setPaused(controls.current.paused);
          requestDraw.current?.();
        }}>{paused ? 'Resume rotation' : 'Pause rotation'}</button>}
      </figcaption>
    </figure>
  );
}
