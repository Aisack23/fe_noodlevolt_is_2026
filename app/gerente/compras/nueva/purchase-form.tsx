"use client";

import { useActionState, useState } from "react";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { InventoryItem } from "@/lib/api/inventory";
import { receivePurchase, type PurchaseState } from "./actions";

export function PurchaseForm({ ingredients }: { ingredients: InventoryItem[] }) {
  const [rows, setRows] = useState([0]);
  const [state, action, pending] = useActionState(receivePurchase, {} as PurchaseState);

  return (
    <form action={action} className="space-y-5">
      {state.error && <Alerta tono="danger">{state.error}</Alerta>}
      {state.invoice && <Alerta tono="success">Compra {state.invoice} registrada. El inventario se actualizó.</Alerta>}
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Proveedor" name="supplier" required maxLength={180} disabled={pending} />
        <Input label="Número de factura" name="invoiceNumber" required maxLength={80} disabled={pending} />
      </div>
      {rows.map((id, index) => (
        <fieldset key={id} disabled={pending} className="grid gap-3 rounded-card border border-border p-4 sm:grid-cols-2">
          <legend className="px-2 font-semibold text-brown">Insumo {index + 1}</legend>
          <label className="flex flex-col gap-1 text-sm font-semibold">
            Insumo
            <select name="ingredient" required defaultValue="" className="min-h-11 rounded-control border border-border bg-white px-3">
              <option value="" disabled>Selecciona un insumo</option>
              {ingredients.map((item) => <option key={item.id} value={item.id}>{item.name} ({item.unit})</option>)}
            </select>
          </label>
          <Input label="Cantidad" name="quantity" type="number" min="0.001" step="0.001" required />
          <Input label="Costo unitario" name="unitCost" type="number" min="0" step="0.0001" required />
          <Input label="Caducidad (opcional)" name="expirationDate" type="date" />
          {rows.length > 1 && <Button type="button" variant="secondary"
            onClick={() => setRows((current) => current.filter((row) => row !== id))}>Quitar insumo</Button>}
        </fieldset>
      ))}
      <div className="flex flex-wrap gap-3">
        <Button type="button" variant="secondary" disabled={pending || rows.length >= Math.min(40, ingredients.length)}
          onClick={() => setRows((current) => [...current, Math.max(...current) + 1])}>Agregar insumo</Button>
        <Button type="submit" loading={pending} loadingText="Guardando…">Guardar entrada</Button>
      </div>
    </form>
  );
}
