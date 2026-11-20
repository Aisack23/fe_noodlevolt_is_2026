import type { Metadata } from "next";
import "@fontsource-variable/antonio/wght.css";
import "@fontsource-variable/inter/wght.css";
import "./globals.css";
import { CartProvider } from "@/lib/cart/cart-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { getSessionUser } from "@/lib/session";
import { Alerta } from "@/components/ui/Alerta";
import { BotonReintentar } from "@/components/ui/BotonReintentar";


export const metadata: Metadata = {
  title: "NoodleVolt",
  description: "Plataforma de gestión de restaurantes NoodleVolt",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const initialUser = await getSessionUser().catch(() => undefined);

  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        {initialUser === undefined ? (
          <main className="mx-auto flex w-full max-w-[1232px] flex-col items-start gap-4 px-4 py-6">
            <Alerta>No se pudo verificar tu sesión. Intenta de nuevo.</Alerta>
            <BotonReintentar />
          </main>
        ) : (
          <AuthProvider initialUser={initialUser}>
            <CartProvider>{children}</CartProvider>
          </AuthProvider>
        )}
      </body>
    </html>
  );
}
