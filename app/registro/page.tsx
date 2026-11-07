import type { Metadata } from "next";
import { RegistroForm } from "./registro-form";

export const metadata: Metadata = {
  title: "Crear cuenta",
  description: "Regístrate como cliente en NoodleVolt",
};

export default function RegistroPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-8 sm:py-12">
      <RegistroForm />
    </main>
  );
}

