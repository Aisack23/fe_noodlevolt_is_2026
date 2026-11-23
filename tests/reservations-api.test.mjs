import assert from "node:assert/strict";
import { afterEach, beforeEach, test } from "node:test";
import {
  createReservation,
  ReservationApiError,
} from "../lib/api/reservations.ts";
import { isFutureReservationStart } from "../lib/reservations/validation.ts";

const originalFetch = globalThis.fetch;
const originalApiUrl = process.env.API_URL;

const reservationInput = {
  branchId: "20000000-0000-4000-8000-000000000001",
  tableId: "30000000-0000-4000-8000-000000000001",
  startsAt: "2027-01-15T19:00:00-06:00",
  guests: 2,
  contactName: "Ana Cliente",
  phone: "+503 7000-0000",
};

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

test("CP-19: confirma una reservación y conserva el contrato HTTP", async () => {
  let request;
  globalThis.fetch = async (url, init) => {
    request = { url: new URL(url), init };
    return jsonResponse({
      id: "RSV-0042",
      ...reservationInput,
      endsAt: "2027-01-15T20:30:00-06:00",
      status: "CONFIRMED",
    }, 201);
  };

  const reservation = await createReservation("token-demo", reservationInput);

  assert.equal(request.url.pathname, "/api/v1/reservations");
  assert.equal(request.init.method, "POST");
  assert.equal(request.init.headers.Authorization, "Bearer token-demo");
  assert.deepEqual(JSON.parse(request.init.body), reservationInput);
  assert.equal(reservation.status, "CONFIRMED");
  assert.equal(reservation.id, "RSV-0042");
});

test("CP-19: conserva el 409 y el mensaje cuando la mesa ya está ocupada", async () => {
  globalThis.fetch = async () => jsonResponse({
    message: "La mesa ya está ocupada en ese horario.",
  }, 409);

  await assert.rejects(
    createReservation("token-demo", reservationInput),
    (error) => {
      assert.ok(error instanceof ReservationApiError);
      assert.equal(error.status, 409);
      assert.equal(error.serverMessage, "La mesa ya está ocupada en ese horario.");
      return true;
    },
  );
});

test("CP-19: rechaza una fecha pasada antes de llamar al servicio", () => {
  const now = Date.parse("2026-11-21T12:00:00-06:00");

  assert.equal(isFutureReservationStart("2026-11-21T11:59:59-06:00", now), false);
  assert.equal(isFutureReservationStart("fecha-inválida", now), false);
  assert.equal(isFutureReservationStart("2026-11-21T12:00:01-06:00", now), true);
});
