"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ShoppingBag,
  MessageCircle,
  MapPin,
  QrCode,
  Search,
  Menu,
  X,
  Heart,
  Phone,
  User,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { TiendaConfig } from "@/lib/db";

interface NavbarProps {
  config: TiendaConfig;
  onOpenQR?: () => void;
}

export function Navbar({ config, onOpenQR }: NavbarProps) {
  const { totalCount, setIsCartOpen } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const telefonoLimpio = config.whatsapp_numero.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(
    config.whatsapp_mensaje
  )}`;

  const scrollToSection = (id: string) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-crema-300 bg-crema-50/95 backdrop-blur-md transition-all shadow-xs">
      {/* FRANJA DE ANUNCIO SUPERIOR / TANDA FRESCA */}
      <div className="bg-[#2C1810] text-amber-200 px-4 py-1.5 text-center text-[11px] sm:text-xs font-semibold flex items-center justify-center gap-2 border-b border-amber-900/30">
        <span className="inline-flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
          <span>Fábrica de Pastas por Encargo</span>
        </span>
        <span className="hidden sm:inline text-amber-500">•</span>
        <span className="hidden sm:inline">
          {config.proxima_tanda_fecha || "Próxima elaboración fresca: Viernes 17 de Octubre"}
        </span>
        <span className="text-amber-500">•</span>
        <span className="text-amber-100/90 font-bold">72h heladera / 90d freezer</span>
      </div>

      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
        {/* NAVEGACIÓN IZQUIERDA (DESKTOP) */}
        <nav className="hidden md:flex items-center gap-7 text-sm font-semibold text-[#2C1810]">
          <button
            onClick={() => scrollToSection("inicio")}
            className="hover:text-terracota-700 transition-colors py-1 cursor-pointer border-b-2 border-[#7A3E2D] font-bold text-[#7A3E2D]"
          >
            Inicio
          </button>
          <button
            onClick={() => scrollToSection("productos")}
            className="hover:text-terracota-700 transition-colors py-1 cursor-pointer text-stone-700"
          >
            Productos
          </button>
          <button
            onClick={() => scrollToSection("nosotros")}
            className="hover:text-terracota-700 transition-colors py-1 cursor-pointer text-stone-700"
          >
            Nosotros
          </button>
        </nav>

        {/* LOGO CORPORATIVO CENTRAL CON ISOTIPO OFICIAL */}
        <div
          onClick={() => scrollToSection("inicio")}
          className="flex items-center gap-3 cursor-pointer group py-1"
        >
          <div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full border-2 border-amber-400 bg-white p-0.5 shadow-sm group-hover:scale-105 transition-transform flex-shrink-0">
            <Image
              src="/images/logo.jpg"
              alt={config.nombre_tienda || "Mia Pasta Bella"}
              fill
              className="object-cover rounded-full"
              sizes="56px"
              priority
            />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5">
              <span className="font-serif text-xl sm:text-2xl font-black tracking-tight text-terracota-950 leading-none">
                {config.nombre_tienda || "Mia Pasta Bella"}
              </span>
              {/* BANDERA ITALIANA TRICOLOR MICRO-BADGE */}
              <span
                className="hidden sm:inline-flex h-2.5 w-4 overflow-hidden rounded-[2px] shadow-xs border border-stone-200"
                title="Tradición Italiana"
              >
                <span className="w-1/3 bg-[#009246]" />
                <span className="w-1/3 bg-white" />
                <span className="w-1/3 bg-[#CE2B37]" />
              </span>
            </div>
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-oliva-700 block mt-0.5">
              El sabor de sentirse en casa
            </span>
          </div>
        </div>

        {/* ACCIONES DERECHA: BÚSQUEDA, PERFIL, WHATSAPP Y CARRITO */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* BOTÓN BÚSQUEDA RÁPIDA */}
          <button
            onClick={() => scrollToSection("productos")}
            className="p-2 rounded-full text-stone-700 hover:text-terracota-900 hover:bg-[#EDE4D3] transition-colors flex items-center justify-center cursor-pointer"
            title="Buscar pastas"
          >
            <Search className="h-4.5 w-4.5" />
          </button>

          {/* BOTÓN PERFIL / CONTACTO RÁPIDO */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 rounded-full text-stone-700 hover:text-terracota-900 hover:bg-[#EDE4D3] transition-colors hidden sm:flex items-center justify-center cursor-pointer"
            title="Atención directa por WhatsApp"
          >
            <User className="h-4.5 w-4.5" />
          </a>

          {/* BOTÓN CÓDIGO QR PORTABLE */}
          {onOpenQR && (
            <button
              onClick={onOpenQR}
              className="hidden lg:inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100/90 px-3 py-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200 transition-all shadow-xs active:scale-95"
              title="Ver código QR para celular"
            >
              <QrCode className="h-3.5 w-3.5 text-amber-800 flex-shrink-0" />
              <span>Menú QR</span>
            </button>
          )}

          {/* CANASTA DE COMPRAS CON CONTADOR DINÁMICO */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative rounded-full bg-[#4A5A3F] hover:bg-[#3D4C33] text-white p-2 sm:px-3.5 sm:py-2 transition-all shadow-sm active:scale-95 flex items-center gap-2 cursor-pointer"
            aria-label="Abrir carrito de compras"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline text-xs font-bold">Pedido</span>
            {totalCount > 0 ? (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-400 text-[11px] font-black text-stone-950 shadow-sm ring-2 ring-white animate-pulse">
                {totalCount}
              </span>
            ) : (
              <span className="flex h-4.5 w-4.5 items-center justify-center rounded-full bg-white/20 text-[10px] font-bold text-white">
                0
              </span>
            )}
          </button>

          {/* BOTÓN MENÚ MÓVIL */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg text-terracota-900 hover:bg-crema-200 transition-colors"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-crema-300 bg-crema-100/98 px-5 py-4 space-y-3 animate-fadeIn">
          <nav className="flex flex-col gap-2 font-bold text-terracota-900 text-sm">
            <button
              onClick={() => scrollToSection("inicio")}
              className="text-left py-2 px-3 rounded-xl hover:bg-crema-200 transition-colors"
            >
              Inicio
            </button>
            <button
              onClick={() => scrollToSection("productos")}
              className="text-left py-2 px-3 rounded-xl hover:bg-crema-200 transition-colors"
            >
              Nuestras Pastas & Productos
            </button>
            <button
              onClick={() => scrollToSection("nosotros")}
              className="text-left py-2 px-3 rounded-xl hover:bg-crema-200 transition-colors"
            >
              Nosotros & Tradición
            </button>
          </nav>

          <div className="pt-2 border-t border-crema-300 flex flex-wrap gap-2">
            {onOpenQR && (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenQR();
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-amber-300 bg-amber-100 px-3 py-1.5 text-xs font-bold text-amber-950"
              >
                <QrCode className="h-3.5 w-3.5" />
                <span>Menú QR</span>
              </button>
            )}
            <a
              href={config.google_maps_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-crema-400 bg-white px-3 py-1.5 text-xs font-semibold text-terracota-800"
            >
              <MapPin className="h-3.5 w-3.5 text-terracota-600" />
              <span>Ver Ubicación</span>
            </a>
          </div>
        </div>
      )}
    </header>
  );
}
