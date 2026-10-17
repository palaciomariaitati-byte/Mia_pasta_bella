"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { ShoppingBag, MessageCircle, MapPin, QrCode } from "lucide-react";
import { useCart } from "@/context/cart-context";
import { TiendaConfig } from "@/lib/db";

interface NavbarProps {
  config: TiendaConfig;
  onOpenQR?: () => void;
}

export function Navbar({ config, onOpenQR }: NavbarProps) {
  const { totalCount, setIsCartOpen } = useCart();

  const telefonoLimpio = config.whatsapp_numero.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(
    config.whatsapp_mensaje
  )}`;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-crema-300 bg-crema-100/95 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* LOGO BOUTIQUE */}
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-terracota-400 bg-crema-200 shadow-sm">
            <Image
              src="/images/logo.jpg"
              alt={config.nombre_tienda}
              fill
              className="object-cover"
              sizes="48px"
              priority
            />
          </div>
          <div>
            <span className="font-serif text-xl font-bold tracking-tight text-terracota-900 block">
              {config.nombre_tienda}
            </span>
            <span className="text-[10px] uppercase tracking-widest text-oliva-700 font-semibold block">
              Pastas Frescas & Pre-Pizzas
            </span>
          </div>
        </div>

        {/* ACCIONES: QR PORTABLE, MAPS MÓVIL, WHATSAPP Y CARRITO */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* BOTÓN CÓDIGO QR PORTABLE */}
          {onOpenQR && (
            <button
              onClick={onOpenQR}
              className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/90 px-3 py-2 text-xs font-bold text-amber-950 hover:bg-amber-200 transition-all shadow-xs active:scale-95"
              title="Ver código QR para celular"
            >
              <QrCode className="h-4 w-4 text-amber-800 flex-shrink-0" />
              <span className="hidden sm:inline">Menú QR</span>
            </button>
          )}

          {/* ICONO DE GEOLOCALIZACIÓN VISIBLE (MAPS) - IDEAL PARA SMARTPHONES */}
          <a
            href={config.google_maps_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-full border border-crema-400 bg-crema-50 px-3 py-2 text-xs font-semibold text-terracota-800 hover:bg-crema-200 hover:text-terracota-900 transition-colors shadow-sm"
            title="Ver ubicación en Google Maps"
          >
            <MapPin className="h-4 w-4 text-terracota-600 flex-shrink-0 animate-bounce" />
            <span className="hidden sm:inline">Ubicación</span>
          </a>

          {/* Botón WhatsApp */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-oliva-500 hover:bg-oliva-600 text-white px-3.5 py-2 text-xs font-semibold transition-all shadow-sm active:scale-95"
            title="Escribir por WhatsApp"
          >
            <MessageCircle className="h-4 w-4 fill-current" />
            <span className="hidden md:inline">Pedir por WhatsApp</span>
          </a>

          {/* Canasta de Compras */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full bg-terracota-600 hover:bg-terracota-700 text-white p-2.5 transition-all shadow-sm active:scale-95"
            aria-label="Abrir pedido"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-oliva-500 text-[11px] font-bold text-white shadow-sm ring-2 ring-crema-100 animate-pulse">
                {totalCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
