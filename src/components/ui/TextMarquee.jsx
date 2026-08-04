import LogoMarquee from '@/components/ui/LogoMarquee';

// ON TRACK strip — the riding world. The machine, its fuel, and the racing
// brands that orbit it. Real logos live in /public/media/svgs and render in
// their native brand colours across the loop.
const LOGOS = [
  { name: 'KTM',          src: '/media/svgs/ktm-10-logo-svgrepo-com.svg' },
  { name: 'Red Bull',     src: '/media/svgs/redbullenergydrink.svg' },
  { name: 'Shell',        src: '/media/svgs/shell-logo-svgrepo-com.svg' },
  { name: 'Motul',        src: '/media/svgs/motul-2-logo-svgrepo-com.svg' },
  { name: 'Mobil 1',      src: '/media/svgs/mobil-1-logo-svgrepo-com.svg' },
  { name: 'BMW M',        src: '/media/svgs/bmw-m-series-logo-svgrepo-com.svg' },
  { name: 'GoPro',        src: '/media/svgs/gopro-hero-logo-svgrepo-com.svg' },
  { name: 'Pirelli',      src: '/media/svgs/pirelli-2.svg',                  scale: 1.2 },
  { name: 'Alpinestars',  src: '/media/svgs/alpinestars-3.svg' },
  { name: 'AGV',          src: '/media/svgs/agv-brand-logo.svg',            scale: 1.2 },
  { name: 'Motorex',      src: '/media/svgs/motorex-4.svg' },
  { name: 'WD-40',        src: '/media/svgs/wd-40-logo.svg' },
];

export default function TextMarquee() {
  // NOT a sponsor row, and it must not read as one. These are marks on gear and
  // fluids actually used on the bike — there is no partnership with any of them.
  // The old ariaLabel ("Racing partners") announced twelve trademarks as
  // partners to every screen reader, which is the claim this heading exists to
  // retract. Keep both strings honest if either is ever edited.
  return (
    <LogoMarquee
      logos={LOGOS}
      speed={38}
      ariaLabel="Gear, fluids and parts used on the bike"
      heading="On track // what I actually run"
    />
  );
}
