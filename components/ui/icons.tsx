/** Hand-drawn inline SVG icon set — 1.5px stroke, currentColor, no fill,
 * matching AtlasPin's hairline-map-marker weight rather than pulling in an
 * icon-library dependency. Every icon takes the same {size, className}
 * shape so callers can drop them into text rows interchangeably. */

interface IconProps {
  size?: number;
  className?: string;
}

const BASE = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ClockIcon({ size = 16, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} className={className} aria-hidden {...BASE}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function ChefHatIcon({ size = 16, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} className={className} aria-hidden {...BASE}>
      <path d="M7 12.5a4 4 0 0 1-1-7.87 3.5 3.5 0 0 1 6.24-2.4 3.5 3.5 0 0 1 6.26 2.5A4 4 0 0 1 17 12.5" />
      <path d="M7 12.5h10V18a1 1 0 0 1-1 1H8a1 1 0 0 1-1-1z" />
      <path d="M8.5 19v2.5h7V19" />
    </svg>
  );
}

export function FlameIcon({ size = 16, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} className={className} aria-hidden {...BASE}>
      <path d="M12 21.5c-3.6 0-6.5-2.6-6.5-6.2C5.5 11.8 8 9.7 8.7 6c1 2 1.6 3 2.6 3.2C11.6 6.8 11 4.5 9.8 2.5c3.6 1 6.7 4.3 6.7 8.3 0 1.3-.4 2.3-.9 3.2.9-.4 1.6-1.1 2-2 .6 1.1.9 2.3.9 3.3 0 3.6-2.9 6.2-6.5 6.2Z" />
    </svg>
  );
}

export function CalendarIcon({ size = 16, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} className={className} aria-hidden {...BASE}>
      <rect x="4" y="5.5" width="16" height="15" rx="1.5" />
      <path d="M4 9.5h16M8 3.5v3.5M16 3.5v3.5" />
    </svg>
  );
}

export function ForkPlateIcon({ size = 24, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} className={className} aria-hidden {...BASE}>
      <circle cx="13" cy="12" r="8.5" />
      <path d="M5.5 6v5.5a1.5 1.5 0 0 0 3 0V6M7 6v5.5" />
      <path d="M20.5 6v12" />
    </svg>
  );
}

export function MenuIcon({ size = 24, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} className={className} aria-hidden {...BASE}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </svg>
  );
}

export function CloseIcon({ size = 24, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} className={className} aria-hidden {...BASE}>
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

export function ChevronDownIcon({ size = 14, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} className={className} aria-hidden {...BASE}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function SearchIcon({ size = 18, className }: IconProps): React.JSX.Element {
  return (
    <svg width={size} height={size} className={className} aria-hidden {...BASE}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.8-4.8" />
    </svg>
  );
}
