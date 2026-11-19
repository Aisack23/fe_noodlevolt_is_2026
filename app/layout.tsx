import type { Metadata } from "next";
import "@fontsource-variable/antonio/wght.css";
import "@fontsource-variable/inter/wght.css";
import "./globals.css";
import { CartProvider } from "@/lib/cart/cart-context";
import { AuthProvider } from "@/lib/auth/auth-context";
import { getSessionUser } from "@/lib/session";


export const metadata: Metadata = {
  title: "NoodleVolt",
  description: "Plataforma de gestión de restaurantes NoodleVolt",
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const initialUser = await getSessionUser();

  return (
    <html
      lang="es"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col font-sans">
        <AuthProvider initialUser={initialUser}>
          <CartProvider>{children}</CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
