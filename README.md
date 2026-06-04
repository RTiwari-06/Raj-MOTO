# RT•MOTO

## SAME RIDER TWO MACHINES

**Cinematic Interactive Experience — The Intersection of Code and Velocity.**

[Live Experience](https://rt-moto.vercel.app/) · [Performance Audit](#04--performance-engineering) · [Architecture](#05--architecture-overview)

![Banner Placeholder](https://via.placeholder.com/1200x600/0a0a0a/D2FF00?text=RT•MOTO+CINEMATIC+PREVIEW)

---

## 01 // THE PHILOSOPHY

RT•MOTO is not a portfolio. It is a cinematic investigation into the duality of identity — the transition from human to rider, from static code to mechanical momentum.

In a digital landscape saturated with generic templates and CRUD applications, RT•MOTO stands as a statement of **Creative Engineering**. It exists to prove that high-fidelity storytelling and production-grade performance are not mutually exclusive. The project treats the browser as a circuit, where every millisecond of frame-time is optimized and every interaction is a deliberate piece of a larger narrative.

---

## 02 // EXPERIENCE HIGHLIGHTS

### Identity Discovery Mechanism

The Hero experience is built on a custom WebGL shader system that facilitates a transition between two states: the human and the rider. This is not a visual effect; it is a mechanism for uncovering the core narrative of the repository.

### Choreographed Motion Design

Utilizing GSAP and ScrollTrigger, the entire experience is orchestrated as a single continuous sequence. From the tachometer-inspired boot sequence to the horizontal archive transitions, the motion feels weighted, intentional, and mechanical.

### Immersive 3D Telemetry

A scroll-driven 3D helmet scan provides a deep dive into the "Gear Check." This section utilizes React Three Fiber to synchronize 360° model rotation with HUD text reveals, creating a tactile sense of inspection and calibration.

### Cinematic Atmosphere

A combination of custom GLSL noise shaders, film grain overlays, and a brutalist editorial typography system ensures the experience feels like a premium digital publication rather than a standard website.

---

## 03 // HERO BREAKDOWN: THE SHIFT

The Hero section is the heart of the RT•MOTO narrative. It utilizes a dual-texture shader approach to explore identity:

* **`base.jpg` // The Human State:** Represents the static, terrestrial identity.
* **`reveal.jpg` // The Rider State:** Represents the mechanical, high-velocity identity.

The interaction uses a feathered radial mask and chromatic aberration to "reveal" the rider state as the user interacts with the canvas. It serves as a digital metaphor for the psychological shift that occurs when stepping onto a machine.

---

## 04 // PERFORMANCE ENGINEERING

RT•MOTO is engineered to run at 60FPS across all devices. The performance strategy is treated with the same rigor as the creative direction.

* **Manual Chunk Splitting:** Heavy dependencies (Three.js, GSAP, vendor libs) are isolated into separate chunks to optimize caching and reduce the initial JavaScript execution bottleneck.
* **On-Demand Rendering:** The WebGL frameloop is managed via `IntersectionObserver`. Canvas rendering is automatically paused when sections are off-screen, significantly reducing GPU/CPU load on mobile devices.
* **Lazy Loading Pipeline:** All sections below the fold are loaded asynchronous modules. Critical assets like the Hero textures are prioritized via `fetchpriority="high"` and preloads.
* **Zero-Rerender State:** High-frequency interaction data (mouse position, scroll velocity) is managed outside of the React render cycle using Zustand’s transient subscriptions, ensuring interaction latency (INP) remains negligible.

---

## 05 // ARCHITECTURE OVERVIEW

The repository is organized as a clean engineering system, separating visual presentation from motion orchestration and state management.

```text
src/
├── components/
│   ├── layout/         # Persistent UI (Navbar, Footer, Viewport Frame)
│   ├── sections/       # Narrative modules (Hero, The Machine, Helmet, Rides)
│   ├── ui/             # Reusable interactive primitives (RevealText, Marquee)
│   └── webgl/          # R3F components and GPU-accelerated layers
├── motion/             # Centralized motion tokens (Eases, Durations, Staggers)
├── shaders/            # GLSL programs (Fluid simulation, Hero reveal)
├── store/              # Multi-store Zustand architecture
├── hooks/              # Reusable logic (useParallax, interaction observers)
└── utils/              # Third-party integrations (Lenis, Scramble engine)
```

---

## 06 // TECHNOLOGY STACK

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 19, Vite 8, Tailwind CSS 4 |
| **Motion** | GSAP 3, ScrollTrigger, Lenis (Smooth Scroll) |
| **3D / Graphics** | Three.js, React Three Fiber, GLSL |
| **State** | Zustand |
| **Infrastructure** | Vercel (Speed Insights & Analytics) |

---

## 07 // MOBILE EXPERIENCE

Mobile is treated as a first-class target, not an afterthought.

* **Touch Philosophy:** Replaces hover-based reveals with scroll-triggered state changes.
* **Responsive Adaptation:** Layout hierarchy shifts from horizontal to vertical narratives without losing the "editorial" feel.
* **Thermal Management:** Reduced shader complexity and frameloop culling specifically optimized for mobile GPUs.

---

## 08 // DEVELOPMENT SETUP

```bash
# Clone the repository
git clone https://github.com/RTiwari-06/Raj-MOTO.git

# Install dependencies
npm install

# Start local development (Vite)
npm run dev

# Build for production
npm run build
```

---

## 09 // SHOWCASE

![Hero Preview](https://via.placeholder.com/800x450/0a0a0a/D2FF00?text=HERO+REVEAL+SYSTEM)

*Fig 1. Identity Discovery Mechanism*

![Helmet Preview](https://via.placeholder.com/800x450/0a0a0a/D2FF00?text=3D+HELMET+SECTION)

*Fig 2. Gear Check // 360° Inspection*

![Rides Preview](https://via.placeholder.com/800x450/0a0a0a/D2FF00?text=RIDES+SECTION)

*Fig 3. Horizontal Archive Archive*

---

## 10 // FUTURE EVOLUTION

* [ ] **Immersive Audio:** Engine-frequency driven spatial audio system.
* [ ] **Asset Upgrades:** High-fidelity 4K texture streaming.
* [ ] **Interaction Refinement:** Gesture-based navigation for tablet devices.
* [ ] **Extended Narrative:** Dynamic content integration for race-day telemetry.

---

## 11 // CREDITS

### Creative Direction and Engineering

[Raj Tiwari](https://github.com/RTiwari-06)

*Bengaluru, India // 2026*

---

### RT•MOTO // SYSTEM NOMINAL
