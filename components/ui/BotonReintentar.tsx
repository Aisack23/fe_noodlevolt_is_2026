"use client";

import { Button } from "./Button";

export function BotonReintentar() {
  return (
    <Button variant="secondary" onClick={() => window.location.reload()}>
      Reintentar
    </Button>
  );
}
