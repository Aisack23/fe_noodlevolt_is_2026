"use client";

import { useActionState } from "react";
import Image from "next/image";
import Link from "next/link";
import { registro, type RegistroState } from "@/app/actions/auth";
import { Alerta } from "@/components/ui/Alerta";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

const initialState: RegistroState = {};

export function RegistroForm() {
  const [state, formAction, pending] = useActionState(registro, initialState);

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
          Crear cuenta
        </h1>
        <p className="mt-1 text-sm text-text-secondary">
          Regístrate como cliente para acumular puntos y reservar mesa.
        </p>
      </div>

      <form action={formAction} className="mt-6 flex flex-col gap-4" noValidate>
        {state.error && (
          <Alerta tono="danger" className="text-sm">
            {state.error}
          </Alerta>
        )}

        <Input
          label="Nombre completo *"
          name="nombre"
          type="text"
          autoComplete="name"
          required
          placeholder="Ej. María López"
          defaultValue={state.values?.nombre}
          error={state.fieldErrors?.nombre}
          disabled={pending}
        />

        <Input
          label="Correo electrónico *"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="tu@correo.com"
          defaultValue={state.values?.email}
          error={state.fieldErrors?.email}
          disabled={pending}
        />

        <Input
          label="Teléfono (opcional)"
          name="telefono"
          type="tel"
          autoComplete="tel"
          placeholder="71234567"
          defaultValue={state.values?.telefono}
          error={state.fieldErrors?.telefono}
          disabled={pending}
        />

        <Input
          label="Contraseña * (mínimo 8 caracteres)"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          placeholder="Mínimo 8 caracteres"
          error={state.fieldErrors?.password}
          disabled={pending}
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="primary"
            loading={pending}
            loadingText="Creando cuenta…"
            className="w-full"
          >
            Crear cuenta
          </Button>
        </div>

        <div className="mt-2 text-center">
          <Link
            href="/login"
            className="inline-block rounded-control py-1 text-sm font-semibold text-crimson outline-none transition-colors hover:text-crimson-hover focus-visible:shadow-focus"
          >
            ¿Ya tienes cuenta? Inicia sesión
          </Link>
        </div>
      </form>
    </div>
  );
}

