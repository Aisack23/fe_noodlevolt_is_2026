import { useId, type InputHTMLAttributes } from "react";
import { CircleAlert } from "lucide-react";
import { cn } from "@/lib/cn";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function Input({ label, error, id, className, ...props }: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label
        htmlFor={inputId}
        className={cn(
          "text-base font-semibold",
          props.disabled ? "text-neutral" : "text-brown",
        )}
      >
        {label}
      </label>
      <input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        className={cn(
          "min-h-11 rounded-control border bg-white px-4 py-2 text-base text-brown outline-none transition-shadow",
          "placeholder:text-text-secondary",
          "disabled:cursor-not-allowed disabled:bg-background disabled:text-neutral",
          error
            ? "border-danger ring-1 ring-danger"
            : "border-border focus:border-brown focus:ring-1 focus:ring-brown focus:shadow-focus",
        )}
        {...props}
      />
      {error && (
        <p id={errorId} className="flex items-center gap-2 text-sm text-danger">
          <CircleAlert aria-hidden className="size-4 shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}
