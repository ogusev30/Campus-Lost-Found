export function Logo({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="flex-shrink-0"
    >
      <rect
        x="7"
        y="11"
        width="18"
        height="20"
        rx="2.5"
        fill="#F0E4D0"
        stroke="#1B2A4A"
        strokeWidth="2"
        transform="rotate(-8 16 21)"
      />
      <circle cx="16" cy="8" r="4.5" fill="#B3452C" stroke="#1B2A4A" strokeWidth="2" />
    </svg>
  );
}
