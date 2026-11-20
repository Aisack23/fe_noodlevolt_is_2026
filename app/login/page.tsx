import { Suspense } from "react";
import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Iniciar sesión",
  description: "Inicia sesión en NoodleVolt",
};

export default function LoginPage() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-background px-4 py-8 sm:py-12">
      <Suspense fallback={<div className="w-full max-w-[440px] animate-pulse p-6 sm:p-10" />}>
        <LoginForm />
      </Suspense>
    </main>
  );
}
