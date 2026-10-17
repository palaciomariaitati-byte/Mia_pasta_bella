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
  Phone,
  Layers,
  ArrowRight,
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
  const [metodoPago, setMetodoPago] = useState<"transferencia" | "efectivo">("transferencia");
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
    modalidad: string;
    metodo: string;
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

  // Renderizar QR de transferencia bancaria al confirmar pedido
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
    }).catch((err) => console.error("Error al renderizar QR de transferencia:", err));
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
        metodo_pago: metodoPago === "transferencia" ? "transferencia" : "efectivo",
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
      const montoFinal = data.total_verificado || totalPrice;
      const porcionesFinal = data.porciones_verificadas || totalPorciones;

      // Mensaje estructurado de comanda para la fábrica
      let msg = `🍝 *NUEVO ENCARGO A FÁBRICA #${numPedido} — MIA PASTA BELLA*\n`;
      msg += `👤 *Cliente:* ${nombre}\n`;
      msg += `📞 *Teléfono:* ${telefono}\n`;
      msg += `📅 *Tanda de Amasado Fresco:* ${diaEntrega}\n`;
      msg += `📦 *Modalidad:* ${tipoEntrega === "delivery" ? `🏠 Delivery a ${direccion}` : "🏪 Retiro en Fábrica"}\n`;
      msg += `💳 *Pago Elegido:* ${metodoPago === "transferencia" ? "Transferencia Bancaria (QR/Alias/CBU)" : "Coordinar con vendedor / Al retirar"}\n`;
      msg += `👥 *Total de Porciones:* ${porcionesFinal} porciones\n`;
      if (notas.trim()) msg += `📝 *Aclaraciones:* ${notas.trim()}\n`;
      msg += `\n*Detalle de Variedades Frescas Encargadas:*\n`;
      items.forEach((it) => {
        msg += `• ${it.cantidad}x ${it.nombre} ($${(it.precio * it.cantidad).toLocaleString("es-AR")})\n`;
      });
      msg += `\n💰 *TOTAL DE LA COMPRA: $${montoFinal.toLocaleString("es-AR")}*\n\n`;
      msg += `_Pastas frescas sin conservantes · 72 hs en heladera / 90 días en freezer. ¡Muchas gracias!_`;

      setPedidoConfirmado({
        numero: numPedido,
        mensajeWhatsApp: msg,
        monto: montoFinal,
        porciones: porcionesFinal,
        diaElegido: diaEntrega,
        modalidad: tipoEntrega === "delivery" ? `Envío a domicilio (${direccion})` : "Retiro en Fábrica",
        metodo: metodoPago === "transferencia" ? "Transferencia (QR / Alias / CBU)" : "Coordinar con vendedor",
      });

      clearCart();
    } catch (err) {
      console.error("Error al registrar pedido:", err);
      alert("Hubo un inconveniente al registrar el pedido. Puedes enviarlo directamente al vendedor por WhatsApp.");
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
  const telefonoVendedor = config.whatsapp_numero || "+54 9 11 0000-0000";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-3 sm:p-4 overflow-y-auto animate-fade-in">
      <div className="relative w-full max-w-xl rounded-3xl bg-[#FAF6EE] shadow-2xl border border-amber-900/20 overflow-hidden my-4 sm:my-6">
        {/* CABECERA EDITORIAL DE FÁBRICA */}
        <div className="flex items-center justify-between border-b border-[#E6D8C3] bg-white px-5 sm:px-6 py-4 shadow-xs">
          <div className="flex items-center gap-2.5">
            <span className="h-3 w-3 rounded-full bg-amber-600 animate-pulse" />
            <div>
              <h3 className="font-serif text-lg sm:text-xl font-bold text-[#2C1810]">
                {pedidoConfirmado ? "¡Encargo Registrado en Fábrica!" : "Encargo de Pastas Frescas"}
              </h3>
              <span className="text-[10px] text-stone-500 font-medium block">
                Mía Pasta Bella · Producción Artesanal sin Conservantes
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-stone-400 hover:bg-stone-100 hover:text-stone-700 transition-colors"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* =================================================================== */}
        {/* PANTALLA 2: CONFIRMACIÓN, QR TRANSFERENCIA Y CONTACTO VENDEDOR     */}
        {/* =================================================================== */}
        {pedidoConfirmado ? (
          <div className="p-5 sm:p-7 space-y-5 max-h-[80vh] overflow-y-auto no-scrollbar">
            {/* ENCABEZADO DE ÉXITO */}
            <div className="text-center space-y-2">
              <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50 mb-1">
                <CheckCircle className="h-9 w-9" />
              </div>

              <div>
                <span className="text-xs font-black uppercase tracking-wider text-amber-950 bg-amber-100 border border-amber-300 px-3.5 py-1 rounded-full shadow-xs">
                  Encargo #{pedidoConfirmado.numero}
                </span>
                <h4 className="text-2xl font-serif font-black text-[#2C1810] mt-2.5">
                  ¡Encargo Confirmado, {nombre}!
                </h4>
                <p className="text-xs text-stone-600 max-w-md mx-auto mt-1 leading-relaxed">
                  Tu pedido ya quedó registrado para la tanda fresca del{" "}
                  <strong className="text-amber-900 font-bold">{pedidoConfirmado.diaElegido}</strong>.
                </p>
              </div>
            </div>

            {/* RESUMEN OFICIAL DE FÁBRICA: PORCIONES Y TOTAL */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-[#2C1810] via-[#3D2015] to-[#1E0F09] text-white rounded-2xl shadow-lg space-y-2.5 border border-amber-500/30">
              <div className="grid grid-cols-2 gap-2 text-xs border-b border-amber-500/20 pb-2.5">
                <div>
                  <span className="text-stone-400 text-[10px] block uppercase font-bold">Cliente</span>
                  <strong className="text-white text-xs">{nombre}</strong>
                </div>
                <div>
                  <span className="text-stone-400 text-[10px] block uppercase font-bold">Teléfono</span>
                  <strong className="text-white text-xs">{telefono}</strong>
                </div>
              </div>

              <div className="flex justify-between items-center text-amber-200 text-xs">
                <span>Total de Porciones:</span>
                <span className="font-bold text-white bg-amber-400/20 border border-amber-400/40 px-2.5 py-0.5 rounded-full">
                  🍽️ {pedidoConfirmado.porciones} porciones de autor
                </span>
              </div>

              <div className="flex justify-between items-baseline pt-1">
                <span className="text-xs font-bold text-amber-100 uppercase tracking-wider">
                  Total de la Compra:
                </span>
                <span className="font-serif text-3xl font-black text-amber-300">
                  ${pedidoConfirmado.monto.toLocaleString("es-AR")}
                </span>
              </div>

              <div className="pt-2 border-t border-amber-500/20 text-[10px] text-amber-200/80 flex items-center justify-between">
                <span>⏱️ Heladera: 72 hs</span>
                <span>❄️ Freezer: 90 días</span>
                <span>🌱 100% Sin aditivos</span>
              </div>
            </div>

            {/* SECCIÓN 1: PAGO POR TRANSFERENCIA CON QR Y DATOS BANCARIOS */}
            <div className="p-4 sm:p-5 bg-white rounded-2xl border border-[#E6D8C3] shadow-xs space-y-4">
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                  <QrCode className="h-4 w-4 text-amber-700" />
                  <span>Transferencia Inmediata</span>
                </div>
                <h5 className="font-serif text-base font-bold text-[#2C1810]">
                  QR de Pago & Datos Bancarios
                </h5>
                <p className="text-[11px] text-stone-500">
                  Escaneá desde tu app bancaria / Mercado Pago o transferí con Alias/CBU:
                </p>
              </div>

              {/* QR en Canvas */}
              <div className="flex flex-col items-center justify-center">
                <div className="p-2.5 bg-white border-2 border-[#E6D8C3] rounded-2xl shadow-inner max-w-[190px]">
                  <canvas
                    ref={qrCanvasRef}
                    className="w-40 h-40 object-contain"
                    style={{ imageRendering: "pixelated" }}
                  />
                </div>
              </div>

              {/* Datos de Transferencia con botón de copia en 1 toque */}
              <div className="p-3.5 bg-stone-50 rounded-xl border border-stone-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] font-bold text-stone-400 uppercase">
                      Alias de Transferencia:
                    </span>
                    <span className="font-mono font-bold text-stone-900 text-sm">
                      {aliasActual}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => copyToClipboard(aliasActual, "alias")}
                    className="inline-flex items-center gap-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
                  >
                    {copiedAlias ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-stone-500" />
                        <span>Copiar</span>
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
                    className="inline-flex items-center gap-1 bg-white hover:bg-stone-100 border border-stone-300 text-stone-700 px-3 py-1 rounded-lg text-xs font-bold transition-all shadow-xs active:scale-95"
                  >
                    {copiedCbu ? (
                      <>
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                        <span className="text-emerald-700">¡Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="h-3.5 w-3.5 text-stone-500" />
                        <span>Copiar</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="border-t border-stone-200 pt-1.5 text-[11px] text-stone-500">
                  <span className="font-bold text-stone-700">Titular:</span> {titularActual}
                </div>
              </div>
            </div>

            {/* SECCIÓN 2: COORDINACIÓN DIRECTA CON EL VENDEDOR */}
            <div className="p-4 sm:p-5 bg-gradient-to-br from-amber-50 to-crema-100 rounded-2xl border border-amber-300/80 space-y-3">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-amber-800 flex-shrink-0" />
                <div>
                  <h5 className="font-serif text-xs font-bold text-amber-950 uppercase tracking-wider">
                    Atención Directa del Vendedor de Fábrica
                  </h5>
                  <p className="text-[11px] text-amber-900/80">
                    Teléfono oficial: <strong className="text-amber-950">{telefonoVendedor}</strong>
                  </p>
                </div>
              </div>

              {/* Botón WhatsApp Principal */}
              <button
                onClick={handleOpenWhatsApp}
                className="w-full inline-flex items-center justify-center gap-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 px-6 rounded-2xl text-xs sm:text-sm shadow-lg shadow-emerald-900/20 transition-all active:scale-[0.98]"
              >
                <MessageCircle className="h-5 w-5 fill-current" />
                <span>📱 Enviar Comanda por WhatsApp al Vendedor</span>
              </button>

              <p className="text-[10px] text-stone-500 text-center leading-relaxed">
                Al presionar, se abre WhatsApp con la comanda completa para confirmar el pago y coordinar el horario de retiro o entrega.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full text-xs font-bold text-stone-500 hover:text-stone-800 py-2 text-center transition-colors"
            >
              Cerrar y volver a la fábrica
            </button>
          </div>
        ) : (
          /* =================================================================== */
          /* PANTALLA 1: FORMULARIO DE ENCARGO CON RESUMEN SUPERIOR OBLIGATORIO  */
          /* =================================================================== */
          <form onSubmit={handleSubmit} className="p-5 sm:p-7 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
            {/* RESUMEN SUPERIOR OBLIGATORIO DEL PEDIDO */}
            <div className="p-4 bg-gradient-to-r from-stone-900 via-stone-800 to-amber-950 text-white rounded-2xl shadow-md border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300">Variedades en canasta:</span>
                <span className="font-bold text-white">{items.length} variedades</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-300">Total de Porciones:</span>
                <span className="font-bold text-amber-300 bg-amber-400/20 px-2.5 py-0.5 rounded-full border border-amber-400/40">
                  🍽️ {totalPorciones} porciones artesanales
                </span>
              </div>
              <div className="flex items-center justify-between border-t border-white/10 pt-2">
                <span className="text-xs uppercase font-bold text-stone-300">Total de la Compra:</span>
                <span className="font-serif text-2xl font-black text-amber-300">
                  ${totalPrice.toLocaleString("es-AR")}
                </span>
              </div>
              <p className="text-[10px] text-amber-200/80 pt-1 border-t border-white/10 text-center">
                🌾 Elaboración bajo pedido sin conservantes · 72 hs en heladera / 90 días en freezer
              </p>
            </div>

            {/* 1. SELECCIÓN DE DÍA DE ELABORACIÓN (TANDA SEMANAL) */}
            <div>
              <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-amber-700" />
                <span>1. Tanda de Amasado Fresco a Elegir</span>
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
                          ? "border-amber-700 bg-amber-700 text-white font-bold shadow-sm"
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
                {config.cierre_pedidos_info || "Tomamos pedidos con anticipación al amasado para garantizar frescura."}
              </p>
            </div>

            {/* 2. MODALIDAD DE RETIRO O DELIVERY */}
            <div>
              <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-2">
                2. Modalidad de Retiro o Entrega
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setTipoEntrega("retiro")}
                  className={`flex items-center gap-2.5 p-3 rounded-2xl border text-left transition-all ${
                    tipoEntrega === "retiro"
                      ? "border-amber-700 bg-amber-50 ring-2 ring-amber-600/20 text-[#2C1810]"
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
                      ? "border-amber-700 bg-amber-50 ring-2 ring-amber-600/20 text-[#2C1810]"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <Truck className="h-4 w-4 text-amber-700 shrink-0" />
                  <div>
                    <span className="block text-xs font-bold">Envío a Domicilio</span>
                    <span className="text-[10px] text-stone-500">Coordinado en el día</span>
                  </div>
                </button>
              </div>
            </div>

            {/* 3. DATOS OBLIGATORIOS DEL CLIENTE */}
            <div className="space-y-3">
              <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider">
                3. Datos del Cliente
              </label>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Nombre y Apellido *
                  </span>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    placeholder="Ej: Carolina Rossi"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>

                <div>
                  <span className="block text-[11px] font-semibold text-stone-600 mb-1">
                    Teléfono / WhatsApp *
                  </span>
                  <input
                    type="tel"
                    value={telefono}
                    onChange={(e) => setTelefono(e.target.value)}
                    placeholder="Ej: 11 5555 1234"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
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
                    placeholder="Calle, número, piso/depto y localidad"
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-amber-600"
                  />
                </div>
              )}
            </div>

            {/* 4. OPCIONES DE PAGO */}
            <div>
              <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-2">
                4. Forma de Pago
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setMetodoPago("transferencia")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                    metodoPago === "transferencia"
                      ? "border-amber-700 bg-amber-50 text-[#2C1810] font-bold shadow-xs ring-2 ring-amber-600/20"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <CreditCard className="h-5 w-5 mb-1 text-amber-700" />
                  <span className="text-xs font-bold leading-tight">Transferencia Inmediata</span>
                  <span className="text-[10px] text-stone-500 mt-0.5">QR · Alias · CBU</span>
                </button>

                <button
                  type="button"
                  onClick={() => setMetodoPago("efectivo")}
                  className={`flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all ${
                    metodoPago === "efectivo"
                      ? "border-amber-700 bg-amber-50 text-[#2C1810] font-bold shadow-xs ring-2 ring-amber-600/20"
                      : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                  }`}
                >
                  <Banknote className="h-5 w-5 mb-1 text-amber-700" />
                  <span className="text-xs font-bold leading-tight">Coordinar con Vendedor</span>
                  <span className="text-[10px] text-stone-500 mt-0.5">Efectivo / Al retirar</span>
                </button>
              </div>
            </div>

            {/* 5. ACLARACIONES */}
            <div>
              <label className="block text-xs font-bold text-[#2C1810] uppercase tracking-wider mb-1">
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

            {/* BOTÓN DE CONFIRMACIÓN */}
            <div className="pt-3 border-t border-stone-200 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 text-white font-bold py-4 px-6 rounded-2xl text-xs sm:text-sm shadow-xl transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  background: "linear-gradient(135deg, #8C4F37 0%, #703D2A 100%)",
                }}
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
