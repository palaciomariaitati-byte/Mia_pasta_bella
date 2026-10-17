import React from "react";
import { getPedidosAdmin } from "@/lib/db";
import { updateOrderStatusAction } from "@/app/actions";
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
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function PedidosPage() {
  const pedidos = await getPedidosAdmin();

  const pendientes = pedidos.filter(
    (p) => p.estado === "pendiente" || p.estado === "confirmada"
  );
  const enPreparacion = pedidos.filter((p) => p.estado === "en_preparacion");
  const entregados = pedidos.filter((p) => p.estado === "entregada");

  return (
    <div className="max-w-6xl space-y-8">
      {/* HEADER */}
      <div className="border-b border-stone-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
          <ShoppingBag className="h-4 w-4" />
          <span>Control de Producción y Despachos</span>
        </div>
        <h1 className="text-2xl font-bold text-stone-900 mt-1">
          Gestión de Pedidos en Tiempo Real
        </h1>
        <p className="text-xs text-stone-500 mt-1">
          Visualiza, cambia de estado y comunícate de inmediato con los clientes que encargan desde la tienda pública.
        </p>
      </div>

      {/* METRIC CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500">Nuevos por Cocinar</span>
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
            <span className="text-[11px] text-stone-400">Armando bandejas</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center">
            <Package className="h-6 w-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-stone-500">Entregados / Listos</span>
            <div className="text-3xl font-extrabold text-emerald-700 mt-1">
              {entregados.length}
            </div>
            <span className="text-[11px] text-stone-400">Órdenes completadas</span>
          </div>
          <div className="h-12 w-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6" />
          </div>
        </div>
      </div>

      {/* LISTA DE PEDIDOS */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-stone-900 flex items-center gap-2">
          <span>Órdenes Recientes ({pedidos.length})</span>
        </h2>

        {pedidos.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl border border-stone-200 text-center space-y-3">
            <ShoppingBag className="h-12 w-12 text-stone-300 mx-auto" />
            <h3 className="text-base font-bold text-stone-700">Aún no hay pedidos registrados</h3>
            <p className="text-xs text-stone-500 max-w-sm mx-auto">
              Cuando un cliente agregue pastas a la canasta y confirme desde la tienda web, el pedido aparecerá aquí en tiempo real.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {pedidos.map((pedido) => {
              const telLimpio = pedido.cliente_telefono.replace(/[^0-9]/g, "");
              const mensajeWhatsApp = encodeURIComponent(
                `¡Hola ${pedido.cliente_nombre}! Te escribimos desde Mia Pasta Bella respecto a tu pedido #${pedido.numero_comprobante}. Queremos avisarte que...`
              );
              const waUrl = `https://wa.me/${telLimpio}?text=${mensajeWhatsApp}`;

              return (
                <div
                  key={pedido.id}
                  className="bg-white rounded-3xl border border-stone-200 p-6 shadow-sm space-y-4 flex flex-col justify-between"
                >
                  {/* Top info */}
                  <div>
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

                    {/* Cliente */}
                    <div className="pt-3 space-y-2 text-xs">
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-stone-900 text-sm">
                          {pedido.cliente_nombre}
                        </span>
                        <span className="text-amber-800 font-bold uppercase text-[10px] bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                          {pedido.metodo_pago}
                        </span>
                      </div>

                      {/* Tanda y Porciones Badge */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        {pedido.dia_entrega && (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-900 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-amber-300">
                            📅 Tanda: {pedido.dia_entrega}
                          </span>
                        )}
                        <span className="inline-flex items-center gap-1 bg-stone-100 text-stone-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-stone-300">
                          🍽️ {pedido.total_porciones || pedido.items.reduce((acc, it) => acc + (it.cantidad * 2), 0)} porciones
                        </span>
                      </div>

                      {pedido.cliente_telefono && (
                        <div className="flex items-center gap-1.5 text-stone-600 font-medium">
                          <Phone className="h-3.5 w-3.5 text-stone-400" />
                          <span>{pedido.cliente_telefono}</span>
                        </div>
                      )}

                      {pedido.notas_entrega && (
                        <div className="bg-amber-50/60 p-2.5 rounded-xl border border-amber-100/80 text-[11px] text-stone-700 mt-2">
                          <p className="font-medium flex items-start gap-1.5">
                            <Truck className="h-3.5 w-3.5 text-amber-700 flex-shrink-0 mt-0.5" />
                            <span>{pedido.notas_entrega}</span>
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Items */}
                    <div className="mt-4 pt-3 border-t border-stone-100">
                      <span className="text-[11px] font-bold uppercase text-stone-400 tracking-wider block mb-1.5">
                        Variedades Pedidas:
                      </span>
                      <ul className="space-y-1 text-xs text-stone-700">
                        {pedido.items.map((it) => (
                          <li key={it.id} className="flex justify-between items-center">
                            <span>
                              <strong>{it.cantidad}x</strong> {it.producto_nombre}
                            </span>
                            <span className="font-semibold text-stone-500">
                              ${it.subtotal.toLocaleString("es-AR")}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Bottom: total + cambiar estado */}
                  <div className="pt-4 border-t border-stone-100 space-y-3">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs font-bold text-stone-500 uppercase">Total a Cobrar:</span>
                      <span className="text-xl font-extrabold text-stone-900">
                        ${pedido.total.toLocaleString("es-AR")}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {/* Formulario cambio de estado rápido */}
                      <form action={updateOrderStatusAction} className="flex-1 flex gap-1.5">
                        <input type="hidden" name="id" value={pedido.id} />
                        <select
                          name="estado"
                          defaultValue={pedido.estado}
                          className="flex-1 rounded-xl border border-stone-300 text-xs px-2.5 py-2 font-medium bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                        >
                          <option value="confirmada">Confirmada</option>
                          <option value="en_preparacion">En Preparación</option>
                          <option value="entregada">Entregada / Listo</option>
                          <option value="cancelada">Cancelada</option>
                        </select>
                        <button
                          type="submit"
                          className="px-3 py-2 bg-stone-800 hover:bg-stone-900 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                        >
                          Actualizar
                        </button>
                      </form>

                      {/* Botón WhatsApp directo */}
                      {pedido.cliente_telefono && (
                        <a
                          href={waUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-xs"
                          title="Contactar al cliente por WhatsApp"
                        >
                          <MessageCircle className="h-3.5 w-3.5 fill-current" />
                          <span>WhatsApp</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
