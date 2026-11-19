import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import { authenticateSession, verifySession } from "../lib/auth/api-session.ts";
import { homeForRole } from "../lib/auth/roles.ts";

const originalFetch = globalThis.fetch;
const originalApiUrl = process.env.API_URL;
const account = { id: "usuario", email: "mesero@example.com" };
const legacyToken = [
  "fixture",
  Buffer.from(JSON.stringify({ sub: account.id, role: "WAITER", branchId: "sucursal" })).toString("base64url"),
  "fixture",
].join(".");

beforeEach(() => {
  process.env.API_URL = "https://api.example.test";
});

afterEach(() => {
  globalThis.fetch = originalFetch;
  if (originalApiUrl === undefined) delete process.env.API_URL;
  else process.env.API_URL = originalApiUrl;
});

test("login admite el contrato anterior después de verificar el token con /auth/me", async () => {
  const urls = [];
  globalThis.fetch = async (url, init) => {
    urls.push(url.pathname);
    if (url.pathname.endsWith("/login")) {
      assert.equal(init.method, "POST");
      return Response.json({ accessToken: legacyToken, refreshToken: "fixture", user: account });
    }
    assert.equal(init.headers.Authorization, `Bearer ${legacyToken}`);
    return Response.json(account);
  };

  const session = await authenticateSession(account.email, "fixture");
  assert.deepEqual(urls, ["/api/v1/auth/login", "/api/v1/auth/me"]);
  assert.deepEqual(session.user, { ...account, name: null, role: "WAITER", branchId: "sucursal" });
  assert.equal(session.tokens.refreshExpiresAt, undefined);
  assert.equal(homeForRole(session.user.role), "/mesero/listos");
});

test("el rol y la sucursal vigentes de /auth/me tienen prioridad", async () => {
  const user = { ...account, name: "Elena", role: "GENERAL_MANAGER", branchId: null };
  globalThis.fetch = async () => Response.json(user);

  assert.deepEqual(await verifySession(legacyToken), user);
  assert.equal(homeForRole(user.role), "/gerente/reportes");
});

test("si la API rechaza la sesión, no se recupera el rol desde el token", async () => {
  globalThis.fetch = async () => new Response(null, { status: 401 });
  assert.equal(await verifySession(legacyToken), null);
});

test("Caja e Inventario pueden iniciar sesión con un destino que no otorga permisos", () => {
  assert.equal(homeForRole("CASHIER"), "/menu");
  assert.equal(homeForRole("INVENTORY_MANAGER"), "/menu");
  assert.equal(homeForRole(null), null);
  assert.equal(homeForRole("UNKNOWN"), null);
});
