"use client";

import React, { useState } from "react";
import { TiendaConfig, CategoriaItem, ProductoItem } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { BookCatalog } from "@/components/BookCatalog";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { QRModal } from "@/components/QRModal";
import { FloatingWhatsAppButton } from "@/components/FloatingWhatsAppButton";

interface TiendaClientWrapperProps {
  config: TiendaConfig;
  categorias: CategoriaItem[];
  productos: ProductoItem[];
}

export function TiendaClientWrapper({
  config,
  categorias,
  productos,
}: TiendaClientWrapperProps) {
  // Estado para controlar el Modal del Código QR
  const [showQR, setShowQR] = useState<boolean>(false);

  const handleOpenQR = () => {
    setShowQR(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF6EE] relative selection:bg-terracota-200">
      {/* 1. NAVBAR CON LOGO OFICIAL CENTRADO, ENLACES Y CARRITO */}
      <Navbar config={config} onOpenQR={handleOpenQR} />

      {/* 2. CATÁLOGO PRINCIPAL Y SUBPÁGINAS DE CATEGORÍA */}
      <main className="flex-1">
        <BookCatalog
          categorias={categorias}
          productos={productos}
          config={config}
          onOpenQR={handleOpenQR}
        />
      </main>

      {/* 4. MODAL DEL CÓDIGO QR PORTABLE */}
      <QRModal isOpen={showQR} onClose={() => setShowQR(false)} />

      {/* 5. DRAWER LATERAL DEL CARRITO & CHECKOUT */}
      <CartDrawer config={config} productos={productos} />

      {/* 6. BOTÓN FLOTANTE PERMANENTE DE WHATSAPP */}
      <FloatingWhatsAppButton config={config} />

      {/* 7. FOOTER CON TEXTOS DINÁMICOS Y FIRMA OFICIAL */}
      <Footer config={config} />
    </div>
  );
}
