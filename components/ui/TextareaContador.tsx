"use client";

import { useId } from "react";
import { cn } from "@/lib/cn";

type TextareaContadorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  maxLength?: number;
  placeholder?: string;
  ayuda?: string;
  rows?: number;
  disabled?: boolean;
};

export function TextareaContador({
  label,
  value,
  onChange,
  maxLength = 200,
  placeholder,
  ayuda,
  rows = 3,
  disabled = false,
}: TextareaContadorProps) {
  const id = useId();
  const ayudaId = `${id}-ayuda`;
  const contadorId = `${id}-contador`;
  const enLimite = value.length >= maxLength;

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-base font-semibold text-brown">
        {label}
      </label>
      <textarea
        id={id}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        maxLength={maxLength}
        rows={rows}
        placeholder={placeholder}
        disabled={disabled}
        aria-describedby={`${ayudaId} ${contadorId}`}
        aria-invalid={enLimite}
        className={cn(
          "w-full resize-none rounded-control border bg-white px-4 py-3 text-base text-brown outline-none placeholder:text-text-secondary focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60",
          enLimite ? "border-danger" : "border-border",
        )}
      />
      <div className="flex items-start justify-between gap-3 text-sm">
        <p id={ayudaId} className={enLimite ? "text-danger" : "text-text-secondary"}>
          {enLimite ? `Llegaste al máximo de ${maxLength} caracteres.` : ayuda}
        </p>
        <p
          id={contadorId}
          className={cn("shrink-0", enLimite ? "text-danger" : "text-text-secondary")}
        >
          {value.length}/{maxLength}
        </p>
      </div>
    </div>
  );
}