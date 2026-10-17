import React from "react";
import { getCategorias, getProductos } from "@/lib/db";
import { CatalogoManager } from "@/components/CatalogoManager";

export const dynamic = "force-dynamic";

export default async function CatalogoPage() {
  const [categorias, productos] = await Promise.all([
    getCategorias(),
    getProductos(),
  ]);

  return (
    <CatalogoManager
      initialCategories={categorias}
      initialProducts={productos}
    />
  );
}
