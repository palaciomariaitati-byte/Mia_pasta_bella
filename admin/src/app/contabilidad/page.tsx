import React from "react";
import { getAsientosContables } from "@/lib/db";
import { createAccountingEntryAction } from "@/app/actions";
import { BookOpenCheck, DollarSign, PlusCircle, Scale } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ContabilidadPage() {
  const asientos = await getAsientosContables();

  const totalDebe = asientos.reduce((acc, a) => acc + (a.debe_monto || 0), 0);
  const totalHaber = asientos.reduce((acc, a) => acc + (a.haber_monto || 0), 0);
  const diferencia = totalDebe - totalHaber;

  return (
    <div className="max-w-6xl space-y-8">
      {/* HEADER */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
          <BookOpenCheck className="h-4 w-4" />
          <span>Libro Diario y Partida Doble</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          Panel Contable y Asientos
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Control de ventas diarias, ingresos de caja y balance cuadrado de partida doble (Debe = Haber) conectado a PostgreSQL / Supabase.
        </p>
      </div>

      {/* BALANCE SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Total Imputado al DEBE</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">
            ${totalDebe.toLocaleString("es-AR")}
          </div>
          <span className="text-[11px] text-gray-400">Activos e Ingresos de Caja</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm">
          <span className="text-xs text-gray-500 font-medium">Total Imputado al HABER</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">
            ${totalHaber.toLocaleString("es-AR")}
          </div>
          <span className="text-[11px] text-gray-400">Ventas y Salidas de Stock</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs text-gray-500 font-medium">Estado del Balance</span>
            <div
              className={`text-lg font-bold mt-1 flex items-center gap-1.5 ${
                diferencia === 0 ? "text-emerald-600" : "text-amber-600"
              }`}
            >
              <Scale className="h-5 w-5" />
              <span>{diferencia === 0 ? "Cuadrado" : "Diferencia detectada"}</span>
            </div>
            <span className="text-[11px] text-gray-400">
              Diferencia: ${diferencia.toLocaleString("es-AR")}
            </span>
          </div>
        </div>
      </div>

      {/* FORMULARIO NUEVO ASIENTO */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <PlusCircle className="h-4 w-4 text-amber-700" />
          Registrar Asiento Contable Manual
        </h3>

        <form action={createAccountingEntryAction} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-gray-700 mb-1">Concepto / Glosa</label>
            <input
              type="text"
              name="glosa"
              placeholder="Ej: Cobro de ventas fin de semana por mostrador"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Cuenta DEBE</label>
            <select
              name="debe_cuenta"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
              required
            >
              <option value="1.1.01 Caja y Efectivo">1.1.01 Caja y Efectivo</option>
              <option value="1.1.02 Bancos / Mercado Pago">1.1.02 Bancos / MP</option>
              <option value="1.1.05 Inventario Materias Primas">1.1.05 Inventario MP</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Cuenta HABER</label>
            <select
              name="haber_cuenta"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
              required
            >
              <option value="4.1.01 Ventas de Pastas y Pre-pizzas">4.1.01 Ventas</option>
              <option value="1.1.01 Caja y Efectivo">1.1.01 Caja</option>
              <option value="2.1.01 Proveedores por Pagar">2.1.01 Proveedores</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Monto Balanceado ($ ARS)</label>
            <input
              type="number"
              name="monto"
              placeholder="50000"
              className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
              required
            />
          </div>

          <div className="sm:col-span-3 flex items-end">
            <button
              type="submit"
              className="bg-amber-700 hover:bg-amber-800 text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Asentar Movimiento
            </button>
          </div>
        </form>
      </div>

      {/* LIBRO DIARIO DE ASIENTOS */}
      <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-200 flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">
            Libro Diario ({asientos.length} Asientos Registrados)
          </h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="py-3 px-4 font-bold">N° Asiento</th>
                <th className="py-3 px-4 font-bold">Fecha</th>
                <th className="py-3 px-4 font-bold">Glosa / Concepto</th>
                <th className="py-3 px-4 font-bold">Debe (Cuenta / Monto)</th>
                <th className="py-3 px-4 font-bold">Haber (Cuenta / Monto)</th>
                <th className="py-3 px-4 font-bold text-center">Tipo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {asientos.map((asiento) => (
                <tr key={asiento.id} className="hover:bg-gray-50/60">
                  <td className="py-3 px-4 font-bold text-gray-900">#{asiento.numero}</td>
                  <td className="py-3 px-4 text-gray-600">{asiento.fecha}</td>
                  <td className="py-3 px-4 text-gray-800 font-medium">{asiento.glosa}</td>
                  <td className="py-3 px-4 text-emerald-700 font-semibold">
                    {asiento.debe_cuenta}
                    <span className="block font-bold">${asiento.debe_monto.toLocaleString("es-AR")}</span>
                  </td>
                  <td className="py-3 px-4 text-blue-700 font-semibold">
                    {asiento.haber_cuenta}
                    <span className="block font-bold">${asiento.haber_monto.toLocaleString("es-AR")}</span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        asiento.es_automatico
                          ? "bg-purple-50 text-purple-700 border border-purple-200"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {asiento.es_automatico ? "Auto Venta" : "Manual"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
