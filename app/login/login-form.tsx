"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { login, type LoginState } from "@/app/actions/auth";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: LoginState = {};

export function LoginForm() {
  const [state, formAction, pending] = useActionState(login, initialState);
  const searchParams = useSearchParams();
  const registrado = searchParams.get("registrado") === "true";
  const returnTo = searchParams.get("returnTo");

  return (
    <div className="w-full max-w-[440px] rounded-none sm:rounded-card sm:border sm:border-border bg-background sm:bg-white p-6 sm:p-10 transition-all">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-6 h-20 w-56 sm:h-24 sm:w-64">
          <Image
            src="/brand/Logo/Horizontal.jpeg"
            alt="NoodleVolt"
            fill
            sizes="256px"
            priority
            className="object-contain"
          />
        </div>

        <h1 className="font-display text-h2 font-bold uppercase tracking-wide text-brown">
          Iniciar sesión
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Entra para ver tu menú, tus pedidos y tus puntos.
        </p>
      </div>

      <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
        {returnTo && <input type="hidden" name="returnTo" value={returnTo} />}
        {registrado && !state.error && (
          <Alerta tono="success" className="text-sm">
            Cuenta creada exitosamente. Ingresa con tu correo y contraseña.
          </Alerta>
        )}

        {state.error && (
          <Alerta tono="danger" className="text-sm">
            {state.error}
          </Alerta>
        )}

        <Input
          label="Correo electrónico *"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@correo.com"
          defaultValue={state.email}
          disabled={pending}
        />

        <Input
          label="Contraseña *"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          disabled={pending}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={pending}
            loadingText="Iniciando sesión…"
            className="w-full"
          >
            Iniciar sesión
          </Button>
        </div>

        <div className="mt-2 text-center">
          <Link
            href="/registro"
            className="inline-block rounded-control py-1 text-sm font-semibold text-crimson outline-none transition-colors hover:text-crimson-hover focus-visible:shadow-focus"
          >
            ¿No tienes cuenta? Regístrate
          </Link>
        </div>
      </form>
    </div>
  );
}
