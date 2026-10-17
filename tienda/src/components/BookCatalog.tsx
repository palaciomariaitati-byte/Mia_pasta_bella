"use client";

import React, { useState, useMemo } from "react";
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

export function BookCatalog({
  categorias,
  productos,
  config,
  onOpenSplash,
  onOpenQR,
}: BookCatalogProps) {
  // 0 = Portada, 1..N = Hojas de categorías
  const [activePageIndex, setActivePageIndex] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const { addItem } = useCart();
  const [addedId, setAddedId] = useState<string | null>(null);

  const totalPages = categorias.length + 1;
  const currentCategory =
    activePageIndex > 0 ? categorias[activePageIndex - 1] : null;

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

  // Filtrar productos del segmento activo
  const categoryProducts = currentCategory
    ? productos.filter((p) => p.categoria_id === currentCategory.id)
    : [];

  const handleAddToCart = (producto: ProductoItem) => {
    addItem({
      id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      imagen_url: producto.imagen_url,
      categoria: producto.categoria_nombre,
      unidad_medida: producto.unidad_medida,
      rinde_porciones: producto.rinde_porciones || 2,
    });

    setAddedId(producto.id);
    setTimeout(() => setAddedId(null), 1400);
  };

  const goToNextPage = () => {
    if (activePageIndex < totalPages - 1) {
      setActivePageIndex((prev) => prev + 1);
      window.scrollTo({ top: 80, behavior: "smooth" });
    }
  };

  const goToPrevPage = () => {
    if (activePageIndex > 0) {
      setActivePageIndex((prev) => prev - 1);
      window.scrollTo({ top: 80, behavior: "smooth" });
    }
  };

  return (
    <div className="py-6 sm:py-10 pb-16 sm:pb-20 overflow-visible">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 overflow-visible">
        {/* BANNER DE FONDO SUTIL Y ELEGANTE EN TONO VERDE OLIVA LAVADO (ANCLAJE VISUAL) */}
        <div className="relative mx-auto max-w-4xl mb-8 sm:mb-10 rounded-3xl overflow-visible border border-oliva-700/15 bg-gradient-to-b from-[#556B47]/8 via-[#556B47]/5 to-transparent backdrop-blur-[2px] p-6 sm:p-10 text-center shadow-xs">
          {/* Textura sutil y halos orgánicos */}
          <div className="absolute inset-0 bg-[radial-gradient(#6B805B_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none rounded-3xl" />
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-80 h-32 bg-oliva-400/10 blur-2xl rounded-full pointer-events-none" />

          {/* CONTENIDO CENTRADO DE MANERA ABSOLUTA */}
          <div className="relative z-10 flex flex-col items-center justify-center space-y-4">
            {/* LOGOTIPO PRINCIPAL CON LA ILUSTRACIÓN DE LAS DOS NIÑAS: ESCALA IMPONENTE */}
            <div className="relative h-36 w-36 sm:h-44 sm:w-44 md:h-52 md:w-52 rounded-full border-4 border-amber-400/80 bg-crema-50 p-1.5 shadow-[0_0_35px_rgba(212,175,55,0.35)] transition-transform duration-500 hover:scale-105">
              <div className="relative h-full w-full rounded-full overflow-hidden">
                <Image
                  src="/images/logo.jpg"
                  alt="Mia Pasta Bella"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 150px, (max-width: 768px) 180px, 210px"
                  priority
                />
              </div>
            </div>

            {/* MARCA EXACTA: "Mia Pasta Bella" */}
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-terracota-950 tracking-tight leading-tight">
              {config.nombre_tienda || "Mia Pasta Bella"}
            </h1>

            {/* DISTINTIVO DE FÁBRICA */}
            <div className="inline-flex items-center gap-2 rounded-full border border-oliva-600/25 bg-oliva-800/10 px-4 py-1 text-xs font-bold uppercase tracking-wider text-oliva-950 shadow-xs">
              <Sparkles className="h-3.5 w-3.5 text-oliva-700 fill-current" />
              <span>Pastas Frescas de Autor, Congelados & Pre-Pizzas</span>
            </div>

            <p className="text-xs sm:text-sm text-terracota-800/85 max-w-xl mx-auto leading-relaxed pt-1">
              Elaboración artesanal bajo encargo con sémola pura de trigo candeal, huevos de campo y masa madre viva.
            </p>

            {/* AVISO DE TANDAS Y CORTO VENCIMIENTO DE FÁBRICA */}
            <div className="mx-auto max-w-2xl bg-gradient-to-r from-amber-950 via-stone-900 to-amber-950 text-white rounded-2xl p-4 sm:p-5 shadow-xl border border-amber-500/30 text-left sm:text-center space-y-2">
              <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
                <span className="bg-amber-500/20 text-amber-300 font-extrabold uppercase px-3 py-1 rounded-full border border-amber-400/30 text-[10px] tracking-wider">
                  🌾 Producción por Tandas Semanales
                </span>
                <span className="text-amber-200 text-xs font-semibold">
                  Próxima tanda fresca: <strong className="text-white underline">{config.proxima_tanda_fecha || "Viernes 17 de Octubre"}</strong>
                </span>
              </div>
              <p className="text-xs text-amber-100/90 leading-relaxed">
                Elaboramos únicamente bajo pedido para que recibas pastas frescas de <strong>corto tiempo de caducidad</strong> (sin aditivos ni conservantes). {config.cierre_pedidos_info || "Tomamos pedidos con anticipación al amasado."}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-amber-300/80 pt-1 border-t border-amber-800/40">
                <span>⏱️ Heladera: 72 hs</span>
                <span>•</span>
                <span>❄️ Freezer: 90 días</span>
                <span>•</span>
                <span>🛵 Entrega Programada o Retiro</span>
              </div>
            </div>

            {/* BOTONES INTERACTIVOS DEL ENCABEZADO */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              {onOpenSplash && (
                <button
                  onClick={onOpenSplash}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-oliva-900 hover:text-terracota-900 bg-white/80 hover:bg-white px-4 py-2.5 rounded-full transition-all border border-oliva-700/20 shadow-xs active:scale-95 leading-normal"
                >
                  <RotateCcw className="h-3.5 w-3.5 text-oliva-700" />
                  <span>Ver Portada (Splash)</span>
                </button>
              )}

              {onOpenQR && (
                <button
                  onClick={onOpenQR}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-950 hover:bg-amber-200 bg-amber-100 px-4 py-2.5 rounded-full transition-all border border-amber-300 shadow-xs active:scale-95 leading-normal"
                >
                  <QrCode className="h-3.5 w-3.5 text-amber-800" />
                  <span>📲 Ver & Descargar Código QR</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* BARRA DE BÚSQUEDA INSTANTÁNEA DE PASTAS */}
        <div className="mx-auto max-w-2xl mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-3.5 h-5 w-5 text-terracota-500 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por variedad o ingredientes (ej: salmón, espinaca, ñoquis, lomo...)"
              className="w-full pl-12 pr-10 py-3 rounded-full border-2 border-crema-300 bg-white text-xs sm:text-sm text-terracota-950 placeholder:text-stone-400 focus:outline-none focus:border-terracota-600 focus:ring-2 focus:ring-terracota-200 shadow-sm transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3.5 top-3 text-stone-400 hover:text-stone-700 p-1"
                title="Limpiar búsqueda"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>

        {/* SOLAPAS / MENÚ DE VARIEDADES (MULTI-VISTA) - SOLO SI NO HAY BÚSQUEDA ACTIVA */}
        {!searchQuery && (
          <div className="flex items-center gap-1.5 sm:gap-2 overflow-x-auto pb-3 pt-2 no-scrollbar justify-start lg:justify-center border-b-2 border-terracota-200">
            <button
              onClick={() => setActivePageIndex(0)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold transition-all leading-normal ${
                activePageIndex === 0
                  ? "bg-terracota-600 text-white shadow-md -mb-0.5 border-t-2 border-x-2 border-terracota-700"
                  : "bg-crema-200/80 text-terracota-900 hover:bg-terracota-100 hover:text-terracota-950"
              }`}
            >
              <BookOpen className="h-4 w-4 flex-shrink-0" />
              <span className="leading-normal">Portada</span>
            </button>

            {categorias.map((cat, idx) => {
              const pageNum = idx + 1;
              const isActive = activePageIndex === pageNum;

              return (
                <button
                  key={cat.id}
                  onClick={() => setActivePageIndex(pageNum)}
                  className={`flex-shrink-0 flex items-center gap-1.5 px-4 sm:px-5 py-2.5 rounded-t-2xl text-xs sm:text-sm font-bold transition-all leading-normal ${
                    isActive
                      ? "bg-oliva-600 text-white shadow-md -mb-0.5 border-t-2 border-x-2 border-oliva-700"
                      : "bg-crema-200/80 text-terracota-900 hover:bg-oliva-100 hover:text-oliva-950"
                  }`}
                >
                  <span className="leading-normal">{cat.nombre}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* CONTENEDOR TIPO LIBRO ENCUADERNADO CON TEXTURA Y SOMBRA PROFUNDA */}
        <div className="mt-4 rounded-3xl book-page-container p-5 sm:p-8 lg:p-12 min-h-[560px] relative transition-all duration-300 overflow-visible">
          {/* ============================================================== */}
          {/* VISTA DE RESULTADOS DE BÚSQUEDA INSTANTÁNEA */}
          {/* ============================================================== */}
          {searchQuery ? (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b-2 border-terracota-200">
                <div>
                  <h3 className="font-serif text-2xl font-black text-terracota-950">
                    Resultados de Búsqueda
                  </h3>
                  <p className="text-xs text-stone-600 mt-1">
                    Se encontraron {searchResults.length} variedades para &ldquo;{searchQuery}&rdquo;
                  </p>
                </div>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-xs font-bold text-terracota-700 hover:underline"
                >
                  Ver todo el catálogo →
                </button>
              </div>

              {searchResults.length === 0 ? (
                <div className="text-center py-16 bg-white/70 rounded-2xl p-6">
                  <Utensils className="h-10 w-10 text-stone-300 mx-auto mb-2" />
                  <p className="font-serif text-base text-stone-700">
                    No encontramos ninguna variedad con &ldquo;{searchQuery}&rdquo;.
                  </p>
                  <p className="text-xs text-stone-500 mt-1">
                    Prueba con otra palabra clave como &ldquo;ravioles&rdquo;, &ldquo;sorrentinos&rdquo;, &ldquo;queso&rdquo; o &ldquo;carne&rdquo;.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {searchResults.map((producto) => {
                    const wasJustAdded = addedId === producto.id;
                    const hasImage = Boolean(
                      producto.imagen_url && producto.imagen_url.trim() !== ""
                    );

                    return (
                      <div
                        key={producto.id}
                        className="rounded-2xl border-2 border-crema-300 bg-white p-5 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-terracota-400 transition-all duration-300 group"
                      >
                        <div>
                          {hasImage ? (
                            <div className="relative h-44 w-full overflow-hidden rounded-xl bg-crema-200 mb-3 border border-crema-300">
                              <Image
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-500"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                              <div className="absolute top-2 left-2 rounded-full bg-oliva-700 text-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider shadow-sm">
                                {producto.categoria_nombre}
                              </div>
                            </div>
                          ) : (
                            <div className="h-24 w-full rounded-xl bg-crema-100 flex items-center justify-center text-center p-2 mb-3">
                              <span className="text-xs font-bold text-terracota-700">
                                {producto.categoria_nombre}
                              </span>
                            </div>
                          )}

                          <h4 className="font-serif text-base font-bold text-terracota-950 group-hover:text-terracota-700 transition-colors">
                            {producto.nombre}
                          </h4>
                          <p className="text-xs text-stone-600 line-clamp-2 mt-1">
                            {producto.ingredientes}
                          </p>

                          <div className="mt-2.5 flex items-center gap-3 text-[11px] font-semibold text-terracota-700">
                            {producto.tiempo_coccion_minutos > 0 && (
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3 text-oliva-700" />
                                {producto.tiempo_coccion_minutos} min
                              </span>
                            )}
                            {producto.rinde_porciones > 0 && (
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3 text-oliva-700" />
                                Rinde {producto.rinde_porciones}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="pt-3 mt-3 border-t border-crema-200 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-stone-400 uppercase font-bold block">Precio</span>
                            <span className="font-serif text-lg font-black text-terracota-950">
                              ${producto.precio.toLocaleString("es-AR")}
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(producto)}
                            className={`inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all shadow-sm ${
                              wasJustAdded
                                ? "bg-oliva-700 text-white"
                                : "bg-terracota-600 hover:bg-terracota-700 text-white"
                            }`}
                          >
                            {wasJustAdded ? (
                              <>
                                <Check className="h-3.5 w-3.5" />
                                <span>¡Listo!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-3.5 w-3.5" />
                                <span>Agregar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* VISTA 0: PORTADA VIBRANTE DE AUTOR */}
              {activePageIndex === 0 && (
            <div className="animate-page-flip space-y-8 sm:space-y-10 py-4 max-w-4xl mx-auto">
              {/* CARTEL PRINCIPAL CON PALETA VIVA TERRARCOTA & OLIVA */}
              <div className="relative rounded-3xl bg-gradient-to-br from-terracota-700 via-terracota-800 to-terracota-900 text-white p-6 sm:p-10 lg:p-12 shadow-2xl overflow-hidden border-2 border-terracota-600">
                <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-oliva-500/20 blur-3xl pointer-events-none" />
                <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-dorado-500/15 blur-3xl pointer-events-none" />

                <div className="relative z-10 space-y-4 text-center sm:text-left">
                  <div className="inline-flex items-center gap-2 rounded-full bg-oliva-500/90 text-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider border border-oliva-300 shadow-sm">
                    <Award className="h-4 w-4" />
                    <span>Masa Madre Viva & Sémola 100% Candeal</span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-black text-crema-50 leading-tight">
                    {config.nombre_tienda}
                  </h2>

                  <p className="text-sm sm:text-base md:text-lg text-crema-100 font-serif italic max-w-2xl leading-relaxed">
                    &ldquo;{config.slogan_principal}&rdquo;
                  </p>

                  {/* Sellos de garantía de fábrica */}
                  <div className="pt-6 grid grid-cols-1 sm:grid-cols-3 gap-3 border-t border-white/20">
                    <div className="flex items-center gap-2.5 bg-black/25 p-3 rounded-2xl">
                      <Snowflake className="h-5 w-5 text-oliva-300 flex-shrink-0" />
                      <div className="text-left">
                        <span className="text-xs font-bold block">Apto Freezer</span>
                        <span className="text-[10px] text-crema-200">Cocción directa sin descongelar</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-black/25 p-3 rounded-2xl">
                      <Clock className="h-5 w-5 text-dorado-300 flex-shrink-0" />
                      <div className="text-left">
                        <span className="text-xs font-bold block">Frescura al Día</span>
                        <span className="text-[10px] text-crema-200">Elaboración artesanal diaria</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2.5 bg-black/25 p-3 rounded-2xl">
                      <Layers className="h-5 w-5 text-terracota-300 flex-shrink-0" />
                      <div className="text-left">
                        <span className="text-xs font-bold block">Para Llevar</span>
                        <span className="text-[10px] text-crema-200">Cajas y bandejas listas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ÍNDICE DE VARIEDADES */}
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b-2 border-terracota-200 pb-2">
                  <h3 className="font-serif text-lg sm:text-xl font-bold text-terracota-950 flex items-center gap-2">
                    <BookOpen className="h-5 w-5 text-terracota-700" />
                    Índice de Variedades Artesanales ({categorias.length} Categorías)
                  </h3>
                  <span className="text-[11px] sm:text-xs text-oliva-800 font-bold">
                    Toca una categoría para ver
                  </span>
                </div>

                {/* Grilla fluida sin restricciones rígidas de altura */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  {categorias.map((cat, idx) => (
                    <div
                      key={cat.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => setActivePageIndex(idx + 1)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          setActivePageIndex(idx + 1);
                        }
                      }}
                      className="group cursor-pointer rounded-2xl bg-white border-2 border-crema-300 p-5 sm:p-6 hover:border-terracota-600 hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-auto gap-4 overflow-visible"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-black uppercase tracking-wider text-oliva-800 bg-oliva-100 px-3 py-1 rounded-full leading-normal">
                            Especialidad
                          </span>
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-crema-100 group-hover:bg-terracota-600 group-hover:text-white transition-colors">
                            <ChevronRight className="h-3.5 w-3.5 text-terracota-600 group-hover:text-white group-hover:translate-x-0.5 transition-transform" />
                          </span>
                        </div>
                        <h4 className="font-serif text-base font-bold text-terracota-950 group-hover:text-terracota-700 transition-colors pt-1 leading-snug">
                          {cat.nombre}
                        </h4>
                        <p className="text-xs text-terracota-800/80 line-clamp-2 leading-relaxed">
                          {cat.descripcion}
                        </p>
                      </div>

                      {/* Indicador inferior con padding holgado sin recortes */}
                      <div className="pt-3 border-t-2 border-crema-200/80 flex items-center justify-between text-xs font-bold text-terracota-700 group-hover:text-terracota-950 leading-normal">
                        <span>
                          {productos.filter((p) => p.categoria_id === cat.id).length} variedades
                        </span>
                        <span className="text-[11px] text-terracota-600 font-extrabold group-hover:underline">
                          Ver →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BANNER / TARJETA DEL CÓDIGO QR PORTABLE */}
              {onOpenQR && (
                <div className="mt-8 rounded-3xl bg-gradient-to-br from-amber-50 to-crema-200 border-2 border-amber-300/80 p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-sm overflow-visible">
                  <div className="space-y-2 text-center sm:text-left flex-1">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-200/80 border border-amber-300">
                      <QrCode className="h-3.5 w-3.5 text-amber-800" />
                      <span>Menú Digital Portable para Smartphones</span>
                    </div>
                    <h4 className="font-serif text-xl sm:text-2xl font-black text-terracota-950 leading-tight">
                      Llevá Nuestra Fábrica en tu Celular
                    </h4>
                    <p className="text-xs sm:text-sm text-terracota-800/90 max-w-lg leading-relaxed">
                      Escaneá el código QR oficial de Mia Pasta Bella con tu cámara o descargalo en alta resolución para tener las variedades siempre listas.
                    </p>
                  </div>

                  <div className="flex-shrink-0">
                    <button
                      onClick={onOpenQR}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider text-white bg-amber-800 hover:bg-amber-900 transition-all shadow-md active:scale-95 leading-normal"
                    >
                      <QrCode className="h-4 w-4" />
                      <span>Abrir y Descargar Código QR</span>
                    </button>
                  </div>
                </div>
              )}

              {/* BOTÓN DE ACCIÓN PRINCIPAL DE APERTURA */}
              <div className="text-center pt-4 pb-2">
                <button
                  onClick={goToNextPage}
                  className="btn-boutique py-3.5 px-8 sm:px-10 text-sm sm:text-base gap-2.5 text-white shadow-lg leading-normal"
                >
                  <span className="leading-normal">Explorar Variedades de Pastas</span>
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* ============================================================== */}
          {/* VISTAS 1..N: HOJAS DE CATEGORÍA CON PRODUCTOS CRUDOS / LLEVAR */}
          {/* ============================================================== */}
          {activePageIndex > 0 && currentCategory && (
            <div className="animate-page-flip space-y-8 overflow-visible">
              {/* ENCABEZADO DE LA HOJA (SIN INDICADOR "HOJA X DE Y") */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b-2 border-terracota-200 gap-4 overflow-visible">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-oliva-900 bg-oliva-100/90 border border-oliva-300/60 px-3.5 py-1.5 rounded-full shadow-xs leading-normal">
                      Elaboración Fresca al Día o Congelado
                    </span>
                  </div>

                  <h2 className="font-serif text-3xl sm:text-4xl font-black text-terracota-950 mt-2.5 leading-tight">
                    {currentCategory.nombre}
                  </h2>
                  <p className="text-xs sm:text-sm text-terracota-900/80 mt-1 max-w-2xl leading-relaxed">
                    {currentCategory.descripcion}
                  </p>
                </div>

                {/* BOTONES DE NAVEGACIÓN REFINADOS CON PADDING SIMÉTRICO Y SIN CLIPPING */}
                <div className="flex items-center gap-2.5 self-end sm:self-center overflow-visible">
                  <button
                    onClick={goToPrevPage}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-terracota-300 bg-white px-5 py-3 text-xs sm:text-sm font-bold text-terracota-950 hover:bg-terracota-50 hover:border-terracota-400 transition-all shadow-xs active:scale-95 leading-normal overflow-visible"
                  >
                    <ChevronLeft className="h-4 w-4 text-terracota-700 flex-shrink-0" />
                    <span className="leading-normal">Anterior</span>
                  </button>

                  <button
                    onClick={goToNextPage}
                    disabled={activePageIndex >= totalPages - 1}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full bg-oliva-700 px-5 py-3 text-xs sm:text-sm font-bold text-white hover:bg-oliva-800 transition-all shadow-xs disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 leading-normal overflow-visible"
                  >
                    <span className="leading-normal">Siguiente</span>
                    <ChevronRight className="h-4 w-4 flex-shrink-0" />
                  </button>
                </div>
              </div>

              {/* GRILLA DE PRODUCTOS CRUDOS / EMPAQUETADOS CON ESPACIADO COMPLETO */}
              {categoryProducts.length === 0 ? (
                <div className="text-center py-16 bg-white/60 rounded-2xl p-6">
                  <p className="font-serif text-lg text-terracota-800">
                    No hay variedades cargadas en este segmento en este momento.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-visible">
                  {categoryProducts.map((producto) => {
                    const wasJustAdded = addedId === producto.id;
                    const hasImage = Boolean(
                      producto.imagen_url && producto.imagen_url.trim() !== ""
                    );

                    return (
                      <div
                        key={producto.id}
                        className="rounded-2xl border-2 border-crema-300 bg-white p-5 sm:p-6 flex flex-col justify-between h-auto gap-4 shadow-sm hover:shadow-xl hover:border-terracota-400 transition-all duration-300 group overflow-visible"
                      >
                        <div className="flex-1 flex flex-col">
                          {/* IMAGEN DE PRODUCTO CRUDO O PLACEHOLDER DE HARINA */}
                          {hasImage ? (
                            <div className="relative h-48 w-full overflow-hidden rounded-xl bg-crema-200 mb-4 border border-crema-300 flex-shrink-0">
                              <Image
                                src={producto.imagen_url}
                                alt={producto.nombre}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-105"
                                sizes="(max-width: 768px) 100vw, 33vw"
                              />
                              <div className="absolute bottom-2 right-2 rounded-full bg-crema-100/95 backdrop-blur-sm px-2.5 py-0.5 text-[11px] font-black text-terracota-900 border border-crema-300 shadow-sm">
                                {producto.unidad_medida}
                              </div>
                            </div>
                          ) : (
                            <div className="h-28 w-full rounded-xl bg-gradient-to-br from-crema-100 to-crema-200 border border-crema-300 flex flex-col items-center justify-center text-center p-3 mb-4 flex-shrink-0">
                              <Utensils className="h-6 w-6 text-terracota-400 mb-1" />
                              <span className="text-[11px] font-bold text-terracota-700">
                                Pasta Cruda sin Foto • {producto.unidad_medida}
                              </span>
                            </div>
                          )}

                          <h3 className="font-serif text-lg font-bold text-terracota-950 group-hover:text-terracota-700 transition-colors leading-tight">
                            {producto.nombre}
                          </h3>

                          {/* INGREDIENTES / DESCRIPCIÓN DE SABOR PERSONALIZADA */}
                          <div className="mt-2.5 text-xs text-terracota-900/85 leading-relaxed bg-crema-100/70 p-3 rounded-xl border border-crema-300/80 flex-grow">
                            <span className="font-black text-terracota-950 block mb-0.5 text-[11px] uppercase tracking-wider">
                              Ingredientes & Sabor de Autor:
                            </span>
                            {producto.ingredientes}
                          </div>

                          {/* ESPECIFICACIONES DE COCCIÓN Y PORCIONES */}
                          <div className="mt-3 flex items-center justify-between text-[11px] font-semibold text-terracota-800 py-2 border-t border-crema-200">
                            <div className="flex items-center gap-1.5">
                              <Clock className="h-3.5 w-3.5 text-oliva-700 flex-shrink-0" />
                              <span>Cocción: {producto.tiempo_coccion_minutos} min</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Users className="h-3.5 w-3.5 text-oliva-700 flex-shrink-0" />
                              <span>Rinde {producto.rinde_porciones} porc.</span>
                            </div>
                          </div>

                          {/* SELLO DE CADUCIDAD & STOCK DE TANDA */}
                          <div className="mt-2 flex items-center justify-between text-[10px] text-amber-900 bg-amber-50/90 px-2.5 py-1.5 rounded-xl border border-amber-200/80">
                            <span className="truncate">⏱️ {producto.fecha_vencimiento || "72h en heladera / 90d en freezer"}</span>
                            {producto.stock !== undefined && producto.stock <= 0 ? (
                              <span className="font-extrabold text-red-700 bg-red-100 px-2 py-0.5 rounded-full shrink-0">
                                Agotado
                              </span>
                            ) : producto.stock !== undefined && producto.stock <= 5 ? (
                              <span className="font-extrabold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full shrink-0 animate-pulse">
                                ¡Últimas {producto.stock}!
                              </span>
                            ) : (
                              <span className="text-oliva-800 font-bold shrink-0">
                                {producto.stock} disp.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* PRECIO Y BOTÓN DE COMPRA: ESPACIADO FLUIDO Y SIN RECORTE */}
                        <div className="pt-4 mt-auto border-t-2 border-crema-100 flex items-center justify-between gap-3 overflow-visible">
                          <div className="min-w-0">
                            <span className="text-[9px] uppercase font-black text-terracota-600 block">
                              Precio Fábrica
                            </span>
                            <span className="font-serif text-xl sm:text-2xl font-black text-terracota-950 truncate block">
                              ${producto.precio.toLocaleString("es-AR")}
                            </span>
                          </div>

                          <button
                            onClick={() => handleAddToCart(producto)}
                            disabled={producto.stock !== undefined && producto.stock <= 0}
                            className={`inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3 rounded-full text-xs sm:text-sm font-bold transition-all shadow-md active:scale-95 flex-shrink-0 leading-normal overflow-visible disabled:opacity-50 disabled:cursor-not-allowed ${
                              producto.stock !== undefined && producto.stock <= 0
                                ? "bg-stone-300 text-stone-500 cursor-not-allowed"
                                : wasJustAdded
                                ? "bg-oliva-700 text-white"
                                : "bg-gradient-to-r from-terracota-600 to-terracota-700 hover:from-terracota-700 hover:to-terracota-800 text-white border border-white/20 shadow-terracota-900/20"
                            }`}
                          >
                            {producto.stock !== undefined && producto.stock <= 0 ? (
                              <span>Agotado</span>
                            ) : wasJustAdded ? (
                              <>
                                <Check className="h-4 w-4 flex-shrink-0" />
                                <span className="leading-normal">¡Listo!</span>
                              </>
                            ) : (
                              <>
                                <Plus className="h-4 w-4 flex-shrink-0" />
                                <span className="leading-normal">Agregar</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* PIE DE HOJA: NAVEGACIÓN REFINADA Y SIMÉTRICA */}
              <div className="mt-12 pt-6 border-t-2 border-crema-300 flex flex-col sm:flex-row items-center justify-between text-xs sm:text-sm text-terracota-900 font-semibold gap-4">
                <span className="text-terracota-700 font-medium">
                  Variedad activa: <strong className="text-terracota-950 font-bold">{currentCategory.nombre}</strong>
                </span>
                <div className="flex items-center gap-3">
                  <button
                    onClick={goToPrevPage}
                    className="inline-flex items-center justify-center gap-1.5 rounded-full border border-terracota-300 bg-white px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-terracota-950 hover:bg-terracota-50 transition-all shadow-xs leading-normal"
                  >
                    <ChevronLeft className="h-4 w-4 text-terracota-700 flex-shrink-0" />
                    <span className="leading-normal">Anterior</span>
                  </button>
                  {activePageIndex < totalPages - 1 && (
                    <button
                      onClick={goToNextPage}
                      className="inline-flex items-center justify-center gap-1.5 rounded-full bg-oliva-700 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold text-white hover:bg-oliva-800 transition-all shadow-xs leading-normal"
                    >
                      <span className="leading-normal">Siguiente</span>
                      <ChevronRight className="h-4 w-4 flex-shrink-0" />
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
  );
}
