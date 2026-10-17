import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AdminSidebar } from "@/components/AdminSidebar";
import { AdminContentWrapper } from "@/components/AdminContentWrapper";

export const viewport: Viewport = {
  themeColor: "#4D281B",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Admin Panel | Mia Pasta Bella (NexoraOne)",
  description: "Panel de control administrativo autónomo para Mia Pasta Bella",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Admin Pasta Bella",
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <link rel="apple-touch-icon" href="/images/logo.jpg" />
      </head>
      <body className="bg-gray-50 text-gray-900 antialiased">
        <div className="flex min-h-screen">
          <AdminSidebar />
          <AdminContentWrapper>{children}</AdminContentWrapper>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js').catch(function() {});
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}
