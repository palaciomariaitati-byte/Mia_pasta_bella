"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  QrCode,
  Download,
  Copy,
  Check,
  X,
  Sparkles,
  Share2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { renderQRWithLogo, downloadQRCanvas } from "@/lib/qr-generator";

interface QRModalProps {
  isOpen: boolean;
  onClose: () => void;
  siteUrl?: string;
}

export function QRModal({ isOpen, onClose, siteUrl }: QRModalProps) {
  const [currentUrl, setCurrentUrl] = useState<string>(
    siteUrl || "http://localhost:3000"
  );
  const [copied, setCopied] = useState<boolean>(false);
  const [rendering, setRendering] = useState<boolean>(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setCurrentUrl(window.location.origin);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    const render = async () => {
      if (!canvasRef.current) return;
      setRendering(true);
      try {
        await renderQRWithLogo({
          canvas: canvasRef.current,
          url: currentUrl,
          size: 1024,
          darkColor: "#2C1810",
          lightColor: "#FFFFFF",
          includeLogo: true,
          logoSrc: "/images/logo.jpg",
          logoSizePercent: 24,
        });
      } catch (err) {
        console.error("Error al renderizar QR en Tienda:", err);
      } finally {
        setRendering(false);
      }
    };

    const timer = setTimeout(render, 50);
    return () => clearTimeout(timer);
  }, [isOpen, currentUrl]);

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!canvasRef.current) return;
    downloadQRCanvas(canvasRef.current, "Mia_Pasta_Bella_Menu_QR.png");
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg rounded-3xl bg-crema-50 border-2 border-amber-500/30 p-6 sm:p-8 text-center shadow-2xl overflow-visible">
        {/* BOTÓN CERRAR */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 rounded-full p-2 text-terracota-700 hover:bg-crema-200 transition-colors"
          aria-label="Cerrar modal"
        >
          <X className="h-5 w-5" />
        </button>

        {/* DISTINTIVO BOUTIQUE */}
        <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider text-oliva-900 bg-oliva-100 border border-oliva-300 shadow-xs mb-3">
          <Sparkles className="h-3.5 w-3.5 text-oliva-700" />
          <span>Menú Digital & Fábrica de Pastas</span>
        </div>

        <h3 className="font-serif text-2xl sm:text-3xl font-black text-terracota-950 leading-tight">
          Código QR de Mia Pasta Bella
        </h3>
        <p className="text-xs sm:text-sm text-terracota-800/85 mt-1 max-w-md mx-auto leading-relaxed">
          Escaneá con tu celular para llevar nuestra carta de pastas siempre con vos o descargalo en alta resolución para compartirlo.
        </p>

        {/* MARCO DEL QR CON LOGO CENTRAL */}
        <div className="my-6 p-4 sm:p-5 rounded-2xl bg-white border border-crema-300 shadow-inner flex flex-col items-center justify-center max-w-xs sm:max-w-sm mx-auto">
          <div className="relative w-56 h-56 sm:w-64 sm:h-64 bg-white rounded-xl shadow-md p-2 flex items-center justify-center">
            <canvas
              ref={canvasRef}
              className="w-full h-full object-contain"
              style={{ imageRendering: "pixelated" }}
            />
            {rendering && (
              <div className="absolute inset-0 bg-white/70 backdrop-blur-xs flex items-center justify-center">
                <span className="text-xs font-bold text-terracota-800 animate-pulse">
                  Generando QR...
                </span>
              </div>
            )}
          </div>

          <div className="mt-3 flex items-center justify-center gap-1.5 text-[11px] text-oliva-800 font-bold">
            <ShieldCheck className="h-3.5 w-3.5 text-oliva-700" />
            <span>Nivel de Corrección H (Alta Definición)</span>
          </div>
        </div>

        {/* BOTONES DE ACCIÓN */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
          <button
            onClick={handleDownload}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full text-xs sm:text-sm font-bold text-white bg-terracota-600 hover:bg-terracota-700 transition-all shadow-md active:scale-95"
          >
            <Download className="h-4 w-4" />
            <span>Descargar QR (PNG Alta Calidad)</span>
          </button>

          <button
            onClick={handleCopy}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 rounded-full text-xs sm:text-sm font-bold text-terracota-900 bg-crema-200 hover:bg-crema-300 transition-all border border-crema-300 active:scale-95"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            <span>{copied ? "¡Enlace Copiado!" : "Copiar Enlace"}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
