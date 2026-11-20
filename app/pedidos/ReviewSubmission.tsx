"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";
import { Alerta } from "@/components/ui/Alerta";
import { ReviewForm } from "@/components/business/ReviewForm";
import { submitReview } from "@/app/pedidos/review-actions";
import type { ApiErrorMessage } from "@/lib/api/reviews";

type ReviewSubmissionProps = { orderId: string };

function displayMessage(message: ApiErrorMessage, fallback: string): string {
  if (typeof message === "string") return message;
  if (Array.isArray(message)) return message.join("\n");
  return fallback;
}

export function ReviewSubmission({ orderId }: ReviewSubmissionProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | undefined>();
  const [forbidden, setForbidden] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(rating: number, comment?: string) {
    setLoading(true);
    setError(undefined);
    setSuccess(false);
    try {
      const result = await submitReview(orderId, rating, comment);
      if (result.ok) {
        setSuccess(true);
        router.refresh();
        return;
      }
      if (result.kind === "forbidden") {
        setForbidden(true);
        return;
      }
      if (result.kind === "conflict") {
        setError("El pedido ya fue calificado o aún no está entregado.");
        router.refresh();
        return;
      }
      setError(displayMessage(result.message, "No se pudo enviar la reseña."));
    } catch {
      setError("No se pudo conectar con el servicio. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  if (forbidden) return <AccesoDenegado href="/menu" />;

  return (
    <div className="flex flex-col gap-4">
      {success && <Alerta tono="success">Reseña enviada. Se actualizó la información del pedido y su sucursal.</Alerta>}
      <ReviewForm onSubmit={handleSubmit} loading={loading} serverError={error} />
    </div>
  );
}
