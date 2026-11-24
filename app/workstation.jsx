'use client';

import { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

function terminalTexture() {
  const canvas = document.createElement('canvas');
  canvas.width = 768;
  canvas.height = 528;
  const ctx = canvas.getContext('2d');
  const glow = ctx.createLinearGradient(0, 0, 768, 528);
  glow.addColorStop(0, '#20371d');
  glow.addColorStop(1, '#0a140d');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 768, 528);
  ctx.fillStyle = '#b8f576';
  ctx.font = '26px monospace';
  ctx.fillText('FRANCIS@WORKSTATION', 48, 70);
  ctx.fillStyle = '#638c4d';
  ctx.fillRect(48, 94, 672, 2);
  ctx.fillText('> whoami', 48, 157);
  ctx.fillStyle = '#def4af';
  ctx.font = 'bold 57px monospace';
  ctx.fillText('FRANCIS', 48, 241);
  ctx.fillText('JEEVES', 48, 309);
  ctx.font = '26px monospace';
  ctx.fillStyle = '#a1d26e';
  ctx.fillText('DEVELOPER  /  DESIGNER', 48, 380);
  ctx.fillText('>', 48, 468);
  ctx.fillRect(86, 447, 22, 27);
  ctx.fillStyle = 'rgba(8, 14, 8, .19)';
  for (let y = 0; y < 528; y += 5) ctx.fillRect(0, y, 768, 1);
  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = 8;
  return texture;
}

function makeComputer() {
  const computer = new THREE.Group();
  const shell = new THREE.MeshStandardMaterial({ color: '#9c9c76', roughness: 0.76 });
  const plastic = new THREE.MeshStandardMaterial({ color: '#d2cba1', roughness: 0.72 });
  const dark = new THREE.MeshStandardMaterial({ color: '#30382b', roughness: 0.85 });
  const keycap = new THREE.MeshStandardMaterial({ color: '#b7b28e', roughness: 0.82 });
  const accent = new THREE.MeshStandardMaterial({ color: '#9fbb54', roughness: 0.75 });

  function box(size, position, material, radius = 0.05) {
    const mesh = new THREE.Mesh(new RoundedBoxGeometry(...size, 2, radius), material);
    mesh.position.set(...position);
    computer.add(mesh);
    return mesh;
  }

  box([3.15, 2.15, 1.4], [0, 0.38, -0.39], shell, 0.18);
  box([3.29, 2.24, 0.55], [0, 0.38, 0.26], plastic, 0.16);
  box([2.92, 1.84, 0.14], [0, 0.48, 0.545], dark, 0.12);
  const screen = new THREE.Mesh(
    new THREE.PlaneGeometry(2.65, 1.61),
    new THREE.MeshBasicMaterial({ map: terminalTexture() }),
  );
  screen.position.set(0, 0.48, 0.62);
  computer.add(screen);
  box([0.38, 0.055, 0.018], [-1.14, -0.56, 0.541], dark, 0.02);
  box([0.08, 0.06, 0.022], [1.27, -0.56, 0.543], new THREE.MeshBasicMaterial({ color: '#d4ff86' }), 0.025);

  for (let slot = 0; slot < 7; slot++) {
    box([0.016, 0.045, 0.63], [1.575, 0.98 - slot * 0.086, -0.45], dark, 0.007);
  }
  box([1.53, 0.25, 1.14], [0, -0.8, -0.18], dark, 0.06);
  box([2.15, 0.16, 1.37], [0, -0.97, -0.05], shell, 0.07);

  box([3.34, 0.16, 1.02], [-0.13, -0.97, 1.43], shell, 0.06);
  box([3.23, 0.09, 0.94], [-0.13, -0.875, 1.43], plastic, 0.05);
  const smallKey = new RoundedBoxGeometry(0.18, 0.08, 0.16, 1, 0.021);
  const space = new RoundedBoxGeometry(1.11, 0.08, 0.16, 1, 0.021);
  for (let row = 0; row < 4; row++) {
    for (let column = 0; column < 14; column++) {
      const isSpace = row === 3 && column === 4;
      if (row === 3 && column >= 5 && column <= 8) continue;
      const special = column === 0 || column === 13 || row === 3;
      const key = new THREE.Mesh(isSpace ? space : smallKey, special ? accent : keycap);
      key.position.set(-1.56 + column * 0.22 + (isSpace ? 0.44 : 0), -0.79, 1.13 + row * 0.19);
      computer.add(key);
    }
  }
  box([0.45, 0.19, 0.64], [1.99, -0.94, 1.36], plastic, 0.092);
  box([0.025, 0.024, 0.26], [1.99, -0.835, 1.49], dark, 0.01);
  return computer;
}

function makeShadow() {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = 128;
  const ctx = canvas.getContext('2d');
  const gradient = ctx.createRadialGradient(64, 64, 10, 64, 64, 64);
  gradient.addColorStop(0, 'rgba(0,0,0,.8)');
  gradient.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, 128, 128);
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(6.4, 5.5),
    new THREE.MeshBasicMaterial({ map: new THREE.CanvasTexture(canvas), transparent: true, depthWrite: false }),
  );
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, -1.068, 0.35);
  return shadow;
}

export default function Workstation() {
  const host = useRef(null);
  const requestDraw = useRef(null);
  const controls = useRef({ paused: false, yaw: -0.26, pitch: 0, drag: null });
  const [ready, setReady] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const element = host.current;
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('webgl2', { alpha: true, antialias: true });
    if (!context) return;
    const renderer = new THREE.WebGLRenderer({ canvas, context, alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0, 0);
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.28;
    element.append(canvas);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(33, 1, 0.1, 50);
    camera.position.set(0, 2.55, 9.4);
    camera.lookAt(0, -0.02, 0.2);
    scene.add(new THREE.HemisphereLight('#e9f1d0', '#5a5b32', 2.05));
    const key = new THREE.DirectionalLight('#fff2c5', 3.1);
    key.position.set(-3, 5, 4);
    scene.add(key);
    const rim = new THREE.DirectionalLight('#bfff78', 2.4);
    rim.position.set(3, 2, -4);
    scene.add(rim);
    const computer = makeComputer();
    scene.add(computer, makeShadow());
    const orbit = controls.current;
    const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let visible = true;
    let frame = 0;
    let clock = 0;
    let previousTime = null;
    let contextLost = false;

    function isMoving() {
      return visible && !motion.matches && !orbit.paused && !orbit.drag;
    }

    function render(time) {
      if (contextLost) return;
      if (isMoving()) {
        clock += THREE.MathUtils.clamp((time - (previousTime ?? time)) / 1000, 0, 0.05);
        previousTime = time;
      } else {
        previousTime = null;
      }
      const sweep = Math.sin(clock * 0.66) * 0.17;
      computer.rotation.set(orbit.pitch, orbit.yaw + sweep, 0);
      renderer.render(scene, camera);
    }

    function animate(time) {
      frame = 0;
      render(time);
      if (isMoving()) schedule();
    }

    function schedule() {
      if (visible && !contextLost && !frame) frame = requestAnimationFrame(animate);
    }

    function resize() {
      if (contextLost) return;
      const { clientWidth, clientHeight } = element;
      if (!clientWidth || !clientHeight) return;
      camera.aspect = clientWidth / clientHeight;
      camera.zoom = Math.min(1.08, camera.aspect / 1.03);
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
      setReady(true);
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
    setReady(true);
    schedule();

    return () => {
      cancelAnimationFrame(frame);
      viewport.disconnect();
      layout.disconnect();
      motion.removeEventListener('change', schedule);
      requestDraw.current = null;
      canvas.removeEventListener('webglcontextlost', onContextLost);
      canvas.removeEventListener('webglcontextrestored', onContextRestored);
      const resources = new Set();
      scene.traverse((item) => {
        if (!item.isMesh) return;
        resources.add(item.geometry).add(item.material);
        if (item.material.map) resources.add(item.material.map);
      });
      resources.forEach((resource) => resource.dispose());
      renderer.dispose();
      canvas.remove();
    };
  }, []);

  function turn(x, y) {
    controls.current.yaw += x;
    controls.current.pitch = THREE.MathUtils.clamp(controls.current.pitch + y, -0.45, 0.45);
    requestDraw.current?.();
  }

  return (
    <figure className="workstation" data-ready={ready}>
      <div className="scene-label">{ready ? '3D workstation' : 'Workstation'}</div>
      <div className="scene-grid" aria-hidden="true" />
      <div className="scene-fallback" aria-hidden="true">
        <div className="fallback-monitor"><span>FRANCIS@WORKSTATION</span><strong>FRANCIS<br />JEEVES</strong></div>
        <div className="fallback-stand" />
        <div className="fallback-keyboard" />
      </div>
      <div className="scene-canvas" ref={host} tabIndex={ready ? 0 : undefined}
        role="region" aria-label={ready ? 'Retro computer. Drag or use the arrow keys to rotate.' : 'Retro computer illustration'}
        onPointerDown={(event) => {
          if (!ready || !event.isPrimary || event.button !== 0) return;
          event.currentTarget.setPointerCapture(event.pointerId);
          controls.current.drag = { x: event.clientX, y: event.clientY };
        }}
        onPointerMove={(event) => {
          const { drag } = controls.current;
          if (!event.isPrimary || !drag) return;
          turn((event.clientX - drag.x) * 0.009, (event.clientY - drag.y) * 0.006);
          controls.current.drag = { x: event.clientX, y: event.clientY };
        }}
        onLostPointerCapture={() => {
          controls.current.drag = null;
          requestDraw.current?.();
        }}
        onKeyDown={(event) => {
          const offsets = { ArrowLeft: [-0.16, 0], ArrowRight: [0.16, 0], ArrowUp: [0, -0.12], ArrowDown: [0, 0.12] };
          if (Object.hasOwn(offsets, event.key)) {
            event.preventDefault();
            turn(...offsets[event.key]);
          }
        }}
      />
      <figcaption className="scene-caption">
        <span>{ready ? 'Drag to rotate' : 'Retro computer'}</span>
        {ready && <button type="button" className="motion" onClick={() => {
          controls.current.paused = !controls.current.paused;
          setPaused(controls.current.paused);
          requestDraw.current?.();
        }}>{paused ? 'Resume rotation' : 'Pause rotation'}</button>}
      </figcaption>
    </figure>
  );
}
