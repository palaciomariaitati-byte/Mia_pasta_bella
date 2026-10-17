"use client";

import React, { useState, useMemo, useEffect } from "react";
import Image from "next/image";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Users,
  Check,
  Sparkles,
  Utensils,
  Award,
  Layers,
  Snowflake,
  RotateCcw,
  QrCode,
  Search,
  X,
  ShoppingBag,
  ArrowRight,
  ChefHat,
  HeartHandshake,
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

// Convertir número a numeración romana para los capítulos del libro
const toRoman = (num: number) => {
  const romans = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];
  return romans[num - 1] || `${num}`;
};

export function BookCatalog({
  categorias,
  productos,
  config,
  onOpenSplash,
  onOpenQR,
}: BookCatalogProps) {
  // 0 = Portada / Manifiesto, 1..N = Capítulos de categorías
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [flipDirection, setFlipDirection] = useState<"next" | "prev">("next");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [addedId, setAddedId] = useState<string | null>(null);

  // NUEVO FEATURE PRO: Calculadora de Comensales ("Modo Anfitrión")
  const [comensalesTarget, setComensalesTarget] = useState<number | null>(null);

  const { items, addItem, totalCount, totalPorciones, totalPrice, setIsCartOpen } = useCart();

  const totalPages = categorias.length + 1;
  const currentCategory = activePageIndex > 0 ? categorias[activePageIndex - 1] : null;

  // Filtrado de búsqueda instantánea
  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return productos.filter(
      (p) =>
        p.nombre.toLowerCase().includes(q) ||
        (p.ingredientes && p.ingredientes.toLowerCase().includes(q)) ||
        (p.categoria_nombre && p.categoria_nombre.toLowerCase().includes(q))
    );
  }, [searchQuery, productos]);

  // Filtrar productos del capítulo activo
  const categoryProducts = currentCategory
    ? productos.filter((p) => p.categoria_id === currentCategory.id)
    : [];

  // Navegación por teclado (Flechas izquierda/derecha)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignorar si el usuario está tipeando en un input o textarea
      if (
        document.activeElement?.tagName === "INPUT" ||
        document.activeElement?.tagName === "TEXTAREA"
      ) {
        return;
      }

      if (e.key === "ArrowRight") {
        if (activePageIndex < totalPages - 1) {
          setFlipDirection("next");
          setActivePageIndex((prev) => prev + 1);
          window.scrollTo({ top: 120, behavior: "smooth" });
        }
      } else if (e.key === "ArrowLeft") {
        if (activePageIndex > 0) {
          setFlipDirection("prev");
          setActivePageIndex((prev) => prev - 1);
          window.scrollTo({ top: 120, behavior: "smooth" });
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activePageIndex, totalPages]);

  const goToNextPage = () => {
    if (activePageIndex < totalPages - 1) {
      setFlipDirection("next");
      setActivePageIndex((prev) => prev + 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const goToPrevPage = () => {
    if (activePageIndex > 0) {
      setFlipDirection("prev");
      setActivePageIndex((prev) => prev - 1);
      window.scrollTo({ top: 120, behavior: "smooth" });
    }
  };

  const handleSelectPage = (index: number) => {
    setFlipDirection(index >= activePageIndex ? "next" : "prev");
    setActivePageIndex(index);
    window.scrollTo({ top: 120, behavior: "smooth" });
  };

  const handleAddToCart = (producto: ProductoItem, cantidad: number = 1) => {
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
      cantidad
    );

    setAddedId(producto.id);
    setTimeout(() => setAddedId(null), 1600);
  };

  // Determinar si una variedad es salsa (para no sugerir porciones de plato principal)
  const isSauce = (p: ProductoItem) => {
    const text = `${p.nombre} ${p.categoria_nombre}`.toLowerCase();
    return (
      text.includes("salsa") ||
      text.includes("filetto") ||
      text.includes("pesto") ||
      text.includes("bolognesa") ||
      text.includes("crema") ||
      text.includes("rosa") ||
      text.includes("pomodoro")
    );
  };

  return (
    <div className="py-6 sm:py-10 pb-28 sm:pb-36 overflow-visible">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-visible">
        {/* ============================================================== */}
        {/* 1. HEADER EDITORIAL COMPACTO DE ALTA TRATTORIA */}
        {/* ============================================================== */}
        <div className="relative mb-8 rounded-3xl border border-[#E6D8C3] bg-gradient-to-r from-[#FAF6EE] via-[#FFFDF9] to-[#F5EFE0] p-5 sm:p-7 shadow-sm overflow-hidden">
          {/* Textura y halo cálido */}
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-60 h-60 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/3 w-48 h-48 bg-oliva-500/8 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            {/* IDENTIDAD: LOGO + TÍTULOS */}
            <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
              {/* Contenedor del Logo con dimensiones fijas estrictas */}
              <div className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-full border-2 border-amber-400 bg-white p-1 shadow-[0_0_20px_rgba(212,175,55,0.3)] flex-shrink-0 overflow-hidden">
                <div className="relative h-full w-full rounded-full overflow-hidden">
                  <Image
                    src="/images/logo.jpg"
                    alt="Mia Pasta Bella"
                    fill
                    className="object-cover rounded-full"
                    sizes="(max-width: 640px) 64px, 80px"
                    priority
                  />
                </div>
              </div>

              <div>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                  <span className="font-serif text-2xl sm:text-3xl font-black text-[#2C1810] tracking-tight">
                    {config.nombre_tienda || "Mia Pasta Bella"}
                  </span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-oliva-100 text-oliva-900 border border-oliva-300/80 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider">
                    <Award className="h-3 w-3 text-oliva-700" />
                    Fábrica de Autor
                  </span>
                </div>
                <p className="font-serif italic text-xs sm:text-sm text-terracota-800/90 mt-1 max-w-md">
                  &ldquo;{config.slogan_principal || "Pastas artesanales con masa madre viva y sémola candeal."}&rdquo;
                </p>
              </div>
            </div>

            {/* BADGE TANDA ACTIVA + ACCIONES COMPACTAS */}
            <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row items-center gap-3">
              {/* Card Tanda de Elaboración */}
              <div className="rounded-2xl border border-amber-500/30 bg-[#2C1810] text-white px-4 py-3 shadow-md flex items-center gap-3 min-w-[260px]">
                <div className="relative flex h-3 w-3 flex-shrink-0">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500" />
                </div>
                <div className="text-left text-xs">
                  <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-wider block">
                    🌾 Tanda Fresca Activa
                  </span>
                  <strong className="text-white text-xs font-bold block">
                    {config.proxima_tanda_fecha || "Viernes 17 de Octubre"}
                  </strong>
                  <span className="text-[10px] text-stone-300">
                    72h heladera · 90d freezer
                  </span>
                </div>
              </div>

              {/* Botones de utilidad: Portada Splash y Menú QR */}
              <div className="flex items-center gap-2">
                {onOpenSplash && (
                  <button
                    onClick={onOpenSplash}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-stone-700 bg-white hover:bg-stone-50 border border-stone-200 transition-all shadow-xs active:scale-95"
                    title="Ver Portada de Bienvenida"
                  >
                    <RotateCcw className="h-3.5 w-3.5 text-terracota-600" />
                    <span className="hidden sm:inline">Portada</span>
                  </button>
                )}
                {onOpenQR && (
                  <button
                    onClick={onOpenQR}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-amber-950 bg-amber-100 hover:bg-amber-200 border border-amber-300 transition-all shadow-xs active:scale-95"
                    title="Ver y Descargar Código QR"
                  >
                    <QrCode className="h-3.5 w-3.5 text-amber-800" />
                    <span className="hidden sm:inline">Menú QR</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* 2. BARRA DE HERRAMIENTAS: BÚSQUEDA + MODO ANFITRIÓN (COMENSALES) */}
        {/* ============================================================== */}
        {/* 2. BARRA DE HERRAMIENTAS: BÚSQUEDA Y CALCULADOR DE PORCIONES */}
        {/* ============================================================== */}
        <div className="mb-6 space-y-3.5">
          {/* Fila 1: Buscador Instantáneo Centrado */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-3.5 h-4 w-4 text-terracota-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por variedad o ingrediente (ej: salmón, lomo, ricota, espinaca...)"
              className="w-full pl-11 pr-10 py-3.5 rounded-2xl border border-[#DFD3BD] bg-white text-xs sm:text-sm text-[#2C1810] placeholder:text-stone-400 focus:outline-none focus:border-terracota-600 focus:ring-2 focus:ring-terracota-200 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3.5 text-stone-400 hover:text-stone-700 p-1"
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Fila 2: Calculador de Porciones de Fábrica (Fila independiente centrada, Cero Choques) */}
          <div className="max-w-3xl mx-auto bg-white rounded-2xl border border-[#DFD3BD] p-3 sm:px-5 sm:py-3 shadow-xs">
            <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5">
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className="text-base">🧮</span>
                <span className="text-xs sm:text-sm font-bold text-[#2C1810] whitespace-nowrap">
                  Calculador de Porciones:
                </span>
              </div>

              {/* Botones Píldora de Selección con espacio holgado */}
              <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap justify-center">
                {[
                  { label: "Ver Todo", value: null },
                  { label: "2 porciones", value: 2 },
                  { label: "4 porciones", value: 4 },
                  { label: "6 porciones", value: 6 },
                  { label: "8+ porciones", value: 8 },
                ].map((pill) => {
                  const isSelected = comensalesTarget === pill.value;
                  return (
                    <button
                      key={pill.label}
                      onClick={() => setComensalesTarget(pill.value)}
                      className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs active:scale-95 whitespace-nowrap ${
                        isSelected
                          ? "bg-gradient-to-r from-terracota-600 to-terracota-700 text-white shadow-md shadow-terracota-900/20 ring-2 ring-amber-300 ring-offset-1 ring-offset-crema-50"
                          : "bg-crema-100 text-stone-700 hover:bg-crema-200 border border-crema-300/70"
                      }`}
                    >
                      {pill.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Banner Dorado suave si el Calculador de Fábrica está activo */}
          {comensalesTarget && (
            <div className="max-w-3xl mx-auto rounded-2xl border border-amber-300/80 bg-gradient-to-r from-amber-50 via-dorado-100/60 to-amber-50 p-3.5 text-xs text-amber-950 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-xs animate-fade-in">
              <div className="flex items-center gap-2.5 text-center sm:text-left">
                <Sparkles className="h-4 w-4 text-amber-700 fill-current flex-shrink-0" />
                <span>
                  <strong>Cálculo de Fábrica activo ({comensalesTarget} porciones):</strong> Te sugerimos cuántas cajas encargar para rendir tus porciones exactas sin desperdicio.
                </span>
              </div>
              <button
                onClick={() => setComensalesTarget(null)}
                className="text-[11px] font-black text-amber-900 hover:text-terracota-700 underline uppercase tracking-wider flex-shrink-0"
              >
                Ver todo el catálogo
              </button>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* 3. BARRA DE CAPÍTULOS DEL LIBRO ("PÍLDORAS GOURMET DE ALTA COCINA") */}
        {/* ============================================================== */}
        {!searchQuery && (
          <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3.5 my-4 px-2">
            {/* Portada & Tradición */}
            <button
              onClick={() => handleSelectPage(0)}
              className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 ${
                activePageIndex === 0
                  ? "bg-[#2C1810] text-amber-200 border-2 border-amber-400 shadow-md ring-2 ring-amber-300/40"
                  : "bg-white text-stone-700 hover:text-terracota-900 border border-[#DFD3BD] hover:border-terracota-400 hover:shadow-md hover:scale-105"
              }`}
            >
              <BookOpen className="h-4 w-4 flex-shrink-0 text-amber-400" />
              <span>Portada & Tradición</span>
            </button>

            {/* Capítulos de Categorías */}
            {categorias.map((cat, idx) => {
              const pageNum = idx + 1;
              const isActive = activePageIndex === pageNum;

              return (
                <button
                  key={cat.id}
                  onClick={() => handleSelectPage(pageNum)}
                  className={`px-5 py-3 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-sm flex items-center gap-2 active:scale-95 ${
                    isActive
                      ? "bg-gradient-to-r from-terracota-700 via-terracota-800 to-[#5A2B1D] text-white border-2 border-amber-300 shadow-md ring-2 ring-amber-300/40"
                      : "bg-white text-stone-700 hover:text-terracota-900 border border-[#DFD3BD] hover:border-terracota-400 hover:shadow-md hover:scale-105"
                  }`}
                >
                  <span className={`text-[10px] font-black uppercase tracking-wider ${isActive ? "text-amber-300/90" : "text-terracota-700"}`}>
                    Cap. {toRoman(pageNum)}
                  </span>
                  <span>{cat.nombre}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* ============================================================== */}
        {/* 4. ENCUADERNACIÓN EDITORIAL CON PERSPECTIVA 3D */}
        {/* ============================================================== */}
        <div className="perspective-book">
          <div
            className={`book-cover-shell book-spine-shadow p-5 sm:p-8 lg:p-11 min-h-[580px] transition-all duration-300 overflow-visible ${
              flipDirection === "next" ? "animate-page-next" : "animate-page-prev"
            }`}
          >
            {/* ------------------------------------------------------------ */}
            {/* A. VISTA DE BÚSQUEDA INSTANTÁNEA */}
            {/* ------------------------------------------------------------ */}
            {searchQuery ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-4 border-b border-[#DFD3BD]">
                  <div>
                    <h3 className="font-serif text-2xl font-black text-[#2C1810]">
                      Resultados del Amasado
                    </h3>
                    <p className="text-xs text-stone-600 mt-1">
                      Se encontraron {searchResults.length} variedades artesanales para &ldquo;{searchQuery}&rdquo;
                    </p>
                  </div>
                  <button
                    onClick={() => setSearchQuery("")}
                    className="text-xs font-bold text-terracota-700 hover:underline"
                  >
                    Volver a hojear el libro →
                  </button>
                </div>

                {searchResults.length === 0 ? (
                  <div className="text-center py-16 bg-white/70 rounded-3xl p-8 border border-dashed border-[#DFD3BD]">
                    <Utensils className="h-12 w-12 text-stone-300 mx-auto mb-3" />
                    <p className="font-serif text-lg text-stone-700 font-bold">
                      No encontramos ninguna variedad con &ldquo;{searchQuery}&rdquo;.
                    </p>
                    <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                      Prueba con palabras clave como &ldquo;ravioles&rdquo;, &ldquo;sorrentinos&rdquo;, &ldquo;ricota&rdquo;, &ldquo;lomo&rdquo; o &ldquo;espinaca&rdquo;.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {searchResults.map((producto) => (
                      <ProductCard
                        key={producto.id}
                        producto={producto}
                        addedId={addedId}
                        comensalesTarget={comensalesTarget}
                        isSauce={isSauce(producto)}
                        onAddToCart={handleAddToCart}
                      />
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* -------------------------------------------------------- */}
                {/* B. VISTA 0: PORTADA DEL GRAN LIBRO (HISTORIA Y MANIFIESTO) */}
                {/* -------------------------------------------------------- */}
                {activePageIndex === 0 && (
                  <div className="space-y-10 py-2 max-w-5xl mx-auto">
                    {/* PLIEGO CENTRAL DE BIENVENIDA */}
                    <div className="relative rounded-3xl bg-gradient-to-br from-[#2C1810] via-[#3E2116] to-[#1F100B] text-white p-7 sm:p-12 shadow-2xl overflow-hidden border border-amber-500/30">
                      {/* Halos dorados */}
                      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-400/15 blur-3xl pointer-events-none" />
                      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-oliva-500/15 blur-3xl pointer-events-none" />

                      <div className="relative z-10 space-y-5 text-center sm:text-left">
                        <div className="inline-flex items-center gap-2 rounded-full bg-amber-400/20 text-amber-200 border border-amber-400/40 px-3.5 py-1 text-xs font-black uppercase tracking-wider">
                          <Sparkles className="h-3.5 w-3.5 text-amber-400 fill-current" />
                          <span>Edición Artesanal · Fábrica a la Vista</span>
                        </div>

                        <h2 className="font-serif text-3xl sm:text-5xl font-black text-amber-50 leading-tight">
                          {config.nombre_tienda || "Mia Pasta Bella"}
                        </h2>

                        <p className="text-base sm:text-xl text-amber-100/90 font-serif italic max-w-2xl leading-relaxed">
                          &ldquo;{config.slogan_principal || "Pastas artesanales de autor con tradición y pasión."}&rdquo;
                        </p>

                        <p className="text-xs sm:text-sm text-stone-300 max-w-2xl leading-relaxed pt-1">
                          Cada variedad se elabora artesanalmente en pequeños lotes con sémola pura de trigo candeal seleccionada, huevos de campo y masa madre de fermentación lenta. Sin conservantes, químicos ni procesos industriales.
                        </p>

                        {/* 3 Pilares de Fábrica */}
                        <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-amber-500/20">
                          <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                            <Snowflake className="h-6 w-6 text-blue-300 flex-shrink-0" />
                            <div className="text-left">
                              <strong className="text-xs font-bold block text-white">Apto Freezer</strong>
                              <span className="text-[11px] text-amber-200/80">90 días de conservación</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                            <Clock className="h-6 w-6 text-amber-400 flex-shrink-0" />
                            <div className="text-left">
                              <strong className="text-xs font-bold block text-white">Frescura al Día</strong>
                              <span className="text-[11px] text-amber-200/80">72 hs en heladera</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 backdrop-blur-xs">
                            <Layers className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                            <div className="text-left">
                              <strong className="text-xs font-bold block text-white">Porciones Reales</strong>
                              <span className="text-[11px] text-amber-200/80">Platos generosos de autor</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* ÍNDICE VISUAL DE CAPÍTULOS */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b border-[#DFD3BD] pb-2">
                        <h3 className="font-serif text-xl sm:text-2xl font-black text-[#2C1810] flex items-center gap-2">
                          <BookOpen className="h-5 w-5 text-terracota-700" />
                          Índice de Capítulos Artesanales ({categorias.length} Variedades)
                        </h3>
                        <span className="text-xs text-oliva-900 font-bold hidden sm:inline">
                          Usa las flechas del teclado o toca para abrir
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {categorias.map((cat, idx) => {
                          const pageNum = idx + 1;
                          const count = productos.filter((p) => p.categoria_id === cat.id).length;

                          return (
                            <div
                              key={cat.id}
                              role="button"
                              tabIndex={0}
                              onClick={() => handleSelectPage(pageNum)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" || e.key === " ") {
                                  handleSelectPage(pageNum);
                                }
                              }}
                              className="group cursor-pointer rounded-3xl bg-white border border-[#DFD3BD] p-6 hover:border-terracota-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between gap-4"
                            >
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <span className="text-[10px] font-black uppercase tracking-wider text-terracota-800 bg-terracota-50 px-2.5 py-1 rounded-full border border-terracota-200">
                                    Capítulo {toRoman(pageNum)}
                                  </span>
                                  <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-crema-100 group-hover:bg-terracota-600 group-hover:text-white transition-colors">
                                    <ChevronRight className="h-4 w-4 text-terracota-700 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                                  </span>
                                </div>

                                <h4 className="font-serif text-lg font-bold text-[#2C1810] group-hover:text-terracota-700 transition-colors pt-1">
                                  {cat.nombre}
                                </h4>
                                <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                                  {cat.descripcion}
                                </p>
                              </div>

                              <div className="pt-3 border-t border-crema-200 flex items-center justify-between text-xs font-bold text-stone-500 group-hover:text-terracota-950">
                                <span>{count} variedades listas</span>
                                <span className="text-terracota-700 font-extrabold group-hover:underline">
                                  Abrir capítulo →
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* BOTÓN PRINCIPAL DE APERTURA */}
                    <div className="text-center pt-4">
                      <button
                        onClick={goToNextPage}
                        className="btn-boutique py-4 px-10 text-sm sm:text-base gap-3 text-white shadow-xl group"
                      >
                        <span>Abrir Primer Capítulo: {categorias[0]?.nombre || "Variedades"}</span>
                        <ChevronRight className="h-5 w-5 group-hover:translate-x-1.5 transition-transform" />
                      </button>
                    </div>
                  </div>
                )}

                {/* -------------------------------------------------------- */}
                {/* C. VISTAS 1..N: HOJAS DE CATEGORÍA CON PRODUCTOS */}
                {/* -------------------------------------------------------- */}
                {activePageIndex > 0 && currentCategory && (
                  <div className="space-y-8">
                    {/* ENCABEZADO DE CAPÍTULO CON BOTONES DE PASO DE PÁGINA */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-[#DFD3BD] gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black uppercase tracking-wider text-terracota-800 bg-terracota-100/90 border border-terracota-300 px-3 py-1 rounded-full shadow-xs">
                            Capítulo {toRoman(activePageIndex)} · {currentCategory.nombre}
                          </span>
                        </div>

                        <h2 className="font-serif text-3xl sm:text-4xl font-black text-[#2C1810] mt-2.5 leading-tight">
                          {currentCategory.nombre}
                        </h2>
                        <p className="text-xs sm:text-sm text-stone-600 mt-1 max-w-2xl leading-relaxed">
                          {currentCategory.descripcion}
                        </p>
                      </div>

                      {/* Botones de Navegación de Página Refinados */}
                      <div className="flex items-center gap-2.5 self-end sm:self-center">
                        <button
                          onClick={goToPrevPage}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-[#2C1810] hover:bg-stone-50 transition-all shadow-xs active:scale-95"
                        >
                          <ChevronLeft className="h-4 w-4 text-terracota-700 flex-shrink-0" />
                          <span>Anterior</span>
                        </button>

                        <button
                          onClick={goToNextPage}
                          disabled={activePageIndex >= totalPages - 1}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full bg-oliva-700 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-oliva-800 transition-all shadow-xs disabled:opacity-30 disabled:cursor-not-allowed active:scale-95"
                        >
                          <span>Siguiente</span>
                          <ChevronRight className="h-4 w-4 flex-shrink-0" />
                        </button>
                      </div>
                    </div>

                    {/* GRILLA DE PRODUCTOS */}
                    {categoryProducts.length === 0 ? (
                      <div className="text-center py-16 bg-white/70 rounded-3xl p-8 border border-dashed border-[#DFD3BD]">
                        <p className="font-serif text-lg text-stone-700 font-bold">
                          No hay variedades cargadas en este capítulo actualmente.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categoryProducts.map((producto) => (
                          <ProductCard
                            key={producto.id}
                            producto={producto}
                            addedId={addedId}
                            comensalesTarget={comensalesTarget}
                            isSauce={isSauce(producto)}
                            onAddToCart={handleAddToCart}
                          />
                        ))}
                      </div>
                    )}

                    {/* PIE DE HOJA: NAVEGACIÓN Y CONTADOR EDITORIAL */}
                    <div className="mt-12 pt-6 border-t border-[#DFD3BD] flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-stone-700 font-semibold gap-4">
                      <span className="text-stone-600">
                        Capítulo {toRoman(activePageIndex)} de {toRoman(totalPages - 1)} ·{" "}
                        <strong className="text-[#2C1810]">{currentCategory.nombre}</strong>
                      </span>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={goToPrevPage}
                          className="inline-flex items-center justify-center gap-1.5 rounded-full border border-stone-300 bg-white px-5 py-2.5 text-xs font-bold text-[#2C1810] hover:bg-stone-50 transition-all shadow-xs"
                        >
                          <ChevronLeft className="h-4 w-4 text-terracota-700" />
                          <span>Página Anterior</span>
                        </button>
                        {activePageIndex < totalPages - 1 && (
                          <button
                            onClick={goToNextPage}
                            className="inline-flex items-center justify-center gap-1.5 rounded-full bg-oliva-700 px-5 py-2.5 text-xs font-bold text-white hover:bg-oliva-800 transition-all shadow-xs"
                          >
                            <span>Siguiente Capítulo</span>
                            <ChevronRight className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. STICKY GOURMET BAR: BARRA FLOTANTE INFERIOR DE CANASTA */}
      {/* ============================================================== */}
      {items.length > 0 && (
        <div className="fixed bottom-4 inset-x-4 max-w-xl mx-auto z-40 animate-bounce-subtle">
          <div className="rounded-2xl bg-[#1F120B]/95 backdrop-blur-md border border-amber-500/40 p-3.5 sm:p-4 text-white shadow-2xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-400/40 flex items-center justify-center flex-shrink-0">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-extrabold text-white truncate">
                    {items.length} {items.length === 1 ? "variedad" : "variedades"}
                  </span>
                  <span className="text-[10px] bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full font-bold">
                    {totalPorciones} porciones
                  </span>
                </div>
                <div className="font-serif text-base sm:text-lg font-black text-amber-200">
                  ${totalPrice.toLocaleString("es-AR")}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 transition-all shadow-lg active:scale-95 flex-shrink-0"
              style={{
                background: "linear-gradient(135deg, #F9E298 0%, #D4AF37 50%, #B8860B 100%)",
              }}
            >
              <span>Ver Canasta</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ===========================================================================
// SUB-COMPONENTE: TARJETA DE PRODUCTO "GOURMET HERO" (FULL-BLEED Y BLINDADA)
// ===========================================================================

interface ProductCardProps {
  producto: ProductoItem;
  addedId: string | null;
  comensalesTarget: number | null;
  isSauce: boolean;
  onAddToCart: (producto: ProductoItem, cantidad: number) => void;
}

function ProductCard({
  producto,
  addedId,
  comensalesTarget,
  isSauce,
  onAddToCart,
}: ProductCardProps) {
  const wasJustAdded = addedId === producto.id;
  const isOutOfStock = producto.stock !== undefined && producto.stock <= 0;
  const isLowStock = producto.stock !== undefined && producto.stock > 0 && producto.stock <= 5;

  const rindePorciones = producto.rinde_porciones || 2;

  // Cálculo sugerido para el pedido de fábrica
  const unidadesSugeridas = useMemo(() => {
    if (!comensalesTarget || isSauce) return 1;
    return Math.max(1, Math.ceil(comensalesTarget / rindePorciones));
  }, [comensalesTarget, rindePorciones, isSauce]);

  const totalPorcionesSugeridas = unidadesSugeridas * rindePorciones;

  return (
    <div className="rounded-3xl bg-white border border-[#E6D8C3] shadow-sm hover:shadow-2xl transition-all duration-500 flex flex-col justify-between overflow-hidden group">
      {/* 1. IMAGEN FULL-BLEED SUPERIOR (DE BORDE A BORDE) */}
      <div className="relative h-56 sm:h-60 w-full overflow-hidden bg-stone-900 flex-shrink-0">
        {producto.imagen_url ? (
          <Image
            src={producto.imagen_url}
            alt={producto.nombre}
            fill
            className="object-cover group-hover:scale-110 transition-transform duration-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        ) : (
          <div className="h-full w-full bg-gradient-to-br from-stone-800 to-amber-950 flex flex-col items-center justify-center p-4 text-center">
            <Utensils className="h-10 w-10 text-amber-200/50 mb-2" />
            <span className="text-xs font-bold text-amber-100">
              {producto.categoria_nombre}
            </span>
          </div>
        )}

        {/* Degradado cinematográfico para legibilidad de badges */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/35 pointer-events-none" />

        {/* BADGES SUPERIORES (GLASSMORPHISM) */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between gap-2 pointer-events-none">
          {/* Categoría / Estado Stock */}
          {isOutOfStock ? (
            <span className="rounded-full bg-red-600/90 text-white backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm">
              Agotado
            </span>
          ) : isLowStock ? (
            <span className="rounded-full bg-amber-500/90 text-amber-950 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm animate-pulse">
              ¡Últimas {producto.stock}!
            </span>
          ) : (
            <span className="rounded-full bg-oliva-800/85 text-white backdrop-blur-md px-3 py-1 text-[10px] font-bold uppercase tracking-wider border border-white/15 shadow-sm">
              {producto.categoria_nombre}
            </span>
          )}

          {/* Unidad de Medida en Glassmorphism */}
          <span className="rounded-full bg-black/50 text-amber-100 backdrop-blur-md px-3 py-1 text-[10px] font-black uppercase tracking-wider border border-white/20 shadow-sm">
            {producto.unidad_medida}
          </span>
        </div>

        {/* BADGES INFERIORES SOBRE LA FOTO: COCCIÓN Y PORCIONES DE FÁBRICA */}
        <div className="absolute bottom-3 inset-x-3 flex items-center justify-between text-white text-[11px] font-bold pointer-events-none">
          <div className="flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md px-2.5 py-1 border border-white/15">
            <Clock className="h-3.5 w-3.5 text-amber-300" />
            <span>{producto.tiempo_coccion_minutos} min</span>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-black/45 backdrop-blur-md px-2.5 py-1 border border-white/15">
            <Users className="h-3.5 w-3.5 text-amber-300" />
            <span>Rinde {rindePorciones} {rindePorciones === 1 ? "porción" : "porciones"}</span>
          </div>
        </div>
      </div>

      {/* 2. CUERPO DE LA TARJETA (TÍTULO, INGREDIENTES Y RECOMENDACIÓN DE FÁBRICA) */}
      <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2.5">
          <h3 className="font-serif text-xl font-bold text-[#2C1810] group-hover:text-terracota-700 transition-colors leading-snug">
            {producto.nombre}
          </h3>

          {/* Bloque de ingredientes tipo nota de cata */}
          <div className="border-l-2 border-terracota-500 pl-3 italic text-stone-600 text-xs sm:text-sm line-clamp-3 leading-relaxed">
            {producto.ingredientes}
          </div>

          {/* Chip de Porciones si está activo el calculador */}
          {comensalesTarget && !isSauce && (
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-300/70 p-2.5 text-xs text-amber-950 flex items-center gap-2">
              <span className="text-base flex-shrink-0">🧮</span>
              <span>
                Para tus <strong>{comensalesTarget} porciones</strong>: encargá <strong>{unidadesSugeridas} {producto.unidad_medida.toLowerCase().includes("caja") ? "cajas" : "unidades"}</strong> (rinde {totalPorcionesSugeridas} porciones).
              </span>
            </div>
          )}
        </div>

        {/* 3. PIE DE COMPRA BLINDADO (CERO RECORTES) */}
        <div className="pt-4 border-t border-[#F0E6D2] space-y-3">
          {/* Fila Superior: Precio y Conservación Corta de Fábrica */}
          <div className="flex items-baseline justify-between gap-2">
            <div>
              <span className="text-[10px] uppercase font-black text-stone-400 block tracking-wider">
                Precio Fábrica
              </span>
              <span className="font-serif text-2xl font-black text-[#2C1810]">
                ${producto.precio.toLocaleString("es-AR")}
              </span>
            </div>

            <div className="text-right text-[11px] font-semibold text-stone-600">
              <span className="block text-terracota-800 font-bold">🌿 Fresco: 72 hs en heladera</span>
              <span className="text-[10px] text-stone-500">❄️ Freezer: 90 días</span>
            </div>
          </div>

          {/* Botón de Compra de Ancho Completo */}
          <button
            onClick={() => onAddToCart(producto, unidadesSugeridas)}
            disabled={isOutOfStock}
            className={`w-full py-3.5 px-5 rounded-2xl font-bold text-xs sm:text-sm transition-all shadow-md active:scale-[0.98] flex items-center justify-center gap-2 ${
              isOutOfStock
                ? "bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300"
                : wasJustAdded
                ? "bg-oliva-700 text-white shadow-oliva-900/20"
                : "bg-gradient-to-r from-terracota-600 via-terracota-700 to-terracota-800 hover:from-terracota-700 hover:to-terracota-900 text-white shadow-terracota-900/25 border border-white/20"
            }`}
          >
            {isOutOfStock ? (
              <span>Variedad Agotada para esta Tanda</span>
            ) : wasJustAdded ? (
              <>
                <Check className="h-4 w-4" />
                <span>¡Agregado a la Canasta!</span>
              </>
            ) : comensalesTarget && !isSauce && unidadesSugeridas > 1 ? (
              <>
                <Plus className="h-4 w-4" />
                <span>Sumar {unidadesSugeridas} u. ({comensalesTarget} pers.)</span>
              </>
            ) : (
              <>
                <Plus className="h-4 w-4" />
                <span>Agregar a mi Canasta</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
