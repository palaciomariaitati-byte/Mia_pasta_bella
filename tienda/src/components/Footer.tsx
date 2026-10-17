import React from "react";
import Image from "next/image";
import { MessageCircle, MapPin, Heart, ExternalLink, Mail, Phone } from "lucide-react";
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
  const telefonoLimpio = config.whatsapp_numero.replace(/[^0-9]/g, "");
  const whatsappUrl = `https://wa.me/${telefonoLimpio}?text=${encodeURIComponent(
    config.whatsapp_mensaje
  )}`;

  return (
    <footer className="border-t border-crema-300 bg-crema-200/90 text-terracota-900 pt-16 pb-12 transition-colors">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* BLOQUE 1: IDENTIDAD Y SLOGAN EDITABLE */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 overflow-hidden rounded-full border-2 border-terracota-400 bg-crema-100 shadow-sm">
                <Image
                  src="/images/logo.jpg"
                  alt={config.nombre_tienda}
                  fill
                  className="object-cover"
                  sizes="48px"
                />
              </div>
              <div>
                <span className="font-serif text-xl font-bold text-terracota-900 block">
                  {config.nombre_tienda}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-oliva-700 font-semibold block">
                  Pastas Frescas & Pre-Pizzas
                </span>
              </div>
            </div>

            {/* TEXTO EXACTO DINÁMICO REQUERIDO 1 */}
            <p className="text-xs sm:text-sm text-terracota-800/90 leading-relaxed font-serif italic">
              {config.slogan_principal}
            </p>

            {/* REDES DINÁMICAS */}
            <div className="pt-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-terracota-700 mb-2.5">
                Canales de Contacto Directo
              </p>
              <div className="flex items-center gap-3">
                <a
                  href={config.facebook_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="rounded-full bg-crema-100 p-2.5 text-terracota-700 border border-crema-400 hover:bg-terracota-600 hover:text-white transition-all shadow-sm"
                >
                  <FacebookIcon className="h-4 w-4" />
                </a>

                <a
                  href={config.instagram_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="rounded-full bg-crema-100 p-2.5 text-terracota-700 border border-crema-400 hover:bg-terracota-600 hover:text-white transition-all shadow-sm"
                >
                  <InstagramIcon className="h-4 w-4" />
                </a>

                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp"
                  className="rounded-full bg-oliva-500 p-2.5 text-white hover:bg-oliva-600 transition-all shadow-sm"
                >
                  <MessageCircle className="h-4 w-4 fill-current" />
                </a>

                <a
                  href={config.google_maps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Google Maps"
                  className="rounded-full bg-crema-100 p-2.5 text-terracota-700 border border-crema-400 hover:bg-terracota-600 hover:text-white transition-all shadow-sm"
                  title="Ver ubicación en Google Maps"
                >
                  <MapPin className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>

          {/* BLOQUE 2: NUESTRAS VARIEDADES (TEXTO DINÁMICO EDITABLE 2) */}
          <div>
            <h3 className="font-serif text-base font-bold text-terracota-900 mb-3 border-b border-crema-300 pb-1.5">
              Nuestras Variedades
            </h3>
            <p className="text-xs sm:text-sm text-terracota-800/90 leading-relaxed">
              {config.variedades_texto}
            </p>
          </div>

          {/* BLOQUE 3: ATENCIÓN AL CLIENTE (TEXTO DINÁMICO EDITABLE 3) */}
          <div>
            <h3 className="font-serif text-base font-bold text-terracota-900 mb-3 border-b border-crema-300 pb-1.5">
              Atención al Cliente
            </h3>
            <p className="text-xs sm:text-sm text-terracota-800/90 leading-relaxed">
              {config.atencion_cliente}
            </p>
          </div>

          {/* BLOQUE 4: COMPROMISO DE CALIDAD (TEXTO DINÁMICO EDITABLE 4) */}
          <div className="rounded-2xl border border-crema-300 bg-crema-100 p-5 shadow-sm">
            <span className="inline-block rounded-full bg-oliva-100 text-oliva-800 px-3 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-2">
              Sello Artesanal
            </span>
            <p className="text-xs text-terracota-800/90 leading-relaxed mb-3">
              {config.compromiso_calidad}
            </p>
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-oliva w-full text-xs py-2 flex items-center justify-center gap-1.5 font-bold"
            >
              <MessageCircle className="h-3.5 w-3.5 fill-current" />
              Pedir por WhatsApp
            </a>
          </div>
        </div>

        {/* COPYRIGHT & FIRMA OFICIAL NEXORAONE REQUERIDA */}
        <div className="mt-12 border-t border-crema-300 pt-8 flex flex-col sm:flex-row items-center justify-between text-xs text-terracota-700 gap-4">
          <p>
            © {new Date().getFullYear()} {config.nombre_tienda}. Todos los derechos reservados.
          </p>

          {/* FIRMA OFICIAL: "Desarrollado por NexoraOne" */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 bg-crema-100 border border-crema-300 px-4 py-2 rounded-full shadow-sm text-terracota-800">
            <span className="font-medium text-xs">
              Desarrollado por <strong className="font-bold text-terracota-900">NexoraOne</strong>
            </span>
            <span className="text-terracota-400">•</span>
            <a
              href="tel:3786414533"
              className="flex items-center gap-1 text-xs text-terracota-700 hover:text-terracota-900 font-semibold transition-colors"
              title="Llamar o WhatsApp"
            >
              <Phone className="h-3 w-3 text-oliva-600" />
              3786414533
            </a>
            <span className="text-terracota-400">•</span>
            <a
              href="mailto:myjnexoravisual@gmail.com"
              className="flex items-center gap-1 text-xs text-terracota-700 hover:text-terracota-900 font-semibold transition-colors"
              title="Enviar correo"
            >
              <Mail className="h-3 w-3 text-terracota-600" />
              myjnexoravisual@gmail.com
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
