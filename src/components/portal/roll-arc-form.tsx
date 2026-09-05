import type { FC } from "react";

export type RollArcForm02Props = {
  className?: string;
  color?: string;
  opacity?: number;
  width?: number | string;
  height?: number | string;
};

export const RollArcForm02: FC<RollArcForm02Props> = ({
  className = "",
  color = "#54BFA5",
  opacity = 0.12,
  width,
  height,
}) => {
  return (
    <svg
      viewBox="0 0 1000 440"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={`pointer-events-none select-none ${className}`}
      style={{ opacity }}
    >
      <path
        d="M 60 410 C 60 210, 260 55, 510 55 C 750 55, 940 210, 940 410"
        stroke={color}
        strokeWidth="115"
        strokeLinecap="round"
      />
    </svg>
  );
};
