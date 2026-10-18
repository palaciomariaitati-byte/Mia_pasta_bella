"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Download,
  Share2,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Printer,
  Sliders,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { renderQRWithLogo, downloadQRCanvas } from "@/lib/qr-generator";

function resolveAdminQRTargetUrl(): string {
  if (typeof process !== "undefined") {
    if (process.env.NEXT_PUBLIC_SITE_URL && process.env.NEXT_PUBLIC_SITE_URL.trim().length > 0) {
      return process.env.NEXT_PUBLIC_SITE_URL.trim().replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_TIENDA_URL && process.env.NEXT_PUBLIC_TIENDA_URL.trim().length > 0) {
      return process.env.NEXT_PUBLIC_TIENDA_URL.trim().replace(/\/$/, "");
    }
    if (process.env.NEXT_PUBLIC_VERCEL_URL && process.env.NEXT_PUBLIC_VERCEL_URL.trim().length > 0) {
      const vUrl = process.env.NEXT_PUBLIC_VERCEL_URL.trim().replace(/\/$/, "");
      return vUrl.startsWith("http") ? vUrl : `https://${vUrl}`;
    }
  }
  if (typeof window !== "undefined" && window.location.origin) {
    if (window.location.origin.includes(":3001")) {
      return window.location.origin.replace(":3001", ":3000");
    }
    return window.location.origin;
  }
  return "http://localhost:3000";
}

export default function QRGeneratorPage() {
  const [url, setUrl] = useState<string>(() => resolveAdminQRTargetUrl());
  const [resolution, setResolution] = useState<number>(1024);
  const [qrColor, setQrColor] = useState<string>("#2C1810");
  const [includeLogo, setIncludeLogo] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);
  const [rendering, setRendering] = useState<boolean>(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setUrl(resolveAdminQRTargetUrl());
  }, []);

  // Renderizar o actualizar el QR en tiempo real
  const handleRender = async () => {
    if (!canvasRef.current) return;
    setRendering(true);
    try {
      await renderQRWithLogo({
        canvas: canvasRef.current,
        url: url.trim() || "http://localhost:3000",
        size: resolution,
        darkColor: qrColor,
        lightColor: "#FFFFFF",
        includeLogo,
        logoSrc: "/images/logo.jpg",
        logoSizePercent: 24, // 24% garantiza lectura perfecta con Nivel H (30%)
      });
    } catch (err) {
      console.error("Error al renderizar QR:", err);
    } finally {
      setRendering(false);
    }
  };

  useEffect(() => {
    handleRender();
  }, [url, resolution, qrColor, includeLogo]);

  const handleDownload = () => {
    if (!canvasRef.current) return;
    const cleanName = `Mia_Pasta_Bella_QR_${resolution}px.png`;
    downloadQRCanvas(canvasRef.current, cleanName);
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* ENCABEZADO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-gray-200 gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-amber-900 bg-amber-100 mb-2 border border-amber-200">
            <Sparkles className="h-3.5 w-3.5 text-amber-700" />
            <span>Herramienta de Distribución & Marketing</span>
          </div>
          <h1 className="font-serif text-3xl font-black text-gray-900 leading-tight">
            Generador de Código QR de Alta Gama
          </h1>
          <p className="text-sm text-gray-600 mt-1 max-w-2xl">
            Genera un código QR de alta resolución con corrección de errores de grado profesional (Nivel H) y el isotipo central oficial de <strong>Mia Pasta Bella</strong>, optimizado para impresión en folletos de mostrador, etiquetas de empaque y cartelería.
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 transition-all shadow-md active:scale-95 flex-shrink-0"
        >
          <Download className="h-4 w-4" />
          <span>Descargar QR ({resolution}x{resolution})</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* PANEL DE CONTROL / AJUSTES (5 COLUMNAS) */}
        <div className="lg:col-span-5 space-y-6 bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-bold text-gray-900 border-b border-gray-100 pb-3">
            <Sliders className="h-4 w-4 text-amber-700" />
            <span>Configuración del Código</span>
          </div>

          {/* URL DESTINO */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              URL de Destino del QR:
            </label>
            <div className="relative flex items-center">
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://miapastabella.com"
                className="w-full rounded-xl border border-gray-300 px-3.5 py-2.5 text-sm text-gray-900 focus:border-amber-600 focus:ring-1 focus:ring-amber-600 pr-20"
              />
              <button
                type="button"
                onClick={handleCopyUrl}
                className="absolute right-2 px-2.5 py-1 text-xs font-bold text-amber-800 hover:bg-amber-50 rounded-lg transition-colors border border-amber-200"
                title="Copiar enlace"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-emerald-600" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[11px] font-bold text-gray-500 mr-1">Atajos rápidos:</span>
              <button
                type="button"
                onClick={() => {
                  const prod = process.env.NEXT_PUBLIC_SITE_URL || (process.env.NEXT_PUBLIC_VERCEL_URL ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}` : "https://miapastabella.vercel.app");
                  setUrl(prod);
                }}
                className="px-2 py-0.5 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-[11px] font-bold transition-colors cursor-pointer"
              >
                ☁️ Producción / Vercel
              </button>
              <button
                type="button"
                onClick={() => setUrl("http://localhost:3000")}
                className="px-2 py-0.5 rounded-md bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 text-[11px] font-bold transition-colors cursor-pointer"
              >
                💻 Local (:3000)
              </button>
              {typeof window !== "undefined" && window.location.hostname !== "localhost" && (
                <button
                  type="button"
                  onClick={() => setUrl(`http://${window.location.hostname}:3000`)}
                  className="px-2 py-0.5 rounded-md bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 text-[11px] font-bold transition-colors cursor-pointer"
                >
                  📱 Red Wi-Fi ({window.location.hostname})
                </button>
              )}
            </div>
            <p className="text-[11px] text-gray-500">
              Apunta dinámicamente a tu dominio de producción, tu red Wi-Fi o localhost:3000 para abrir la carta desde cualquier celular.
            </p>
          </div>

          {/* PALETA DE COLOR */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Color de los Módulos:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setQrColor("#2C1810")}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  qrColor === "#2C1810"
                    ? "border-amber-700 bg-amber-50 text-amber-950 shadow-xs"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="h-4 w-4 rounded-full bg-[#2C1810] flex-shrink-0" />
                <span>Boutique</span>
              </button>

              <button
                type="button"
                onClick={() => setQrColor("#111111")}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  qrColor === "#111111"
                    ? "border-amber-700 bg-amber-50 text-amber-950 shadow-xs"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="h-4 w-4 rounded-full bg-[#111111] flex-shrink-0" />
                <span>Negro Puro</span>
              </button>

              <button
                type="button"
                onClick={() => setQrColor("#24331E")}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all ${
                  qrColor === "#24331E"
                    ? "border-amber-700 bg-amber-50 text-amber-950 shadow-xs"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="h-4 w-4 rounded-full bg-[#24331E] flex-shrink-0" />
                <span>Oliva Toscana</span>
              </button>
            </div>
          </div>

          {/* RESOLUCIÓN DE EXPORTACIÓN */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-700 uppercase tracking-wider block">
              Resolución de Impresión:
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setResolution(512)}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  resolution === 512
                    ? "border-amber-700 bg-amber-50 text-amber-950 shadow-xs"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="block font-black">512 px</span>
                <span className="text-[10px] text-gray-500 font-normal">Digital / Web</span>
              </button>

              <button
                type="button"
                onClick={() => setResolution(1024)}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  resolution === 1024
                    ? "border-amber-700 bg-amber-50 text-amber-950 shadow-xs"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="block font-black">1024 px</span>
                <span className="text-[10px] text-emerald-700 font-bold">Folletos (Óptimo)</span>
              </button>

              <button
                type="button"
                onClick={() => setResolution(2048)}
                className={`p-2.5 rounded-xl border text-xs font-bold text-center transition-all ${
                  resolution === 2048
                    ? "border-amber-700 bg-amber-50 text-amber-950 shadow-xs"
                    : "border-gray-200 text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className="block font-black">2048 px</span>
                <span className="text-[10px] text-gray-500 font-normal">Cartelería XXL</span>
              </button>
            </div>
          </div>

          {/* TOGGLE LOGO CENTRAL */}
          <div className="pt-2 flex items-center justify-between border-t border-gray-100">
            <div>
              <span className="text-xs font-bold text-gray-900 block">
                Incrustar Isotipo Oficial Central
              </span>
              <span className="text-[11px] text-gray-500 block">
                Ilustración de las dos niñas con bisel dorado
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={includeLogo}
                onChange={(e) => setIncludeLogo(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-700"></div>
            </label>
          </div>

          {/* SELLO DE GARANTÍA TECNOLÓGICA (NIVEL H) */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-950 flex items-start gap-3">
            <ShieldCheck className="h-5 w-5 text-amber-700 flex-shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="block font-bold">Corrección de Errores Grado H (30%)</strong>
              <p className="text-amber-900/80 leading-relaxed text-[11px]">
                El algoritmo genera redundancia matemática profunda de Reed-Solomon. Permite que el código sea 100% escaneable en smartphones aún con el logo central integrado o si el papel sufre arrugas en el empaque.
              </p>
            </div>
          </div>
        </div>

        {/* PREVISUALIZACIÓN DEL QR DE ALTA DEFINICIÓN (7 COLUMNAS) */}
        <div className="lg:col-span-7 flex flex-col items-center bg-white p-8 sm:p-10 rounded-2xl border border-gray-200 shadow-sm text-center">
          <div className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-6">
            Vista Previa de Impresión en Vivo
          </div>

          {/* MARCO EDITORIAL DEL QR */}
          <div className="relative p-6 sm:p-8 rounded-3xl bg-gray-50 border-2 border-dashed border-gray-300 shadow-inner max-w-sm sm:max-w-md w-full flex flex-col items-center">
            {/* CANVAS RENDERIZADO */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 bg-white rounded-2xl p-3 shadow-lg border border-gray-200 flex items-center justify-center overflow-hidden">
              <canvas
                ref={canvasRef}
                className="w-full h-full object-contain"
                style={{ imageRendering: "pixelated" }}
              />
              {rendering && (
                <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                  <RefreshCw className="h-6 w-6 text-amber-700 animate-spin" />
                </div>
              )}
            </div>

            <div className="mt-5 space-y-1">
              <span className="font-serif text-lg font-bold text-gray-900 block">
                Mia Pasta Bella
              </span>
              <span className="text-xs text-gray-500 font-mono block truncate max-w-xs mx-auto">
                {url}
              </span>
            </div>
          </div>

          {/* ACCIONES DE EXPORTACIÓN */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 w-full max-w-md">
            <button
              onClick={handleDownload}
              className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-bold text-white bg-amber-700 hover:bg-amber-800 transition-all shadow-md active:scale-95"
            >
              <Download className="h-4 w-4" />
              <span>Descargar Imagen PNG</span>
            </button>

            <button
              onClick={() => window.open(url, "_blank")}
              className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-bold text-gray-700 hover:bg-gray-100 transition-colors border border-gray-300"
              title="Abrir URL en el navegador"
            >
              <ExternalLink className="h-4 w-4" />
              <span>Probar Enlace</span>
            </button>
          </div>

          <p className="mt-4 text-[11px] text-gray-400">
            Formato PNG transparente de alta fidelidad • 300 DPI ideal para imprenta digital y offset.
          </p>
        </div>
      </div>
    </div>
  );
}
