"use client";

import React, { useState, useEffect } from "react";
import { TiendaConfig, CategoriaItem, ProductoItem } from "@/lib/db";
import { Navbar } from "@/components/Navbar";
import { BookCatalog } from "@/components/BookCatalog";
import { Footer } from "@/components/Footer";
import { CartDrawer } from "@/components/CartDrawer";
import { IntroSplash } from "@/components/IntroSplash";
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
  // Estado para controlar el Splash introductorio
  const [showSplash, setShowSplash] = useState<boolean>(true);
  // Estado para controlar el Modal del Código QR
  const [showQR, setShowQR] = useState<boolean>(false);

  // Comprobar si ya ingresó previamente en la sesión
  useEffect(() => {
    try {
      const alreadyEntered = sessionStorage.getItem("mia_pasta_bella_splash_seen");
      if (alreadyEntered === "true") {
        setShowSplash(false);
      }
    } catch {}
  }, []);

  const handleEnterFactory = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem("mia_pasta_bella_splash_seen", "true");
    } catch {}
  };

  const handleReopenSplash = () => {
    setShowSplash(true);
  };

  const handleOpenQR = () => {
    setShowQR(true);
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#FAF6EE] relative selection:bg-terracota-200">
      {/* 1. INTRO SPLASH ANIMADO (LA TAPA DE AUTOR) */}
      {showSplash && (
        <IntroSplash config={config} onEnter={handleEnterFactory} />
      )}

      {/* 2. NAVBAR CON LOGO, GEOLOCALIZACIÓN MÓVIL, MENÚ QR Y CARRITO */}
      <Navbar config={config} onOpenQR={handleOpenQR} />

      {/* 3. CATÁLOGO DEL GRAN LIBRO (MULTI-VISTA) */}
      <main className="flex-1">
        <BookCatalog
          categorias={categorias}
          productos={productos}
          config={config}
          onOpenSplash={handleReopenSplash}
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
