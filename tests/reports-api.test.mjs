import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { getSalesReport, getTopDishesReport } from "../lib/api/reports.ts";

const originalFetch = globalThis.fetch;
const originalApiUrl = process.env.API_URL;

beforeEach(() => {
  process.env.API_URL = "https://api.example.test";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
});

test("GET /api/v1/reports/sales incluye filtros y token", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return new Response(JSON.stringify({
      from: "2026-11-01",
      to: "2026-11-18",
      branchId: "branch-1",
      total: "123.45",
      paymentsCount: 7,
    }));
  };

  const report = await getSalesReport("test-token", {
    from: "2026-11-01",
    to: "2026-11-18",
    branchId: "branch-1",
  });

  assert.equal(report.total, "123.45");
  assert.equal(request.url.pathname, "/api/v1/reports/sales");
  assert.deepEqual(Object.fromEntries(request.url.searchParams), {
    from: "2026-11-01",
    to: "2026-11-18",
    branchId: "branch-1",
  });
  assert.equal(request.init.headers.Authorization, "Bearer test-token");
});

test("GET /api/v1/reports/top-dishes limita el resultado a un entero entre 1 y 100", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return new Response(JSON.stringify({
      from: "2026-11-01",
      to: "2026-11-18",
      branchId: null,
      dishes: [],
    }));
  };

  await getTopDishesReport("test-token", {
    from: "2026-11-01",
    to: "2026-11-18",
    limit: 100.9,
  });

  assert.equal(request.url.pathname, "/api/v1/reports/top-dishes");
  assert.equal(request.url.searchParams.get("limit"), "100");
});

test("rechaza una respuesta de ventas con forma inválida", async () => {
  globalThis.fetch = async () => new Response(JSON.stringify({ total: "123.45" }));

  await assert.rejects(
    getSalesReport("test-token", { from: "2026-11-01", to: "2026-11-18" }),
    /formato esperado/,
  );
});
