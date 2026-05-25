// RT•MOTO — Central Media Configuration
// All image/video paths and content live here. Swap an asset: change one line.

export const MEDIA = {

  currentFocus: {
    label:    'CURRENTLY SHIPPING',
    project:  'RT•MOTO V2',
    subtitle: 'PORTFOLIO · 2026',
    seal:     'FULL-STACK SINCE 2022',
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
      odometer: '8.4k',
      story: [
        "The KTM Duke 250 BS6. Bengaluru's concrete jungle meets aggressive geometry.",
        "Single-cylinder. 30 horses. Every traffic gap is an apex.",
        "The bike that taught me: precision isn't optional.",
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
      model:    'NH 44 RUN',
      year:     '2024',
      category: 'Highway Stint // 480km',
      src:      '/bike-2.jpg',
      accent:   '#C0C0C0',
      tag:      'First Long Haul',
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
      id:       'ride-nandi',
      model:    'NANDI HILLS',
      year:     '2023',
      category: 'Hill Climb // Dawn Patrol',
      src:      '/bike-4.jpg',
      accent:   '#FF6B35',
      tag:      'Altitude Run',
      tagline:  'Dawn. Fog. Hairpins. Best debugging session of the year.',
      odometer: '62',
      story: [
        "Nandi Hills. 1,478 metres above sea level. 62km of switchbacks.",
        "Set out at 4AM. Reached the summit for sunrise.",
        "Some problems are better solved at altitude.",
      ],
      specs: [
        { label: 'Distance', value: '62 km'      },
        { label: 'Altitude', value: '1,478 m'    },
        { label: 'Hairpins', value: '47'         },
        { label: 'Depart',   value: '04:00 AM'   },
      ],
    },
    {
      id:       'ride-night',
      model:    'NIGHT SHIFT',
      year:     '2024',
      category: 'City Loop // After Hours',
      src:      '/reveal.jpg',
      accent:   '#8E44AD',
      tag:      'After Midnight',
      tagline:  'When the city sleeps, the roads open up.',
      odometer: '38',
      story: [
        "After a 14-hour sprint session. Midnight. The city emptied out.",
        "38km of Bengaluru ring road at 120km/h.",
        "Motion blur for real. GSAP for everything else.",
      ],
      specs: [
        { label: 'Distance', value: '38 km'    },
        { label: 'Time',     value: '00:30 AM' },
        { label: 'Traffic',  value: 'Zero'     },
        { label: 'Max Spd',  value: '122 km/h' },
      ],
    },
    {
      id:       'ride-first',
      model:    'FIRST RIDE',
      year:     '2023',
      category: 'Delivery Day // KTM Showroom',
      src:      '/base.jpg',
      accent:   '#FF8700',
      tag:      'Day One',
      tagline:  'Bengaluru, 2023. First engine start. Everything starts here.',
      odometer: '0001',
      story: [
        "Delivery day. KTM showroom, Bengaluru. Odometer: 0001.",
        "Every developer-rider remembers the first cold start.",
        "The orange matches the commit log highlight. Coincidence. Definitely.",
      ],
      specs: [
        { label: 'Date',   value: 'Dec 2023' },
        { label: 'Odo',    value: '0001 km'  },
        { label: 'Mood',   value: 'Euphoric' },
        { label: 'Status', value: 'Day One'  },
      ],
    },
  ],

  gallery: [
    { id: 1, src: '/bike-1.jpg', label: 'Duke Street',   span: 'col-span-1 row-span-2', category: 'Machine'   },
    { id: 2, src: '/bike-2.jpg', label: 'Highway North', span: 'col-span-1 row-span-1', category: 'On Road'   },
    { id: 3, src: '/bike-3.jpg', label: 'Monsoon Loop',  span: 'col-span-1 row-span-1', category: 'Mood'      },
    { id: 4, src: '/bike-4.jpg', label: 'Nandi Hills',   span: 'col-span-2 row-span-1', category: 'Altitude'  },
    { id: 5, src: '/reveal.jpg', label: 'Night Shift',   span: 'col-span-1 row-span-2', category: 'After Hrs' },
    { id: 6, src: '/base.jpg',   label: 'Day One',       span: 'col-span-1 row-span-1', category: 'Origins'   },
  ],

  actionCards: [
    { id: 1, src: '/bike-2.jpg', label: 'Highway Run', x: -190, y: 22, rotate: -14 },
    { id: 2, src: '/bike-3.jpg', label: 'Monsoon',     x:  -95, y:  8, rotate:  -6 },
    { id: 3, src: '/bike-4.jpg', label: 'Nandi Hills', x:    0, y:  0, rotate:   0 },
    { id: 4, src: '/bike-1.jpg', label: 'Duke 250',    x:   95, y:  8, rotate:   6 },
    { id: 5, src: '/reveal.jpg', label: 'Night Shift', x:  190, y: 22, rotate:  14 },
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

  // Developer tech stack — feeds the StatRevealSection grid
  technical: [
    {
      category: 'FRONTEND',
      skills: [
        { name: 'React',         level: 'PRODUCTION'   },
        { name: 'Three.js',      level: 'ADVANCED'     },
        { name: 'GSAP',          level: 'ADVANCED'     },
        { name: 'TypeScript',    level: 'STRONG'       },
        { name: 'Tailwind CSS',  level: 'DAILY'        },
      ],
    },
    {
      category: 'BACKEND',
      skills: [
        { name: 'Node.js',       level: 'PRODUCTION'   },
        { name: 'Express',       level: 'STRONG'       },
        { name: 'PostgreSQL',    level: 'INTERMEDIATE' },
        { name: 'MongoDB',       level: 'INTERMEDIATE' },
        { name: 'REST APIs',     level: 'DAILY'        },
      ],
    },
    {
      category: 'MOTION',
      skills: [
        { name: 'GSAP',               level: 'ADVANCED'  },
        { name: 'Lenis',              level: 'PRODUCTION'},
        { name: 'React Three Fiber',  level: 'ACTIVE'    },
        { name: 'WebGL Shaders',      level: 'GROWING'   },
        { name: 'ScrollTrigger',      level: 'ADVANCED'  },
      ],
    },
    {
      category: 'TOOLS & INFRA',
      skills: [
        { name: 'Git',           level: 'DAILY'    },
        { name: 'Vite',          level: 'DAILY'    },
        { name: 'Figma',         level: 'STRONG'   },
        { name: 'Docker',        level: 'LEARNING' },
        { name: 'Vercel',        level: 'DAILY'    },
      ],
    },
  ],

};
