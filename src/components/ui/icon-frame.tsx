import type { ReactNode } from "react";

export type IconFrameProps = {
  children: ReactNode;
  size?: "sm" | "md";
  background?: "none" | "chip";
  className?: string;
};

const sizes = {
  sm: "h-4 w-4",
  md: "h-5 w-5",
};

/**
 * Functional UI icons use the none treatment by default. Reserve the
 * optional chip treatment for decorative standalone visual motifs only.
 */
export const IconFrame = ({
  children,
  size = "md",
  background = "none",
  className = "",
}: IconFrameProps) => (
  <span
    aria-hidden="true"
    className={[
      "inline-flex shrink-0 items-center justify-center",
      sizes[size],
      background === "chip" ? "rounded-full bg-brand-sand text-brand-charcoal" : "",
      className,
    ].join(" ")}
  >
    {children}
  </span>
);
