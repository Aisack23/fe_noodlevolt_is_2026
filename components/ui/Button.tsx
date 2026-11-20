import type { ButtonHTMLAttributes } from "react";
import { LoaderCircle } from "lucide-react";
import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  loading?: boolean;
  loadingText?: string;
};

const variantClasses: Record<ButtonVariant, { base: string; active: string; disabled: string }> = {
  primary: {
    base: "text-white",
    active: "bg-crimson hover:bg-crimson-hover",
    disabled: "bg-neutral",
  },
  secondary: {
    base: "border-2",
    active: "border-orange text-brown hover:border-orange-hover hover:bg-orange/16",
    disabled: "border-neutral text-neutral",
  },
  danger: {
    base: "border-2 bg-white",
    active: "border-danger text-danger hover:border-danger-hover hover:bg-danger hover:text-white",
    disabled: "border-neutral text-neutral",
  },
};

// Cargando conserva los colores del estado normal, sin hover.
const loadingClasses: Record<ButtonVariant, string> = {
  primary: "bg-crimson",
  secondary: "border-orange text-brown",
  danger: "border-danger text-danger",
};

export function Button({
  variant = "primary",
  loading = false,
  loadingText = "Cargando…",
  disabled,
  type = "button",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-control px-6 py-3 text-base font-semibold transition-colors",
        "outline-none focus-visible:shadow-focus",
        variantClasses[variant].base,
        loading
          ? cn("cursor-wait", loadingClasses[variant])
          : disabled
            ? cn("cursor-not-allowed", variantClasses[variant].disabled)
            : variantClasses[variant].active,
        className,
      )}
      {...props}
    >
      {loading ? (
        <>
          <LoaderCircle aria-hidden className="size-5 animate-spin" />
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  );
}
