import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  createOrder,
  mapOrderResponseToPedido,
  OrderApiError,
} from "../lib/api/orders.ts";

const originalFetch = globalThis.fetch;
const originalApiUrl = process.env.API_URL;

const responseBody = {
  id: "10000000-0000-4000-8000-000000000001",
  branchId: "20000000-0000-4000-8000-000000000001",
  operationKey: "30000000-0000-4000-8000-000000000001",
  status: "PENDING",
  total: "17.00",
  paymentMode: "AT_COUNTER",
  pickupAt: "2026-11-08T18:20:00.000Z",
  lines: [{ dishId: "40000000-0000-4000-8000-000000000001", name: "Ramen", quantity: 2, unitPrice: "8.50", subtotal: "17.00" }],
};

beforeEach(() => {
  process.env.API_URL = "https://api.example.test/api/v1";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
});

test("POST /orders usa Bearer y envía exclusivamente el contrato CreateOrderDto", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return new Response(JSON.stringify(responseBody), { status: 201 });
  };

  const body = {
    branchId: "20000000-0000-4000-8000-000000000001",
    operationKey: "30000000-0000-4000-8000-000000000001",
    paymentMode: "AT_COUNTER",
    lines: [{ dishId: "40000000-0000-4000-8000-000000000001", quantity: 2, expectedPrice: "8.50" }],
  };
  assert.deepEqual(await createOrder("token-demo", body), responseBody);
  assert.equal(request.url.pathname, "/api/v1/orders");
  assert.equal(request.init.headers.Authorization, "Bearer token-demo");
  assert.deepEqual(JSON.parse(request.init.body), body);
});

test("un 409 conserva el estado y mensaje enviados por el servidor", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ message: "El precio cambió." }), { status: 409 });
  await assert.rejects(
    createOrder("token-demo", { branchId: "branch", operationKey: "key", paymentMode: "ONLINE", lines: [] }),
    (error) => error instanceof OrderApiError && error.status === 409 && error.serverMessage === "El precio cambió.",
  );
});

test("un conflicto con detalle anidado conserva el mensaje de negocio", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ message: { message: "Los precios del carrito cambiaron." } }), { status: 409 });
  await assert.rejects(
    createOrder("token-demo", { branchId: "branch", operationKey: "key", paymentMode: "ONLINE", lines: [] }),
    (error) => error instanceof OrderApiError && error.serverMessage === "Los precios del carrito cambiaron.",
  );
});

test("la respuesta se adapta a la vista sin traducir el contrato HTTP", () => {
  const pedido = mapOrderResponseToPedido(responseBody, "San Salvador – Centro");
  assert.equal(pedido.modalidadPago, "CAJA");
  assert.equal(pedido.estado, "PENDING");
  assert.equal(pedido.items[0].subtotal, 17);
  assert.equal(pedido.total, 17);
});
