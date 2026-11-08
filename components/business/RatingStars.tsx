"use client";

import { useRef, type KeyboardEvent } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/cn";

type RatingStarsProps = {
  value: number;
  onChange?: (value: number) => void;
  readOnly?: boolean;
  disabled?: boolean;
  labelledBy?: string;
  describedBy?: string;
  invalid?: boolean;
};

export function RatingStars({
  value,
  onChange,
  readOnly = false,
  disabled = false,
  labelledBy,
  describedBy,
  invalid = false,
}: RatingStarsProps) {
  const starRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const clampedValue = Math.min(5, Math.max(0, value));

  if (readOnly) {
    return (
      <span
        role="img"
        aria-label={`Calificación: ${clampedValue} de 5 estrellas`}
        className="inline-flex items-center gap-1"
      >
        {Array.from({ length: 5 }, (_, index) => (
          <Star
            key={index}
            aria-hidden
            className={cn(
              "size-5",
              index < clampedValue ? "fill-gold text-gold" : "text-border",
            )}
          />
        ))}
      </span>
    );
  }

  function selectRating(nextRating: number) {
    if (!disabled) onChange?.(nextRating);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLButtonElement>, current: number) {
    let next = current;
    if (event.key === "ArrowRight" || event.key === "ArrowUp") next = Math.min(5, current + 1);
    else if (event.key === "ArrowLeft" || event.key === "ArrowDown") next = Math.max(1, current - 1);
    else if (event.key === "Home") next = 1;
    else if (event.key === "End") next = 5;
    else return;

    event.preventDefault();
    selectRating(next);
    starRefs.current[next - 1]?.focus();
  }

  return (
    <div
      role="radiogroup"
      aria-labelledby={labelledBy}
      aria-describedby={describedBy}
      aria-invalid={invalid || undefined}
      className="inline-flex items-center gap-1"
    >
      {Array.from({ length: 5 }, (_, index) => {
        const rating = index + 1;
        const selected = rating === clampedValue;
        return (
          <button
            key={rating}
            ref={(element) => { starRefs.current[index] = element; }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={`${rating} ${rating === 1 ? "estrella" : "estrellas"}`}
            tabIndex={selected || (clampedValue === 0 && rating === 1) ? 0 : -1}
            disabled={disabled}
            onClick={() => selectRating(rating)}
            onKeyDown={(event) => handleKeyDown(event, rating)}
            className="inline-flex size-11 items-center justify-center rounded-control text-gold outline-none hover:bg-cream focus-visible:shadow-focus disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Star
              aria-hidden
              className={cn("size-7", rating <= clampedValue && "fill-gold")}
            />
          </button>
        );
      })}
    </div>
  );
}
