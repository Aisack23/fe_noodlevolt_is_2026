import type { Metadata } from "next";
import { PedidosLlevarClient } from "./pedidos-llevar-client";

export const metadata: Metadata = {
  title: "Carrito de compras · Pedido para llevar",
  description: "Revisa y confirma tu pedido para llevar en NoodleVolt",
};

export default function PedidosLlevarPage() {
  return <PedidosLlevarClient />;
}

