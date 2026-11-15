import type { ApiErrorMessage } from "./orders";


export type CardToken = "test_4242" | "test_0002";

export type SimulatePaymentRequest = {
  orderId: string;
  cardToken: CardToken;
};

export type SimpleReceipt = {
  id: string;
  number: string;
  amount: string;
  issuedAt: string;
};

export type PaymentResult = {
  id: string;
  orderId: string;
  status: "APROBADO" | "RECHAZADO";
  amount: string;
  last4: "4242" | "0002";
  reason: string | null;
  receipt: SimpleReceipt | null;
};


export class PaymentApiError extends Error {
  readonly status: number;
  readonly serverMessage: ApiErrorMessage;

  constructor(status: number, serverMessage: ApiErrorMessage) {
    super(
      Array.isArray(serverMessage)
        ? serverMessage.join(". ")
        : serverMessage ?? `La API respondió ${status}.`,
    );
    this.name = "PaymentApiError";
    this.status = status;
    this.serverMessage = serverMessage;
  }
}


function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isSimpleReceipt(value: unknown): value is SimpleReceipt {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.number === "string" &&
    typeof value.amount === "string" &&
    typeof value.issuedAt === "string"
  );
}

function isPaymentResult(value: unknown): value is PaymentResult {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.orderId === "string" &&
    (value.status === "APROBADO" || value.status === "RECHAZADO") &&
    typeof value.amount === "string" &&
    (value.last4 === "4242" || value.last4 === "0002") &&
    (value.reason === null || typeof value.reason === "string") &&
    (value.receipt === null || isSimpleReceipt(value.receipt))
  );
}

async function messageFrom(response: Response): Promise<ApiErrorMessage> {
  const payload: unknown = await response.json().catch(() => null);
  if (!isRecord(payload)) return null;
  const { message } = payload;
  if (
    typeof message === "string" ||
    (Array.isArray(message) && message.every((item) => typeof item === "string"))
  ) {
    return message;
  }
  if (isRecord(message) && typeof message.message === "string") {
    return message.message;
  }
  return null;
}


function getApiBaseUrl(): string {
  const apiUrl = process.env.API_URL;
  if (!apiUrl) throw new Error("Falta la variable de entorno API_URL.");
  return apiUrl.replace(/\/?$/, "/");
}


export async function simulatePayment(
  token: string,
  input: SimulatePaymentRequest,
): Promise<PaymentResult> {
  const response = await fetch(new URL("payments/simulate", getApiBaseUrl()), {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new PaymentApiError(response.status, await messageFrom(response));
  }

  const payload: unknown = await response.json();
  if (!isPaymentResult(payload)) {
    throw new Error(
      "La respuesta de simulación de pago no tiene el formato esperado.",
    );
  }
  return payload;
}
