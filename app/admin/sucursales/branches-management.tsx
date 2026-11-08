"use client";

import { useState } from "react";
import { MapPin } from "lucide-react";
import { Alerta } from "@/components/ui/Alerta";
import { BadgeEstado } from "@/components/ui/BadgeEstado";
import { Button } from "@/components/ui/Button";
import { EstadoVacio } from "@/components/ui/EstadoVacio";
import type { Branch } from "@/lib/api/branches";
import { setBranchOperationalStatus } from "./actions";

type BranchesManagementProps = {
  branches: Branch[];
};

export function BranchesManagement({ branches }: BranchesManagementProps) {
  const [currentBranches, setCurrentBranches] = useState(branches);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ text: string; tone: "success" | "danger" } | null>(null);

  const updateStatus = async (branch: Branch) => {
    setUpdatingId(branch.id);
    setMessage(null);
    const result = await setBranchOperationalStatus(branch.id, !branch.isOpen);

    if (!result.ok) {
      setMessage({ text: result.message, tone: "danger" });
      setUpdatingId(null);
      return;
    }

    setCurrentBranches((items) =>
      items.map((item) => (item.id === branch.id ? { ...item, isOpen: result.status.isOpen } : item)),
    );
    setMessage({ text: `${branch.name} ahora está ${result.status.isOpen ? "abierta" : "cerrada"}.`, tone: "success" });
    setUpdatingId(null);
  };

  if (currentBranches.length === 0) {
    return <EstadoVacio titulo="No hay sucursales" mensaje="Cuando haya sucursales registradas, aparecerán aquí." />;
  }

  return (
    <div className="space-y-5">
      {message && <Alerta tono={message.tone}>{message.text}</Alerta>}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {currentBranches.map((branch) => (
          <article key={branch.id} className="flex min-h-64 flex-col rounded-card border border-border bg-white p-6 shadow-sm">
            <div className="space-y-2">
              <h2 className="font-display text-h3 font-bold uppercase text-brown">{branch.name}</h2>
              <p className="flex items-start gap-2 text-sm text-text-secondary">
                <MapPin aria-hidden className="mt-0.5 size-4 shrink-0" />
                {branch.address}
              </p>
            </div>
            <dl className="mt-6 space-y-4 border-y border-border py-4 text-sm">
              <div className="flex items-center justify-between gap-3"><dt className="text-text-secondary">Estado administrativo</dt><dd><BadgeEstado estado={branch.isActive ? "ACTIVA" : "INACTIVA"} /></dd></div>
              <div className="flex items-center justify-between gap-3"><dt className="text-text-secondary">Estado operativo</dt><dd><BadgeEstado estado={branch.isOpen ? "ABIERTA" : "CERRADA"} /></dd></div>
            </dl>
            {branch.isActive ? (
              <Button className="mt-auto w-full" variant={branch.isOpen ? "danger" : "primary"} loading={updatingId === branch.id} loadingText={branch.isOpen ? "Cerrando…" : "Abriendo…"} onClick={() => updateStatus(branch)}>
                {branch.isOpen ? "Cerrar sucursal" : "Abrir sucursal"}
              </Button>
            ) : (
              <p className="mt-auto pt-5 text-sm text-text-secondary">Esta sucursal está inactiva y no puede abrirse.</p>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
