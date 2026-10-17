"use client";

import React, { useState, useMemo } from "react";
import Image from "next/image";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Utensils,
  ChefHat,
  Check,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { TiendaConfig, ProductoItem } from "@/lib/db";
import { CheckoutModal } from "@/components/CheckoutModal";

interface CartDrawerProps {
  config: TiendaConfig;
  productos?: ProductoItem[];
}

export function CartDrawer({ config, productos = [] }: CartDrawerProps) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    addItem,
    updateQuantity,
    removeItem,
    totalPrice,
    totalPorciones,
    clearCart,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [addedSauceId, setAddedSauceId] = useState<string | null>(null);

  // Helper para identificar salsas
  const isSauce = (nombre: string, categoria: string = "") => {
    const text = `${nombre} ${categoria}`.toLowerCase();
    return (
      text.includes("salsa") ||
      text.includes("filetto") ||
      text.includes("bolognesa") ||
      text.includes("pesto") ||
      text.includes("pomodoro") ||
      text.includes("rosa") ||
      text.includes("crema")
    );
  };

  // Detectar si el cliente lleva pastas pero ninguna salsa artesanal
  const hasPastas = useMemo(() => {
    return items.some((it) => !isSauce(it.nombre, it.categoria));
  }, [items]);

  const hasSauceInCart = useMemo(() => {
    return items.some((it) => isSauce(it.nombre, it.categoria));
  }, [items]);

  // Obtener hasta 2 salsas disponibles del catálogo para sugerir (Upselling en 1 clic)
  const suggestedSauces = useMemo(() => {
    if (!hasPastas || hasSauceInCart || !productos || productos.length === 0) {
      return [];
    }

    const currentItemIds = new Set(items.map((it) => it.id));

    return productos
      .filter((p) => {
        if (currentItemIds.has(p.id)) return false;
        if (p.stock !== undefined && p.stock <= 0) return false;
        return isSauce(p.nombre, p.categoria_nombre);
      })
      .slice(0, 2);
  }, [hasPastas, hasSauceInCart, productos, items]);

  const handleAddSauce = (sauce: ProductoItem) => {
    addItem(
      {
        id: sauce.id,
        nombre: sauce.nombre,
        precio: sauce.precio,
        imagen_url: sauce.imagen_url,
        categoria: sauce.categoria_nombre,
        unidad_medida: sauce.unidad_medida,
        rinde_porciones: sauce.rinde_porciones || 2,
      },
      1
    );

    setAddedSauceId(sauce.id);
    setTimeout(() => setAddedSauceId(null), 1500);
  };

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-xs animate-fade-in">
        {/* Backdrop click to close */}
        <div
          className="fixed inset-0"
          onClick={() => setIsCartOpen(false)}
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#FAF6EE] shadow-2xl border-l border-[#E6D8C3] animate-slide-left">
          {/* HEADER DEL DRAWER */}
          <div className="flex items-center justify-between border-b border-[#E6D8C3] bg-white px-6 py-4.5 shadow-xs">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-2.5 text-amber-800 border border-amber-200">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-xl font-bold text-[#2C1810]">
                  Tu Canasta de Pastas
                </h2>
                <p className="text-xs text-stone-500 font-medium">
                  {items.length} {items.length === 1 ? "variedad" : "variedades"} seleccionadas
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
              aria-label="Cerrar Canasta"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* LISTA DE ITEMS */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-3.5 no-scrollbar">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-stone-400 py-12">
                <div className="h-20 w-20 rounded-full bg-crema-200 flex items-center justify-center mb-4">
                  <ShoppingBag className="h-10 w-10 text-stone-300 stroke-[1.2]" />
                </div>
                <p className="font-serif text-lg font-bold text-stone-700">
                  Tu canasta está vacía
                </p>
                <p className="mt-1 text-xs text-stone-500 max-w-xs leading-relaxed">
                  Hojea el libro de pastas de autor y agrega tus variedades artesanales favoritas para la próxima tanda.
                </p>
              </div>
            ) : (
              <>
                {/* ITEMS EN CANASTA */}
                {items.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3.5 rounded-2xl border border-[#E6D8C3] bg-white p-3.5 shadow-xs hover:border-terracota-300 transition-colors"
                  >
                    {item.imagen_url ? (
                      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100 border border-[#E6D8C3]">
                        <Image
                          src={item.imagen_url}
                          alt={item.nombre}
                          fill
                          className="object-cover"
                          sizes="64px"
                        />
                      </div>
                    ) : (
                      <div className="h-16 w-16 flex-shrink-0 rounded-xl bg-crema-200 flex items-center justify-center text-terracota-700">
                        <Utensils className="h-6 w-6" />
                      </div>
                    )}

                    <div className="flex-1 min-w-0">
                      <h4 className="font-serif text-sm font-bold text-[#2C1810] truncate">
                        {item.nombre}
                      </h4>
                      <p className="font-serif text-xs font-black text-terracota-700 mt-0.5">
                        ${item.precio.toLocaleString("es-AR")}
                      </p>
                      <span className="text-[10px] text-stone-500 block">
                        Rinde {item.rinde_porciones || 2} porc. x bandeja
                      </span>
                    </div>

                    <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="text-stone-300 hover:text-red-600 p-1 transition-colors"
                        title="Eliminar variedad"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>

                      <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2 py-0.5">
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                          className="text-stone-600 hover:text-stone-900 p-0.5"
                          title="Restar 1"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="w-5 text-center text-xs font-black text-stone-900">
                          {item.cantidad}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                          className="text-stone-600 hover:text-stone-900 p-0.5"
                          title="Sumar 1"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* ============================================================== */}
                {/* MARIDAJE DEL CHEF: UPSELLING EN 1 CLIC (SUGERENCIA DE SALSA) */}
                {/* ============================================================== */}
                {suggestedSauces.length > 0 && (
                  <div className="rounded-2xl border-2 border-amber-300/80 bg-gradient-to-br from-amber-50 to-crema-100 p-4 shadow-sm space-y-3 mt-4">
                    <div className="flex items-center gap-2">
                      <ChefHat className="h-4 w-4 text-amber-700 flex-shrink-0" />
                      <div>
                        <h4 className="font-serif text-xs font-bold text-amber-950 uppercase tracking-wider">
                          🍅 Maridaje del Chef
                        </h4>
                        <p className="text-[11px] text-amber-900/80">
                          ¿Sumamos una salsa artesanal fresca para completar el plato?
                        </p>
                      </div>
                    </div>

                    <div className="space-y-2">
                      {suggestedSauces.map((sauce) => {
                        const wasAdded = addedSauceId === sauce.id;
                        return (
                          <div
                            key={sauce.id}
                            className="flex items-center justify-between gap-3 bg-white p-2.5 rounded-xl border border-amber-200 shadow-xs"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              {sauce.imagen_url && (
                                <div className="relative h-10 w-10 rounded-lg overflow-hidden flex-shrink-0 bg-stone-100">
                                  <Image
                                    src={sauce.imagen_url}
                                    alt={sauce.nombre}
                                    fill
                                    className="object-cover"
                                    sizes="40px"
                                  />
                                </div>
                              )}
                              <div className="min-w-0">
                                <h5 className="text-xs font-bold text-[#2C1810] truncate">
                                  {sauce.nombre}
                                </h5>
                                <span className="text-[11px] font-serif font-black text-amber-900">
                                  ${sauce.precio.toLocaleString("es-AR")}
                                </span>
                              </div>
                            </div>

                            <button
                              onClick={() => handleAddSauce(sauce)}
                              className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all shadow-xs flex-shrink-0 flex items-center gap-1 active:scale-95 ${
                                wasAdded
                                  ? "bg-oliva-700 text-white"
                                  : "bg-amber-700 hover:bg-amber-800 text-white"
                              }`}
                            >
                              {wasAdded ? (
                                <>
                                  <Check className="h-3.5 w-3.5" />
                                  <span>¡Listo!</span>
                                </>
                              ) : (
                                <>
                                  <Plus className="h-3.5 w-3.5" />
                                  <span>+ Sumar</span>
                                </>
                              )}
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* FOOTER DEL DRAWER CON TOTAL Y CHECKOUT */}
          {items.length > 0 && (
            <div className="border-t border-[#E6D8C3] bg-white p-5 sm:p-6 space-y-4 shadow-lg">
              {/* Rendimiento total de comensales para la mesa */}
              <div className="flex justify-between items-center text-xs text-stone-600 bg-amber-50/80 p-2.5 rounded-xl border border-amber-200/60">
                <span className="font-semibold text-amber-950 flex items-center gap-1.5">
                  <Utensils className="h-3.5 w-3.5 text-amber-700" />
                  Rendimiento estimado:
                </span>
                <span className="font-bold text-amber-900 bg-amber-200/70 px-2.5 py-0.5 rounded-full text-xs">
                  {totalPorciones} platos a servir
                </span>
              </div>

              {/* Total de la Orden */}
              <div className="flex justify-between items-baseline">
                <div>
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                    Total a Abonar
                  </span>
                  <span className="font-serif text-3xl font-black text-[#2C1810]">
                    ${totalPrice.toLocaleString("es-AR")}
                  </span>
                </div>
                <span className="text-[11px] text-stone-500 font-medium">
                  {items.length} variedades
                </span>
              </div>

              {/* Botón Principal de Checkout */}
              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-2xl text-sm shadow-xl transition-all active:scale-[0.98]"
                style={{
                  background: "linear-gradient(135deg, #8C4F37 0%, #703D2A 100%)",
                }}
              >
                <span>Confirmar Pedido y Datos de Entrega</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-xs text-stone-400 hover:text-stone-700 transition-colors"
              >
                Vaciar canasta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CHECKOUT (DATOS, QR Y PAGO) */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        config={config}
      />
    </>
  );
}
