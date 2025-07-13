import * as THREE from '/three.js-master/build/three.module.js';

// === Three.js Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById('three-canvas'),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 2, 5);

// Demo object — replace with your models or particle systems
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshStandardMaterial({ color: 0x28a745 });
const cube = new THREE.Mesh(geometry, material);
//scene.add(cube);

// Light
const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5, 10, 7);
scene.add(light);

// Resize handler
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});



// Animation loop
function animate() {
  requestAnimationFrame(animate);
  cube.rotation.y += 0.01;
  renderer.render(scene, camera);
}
animate();

// === tsParticles for HUD background effects ===
window.tsParticles.load('hud-particles', {
  fpsLimit: 120,
  particles: {
    number: { value: 80 },
    color: { value: '#28a745' },
    shape: { type: 'circle' },
    opacity: { value: 0.3 },
    size: { value: { min: 1, max: 9 } },
    move: {
      enable: true,
      speed: 0.4,           // very slow drift
      direction: 'none',
      random: true,
      outModes: { default: 'out' }
    }
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: 'grab' },
      onClick: { enable: true, mode: 'push' }
    }
  },
  detectRetina: true
});

// === tsParticles for dynamic cursor trail ===
window.tsParticles.load('cursor-particles', {
  fullScreen: { enable: false },
  fpsLimit: 120,
  particles: {
    number: { value: 0 },
    color: { value: '#28a745' },
    shape: { type: 'circle' },
    size: { value: { min: 1, max: 3 }, random: true },
    opacity: { value: { min: 0.1, max: 0.5 }, anim: { enable: true, speed: 1, opacity_min: 0, sync: false } },
    move: { enable: true, speed: 2, direction: 'none', random: true, outMode: 'destroy', straight: false },
    life: { duration: { sync: false, value: 2 }, count: 1 }
  },
  interactivity: {
    detectsOn: 'window',
    events: {
      onHover: { enable: true, mode: 'trail' },
      onClick: { enable: false }
    },
    modes: {
      trail: { delay: .04, quantity: 3 }
    }
  },
  detectRetina: true
});

// --- Custom grab-line effect for HUD button ---
const lineCanvas = document.getElementById('line-overlay');
const lineCtx    = lineCanvas.getContext('2d');

// Resize overlay to match window
function resizeOverlay() {
  lineCanvas.width  = window.innerWidth;
  lineCanvas.height = window.innerHeight;
}
window.addEventListener('resize', resizeOverlay);
resizeOverlay();

// Target HUD button
const mainBtn = document.getElementById('home-btn');
const maxDist = 300;  // Longer range than tsParticles

window.addEventListener('mousemove', (e) => {
  // Clear previous frame
  lineCtx.clearRect(0, 0, lineCanvas.width, lineCanvas.height);

  // Compute button center in screen coords
  const rect = mainBtn.getBoundingClientRect();
  const bx   = rect.left + rect.width  / 2;
  const by   = rect.top  + rect.height / 2;

  // Distance from cursor
  const dx   = e.clientX - bx;
  const dy   = e.clientY - by;
  const dist = Math.sqrt(dx*dx + dy*dy);

  // If within range, draw a fading line
  if (dist < maxDist) {
    const alpha = 1 - dist / maxDist;
    lineCtx.strokeStyle = `rgba(255,255,255,${alpha})`;
    lineCtx.lineWidth   = 2;
    lineCtx.beginPath();
    lineCtx.moveTo(e.clientX, e.clientY);
    lineCtx.lineTo(bx, by);
    lineCtx.stroke();
  }
});

// Navigation: Gallery button
document.getElementById('gallery-btn').addEventListener('click', () => {
  window.location.href = 'gallery.html';
});
/* 6) BONUS: Cursor‐pet in 3D space */
// raycaster & sprite or small 3D model following mouse...
// import { Raycaster, Vector2, SpriteMaterial, Sprite } from 'three';
// let raycaster = new THREE.Raycaster();
// let mouse     = new THREE.Vector2();
// window.addEventListener('mousemove', e => {
//   mouse.x = (e.clientX / window.innerWidth) * 2 - 1;
//   mouse.y = -(e.clientY / window.innerHeight) * 2 + 1;
// });
// // create a Sprite or small mesh, and in animate():
// // raycaster.setFromCamera(mouse, camera);
// // const intersects = raycaster.intersectObject(yourGroundPlane);
// // if (intersects[0]) pet.position.copy(intersects[0].point);
