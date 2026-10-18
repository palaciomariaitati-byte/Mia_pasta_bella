"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  ShoppingBag,
  Check,
  Search,
  X,
  ArrowRight,
  ArrowLeft,
  Clock,
  Users,
  Snowflake,
  Heart,
  Sparkles,
  Award,
  MessageCircle,
  Home,
  Truck,
  Leaf,
  RotateCcw,
  QrCode,
  MapPin,
  Calendar,
  UtensilsCrossed,
  Flame,
} from "lucide-react";
import { CategoriaItem, ProductoItem, TiendaConfig } from "@/lib/db";
import { useCart } from "@/context/cart-context";

interface BookCatalogProps {
  categorias: CategoriaItem[];
  productos: ProductoItem[];
  config: TiendaConfig;
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

/**
 * Helper para sugerir maridaje o complemento artesanal según la categoría
 */
function getComplementoSugerido(catId: string, nombre: string): string {
  const text = `${catId} ${nombre}`.toLowerCase();
  if (text.includes("tallarin") || text.includes("fideo")) {
    return "🥫 Maridaje ideal: Salsa Filetto casera, Pesto genovés o crema de salvia y manteca.";
  }
  if (text.includes("sorrentino")) {
    return "🧀 Sugerencia de autor: Salsa suave cuatro quesos, crema de nuez o pomodoro artesanal.";
  }
  if (text.includes("raviol")) {
    return "🥫 Maridaje ideal: Salsa boloñesa tradicional con carne braseada o salsa rosa suave.";
  }
  if (text.includes("noqui")) {
    return "🍅 Maridaje ideal: Clásico tuco casero o manteca clarificada con hojas de salvia fresca.";
  }
  if (text.includes("tortellini") || text.includes("capelletti")) {
    return "🍲 Sugerencia de autor: Exquisitos en caldo humeante (in brodo) o con manteca y parmesano.";
  }
  if (text.includes("prepizz")) {
    return "🔥 Tip de fábrica: Gratinar a horno muy fuerte (250°C) durante 6 a 8 minutos con abundante mozzarella.";
  }
  if (text.includes("empanada")) {
    return "🥟 Tip de fábrica: Hornear a 220°C por 12-15 min pinceladas con huevo de campo.";
  }
  if (text.includes("tarta")) {
    return "🥧 Tip de fábrica: Calentar 10 min a horno medio. Rinde ideal con ensalada fresca de hojas verdes.";
  }
  return "✨ Elaborado en tanda fresca del día con ingredientes 100% naturales.";
}

export function BookCatalog({
  categorias,
  productos,
  config,
  onOpenQR,
}: BookCatalogProps) {
  // selectedCategoryId: null = Portada Principal Limpia, string = Subpágina de Categoría
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [comensalesTarget, setComensalesTarget] = useState<number | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);

  const { addItem, totalCount, setIsCartOpen } = useCart();

  const telefonoLimpio = config.whatsapp_numero.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(
    config.whatsapp_mensaje
  )}`;

  // Categoría seleccionada actualmente
  const selectedCategory = useMemo(() => {
    if (!selectedCategoryId) return null;
    return categorias.find((c) => c.id === selectedCategoryId) || null;
  }, [selectedCategoryId, categorias]);

  // Productos de la categoría activa (con filtro de búsqueda interno)
  const categoryProducts = useMemo(() => {
    if (!selectedCategoryId) return [];
    let prods = productos.filter((p) => p.categoria_id === selectedCategoryId);

    const q = searchQuery.trim().toLowerCase();
    if (q) {
      prods = prods.filter(
        (p) =>
          p.nombre.toLowerCase().includes(q) ||
          (p.ingredientes && p.ingredientes.toLowerCase().includes(q))
      );
    }

    if (comensalesTarget) {
      prods = prods.filter((p) => (p.rinde_porciones || 2) >= 2);
    }

    return prods;
  }, [productos, selectedCategoryId, searchQuery, comensalesTarget]);

  // Cambiar a subpágina de categoría con scroll suave hacia arriba
  const handleOpenCategory = (catId: string) => {
    setSelectedCategoryId(catId);
    setSearchQuery("");
    setComensalesTarget(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Regresar a la portada principal con scroll suave hacia la grilla de categorías
  const handleBackToHome = () => {
    setSelectedCategoryId(null);
    setSearchQuery("");
    setComensalesTarget(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToCategories = () => {
    const el = document.getElementById("nuestras-pastas");
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

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

  // ==============================================================================
  // VISTA B: SUBPÁGINA DEDICADA DE CATEGORÍA SELECCIONADA
  // ==============================================================================
  if (selectedCategory) {
    const catImage = getCategoryImageUrl(selectedCategory, productos);
    const totalVariedades = productos.filter((p) => p.categoria_id === selectedCategory.id).length;

    return (
      <div className="w-full min-h-screen bg-[#FAF6EE] text-[#2C1810] animate-fadeIn pb-20">
        {/* BARRA SUPERIOR DE NAVEGACIÓN Y REGRESO */}
        <div className="sticky top-[58px] z-30 bg-[#FAF6EE]/95 backdrop-blur-md border-b border-[#E8DFC8] py-3.5 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
            {/* BOTÓN VOLVER A CATEGORÍAS */}
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#DFD3BD] hover:border-terracota-500 hover:text-terracota-900 text-stone-800 text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-terracota-700" />
              <span>Volver a Categorías</span>
            </button>

            {/* BREADCRUMB / TÍTULO RÁPIDO */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-stone-600">
              <button
                onClick={handleBackToHome}
                className="hover:text-terracota-700 transition-colors"
              >
                Portada
              </button>
              <span>/</span>
              <span className="text-terracota-900 font-bold">{selectedCategory.nombre}</span>
            </div>

            {/* BOTÓN DE CANASTA RÁPIDO */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-terracota-700 hover:bg-terracota-800 text-white text-xs font-bold shadow-xs active:scale-95 transition-all"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>Mi Pedido ({totalCount})</span>
            </button>
          </div>
        </div>

        {/* HERO / HEADER DE LA CATEGORÍA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 pb-6">
          <div className="relative rounded-3xl border border-[#DFD3BD] bg-gradient-to-br from-[#FFFDF9] via-[#FAF6EE] to-[#F5EFE0] p-6 sm:p-10 shadow-sm overflow-hidden flex flex-col md:flex-row items-center gap-6 sm:gap-10">
            {/* FOTO CIRCULAR PROTAGONISTA DE LA CATEGORÍA */}
            <div className="relative h-32 w-32 sm:h-44 sm:w-44 md:h-48 md:w-48 rounded-full overflow-hidden border-4 border-amber-400 ring-4 ring-amber-300/40 shadow-xl flex-shrink-0 bg-crema-200">
              <Image
                src={catImage}
                alt={selectedCategory.nombre}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 128px, 192px"
                priority
              />
            </div>

            {/* INFORMACIÓN Y DESCRIPCIÓN ARTESANAL */}
            <div className="flex-1 text-center md:text-left">
              <div className="inline-flex items-center gap-1.5 rounded-full bg-oliva-100 text-oliva-800 border border-oliva-300 px-3 py-0.5 text-[11px] font-bold uppercase tracking-wider mb-2">
                <Award className="h-3.5 w-3.5 text-oliva-700" />
                <span>Segmento de Fábrica</span>
              </div>
              <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-black text-terracota-950 leading-tight">
                {selectedCategory.nombre}
              </h1>
              <p className="mt-3 text-sm sm:text-base text-stone-700 leading-relaxed font-sans max-w-2xl">
                {selectedCategory.descripcion ||
                  "Elaboradas artesanalmente con 100% sémola de trigo candeal seleccionada y huevos de granja frescos."}
              </p>

              {/* BADGES TÉCNICOS */}
              <div className="mt-4 flex flex-wrap items-center justify-center md:justify-start gap-2.5 sm:gap-3 text-xs font-semibold">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 text-amber-950 border border-amber-300">
                  <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                  <span>{totalVariedades} variedades disponibles</span>
                </span>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-stone-800 border border-stone-200">
                  <Snowflake className="h-3.5 w-3.5 text-blue-500" />
                  <span>72h heladera / 90d freezer</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA Y FILTRO DENTRO DE LA CATEGORÍA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* BUSCADOR */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-700 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Buscar en ${selectedCategory.nombre}...`}
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

            {/* MODO ANFITRIÓN (PORCIONES) */}
            <div className="flex items-center gap-2 self-start sm:self-auto overflow-x-auto no-scrollbar py-1">
              <span className="text-xs font-bold text-stone-700 flex-shrink-0 flex items-center gap-1">
                <Users className="h-3.5 w-3.5 text-terracota-600" />
                <span>Porciones:</span>
              </span>
              {[2, 4, 6, 8].map((comensales) => (
                <button
                  key={comensales}
                  onClick={() =>
                    setComensalesTarget(comensalesTarget === comensales ? null : comensales)
                  }
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex-shrink-0 ${
                    comensalesTarget === comensales
                      ? "bg-[#2C1810] text-amber-200 border-2 border-amber-400 shadow-sm"
                      : "bg-white text-stone-700 border border-stone-200 hover:border-amber-400"
                  }`}
                >
                  {comensales} p.
                </button>
              ))}
              {comensalesTarget && (
                <button
                  onClick={() => setComensalesTarget(null)}
                  className="text-[11px] font-bold text-terracota-700 underline uppercase tracking-wider ml-1 flex-shrink-0"
                >
                  Ver todo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* GRILLA COMPLETA DE PRODUCTOS DE ESTA CATEGORÍA */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {categoryProducts.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border border-[#DFD3BD] p-8 max-w-md mx-auto">
              <ShoppingBag className="h-12 w-12 text-stone-700 mx-auto mb-3" />
              <h3 className="font-serif text-xl font-bold text-stone-800">
                No se encontraron variedades
              </h3>
              <p className="text-xs text-stone-700 mt-1">
                Probá borrando el término de búsqueda o cambiando el filtro de porciones.
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setComensalesTarget(null);
                }}
                className="mt-4 px-5 py-2.5 rounded-xl bg-terracota-700 text-white text-xs font-bold hover:bg-terracota-800 transition-colors"
              >
                Mostrar todas las variedades
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {categoryProducts.map((prod) => {
                const isAdded = addedId === prod.id;
                const rinde = prod.rinde_porciones || 2;
                const coccion = prod.tiempo_coccion_minutos || 4;
                const sugerenciaComplemento = getComplementoSugerido(
                  selectedCategory.id,
                  prod.nombre
                );

                return (
                  <div
                    key={prod.id}
                    className="rounded-3xl bg-white border border-[#E8DFC8] shadow-sm hover:shadow-xl hover:border-terracota-400 transition-all duration-300 overflow-hidden flex flex-col justify-between group"
                  >
                    {/* FOTO VERTICAL REAL (DINÁMICA DESDE ADMIN) */}
                    <div className="relative h-56 sm:h-64 w-full overflow-hidden bg-stone-100 flex-shrink-0">
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

                      {/* BADGE DE PORCIONES */}
                      <span className="absolute top-3 right-3 rounded-full bg-white/95 text-stone-800 border border-stone-200 px-2.5 py-1 text-[10px] font-bold shadow-xs flex items-center gap-1 backdrop-blur-xs">
                        <Users className="h-3 w-3 text-terracota-600" />
                        <span>Rinde {rinde} porc.</span>
                      </span>

                      {/* BADGE DE COCCIÓN RÁPIDA */}
                      <span className="absolute bottom-3 left-3 rounded-full bg-[#2C1810]/90 text-amber-200 border border-amber-400/50 px-2.5 py-1 text-[10px] font-extrabold flex items-center gap-1 backdrop-blur-xs">
                        <Clock className="h-3 w-3 text-amber-400" />
                        <span>{coccion} min cocción</span>
                      </span>
                    </div>

                    {/* CUERPO DE LA TARJETA */}
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <div>
                        <h3 className="font-serif text-lg font-black text-stone-900 group-hover:text-terracota-800 transition-colors leading-snug">
                          {prod.nombre}
                        </h3>

                        {/* DESCRIPCIÓN DE INGREDIENTES */}
                        <p className="text-xs text-stone-700 line-clamp-2 mt-2 leading-relaxed">
                          {prod.ingredientes ||
                            "Elaborado con 100% sémola candeal pura y huevos de granja."}
                        </p>

                        {/* COMPLEMENTO / SUGERENCIA DE MARIDAJE DESTACADA */}
                        <div className="mt-3 p-2.5 rounded-xl bg-amber-50/80 border border-amber-200/80 text-[11px] text-amber-950 leading-snug">
                          <span className="font-bold block text-amber-900 mb-0.5">
                            Maridaje & Sugerencia:
                          </span>
                          <span className="text-stone-700">{sugerenciaComplemento}</span>
                        </div>
                      </div>

                      {/* PRECIO Y BOTÓN DE COMPRA */}
                      <div className="mt-5 pt-3.5 border-t border-stone-100 flex items-center justify-between gap-3">
                        <div>
                          <span className="text-[10px] uppercase tracking-wider text-stone-700 block font-bold">
                            Precio de fábrica
                          </span>
                          <div className="flex items-baseline gap-1">
                            <span className="font-serif text-2xl font-black text-terracota-900">
                              $ {prod.precio.toLocaleString("es-AR")}
                            </span>
                          </div>
                          <span className="text-[10px] text-stone-700 block">
                            / {prod.unidad_medida || "caja"}
                          </span>
                        </div>

                        {/* BOTÓN "AGREGAR" CON FEEDBACK VISUAL INMEDIATO */}
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
        </div>

        {/* CAMBIADOR RÁPIDO A OTRAS CATEGORÍAS */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-6 border-t border-[#E8DFC8] mt-12">
          <div className="text-center mb-6">
            <span className="text-xs font-bold uppercase tracking-wider text-terracota-800">
              Explorar otras categorías de fábrica
            </span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
            {categorias.map((cat) => {
              const isCurrent = cat.id === selectedCategory.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleOpenCategory(cat.id)}
                  className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all shadow-xs cursor-pointer ${
                    isCurrent
                      ? "bg-terracota-700 text-white border-2 border-amber-300 shadow-sm"
                      : "bg-white text-stone-700 hover:text-terracota-900 border border-[#DFD3BD] hover:border-terracota-400"
                  }`}
                >
                  {cat.nombre}
                </button>
              );
            })}
          </div>

          <div className="mt-8 text-center">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-[#DFD3BD] hover:border-terracota-500 text-terracota-900 text-xs sm:text-sm font-bold shadow-sm hover:shadow-md transition-all active:scale-95 cursor-pointer"
            >
              <ArrowLeft className="h-4 w-4 text-terracota-700" />
              <span>Volver a la Portada de Categorías</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ==============================================================================
  // VISTA A: PORTADA PRINCIPAL LIMPIA Y ENFOCADA (HERO + CÍRCULOS DE CATEGORÍA)
  // (Sin grilla redundante de productos para una experiencia directa y elegante)
  // ==============================================================================
  return (
    <div className="w-full bg-[#FAF6EE] text-[#2C1810]">
      {/* 1. HERO BANNER PRINCIPAL (SPLIT EDITORIAL SOBRE FONDO CREMA ARTESANAL) */}
      <section
        id="inicio"
        className="relative bg-[#FAF6EE] overflow-hidden pt-8 pb-12 sm:pt-12 sm:pb-16 border-b border-[#E8DFC8]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            {/* COLUMNA IZQUIERDA: MENSAJE DE AUTOR & LLAMADA A LA ACCIÓN */}
            <div className="lg:col-span-5 flex flex-col items-center lg:items-start text-center lg:text-left">
              {/* ENCABEZADO "PASTAS ARTESANALES" CON CORAZÓN */}
              <div className="flex flex-col items-center lg:items-start gap-1 mb-5">
                <div className="flex items-center gap-3">
                  <span className="h-px w-10 sm:w-16 bg-[#B5A48B]" />
                  <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#4A5A3F]">
                    Pastas Artesanales
                  </span>
                  <span className="h-px w-10 sm:w-16 bg-[#B5A48B]" />
                </div>
                <div className="w-full flex justify-center text-[#7A3E2D] pt-0.5">
                  <span className="text-sm">♡</span>
                </div>
              </div>

              {/* TÍTULO PRINCIPAL Y ESLOGAN EDITORIAL */}
              <h1 className="font-serif text-3.5xl sm:text-5xl md:text-5.5xl font-black text-[#2C1810] leading-[1.12] tracking-tight">
                El verdadero sabor
                <span className="block font-serif">de la pasta,</span>
                <span className="block font-serif italic font-normal text-[#7A3E2D] mt-1 text-3xl sm:text-4.5xl md:text-5xl">
                  hecha con el corazón
                </span>
              </h1>

              {/* DESCRIPCIÓN ARTESANAL */}
              <p className="mt-4 text-xs sm:text-sm text-stone-700 leading-relaxed max-w-md">
                Amasadas a mano con 100% sémola pura de trigo candeal y huevos de granja. Elaboración
                fresca por encargo para disfrutar en familia del verdadero sabor casero.
              </p>

              {/* BOTÓN "VER PRODUCTOS →" (PÍLDORA VERDE OLIVA ELEGANTE) */}
              <div className="mt-7 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                <button
                  onClick={scrollToCategories}
                  className="inline-flex items-center gap-3 px-8 py-3.5 rounded-full bg-[#4A5A3F] hover:bg-[#3D4C33] text-white text-xs sm:text-sm font-bold uppercase tracking-wider shadow-md hover:shadow-lg transition-all active:scale-95 cursor-pointer"
                >
                  <span>VER PRODUCTOS</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white hover:bg-stone-50 text-[#4A5A3F] border border-[#C5BBA6] text-xs sm:text-sm font-bold shadow-xs hover:shadow-sm transition-all active:scale-95"
                >
                  <MessageCircle className="h-4 w-4 text-emerald-600 fill-current" />
                  <span>Por Encargo</span>
                </a>
              </div>
            </div>

            {/* COLUMNA DERECHA: FOTO EDITORIAL DEL AMASADO / FETTUCCINE FRESCOS */}
            <div className="lg:col-span-7 flex justify-center lg:justify-end">
              <div className="relative w-full max-w-2xl h-[320px] sm:h-[420px] md:h-[480px] rounded-3xl overflow-hidden shadow-xl border-4 border-white/80 bg-stone-100">
                <Image
                  src="https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=1200&q=80"
                  alt="Pastas Frescas Artesanales Mía Pasta Bella"
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 1024px) 100vw, 58vw"
                />
                {/* VIÑETA SUTIL INFERIOR */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SECCIÓN "NUESTRAS PASTAS" (CÍRCULOS DE CATEGORÍA INTERACTIVOS) */}
      <section
        id="productos"
        className="py-14 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto"
      >
        <div className="text-center mb-12">
          {/* TÍTULO EDITORIAL CON LÍNEAS LATERALES Y CORAZÓN */}
          <div className="flex items-center justify-center gap-4 mb-1">
            <span className="h-px w-12 sm:w-24 bg-[#B5A48B]" />
            <h2 className="font-serif text-2xl sm:text-4xl md:text-4.5xl font-black text-[#2C1810] tracking-tight">
              Nuestras Pastas
            </h2>
            <span className="h-px w-12 sm:w-24 bg-[#B5A48B]" />
          </div>

          <div className="text-[#7A3E2D] text-sm my-0.5">♡</div>

          <p className="font-serif italic text-sm sm:text-base md:text-lg text-stone-700 max-w-xl mx-auto mt-1">
            Recetas clásicas, con el amor de siempre.
          </p>
        </div>

        {/* GRILLA DE CÍRCULOS DE CATEGORÍA INTERACTIVOS */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6 sm:gap-8 max-w-6xl mx-auto">
          {categorias.map((cat) => {
            const catImage = getCategoryImageUrl(cat, productos);

            return (
              <button
                key={cat.id}
                onClick={() => handleOpenCategory(cat.id)}
                className="group flex flex-col items-center text-center transition-all cursor-pointer active:scale-95"
              >
                {/* CONTENEDOR CIRCULAR SUAVE */}
                <div className="relative h-28 w-28 sm:h-34 sm:w-34 md:h-36 md:w-36 rounded-full mx-auto p-1.5 bg-[#EDE4D3] shadow-xs group-hover:shadow-md transition-all duration-300 group-hover:scale-105 border border-[#DFD3BD] group-hover:border-[#4A5A3F]">
                  <div className="relative w-full h-full rounded-full overflow-hidden bg-white">
                    <Image
                      src={catImage}
                      alt={cat.nombre}
                      fill
                      className="object-cover group-hover:scale-110 transition-transform duration-500"
                      sizes="(max-width: 640px) 112px, (max-width: 768px) 136px, 144px"
                    />
                  </div>
                </div>

                {/* TÍTULO DE LA CATEGORÍA */}
                <span className="font-serif font-bold text-sm sm:text-base mt-3 transition-colors text-stone-900 group-hover:text-[#7A3E2D]">
                  {cat.nombre}
                </span>

                {/* LÍNEA DECORATIVA DELGADA BAJO EL NOMBRE */}
                <span className="block w-10 sm:w-12 h-[2px] bg-[#C5BBA6] group-hover:bg-[#7A3E2D] mt-1.5 transition-colors rounded-full" />
              </button>
            );
          })}
        </div>
      </section>

      {/* 3. BANDA DE VALORES ARTESANALES (4 PILARES INSTITUCIONALES) */}
      <section className="bg-[#FAF6EE] py-12 px-4 sm:px-6 lg:px-8 border-t border-b border-[#E8DFC8]">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-[#DFD3BD] text-center">
            {/* PILAR 1 */}
            <div className="px-4 py-3 flex flex-col items-center">
              <div className="h-10 w-10 text-[#4A5A3F] flex items-center justify-center mb-2">
                <Leaf className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#2C1810]">
                Ingredientes seleccionados
              </h4>
              <p className="text-[11px] text-stone-600 mt-1 max-w-[200px]">
                100% sémola candeal pura y huevos de granja frescos.
              </p>
            </div>

            {/* PILAR 2 */}
            <div className="px-4 py-3 flex flex-col items-center">
              <div className="h-10 w-10 text-[#4A5A3F] flex items-center justify-center mb-2">
                <Home className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#2C1810]">
                Elaboración artesanal
              </h4>
              <p className="text-[11px] text-stone-600 mt-1 max-w-[200px]">
                Amasado diario en lotes cuidados por encargo.
              </p>
            </div>

            {/* PILAR 3 */}
            <div className="px-4 py-3 flex flex-col items-center">
              <div className="h-10 w-10 text-[#7A3E2D] flex items-center justify-center mb-2">
                <Heart className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#2C1810]">
                Sabor casero en cada bocado
              </h4>
              <p className="text-[11px] text-stone-600 mt-1 max-w-[200px]">
                Tradición familiar italiana en cada receta de fábrica.
              </p>
            </div>

            {/* PILAR 4 */}
            <div className="px-4 py-3 flex flex-col items-center">
              <div className="h-10 w-10 text-[#4A5A3F] flex items-center justify-center mb-2">
                <Truck className="h-6 w-6 stroke-[1.5]" />
              </div>
              <h4 className="font-serif text-sm sm:text-base font-bold text-[#2C1810]">
                Envíos y retiro en fábrica
              </h4>
              <p className="text-[11px] text-stone-600 mt-1 max-w-[200px]">
                Cadena de frío asegurada y entregas programadas.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. SECCIÓN "NOSOTROS / HISTORIA DE LA FÁBRICA" */}
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
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
