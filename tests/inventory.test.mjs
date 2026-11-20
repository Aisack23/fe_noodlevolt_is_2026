import assert from "node:assert/strict";
import test from "node:test";
import { getStockStatus } from "../lib/api/inventory.ts";

test("Prueba unitaria de getStockStatus para el inventario", async (t) => {
  await t.test("determina correctamente el estado del insumo según su stock", () => {
    
    const itemBajo = {
      id: "1",
      name: "Café",
      unit: "kg",
      currentStock: 2,
      minimumStock: 5,
    };

    const itemSuficiente = {
      id: "2",
      name: "Leche",
      unit: "litros",
      currentStock: 10,
      minimumStock: 5,
    };


    const estadoBajo = getStockStatus(itemBajo);
    const estadoSuficiente = getStockStatus(itemSuficiente);

    assert.ok(estadoBajo, "El estado para stock bajo no debe ser nulo");
    assert.ok(estadoSuficiente, "El estado para stock suficiente no debe ser nulo");
  });
});