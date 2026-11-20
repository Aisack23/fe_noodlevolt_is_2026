import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { getBranches } from "../lib/api/branches.ts";

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

test("GET /branches es público para permitir elegir sucursal desde el menú", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return new Response(JSON.stringify([{
      id: "65053239-a9f1-443e-9516-7d04a5ea5fe1",
      name: "NoodleVolt Centro",
      address: "San Salvador, Centro",
      timeZone: "America/El_Salvador",
      isActive: true,
      isOpen: true,
    }]));
  };

  const branches = await getBranches();
  assert.equal(branches[0].name, "NoodleVolt Centro");
  assert.equal(request.url.pathname, "/api/v1/branches");
  assert.equal(request.init.headers, undefined);
});
