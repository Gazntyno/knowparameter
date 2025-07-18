import * as THREE from "/three.js-master/three.js-master/build/three.module.js";
const { Engine, World, Bodies, Runner } = Matter;
// 1) Physics setup
const engine = Engine.create();
const world = engine.world;
engine.world.gravity.y = 0;
const runner = Runner.create();
Runner.run(runner, engine);

// keep track of dynamic node bodies
const dynamicNodes = [];

// === Three.js Setup ===
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("three-canvas"),
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
camera.position.set(0, 2, 5);

// create static bodies for buttons
document.querySelectorAll(".widget").forEach((btn) => {
  const rect = btn.getBoundingClientRect();
  const radius = rect.width / 2;
  const body = Bodies.circle(rect.left + radius, rect.top + radius, radius, {
    isStatic: true,
    restitution: 0.7,
  });
  World.add(engine.world, body);
});

// helper to register a node's physics body
function Node(el) {
  const pr = el.getBoundingClientRect();
  const r = pr.width / 2;
  const body = Bodies.circle(pr.left + r, pr.top + r, r, {
    restitution: 0.8,
    frictionAir: 0.02,
  });
  World.add(engine.world, body);
  dynamicNodes.push({ el, body });
}

// register physics body
function registerNode(el, x, y) {
  const r = el.offsetWidth / 2;
  const body = Bodies.circle(x, y, r, {
    restitution: 0.8,
    frictionAir: 0.02,
  });
  World.add(engine.world, body);
  dynamicNodes.push({ el, body });
}
// sync physics positions → DOM transforms

function targetFrame() {
  dynamicNodes.forEach(({ el, body }) => {
    const parentRect = el.parentElement.getBoundingClientRect();
    const x = body.position.x - parentRect.left - el.offsetWidth / 2;
    const y = body.position.y - parentRect.top - el.offsetHeight / 2;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  requestAnimationFrame(targetFrame);
}
targetFrame();
// 2) Customize distances: per-button arrays or random range
//    array => exact distances per index
//    object => {min, max} random between
const customDistances = {
  "shop-btn": [120, 130, 130],
  "media-btn": [140, 140, 160],
  "arcade-btn": [280, 250],
  "login-btn": [340],
  "control-btn": [],
  "logo-btn": [60, 60, 60, -60],
};

// 1) define per-button node setups:
const nodeConfigs = {
  "shop-btn": [
    {
      icon: "volunteer_activism",
      label: "donate",
      type: "donate",
      onClick: () => console.log("donate to technature"),
    },
    {
      icon: "store",
      label: "storefront",
      type: "store",
      onClick: () => console.log("loading store"),
    },
    {
      icon: "shopping_cart",
      label: "cart",
      type: "cart",
      onClick: () => console.log("view cart"),
    },
  ],
  "media-btn": [
    {
      icon: "newsmode",
      label: "blog",
      type: "blog",
      onClick: () => console.log("blog"),
    },
    {
      icon: "photo_library",
      label: "gallery",
      type: "gallery",
      onClick: () => console.log("art gallery"),
    },
    {
      icon: "music_note",
      label: "music",
      type: "muaic",
      onClick: () => console.log("music player"),
    },
  ],
  "arcade-btn": [
    {
      icon: "sports_esports",
      label: "games",
      type: "games",
      onClick: () => console.log("game selection"),
    },
    {
      icon: "experiment",
      label: "lab",
      type: "lab",
      onClick: () => console.log("demo lab"),
    },
  ],
  "control-btn": [],
  "login-btn": [
    {
      icon: "account_circle",
      label: "account",
      type: "account",
      onClick: () => console.log("account"),
    },
  ],
  "logo-btn": [
    {
      icon: "search",
      label: "search",
      type: "search",
      onClick: () => console.log("search technature"),
    },
    {
      icon: "info_i",
      label: "info",
      type: "info",
      onClick: () => console.log("info"),
    },
    {
      icon: "alternate_email",
      label: "contact",
      type: "contact",
      onClick: () => console.log("contact"),
    },
    {
      icon: "settings",
      label: "settings",
      type: "settings",
      onClick: () => console.log("settings"),
    },
  ],
  // add configs for other buttons as needed…
};

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
window.addEventListener("resize", () => {
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
window.tsParticles.load("hud-particles", {
  fpsLimit: 120,
  particles: {
    number: { value: 80 },
    color: { value: "#28a745" },
    shape: { type: "circle" },
    opacity: { value: 0.3 },
    size: { value: { min: 1, max: 9 } },
    move: {
      enable: true,
      speed: 0.4, // very slow drift
      direction: "none",
      random: true,
      outModes: { default: "out" },
    },
  },
  interactivity: {
    events: {
      onHover: { enable: true, mode: "grab" },
      onClick: { enable: true, mode: "push" },
    },
  },
  detectRetina: true,
});

// === tsParticles for dynamic cursor trail ===
window.tsParticles.load("cursor-particles", {
  fullScreen: { enable: false },
  fpsLimit: 120,
  particles: {
    number: { value: 0 },
    color: { value: "#28a745" },
    shape: { type: "circle" },
    size: { value: { min: 1, max: 3 }, random: true },
    opacity: {
      value: { min: 0.1, max: 0.5 },
      anim: { enable: true, speed: 1, opacity_min: 0, sync: false },
    },
    move: {
      enable: true,
      speed: 2,
      direction: "none",
      random: true,
      outMode: "destroy",
      straight: false,
    },
    life: { duration: { sync: false, value: 2 }, count: 1 },
  },
  interactivity: {
    detectsOn: "window",
    events: {
      onHover: { enable: true, mode: "trail" },
      onClick: { enable: false },
    },
    modes: {
      trail: { delay: 0.04, quantity: 3 },
    },
  },
  detectRetina: true,
});

// Updated function to include buttons + sub-nodes
// === Button grab-lines setup ===
const buttonEls = document.querySelectorAll("#hud .widget");

function collectGrabTargets() {
  const manual = [];
  buttonEls.forEach((btn) => {
    // main button center
    const rect = btn.getBoundingClientRect();
    manual.push({
      position: {
        x: rect.left + rect.width / 2,
        y: rect.top + rect.height / 2,
      },
      options: {
        move: { enable: false },
        size: { value: 0 },
        opacity: { value: 0 },
      },
    });

    // any spawned sub-nodes
    btn.querySelectorAll(".sub-node").forEach((node) => {
      const nr = node.getBoundingClientRect();
      manual.push({
        position: { x: nr.left + nr.width / 2, y: nr.top + nr.height / 2 },
        options: {
          move: { enable: false },
          size: { value: 0 },
          opacity: { value: 0 },
        },
      });
    });
  });
  console.log("Grab targets:", manual);
  return manual;
}

buttonEls.forEach((btn) => (btn.style.position = "relative"));
// === Hover sub-node effect ===
const hoverDistance = 140;
const separationAngle = Math.PI / 16; // 30° separation
const jitterAngle = Math.PI / 8; // ±10° jitter around each slot
const baseAngles = {
  "shop-btn": Math.PI / 1.4,
  "media-btn": Math.PI / 1.24,
  "arcade-btn": -Math.PI / 2,
  "login-btn": -Math.PI / 1.4,
  "logo-btn": Math.PI / 1.7,
};

const buttonBodies = {};
buttonEls.forEach((btn) => {
  let subNodes = [];
  const configs = nodeConfigs[btn.id] || [];
  const rect = btn.getBoundingClientRect();
  const radius = rect.width / 2;
  const body = Bodies.circle(rect.left + radius, rect.top + radius, radius, {
    isStatic: true,
    inertia: Infinity, // prevents rotation
    frictionAir: 0.02, // tiny damping
  });
  World.add(engine.world, body);
  buttonBodies[btn.id] = body;

  btn._toggled = false; // track each button’s toggle state
  btn.spawnNodes = spawnNodes; // expose spawnNodes
  btn.removeNodes = removeNodes; // expose removeNodes

  function spawnNodes() {
    if (subNodes.length > 0) return;

    const rect = btn.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const screenCX = window.innerWidth / 2;
    const screenCY = window.innerHeight / 2;
    const dxFull = screenCX - centerX;
    const dyFull = screenCY - centerY;
    const fullDist = Math.hypot(dxFull, dyFull);

    const buttonRadius = rect.width / 2;
    const nodeRadius = 124 / 2; // match your CSS .sub-node width:124px
    const margin = buttonRadius + nodeRadius;
    const maxDist = Math.max(0, fullDist - margin);

    const baseAngle =
      baseAngles[btn.id] !== undefined
        ? baseAngles[btn.id]
        : Math.atan2(screenCY - centerY, screenCX - centerX);

    configs.forEach((cfg, i) => {
      // ── 1) compute the proper distance PER NODE ──
      let dist;
      const distCfg = customDistances[btn.id];
      if (Array.isArray(distCfg)) {
        dist = distCfg[i];
      } else if (distCfg) {
        dist = distCfg.min + Math.random() * (distCfg.max - distCfg.min);
      } else {
        // evenly space nodes along the inward ray:
        // (i+1)/(N+1) gives fractions: e.g. 1/4, 2/4, 3/4 for N=3
        const N = configs.length;
        dist = ((i + 1) / (N + 1)) * maxDist;
      }

      // ── 2) spread & jitter ──
      const slotOffset = (i - (configs.length - 1) / 2) * separationAngle;
      const randJitter = (Math.random() * 2 - 1) * jitterAngle;
      const angle = baseAngle + slotOffset + randJitter;

      // ── 3) final offsets ──
      const offsetX = Math.cos(angle) * dist;
      const offsetY = Math.sin(angle) * dist;

      // ── 4) create the DOM node ──
      const node = document.createElement("button");
      node.className = "sub-node";

      node.title = cfg.label;
      node.dataset.type = cfg.type;
      const iconSpan = document.createElement("span");
      iconSpan.className = "material-symbols-outlined";
      iconSpan.textContent = cfg.icon;

      node.appendChild(iconSpan);
      node.addEventListener("click", (e) => {
        e.stopPropagation();
        cfg.onClick(e, node, btn);
      });

      // ── 5) position & add to DOM ──
      node.style.left = `${rect.width / 2 - node.offsetWidth / 2}px`;
      node.style.top = `${rect.height / 2 - node.offsetHeight / 2}px`;
      btn.appendChild(node);

      // ── 6) register physics body exactly at spawn point ──
      const spawnX = centerX + offsetX;
      const spawnY = centerY + offsetY;
      registerNode(node, spawnX, spawnY);

      // ── 7) kick off your CSS “fly-out” animation ──
      requestAnimationFrame(() => {
        node.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
        node.style.opacity = "1";
      });

      subNodes.push(node);
    });
  }

  function removeNodes() {
    subNodes.forEach((node) => {
      const idx = dynamicNodes.findIndex((n) => n.el === node);
      if (idx !== -1) {
        World.remove(engine.world, dynamicNodes[idx].body);
        dynamicNodes.splice(idx, 1);
      }

      node.style.transform = "translate(0,0)";
      node.style.opacity = "0";
      node.addEventListener("transitionend", () => node.remove(), {
        once: true,
      });
    });
    subNodes = [];
  }

  // hover only if not toggled on
  btn.addEventListener("mouseenter", () => {
    if (!btn._toggled && subNodes.length === 0) spawnNodes();
  });
  btn.addEventListener("mouseleave", () => {
    if (!btn._toggled) removeNodes();
  });

  // single click handler, toggles on/off
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    if (btn._toggled) {
      removeNodes();
    } else {
      spawnNodes();
    }
    btn._toggled = !btn._toggled;
  });
});

// 2) After the buttonEls.forEach(…) block, add:

const controlBtn = document.getElementById("control-btn");
let allToggled = false;

controlBtn.addEventListener("click", () => {
  allToggled = !allToggled;
  buttonEls.forEach((btn) => {
    if (btn.id === "control-btn") return;
    if (allToggled && !btn._toggled) {
      btn.spawnNodes();
      btn._toggled = true;
    }
    if (!allToggled && btn._toggled) {
      btn.removeNodes();
      btn._toggled = false;
    }
  });
});

document.querySelectorAll(".widget").forEach((btn) => {
  // random float time between 15s–25s, delay 0–2s
  const fDur = (8 + Math.random() * 3).toFixed(1) + "s";
  const fDelay = (Math.random() * 4).toFixed(1) + "s";

  // random squish time between 2s–5s, delay 0–1s
  const sDur = (4 + Math.random() * 16).toFixed(1) + "s";
  const sDelay = (Math.random() * 1).toFixed(1) + "s";

  btn.style.setProperty("--float-dur", fDur);
  btn.style.setProperty("--float-delay", fDelay);
  btn.style.setProperty("--squish-dur", sDur);
  btn.style.setProperty("--squish-delay", sDelay);

  // (optional) pick from multiple keyframes if you want truly different shapes:
  // const variant = Math.ceil(Math.random()*3);
  // btn.classList.add(`squish-variant-${variant}`);
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
