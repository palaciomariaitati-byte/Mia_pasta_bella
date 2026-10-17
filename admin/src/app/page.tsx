import React from "react";
import Link from "next/link";
import {
  getConfiguracion,
  getProductos,
  getPedidosAdmin,
  getClientes,
} from "@/lib/db";
import {
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Award,
  Layers,
  ChefHat,
  ArrowRight,
  Package,
  Calendar,
  DollarSign,
  Printer,
  Sparkles,
  QrCode,
  Sliders,
  Calculator,
  Truck,
  BookOpen,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  const [config, productos, pedidos, clientes] = await Promise.all([
    getConfiguracion(),
    getProductos(),
    getPedidosAdmin(),
    getClientes(),
  ]);

  // 1. KPI: Total de Ventas Confirmadas ($ ARS) de pedidos no cancelados
  const pedidosValidos = pedidos.filter((p) => p.estado !== "cancelada");
  const ventasTotales = pedidosValidos.reduce((sum, p) => sum + p.total, 0);

  // 2. KPI: Pedidos Pendientes de Amasado / Elaboración
  const pedidosPendientesAmasado = pedidos.filter(
    (p) =>
      p.estado === "pendiente" ||
      p.estado === "confirmada" ||
      p.estado === "en_preparacion"
  );

  // 3. KPI: Total de Porciones Encargadas en tandas activas
  const totalPorcionesEncargadas = pedidosPendientesAmasado.reduce(
    (sum, p) =>
      sum +
      (p.total_porciones ||
        (p.items || []).reduce((acc, it) => acc + it.cantidad * 2, 0)),
    0
  );

  // Total de Bandejas/Cajas a armar
  const totalBandejasAmasar = pedidosPendientesAmasado.reduce(
    (sum, p) =>
      sum + (p.items || []).reduce((acc, it) => acc + it.cantidad, 0),
    0
  );

  // 4. KPI: Alertas de Stock Bajo (≤ 5 unidades)
  const productosStockBajo = productos.filter((p) => p.activo && p.stock <= 5);

  // 5. Ranking de las Pastas Más Pedidas de Fábrica
  const statsMap = new Map<
    string,
    { nombre: string; unidades: number; porciones: number; ingresos: number }
  >();

  pedidosValidos.forEach((p) => {
    (p.items || []).forEach((it) => {
      const current = statsMap.get(it.producto_nombre) || {
        nombre: it.producto_nombre,
        unidades: 0,
        porciones: 0,
        ingresos: 0,
      };
      current.unidades += it.cantidad;
      current.porciones += it.cantidad * 2;
      current.ingresos += it.subtotal;
      statsMap.set(it.producto_nombre, current);
    });
  });

  const rankingPastas = Array.from(statsMap.values())
    .sort((a, b) => b.unidades - a.unidades)
    .slice(0, 5);

  const maxUnidades = rankingPastas[0]?.unidades || 1;

  return (
    <div className="space-y-8 max-w-6xl">
      {/* ============================================================== */}
      {/* 1. HEADER DE CONTROL DE FÁBRICA */}
      {/* ============================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-200 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-black uppercase tracking-wider text-amber-800 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
              🌾 Fábrica Artesanal por Encargo
            </span>
            <span className="text-xs font-bold text-stone-500">
              Mía Pasta Bella
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-black text-stone-900 mt-2">
            Centro de Mando & Producción
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1 max-w-xl">
            Control en tiempo real de tandas de amasado, pedidos registrados con QR/transferencia, rendimiento de porciones y despacho de cajas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            href="/pedidos"
            className="inline-flex items-center gap-2 bg-stone-900 hover:bg-stone-800 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <ChefHat className="h-4 w-4 text-amber-400" />
            <span>Centro de Amasado</span>
          </Link>
          <Link
            href="/catalogo"
            className="inline-flex items-center gap-2 bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300 px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm active:scale-95"
          >
            <Package className="h-4 w-4 text-amber-800" />
            <span>Catálogo</span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. ALERTA DESTACADA: PEDIDOS PENDIENTES DE AMASADO */}
      {/* ============================================================== */}
      {pedidosPendientesAmasado.length > 0 && (
        <div className="bg-gradient-to-r from-amber-100 via-amber-50 to-stone-50 border-2 border-amber-400 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-amber-800 text-amber-100 rounded-2xl shadow-md">
              <ChefHat className="h-7 w-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <h3 className="text-base sm:text-lg font-serif font-bold text-amber-950">
                  ¡Hay {pedidosPendientesAmasado.length} {pedidosPendientesAmasado.length === 1 ? "pedido pendiente" : "pedidos pendientes"} de amasado!
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 mt-1">
                Totalizan <strong>{totalBandejasAmasar} bandejas/cajas</strong> que rinden{" "}
                <strong className="text-amber-900">{totalPorcionesEncargadas} porciones frescas</strong> a elaborar por encargo.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <Link
              href="/pedidos"
              className="w-full md:w-auto text-center shrink-0 bg-amber-800 hover:bg-amber-900 text-white text-xs font-bold px-6 py-3 rounded-2xl shadow-md transition-all active:scale-95"
            >
              Abrir Totalizador de Amasado & Rótulos →
            </Link>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. KPIS PRINCIPALES DEL MODELO DE FÁBRICA */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: VENTAS TOTALES CONFIRMADAS */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Ventas Confirmadas
            </span>
            <div className="p-2.5 bg-emerald-50 text-emerald-700 rounded-xl">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-2xl sm:text-3xl font-black text-stone-900">
              ${ventasTotales.toLocaleString("es-AR")}
            </div>
            <p className="text-[11px] text-stone-500 font-semibold mt-1">
              {pedidosValidos.length} pedidos confirmados en app
            </p>
          </div>
        </div>

        {/* KPI 2: PENDIENTES DE ELABORACIÓN */}
        <Link
          href="/pedidos"
          className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between hover:border-amber-400 hover:shadow-md transition-all group cursor-pointer"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Pendientes de Elaboración
            </span>
            <div className="p-2.5 bg-amber-50 group-hover:bg-amber-100 text-amber-800 rounded-xl transition-colors">
              <ChefHat className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-2xl sm:text-3xl font-black text-amber-800">
              {pedidosPendientesAmasado.length}
            </div>
            <p className="text-[11px] text-amber-700 font-semibold mt-1">
              {totalBandejasAmasar} cajas por armar
            </p>
          </div>
        </Link>

        {/* KPI 3: TOTAL DE PORCIONES ENCARGADAS */}
        <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex flex-col justify-between hover:border-amber-400 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-400 uppercase tracking-wider">
              Porciones Encargadas
            </span>
            <div className="p-2.5 bg-stone-100 text-stone-800 rounded-xl">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="font-serif text-2xl sm:text-3xl font-black text-stone-900">
              {totalPorcionesEncargadas}
            </div>
            <p className="text-[11px] text-stone-500 font-semibold mt-1">
              Rendimiento en tandas activas
            </p>
          </div>
        </div>

        {/* KPI 4: ALERTAS DE STOCK BAJO */}
        <Link
          href="/catalogo"
          className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between transition-all group cursor-pointer ${
            productosStockBajo.length > 0
              ? "bg-amber-50/70 border-amber-300 hover:border-amber-500"
              : "bg-white border-stone-200 hover:border-amber-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Alertas de Stock
            </span>
            <div
              className={`p-2.5 rounded-xl ${
                productosStockBajo.length > 0
                  ? "bg-amber-200 text-amber-900"
                  : "bg-stone-100 text-stone-600"
              }`}
            >
              <AlertTriangle className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3">
            <div
              className={`font-serif text-2xl sm:text-3xl font-black ${
                productosStockBajo.length > 0 ? "text-amber-900" : "text-stone-900"
              }`}
            >
              {productosStockBajo.length}
            </div>
            <p className="text-[11px] text-stone-600 font-semibold mt-1">
              {productosStockBajo.length > 0
                ? "Variedades críticas (≤ 5 u.)"
                : "Stock en niveles saludables"}
            </p>
          </div>
        </Link>
      </div>

      {/* ============================================================== */}
      {/* 4. PANEL DE ACCESOS DIRECTOS RÁPIDOS (GESTIÓN EJECUTIVA) */}
      {/* ============================================================== */}
      <div className="bg-stone-900 text-white rounded-3xl p-6 sm:p-7 shadow-lg border border-stone-800">
        <div className="flex items-center justify-between border-b border-stone-800 pb-4 mb-5">
          <div className="flex items-center gap-2.5">
            <Sparkles className="h-5 w-5 text-amber-400" />
            <h2 className="font-serif text-lg font-bold text-white">
              Centro de Acceso Rápido & Operaciones
            </h2>
          </div>
          <span className="text-xs font-bold text-amber-300 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
            Fábrica Activa
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* ACCESO 1: TOTALIZADOR DE AMASADO */}
          <Link
            href="/pedidos"
            className="group p-4 rounded-2xl bg-stone-800/80 hover:bg-amber-900/60 border border-stone-700 hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <ChefHat className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors">
                Totalizador de Amasado
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Calculadora de harina, sémola, huevos y rótulos de despacho para cocina.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 mt-4 flex items-center gap-1">
              <span>Abrir Cocina</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* ACCESO 2: GESTIÓN DE CATÁLOGO & FOTOS */}
          <Link
            href="/catalogo"
            className="group p-4 rounded-2xl bg-stone-800/80 hover:bg-amber-900/60 border border-stone-700 hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Package className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors">
                Catálogo & Fotos Reales
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Subida de fotos desde tu dispositivo, cambio de precios y stock de tanda.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 mt-4 flex items-center gap-1">
              <span>Gestionar Catálogo</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* ACCESO 3: DESCARGA DE MENÚ QR */}
          <Link
            href="/qr"
            className="group p-4 rounded-2xl bg-stone-800/80 hover:bg-amber-900/60 border border-stone-700 hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <QrCode className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors">
                Descarga de Menú QR
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Descarga de código QR en alta resolución con logo para mostrador o folletos.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 mt-4 flex items-center gap-1">
              <span>Generar y Descargar QR</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>

          {/* ACCESO 4: GESTIÓN DE PEDIDOS & DESPACHO */}
          <Link
            href="/pedidos"
            className="group p-4 rounded-2xl bg-stone-800/80 hover:bg-amber-900/60 border border-stone-700 hover:border-amber-400 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <Truck className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-sm text-white group-hover:text-amber-200 transition-colors">
                Gestión de Pedidos & WhatsApp
              </h3>
              <p className="text-xs text-stone-400 mt-1 leading-relaxed">
                Estados de pedidos, envíos por delivery, retiros en fábrica y mensajes de aviso.
              </p>
            </div>
            <span className="text-xs font-bold text-amber-400 mt-4 flex items-center gap-1">
              <span>Ver Pedidos</span>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </div>

      {/* ============================================================== */}
      {/* 5. RANKING DE LAS PASTAS MÁS PEDIDAS & CARD DE TANDA ACTIVA */}
      {/* ============================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* RANKING TOP 5 PASTAS (7 columnas) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-3xl border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                <Award className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-stone-900">
                  Ranking de las Pastas Más Pedidas
                </h3>
                <p className="text-xs text-stone-500">
                  Variedades de mayor demanda artesanal según pedidos registrados
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200 hidden sm:inline">
              Top 5 Favoritas
            </span>
          </div>

          {rankingPastas.length === 0 ? (
            <div className="py-8 text-center text-xs text-stone-400">
              Aún no hay pedidos suficientes para calcular el ranking.
            </div>
          ) : (
            <div className="space-y-4">
              {rankingPastas.map((pasta, idx) => {
                const percent = Math.round((pasta.unidades / maxUnidades) * 100);
                return (
                  <div key={pasta.nombre} className="space-y-1.5">
                    <div className="flex items-baseline justify-between text-xs">
                      <span className="font-bold text-stone-900 flex items-center gap-2">
                        <span className="text-amber-800 font-mono text-[11px] font-black">
                          #{idx + 1}
                        </span>
                        {pasta.nombre}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-stone-500 text-[11px]">
                          {pasta.porciones} porc.
                        </span>
                        <strong className="text-stone-900 font-mono">
                          {pasta.unidades} {pasta.unidades === 1 ? "caja" : "cajas"}
                        </strong>
                      </div>
                    </div>

                    {/* Barra de progreso visual */}
                    <div className="h-2 w-full rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-700 transition-all duration-700"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ACCESOS DIRECTOS Y CONTROL DE TEXTOS/CONFIGURACIÓN (5 columnas) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Card Tanda Activa y Datos de Pago */}
          <div className="bg-gradient-to-br from-[#2C1810] to-[#1F120B] text-white p-6 rounded-3xl shadow-md space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30">
                Tanda de Amasado Actual
              </span>
              <Calendar className="h-4 w-4 text-amber-300" />
            </div>

            <div>
              <h4 className="font-serif text-xl font-bold text-white">
                {config.proxima_tanda_fecha || "Próximo Viernes"}
              </h4>
              <p className="text-xs text-stone-300 mt-1 leading-relaxed">
                {config.dias_elaboracion || "Elaboración fresca por encargo. Cierre de pedidos 24hs antes."}
              </p>
            </div>

            <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
              <span className="text-stone-400">
                Alias: <strong className="text-amber-200">{config.mercado_pago_alias || "miapastabella.mp"}</strong>
              </span>
              <Link
                href="/textos"
                className="text-amber-300 hover:text-white font-bold flex items-center gap-1 transition-colors"
              >
                <span>Editar</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
          </div>

          {/* Card Rótulo y Etiquetas de Despacho */}
          <div className="bg-white p-5 rounded-3xl border border-stone-200 shadow-sm flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-amber-100 text-amber-900 rounded-2xl">
                <Printer className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-stone-900">
                  Rótulos de Caja & Despacho
                </h4>
                <p className="text-[11px] text-stone-500">
                  Imprime etiquetas con fecha de vencimiento y cocción para cada pedido.
                </p>
              </div>
            </div>
            <Link
              href="/pedidos"
              className="shrink-0 p-2 text-stone-400 hover:text-amber-800 rounded-xl hover:bg-stone-50 transition-colors"
            >
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
