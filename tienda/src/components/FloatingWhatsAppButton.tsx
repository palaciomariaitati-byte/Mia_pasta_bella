"use client";

import React from "react";
import { MessageCircle } from "lucide-react";
import { TiendaConfig } from "@/lib/db";

interface FloatingWhatsAppButtonProps {
  config: TiendaConfig;
}

export function FloatingWhatsAppButton({ config }: FloatingWhatsAppButtonProps) {
  const handleClick = () => {
    const telLimpio = (config.whatsapp_numero || "+5491100000000").replace(/[^0-9]/g, "");
    const msg = encodeURIComponent(
      config.whatsapp_mensaje || "¡Hola Mia Pasta Bella! Quisiera hacer una consulta sobre sus pastas frescas."
    );
    window.open(`https://wa.me/${telLimpio}?text=${msg}`, "_blank");
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex items-center gap-3">
      <button
        onClick={handleClick}
        className="group relative flex items-center justify-center h-14 w-14 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white shadow-xl shadow-emerald-900/20 transition-all hover:scale-105 active:scale-95 focus:outline-none"
        aria-label="Contactar por WhatsApp"
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500 border-2 border-white"></span>
        </span>
        <MessageCircle className="h-7 w-7 fill-current" />

        {/* Tooltip en hover */}
        <span className="absolute right-16 px-3.5 py-1.5 rounded-xl bg-stone-900 text-white text-xs font-semibold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-lg">
          ¿Dudas? ¡Chateá con nosotros!
        </span>
      </button>
    </div>
  );
}
