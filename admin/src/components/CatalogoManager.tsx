"use client";

import React, { useState, useTransition } from "react";
import Image from "next/image";
import {
  UtensilsCrossed,
  Plus,
  Trash2,
  Save,
  ImageOff,
  Search,
  CheckCircle,
  Filter,
  Sparkles,
  Calendar,
  Clock,
  Users,
  Image as ImageIcon,
  Check,
  X,
  AlertTriangle,
  Upload,
} from "lucide-react";
import { CategoriaItem, ProductoItem } from "@/lib/db";
import {
  updateProductAction,
  createProductAction,
  deleteProductAction,
} from "@/app/actions";

interface CatalogoManagerProps {
  initialCategories: CategoriaItem[];
  initialProducts: ProductoItem[];
}

// ==============================================================================
// GALERÍA DE FOTOS PREDETERMINADAS DE AUTOR (MÁXIMA AUTONOMÍA VISUAL)
// ==============================================================================
export const FOTOS_PREDETERMINADAS = [
  {
    titulo: "Sorrentinos Artesanales de Autor",
    categoria: "sorrentinos",
    url: "https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Sorrentinos de Salmón y Quesos Nobles",
    categoria: "sorrentinos",
    url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Ravioles en Plancha Caseros",
    categoria: "ravioles",
    url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Ravioles Rellenos con Sémola Espolvoreada",
    categoria: "ravioles",
    url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Fettuccine Frescos al Huevo de Granja",
    categoria: "tallarines",
    url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Tagliatelle Verdes con Espinaca Molida",
    categoria: "tallarines",
    url: "https://images.unsplash.com/photo-1621996346565-e3d5d6281781?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Cintas Rojas al Pimiento Morrón Asado",
    categoria: "tallarines",
    url: "https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Ñoquis Frescos Soufflé de Papa",
    categoria: "noquis",
    url: "https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Tortellinis y Capellettis Doblados a Mano",
    categoria: "tortellinis",
    url: "https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Pre-Pizzas a la Piedra Masa Madre",
    categoria: "prepizzas",
    url: "https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Empanadas Criollas Artesanales",
    categoria: "empanadas",
    url: "https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80",
  },
  {
    titulo: "Tartas en Molde y Pascualinas",
    categoria: "tartas",
    url: "https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80",
  },
];

export function CatalogoManager({
  initialCategories,
  initialProducts,
}: CatalogoManagerProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("todos");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  // Estado para el modal de selección de fotos predeterminadas
  const [activePhotoModalFor, setActivePhotoModalFor] = useState<string | null>(null);
  const [newProductPhoto, setNewProductPhoto] = useState<string>("");
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [customPreviews, setCustomPreviews] = useState<Record<string, string>>({});

  // Manejador de subida real de archivo local al servidor
  const handleFileUpload = async (file: File, targetId: string) => {
    if (!file) return;
    setUploadingId(targetId);
    try {
      const data = new FormData();
      data.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: data,
      });
      const result = await res.json();
      if (!res.ok || !result.url) {
        throw new Error(result.error || "Error al subir imagen");
      }

      setCustomPreviews((prev) => ({ ...prev, [targetId]: result.url }));

      if (targetId === "new-product") {
        setNewProductPhoto(result.url);
      } else {
        const input = document.getElementById(`input-img-${targetId}`) as HTMLInputElement | null;
        if (input) {
          input.value = result.url;
        }
      }

      showNotification("¡Foto subida con éxito! Haz clic en Actualizar para guardar.");
    } catch (err: any) {
      alert("Error al subir archivo: " + err.message);
    } finally {
      setUploadingId(null);
    }
  };

  // Filtrado de alto rendimiento
  const filteredProducts = initialProducts.filter((p) => {
    const matchesCategory =
      selectedCategory === "todos" || p.categoria_id === selectedCategory;
    const matchesSearch =
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.ingredientes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const showNotification = (msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 3000);
  };

  const handleDelete = (id: string, nombre: string) => {
    if (window.confirm(`¿Estás seguro de eliminar "${nombre}" del catálogo?`)) {
      startTransition(async () => {
        await deleteProductAction(id);
        showNotification(`Producto "${nombre}" eliminado`);
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* NOTIFICACIÓN TOAST */}
      {feedback && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 bg-emerald-800 text-white px-5 py-3 rounded-2xl shadow-xl text-xs font-bold animate-in slide-in-from-top-4">
          <CheckCircle className="h-4 w-4" />
          <span>{feedback}</span>
        </div>
      )}

      {/* HEADER */}
      <div className="border-b border-gray-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <UtensilsCrossed className="h-4 w-4" />
            <span>Fábrica de Pastas Frescas · Control Total de Productos</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Gestión de Catálogo ({initialProducts.length} Variedades)
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Control de precios, stock de tanda, fechas de elaboración/caducidad y reemplazo de fotos (predeterminadas o de mercadería real).
          </p>
        </div>
      </div>

      {/* SEGMENTOS / PESTAÑAS POR CATEGORÍA Y BUSCADOR */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3">
        {/* BUSCADOR */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por nombre o ingredientes (ej: morrón, salmón, masa madre, pascualina)..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 text-xs focus:border-amber-600 focus:outline-none"
          />
        </div>

        {/* PESTAÑAS DE SEGMENTOS */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => setSelectedCategory("todos")}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedCategory === "todos"
                ? "bg-amber-700 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            Todos ({initialProducts.length})
          </button>

          {initialCategories.map((c) => {
            const count = initialProducts.filter(
              (p) => p.categoria_id === c.id
            ).length;
            const isSelected = selectedCategory === c.id;

            return (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isSelected
                    ? "bg-amber-700 text-white shadow-sm"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span>{c.nombre}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    isSelected
                      ? "bg-white/20 text-white"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* FORMULARIO RÁPIDO PARA CREAR PRODUCTO NUEVO CON AUTONOMÍA TOTAL      */}
      {/* ===================================================================== */}
      <details className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <summary className="p-5 font-bold text-xs uppercase tracking-wider text-amber-800 cursor-pointer flex items-center justify-between hover:bg-amber-50/50 transition-colors">
          <span className="flex items-center gap-2">
            <Plus className="h-4 w-4 text-amber-700" />
            + Publicar Nueva Variedad (con Precio, Stock, Fechas e Imagen)
          </span>
          <span className="text-gray-400 group-open:rotate-180 transition-transform">
            ▼
          </span>
        </summary>

        <form
          action={async (formData) => {
            startTransition(async () => {
              await createProductAction(formData);
              showNotification("Nueva variedad publicada en la tienda");
              setNewProductPhoto("");
            });
          }}
          className="p-5 sm:p-6 bg-amber-50/30 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Categoría
            </label>
            <select
              name="categoria_id"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            >
              {initialCategories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nombre de la Variedad
            </label>
            <input
              type="text"
              name="nombre"
              placeholder="Ej: Sorrentinos de Hongos y Parmesano"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Precio Fábrica ($)
            </label>
            <input
              type="number"
              name="precio"
              placeholder="6500"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Stock de Tanda
            </label>
            <input
              type="number"
              name="stock"
              placeholder="25"
              defaultValue={25}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Ingredientes y Descripción de Sabor
            </label>
            <textarea
              name="ingredientes"
              rows={2}
              placeholder="Describe los ingredientes nobles, masa con sémola candeal o relleno..."
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Fecha / Tanda de Elaboración
            </label>
            <input
              type="text"
              name="fecha_elaboracion"
              defaultValue="Elaboración fresca de la tanda"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Fecha de Caducidad / Vencimiento
            </label>
            <input
              type="text"
              name="fecha_vencimiento"
              defaultValue="72 hs en heladera / 90 días en freezer"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Rinde (Porciones)
            </label>
            <input
              type="number"
              name="rinde_porciones"
              defaultValue={2}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Cocción (Minutos)
            </label>
            <input
              type="number"
              name="tiempo_coccion_minutos"
              defaultValue={4}
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Unidad de Venta
            </label>
            <input
              type="text"
              name="unidad_medida"
              placeholder="caja (12 unid.), porción (500g), etc."
              defaultValue="caja (12 unidades)"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              required
            />
          </div>

          {/* FOTO: SUBIDA DE ARCHIVO, PREDETERMINADA O URL */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-bold text-gray-700">
                Foto del Producto
              </label>
              <div className="flex items-center gap-2">
                <label className="cursor-pointer inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg border border-emerald-300 transition-all shadow-xs">
                  <Upload className="h-3.5 w-3.5 text-emerald-700" />
                  <span>{uploadingId === "new-product" ? "Subiendo..." : "Subir Archivo"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingId === "new-product"}
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) handleFileUpload(f, "new-product");
                    }}
                  />
                </label>
                <button
                  type="button"
                  onClick={() => setActivePhotoModalFor("new-product")}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 hover:underline"
                >
                  <ImageIcon className="h-3.5 w-3.5" />
                  <span>Galería</span>
                </button>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              {newProductPhoto && (
                <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-gray-300 flex-shrink-0 bg-stone-100">
                  <Image
                    src={newProductPhoto}
                    alt="Preview nuevo producto"
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                </div>
              )}
              <input
                type="text"
                name="imagen_url"
                value={newProductPhoto}
                onChange={(e) => setNewProductPhoto(e.target.value)}
                placeholder="URL de foto o sube un archivo desde tu dispositivo..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none bg-white"
              />
            </div>
          </div>

          <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
            <button
              type="submit"
              disabled={isPending}
              className="bg-amber-700 hover:bg-amber-800 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Publicar en Catálogo de Fábrica
            </button>
          </div>
        </form>
      </details>

      {/* ===================================================================== */}
      {/* LISTA RENDERIZADA DE PRODUCTOS (CONTROL TOTAL DE CADA VARIEDAD)       */}
      {/* ===================================================================== */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            Mostrando <strong>{filteredProducts.length}</strong> de{" "}
            {initialProducts.length} variedades activas
          </span>
          {selectedCategory !== "todos" && (
            <button
              onClick={() => setSelectedCategory("todos")}
              className="text-amber-800 font-bold hover:underline"
            >
              Ver todas las categorías
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredProducts.map((producto) => (
            <div
              key={producto.id}
              className="bg-white rounded-2xl border border-gray-200 p-4 shadow-sm flex flex-col justify-between space-y-3 hover:border-amber-300 transition-all"
            >
              <form
                action={async (formData) => {
                  startTransition(async () => {
                    await updateProductAction(formData);
                    showNotification(`"${producto.nombre}" actualizado con éxito`);
                  });
                }}
                className="space-y-3 flex-1 flex flex-col justify-between"
              >
                <input type="hidden" name="id" value={producto.id} />
                <input type="hidden" name="categoria_id" value={producto.categoria_id} />

                {/* HEADER DE TARJETA CON ESTADO DE STOCK */}
                <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                      {producto.categoria_nombre}
                    </span>
                    {producto.stock <= 0 ? (
                      <span className="text-[10px] font-extrabold text-red-700 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                        Sin Stock
                      </span>
                    ) : producto.stock <= 5 ? (
                      <span className="text-[10px] font-extrabold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        Stock Bajo ({producto.stock})
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                        Stock: {producto.stock}
                      </span>
                    )}
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDelete(producto.id, producto.nombre)}
                    className="text-gray-400 hover:text-red-600 text-xs p-1"
                    title="Eliminar producto"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* IMAGEN, SUBIDA DE ARCHIVO, SELECTOR DE GALERÍA Y URL MANUAL */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    {(customPreviews[producto.id] || producto.imagen_url) &&
                    (customPreviews[producto.id] || producto.imagen_url).trim() !== "" ? (
                      <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 flex-shrink-0">
                        <Image
                          src={customPreviews[producto.id] || producto.imagen_url}
                          alt={producto.nombre}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 rounded-xl bg-amber-50 border border-amber-200 flex flex-col items-center justify-center text-center p-1 flex-shrink-0 text-amber-700">
                        <ImageOff className="h-5 w-5 mb-0.5" />
                        <span className="text-[8px] font-bold">Sin foto</span>
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-[10px] font-bold text-gray-600">
                          Foto del Producto:
                        </label>
                        <div className="flex items-center gap-2">
                          <label
                            htmlFor={`file-upload-${producto.id}`}
                            className="cursor-pointer inline-flex items-center gap-1 text-[10px] font-bold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-2 py-0.5 rounded border border-emerald-300 transition-all shadow-xs"
                          >
                            <Upload className="h-3 w-3 text-emerald-700" />
                            <span>
                              {uploadingId === producto.id ? "Subiendo..." : "Subir Foto"}
                            </span>
                          </label>
                          <input
                            id={`file-upload-${producto.id}`}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            disabled={uploadingId === producto.id}
                            onChange={(e) => {
                              const f = e.target.files?.[0];
                              if (f) handleFileUpload(f, producto.id);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setActivePhotoModalFor(producto.id)}
                            className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 hover:underline"
                          >
                            <ImageIcon className="h-3 w-3" />
                            <span>Galería</span>
                          </button>
                        </div>
                      </div>

                      <input
                        id={`input-img-${producto.id}`}
                        type="text"
                        name="imagen_url"
                        defaultValue={customPreviews[producto.id] || producto.imagen_url}
                        placeholder="Pega URL o sube archivo de foto..."
                        className="w-full rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] focus:border-amber-600 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* NOMBRE */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                    Nombre:
                  </label>
                  <input
                    type="text"
                    name="nombre"
                    defaultValue={producto.nombre}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1 text-xs font-semibold focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>

                {/* INGREDIENTES */}
                <div>
                  <label className="block text-[10px] font-bold text-gray-600 mb-0.5">
                    Ingredientes / Notas de Sabor:
                  </label>
                  <textarea
                    name="ingredientes"
                    rows={2}
                    defaultValue={producto.ingredientes}
                    className="w-full rounded-lg border border-gray-200 px-2.5 py-1 text-[11px] leading-relaxed focus:border-amber-600 focus:outline-none"
                    required
                  />
                </div>

                {/* PRECIO, STOCK, COCCIÓN, PORCIONES */}
                <div className="grid grid-cols-4 gap-1.5 pt-1">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-500">
                      Precio ($)
                    </label>
                    <input
                      type="number"
                      name="precio"
                      defaultValue={producto.precio}
                      className="w-full rounded-lg border border-gray-200 px-1.5 py-1 text-xs font-bold text-gray-900 focus:border-amber-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-500">
                      Stock
                    </label>
                    <input
                      type="number"
                      name="stock"
                      defaultValue={producto.stock}
                      className="w-full rounded-lg border border-gray-200 px-1.5 py-1 text-xs focus:border-amber-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-500">
                      Cocción
                    </label>
                    <input
                      type="number"
                      name="tiempo_coccion_minutos"
                      defaultValue={producto.tiempo_coccion_minutos}
                      className="w-full rounded-lg border border-gray-200 px-1.5 py-1 text-xs focus:border-amber-600 focus:outline-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-500">
                      Porciones
                    </label>
                    <input
                      type="number"
                      name="rinde_porciones"
                      defaultValue={producto.rinde_porciones || 2}
                      className="w-full rounded-lg border border-gray-200 px-1.5 py-1 text-xs focus:border-amber-600 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                {/* FECHAS DE ELABORACIÓN Y VENCIMIENTO (FÁBRICA) */}
                <div className="grid grid-cols-2 gap-2 pt-1 border-t border-gray-100">
                  <div>
                    <label className="block text-[9px] font-bold text-gray-600 mb-0.5">
                      Elaboración:
                    </label>
                    <input
                      type="text"
                      name="fecha_elaboracion"
                      defaultValue={producto.fecha_elaboracion || "Elaboración fresca de la tanda"}
                      className="w-full rounded-lg border border-gray-200 px-2 py-0.5 text-[10px] focus:border-amber-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-gray-600 mb-0.5">
                      Caducidad / Vencimiento:
                    </label>
                    <input
                      type="text"
                      name="fecha_vencimiento"
                      defaultValue={producto.fecha_vencimiento || "72 hs en heladera / 90 días en freezer"}
                      className="w-full rounded-lg border border-gray-200 px-2 py-0.5 text-[10px] focus:border-amber-600 focus:outline-none"
                    />
                  </div>
                </div>

                <input type="hidden" name="unidad_medida" value={producto.unidad_medida} />
                <input type="hidden" name="activo" value={producto.activo ? "true" : "false"} />

                {/* UNIDAD Y BOTÓN GUARDAR */}
                <div className="pt-2 flex items-center justify-between border-t border-gray-100">
                  <span className="text-[10px] text-gray-500">
                    {producto.unidad_medida}
                  </span>

                  <button
                    type="submit"
                    disabled={isPending}
                    className="inline-flex items-center gap-1 bg-amber-700 hover:bg-amber-800 text-white px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm active:scale-95"
                  >
                    <Save className="h-3 w-3" />
                    Actualizar
                  </button>
                </div>
              </form>
            </div>
          ))}
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL DE SELECCIÓN DE FOTOS PREDETERMINADAS DE AUTOR                  */}
      {/* ===================================================================== */}
      {activePhotoModalFor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-stone-200 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold text-stone-900">
                  Galería de Fotos Predeterminadas de Autor
                </h3>
                <p className="text-xs text-stone-500">
                  Haz clic en cualquier imagen para asignarla inmediatamente a la variedad.
                </p>
              </div>
              <button
                onClick={() => setActivePhotoModalFor(null)}
                className="p-1 rounded-full text-stone-400 hover:bg-stone-100 hover:text-stone-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {FOTOS_PREDETERMINADAS.map((foto, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (activePhotoModalFor === "new-product") {
                      setNewProductPhoto(foto.url);
                    } else {
                      const input = document.getElementById(
                        `input-img-${activePhotoModalFor}`
                      ) as HTMLInputElement | null;
                      if (input) input.value = foto.url;
                      setCustomPreviews((prev) => ({ ...prev, [activePhotoModalFor]: foto.url }));
                    }
                    setActivePhotoModalFor(null);
                    showNotification("Foto seleccionada. Recuerda hacer clic en 'Actualizar' para guardar.");
                  }}
                  className="group cursor-pointer rounded-2xl border-2 border-stone-200 hover:border-amber-600 overflow-hidden bg-stone-50 transition-all hover:shadow-md flex flex-col"
                >
                  <div className="relative h-28 w-full bg-stone-200 overflow-hidden">
                    <Image
                      src={foto.url}
                      alt={foto.titulo}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="200px"
                    />
                  </div>
                  <div className="p-2 text-center flex-1 flex flex-col justify-center">
                    <span className="text-[11px] font-bold text-stone-900 leading-snug line-clamp-2">
                      {foto.titulo}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-amber-800 mt-0.5">
                      {foto.categoria}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t flex justify-between items-center text-xs text-stone-500">
              <span>¿Tienes fotos tomadas con el teléfono? Pega la URL directamente en el campo.</span>
              <button
                onClick={() => setActivePhotoModalFor(null)}
                className="px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl font-bold text-stone-700"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
