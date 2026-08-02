import LogoMarquee from '@/components/ui/LogoMarquee';

// OFF TRACK strip — the digital / lifestyle world the engineer lives in. Real
// logos live in /public/media/svgs and render in their native brand colours
// across the loop.
const PARTNERS = [
  { name: 'Google',              src: '/media/svgs/google-icon-logo-svgrepo-com.svg' },
  { name: 'NVIDIA',              src: '/media/svgs/nvidia-logo-svgrepo-com.svg' },
  { name: 'PlayStation',         src: '/media/svgs/playstation-svgrepo-com.svg' },
  { name: 'Android',             src: '/media/svgs/android-logo-svgrepo-com.svg' },
  { name: 'Spotify',             src: '/media/svgs/spotify.svg' },
  { name: 'Dell',                src: '/media/svgs/dell-2-logo-svgrepo-com.svg' },
  { name: 'HTML5',               src: '/media/svgs/html-5-logo-svgrepo-com.svg' },
  { name: 'The North Face',      src: '/media/svgs/the-north-face.svg',                         scale: 1.25 },
  { name: 'Nashville Predators', src: '/media/svgs/nashville-predators-1-logo-svgrepo-com.svg' },
  { name: 'Linux',               src: '/media/svgs/linux.svg' },
];

export default function PartnersSection() {
  return (
    <LogoMarquee
      logos={PARTNERS}
      speed={45}
      ariaLabel="Tech and culture"
      heading="Off track // the daily stack"
    />
  );
}
