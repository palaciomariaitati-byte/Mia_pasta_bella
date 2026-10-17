"use client";

import React, { useState, useMemo } from "react";
import {
  ShoppingBag,
  Clock,
  CheckCircle2,
  Truck,
  Store,
  Phone,
  MessageCircle,
  AlertCircle,
  Package,
  Printer,
  Search,
  Filter,
  ChefHat,
  Layers,
  Calendar,
  UtensilsCrossed,
  CheckSquare,
  Square,
  Sparkles,
  ArrowUpDown,
} from "lucide-react";
import { PedidoAdminItem } from "@/lib/db";
import { updateOrderStatusAction } from "@/app/actions";

interface PedidosManagerProps {
  initialOrders: PedidoAdminItem[];
}

export function PedidosManager({ initialOrders }: PedidosManagerProps) {
  // Pestaña activa: "comandas" (pedidos individuales) | "amasado" (totalizador maestro de producción)
  const [activeTab, setActiveTab] = useState<"comandas" | "amasado">("comandas");

  // Filtros de búsqueda
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTanda, setSelectedTanda] = useState<string>("todas");
  const [selectedEstado, setSelectedEstado] = useState<string>("todos");
  const [selectedTipoEntrega, setSelectedTipoEntrega] = useState<string>("todos");

  // Estado para impresión del rótulo de caja de fábrica
  const [labelToPrint, setLabelToPrint] = useState<PedidoAdminItem | null>(null);

  // Extraer lista única de tandas presentes en pedidos
  const availableTandas = useMemo(() => {
    const tandas = new Set<string>();
    initialOrders.forEach((p) => {
      if (p.dia_entrega && p.dia_entrega.trim()) {
        tandas.add(p.dia_entrega.trim());
      }
    });
    return Array.from(tandas);
  }, [initialOrders]);

  // Filtrado de pedidos
  const filteredOrders = useMemo(() => {
    return initialOrders.filter((pedido) => {
      // 1. Filtro Tanda
      if (selectedTanda !== "todas") {
        if ((pedido.dia_entrega || "").trim() !== selectedTanda) return false;
      }

      // 2. Filtro Estado
      if (selectedEstado !== "todos") {
        if (selectedEstado === "pendientes" && !(pedido.estado === "pendiente" || pedido.estado === "confirmada")) {
          return false;
        }
        if (selectedEstado === "en_preparacion" && pedido.estado !== "en_preparacion") {
          return false;
        }
        if (selectedEstado === "entregada" && pedido.estado !== "entregada") {
          return false;
        }
        if (selectedEstado === "cancelada" && pedido.estado !== "cancelada") {
          return false;
        }
      }

      // 3. Filtro Tipo Entrega
      if (selectedTipoEntrega !== "todos") {
        const isDelivery = (pedido.cliente_direccion && pedido.cliente_direccion.trim() !== "" && !pedido.cliente_direccion.toLowerCase().includes("retiro")) || pedido.notas_entrega?.toLowerCase().includes("delivery");
        if (selectedTipoEntrega === "delivery" && !isDelivery) return false;
        if (selectedTipoEntrega === "retiro" && isDelivery) return false;
      }

      // 4. Búsqueda por texto (Nombre, Teléfono o Número de Pedido)
      if (searchQuery.trim() !== "") {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = pedido.cliente_nombre.toLowerCase().includes(q);
        const matchesPhone = pedido.cliente_telefono.toLowerCase().includes(q);
        const matchesNumber = pedido.numero_comprobante.toLowerCase().includes(q);
        const matchesAddress = (pedido.cliente_direccion || "").toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesNumber && !matchesAddress) return false;
      }

      return true;
    });
  }, [initialOrders, selectedTanda, selectedEstado, selectedTipoEntrega, searchQuery]);

  // KPIs Generales
  const pendientes = initialOrders.filter(
    (p) => p.estado === "pendiente" || p.estado === "confirmada"
  );
  const enPreparacion = initialOrders.filter((p) => p.estado === "en_preparacion");
  const entregados = initialOrders.filter((p) => p.estado === "entregada");

  // =========================================================================
  // CÁLCULO DEL TOTALIZADOR MAESTRO DE AMASADO Y PRODUCCIÓN
  // (Sobre pedidos activos: pendiente, confirmada, en_preparacion)
  // =========================================================================
  const consolidatedProduction = useMemo(() => {
    // Tomar pedidos que requieran producción (no cancelados ni ya entregados)
    const activeForKitchen = initialOrders.filter((p) => {
      const isPending = p.estado === "pendiente" || p.estado === "confirmada" || p.estado === "en_preparacion";
      if (!isPending) return false;

      // Filtrar por tanda si hay una seleccionada
      if (selectedTanda !== "todas") {
        return (p.dia_entrega || "").trim() === selectedTanda;
      }
      return true;
    });

    const map = new Map<
      string,
      {
        nombre: string;
        unidades: number;
        porciones: number;
        pedidosList: string[];
      }
    >();

    let totalBandejas = 0;
    let totalPlatos = 0;

    activeForKitchen.forEach((p) => {
      (p.items || []).forEach((item) => {
        const key = item.producto_nombre.trim();
        const current = map.get(key) || {
          nombre: key,
          unidades: 0,
          porciones: 0,
          pedidosList: [],
        };

        const rindeEstimado = 2; // Estándar de porciones por bandeja
        const porcionesItem = item.cantidad * rindeEstimado;

        current.unidades += item.cantidad;
        current.porciones += porcionesItem;
        if (!current.pedidosList.includes(p.numero_comprobante)) {
          current.pedidosList.push(p.numero_comprobante);
        }

        totalBandejas += item.cantidad;
        totalPlatos += porcionesItem;

        map.set(key, current);
      });
    });

    const items = Array.from(map.values()).sort((a, b) => b.unidades - a.unidades);

    return {
      items,
      totalBandejas,
      totalPlatos,
      pedidosActivosCount: activeForKitchen.length,
    };
  }, [initialOrders, selectedTanda]);

  const handlePrintKitchenSheet = () => {
    window.print();
  };

  const generateWhatsAppMessage = (pedido: PedidoAdminItem) => {
    const primerNombre = pedido.cliente_nombre.split(" ")[0];
    const tanda = pedido.dia_entrega || "nuestra próxima tanda";

    if (pedido.estado === "confirmada") {
      return encodeURIComponent(
        `¡Hola ${primerNombre}! 👋 Te confirmamos que tu pedido #${pedido.numero_comprobante} en Mia Pasta Bella está confirmado para la tanda fresca del ${tanda}.\n\nTotal: $${pedido.total.toLocaleString("es-AR")}.\n¡Muchas gracias por elegir pastas artesanales de autor!`
      );
    }

    if (pedido.estado === "en_preparacion") {
      return encodeURIComponent(
        `¡Hola ${primerNombre}! 🧑‍🍳 Tus pastas artesanales del pedido #${pedido.numero_comprobante} ya entraron en la mesa de amasado fresco y armado de bandejas.\n\nTe avisamos apenas estén listas para el despacho.`
      );
    }

    if (pedido.estado === "entregada") {
      const esDelivery = pedido.cliente_direccion && !pedido.cliente_direccion.toLowerCase().includes("retiro");
      return encodeURIComponent(
        `¡Hola ${primerNombre}! ✨ Tu pedido #${pedido.numero_comprobante} de Mia Pasta Bella ya está ${
          esDelivery ? `en viaje hacia ${pedido.cliente_direccion}` : "listo para retirar en fábrica"
        }.\n\nRecordá: 72 hs en heladera / 90 días en freezer. ¡Que disfrutes tus pastas!`
      );
    }

    return encodeURIComponent(
      `¡Hola ${primerNombre}! Te escribimos desde la fábrica Mia Pasta Bella respecto a tu encargo #${pedido.numero_comprobante}.`
    );
  };

  return (
    <div className="max-w-6xl space-y-8">
      {/* ============================================================== */}
      {/* 1. HEADER & CONTROL SUPERIOR (PRINT: HIDDEN) */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-5 print:hidden">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
            <ShoppingBag className="h-4 w-4" />
            <span>Centro de Comando de Cocina y Despachos</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-stone-900 mt-1">
            Gestión Integral de Pedidos y Amasado
          </h1>
          <p className="text-xs text-stone-500 mt-1">
            Control de comanda en vivo, totalizador de producción para la cuadra y comunicación directa con clientes.
          </p>
        </div>

        {/* Acciones Rápidas */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => {
              setActiveTab("amasado");
              setTimeout(() => handlePrintKitchenSheet(), 200);
            }}
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
            title="Imprimir Hoja de Producción para la Cocina"
          >
            <Printer className="h-4 w-4 text-amber-400" />
            <span>Imprimir Hoja de Cocina</span>
          </button>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. KPI METRICS CARDS (PRINT: HIDDEN) */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 print:hidden">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500">Por Amasar / Nuevos</span>
            <div className="text-3xl font-extrabold text-amber-700 mt-1">
              {pendientes.length}
            </div>
            <span className="text-[11px] text-stone-400">Pedidos pendientes</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <Clock className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500">En Preparación</span>
            <div className="text-3xl font-extrabold text-blue-700 mt-1">
              {enPreparacion.length}
            </div>
            <span className="text-[11px] text-stone-400">En mesa de amasado</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <ChefHat className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500">Listos / Entregados</span>
            <div className="text-3xl font-extrabold text-emerald-700 mt-1">
              {entregados.length}
            </div>
            <span className="text-[11px] text-stone-400">Órdenes completadas</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500">Platos a Servir</span>
            <div className="text-3xl font-extrabold text-purple-700 mt-1">
              {consolidatedProduction.totalPlatos}
            </div>
            <span className="text-[11px] text-stone-400">En tandas activas</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center">
            <UtensilsCrossed className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 3. PESTAÑAS PRINCIPALES: COMANDAS VS TOTALIZADOR MAESTRO */}
      {/* ============================================================== */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-3 print:hidden">
        <button
          onClick={() => setActiveTab("comandas")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "comandas"
              ? "bg-amber-700 text-white shadow-md"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Comandas Individuales ({initialOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("amasado")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
            activeTab === "amasado"
              ? "bg-stone-900 text-amber-200 shadow-md border border-amber-400/40"
              : "bg-white text-stone-600 hover:bg-stone-100 border border-stone-200"
          }`}
        >
          <ChefHat className="h-4 w-4 text-amber-400" />
          <span>🧑‍🍳 Totalizador Maestro de Amasado ({consolidatedProduction.totalBandejas} bandejas)</span>
        </button>
      </div>

      {/* ============================================================== */}
      {/* 4. BARRA DE FILTROS Y BÚSQUEDA (PRINT: HIDDEN) */}
      {/* ============================================================== */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-stone-200 shadow-xs space-y-3 print:hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Buscador */}
          <div className="relative">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-stone-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar cliente, teléfono, #..."
              className="w-full pl-10 pr-3 py-2 rounded-xl border border-stone-300 text-xs focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white"
            />
          </div>

          {/* Filtro Tanda */}
          <div>
            <select
              value={selectedTanda}
              onChange={(e) => setSelectedTanda(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-stone-800"
            >
              <option value="todas">📅 Todas las Tandas</option>
              {availableTandas.map((tanda) => (
                <option key={tanda} value={tanda}>
                  📅 Tanda: {tanda}
                </option>
              ))}
            </select>
          </div>

          {/* Filtro Estado */}
          <div>
            <select
              value={selectedEstado}
              onChange={(e) => setSelectedEstado(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-stone-800"
            >
              <option value="todos">⚡ Todos los Estados</option>
              <option value="pendientes">🕒 Por Amasar / Nuevos</option>
              <option value="en_preparacion">🥣 En Preparación</option>
              <option value="entregada">✅ Entregados / Listos</option>
              <option value="cancelada">❌ Cancelados</option>
            </select>
          </div>

          {/* Filtro Modalidad */}
          <div>
            <select
              value={selectedTipoEntrega}
              onChange={(e) => setSelectedTipoEntrega(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-amber-600 bg-white text-stone-800"
            >
              <option value="todos">🛵 Todas las Modalidades</option>
              <option value="delivery">🏠 Solo Delivery</option>
              <option value="retiro">🏪 Solo Retiro en Fábrica</option>
            </select>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. VISTA A: TOTALIZADOR MAESTRO DE AMASADO (COCINA & HOJA IMPRIMIBLE) */}
      {/* ============================================================== */}
      {activeTab === "amasado" && (
        <div className="space-y-6">
          {/* Tarjeta de Control Maestro */}
          <div className="bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl space-y-4 print:hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-2xl bg-amber-400/20 text-amber-300 border border-amber-400/40 flex items-center justify-center">
                  <ChefHat className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-serif text-xl sm:text-2xl font-black text-amber-50">
                    Hoja Maestra de Amasado y Producción
                  </h3>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    Tanda seleccionada: <strong className="text-white uppercase">{selectedTanda === "todas" ? "Todas las tandas activas" : selectedTanda}</strong>
                  </p>
                </div>
              </div>

              <button
                onClick={handlePrintKitchenSheet}
                className="inline-flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-400 text-stone-950 px-5 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span>🖨️ Imprimir Hoja de Cocina</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 border-t border-white/10 text-xs">
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-amber-300 font-bold block">Total de Bandejas:</span>
                <span className="text-2xl font-black text-white">{consolidatedProduction.totalBandejas} unidades</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-amber-300 font-bold block">Total de Comensales:</span>
                <span className="text-2xl font-black text-white">{consolidatedProduction.totalPlatos} porciones</span>
              </div>
              <div className="bg-white/5 p-3 rounded-xl border border-white/10">
                <span className="text-amber-300 font-bold block">Pedidos Consolidados:</span>
                <span className="text-2xl font-black text-white">{consolidatedProduction.pedidosActivosCount} órdenes activas</span>
              </div>
            </div>
          </div>

          {/* TABLA DE PRODUCCIÓN (VISUAL Y DE IMPRESIÓN) */}
          <div className="bg-white rounded-3xl border border-stone-200 overflow-hidden shadow-sm">
            {/* Encabezado exclusivo de Impresión */}
            <div className="hidden print:block p-6 border-b-2 border-stone-800 text-stone-900">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-2xl font-black uppercase tracking-tight">
                    Mía Pasta Bella — Hoja Maestra de Amasado & Cocina
                  </h1>
                  <p className="text-sm font-semibold mt-1">
                    Tanda: <strong>{selectedTanda === "todas" ? "Todas las tandas activas" : selectedTanda}</strong>
                  </p>
                </div>
                <div className="text-right text-xs">
                  <p>Impreso: {new Date().toLocaleString("es-AR")}</p>
                  <p className="font-bold">Total Bandejas: {consolidatedProduction.totalBandejas}</p>
                  <p className="font-bold">Total Porciones: {consolidatedProduction.totalPlatos}</p>
                </div>
              </div>
            </div>

            <table className="w-full text-left text-xs text-stone-700">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="py-3.5 px-4 sm:px-6">Variedad Artesanal</th>
                  <th className="py-3.5 px-4 text-center">Bandejas / Unidades</th>
                  <th className="py-3.5 px-4 text-center">Porciones Equiv.</th>
                  <th className="py-3.5 px-4 hidden sm:table-cell">Comandas Incluidas</th>
                  <th className="py-3.5 px-4 text-right">Control de Cuadra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {consolidatedProduction.items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-stone-400">
                      No hay ítems pendientes de amasado para la tanda seleccionada.
                    </td>
                  </tr>
                ) : (
                  consolidatedProduction.items.map((item, idx) => (
                    <tr key={item.nombre} className="hover:bg-amber-50/40 transition-colors">
                      <td className="py-4 px-4 sm:px-6 font-bold text-stone-900 text-sm">
                        <span className="text-amber-700 font-mono mr-2">#{idx + 1}</span>
                        {item.nombre}
                      </td>

                      <td className="py-4 px-4 text-center">
                        <span className="inline-block bg-amber-100 text-amber-950 font-black text-sm px-3 py-1 rounded-full border border-amber-300">
                          {item.unidades} u.
                        </span>
                      </td>

                      <td className="py-4 px-4 text-center font-bold text-stone-600">
                        {item.porciones} platos
                      </td>

                      <td className="py-4 px-4 hidden sm:table-cell text-[11px] text-stone-500 max-w-xs truncate">
                        {item.pedidosList.map((num) => `#${num}`).join(", ")}
                      </td>

                      <td className="py-4 px-4 text-right">
                        <div className="inline-flex items-center gap-2 text-[10px] text-stone-500">
                          <span className="inline-flex items-center gap-1 border border-stone-300 px-2 py-0.5 rounded-md">
                            [ ] Amasado
                          </span>
                          <span className="inline-flex items-center gap-1 border border-stone-300 px-2 py-0.5 rounded-md">
                            [ ] Envasado
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 6. VISTA B: COMANDAS INDIVIDUALES Y GESTIÓN EN TIEMPO REAL */}
      {/* ============================================================== */}
      {activeTab === "comandas" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs text-stone-500 font-medium">
            <span>Mostrando {filteredOrders.length} de {initialOrders.length} pedidos</span>
          </div>

          {filteredOrders.length === 0 ? (
            <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
              <ShoppingBag className="h-12 w-12 text-stone-300 mx-auto" />
              <h3 className="text-base font-bold text-stone-700">No se encontraron pedidos</h3>
              <p className="text-xs text-stone-500 max-w-sm mx-auto">
                Prueba ajustando los filtros de tanda, estado o término de búsqueda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredOrders.map((pedido) => {
                const telLimpio = pedido.cliente_telefono.replace(/[^0-9]/g, "");
                const waUrl = `https://wa.me/${telLimpio}?text=${generateWhatsAppMessage(pedido)}`;

                return (
                  <div
                    key={pedido.id}
                    className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-amber-400 transition-all"
                  >
                    <div>
                      {/* Cabecera del pedido */}
                      <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <div>
                          <span className="text-sm font-extrabold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xl">
                            #{pedido.numero_comprobante}
                          </span>
                          <span className="text-[11px] text-stone-400 ml-2">
                            {new Date(pedido.fecha).toLocaleDateString("es-AR", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {/* Estado badge */}
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            pedido.estado === "entregada"
                              ? "bg-emerald-100 text-emerald-800"
                              : pedido.estado === "en_preparacion"
                              ? "bg-blue-100 text-blue-800"
                              : pedido.estado === "cancelada"
                              ? "bg-red-100 text-red-800"
                              : "bg-amber-100 text-amber-800"
                          }`}
                        >
                          {pedido.estado.replace("_", " ")}
                        </span>
                      </div>

                      {/* Datos del Cliente y Tanda */}
                      <div className="pt-3 space-y-2 text-xs">
                        <div className="flex justify-between items-baseline">
                          <span className="font-bold text-stone-900 text-base">
                            {pedido.cliente_nombre}
                          </span>
                          <span className="text-amber-800 font-bold uppercase text-[10px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                            {pedido.metodo_pago}
                          </span>
                        </div>

                        {/* Badges de Tanda y Porciones */}
                        <div className="flex flex-wrap items-center gap-2 pt-1">
                          {pedido.dia_entrega && (
                            <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                              📅 Tanda: {pedido.dia_entrega}
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-stone-300">
                            🍽️ {pedido.total_porciones || (pedido.items || []).reduce((acc, it) => acc + it.cantidad * 2, 0)} porciones
                          </span>
                        </div>

                        {/* Teléfono y Dirección */}
                        {pedido.cliente_telefono && (
                          <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                            <Phone className="h-3.5 w-3.5 text-stone-400" />
                            <span>{pedido.cliente_telefono}</span>
                          </div>
                        )}

                        {pedido.cliente_direccion && (
                          <div className="flex items-start gap-1.5 text-stone-600 font-medium">
                            <Truck className="h-3.5 w-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                            <span>{pedido.cliente_direccion}</span>
                          </div>
                        )}

                        {pedido.notas_entrega && (
                          <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80 text-[11px] text-stone-700 mt-2">
                            <p className="font-medium">
                              📝 <strong>Notas:</strong> {pedido.notas_entrega}
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Items del Pedido */}
                      <div className="mt-4 pt-3 border-t border-stone-100">
                        <span className="text-[11px] font-bold uppercase text-stone-400 tracking-wider block mb-1.5">
                          Variedades Pedidas:
                        </span>
                        <ul className="space-y-1.5 text-xs text-stone-700">
                          {(pedido.items || []).map((it) => (
                            <li key={it.id} className="flex justify-between items-center bg-stone-50 p-2 rounded-lg">
                              <span>
                                <strong className="text-amber-800">{it.cantidad}x</strong> {it.producto_nombre}
                              </span>
                              <span className="font-bold text-stone-900">
                                ${it.subtotal.toLocaleString("es-AR")}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Footer: Total y Formulario de Estado */}
                    <div className="pt-4 border-t border-stone-100 space-y-3">
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-stone-500 uppercase">Total a Cobrar:</span>
                        <span className="text-2xl font-black text-stone-900">
                          ${pedido.total.toLocaleString("es-AR")}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {/* Selector de Estado Rápido */}
                        <form action={updateOrderStatusAction} className="flex-1 flex gap-1.5">
                          <input type="hidden" name="id" value={pedido.id} />
                          <select
                            name="estado"
                            defaultValue={pedido.estado}
                            className="flex-1 rounded-xl border border-stone-300 text-xs px-2.5 py-2 font-semibold bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                          >
                            <option value="confirmada">Confirmada</option>
                            <option value="en_preparacion">En Preparación</option>
                            <option value="entregada">Entregada / Listo</option>
                            <option value="cancelada">Cancelada</option>
                          </select>
                          <button
                            type="submit"
                            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                          >
                            Guardar
                          </button>
                        </form>

                        {/* WhatsApp Inteligente */}
                        {pedido.cliente_telefono && (
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                            title="Avisar al cliente por WhatsApp con mensaje contextual"
                          >
                            <MessageCircle className="h-3.5 w-3.5 fill-current" />
                            <span>Avisar</span>
                          </a>
                        )}

                        {/* Botón Rótulo de Caja para Despacho */}
                        <button
                          type="button"
                          onClick={() => setLabelToPrint(pedido)}
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold transition-all shadow-xs active:scale-95"
                          title="Imprimir Rótulo de Caja con vencimiento corto y cocción"
                        >
                          <Printer className="h-3.5 w-3.5 text-amber-800" />
                          <span>🏷️ Rótulo de Caja</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL IMPRIMIBLE: RÓTULO DE CAJA DE FÁBRICA (10x15 CM) */}
      {/* ============================================================== */}
      {labelToPrint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
          <div
            className="fixed inset-0 print:hidden"
            onClick={() => setLabelToPrint(null)}
          />

          <div className="relative z-10 w-full max-w-md bg-white rounded-3xl shadow-2xl border-2 border-stone-800 p-6 space-y-4 print:shadow-none print:border-2 print:border-black print:rounded-none print:max-w-none print:w-full print:p-4">
            {/* Header del Rótulo */}
            <div className="text-center border-b-2 border-dashed border-stone-400 pb-3">
              <span className="text-[10px] uppercase font-black tracking-widest text-stone-500 block">
                Fábrica Artesanal de Pastas Frescas
              </span>
              <h3 className="font-serif text-xl font-black text-stone-950 uppercase tracking-tight">
                Mía Pasta Bella
              </h3>
              <p className="text-[10px] font-bold text-amber-800 uppercase mt-0.5">
                Rótulo de Control, Cocción y Despacho en Fresco
              </p>
            </div>

            {/* Datos Principales del Pedido */}
            <div className="grid grid-cols-2 gap-2 text-xs border-b border-stone-200 pb-3">
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Comprobante</span>
                <strong className="text-sm font-black font-mono text-stone-900">
                  #{labelToPrint.numero_comprobante}
                </strong>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Fecha Amasado</span>
                <strong className="text-xs font-bold text-stone-800">
                  {labelToPrint.dia_entrega || new Date(labelToPrint.fecha).toLocaleDateString("es-AR")}
                </strong>
              </div>
              <div className="col-span-2 pt-1">
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Cliente Encargante</span>
                <strong className="text-sm font-bold text-stone-950 block">
                  {labelToPrint.cliente_nombre}
                </strong>
                <span className="text-xs text-stone-600 font-mono">
                  Tel: {labelToPrint.cliente_telefono}
                </span>
              </div>
              {labelToPrint.cliente_direccion && (
                <div className="col-span-2 text-[11px] text-stone-600 bg-stone-50 p-2 rounded-lg border border-stone-200">
                  <strong>Entrega:</strong> {labelToPrint.cliente_direccion}
                </div>
              )}
            </div>

            {/* Variedades y Porciones en la Caja */}
            <div className="space-y-1.5 border-b border-stone-200 pb-3 text-xs">
              <div className="flex justify-between items-center text-[10px] font-bold text-stone-400 uppercase tracking-wider">
                <span>Variedad Fresca en Caja</span>
                <span>Cant.</span>
              </div>
              {(labelToPrint.items || []).map((it) => (
                <div key={it.id} className="flex justify-between items-baseline font-semibold text-stone-900">
                  <span>{it.producto_nombre}</span>
                  <span className="font-mono font-bold bg-stone-100 px-2 py-0.5 rounded">
                    {it.cantidad} {it.cantidad === 1 ? "caja" : "cajas"}
                  </span>
                </div>
              ))}
              <div className="pt-2 flex justify-between items-center text-xs font-bold text-amber-950 bg-amber-50 p-2 rounded-lg border border-amber-200">
                <span>Total de Porciones que rinde:</span>
                <span className="font-black text-sm">
                  {labelToPrint.total_porciones || (labelToPrint.items || []).reduce((acc, it) => acc + it.cantidad * 2, 0)} porciones
                </span>
              </div>
            </div>

            {/* REGLA DE ORO DE VENCIMIENTO CORTO */}
            <div className="rounded-xl border-2 border-stone-900 p-2.5 text-center bg-stone-50 space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-stone-900 block">
                ⚠️ PASTA FRESCA SIN CONSERVANTES · CORTA VIDA ÚTIL
              </span>
              <div className="flex justify-around text-xs font-bold text-stone-800 pt-0.5">
                <span>🧊 Heladera: <strong>72 Horas</strong></span>
                <span>❄️ Freezer: <strong>90 Días</strong></span>
              </div>
            </div>

            {/* Minutos de Cocción */}
            <div className="text-[11px] text-stone-700 bg-stone-100 p-2 rounded-lg border border-stone-200 leading-snug">
              <strong>⏱️ Cocción de Fábrica:</strong> Hervir en abundante agua con sal (1L por porción) a fuego vivo durante <strong>3 a 5 minutos</strong>. Retirar con espumadera sin colar en seco.
            </div>

            {/* Monto y Estado de Pago */}
            <div className="flex justify-between items-center pt-1 border-t-2 border-dashed border-stone-400">
              <div>
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Total del Pedido</span>
                <span className="font-serif text-xl font-black text-stone-950">
                  ${labelToPrint.total.toLocaleString("es-AR")}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[9px] uppercase font-bold text-stone-400 block">Modalidad de Pago</span>
                <span className="font-bold text-xs uppercase px-2 py-0.5 bg-stone-900 text-white rounded">
                  {labelToPrint.metodo_pago}
                </span>
              </div>
            </div>

            {/* Botones de Acción (ocultos al imprimir) */}
            <div className="pt-2 flex gap-2 print:hidden">
              <button
                type="button"
                onClick={() => window.print()}
                className="flex-1 py-3 px-4 bg-amber-800 hover:bg-amber-900 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 active:scale-95"
              >
                <Printer className="h-4 w-4" />
                <span>Imprimir Rótulo (10x15cm)</span>
              </button>
              <button
                type="button"
                onClick={() => setLabelToPrint(null)}
                className="py-3 px-4 bg-stone-200 hover:bg-stone-300 text-stone-800 font-bold text-xs rounded-xl transition-all"
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
