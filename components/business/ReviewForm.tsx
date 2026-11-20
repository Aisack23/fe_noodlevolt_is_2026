"use client";

import { useState, type FormEvent } from "react";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { RatingStars } from "@/components/business/RatingStars";

const COMMENT_MAX_LENGTH = 500;

type ReviewFormProps = {
  onSubmit: (rating: number, comment?: string) => void | Promise<void>;
  loading?: boolean;
  serverError?: string;
};

export function ReviewForm({ onSubmit, loading = false, serverError }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (rating < 1 || rating > 5) {
      setValidationError("Selecciona una calificación de 1 a 5 estrellas.");
      return;
    }
    if (comment.length > COMMENT_MAX_LENGTH) {
      setValidationError("El comentario no puede superar 500 caracteres.");
      return;
    }

    setValidationError(null);
    const normalizedComment = comment.trim();
    await onSubmit(rating, normalizedComment ? normalizedComment : undefined);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
      {serverError && <Alerta>{serverError}</Alerta>}
      {validationError && (
        <div id="review-validation-error">
          <Alerta>{validationError}</Alerta>
        </div>
      )}

      <fieldset disabled={loading} className="flex flex-col gap-2 disabled:opacity-70">
        <legend id="review-rating-label" className="text-base font-semibold text-brown">
          Tu calificación
        </legend>
        <RatingStars
          value={rating}
          onChange={(value) => {
            setRating(value);
            setValidationError(null);
          }}
          labelledBy="review-rating-label"
          describedBy={validationError ? "review-validation-error" : undefined}
          invalid={validationError !== null && rating === 0}
        />
        <p className="text-sm text-text-secondary">Elige de 1 a 5 estrellas.</p>
      </fieldset>

      <div className="flex flex-col gap-2">
        <label htmlFor="review-comment" className="text-base font-semibold text-brown">
          Comentario <span className="font-normal text-text-secondary">(opcional)</span>
        </label>
        <textarea
          id="review-comment"
          name="comment"
          rows={5}
          maxLength={COMMENT_MAX_LENGTH}
          value={comment}
          disabled={loading}
          onChange={(event) => setComment(event.target.value)}
          aria-describedby="review-comment-count"
          className="w-full resize-y rounded-control border border-border bg-white px-4 py-3 text-base text-brown outline-none placeholder:text-text-secondary focus:border-brown focus:shadow-focus disabled:cursor-not-allowed disabled:bg-background"
          placeholder="Cuéntanos cómo fue tu experiencia."
        />
        <p id="review-comment-count" aria-live="polite" className="text-right text-sm text-text-secondary">
          {comment.length} / {COMMENT_MAX_LENGTH}
        </p>
      </div>

      <Button type="submit" loading={loading} loadingText="Enviando reseña…" className="w-full sm:w-fit">
        Enviar reseña
      </Button>
    </form>
  );
}
