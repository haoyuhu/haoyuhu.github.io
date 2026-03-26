import React from 'react';

export const LANGUAGE_COLORS: Record<string, string> = {
  TypeScript: '#3178C6',
  JavaScript: '#F7DF1E',
  Rust: '#DEA584',
  Python: '#3572A5',
  Go: '#00ADD8',
  HTML: '#E34C26',
  CSS: '#563D7C',
  Vue: '#41B883',
  Unknown: '#94A3B8',
};

export const PixelMascot = ({ className }: { className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ shapeRendering: 'crispEdges' }}
  >
    <rect
      x="4"
      y="4"
      width="16"
      height="16"
      rx="2"
      fill="currentColor"
      className="text-stone-100 dark:text-zinc-900"
      stroke="var(--accent)"
      strokeWidth="2"
    />
    <rect x="7" y="9" width="3" height="3" fill="#111827" className="dark:fill-white" />
    <rect x="14" y="9" width="3" height="3" fill="#111827" className="dark:fill-white" />
    <rect x="9" y="15" width="6" height="1" fill="#111827" className="dark:fill-white" />
    <rect x="8" y="14" width="1" height="1" fill="#111827" className="dark:fill-white" />
    <rect x="15" y="14" width="1" height="1" fill="#111827" className="dark:fill-white" />
    <rect x="11" y="1" width="2" height="3" fill="var(--accent)" />
    <rect x="10" y="0" width="4" height="1" fill="var(--accent)" />
    <rect x="5" y="11" width="1" height="2" fill="#F59E0B" opacity="0.5" />
    <rect x="18" y="11" width="1" height="2" fill="#F59E0B" opacity="0.5" />
  </svg>
);
