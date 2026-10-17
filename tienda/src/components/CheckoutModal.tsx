"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  X,
  CheckCircle,
  Truck,
  Store,
  CreditCard,
  Banknote,
  Send,
  MessageCircle,
  Clock,
  Sparkles,
  ShoppingBag,
  Calendar,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  ShieldCheck,
  Utensils,
} from "lucide-react";
import { useCart } from "@/context/cart-context";
import { TiendaConfig } from "@/lib/db";
import { renderQRWithLogo } from "@/lib/qr-generator";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: TiendaConfig;
}

export function CheckoutModal({ isOpen, onClose, config }: CheckoutModalProps) {
  const { items, totalPrice, totalPorciones, clearCart } = useCart();

  const [tipoEntrega, setTipoEntrega] = useState<"retiro" | "delivery">("retiro");
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [direccion, setDireccion] = useState("");
  const [diaEntrega, setDiaEntrega] = useState<string>("");
  const [metodoPago, setMetodoPago] = useState<"efectivo" | "transferencia" | "mercado_pago">("mercado_pago");
  const [notas, setNotas] = useState("");
  const [loading, setLoading] = useState(false);
  const [copiedAlias, setCopiedAlias] = useState(false);
  const [copiedCbu, setCopiedCbu] = useState(false);

  const [pedidoConfirmado, setPedidoConfirmado] = useState<{
    numero: string;
    mensajeWhatsApp: string;
    monto: number;
    porciones: number;
    diaElegido: string;
  } | null>(null);

  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Días de tanda disponibles configurados en la fábrica
  const diasDisponibles = (config.dias_elaboracion || "Jueves, Viernes y Domingos")
    .split(/,|y|\//)
    .map((d) => d.trim())
    .filter(Boolean);

  useEffect(() => {
    if (diasDisponibles.length > 0 && !diaEntrega) {
      setDiaEntrega(diasDisponibles[0]);
    }
  }, [config.dias_elaboracion, diaEntrega]);

  // Renderizar QR de pago al confirmar pedido
  useEffect(() => {
    if (!pedidoConfirmado || !qrCanvasRef.current) return;

    const paymentUrl =
      config.link_pago_mercado_pago ||
      `https://link.mercadopago.com.ar/${config.mercado_pago_alias || "miapastabella"}`;

    renderQRWithLogo({
      canvas: qrCanvasRef.current,
      url: paymentUrl,
      size: 512,
      darkColor: "#2C1810",
      lightColor: "#FFFFFF",
      includeLogo: true,
      logoSrc: "/images/logo.jpg",
      logoSizePercent: 22,
    }).catch((err) => console.error("Error al renderizar QR de cobro:", err));
  }, [pedidoConfirmado, config.link_pago_mercado_pago, config.mercado_pago_alias]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        cliente_nombre: nombre,
        cliente_telefono: telefono,
        cliente_direccion: tipoEntrega === "delivery" ? direccion : "Retiro en Fábrica",
        tipo_entrega: tipoEntrega,
        dia_entrega: diaEntrega,
        total_porciones: totalPorciones,
        metodo_pago: metodoPago,
        notas,
        items: items.map((it) => ({
          producto_id: it.id,
          nombre: it.nombre,
          precio: it.precio,
          cantidad: it.cantidad,
        })),
        total: totalPrice,
      };

      const res = await fetch("/api/pedidos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      const numPedido = data.numero_pedido || `PED-${Date.now().toString().slice(-4)}`;

      // Armar mensaje estructurado de WhatsApp para la fábrica
      let msg = `🍝 *NUEVO ENCARGO ${numPedido} — MIA PASTA BELLA*\n`;
      msg += `👤 *Cliente:* ${nombre}\n`;
      msg += `📞 *Teléfono:* ${telefono}\n`;
      msg += `📅 *Tanda de Elaboración:* ${diaEntrega}\n`;
      msg += `🚀 *Modalidad:* ${tipoEntrega === "delivery" ? `🏠 Delivery a ${direccion}` : "🏪 Retiro en Fábrica"}\n`;
      msg += `💳 *Método de Pago:* ${metodoPago.toUpperCase()}\n`;
      msg += `👥 *Total Porciones:* ${totalPorciones} porciones\n`;
      if (notas.trim()) msg += `📝 *Notas:* ${notas.trim()}\n`;
      msg += `\n*Detalle de Variedades Frescas:*\n`;
      items.forEach((it) => {
        msg += `• ${it.cantidad}x ${it.nombre} ($${(it.precio * it.cantidad).toLocaleString("es-AR")})\n`;
      });
      msg += `\n💰 *TOTAL A ABONAR: $${totalPrice.toLocaleString("es-AR")}*\n\n`;
      msg += `_Elaboración artesanal de pastas frescas sin conservantes. ¡Muchas gracias por tu pedido!_`;

      setPedidoConfirmado({
        numero: numPedido,
        mensajeWhatsApp: msg,
        monto: totalPrice,
        porciones: totalPorciones,
        diaElegido: diaEntrega,
      });

      clearCart();
    } catch (err) {
      console.error("Error al registrar pedido:", err);
      alert("Hubo un inconveniente al registrar el pedido. Puedes enviarlo directamente por WhatsApp.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWhatsApp = () => {
    if (!pedidoConfirmado) return;
    const telLimpio = config.whatsapp_numero.replace(/[^0-9]/g, "");
    const url = `https://wa.me/${telLimpio}?text=${encodeURIComponent(
      pedidoConfirmado.mensajeWhatsApp
    )}`;
    window.open(url, "_blank");
  };

  const handleOpenPaymentLink = () => {
    const link =
      config.link_pago_mercado_pago ||
      `https://link.mercadopago.com.ar/${config.mercado_pago_alias || "miapastabella"}`;
    window.open(link, "_blank");
  };

  const copyToClipboard = (text: string, type: "alias" | "cbu") => {
    navigator.clipboard.writeText(text);
    if (type === "alias") {
      setCopiedAlias(true);
      setTimeout(() => setCopiedAlias(false), 2000);
    } else {
      setCopiedCbu(true);
      setTimeout(() => setCopiedCbu(false), 2000);
    }
  };

  const aliasActual = config.mercado_pago_alias || "MIAPASTABELLA.MP";
  const cbuActual = config.cbu_cuenta || "0000003100012345678901";
  const titularActual = config.titular_cuenta || "Mía Pasta Bella - Fábrica Artesanal";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#FAF6EE] shadow-2xl border border-amber-900/20 overflow-hidden my-4 sm:my-6">
        {/* CABECERA */}
        <div className="flex items-center justify-between border-b border-stone-200 bg-white px-5 sm:px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600 animate-pulse" />
            <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810]">
              {pedidoConfirmado ? "¡Encargo Registrado con Éxito!" : "Encargo a la Fábrica de Pastas"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-500 hover:bg-stone-100 hover:text-stone-800 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================================== */}
        {/* PANTALLA 2: PEDIDO CONFIRMADO CON QR Y LINK DE PAGO INMEDIATO */}
        {/* =================================================================== */}
        {pedidoConfirmado ? (
          <div className="p-5 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto">
            {/* ENCABEZADO DE ÉXITO */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50 mb-1">
                <CheckCircle className="h-9 w-9" />
              </div>

              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 bg-amber-100 border border-amber-300 px-3 py-0.5 rounded-full">
                  Comprobante: {pedidoConfirmado.numero}
                </span>
                <h4 className="text-2xl font-serif font-black text-[#2C1810] mt-2">
                  ¡Gracias por tu encargo, {nombre}!
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Tu orden fue ingresada en la tanda de elaboración fresca del{" "}
                  <strong className="text-amber-900">{pedidoConfirmado.diaElegido}</strong>.
                </p>
              </div>
            </div>

            {/* CAJA DE IMPORTE SEGÚN CANTIDAD DE PORCIONES */}
            <div className="p-4 bg-gradient-to-br from-amber-900 to-amber-950 text-white rounded-2xl shadow-md space-y-2">
              <div className="flex justify-between items-center text-amber-200/90 text-xs">
                <span>Rinde Total:</span>
                <span className="font-bold text-white bg-amber-800/60 px-2 py-0.5 rounded-md">
                  {pedidoConfirmado.porciones} porciones artesanales
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-1 border-t border-amber-800/60">
                <span className="text-xs font-semibold text-amber-100 uppercase tracking-wider">
                  Total a Abonar:
                </span>
                <span className="font-serif text-3xl font-black text-amber-300">
                  ${pedidoConfirmado.monto.toLocaleString("es-AR")}
                </span>
              </div>
              <p className="text-[10px] text-amber-200/80 text-center pt-1">
                ⏱️ Pastas frescas al día sin conservantes · Caducidad: 72 hs en heladera / 90 días en freezer
              </p>
            </div>

            {/* SECCIÓN DE COBRO: QR Y LINK DE PAGO DIRECTO */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-stone-200 shadow-sm space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-800 uppercase tracking-wider">
                  <QrCode className="h-4 w-4" />
                  <span>Escanea o Paga Directo</span>
                </div>
                <h5 className="text-sm font-bold text-stone-900">
                  Código QR de Cobro & Link Directo
                </h5>
                <p className="text-[11px] text-stone-500">
                  Escaneá con la cámara de tu celular, Mercado Pago o cualquier app bancaria
                </p>
              </div>

              {/* QR Canvas */}
              <div className="flex flex-col items-center justify-center">
                <div className="p-2.5 bg-white border-2 border-stone-200 rounded-2xl shadow-inner max-w-[200px]">
                  <canvas
                    ref={qrCanvasRef}
                    className="w-44 h-44 object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>

              {/* Botón Pagar con Mercado Pago / Link de Pago */}
              <button
                type="button"
                onClick={handleOpenPaymentLink}
                className="w-full inline-flex items-center justify-center gap-2 bg-[#009EE3] hover:bg-[#0089C7] text-white font-bold py-3 px-4 rounded-xl text-xs sm:text-sm shadow-md transition-all active:scale-98"
              >
                <Sparkles className="h-4 w-4" />
                <span>Pagar con Mercado Pago (Link Directo)</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-80" />
              </button>

              {/* Datos de Transferencia con botón Copiar */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold text-stone-400 uppercase">
                      Alias de Pago:
                    </span>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {aliasActual}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(aliasActual, "alias")}
                    className="inline-flex items-center gap-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                  >
                    {copiedAlias ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-stone-500" />
                        <span>Copiar Alias</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="flex items-center justify-between border-t border-stone-200 pt-2">
                  <div>
                    <span className="block text-[10px] font-bold text-stone-400 uppercase">
                      CBU / CVU:
                    </span>
                    <span className="font-mono text-stone-700 text-xs">
                      {cbuActual}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(cbuActual, "cbu")}
                    className="inline-flex items-center gap-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all active:scale-95"
                  >
                    {copiedCbu ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700 font-bold">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-stone-500" />
                        <span>Copiar CBU</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-stone-200 pt-1.5 text-[11px] text-stone-500">
                  <span className="font-semibold text-stone-700">Titular:</span> {titularActual}
                </div>
              </div>
            </div>

            {/* BOTÓN WHATSAPP PARA ENVIAR COMPROBANTE A LA FÁBRICA */}
            <div className="space-y-2 pt-1">
              <button
                onClick={handleOpenWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-900/10 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5 fill-current" />
                <span>Enviar Comprobante por WhatsApp a la Fábrica</span>
              </button>

              <button
                onClick={onClose}
                className="w-full text-xs font-semibold text-stone-500 hover:text-stone-800 py-1.5"
              >
                Cerrar y continuar en la tienda
              </button>
            </div>
          </div>
        ) : (
          /* =================================================================== */
          /* PANTALLA 1: FORMULARIO DE ENCARGO CON PORCIONES Y FECHA DE TANDA    */
          /* =================================================================== */
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto">
            {/* AVISO DE FRESCA ELABORACIÓN & TANDAS */}
            <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3">
              <Sparkles className="h-5 w-5 text-amber-700 shrink-0 mt-0.5" />
              <div className="text-xs text-amber-900 leading-relaxed">
                <strong className="block font-bold">Fábrica de Pastas Frescas de Autor</strong>
                <span>
                  Elaboramos bajo pedido para garantizar máxima frescura (sin conservantes). Consumo dentro de las 72 hs o congelado directo.
                </span>
              </div>
            </div>

            {/* 1. SELECCIÓN DE DÍA DE ELABORACIÓN / ENTREGA (TANDA SEMANAL) */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="h-3.5 w-3.5 text-amber-700" />
                <span>1. Elige tu Tanda de Amasado / Entrega</span>
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {diasDisponibles.map((dia) => {
                  const selected = diaEntrega === dia;
                  return (
                    <button
                      key={dia}
                      type="button"
                      onClick={() => setDiaEntrega(dia)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        selected
                          ? "border-amber-800 bg-amber-800 text-white font-bold shadow-sm"
                          : "border-stone-200 bg-white text-stone-700 hover:border-amber-400"
                      }`}
                    >
                      <span className="block text-xs font-extrabold capitalize">{dia}</span>
                      <span className={`text-[10px] block mt-0.5 ${selected ? "text-amber-200" : "text-stone-500"}`}>
                        Tanda Fresca
                      </span>
                    </button>
                  );
                })}
              </div>
              <p className="text-[11px] text-stone-500 mt-1.5">
                {config.cierre_pedidos_info || "Tomamos pedidos hasta 24 hs previas al amasado."}
              </p>
            </div>

            {/* 2. MODALIDAD DE ENTREGA */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-2">
                2. Modalidad de Retiro o Entrega
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTipoEntrega("retiro")}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                    tipoEntrega === "retiro"
                      ? "border-amber-700 bg-amber-50/80 ring-2 ring-amber-600/20 text-[#2C1810]"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <Store className="h-4 w-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold">Retiro en Fábrica</span>
                    <span className="text-[10px] text-stone-500">Sin costo de envío</span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setTipoEntrega("delivery")}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                    tipoEntrega === "delivery"
                      ? "border-amber-700 bg-amber-50/80 ring-2 ring-amber-600/20 text-[#2C1810]"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <Truck className="h-4 w-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold">Delivery a Domicilio</span>
                    <span className="text-[10px] text-stone-500">Coordinado en el día</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. DATOS DEL CLIENTE */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
                3. Tus Datos para el Pedido
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Nombre Completo *
                  </span>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Carolina Rossi"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Teléfono WhatsApp *
                  </span>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 11 5555 1234"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              </div>

              {tipoEntrega === "delivery" && (
                <div>
                  <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Dirección de Entrega y Barrio *
                  </span>
                  <input
                    type="text"
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    placeholder="Calle, número, timbre/piso y localidad"
                    required
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              )}
            </div>

            {/* 4. MÉTODO DE PAGO */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1.5">
                4. Método de Pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "mercado_pago", label: "Mercado Pago (QR/Link)", icon: Sparkles },
                  { id: "transferencia", label: "Transferencia / Alias", icon: CreditCard },
                  { id: "efectivo", label: "Efectivo", icon: Banknote },
                ].map((m) => {
                  const Icon = m.icon;
                  const selected = metodoPago === m.id;
                  return (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setMetodoPago(m.id as any)}
                      className={`flex flex-col items-center justify-center p-2.5 rounded-xl border text-center transition-all ${
                        selected
                          ? "border-amber-700 bg-amber-50 text-[#2C1810] font-bold shadow-xs"
                          : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                      }`}
                    >
                      <Icon className="h-4 w-4 mb-1 text-amber-700" />
                      <span className="text-[10px] leading-tight">{m.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. ACLARACIONES */}
            <div>
              <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider mb-1">
                5. Aclaraciones Especiales (Opcional)
              </label>
              <textarea
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Ej: Empaquetar en 2 bolsas separadas / Tocar timbre B..."
                rows={2}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
              />
            </div>

            {/* RESUMEN POR PORCIONES Y BOTÓN DE CONFIRMACIÓN */}
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <div className="flex justify-between items-center text-xs text-stone-600">
                <span>Rinde total del pedido:</span>
                <span className="font-bold text-amber-900 bg-amber-100 px-2 py-0.5 rounded-md">
                  {totalPorciones} porciones para la mesa
                </span>
              </div>

              <div className="flex justify-between items-baseline">
                <span className="text-xs font-bold text-stone-700 uppercase">Total a Abonar:</span>
                <span className="font-serif text-2xl font-black text-amber-900">
                  ${totalPrice.toLocaleString("es-AR")}
                </span>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-800 hover:bg-amber-900 disabled:opacity-50 text-white font-bold py-3.5 px-6 rounded-2xl text-xs sm:text-sm shadow-md transition-all active:scale-[0.98]"
              >
                {loading ? (
                  <span>Registrando encargo en la fábrica...</span>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    <span>Confirmar Encargo & Ver Datos de Pago</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
