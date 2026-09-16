export type IconProps = { className?: string };

function base(paths: React.ReactNode) {
  return function Icon({ className }: IconProps) {
    return (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.75}
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
        aria-hidden="true"
      >
        {paths}
      </svg>
    );
  };
}

export const GridIcon = base(
  <>
    <rect x="3" y="3" width="7" height="7" rx="1.5" />
    <rect x="14" y="3" width="7" height="7" rx="1.5" />
    <rect x="3" y="14" width="7" height="7" rx="1.5" />
    <rect x="14" y="14" width="7" height="7" rx="1.5" />
  </>,
);

export const ReceiptIcon = base(
  <>
    <path d="M6 3h12v18l-3-2-3 2-3-2-3 2V3Z" />
    <path d="M9 8h6M9 12h6" />
  </>,
);

export const UsersIcon = base(
  <>
    <circle cx="9" cy="8" r="3.25" />
    <path d="M3.5 20c0-3.2 2.5-5.5 5.5-5.5s5.5 2.3 5.5 5.5" />
    <path d="M16 8.5a2.75 2.75 0 1 1 0-5.5" />
    <path d="M15 14.3c2.4.4 4.5 2.4 4.5 5.7" />
  </>,
);

export const CheckSquareIcon = base(
  <>
    <rect x="3.5" y="3.5" width="17" height="17" rx="3" />
    <path d="m8 12 2.5 2.5L16 9" />
  </>,
);

export const PackageIcon = base(
  <>
    <path d="M21 8.5 12 3 3 8.5v7L12 21l9-5.5v-7Z" />
    <path d="M3 8.5 12 14l9-5.5M12 14v7" />
  </>,
);

export const ChatIcon = base(
  <path d="M4 5h16v11H8l-4 4V5Z" />,
);

export const TrendingUpIcon = base(
  <>
    <path d="M3 17l6-6 4 4 8-8" />
    <path d="M15 6h6v6" />
  </>,
);

export const SendIcon = base(<path d="M4 12 20 4l-6 16-3-7-7-1Z" />);

export const SparkleIcon = base(
  <path d="M12 3v4M12 17v4M3 12h4M17 12h4M6 6l2.5 2.5M15.5 15.5 18 18M18 6l-2.5 2.5M8.5 15.5 6 18" />,
);

export const ExternalLinkIcon = base(
  <>
    <path d="M14 4h6v6" />
    <path d="M10 14 20 4" />
    <path d="M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />
  </>,
);
