<div align="center">

<br>

```
 ██████╗ ████████╗ ● ███╗   ███╗ ██████╗ ████████╗ ██████╗
 ██╔══██╗╚══██╔══╝   ████╗ ████║██╔═══██╗╚══██╔══╝██╔═══██╗
 ██████╔╝   ██║      ██╔████╔██║██║   ██║   ██║   ██║   ██║
 ██╔══██╗   ██║      ██║╚██╔╝██║██║   ██║   ██║   ██║   ██║
 ██║  ██║   ██║   ●  ██║ ╚═╝ ██║╚██████╔╝   ██║   ╚██████╔╝
 ╚═╝  ╚═╝   ╚═╝      ╚═╝     ╚═╝ ╚═════╝    ╚═╝    ╚═════╝
```

**Cinematic interactive portfolio — where code meets velocity.**

Built by [Raj Tiwari](https://github.com/RTiwari-06) · Bengaluru, India

<br>

[![React](https://img.shields.io/badge/React_19-20232A?style=flat&logo=react&logoColor=61DAFB)](https://react.dev)
[![Three.js](https://img.shields.io/badge/Three.js-000000?style=flat&logo=three.js&logoColor=white)](https://threejs.org)
[![GSAP](https://img.shields.io/badge/GSAP-88CE02?style=flat&logo=greensock&logoColor=black)](https://gsap.com)
[![Vite](https://img.shields.io/badge/Vite_8-646CFF?style=flat&logo=vite&logoColor=white)](https://vite.dev)
[![Tailwind](https://img.shields.io/badge/Tailwind_4-06B6D4?style=flat&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)

</div>

---

> *"The screen is the circuit. Code is the engine. Momentum is everything."*

<br>

## The Experience

RT•MOTO is not a portfolio website. It's a cinematic digital experience — a fusion of motorsport-grade motion design, WebGL shader systems, and immersive scroll storytelling.

Every interaction is engineered. Every transition is intentional. The site moves like a machine: aggressive when it needs to be, precise when it counts.

<br>

## Architecture

```
src/
├── components/          # 20+ React components — each a self-contained section
│   ├── Hero.jsx         # Layered WebGL hero with shader reveal + parallax
│   ├── HelmetSection.jsx# Scroll-driven 3D helmet rotation (R3F + GSAP)
│   ├── RidesSection.jsx # Horizontal scroll archive with containerAnimation
│   ├── Loader.jsx       # Tachometer-style SVG loading gauge
│   └── ...
│
├── motion/
│   └── system.js        # Single source of truth — easing, duration, stagger,
│                         # scroll, velocity, and hover tokens
│
├── shaders/             # GLSL programs
│   ├── heroVertex.glsl
│   ├── heroFragment.glsl  # Mouse-reactive image reveal + chromatic aberration
│   ├── fluidVertex.glsl
│   └── fluidFragment.glsl # Organic fluid background simulation
│
├── store/               # Zustand — zero-rerender state for cursor, velocity, UI
├── hooks/               # useParallax — holographic depth on mouse move
├── data/                # media.js — centralized content config (swap one line)
└── utils/               # Lenis smooth scroll + text scramble engine
```

<br>

## Features

| Feature | Description |
|---|---|
| **WebGL Shader Reveal** | Mouse-reactive image transition with soft parallax and feathered reveal mask |
| **3D Helmet Section** | Scroll-scrubbed 360° helmet rotation with phased text reveals and accent light wash |
| **Tachometer Loader** | SVG gauge with live arc geometry, needle physics, and redline exit sequence |
| **Horizontal Rides Archive** | Pinned horizontal scroll with containerAnimation-synced reveals |
| **Fluid Background** | GLSL fluid simulation rendered via React Three Fiber |
| **G-Force Velocity Skew** | Lenis scroll velocity → GSAP quickTo → canvas skewX. Zero re-renders |
| **Holographic Parallax** | Multi-layer mouse-tracked depth via `data-depth` attributes |
| **Motion Toggle** | Runtime kill switch for all animations — accessibility-first |
| **Text Scramble** | Character-by-character decode effect on section entries |
| **Magnetic Cursor** | Custom cursor with hover states, magnetic pull on interactive elements |

<br>

## Motion Philosophy

The motion system is centralized in [`src/motion/system.js`](src/motion/system.js). No component hard-codes a duration, ease, or timing value.

```
EASE
├── precision    power4.out      Sharp arrivals — like braking into a corner
├── authority    expo.out        Cinematic weight — slow build, hard stop
├── momentum     power3.out      Default motion — smooth, weighted
├── hover        power2.out      Tactile, immediate
├── spring       back.out(1.4)   Elastic micro-interactions
├── exit         power4.in       Fast decisive departures
└── scrub        none            Pure scroll-position mapping

DUR
├── instant      0.12s           State indicators
├── feedback     0.25s           Hover swaps
├── fast         0.40s           Quick transitions
├── standard     0.70s           Default motion
├── cinematic    1.20s           Section reveals
└── epic         1.80s           Hero sequences
```

Every animation speaks the same language. Swap one token, the entire site responds.

<br>

## Stack

| Layer | Technology |
|---|---|
| **Framework** | React 19 |
| **Build** | Vite 8 |
| **3D** | Three.js + React Three Fiber + drei |
| **Animation** | GSAP 3 + ScrollTrigger |
| **Scroll** | Lenis |
| **Styling** | Tailwind CSS 4 |
| **State** | Zustand 5 |
| **Shaders** | Custom GLSL (vertex + fragment) |
| **Icons** | Lucide React |

<br>

## Getting Started

```bash
# Clone
git clone https://github.com/RTiwari-06/Raj-MOTO.git
cd Raj-MOTO

# Install
npm install

# Dev server
npm run dev
```

Open `http://localhost:5173` — the tachometer loader fires, then the experience begins.

<br>

## Deploy

Production-ready for static hosting.

```bash
npm run build     # → dist/
npm run preview   # local preview of production build
```

Optimized for **Vercel** and **Netlify** — zero-config deploy from the `main` branch.

<br>

## Roadmap

- [ ] Page transitions with route-based animations
- [ ] Sound design layer (engine idle, throttle response)
- [ ] Dark/light theme toggle with shader-aware transitions
- [ ] CMS integration for ride archive content
- [ ] Performance dashboard (Lighthouse CI)
- [ ] PWA support with offline-first architecture

<br>

---

<div align="center">

<br>

```
RT•MOTO // 2026
SYSTEM : NOMINAL
SIGNAL : OPEN
```

**Raj Tiwari** · Full-Stack Developer · Bengaluru, India

*Built to move. Engineered to ship.*

<br>

</div>
