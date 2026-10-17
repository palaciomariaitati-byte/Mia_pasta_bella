"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  X,
  Plus,
  Minus,
  Trash2,
  ShoppingBag,
  ArrowRight,
  MessageCircle,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { TiendaConfig } from "@/lib/db";
import { CheckoutModal } from "@/components/CheckoutModal";

interface CartDrawerProps {
  config: TiendaConfig;
}

export function CartDrawer({ config }: CartDrawerProps) {
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    totalPrice,
    totalPorciones,
    clearCart,
  } = useCart();

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  if (!isCartOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm">
        <div
          className="fixed inset-0"
          onClick={() => setIsCartOpen(false)}
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full w-full max-w-md flex-col bg-[#FAF6EE] shadow-2xl border-l border-stone-200">
          {/* HEADER */}
          <div className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-amber-100 p-2 text-amber-800">
                <ShoppingBag className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-serif text-lg font-bold text-[#2C1810]">
                  Tu Canasta de Pastas
                </h2>
                <p className="text-xs text-stone-500">
                  {items.length} variedades · {totalPorciones} porciones
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsCartOpen(false)}
              className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* ITEMS LIST */}
          <div className="flex-1 overflow-y-auto p-6 space-y-3.5">
            {items.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center text-stone-400">
                <ShoppingBag className="h-16 w-16 stroke-[1.2] text-stone-300 mb-3" />
                <p className="font-serif text-lg font-semibold text-stone-700">
                  Tu canasta está vacía
                </p>
                <p className="mt-1 text-xs text-stone-500 max-w-xs leading-relaxed">
                  Hojea el libro de pastas de autor y agrega tus variedades artesanales favoritas.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white p-3.5 shadow-sm"
                >
                  {item.imagen_url && (
                    <div className="relative h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl bg-stone-100">
                      <Image
                        src={item.imagen_url}
                        alt={item.nombre}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-[#2C1810] truncate">
                      {item.nombre}
                    </h4>
                    <p className="text-xs text-amber-800 font-bold mt-0.5">
                      ${item.precio.toLocaleString("es-AR")}
                    </p>
                    <span className="text-[10px] text-stone-500 block">
                      Rinde {item.rinde_porciones || 2} porc. x unidad
                    </span>
                  </div>

                  <div className="flex flex-col items-end gap-1.5">
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-stone-400 hover:text-red-600 p-1 transition-colors"
                      title="Eliminar variedad"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>

                    <div className="flex items-center gap-1.5 rounded-full border border-stone-200 bg-stone-50 px-2.5 py-1">
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad - 1)}
                        className="text-stone-600 hover:text-stone-900"
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-5 text-center text-xs font-bold text-stone-900">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.id, item.cantidad + 1)}
                        className="text-stone-600 hover:text-stone-900"
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* FOOTER CHECKOUT */}
          {items.length > 0 && (
            <div className="border-t border-stone-200 bg-white p-6 space-y-3.5">
              <div className="flex justify-between items-center text-xs text-stone-600">
                <span>Rinde total estimado:</span>
                <span className="font-bold text-amber-900 bg-amber-100 px-2.5 py-0.5 rounded-full">
                  {totalPorciones} porciones para la mesa
                </span>
              </div>

              <div className="flex justify-between items-baseline border-b border-stone-100 pb-3">
                <span className="text-xs font-bold text-stone-600 uppercase tracking-wider">
                  Total de la orden:
                </span>
                <span className="font-serif text-2xl font-extrabold text-amber-900">
                  ${totalPrice.toLocaleString("es-AR")}
                </span>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 text-white font-bold py-3.5 px-6 rounded-2xl text-sm shadow-md transition-all active:scale-[0.98]"
              >
                <span>Continuar al Checkout</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={clearCart}
                className="w-full text-center text-[11px] text-stone-400 hover:text-stone-700 pt-1"
              >
                Vaciar canasta
              </button>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE CHECKOUT */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        config={config}
      />
    </>
  );
}
