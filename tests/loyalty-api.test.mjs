import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  formatPoints,
  getMyLoyalty,
  isLoyaltyBalance,
  LoyaltyApiError,
} from "../lib/api/loyalty.ts";

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

test("GET /loyalty/me envía Bearer, no usa caché y devuelve el saldo", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return jsonResponse({ points: 12 });
  };

  assert.deepEqual(await getMyLoyalty("token-demo"), { points: 12 });
  assert.equal(request.url.pathname, "/api/v1/loyalty/me");
  assert.equal(request.init.headers.Authorization, "Bearer token-demo");
  assert.equal(request.init.cache, "no-store");
});

test("cliente sin cuenta de lealtad: el servidor responde 0 y se muestra 0", async () => {
  globalThis.fetch = async () => jsonResponse({ points: 0 });
  assert.deepEqual(await getMyLoyalty("token-demo"), { points: 0 });
});

test("solo se conserva points aunque el servidor agregue otros campos", async () => {
  globalThis.fetch = async () => jsonResponse({ userId: "uuid", points: 5 });
  assert.deepEqual(await getMyLoyalty("token-demo"), { points: 5 });
});

for (const [status, kind] of [[401, "unauthorized"], [403, "forbidden"], [500, "http"]]) {
  test(`HTTP ${status} se clasifica como ${kind}`, async () => {
    globalThis.fetch = async () => jsonResponse({ message: "x" }, status);
    await assert.rejects(getMyLoyalty("token-demo"), (error) => {
      assert.ok(error instanceof LoyaltyApiError);
      assert.equal(error.status, status);
      assert.equal(error.kind, kind);
      return true;
    });
  });
}

test("rechaza respuestas con un formato inesperado", async () => {
  for (const body of [{}, { points: "12" }, { points: -1 }, { points: 1.5 }, null]) {
    globalThis.fetch = async () => jsonResponse(body);
    await assert.rejects(getMyLoyalty("token-demo"), /formato esperado/);
  }
});

test("isLoyaltyBalance acepta solo enteros no negativos", () => {
  assert.equal(isLoyaltyBalance({ points: 0 }), true);
  assert.equal(isLoyaltyBalance({ points: 99 }), true);
  assert.equal(isLoyaltyBalance({ points: -3 }), false);
  assert.equal(isLoyaltyBalance(undefined), false);
});

test("formatPoints usa separador de miles como en el diseño", () => {
  assert.equal(formatPoints(0), "0 pts");
  assert.equal(formatPoints(12), "12 pts");
  assert.equal(formatPoints(1250), "1,250 pts");
});
