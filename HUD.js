import * as THREE from "/three.js-master/three.js-master/build/three.module.js";

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

function destroyButtonParticles() {
  window.tsParticles.dom().forEach((instance) => {
    if (instance.container?.id === "button-particles") {
      // Use optional chaining here
      instance.destroy();
    }
  });
}

/*function initButtonGrabLines() {
  const bp = document.getElementById("button-particles");
  console.log("button-particles container:", bp.getBoundingClientRect());
  // 1) destroy any previous instance
  destroyButtonParticles();
  
  const manual = collectGrabTargets();
console.log("grab targets:", manual.map(p => p.position));
  window.tsParticles.load("button-particles", {
    fpsLimit: 60,
    particles: {
      number: { value: 0 },
      links: {
        enable: true,
        distance: 200,
        color: "#ffffff",
        opacity: 0.6,
        width: 2,
      },
    },
    manualParticles: manual,
    interactivity: {
      detectsOn: "window",
      events: { onHover: { enable: true, mode: "grab" } },
      modes: { grab: { distance: 400, links: { opacity: 0.6 } } },
    },
    detectRetina: true,
  });

  const existing = window.tsParticles
    .dom()
    .find(
      (p) =>
        p.options && p.options.manualParticlesContainer === "button-particles"
    );
  if (existing) {
    existing.destroy();
  }

  // 2) build manualParticles array: one entry per button + per live sub-node
  buttonEls.forEach((btn) => {
    const r = btn.getBoundingClientRect();
    manual.push({
      position: { x: r.left + r.width / 2, y: r.top + r.height / 2 },
      options: {
        move: { enable: false },
        size: { value: 0 },
        opacity: { value: 0 },
      },
    });
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

  // 3) re-load tsParticles on #button-particles
}

// wire it up on load + resize
window.addEventListener("DOMContentLoaded", () => {
  initButtonGrabLines();
  window.addEventListener("resize", initButtonGrabLines);
});

*/


buttonEls.forEach((btn) => (btn.style.position = "relative"));
// === Hover sub-node effect ===
const hoverDistance = 280;
const numSubNodes = 3; // angles in degrees for node spread
const separationAngle = Math.PI / 4; // 30° separation
const jitterAngle = Math.PI / 18; // ±10° jitter around each slot

buttonEls.forEach((btn) => {
  let subNodes = 3;
  let toggled = false;
  

  btn.addEventListener("mouseenter", () => {
    if (!toggled) {
      // spawn on hover
      const btnWidth = btn.clientWidth;
      const btnHeight = btn.clientHeight;
      const screenCenterX = window.innerWidth / 2;
      const screenCenterY = window.innerHeight / 2;
      const rect = btn.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const angleToCenter = Math.atan2(
        screenCenterY - centerY,
        screenCenterX - centerX
      );
      subNodes = [];
      for (let i = 0; i < numSubNodes; i++) {
        const slotOffset = (i - (numSubNodes - 1) / 2) * separationAngle;
        const randomJitter = (Math.random() * 2 - 1) * jitterAngle;
        const angle = angleToCenter + slotOffset + randomJitter;
        const distance = hoverDistance * (0.8 + Math.random() * 0.2);
        const offsetX = Math.cos(angle) * distance;
        const offsetY = Math.sin(angle) * distance;

        const node = document.createElement("button");
        node.className = "sub-node";
        node.style.left = `${btnWidth / 2 - 25}px`;
        node.style.top = `${btnHeight / 2 - 25}px`;
        node.textContent = ["✦", "✧", "✩"][i];
        btn.appendChild(node);
        requestAnimationFrame(() => {
          node.style.transform = `translate(${offsetX}px, ${offsetY}px)`;
          node.style.opacity = "1";
        });
        subNodes.push(node);
      }
      //initButtonGrabLines();
    }
  });

  btn.addEventListener("mouseleave", () => {
    if (!toggled && subNodes) {
      subNodes.forEach((node) => {
        node.style.opacity = "0";
        node.style.transform = "translate(0,0)";
        node.addEventListener("transitionend", () => node.remove(), {
          once: true,
        });
      });
      subNodes = null;
    }
    //initButtonGrabLines();
  });

  btn.addEventListener("click", () => {
    if (toggled) {
      // smooth removal: reverse transform then fade
      subNodes.forEach((node) => {
        console.log(subNodes)
        // reset transform to origin
        node.style.transform = "translate(0, 0)";
        node.style.opacity = "0";
        node.addEventListener("transitionend", () => node.remove(), {
          once: true,
        });
      });
      subNodes = null;
      toggled = false;
    } else {
      // spawn if none, same smooth spawn as hover
      if (!subNodes) {
        const mouseEnterEvent = new Event("mouseenter");
        btn.dispatchEvent(mouseEnterEvent);
      }
      toggled = true;
      
    }
    subNodes.push(subNodes);
    //initButtonGrabLines();
  });

  btn._subNodes = subNodes;
  btn.addEventListener("mouseleave", () => {
    // Ensure _subNodes is an array before calling forEach
    if (Array.isArray(btn._subNodes)) {
      btn._subNodes.forEach((node) => {
        node.style.opacity = "0";
        node.style.transform = "translate(0,0)";
        node.addEventListener("transitionend", () => node.remove(), {
          once: true,
        });
      });
      delete btn._subNodes;
    }
  });

   document.querySelectorAll('.widget').forEach(btn => {
  // random float time between 15s–25s, delay 0–2s
  const fDur   = (8 + Math.random()*3).toFixed(1) + 's';
  const fDelay = (Math.random()*4).toFixed(1) + 's';

  // random squish time between 2s–5s, delay 0–1s
  const sDur   = (4 + Math.random()*16).toFixed(1) + 's';
  const sDelay = (Math.random()*1).toFixed(1) + 's';

  btn.style.setProperty('--float-dur',   fDur);
  btn.style.setProperty('--float-delay', fDelay);
  btn.style.setProperty('--squish-dur',  sDur);
  btn.style.setProperty('--squish-delay',sDelay);

  // (optional) pick from multiple keyframes if you want truly different shapes:
  // const variant = Math.ceil(Math.random()*3);
  // btn.classList.add(`squish-variant-${variant}`);
});
  

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
