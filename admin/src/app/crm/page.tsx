import React from "react";
import { getClientes, getProveedores } from "@/lib/db";
import { createCustomerAction } from "@/app/actions";
import { Users, Truck, UserPlus, Phone, Mail, MapPin } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CrmPage() {
  const [clientes, proveedores] = await Promise.all([
    getClientes(),
    getProveedores(),
  ]);

  return (
    <div className="max-w-6xl space-y-8">
      {/* HEADER */}
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
          <Users className="h-4 w-4" />
          <span>Gestión de Clientes y Proveedores</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          CRM & Proveedores de Insumos
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Historial de clientes frecuentes, preferencias de pastas y control de entregas de insumos.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* FORMULARIO NUEVO CLIENTE */}
        <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <UserPlus className="h-4 w-4 text-amber-700" />
            Registrar Nuevo Cliente
          </h3>

          <form action={createCustomerAction} className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Nombre Completo</label>
              <input
                type="text"
                name="nombre"
                placeholder="Ej: Carolina Rossi"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Teléfono / WhatsApp</label>
              <input
                type="text"
                name="telefono"
                placeholder="+54911..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Email (Opcional)</label>
              <input
                type="email"
                name="email"
                placeholder="cliente@email.com"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Dirección de Entrega</label>
              <input
                type="text"
                name="direccion"
                placeholder="Calle y altura, piso/depto"
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">Notas y Preferencias</label>
              <textarea
                name="notas"
                rows={2}
                placeholder="Ej: Prefiere masa al huevo sin sal agregada..."
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-xs focus:border-amber-600 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-800 text-white py-2.5 rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Guardar Cliente
            </button>
          </form>
        </div>

        {/* LISTADO DE CLIENTES */}
        <div className="lg:col-span-2 space-y-4">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-700" />
            Clientes Registrados ({clientes.length})
          </h3>

          <div className="space-y-3">
            {clientes.length === 0 && (
              <div className="bg-white p-8 rounded-2xl border border-gray-200 text-center text-xs text-gray-400">
                Aún no hay clientes registrados. ¡Agregá el primero!
              </div>
            )}
            {clientes.map((cli) => (
              <div
                key={cli.id}
                className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <h4 className="font-bold text-gray-900 text-sm">{cli.nombre}</h4>
                  <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                    <span className="flex items-center gap-1">
                      <Phone className="h-3.5 w-3.5 text-gray-400" />
                      {cli.telefono}
                    </span>
                    {cli.email && (
                      <span className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-gray-400" />
                        {cli.email}
                      </span>
                    )}
                    {cli.direccion && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-gray-400" />
                        {cli.direccion}
                      </span>
                    )}
                  </div>
                  {cli.notas && (
                    <p className="text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg mt-2 inline-block">
                      💡 {cli.notas}
                    </p>
                  )}
                </div>

                <div className="text-right sm:border-l sm:border-gray-100 sm:pl-4">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">
                    Total Compras
                  </span>
                  <span className="font-bold text-gray-900 text-base">
                    ${cli.total_compras.toLocaleString("es-AR")}
                  </span>
                  <span className="text-[11px] text-gray-500 block">
                    {cli.cantidad_pedidos} pedidos
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* SECCIÓN DE PROVEEDORES */}
      <div className="pt-6 border-t border-gray-200 space-y-4">
        <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
          <Truck className="h-4 w-4 text-amber-700" />
          Proveedores de Insumos ({proveedores.length})
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proveedores.map((prov) => (
            <div
              key={prov.id}
              className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-gray-900 text-sm">{prov.razon_social}</h4>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full">
                  {prov.rubro}
                </span>
              </div>
              <p className="text-xs text-gray-600">Contacto: {prov.contacto} • {prov.telefono}</p>
              <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                <span>Días entrega: <strong>{prov.dias_entrega}</strong></span>
                <span>Pago: <strong>{prov.condiciones_pago}</strong></span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
