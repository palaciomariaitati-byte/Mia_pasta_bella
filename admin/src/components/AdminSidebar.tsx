"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  FileText,
  UtensilsCrossed,
  Users,
  BookOpenCheck,
  ExternalLink,
  ShieldCheck,
  QrCode,
  LogOut,
  ShoppingBag,
} from "lucide-react";

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  if (pathname === "/login") {
    return null;
  }

  const handleLogout = () => {
    document.cookie = "mpb_admin_session=; path=/; max-age=0";
    router.push("/login");
    router.refresh();
  };

  const links = [
    {
      name: "Dashboard General",
      href: "/",
      icon: LayoutDashboard,
    },
    {
      name: "Gestión de Pedidos",
      href: "/pedidos",
      icon: ShoppingBag,
    },
    {
      name: "Editor de Textos (CRUD)",
      href: "/textos",
      icon: FileText,
    },
    {
      name: "Catálogo Pastas & Pizzas",
      href: "/catalogo",
      icon: UtensilsCrossed,
    },
    {
      name: "CRM y Proveedores",
      href: "/crm",
      icon: Users,
    },
    {
      name: "Contabilidad y Asientos",
      href: "/contabilidad",
      icon: BookOpenCheck,
    },
    {
      name: "Generador de Código QR",
      href: "/qr",
      icon: QrCode,
    },
  ];

  return (
    <aside className="w-64 flex-shrink-0 border-r border-gray-200 bg-white min-h-screen flex flex-col justify-between">
      <div>
        {/* BRANDING ADMIN */}
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="rounded-xl bg-amber-700 p-2.5 text-white shadow-sm">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h2 className="font-bold text-gray-900 text-sm leading-tight">
              Mia Pasta Bella
            </h2>
            <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700">
              Panel Administrativo
            </span>
          </div>
        </div>

        {/* NAVEGACIÓN */}
        <nav className="p-4 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon;
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-50 text-amber-900 border border-amber-200 shadow-sm"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                }`}
              >
                <Icon
                  className={`h-4 w-4 ${
                    isActive ? "text-amber-700" : "text-gray-400"
                  }`}
                />
                <span>{link.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* FOOTER LATERAL */}
      <div className="p-4 space-y-3">
        <div className="p-3.5 border border-gray-100 bg-gray-50 rounded-xl">
          <div className="text-[11px] text-gray-500 mb-2 font-medium">
            Acceso Rápido al Cliente
          </div>
          <a
            href="http://localhost:3000"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between text-xs font-bold text-amber-800 hover:text-amber-950 transition-colors"
          >
            <span>Abrir Tienda Pública (3000)</span>
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </div>

        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
        >
          <LogOut className="h-3.5 w-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
