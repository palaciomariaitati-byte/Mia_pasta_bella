"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Mail, ArrowRight, ShieldCheck, ChefHat, Sparkles } from "lucide-react";
import { createClient } from "@supabase/supabase-js";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

    // Si Supabase está configurado en producción/staging
    if (supabaseUrl && supabaseKey && !supabaseKey.includes("dummy-local") && supabaseUrl.startsWith("http")) {
      try {
        const supabase = createClient(supabaseUrl, supabaseKey);
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message || "Credenciales incorrectas.");
          setLoading(false);
          return;
        }

        if (data.session) {
          document.cookie = `mpb_admin_session=${data.session.access_token}; path=/; max-age=86400; SameSite=Lax`;
          router.push("/");
          router.refresh();
          return;
        }
      } catch (err: any) {
        setErrorMsg("Error al conectar con el servidor de autenticación.");
        setLoading(false);
        return;
      }
    }

    // Modo local / Fallback para desarrollo:
    // Permite login con credenciales de administrador
    if (email === "admin@miapastabella.com" && password === "pastabella2026") {
      document.cookie = `mpb_admin_session=local-admin-token; path=/; max-age=86400; SameSite=Lax`;
      router.push("/");
      router.refresh();
    } else {
      // Si no es el admin default en modo local
      setErrorMsg("Credenciales de prueba: admin@miapastabella.com / pastabella2026 (o credenciales Supabase configuradas)");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF6EE] flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 relative selection:bg-amber-200">
      {/* Fondo decorativo sutil */}
      <div className="absolute inset-0 bg-[radial-gradient(#b45309_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />

      <div className="relative w-full max-w-md">
        {/* Cabecera / Identidad */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-amber-700 text-white shadow-xl shadow-amber-900/10 mb-4 ring-4 ring-amber-100">
            <ChefHat className="h-9 w-9" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#2C1810] tracking-tight">
            Mia Pasta Bella
          </h1>
          <p className="text-xs uppercase font-bold tracking-widest text-amber-700 mt-1">
            Panel de Administración & Control Pro
          </p>
        </div>

        {/* Tarjeta de Login */}
        <div className="bg-white p-7 sm:p-9 rounded-3xl shadow-xl shadow-stone-200/60 border border-stone-200">
          <div className="flex items-center gap-2 text-xs font-semibold text-stone-500 mb-6 pb-4 border-b border-stone-100">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Acceso seguro protegido con encriptación</span>
          </div>

          {errorMsg && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs leading-relaxed">
              {errorMsg}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Correo Electrónico de Administrador
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@miapastabella.com"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-all placeholder:text-stone-400"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-3 h-4 w-4 text-stone-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 text-xs sm:text-sm text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-600 focus:border-amber-600 transition-all placeholder:text-stone-400"
                  required
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-amber-700 hover:bg-amber-800 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-xl text-sm transition-all shadow-md shadow-amber-900/10 active:scale-[0.98]"
              >
                {loading ? (
                  <span>Verificando credenciales...</span>
                ) : (
                  <>
                    <span>Ingresar al Panel de Gestión</span>
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          {/* Ayuda de acceso para desarrollo */}
          <div className="mt-6 pt-5 border-t border-stone-100 bg-amber-50/60 -mx-7 -mb-7 sm:-mx-9 sm:-mb-9 p-5 rounded-b-3xl">
            <div className="flex items-start gap-2 text-[11px] text-amber-900">
              <Sparkles className="h-3.5 w-3.5 text-amber-700 mt-0.5 shrink-0" />
              <div>
                <span className="font-bold">Acceso directo para evaluación:</span>
                <p className="text-amber-800/80 mt-0.5">
                  Usuario: <code className="font-mono font-bold">admin@miapastabella.com</code>
                  <br />
                  Clave: <code className="font-mono font-bold">pastabella2026</code>
                </p>
              </div>
            </div>
          </div>
        </div>

        <p className="text-center text-[11px] text-stone-500 mt-6">
          © 2026 Mia Pasta Bella · Todos los derechos reservados
        </p>
      </div>
    </div>
  );
}
