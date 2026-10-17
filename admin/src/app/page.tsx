import React from "react";
import Link from "next/link";
import { getDashboardStats, getConfiguracion } from "@/lib/db";
import {
  UtensilsCrossed,
  FileText,
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingBag,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [stats, config] = await Promise.all([
    getDashboardStats(),
    getConfiguracion(),
  ]);

  return (
    <div className="space-y-8 max-w-6xl">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
            Supabase · Fuente Única de Verdad
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-2">
            Panel de Control General
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Gestión de {config.nombre_tienda}. Los cambios impactan en la tienda pública en tiempo real.
          </p>
        </div>

        <Link
          href="/textos"
          className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
        >
          <FileText className="h-4 w-4" />
          Editar Textos de la Tienda
        </Link>
      </div>

      {/* ALERTA NUEVOS PEDIDOS PENDIENTES */}
      {stats.pedidosPendientes > 0 && (
        <div className="bg-amber-100 border-2 border-amber-300 rounded-3xl p-5 flex items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-700 text-white rounded-2xl">
              <ShoppingBag className="h-6 w-6" />
            </div>
            <div>
              <p className="text-base font-bold text-amber-950">
                ¡Tienes {stats.pedidosPendientes} pedido{stats.pedidosPendientes > 1 ? "s" : ""} nuevo{stats.pedidosPendientes > 1 ? "s" : ""} por preparar!
              </p>
              <p className="text-xs text-amber-800 mt-0.5">
                Ingresados desde la tienda web. Revisa los detalles para coordinar cocina o delivery.
              </p>
            </div>
          </div>
          <Link
            href="/pedidos"
            className="shrink-0 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-xs transition-all"
          >
            Ver Pedidos →
          </Link>
        </div>
      )}

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Link
          href="/pedidos"
          className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between hover:border-amber-400 hover:shadow-md transition-all group"
        >
          <div>
            <span className="text-xs text-gray-500 font-medium">Pedidos Web</span>
            <div className="text-2xl font-bold text-amber-800 mt-1">{stats.pedidosTotales}</div>
            <span className="text-[11px] text-amber-700 font-semibold">
              {stats.pedidosPendientes} por preparar
            </span>
          </div>
          <div className="p-3 bg-amber-50 group-hover:bg-amber-100 rounded-xl text-amber-700 transition-colors">
            <ShoppingBag className="h-6 w-6" />
          </div>
        </Link>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Catálogo Total</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalProductos}</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Pastas & Pizzas</span>
          </div>
          <div className="p-3 bg-stone-50 rounded-xl text-stone-700">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Stock Total</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalStock}</div>
            <span className="text-[11px] text-gray-500">Unidades / Cajas</span>
          </div>
          <div className="p-3 bg-blue-50 rounded-xl text-blue-700">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Clientes CRM</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalClientes}</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Frecuentes</span>
          </div>
          <div className="p-3 bg-purple-50 rounded-xl text-purple-700">
            <Users className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Asientos Contables</span>
            <div className="text-2xl font-bold text-gray-900 mt-1">{stats.totalAsientos}</div>
            <span className="text-[11px] text-emerald-600 font-semibold">Partida Doble</span>
          </div>
          <div className="p-3 bg-emerald-50 rounded-xl text-emerald-700">
            <DollarSign className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ALERTA STOCK BAJO */}
      {stats.stockBajo > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <div>
            <p className="text-sm font-bold text-amber-800">
              {stats.stockBajo} producto{stats.stockBajo > 1 ? "s" : ""} con stock bajo (≤ 5 unidades)
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              Revisar el catálogo para evitar quedar sin stock durante el servicio.
            </p>
          </div>
          <Link
            href="/catalogo"
            className="ml-auto shrink-0 text-xs font-bold text-amber-800 hover:text-amber-950 underline"
          >
            Ver catálogo →
          </Link>
        </div>
      )}

      {/* ACCESOS RÁPIDOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <FileText className="h-5 w-5 text-amber-700" />
            Control de Contenido Dinámico
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Modifica el slogan principal, el listado de variedades, datos de atención al cliente y el compromiso de calidad que se renderiza en la tienda pública.
          </p>
          <Link
            href="/textos"
            className="inline-block text-xs font-bold text-amber-800 hover:text-amber-950 underline"
          >
            Ir a formulario de textos →
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-bold text-gray-900 text-base flex items-center gap-2">
            <UtensilsCrossed className="h-5 w-5 text-amber-700" />
            Catálogo de Pastas y Pre-Pizzas
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Actualiza precios, cantidades en stock, descripciones de ingredientes de autor, y cambia o remueve fotos de productos en tiempo real.
          </p>
          <Link
            href="/catalogo"
            className="inline-block text-xs font-bold text-amber-800 hover:text-amber-950 underline"
          >
            Administrar productos →
          </Link>
        </div>
      </div>
    </div>
  );
}
