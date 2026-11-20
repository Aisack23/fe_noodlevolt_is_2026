import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  getKitchenOrders,
  KitchenApiError,
  updateKitchenOrderStatus,
} from "../lib/api/kitchen.ts";

const originalFetch = globalThis.fetch;
const originalApiUrl = process.env.API_URL;

const order = {
  id: "10000000-0000-4000-8000-000000000001",
  orderNumber: "1040",
  type: "TAKEAWAY",
  status: "PENDING",
  createdAt: "2026-11-11T18:24:00.000Z",
  items: [{ id: "20000000-0000-4000-8000-000000000001", name: "Pad thai de camarón", quantity: 2, note: "Uno sin maní", status: "PENDING" }],
};

beforeEach(() => {
  process.env.API_URL = "https://api.example.test/api/v1";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
});

test("GET /kitchen/orders usa Bearer y conserva el DTO del backend", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return new Response(JSON.stringify([order]));
  };

  assert.deepEqual(await getKitchenOrders("token-demo"), [order]);
  assert.equal(request.url.pathname, "/api/v1/kitchen/orders");
  assert.equal(request.init.headers.Authorization, "Bearer token-demo");
});

test("PATCH /kitchen/orders/:id/status envía solo el siguiente estado permitido", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return new Response(JSON.stringify({ ...order, status: "IN_PREPARATION" }));
  };

  const updated = await updateKitchenOrderStatus("token-demo", order.id, "IN_PREPARATION");
  assert.equal(updated.status, "IN_PREPARATION");
  assert.equal(request.url.pathname, `/api/v1/kitchen/orders/${order.id}/status`);
  assert.equal(request.init.method, "PATCH");
  assert.equal(request.init.headers.Authorization, "Bearer token-demo");
  assert.deepEqual(JSON.parse(request.init.body), { status: "IN_PREPARATION" });
});

test("un 409 conserva el mensaje de transición enviado por el backend", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ message: "La transición no corresponde al estado persistido." }), { status: 409 });
  await assert.rejects(
    updateKitchenOrderStatus("token-demo", order.id, "READY"),
    (error) => error instanceof KitchenApiError && error.status === 409 && error.serverMessage === "La transición no corresponde al estado persistido.",
  );
});
