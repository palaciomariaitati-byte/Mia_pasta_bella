import React from "react";
import { getTiendaData } from "@/lib/db";
import { TiendaClientWrapper } from "@/components/TiendaClientWrapper";

export const dynamic = "force-dynamic";

export default async function TiendaPage() {
  const { configuracion, categorias, productos } = await getTiendaData();

  return (
    <TiendaClientWrapper
      config={configuracion}
      categorias={categorias}
      productos={productos}
    />
  );
}
