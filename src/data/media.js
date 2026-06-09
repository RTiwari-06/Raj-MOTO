// RT•MOTO — Central Media Configuration
// All image/video paths and content live here. Swap an asset: change one line.

export const MEDIA = {

  currentFocus: {
    label:    'CURRENTLY SHIPPING',
    project:  'RT•MOTO V2',
    subtitle: 'PORTFOLIO · 2026',
    seal:     'READY TO RACE',
  },

  driver: {
    name:     'RAJ TIWARI',
    role:     'FULL-STACK DEVELOPER',
    team:     'Independent · React / GSAP / Three.js',
    machine:  'KTM DUKE 250 BS6',
    season:   2026,
    location: 'Bengaluru, India',
  },

  philosophy: {
    tagline:     'REDEFINING LIMITS.',
    quote:       "The screen is the circuit. Code is the engine. Momentum is everything.",
    attribution: 'Raj Tiwari',
  },

  hero: {
    primary: '/base.jpg',
    reveal:  '/reveal.jpg',
  },

  // Showcase clip — the GoPro wheelie loop running behind the Story timeline
  showcase: {
    mp4:    '/ride-loop.mp4',
    webm:   '/ride-loop.webm',
    poster: '/ride-loop-poster.webp',
    label:  'FIELD FOOTAGE // GOPRO',
  },

  helmet: {
    sectionLabel: 'GEAR CHECK // IDENTITY',
    rider: {
      name:  'RAJ TIWARI',
      role:  'FULL-STACK DEVELOPER',
      tag:   'RT•MOTO // 2026',
    },
    machine: {
      model:   'KTM DUKE 250',
      variant: 'BS6',
      specs: [
        { label: 'Engine',  value: '248.8cc' },
        { label: 'Power',   value: '30 HP'   },
        { label: 'Torque',  value: '24 Nm'   },
        { label: 'Weight',  value: '167 kg'  },
      ],
    },
    philosophy: {
      quote:  'The screen is the circuit. Code is the engine. Momentum is everything.',
      author: 'Raj Tiwari',
    },
  },

  // Ride Archive — motorcycle memories, newest first
  rides: [
    {
      id:       'ride-duke-current',
      model:    'KTM DUKE 250',
      year:     '2024',
      category: 'Current Machine // BS6',
      src:      '/bike-1.jpg',
      accent:   '#D2FF00',
      tag:      'Daily Rider',
      tagline:  'Orange frame. Black tarmac. Every ride is a commit.',
      odometer: '20k kilometre',
      story: [
        "A raw, single-cylinder heartbeat. Thirty horses pulling you forward. Out here, streetlights are just strobes,",
        "And every gap in the traffic is a new apex waiting to be clipped. Vision locked. Motion blurred,",
        "This machine taught me one absolute truth: in this city, precision isn't an option. It’s survival.",
      ],
      specs: [
        { label: 'Engine',  value: '248.8cc'  },
        { label: 'Power',   value: '30 HP'    },
        { label: 'Torque',  value: '24 Nm'    },
        { label: 'Weight',  value: '167 kg'   },
      ],
    },
    {
      id:       'ride-highway-north',
      model:    'NH 44 Wheelie RUN',
      year:     '2024',
      category: 'Highway Stint // 480km',
      src:      '/bike-2.jpg',
      accent:   '#C0C0C0',
      tag:      'First Long POP',
      tagline:  'The first time the throttle stayed wide open for hours.',
      odometer: '480',
      story: [
        "National Highway 44. Four-thirty AM departure. Zero traffic. Maximum focus.",
        "480 kilometres of pure two-wheeled meditation.",
        "Returned different. Shipped the motion system the same night.",
      ],
      specs: [
        { label: 'Distance',  value: '480 km'   },
        { label: 'Duration',  value: '6.2 hrs'  },
        { label: 'Avg Speed', value: '78 km/h'  },
        { label: 'Weather',   value: 'Overcast' },
      ],
    },
    {
      id:       'ride-monsoon',
      model:    'MONSOON RUN',
      year:     '2024',
      category: 'Wet Tarmac // June',
      src:      '/bike-3.jpg',
      accent:   '#4FA8D5',
      tag:      'Weather Test',
      tagline:  'Wet roads demand more focus. So does production code.',
      odometer: '112',
      story: [
        "June monsoon. Bangalore rain at its heaviest.",
        "112km loop. Every corner demanding maximum respect for physics.",
        "Same discipline. Different medium.",
      ],
      specs: [
        { label: 'Distance', value: '112 km'    },
        { label: 'Temp',     value: '19°C'      },
        { label: 'Roads',    value: 'Wet'       },
        { label: 'Grip',     value: 'Stock MRF' },
      ],
    },
    {
      id:       'ride-home',
      model:    'HOME-CANDID',
      year:     '2023',
      category: 'HOME Climb // Dawn Patrol',
      src:      '/bike-4.jpg',
      accent:   '#FF6B35',
      tag:      'Altitude Run',
      tagline:  'Dawn. Fog. Hairpins. Best debugging session of the year.',
      odometer: '2562',
      story: [
        "PATNA,BIHAR. 78 metres above sea level. 62km of switchbacks.",
        "Set out at 4AM. Reached the summit for sunrise.",
        "Some problems are better solved at altitude.",
      ],
      specs: [
        { label: 'Distance', value: '2562 km'   },
        { label: 'Altitude', value: '78 m'      },
        { label: 'Hairpins', value: '47'        },
        { label: 'Depart',   value: '11:28 AM'  },
      ],
    },
  ],

  // Editorial spread — a mix of machine shots + off-track lifestyle moments.
  // `location` feeds the floating "VIEW // …" cursor. Missing imgs fall back to
  // a styled placeholder tile (e.g. the 3 AM Biryani run, to be shot).
  gallery: [
    { id: 1,  src: '/moto-fleet.webp',         label: 'The Fleet',     span: 'col-span-2 row-span-2', category: 'Machines',  location: 'Bengaluru' },
    { id: 2,  src: '/moto-group.webp',         label: 'The Crew',      span: 'col-span-1 row-span-2', category: 'Off Track', location: 'Post-Sprint' },
    { id: 3,  src: '/bike-1.jpg',              label: 'Duke Street',   span: 'col-span-1 row-span-1', category: 'Machine',   location: 'MG Road' },
    { id: 4,  src: '/moto-night-duo.webp',     label: 'Night Run',     span: 'col-span-1 row-span-1', category: 'Night',     location: '02:10 AM' },
    { id: 5,  src: '/media/gallery/biryani.jpg', label: '3 AM Biryani', span: 'col-span-1 row-span-1', category: 'Off Track', location: 'Shivaji Nagar' },
    { id: 6,  src: '/moto-night-helmet.webp',  label: 'Night Visor',   span: 'col-span-1 row-span-2', category: 'Mood',      location: 'Flyover' },
    { id: 7,  src: '/bike-2.jpg',              label: 'Highway North', span: 'col-span-2 row-span-1', category: 'On Road',   location: 'NH-44' },
    { id: 8,  src: '/moto-rider.webp',         label: 'Saddle Up',     span: 'col-span-1 row-span-1', category: 'Portrait',  location: 'RC 390' },
    { id: 9,  src: '/bike-3.jpg',              label: 'Monsoon Loop',  span: 'col-span-1 row-span-1', category: 'Mood',      location: 'Bengaluru' },
    { id: 10, src: '/bike-4.jpg',              label: 'Nandi Hills',   span: 'col-span-1 row-span-1', category: 'Altitude',  location: '1478 m' },
  ],

  actionCards: [
    { id: 1, src: '/moto-night-helmet.webp', label: 'Gear Up',   x: -190, y: 22, rotate: -14 },
    { id: 2, src: '/moto-night-duo.webp',    label: 'Night Run', x:  -95, y:  8, rotate:  -6 },
    { id: 3, src: '/moto-rider.webp',        label: 'Saddle Up', x:    0, y:  0, rotate:   0 },
    { id: 4, src: '/moto-fleet.webp',        label: 'The Fleet', x:   95, y:  8, rotate:   6 },
    { id: 5, src: '/moto-group.webp',        label: 'The Crew',  x:  190, y: 22, rotate:  14 },
    { id: 6, src: '/bike-1.jpg',             label: 'Duke Street',x:  285, y: 36, rotate:  22 },
  ],

  story: {
    src:    '/reveal.jpg',
    alt:    'Raj Tiwari — RT•MOTO platform',
    quote:  'The screen is the circuit. Every build is a race.',
    author: 'Raj Tiwari',
    badge:  'KTM Duke 250 BS6',
  },

  careerStats: {
    commits:    847,
    projects:   12,
    frameworks: 6,
    rides:      47,
  },

  // Developer tech stack — feeds the StatRevealSection grid.
  // 'level' is reframed as a riding state: REDLINE (mastered) → FULL THROTTLE →
  // HIGH GEAR → DAILY RIDER → ON THE GAS → WARMING UP → BREAK-IN (just started).
  technical: [
    {
      category: 'THE CHASSIS (React, Vite)',
      skills: [
        { name: 'React',         level: 'REDLINE'       },
        { name: 'Three.js',      level: 'FULL THROTTLE' },
        { name: 'GSAP',          level: 'FULL THROTTLE' },
        { name: 'TypeScript',    level: 'HIGH GEAR'     },
        { name: 'Tailwind CSS',  level: 'DAILY RIDER'   },
      ],
    },
    {
      category: 'THE ENGINE (Node.js)',
      skills: [
        { name: 'Node.js',       level: 'REDLINE'     },
        { name: 'Express',       level: 'HIGH GEAR'   },
        { name: 'PostgreSQL',    level: 'MID-CORNER'  },
        { name: 'MongoDB',       level: 'MID-CORNER'  },
        { name: 'REST APIs',     level: 'DAILY RIDER' },
      ],
    },
    {
      category: 'THE EXHAUST (GSAP, Three.js)',
      skills: [
        { name: 'GSAP',               level: 'FULL THROTTLE' },
        { name: 'Lenis',              level: 'REDLINE'       },
        { name: 'React Three Fiber',  level: 'ON THE GAS'    },
        { name: 'WebGL Shaders',      level: 'WARMING UP'    },
        { name: 'ScrollTrigger',      level: 'FULL THROTTLE' },
      ],
    },
    {
      category: 'THE GARAGE (Git, Vercel)',
      skills: [
        { name: 'Git',           level: 'DAILY RIDER' },
        { name: 'Vite',          level: 'DAILY RIDER' },
        { name: 'Figma',         level: 'HIGH GEAR'   },
        { name: 'Docker',        level: 'BREAK-IN'    },
        { name: 'Vercel',        level: 'DAILY RIDER' },
      ],
    },
  ],

  rawArchive: [
    { id: 'raw-1', src: '/media/gallery/IMG_20230611_180844_045.webp', category: 'RAW FEED // 2023' },
    { id: 'raw-2', src: '/media/gallery/IMG_20230903_150642.jpg', category: 'RAW FEED // 2023' },
    { id: 'raw-3', src: '/media/gallery/IMG_20240831_195216304.jpg', category: 'RAW FEED // 2024' },
    { id: 'raw-4', src: '/media/gallery/IMG_202408nenjwnj5098_HDR_AE.jpg', category: 'RAW FEED // 2024' },
    { id: 'raw-5', src: '/media/gallery/IMG_20260110_001153088_HDR_AE.jpg', category: 'RAW FEED // 2026' },
    { id: 'raw-6', src: '/media/gallery/IMG20230903161035.jpg', category: 'RAW FEED // 2023' },
    { id: 'raw-7', src: '/media/gallery/Screenshot_2023-10-17-23-33-12-635_org.videolan.vlc.jpg', category: 'RAW FEED // 2023' },
  ],

};
