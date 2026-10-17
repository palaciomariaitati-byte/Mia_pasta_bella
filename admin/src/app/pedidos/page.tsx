import React from "react";
import { getPedidosAdmin } from "@/lib/db";
import { PedidosManager } from "@/components/PedidosManager";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const pedidos = await getPedidosAdmin();

  return <PedidosManager initialOrders={pedidos} />;
}
