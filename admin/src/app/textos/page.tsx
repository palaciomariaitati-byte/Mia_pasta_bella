import React from "react";
import { getConfiguracion } from "@/lib/db";
import { updateConfigAction } from "@/app/actions";
import { Save, FileText } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function TextosEditorPage() {
  const config = await getConfiguracion();

  return (
    <div className="max-w-4xl space-y-6">
      <div className="border-b border-gray-200 pb-5">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-amber-700">
          <FileText className="h-4 w-4" />
          <span>Control Total de Contenido Dinámico</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mt-1">
          Editor de Textos y Copywriting de la Tienda
        </h1>
        <p className="text-xs text-gray-500 mt-1">
          Edita los textos exactos que se visualizan en la portada y el footer del sitio público. Al presionar &quot;Guardar Cambios&quot;, la tienda pública se actualiza automáticamente desde Supabase.
        </p>
      </div>

      <form action={updateConfigAction} className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-200 shadow-sm space-y-6">
        {/* BLOQUE 1: NOMBRE Y SLOGAN PRINCIPAL */}
        <div className="space-y-4 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            1. Identidad y Slogan Principal
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Nombre de la Tienda
            </label>
            <input
              type="text"
              name="nombre_tienda"
              defaultValue={config.nombre_tienda}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Slogan Principal (Hero y Footer)
            </label>
            <input
              type="text"
              name="slogan_principal"
              defaultValue={config.slogan_principal}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Ejemplo: &quot;Pastas Frescas de Autor - Pastas artesanales de autor con tradición y pasión&quot;
            </p>
          </div>
        </div>

        {/* BLOQUE 2: NUESTRAS VARIEDADES */}
        <div className="space-y-4 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            2. Bloque de Variedades en Footer
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Texto de Nuestras Variedades
            </label>
            <textarea
              name="variedades_texto"
              rows={3}
              defaultValue={config.variedades_texto}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none leading-relaxed"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Ejemplo: &quot;Nuestras Variedades: Tallarines y Cintas al Huevo, Sorrentinos Gourmet Rellenos, Ravioles Tradicionales Caseros, Ñoquis Livianos Soufflé...&quot;
            </p>
          </div>
        </div>

        {/* BLOQUE 3: ATENCIÓN AL CLIENTE */}
        <div className="space-y-4 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            3. Datos de Atención al Cliente
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Línea de Atención al Cliente (Dirección, Horarios, Teléfono, Correo)
            </label>
            <textarea
              name="atencion_cliente"
              rows={3}
              defaultValue={config.atencion_cliente}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none leading-relaxed"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Ejemplo: &quot;Atención al Cliente: Av. de los Sabores 450, Buenos Aires | Martes a Domingos: 10:00 a 20:30 hs | +5491155551234&quot;
            </p>
          </div>
        </div>

        {/* BLOQUE 4: COMPROMISO DE CALIDAD */}
        <div className="space-y-4 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            4. Compromiso de Calidad Artesanal
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">
              Párrafo de Compromiso de Calidad
            </label>
            <textarea
              name="compromiso_calidad"
              rows={4}
              defaultValue={config.compromiso_calidad}
              className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none leading-relaxed"
              required
            />
            <p className="text-[11px] text-gray-400 mt-1">
              Ejemplo: &quot;Compromiso de Calidad: Elaborado en el día. Sin conservantes, aditivos ni colorantes...&quot;
            </p>
          </div>
        </div>

        {/* BLOQUE 5: TANDAS DE ELABORACIÓN SEMANAL Y CORTO VENCIMIENTO */}
        <div className="space-y-4 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            5. Tandas de Producción Semanal (Fábrica)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Días de Elaboración Semanales (separados por coma)
              </label>
              <input
                type="text"
                name="dias_elaboracion"
                defaultValue={config.dias_elaboracion || "Jueves, Viernes y Domingos"}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                placeholder="Ej: Jueves, Viernes y Domingos"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Aparecerán como botones de selección de tanda en el checkout del cliente.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Próxima Tanda Fresca Destacada
              </label>
              <input
                type="text"
                name="proxima_tanda_fecha"
                defaultValue={config.proxima_tanda_fecha || "Viernes 17 de Octubre"}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                placeholder="Ej: Viernes 17 de Octubre"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                Se muestra en la cabecera del catálogo como fecha de amasado inmediata.
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Aviso de Cierre de Pedidos
              </label>
              <input
                type="text"
                name="cierre_pedidos_info"
                defaultValue={config.cierre_pedidos_info || "Tomamos pedidos hasta el Miércoles a las 20:00 hs"}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                placeholder="Ej: Tomamos pedidos hasta el Miércoles a las 20:00 hs"
                required
              />
            </div>
          </div>
        </div>

        {/* BLOQUE 6: DATOS DE COBRO INMEDIATO (QR, MERCADO PAGO Y TRANSFERENCIA) */}
        <div className="space-y-4 border-b border-gray-100 pb-6">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-600" />
            6. Cobros Inmediatos: QR, Mercado Pago y Transferencias
          </h3>
          <p className="text-xs text-gray-500">
            Estos datos se mostrarán en la pantalla final de confirmación para que el cliente pague de inmediato.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Alias de Mercado Pago / Banco
              </label>
              <input
                type="text"
                name="mercado_pago_alias"
                defaultValue={config.mercado_pago_alias || "MIAPASTABELLA.MP"}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none font-mono"
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                El cliente tendrá un botón de 1 clic para copiar el alias.
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                CBU / CVU Bancario
              </label>
              <input
                type="text"
                name="cbu_cuenta"
                defaultValue={config.cbu_cuenta || "0000003100012345678901"}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Titular de la Cuenta
              </label>
              <input
                type="text"
                name="titular_cuenta"
                defaultValue={config.titular_cuenta || "Mía Pasta Bella - Fábrica Artesanal"}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Link de Pago Directo de Mercado Pago
              </label>
              <input
                type="url"
                name="link_pago_mercado_pago"
                defaultValue={config.link_pago_mercado_pago || "https://link.mercadopago.com.ar/miapastabella"}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                placeholder="https://link.mercadopago.com.ar/..."
                required
              />
              <p className="text-[11px] text-gray-400 mt-1">
                El botón &quot;Pagar con Mercado Pago&quot; abrirá este enlace directamente.
              </p>
            </div>
          </div>
        </div>

        {/* BLOQUE 7: REDES SOCIALES Y GEOLOCALIZACIÓN */}
        <div className="space-y-4 pb-2">
          <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-amber-600" />
            7. Canales de Contacto y Enlaces Dinámicos
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Número de WhatsApp (con código de país)
              </label>
              <input
                type="text"
                name="whatsapp_numero"
                defaultValue={config.whatsapp_numero}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                URL de Facebook
              </label>
              <input
                type="url"
                name="facebook_url"
                defaultValue={config.facebook_url}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                URL de Instagram
              </label>
              <input
                type="url"
                name="instagram_url"
                defaultValue={config.instagram_url}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-700 mb-1">
                Enlace de Google Maps (Icono móvil)
              </label>
              <input
                type="url"
                name="google_maps_url"
                defaultValue={config.google_maps_url}
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm focus:border-amber-600 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* BOTÓN GUARDAR */}
        <div className="pt-4 flex items-center justify-end">
          <button
            type="submit"
            className="inline-flex items-center gap-2 bg-amber-700 hover:bg-amber-800 text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95"
          >
            <Save className="h-4 w-4" />
            Guardar Cambios en la Tienda
          </button>
        </div>
      </form>
    </div>
  );
}
