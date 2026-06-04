import React from 'react';

export default function CompactNav() {
  const toggle = () => window.dispatchEvent(new CustomEvent('nav-toggle'));

  return (
    <div className="fixed top-4 right-4 z-50">
      <button
        onClick={toggle}
        aria-label="Open menu"
        className="w-10 h-10 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-md border border-white/6 text-[#D2FF00]"
      >
        <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect y="1" width="16" height="2" rx="1" fill="currentColor" />
          <rect y="5" width="16" height="2" rx="1" fill="currentColor" />
          <rect y="9" width="16" height="2" rx="1" fill="currentColor" />
        </svg>
      </button>
    </div>
  );
}
