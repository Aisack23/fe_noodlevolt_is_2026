import type { Metadata } from "next";
import { PedidosLlevarClient } from "./pedidos-llevar-client";
import { getSessionUser } from "@/lib/session";
import { isClientRole } from "@/lib/auth/roles";
import { AccesoDenegado } from "@/components/ui/AccesoDenegado";

export const metadata: Metadata = {
  title: "Carrito de compras · Pedido para llevar",
  description: "Revisa y confirma tu pedido para llevar en NoodleVolt",
};

export default async function PedidosLlevarPage() {
  const user = await getSessionUser();

  if (user && !isClientRole(user.rol)) {
    return <AccesoDenegado href="/" />;
  }

  return <PedidosLlevarClient />;
}