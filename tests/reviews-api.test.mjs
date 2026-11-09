import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  createReview,
  canRateOrder,
  getBranchRating,
  getMyOrders,
  ReviewApiError,
} from "../lib/api/reviews.ts";

const originalFetch = globalThis.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "https://api.example.test/api/v1";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
});

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

test("GET pedidos envía Bearer y el filtro permitido; acepta lista vacía", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return jsonResponse([]);
  };

  assert.deepEqual(await getMyOrders("token-demo", "DELIVERED"), []);
  assert.equal(request.url.pathname, "/api/v1/orders/me");
  assert.equal(request.url.searchParams.get("status"), "DELIVERED");
  assert.equal(request.init.headers.Authorization, "Bearer token-demo");
  assert.equal(request.init.cache, "no-store");
});

test("GET pedidos acepta orderNumber nulo del contrato y conserva el UUID real", async () => {
  globalThis.fetch = async () => jsonResponse([{
    id: "10000000-0000-4000-8000-000000000001",
    orderNumber: null,
    status: "PENDING",
    total: "8.50",
    createdAt: "2026-11-08T18:00:00.000Z",
    branchId: "20000000-0000-4000-8000-000000000001",
    branchName: "NoodleVolt Centro",
    review: null,
  }]);

  const [order] = await getMyOrders("token-demo");
  assert.equal(order.orderNumber, null);
  assert.equal(order.id, "10000000-0000-4000-8000-000000000001");
});

test("POST reseña devuelve éxito 201 y envía solo los campos del contrato", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return new Response(null, { status: 201 });
  };

  await createReview("token-demo", {
    orderId: "order-uuid",
    rating: 5,
    comment: "Excelente",
  });
  assert.equal(request.url.pathname, "/api/v1/reviews");
  assert.deepEqual(JSON.parse(request.init.body), {
    orderId: "order-uuid",
    rating: 5,
    comment: "Excelente",
  });
});

for (const [status, kind] of [[400, "validation"], [401, "unauthorized"], [403, "forbidden"], [404, "not_found"], [409, "conflict"]]) {
  test(`errores HTTP ${status} conservan categoría y mensaje de servidor`, async () => {
    globalThis.fetch = async () => jsonResponse({ message: "Mensaje original del servidor" }, status);
    await assert.rejects(
      createReview("token-demo", { orderId: "order-uuid", rating: 3 }),
      (error) => {
        assert.ok(error instanceof ReviewApiError);
        assert.equal(error.status, status);
        assert.equal(error.kind, kind);
        assert.equal(error.serverMessage, "Mensaje original del servidor");
        return true;
      },
    );
  });
}

test("GET promedio conserva average null y count cero", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return jsonResponse({ average: null, count: 0 });
  };

  assert.deepEqual(await getBranchRating("branch/id"), { average: null, count: 0 });
  assert.equal(request.url.pathname, "/api/v1/branches/branch%2Fid/rating");
  assert.equal(request.init.headers, undefined);
});

test("la regla de UI solo permite reseñar pedidos entregados sin reseña", () => {
  assert.equal(canRateOrder({ status: "DELIVERED", review: null }), true);
  assert.equal(canRateOrder({ status: "PENDING", review: null }), false);
  assert.equal(canRateOrder({ status: "DELIVERED", review: { id: "review-id", rating: 4 } }), false);
});
