import * as THREE from "/three.js-master/three.js-master/build/three.module.js";
const { Engine, World, Bodies, Runner } = Matter;
// 1) Physics setup
const engine = Engine.create();
const world = engine.world;
engine.world.gravity.y = 0;
const runner = Runner.create();
Runner.run(runner, engine);

const hudEl = document.getElementById("hud");
const hudRect = hudEl.getBoundingClientRect();

// thin but tall walls:
const wallThickness = 10;
const wallOpts = {
  isStatic: true,
  restitution: 1, // full bounce
  friction: 0,
  frictionAir: 0,
};

function createWalls() {
  const { left, top, width, height } = hudEl.getBoundingClientRect();
  return [
    Bodies.rectangle(
      left - wallThickness / 2,
      top + height / 2,
      wallThickness,
      height,
      wallOpts
    ),
    Bodies.rectangle(
      left + width + wallThickness / 2,
      top + height / 2,
      wallThickness,
      height,
      wallOpts
    ),
    Bodies.rectangle(
      left + width / 2,
      top - wallThickness / 2,
      width,
      wallThickness,
      wallOpts
    ),
    Bodies.rectangle(
      left + width / 2,
      top + height + wallThickness / 2,
      width,
      wallThickness,
      wallOpts
    ),
  ];
}
let walls = createWalls();
World.add(world, walls);

// keep track of dynamic node bodies
const dynamicNodes = [];
const buttonBodies = {};

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
window.addEventListener("resize", () => {
  World.remove(world, walls);
  walls = createWalls();
  World.add(world, walls);

  // update Three.js camera & renderer
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

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
  Object.entries(buttonBodies).forEach(([id, body]) => {
    const btn = document.getElementById(id);
    const r = btn.getBoundingClientRect();
    Matter.Body.setPosition(body, {
      x: r.left + r.width / 2,
      y: r.top + r.height / 2,
    });
  });

  dynamicNodes.forEach(({ el, body }) => {
    const parentRect = el.parentElement.getBoundingClientRect();
    const x = body.position.x - parentRect.left - el.offsetWidth / 2;
    const y = body.position.y - parentRect.top - el.offsetHeight / 2;
    el.style.transform = `translate(${x}px, ${y}px)`;
  });
  requestAnimationFrame(targetFrame);
}
targetFrame();

const PROXIMITY_RADIUS = 140;
function isWithinRadius(rect, x, y) {
  const dx = Math.max(rect.left - x, 0, x - rect.right);
  const dy = Math.max(rect.top - y, 0, y - rect.bottom);
  return dx * dx + dy * dy <= PROXIMITY_RADIUS * PROXIMITY_RADIUS;
}
function startProximityCheck(btn) {
  if (btn._proximityListener) return;
  const listener = (e) => {
    const { clientX: x, clientY: y } = e;
    if (isWithinRadius(btn.getBoundingClientRect(), x, y)) return;
    for (const node of btn._subNodes) {
      if (isWithinRadius(node.getBoundingClientRect(), x, y)) return;
    }
    btn.removeNodes();
    document.removeEventListener("mousemove", listener);
    delete btn._proximityListener;
  };
  btn._proximityListener = listener;
  document.addEventListener("mousemove", listener);
}
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
      label: "store",
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
      label: "arcade",
      type: "games",
      onClick: () => console.log("game selection"),
    },
    {
      icon: "experiment",
      label: "demo lab",
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
const separationAngle = Math.PI / 16; // 30° separation
const jitterAngle = Math.PI / 8; // ±10° jitter around each slot
const baseAngles = {
  "shop-btn": Math.PI / 1.4,
  "media-btn": Math.PI / 1.24,
  "arcade-btn": -Math.PI / 2,
  "login-btn": -Math.PI / 1.4,
  "logo-btn": Math.PI / 1.7,
};

const buttonEls = document.querySelectorAll("#hud .widget");
buttonEls.forEach((btn) => {
  btn.style.position = "relative";
  btn._subNodes = [];
  btn._toggled = false;

  // physics body for the button
  const rect = btn.getBoundingClientRect();
  const radius = rect.width / 2;
  const body = Bodies.circle(rect.left + radius, rect.top + radius, radius, {
    isStatic: true,
    inertia: Infinity,
    frictionAir: 0.02,
  });
  World.add(world, body);
  buttonBodies[btn.id] = body;

  // spawn & remove using btn._subNodes
  btn.spawnNodes = function () {
    if (this._subNodes.length) return this._subNodes;
    const rect = this.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const screenCX = window.innerWidth / 2;
    const screenCY = window.innerHeight / 2;
    const fullDist = Math.hypot(screenCX - cx, screenCY - cy);
    const buttonRad = rect.width / 2;
    const nodeRad = 124 / 2;
    const maxDist = Math.max(0, fullDist - (buttonRad + nodeRad));
    const angle0 =
      baseAngles[this.id] ?? Math.atan2(screenCY - cy, screenCX - cx);
    const configs = nodeConfigs[this.id] || [];
    configs.forEach((cfg, i) => {
      let dist;
      const dCfg = customDistances[this.id];
      if (Array.isArray(dCfg)) dist = dCfg[i];
      else if (dCfg) dist = dCfg.min + Math.random() * (dCfg.max - dCfg.min);
      else dist = ((i + 1) / (configs.length + 1)) * maxDist;
      const slot = (i - (configs.length - 1) / 2) * separationAngle;
      const jit = (Math.random() * 2 - 1) * jitterAngle;
      const angle = angle0 + slot + jit;
      const rawX = Math.cos(angle) * dist;
      const rawY = Math.sin(angle) * dist;
      const clX = Math.min(
        Math.max(rawX, nodeRad - cx),
        window.innerWidth - nodeRad - cx
      );
      const clY = Math.min(
        Math.max(rawY, nodeRad - cy),
        window.innerHeight - nodeRad - cy
      );
      const spawnX = cx + clX;
      const spawnY = cy + clY;

      const node = document.createElement("button");
      node.className = "sub-node";
      node.title = cfg.label;
      node.dataset.type = cfg.type;
      const icon = document.createElement("span");
      icon.className = "material-symbols-outlined";
      icon.textContent = cfg.icon;
      node.appendChild(icon);
      node.addEventListener("click", (e) => {
        e.stopPropagation();
        cfg.onClick(e, node, btn);
      });

      node.style.left = `${rect.width / 2 - node.offsetWidth / 2}px`;
      node.style.top = `${rect.height / 2 - node.offsetHeight / 2}px`;
      this.appendChild(node);
      registerNode(node, spawnX, spawnY);
      requestAnimationFrame(() => {
        node.style.transform = `translate(${clX}px, ${clY}px)`;
        node.style.opacity = "1";
      });
      this._subNodes.push(node);
    });
    return this._subNodes;
  };

  btn.removeNodes = function () {
    this._subNodes.forEach((node) => {
      const idx = dynamicNodes.findIndex((n) => n.el === node);
      if (idx !== -1) {
        World.remove(world, dynamicNodes[idx].body);
        dynamicNodes.splice(idx, 1);
      }
      node.style.transform = "translate(0,0)";
      node.style.opacity = "0";
      node.addEventListener("transitionend", () => node.remove(), {
        once: true,
      });
    });
    this._subNodes = [];
  };

  btn.addEventListener("mouseenter", () => {
    if (!btn._toggled && btn._subNodes.length === 0) {
      btn.spawnNodes();
      startProximityCheck(btn);
    }
  });
  /*btn.addEventListener("mouseleave", (e) => {
    if (!btn._toggled && !btn.contains(e.relatedTarget)) {
      btn.removeNodes();
      if (btn._proximityListener) {
        document.removeEventListener("mousemove", btn._proximityListener);
        delete btn._proximityListener;
      }
    }
  });*/
  btn.addEventListener("click", (e) => {
  e.stopPropagation();
  btn._toggled = !btn._toggled;

  if (btn._toggled) {
    // ON: spawn nodes…
    btn.spawnNodes();

    // …and remove any hover-proximity watcher so they never auto-tear
    if (btn._proximityListener) {
      document.removeEventListener("mousemove", btn._proximityListener);
      delete btn._proximityListener;
    }
  } else {
    // OFF: teardown exactly as before
    if (btn._proximityListener) {
      document.removeEventListener("mousemove", btn._proximityListener);
      delete btn._proximityListener;
    }
    btn.removeNodes();
  }
});
});

// === Random animation timings ===
document.querySelectorAll(".widget").forEach((btn) => {
  const fDur = (8 + Math.random() * 3).toFixed(1) + "s";
  const fDelay = (Math.random() * 4).toFixed(1) + "s";
  const sDur = (4 + Math.random() * 16).toFixed(1) + "s";
  const sDelay = (Math.random() * 1).toFixed(1) + "s";
  btn.style.setProperty("--float-dur", fDur);
  btn.style.setProperty("--float-delay", fDelay);
  btn.style.setProperty("--squish-dur", sDur);
  btn.style.setProperty("--squish-delay", sDelay);
});

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
});
