"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Sparkles, ArrowRight, Award, Snowflake, Clock, ShieldCheck } from "lucide-react";
import { TiendaConfig } from "@/lib/db";

interface IntroSplashProps {
  config: TiendaConfig;
  onEnter: () => void;
}

/* Silueta lineal estilizada de espiga de trigo (Sémola Candeal y Tradición Toscana) */
function WheatStalkSvg({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 280"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      {/* Tallo central curvado */}
      <path
        d="M50 270 C50 190 48 110 50 15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Espiguillas superiores */}
      <path
        d="M50 25 C42 16 38 8 42 2 C47 6 49 14 50 20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 25 C58 16 62 8 58 2 C53 6 51 14 50 20"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Espiguillas intermedias */}
      <path
        d="M50 48 C38 38 32 26 38 18 C44 24 48 35 50 42"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 48 C62 38 68 26 62 18 C56 24 52 35 50 42"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 74 C36 64 28 50 35 40 C42 47 48 59 50 67"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 74 C64 64 72 50 65 40 C58 47 52 59 50 67"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 102 C34 91 26 74 34 64 C41 71 48 84 50 93"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 102 C66 91 74 74 66 64 C59 71 52 84 50 93"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 132 C35 120 28 102 36 92 C43 99 48 113 50 122"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 132 C65 120 72 102 64 92 C57 99 52 113 50 122"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 164 C37 151 32 133 40 123 C45 130 49 144 50 153"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 164 C63 151 68 133 60 123 C55 130 51 144 50 153"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      {/* Hojas basales curvadas */}
      <path
        d="M50 195 C30 182 16 195 10 215 C26 210 42 202 50 195"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M50 205 C70 192 84 205 90 225 C74 220 58 212 50 205"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function IntroSplash({ config, onEnter }: IntroSplashProps) {
  const [isExiting, setIsExiting] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Animación de entrada suave
    const timer = setTimeout(() => setMounted(true), 80);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => {
    setIsExiting(true);
    setTimeout(() => {
      onEnter();
    }, 650);
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center overflow-hidden transition-all duration-700 ${
        isExiting
          ? "opacity-0 scale-105 pointer-events-none"
          : "opacity-100 scale-100"
      }`}
      style={{
        /* Composición cromática: transición orgánica de verdes olivas toscanos con atmósfera profunda */
        background:
          "radial-gradient(ellipse 90% 70% at 50% 25%, #34482C 0%, #22321C 45%, #141F11 80%, #0A1108 100%)",
      }}
    >
      {/* ============================================================== */}
      {/* CAPA DE VETAS DORADAS Y DESTELLOS DE LUZ SOLAR TOSCANA */}
      {/* ============================================================== */}
      {/* Destello solar principal superior derecho */}
      <div
        className="absolute top-0 right-1/4 w-[500px] h-[500px] rounded-full pointer-events-none opacity-40 blur-[130px]"
        style={{
          background: "radial-gradient(circle, #F5D77F 0%, #D4AF37 40%, transparent 75%)",
        }}
      />
      {/* Veta diagonal de luz natural difuminada */}
      <div
        className="absolute inset-0 pointer-events-none opacity-20"
        style={{
          background:
            "linear-gradient(125deg, transparent 20%, rgba(245, 215, 127, 0.25) 45%, rgba(255, 245, 205, 0.35) 50%, rgba(212, 175, 55, 0.15) 55%, transparent 75%)",
        }}
      />
      {/* Destello suave secundario inferior izquierdo */}
      <div
        className="absolute -bottom-24 -left-24 w-[450px] h-[450px] rounded-full pointer-events-none opacity-30 blur-[120px]"
        style={{
          background: "radial-gradient(circle, #6B805B 0%, #3B4D31 50%, transparent 80%)",
        }}
      />
      {/* Textura sutil orgánica de trama */}
      <div className="absolute inset-0 bg-[radial-gradient(#D4AF37_1px,transparent_1px)] [background-size:32px_32px] opacity-10 pointer-events-none" />

      {/* ============================================================== */}
      {/* CONTENEDOR CENTRAL: IDENTIDAD ARTESANAL DE LA TOSCANA */}
      {/* ============================================================== */}
      <div
        className={`relative z-10 w-full max-w-2xl mx-4 sm:mx-6 p-7 sm:p-11 md:p-13 rounded-3xl border border-amber-400/35 text-center shadow-2xl transition-all duration-1000 overflow-hidden ${
          mounted ? "opacity-100 blur-0 translate-y-0" : "opacity-0 blur-md translate-y-6"
        }`}
        style={{
          background:
            "linear-gradient(155deg, rgba(28, 41, 23, 0.94) 0%, rgba(18, 27, 15, 0.97) 50%, rgba(35, 45, 28, 0.95) 100%)",
          boxShadow:
            "0 30px 70px -15px rgba(0, 0, 0, 0.8), inset 0 0 45px rgba(212, 175, 55, 0.12), inset 0 1px 0 rgba(255, 235, 170, 0.25)",
        }}
      >
        {/* ============================================================== */}
        {/* SILUETAS / MARCAS DE AGUA LINEALES DE ESPIGAS DE TRIGO */}
        {/* ============================================================== */}
        {/* Espiga lateral izquierda */}
        <div className="absolute -left-6 -bottom-8 w-28 sm:w-36 h-64 sm:h-80 text-amber-300/15 pointer-events-none -rotate-12 transform">
          <WheatStalkSvg className="w-full h-full" />
        </div>
        {/* Espiga lateral derecha */}
        <div className="absolute -right-6 -bottom-8 w-28 sm:w-36 h-64 sm:h-80 text-amber-300/15 pointer-events-none rotate-12 scale-x-[-1] transform">
          <WheatStalkSvg className="w-full h-full" />
        </div>
        {/* Espiga sutil de fondo superior */}
        <div className="absolute top-2 left-1/2 -translate-x-1/2 w-48 h-32 text-amber-200/5 pointer-events-none">
          <WheatStalkSvg className="w-full h-full rotate-90" />
        </div>

        {/* LÍNEA DE ENCABEZADO DE FÁBRICA CON DETALLES DORADOS */}
        <div className="relative z-10 flex items-center justify-center gap-2 mb-5 sm:mb-6">
          <span className="h-px w-6 sm:w-10 bg-gradient-to-r from-transparent to-amber-400/50" />
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-200 border border-amber-400/35 bg-oliva-950/70 shadow-sm backdrop-blur-sm">
            <Award className="h-3.5 w-3.5 text-amber-400" />
            Fábrica Tradicional de Pastas Frescas
          </span>
          <span className="h-px w-6 sm:w-10 bg-gradient-to-l from-transparent to-amber-400/50" />
        </div>

        {/* LOGO DE REVELADO CON ILUSTRACIÓN DE LAS DOS NIÑAS: ESCALA IMPONENTE */}
        <div
          className="relative z-10 mx-auto mb-6 sm:mb-7 rounded-full overflow-hidden border-4 border-amber-400/90 p-1.5 bg-gradient-to-b from-amber-400/40 to-amber-950/90 shadow-[0_0_45px_rgba(212,175,55,0.45)] transition-transform duration-700 hover:scale-105 flex-shrink-0 flex items-center justify-center"
          style={{ width: "160px", height: "160px", minWidth: "160px", minHeight: "160px", maxWidth: "160px", maxHeight: "160px" }}
        >
          <div className="relative w-full h-full rounded-full overflow-hidden">
            <Image
              src="/images/logo.jpg"
              alt="Mia Pasta Bella"
              fill
              className="object-cover rounded-full"
              sizes="160px"
              priority
            />
          </div>
        </div>

        {/* MARCA EN SINGULAR: "Mia Pasta Bella" */}
        <h1 className="relative z-10 font-serif text-3xl sm:text-5xl font-black text-amber-50 tracking-tight leading-tight drop-shadow-sm">
          {config.nombre_tienda || "Mia Pasta Bella"}
        </h1>

        {/* ESLOGAN DE AUTOR CENTRADO EN LA NOBLEZA DE INGREDIENTES */}
        <div
          className={`relative z-10 mt-3 sm:mt-4 space-y-2 transition-all duration-1000 delay-300 ${
            mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <p className="font-serif text-base sm:text-xl text-amber-200/95 italic font-medium leading-relaxed max-w-lg mx-auto">
            &ldquo;Tradición artesanal, frescura de autor: del día a tu mesa, directo de nuestra fábrica.&rdquo;
          </p>
          <p className="text-xs sm:text-sm text-amber-100/75 max-w-md mx-auto pt-1 leading-relaxed">
            Elaboración diaria con sémola pura de trigo candeal, huevos de granja y masa madre de fermentación lenta de 48 hs.
          </p>
        </div>

        {/* SELLOS DE CONFIANZA DE FÁBRICA */}
        <div className="relative z-10 mt-7 pt-5 border-t border-amber-400/20 grid grid-cols-3 gap-2 sm:gap-4 text-[10px] sm:text-xs text-amber-200/85 font-bold">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
            <Clock className="h-4 w-4 text-amber-400 flex-shrink-0" />
            <span>Al Día o Congelado</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
            <Snowflake className="h-4 w-4 text-blue-300 flex-shrink-0" />
            <span>Apto Freezer</span>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-1">
            <ShieldCheck className="h-4 w-4 text-emerald-400 flex-shrink-0" />
            <span>100% Sin Aditivos</span>
          </div>
        </div>

        {/* BOTÓN PRINCIPAL CENTRAL DE ALTO IMPACTO */}
        <div className="relative z-10 mt-7 sm:mt-8 flex justify-center">
          <button
            onClick={handleStart}
            className="group relative inline-flex items-center justify-center gap-3 px-8 sm:px-11 py-3.5 sm:py-4 rounded-full text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950 transition-all duration-300 shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:shadow-[0_0_35px_rgba(212,175,55,0.75)] hover:scale-105 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #F9E298 0%, #D4AF37 50%, #B8860B 100%)",
            }}
          >
            {/* Brillo de pulsación sutil */}
            <span className="absolute -inset-1 rounded-full bg-amber-400/35 blur-sm animate-pulse pointer-events-none" />

            <Sparkles className="relative z-10 h-4 sm:h-5 w-4 sm:w-5 text-amber-950 fill-current" />
            <span className="relative z-10">Ingresar a la Fábrica</span>
            <ArrowRight className="relative z-10 h-4 sm:h-5 w-4 sm:w-5 text-amber-950 group-hover:translate-x-1.5 transition-transform" />
          </button>
        </div>

        <p className="relative z-10 mt-4 text-[10px] text-amber-300/60 uppercase tracking-widest">
          Mia Pasta Bella • Todos los Derechos Reservados
        </p>
      </div>
    </div>
  );
}
