"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Check,
  Search,
  X,
  ArrowRight,
  Clock,
  Users,
  Snowflake,
  Heart,
  Sparkles,
  Award,
  ChevronDown,
  Filter,
  MessageCircle,
  ShieldCheck,
  Home,
  Truck,
  Leaf,
  RotateCcw,
  QrCode,
  MapPin,
  Calendar,
} from "lucide-react";
import { CategoriaItem, ProductoItem, TiendaConfig } from "@/lib/db";
import { useCart } from "@/context/cart-context";

interface BookCatalogProps {
  categorias: CategoriaItem[];
  productos: ProductoItem[];
  config: TiendaConfig;
  onOpenSplash?: () => void;
  onOpenQR?: () => void;
}

// ==============================================================================
// FOTOS PREDETERMINADAS DE ALTA DEFINICIÓN POR CATEGORÍA
// (Fallback robusto editable directamente desde el Admin / Supabase)
// ==============================================================================
const CATEGORY_DEFAULT_IMAGES: Record<string, string> = {
  tallarines:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  sorrentinos:
    "https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80",
  ravioles:
    "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
  noquis:
    "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  tortellinis:
    "https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80",
  prepizzas:
    "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  empanadas:
    "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
  tartas:
    "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80",
};

/**
 * Resuelve la imagen de la categoría de forma totalmente dinámica:
 * 1. cat.imagen_url (si está definida en BD o store.json)
 * 2. La primera foto real de un producto de esa categoría que tenga imagen_url
 * 3. Fallback a la foto preset de alta resolución
 */
function getCategoryImageUrl(cat: CategoriaItem, allProducts: ProductoItem[]): string {
  if ((cat as any).imagen_url) return (cat as any).imagen_url;
  const prodWithImg = allProducts.find(
    (p) => p.categoria_id === cat.id && p.imagen_url && p.imagen_url.trim().length > 0
  );
  if (prodWithImg?.imagen_url) return prodWithImg.imagen_url;

  const slug = (cat.slug || cat.id).toLowerCase();
  for (const [key, url] of Object.entries(CATEGORY_DEFAULT_IMAGES)) {
    if (slug.includes(key)) return url;
  }
  return "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80";
}

export function BookCatalog({
  categorias,
  productos,
  config,
  onOpenSplash,
  onOpenQR,
}: BookCatalogProps) {
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [comensalesTarget, setComensalesTarget] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const { addItem, setIsCartOpen } = useCart();

  const telefonoLimpio = config.whatsapp_numero.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(
    config.whatsapp_mensaje
  )}`;

  // Filtrado reactivo de productos
  const filteredProducts = useMemo(() => {
    let prods = productos;

    // 1. Filtrar por categoría seleccionada
    if (selectedCategoryId) {
      prods = prods.filter((p) => p.categoria_id === selectedCategoryId);
    }

    // 2. Filtrar por búsqueda textual
    const q = searchQuery.trim().toLowerCase();
    if (q) {
      prods = prods.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.ingredientes && p.ingredientes.toLowerCase().includes(q)) ||
          (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(q))
      );
    }

    // 3. Filtrar por recomendador de comensales (Modo Anfitrión)
    if (comensalesTarget) {
      prods = prods.filter((p) => {
        const rinde = p.rinde_porciones || 2;
        return rinde >= 2;
      });
    }

    return prods;
  }, [productos, selectedCategoryId, searchQuery, comensalesTarget]);

  // Manejo de adición al carrito con feedback visual
  const handleAddToCart = (producto: ProductoItem) => {
    addItem(
      {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen_url: producto.imagen_url,
        categoria: producto.categoria_nombre,
        unidad_medida: producto.unidad_medida,
        rinde_porciones: producto.rinde_porciones || 2,
      },
      1
    );

    setAddedId(producto.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSelectCategory = (catId: string | null) => {
    setSelectedCategoryId(catId);
    scrollToSection("productos");
  };

  const currentCategoryName = useMemo(() => {
    if (!selectedCategoryId) return null;
    const cat = categorias.find((c) => c.id === selectedCategoryId);
    return cat ? cat.nombre : null;
  }, [selectedCategoryId, categorias]);

  return (
    <div className="w-full">
      {/* ============================================================== */}
      {/* 1. HERO BANNER PRINCIPAL (EDITORIAL FULL-WIDTH) */}
      {/* ============================================================== */}
      <section
        id="inicio"
        className="relative min-h-[580px] sm:min-h-[640px] flex items-center justify-center overflow-hidden bg-stone-950 text-white"
      >
        {/* FOTO PANORÁMICA DE FONDO (AMASADO ARTESANAL / SÉMOLA CANDEAL) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=2000&q=80"
            alt="Amasado de Pastas Artesanales Mía Pasta Bella"
            fill
            className="object-cover object-center opacity-45 scale-105 transform motion-safe:animate-pulse"
            priority
            sizes="100vw"
          />
          {/* DEGRADADOS Y VIÑETA DE CINE EDITORIAL */}
          <div className="absolute inset-0 bg-gradient-to-t from-[#212A1B] via-stone-950/70 to-stone-950/85" />
          <div className="absolute inset-0 bg-radial-gradient from-transparent via-stone-950/50 to-stone-950/90 pointer-events-none" />
        </div>

        {/* CONTENIDO EDITORIAL CENTRAL */}
        <div className="relative z-10 mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8 text-center flex flex-col items-center">
          {/* LÍNEA DE ENCABEZADO CON CORAZÓN */}
          <div className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/40 backdrop-blur-md mb-6 animate-fadeIn">
            <span className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-amber-300" />
            <Heart className="h-4 w-4 text-terracota-400 fill-terracota-400" />
            <span className="text-xs sm:text-sm font-bold tracking-widest uppercase text-amber-200">
              Pastas Artesanales de Autor
            </span>
            <span className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-amber-300" />
          </div>

          {/* TÍTULO PRINCIPAL EN TIPOGRAFÍA SERIF */}
          <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight leading-[1.15] max-w-4xl drop-shadow-lg">
            El verdadero sabor de la pasta,{" "}
            <span className="italic font-normal text-amber-300 underline decoration-terracota-500/60 decoration-wavy decoration-1 underline-offset-8">
              hecha con el corazón
            </span>
          </h1>

          {/* SUBTÍTULO INSTITUCIONAL */}
          <p className="mt-5 text-sm sm:text-lg text-crema-200/90 max-w-2xl font-sans leading-relaxed drop-shadow-sm">
            Amasamos a mano cada madrugada con 100% sémola de trigo candeal y huevos de campo.
            Elaboración fresca por encargo sin conservantes ni aditivos químicos.
          </p>

          {/* BADGES RÁPIDOS DE FÁBRICA */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2.5 sm:gap-4 text-xs text-amber-100 font-semibold">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-900/60 border border-stone-700/60 px-3.5 py-1.5 backdrop-blur-sm">
              🌾 Sémola Pura Candeal
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-900/60 border border-stone-700/60 px-3.5 py-1.5 backdrop-blur-sm">
              ❄️ 72 hs Heladera / 90d Freezer
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-stone-900/60 border border-stone-700/60 px-3.5 py-1.5 backdrop-blur-sm">
              ⏱️ 4-5 min Cocción Rápida
            </span>
          </div>

          {/* BOTONES DE LLAMADA A LA ACCIÓN (CTA) */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <button
              onClick={() => scrollToSection("nuestras-pastas")}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-terracota-600 via-terracota-700 to-[#5A2B1D] text-white px-8 py-4 text-sm sm:text-base font-black tracking-wide shadow-xl hover:shadow-terracota-600/40 hover:scale-105 transition-all border-2 border-amber-400 active:scale-95 cursor-pointer"
            >
              <span>VER PRODUCTOS</span>
              <ArrowRight className="h-5 w-5 text-amber-300" />
            </button>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 rounded-2xl bg-oliva-700/90 hover:bg-oliva-600 text-white px-7 py-4 text-sm sm:text-base font-bold shadow-md hover:scale-105 transition-all border border-oliva-500/60 active:scale-95 backdrop-blur-sm"
            >
              <MessageCircle className="h-5 w-5 fill-current" />
              <span>Pedir por WhatsApp</span>
            </a>
          </div>

          {/* TANDA ACTIVA INFORMATIVA */}
          <div className="mt-10 rounded-2xl border border-amber-400/30 bg-stone-900/80 backdrop-blur-md px-5 py-3 flex flex-wrap items-center justify-center gap-3 text-xs text-amber-200">
            <span className="flex h-2.5 w-2.5 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span className="font-extrabold uppercase tracking-wider text-amber-300">
              Tanda Fresca Activa:
            </span>
            <strong className="text-white font-bold">
              {config.proxima_tanda_fecha || "Viernes 17 de Octubre"}
            </strong>
            <span className="text-amber-500">•</span>
            <span className="text-stone-300">
              {config.cierre_pedidos_info || "Pedidos por encargo hasta agotar cupo de amasado"}
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 2. SECCIÓN "NUESTRAS PASTAS" (GRID CIRCULAR DE CATEGORÍAS) */}
      {/* ============================================================== */}
      <section
        id="nuestras-pastas"
        className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-oliva-700 bg-oliva-100/90 border border-oliva-300/80 px-3.5 py-1 rounded-full mb-3">
            <Award className="h-3.5 w-3.5 text-oliva-700" />
            <span>Fábrica de Autor</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-[#2C1810] tracking-tight">
            Nuestras Pastas
          </h2>
          <p className="mt-3 font-serif italic text-base sm:text-lg text-terracota-800/90 max-w-xl mx-auto">
            Recetas clásicas, con el amor de siempre.
          </p>
          <div className="h-1 w-16 bg-amber-400 mx-auto mt-4 rounded-full" />
        </div>

        {/* GRILLA DE TARJETAS CIRCULARES (EDITABLES DESDE ADMIN) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {categorias.map((cat) => {
            const isSelected = selectedCategoryId === cat.id;
            const catImage = getCategoryImageUrl(cat, productos);
            const countProds = productos.filter((p) => p.categoria_id === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className="group flex flex-col items-center text-center p-3 sm:p-4 rounded-3xl transition-all hover:bg-white hover:shadow-md cursor-pointer"
              >
                {/* CONTENEDOR CIRCULAR DE LA FOTO (ALTA COCINA) */}
                <div
                  className={`relative h-28 w-28 sm:h-36 sm:w-36 md:h-40 md:w-40 rounded-full mx-auto overflow-hidden bg-crema-200 shadow-md transition-all duration-300 group-hover:scale-105 ${
                    isSelected
                      ? "border-4 border-amber-400 ring-4 ring-amber-300/60 shadow-xl scale-105"
                      : "border-3 border-[#DFD3BD] group-hover:border-terracota-500"
                  }`}
                >
                  <Image
                    src={catImage}
                    alt={cat.nombre}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-500"
                    sizes="(max-width: 640px) 112px, (max-width: 768px) 144px, 160px"
                  />
                  {/* Gradiente sutil para contraste */}
                  <div className="absolute inset-0 bg-gradient-to-t from-stone-900/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>

                {/* TÍTULO DE LA CATEGORÍA */}
                <span
                  className={`font-serif font-black text-sm sm:text-base md:text-lg mt-3.5 leading-snug transition-colors ${
                    isSelected
                      ? "text-terracota-700 underline decoration-amber-400 underline-offset-4"
                      : "text-stone-900 group-hover:text-terracota-800"
                  }`}
                >
                  {cat.nombre}
                </span>

                {/* VARIEDADES DISPONIBLES */}
                <span className="text-[11px] font-bold text-stone-700 mt-1 uppercase tracking-wider">
                  {countProds} {countProds === 1 ? "variedad" : "variedades"}
                </span>
              </button>
            );
          })}
        </div>

        {/* BOTÓN PARA RESTABLECER / VER TODAS */}
        {selectedCategoryId && (
          <div className="mt-8 text-center animate-fadeIn">
            <button
              onClick={() => setSelectedCategoryId(null)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white border border-[#DFD3BD] hover:border-terracota-400 text-stone-700 hover:text-terracota-900 text-xs font-bold shadow-xs hover:shadow-sm transition-all"
            >
              <RotateCcw className="h-3.5 w-3.5 text-terracota-600" />
              <span>Ver todas las categorías</span>
            </button>
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 3. SECCIÓN "PRODUCTOS DESTACADOS" (GRILLA DE TARJETAS VERTICALES) */}
      {/* ============================================================== */}
      <section
        id="productos"
        className="py-14 sm:py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-[#E8DFC8]"
      >
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-8">
          <div>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#2C1810]">
              {currentCategoryName ? currentCategoryName : "Productos Destacados"}
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 mt-1">
              {filteredProducts.length}{" "}
              {filteredProducts.length === 1 ? "producto disponible" : "productos disponibles"} para
              encargar en la tanda fresca.
            </p>
          </div>

          {/* BARRA DE BÚSQUEDA INSTANTÁNEA */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-700 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por nombre o relleno..."
              className="w-full pl-10 pr-9 py-2.5 rounded-2xl bg-white border border-[#DFD3BD] focus:border-terracota-500 focus:outline-none focus:ring-2 focus:ring-terracota-200 text-xs sm:text-sm text-stone-900 placeholder:text-stone-700 transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-700 hover:text-stone-700 p-0.5"
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* PÍLDORAS DE FILTRADO RÁPIDO DE CATEGORÍAS (FLEX-WRAP SIN RECORTES) */}
        <div className="flex flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-2.5 mb-8">
          <button
            onClick={() => setSelectedCategoryId(null)}
            className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
              selectedCategoryId === null
                ? "bg-terracota-700 text-white border-2 border-amber-300 shadow-sm"
                : "bg-white text-stone-700 hover:text-terracota-900 border border-[#DFD3BD] hover:border-terracota-400"
            }`}
          >
            Todas las pastas ({productos.length})
          </button>

          {categorias.map((cat) => {
            const isCatActive = selectedCategoryId === cat.id;
            const count = productos.filter((p) => p.categoria_id === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategoryId(cat.id)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                  isCatActive
                    ? "bg-terracota-700 text-white border-2 border-amber-300 shadow-sm"
                    : "bg-white text-stone-700 hover:text-terracota-900 border border-[#DFD3BD] hover:border-terracota-400"
                }`}
              >
                {cat.nombre} ({count})
              </button>
            );
          })}
        </div>

        {/* CALCULADOR DE COMENSALES (MODO ANFITRIÓN) */}
        <div className="mb-8 rounded-2xl border border-amber-300 bg-amber-50/70 p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="h-10 w-10 rounded-xl bg-amber-200 border border-amber-400 flex items-center justify-center flex-shrink-0 text-amber-900">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="font-bold text-xs sm:text-sm text-[#2C1810] block">
                Calculador de Porciones de Fábrica:
              </span>
              <span className="text-[11px] sm:text-xs text-stone-700 block">
                ¿Para cuántas personas vas a cocinar? Te sugerimos cajas para que rindan exactas.
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {[2, 4, 6, 8].map((comensales) => (
              <button
                key={comensales}
                onClick={() =>
                  setComensalesTarget(comensalesTarget === comensales ? null : comensales)
                }
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  comensalesTarget === comensales
                    ? "bg-[#2C1810] text-amber-200 border-2 border-amber-400 shadow-sm"
                    : "bg-white text-stone-700 border border-amber-200 hover:border-amber-400"
                }`}
              >
                {comensales} personas
              </button>
            ))}
            {comensalesTarget && (
              <button
                onClick={() => setComensalesTarget(null)}
                className="text-[11px] font-bold text-terracota-700 underline uppercase tracking-wider ml-1"
              >
                Limpiar
              </button>
            )}
          </div>
        </div>

        {/* GRILLA DE TARJETAS DE PRODUCTO */}
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-[#DFD3BD] p-8 max-w-xl mx-auto">
            <ShoppingBag className="h-12 w-12 text-stone-700 mx-auto mb-3" />
            <h4 className="font-serif text-xl font-bold text-stone-800">
              No se encontraron productos
            </h4>
            <p className="text-xs sm:text-sm text-stone-700 mt-1">
              Probá borrando el texto de búsqueda o seleccionando otra categoría.
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCategoryId(null);
                setComensalesTarget(null);
              }}
              className="mt-4 px-5 py-2.5 rounded-xl bg-terracota-700 text-white text-xs font-bold hover:bg-terracota-800 transition-colors"
            >
              Ver todo el catálogo
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((prod) => {
              const isAdded = addedId === prod.id;
              const rinde = prod.rinde_porciones || 2;
              const coccion = prod.tiempo_coccion_minutos || 4;

              return (
                <div
                  key={prod.id}
                  className="rounded-3xl bg-white border border-[#E8DFC8] shadow-sm hover:shadow-xl hover:border-terracota-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                >
                  {/* IMAGEN VERTICAL DEL PRODUCTO (EDITABLE DESDE ADMIN) */}
                  <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-stone-100 flex-shrink-0">
                    <Image
                      src={
                        prod.imagen_url ||
                        "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80"
                      }
                      alt={prod.nombre}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />

                    {/* BADGE DE CATEGORÍA */}
                    <span className="absolute top-3 left-3 rounded-full bg-[#2C1810]/90 text-amber-200 border border-amber-400/50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-wider backdrop-blur-xs">
                      {prod.categoria_nombre}
                    </span>

                    {/* BADGE DE PORCIONES */}
                    <span className="absolute top-3 right-3 rounded-full bg-white/95 text-stone-800 border border-stone-200 px-2.5 py-1 text-[10px] font-bold shadow-xs flex items-center gap-1 backdrop-blur-xs">
                      <Users className="h-3 w-3 text-terracota-600" />
                      <span>Rinde {rinde} porc.</span>
                    </span>
                  </div>

                  {/* CUERPO DE LA TARJETA */}
                  <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-lg font-black text-stone-900 group-hover:text-terracota-800 transition-colors leading-snug">
                        {prod.nombre}
                      </h4>

                      {/* INGREDIENTES / DESCRIPCIÓN */}
                      <p className="text-xs text-stone-700 line-clamp-2 mt-1.5 leading-relaxed">
                        {prod.ingredientes ||
                          "Elaborado con 100% sémola candeal pura y huevos de granja."}
                      </p>

                      {/* INDICADORES DE FÁBRICA */}
                      <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-700 font-medium">
                        <span className="inline-flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-600" />
                          <span>{coccion} min cocción</span>
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Snowflake className="h-3.5 w-3.5 text-blue-500" />
                          <span>72h / 90d</span>
                        </span>
                      </div>
                    </div>

                    {/* PRECIO Y BOTÓN DE COMPRA DIRECTO */}
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between gap-3">
                      <div>
                        <span className="text-[10px] uppercase tracking-wider text-stone-700 block font-bold">
                          Precio de fábrica
                        </span>
                        <div className="flex items-baseline gap-1">
                          <span className="font-serif text-xl sm:text-2xl font-black text-terracota-900">
                            $ {prod.precio.toLocaleString("es-AR")}
                          </span>
                        </div>
                        <span className="text-[10px] text-stone-700 block">
                          / {prod.unidad_medida || "porción"}
                        </span>
                      </div>

                      {/* BOTÓN "AGREGAR" CON RESPUESTA VISUAL INMEDIATA */}
                      <button
                        onClick={() => handleAddToCart(prod)}
                        className={`px-4 sm:px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer ${
                          isAdded
                            ? "bg-emerald-600 text-white ring-2 ring-emerald-300 scale-105"
                            : "bg-terracota-700 hover:bg-terracota-800 text-white hover:shadow-md"
                        }`}
                      >
                        {isAdded ? (
                          <>
                            <Check className="h-4 w-4" />
                            <span>¡Listo!</span>
                          </>
                        ) : (
                          <>
                            <ShoppingBag className="h-4 w-4" />
                            <span>Agregar</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* ============================================================== */}
      {/* 4. BANDA DE VALORES ARTESANALES (4 PILARES INSTITUCIONALES) */}
      {/* ============================================================== */}
      <section className="bg-gradient-to-b from-[#FAF6EE] to-[#F4ECE0] py-16 px-4 sm:px-6 lg:px-8 border-t border-b border-[#E8DFC8]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-[11px] font-bold uppercase tracking-widest text-terracota-700 block mb-2">
              El Manifiesto de Fábrica
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#2C1810]">
              La Calidad de lo Auténtico
            </h3>
            <div className="h-1 w-12 bg-amber-400 mx-auto mt-3 rounded-full" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {/* PILAR 1 */}
            <div className="rounded-3xl bg-white/90 border border-[#DFD3BD] p-6 shadow-xs hover:shadow-md transition-shadow text-center sm:text-left flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-oliva-100 border border-oliva-300 text-oliva-800 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                  <Leaf className="h-6 w-6 text-oliva-700" />
                </div>
                <h4 className="font-serif text-lg font-bold text-terracota-950 mb-2">
                  1. Ingredientes seleccionados
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  100% sémola de trigo candeal pura, huevos de granja frescos y verduras naturales de
                  estación sin químicos ni aditivos.
                </p>
              </div>
            </div>

            {/* PILAR 2 */}
            <div className="rounded-3xl bg-white/90 border border-[#DFD3BD] p-6 shadow-xs hover:shadow-md transition-shadow text-center sm:text-left flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                  <Home className="h-6 w-6 text-amber-700" />
                </div>
                <h4 className="font-serif text-lg font-bold text-terracota-950 mb-2">
                  2. Elaboración artesanal
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Amasado diario a la vista en lotes limitados, respetando el descanso de la masa, el
                  corte manual y el armado prolijo.
                </p>
              </div>
            </div>

            {/* PILAR 3 */}
            <div className="rounded-3xl bg-white/90 border border-[#DFD3BD] p-6 shadow-xs hover:shadow-md transition-shadow text-center sm:text-left flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-terracota-100 border border-terracota-300 text-terracota-800 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                  <Heart className="h-6 w-6 text-terracota-700 fill-terracota-700/20" />
                </div>
                <h4 className="font-serif text-lg font-bold text-terracota-950 mb-2">
                  3. Sabor casero en cada bocado
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Recetas familiares de herencia italiana pensadas para revivir el clásico almuerzo
                  de domingo alrededor de la mesa.
                </p>
              </div>
            </div>

            {/* PILAR 4 */}
            <div className="rounded-3xl bg-white/90 border border-[#DFD3BD] p-6 shadow-xs hover:shadow-md transition-shadow text-center sm:text-left flex flex-col justify-between">
              <div>
                <div className="h-12 w-12 rounded-2xl bg-stone-100 border border-stone-300 text-stone-800 flex items-center justify-center mb-4 mx-auto sm:mx-0">
                  <Truck className="h-6 w-6 text-stone-700" />
                </div>
                <h4 className="font-serif text-lg font-bold text-terracota-950 mb-2">
                  4. Envíos y retiro en fábrica
                </h4>
                <p className="text-xs text-stone-700 leading-relaxed">
                  Cadena de frío garantizada para conservar la pasta fresca o congelada, con retiros
                  programados en tandas activas.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================== */}
      {/* 5. SECCIÓN "NOSOTROS / HISTORIA DE LA FÁBRICA" */}
      {/* ============================================================== */}
      <section id="nosotros" className="py-16 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="rounded-3xl bg-white border border-[#DFD3BD] p-6 sm:p-10 lg:p-12 shadow-sm flex flex-col lg:flex-row items-center gap-10">
          {/* FOTO HISTORIA / AMASADO */}
          <div className="relative h-72 sm:h-96 w-full lg:w-1/2 rounded-2xl overflow-hidden shadow-md flex-shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1000&q=80"
              alt="Historia de Mía Pasta Bella"
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-900/60 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 text-white">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-amber-300 block">
                Fábrica de Pastas por Encargo
              </span>
              <p className="font-serif text-base sm:text-lg font-bold">
                Mía Pasta Bella · El sabor de sentirse en casa
              </p>
            </div>
          </div>

          {/* TEXTO DE HISTORIA Y TRADICIÓN */}
          <div className="w-full lg:w-1/2 space-y-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300 px-3 py-1 text-xs font-bold uppercase tracking-wider">
              Nuestra Historia
            </span>
            <h3 className="font-serif text-2xl sm:text-3xl md:text-4xl font-black text-[#2C1810] leading-tight">
              Una pasión artesanal que nace en el calor del hogar
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              Mía Pasta Bella nació con una convicción clara: devolverle a la mesa familiar el sabor
              genuino de la pasta fresca que hacían las abuelas. En nuestra fábrica de autor no
              usamos polvos industriales, conservantes ni colorantes.
            </p>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
              Cada cinta de tallarín, cada plancha de ravioles y cada medallón de sorrentino se
              elabora con sémola pura de trigo candeal seleccionada y huevos de granja. Cuidamos la
              cadena de frío y los tiempos de descanso para que al hervirlas sientas esa textura al
              dente inconfundible.
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-oliva-700 hover:bg-oliva-800 text-white font-bold text-xs sm:text-sm shadow-md transition-all active:scale-95"
              >
                <MessageCircle className="h-4 w-4 fill-current" />
                <span>Conversar con el Maestro Pastero</span>
              </a>

              {onOpenSplash && (
                <button
                  onClick={onOpenSplash}
                  className="inline-flex items-center gap-1.5 px-4 py-3 rounded-2xl bg-white border border-[#DFD3BD] hover:border-terracota-400 text-stone-700 text-xs font-bold transition-all shadow-xs"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-terracota-600" />
                  <span>Ver Presentación</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
