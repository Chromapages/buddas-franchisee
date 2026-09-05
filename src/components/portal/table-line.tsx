import type { FC } from "react";

export type TableLineProps = {
  className?: string;
  variant?: "dark" | "teal" | "cream" | "gold";
};

export const TableLine: FC<TableLineProps> = ({
  className = "",
  variant = "dark",
}) => {
  const variantClasses = {
    dark: "bg-bds-teal-dark",
    teal: "bg-bds-teal",
    cream: "bg-bds-cream",
    gold: "bg-bds-gold",
  };

  return (
    <div
      aria-hidden="true"
      className={`h-1 rounded-full ${variantClasses[variant]} ${className}`}
    />
  );
};
