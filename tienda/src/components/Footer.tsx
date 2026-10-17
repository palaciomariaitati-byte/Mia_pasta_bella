"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  MessageCircle,
  MapPin,
  Heart,
  Mail,
  Phone,
  Clock,
  ShieldCheck,
  HelpCircle,
  FileText,
  X,
  Sparkles,
} from "lucide-react";
import { TiendaConfig } from "@/lib/db";

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
        clipRule="evenodd"
      />
    </svg>
  );
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
      <path
        fillRule="evenodd"
        d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface FooterProps {
  config: TiendaConfig;
}

export function Footer({ config }: FooterProps) {
  const [activeModal, setActiveModal] = useState<"faq" | "terms" | "contact" | null>(null);

  const telefonoLimpio = config.whatsapp_numero.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(
    config.whatsapp_mensaje
  )}`;

  return (
    <footer className="border-t border-oliva-800 bg-[#212A1B] text-crema-100 pt-16 pb-12 transition-colors relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* BLOQUE 1: IDENTIDAD CORPORATIVA + BANDERA ITALIANA */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-amber-400 bg-white p-0.5 shadow-md flex-shrink-0"
                style={{ width: "56px", height: "56px", minWidth: "56px", minHeight: "56px" }}
              >
                <Image
                  src="/images/logo.jpg"
                  alt={config.nombre_tienda}
                  fill
                  className="object-cover rounded-full"
                  sizes="56px"
                />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-serif text-2xl font-black text-amber-200 block">
                    {config.nombre_tienda}
                  </span>
                  {/* BANDERA TRICOLOR ITALIANA */}
                  <span
                    className="inline-flex h-3 w-5 overflow-hidden rounded-[2px] shadow-xs border border-amber-500/40"
                    title="Tradición Italiana"
                  >
                    <span className="w-1/3 bg-[#009246]" />
                    <span className="w-1/3 bg-white" />
                    <span className="w-1/3 bg-[#CE2B37]" />
                  </span>
                </div>
                <span className="text-[11px] uppercase tracking-wider text-amber-400/90 font-bold block">
                  El sabor de sentirse en casa
                </span>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-crema-200/80 leading-relaxed font-serif italic">
              &ldquo;{config.slogan_principal || "Pastas artesanales con masa madre viva y sémola candeal."}&rdquo;
            </p>

            {/* REDES SOCIALES OFICIALES */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-300/80 mb-2.5">
                Seguinos en Nuestras Redes
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={config.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-full bg-oliva-900/80 p-2.5 text-amber-200 border border-oliva-700 hover:bg-amber-400 hover:text-stone-950 transition-all shadow-sm"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>

                <a
                  href={config.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-full bg-oliva-900/80 p-2.5 text-amber-200 border border-oliva-700 hover:bg-amber-400 hover:text-stone-950 transition-all shadow-sm"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="rounded-full bg-emerald-600 p-2.5 text-white hover:bg-emerald-500 transition-all shadow-sm"
                >
                  <MessageCircle className="h-4 w-4 fill-current" />
                </a>

                <a
                  href={config.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Maps"
                  className="rounded-full bg-oliva-900/80 p-2.5 text-amber-200 border border-oliva-700 hover:bg-amber-400 hover:text-stone-950 transition-all shadow-sm"
                  title="Ver ubicación en Google Maps"
                >
                  <MapPin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: NUESTRAS VARIEDADES */}
          <div>
            <h3 className="font-serif text-base font-bold text-amber-300 mb-3 border-b border-oliva-800 pb-1.5 flex items-center gap-2">
              <span>Nuestras Variedades</span>
            </h3>
            <p className="text-xs sm:text-sm text-crema-200/85 leading-relaxed">
              {config.variedades_texto ||
                "Tallarines y fideos saborizados, sorrentinos de autor, ravioles en plancha, ñoquis soufflé, tortellinis, pre-pizzas y empanadas criollas."}
            </p>
          </div>

          {/* BLOQUE 3: ATENCIÓN Y CONTACTO */}
          <div>
            <h3 className="font-serif text-base font-bold text-amber-300 mb-3 border-b border-oliva-800 pb-1.5 flex items-center gap-2">
              <span>Fábrica & Horarios</span>
            </h3>
            <p className="text-xs sm:text-sm text-crema-200/85 leading-relaxed mb-3">
              {config.atencion_cliente ||
                "Av. de los Sabores 450 · Martes a Domingos de 10:00 a 20:30 hs."}
            </p>
            <div className="flex items-center gap-2 text-xs text-amber-200">
              <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
              <span>Pedidos por encargo para tandas frescas</span>
            </div>
          </div>

          {/* BLOQUE 4: SELLO DE CALIDAD */}
          <div className="rounded-2xl border border-oliva-700 bg-oliva-900/60 p-5 shadow-sm">
            <span className="inline-block rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
              🌾 Compromiso Artesanal
            </span>
            <p className="text-xs text-crema-200/80 leading-relaxed mb-4">
              {config.compromiso_calidad ||
                "Masa 100% sémola pura candeal y huevos de campo. 72 hs en heladera / 90 días en freezer."}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full text-xs py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-stone-950 flex items-center justify-center gap-2 font-black transition-all shadow-sm active:scale-95"
            >
              <MessageCircle className="h-4 w-4 fill-current" />
              Consultar por WhatsApp
            </a>
          </div>
        </div>

        {/* ENLACES INSTITUCIONALES INFERIORES */}
        <div className="mt-12 border-t border-oliva-800/80 pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-crema-300/80 font-medium">
          <button
            onClick={() => setActiveModal("faq")}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <HelpCircle className="h-3.5 w-3.5 text-amber-400" />
            <span>Preguntas frecuentes</span>
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveModal("terms")}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <FileText className="h-3.5 w-3.5 text-amber-400" />
            <span>Términos y condiciones</span>
          </button>
          <span>•</span>
          <button
            onClick={() => setActiveModal("contact")}
            className="hover:text-amber-300 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Phone className="h-3.5 w-3.5 text-amber-400" />
            <span>Contacto</span>
          </button>
        </div>

        {/* COPYRIGHT & FIRMA OFICIAL NEXORAONE */}
        <div className="mt-6 border-t border-oliva-800/50 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-crema-400/70 gap-4">
          <p>
            © {new Date().getFullYear()} {config.nombre_tienda || "Mia Pasta Bella"}. Todos los derechos reservados.
          </p>

          {/* FIRMA OFICIAL: "Desarrollado por NexoraOne" */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-oliva-900/80 border border-oliva-700/80 px-4 py-2 rounded-full shadow-xs text-crema-200">
            <span className="font-medium text-xs">
              Desarrollado por <strong className="font-bold text-amber-300">NexoraOne</strong>
            </span>
            <span className="text-oliva-500">•</span>
            <a
              href="tel:3786414533"
              className="flex items-center gap-1 text-xs text-crema-300 hover:text-amber-300 font-semibold transition-colors"
              title="Llamar o WhatsApp"
            >
              <Phone className="h-3 w-3 text-amber-400" />
              3786414533
            </a>
            <span className="text-oliva-500">•</span>
            <a
              href="mailto:myjnexoravisual@gmail.com"
              className="flex items-center gap-1 text-xs text-crema-300 hover:text-amber-300 font-semibold transition-colors"
              title="Enviar correo"
            >
              <Mail className="h-3 w-3 text-amber-400" />
              myjnexoravisual@gmail.com
            </a>
          </div>
        </div>
      </div>

      {/* ============================================================== */}
      {/* MODALES INTERACTIVOS: FAQ / TÉRMINOS / CONTACTO */}
      {/* ============================================================== */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
          <div className="relative w-full max-w-xl max-h-[85vh] overflow-y-auto rounded-3xl bg-[#FAF6EE] text-[#2C1810] p-6 sm:p-8 shadow-2xl border-2 border-amber-400">
            <button
              onClick={() => setActiveModal(null)}
              className="absolute top-5 right-5 p-2 rounded-full bg-stone-200 text-stone-800 hover:bg-stone-300 transition-colors"
              aria-label="Cerrar modal"
            >
              <X className="h-5 w-5" />
            </button>

            {/* CONTENIDO SEGÚN MODAL */}
            {activeModal === "faq" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <HelpCircle className="h-6 w-6 text-terracota-700" />
                  <h3 className="font-serif text-2xl font-black text-terracota-900">
                    Preguntas Frecuentes
                  </h3>
                </div>
                <div className="space-y-4 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <div className="rounded-2xl bg-white p-4 border border-[#DFD3BD]">
                    <h4 className="font-bold text-terracota-900 mb-1">
                      ¿Cuánto tiempo duran las pastas frescas?
                    </h4>
                    <p>
                      Al no tener conservantes químicos, duran <strong>72 horas en heladera</strong> (entre 2°C y 5°C) o hasta <strong>90 días en freezer</strong> (-18°C) guardadas en su caja o envase sellado.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 border border-[#DFD3BD]">
                    <h4 className="font-bold text-terracota-900 mb-1">
                      ¿Cómo cocino las pastas congeladas?
                    </h4>
                    <p>
                      <strong>¡Nunca las descongeles previamente!</strong> Tiralas directamente en abundante agua hirviendo con sal. Los tallarines tardan de 3 a 5 minutos, y los ravioles o sorrentinos de 6 a 8 minutos.
                    </p>
                  </div>
                  <div className="rounded-2xl bg-white p-4 border border-[#DFD3BD]">
                    <h4 className="font-bold text-terracota-900 mb-1">
                      ¿Cómo coordino mi pedido y pago?
                    </h4>
                    <p>
                      Armás tu canasta en la app, ingresás tu nombre y teléfono, y al confirmar elegís transferencia bancaria con el CBU/Alias o coordinás directo por WhatsApp con nuestro equipo.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activeModal === "terms" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <FileText className="h-6 w-6 text-terracota-700" />
                  <h3 className="font-serif text-2xl font-black text-terracota-900">
                    Términos y Condiciones
                  </h3>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <p>
                    <strong>1. Producción por Encargo:</strong> Mía Pasta Bella es una fábrica artesanal que elabora bajo pedido para asegurar frescura absoluta en cada lote.
                  </p>
                  <p>
                    <strong>2. Horarios y Retiro:</strong> Los pedidos confirmados se retiran en fábrica en los días y horarios acordados de la tanda activa, o mediante envío coordinado respetando la cadena de frío.
                  </p>
                  <p>
                    <strong>3. Métodos de Pago:</strong> Aceptamos transferencias bancarias directas, Mercado Pago y efectivo contra entrega en fábrica.
                  </p>
                </div>
              </div>
            )}

            {activeModal === "contact" && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Phone className="h-6 w-6 text-terracota-700" />
                  <h3 className="font-serif text-2xl font-black text-terracota-900">
                    Canales de Contacto Directo
                  </h3>
                </div>
                <div className="space-y-3 text-xs sm:text-sm text-stone-700 leading-relaxed">
                  <p>
                    <strong>Fábrica & Ventas:</strong> {config.atencion_cliente || "Av. de los Sabores 450"}
                  </p>
                  <p>
                    <strong>WhatsApp Directo:</strong>{" "}
                    <a href={whatsappUrl} className="text-emerald-700 font-bold underline" target="_blank" rel="noopener noreferrer">
                      {config.whatsapp_numero}
                    </a>
                  </p>
                  <p>
                    <strong>Ubicación:</strong>{" "}
                    <a href={config.google_maps_url} className="text-terracota-700 font-bold underline" target="_blank" rel="noopener noreferrer">
                      Ver en Google Maps
                    </a>
                  </p>
                </div>
              </div>
            )}

            <div className="mt-6 text-center">
              <button
                onClick={() => setActiveModal(null)}
                className="px-6 py-2.5 rounded-xl bg-terracota-700 text-white font-bold hover:bg-terracota-800 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
}
