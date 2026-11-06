import type { ButtonHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

type ChipCategoriaProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  activo?: boolean;
};

export function ChipCategoria({
  activo = false,
  type = "button",
  className,
  children,
  ...props
}: ChipCategoriaProps) {
  return (
    <button
      type={type}
      aria-pressed={activo}
      className={cn(
        "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-base font-semibold text-brown transition-colors",
        "outline-none focus-visible:shadow-focus",
        activo ? "border-orange bg-orange" : "border-border bg-white hover:border-orange",
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}