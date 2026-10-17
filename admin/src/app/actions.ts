"use server";

import { revalidatePath } from "next/cache";
import {
  updateConfiguracion,
  createProducto,
  updateProducto,
  deleteProducto,
  createCliente,
  createAsientoContable,
  updatePedidoEstado,
} from "@/lib/db";

// ---------------------------------------------------------------------------
// CONFIGURACIÓN DEL SITIO
// ---------------------------------------------------------------------------

export async function updateConfigAction(formData: FormData): Promise<void> {
  await updateConfiguracion({
    nombre_tienda: formData.get("nombre_tienda") as string,
    slogan_principal: formData.get("slogan_principal") as string,
    variedades_texto: formData.get("variedades_texto") as string,
    atencion_cliente: formData.get("atencion_cliente") as string,
    compromiso_calidad: formData.get("compromiso_calidad") as string,
    facebook_url: formData.get("facebook_url") as string,
    instagram_url: formData.get("instagram_url") as string,
    whatsapp_numero: formData.get("whatsapp_numero") as string,
    whatsapp_mensaje: formData.get("whatsapp_mensaje") as string,
    google_maps_url: formData.get("google_maps_url") as string,
    dias_elaboracion: (formData.get("dias_elaboracion") as string) || "Jueves, Viernes y Domingos",
    proxima_tanda_fecha: (formData.get("proxima_tanda_fecha") as string) || "Viernes 17 de Octubre",
    cierre_pedidos_info: (formData.get("cierre_pedidos_info") as string) || "Tomamos pedidos hasta el Miércoles 20:00 hs",
    mercado_pago_alias: (formData.get("mercado_pago_alias") as string) || "MIAPASTABELLA.MP",
    cbu_cuenta: (formData.get("cbu_cuenta") as string) || "0000003100012345678901",
    titular_cuenta: (formData.get("titular_cuenta") as string) || "Mía Pasta Bella - Fábrica Artesanal",
    link_pago_mercado_pago: (formData.get("link_pago_mercado_pago") as string) || "https://link.mercadopago.com.ar/miapastabella",
    qr_pago_imagen_url: (formData.get("qr_pago_imagen_url") as string) || "",
  });

  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// PRODUCTOS — CRUD COMPLETO
// ---------------------------------------------------------------------------

export async function updateProductAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  if (!id) throw new Error("ID de producto requerido.");

  await updateProducto(id, {
    nombre: formData.get("nombre") as string,
    categoria_id: formData.get("categoria_id") as string,
    ingredientes: formData.get("ingredientes") as string,
    precio: Number(formData.get("precio")),
    precio_oferta: formData.get("precio_oferta")
      ? Number(formData.get("precio_oferta"))
      : undefined,
    stock: Number(formData.get("stock")),
    unidad_medida: formData.get("unidad_medida") as string,
    imagen_url: (formData.get("imagen_url") as string) || "",
    tiempo_coccion_minutos: Number(formData.get("tiempo_coccion_minutos")),
    rinde_porciones: Number(formData.get("rinde_porciones")),
    es_destacado: formData.get("es_destacado") === "true",
    activo: formData.get("activo") === "true",
    fecha_elaboracion: (formData.get("fecha_elaboracion") as string) || "Elaboración fresca de la tanda",
    fecha_vencimiento: (formData.get("fecha_vencimiento") as string) || "72 hs en heladera / 90 días en freezer",
    dias_caducidad_fresco: Number(formData.get("dias_caducidad_fresco")) || 3,
    dias_caducidad_congelado: Number(formData.get("dias_caducidad_congelado")) || 90,
  });

  revalidatePath("/", "layout");
}

export async function createProductAction(formData: FormData): Promise<void> {
  await createProducto({
    categoria_id: (formData.get("categoria_id") as string) || "",
    nombre: (formData.get("nombre") as string) || "Nueva Variedad",
    ingredientes: (formData.get("ingredientes") as string) || "",
    precio: Number(formData.get("precio")) || 5000,
    precio_oferta: formData.get("precio_oferta")
      ? Number(formData.get("precio_oferta"))
      : undefined,
    stock: Number(formData.get("stock")) || 20,
    unidad_medida: (formData.get("unidad_medida") as string) || "porción (500g)",
    imagen_url: (formData.get("imagen_url") as string) || "",
    tiempo_coccion_minutos: Number(formData.get("tiempo_coccion_minutos")) || 5,
    rinde_porciones: Number(formData.get("rinde_porciones")) || 2,
    es_destacado: formData.get("es_destacado") === "true",
    activo: true,
    fecha_elaboracion: (formData.get("fecha_elaboracion") as string) || "Elaboración fresca de la tanda",
    fecha_vencimiento: (formData.get("fecha_vencimiento") as string) || "72 hs en heladera / 90 días en freezer",
    dias_caducidad_fresco: Number(formData.get("dias_caducidad_fresco")) || 3,
    dias_caducidad_congelado: Number(formData.get("dias_caducidad_congelado")) || 90,
  });

  revalidatePath("/", "layout");
}

export async function deleteProductAction(id: string): Promise<void> {
  if (!id) throw new Error("ID de producto requerido.");
  await deleteProducto(id);
  revalidatePath("/", "layout");
}

// ---------------------------------------------------------------------------
// CLIENTES
// ---------------------------------------------------------------------------

export async function createCustomerAction(formData: FormData): Promise<void> {
  await createCliente({
    nombre: formData.get("nombre") as string,
    telefono: formData.get("telefono") as string,
    email: (formData.get("email") as string) || "",
    direccion: (formData.get("direccion") as string) || "",
    notas: (formData.get("notas") as string) || "",
  });

  revalidatePath("/crm");
}

// ---------------------------------------------------------------------------
// CONTABILIDAD
// ---------------------------------------------------------------------------

export async function createAccountingEntryAction(
  formData: FormData
): Promise<void> {
  const monto = Number(formData.get("monto"));
  if (!monto || monto <= 0) throw new Error("El monto debe ser mayor a cero.");

  // Los valores del select ya son códigos de cuenta (ej: "1.1.01")
  const debeRaw = (formData.get("debe_cuenta") as string) || "";
  const haberRaw = (formData.get("haber_cuenta") as string) || "";

  // Extraer el código (primero antes del espacio): "1.1.01 Caja y Efectivo" → "1.1.01"
  const debeCodigo = debeRaw.split(" ")[0];
  const haberCodigo = haberRaw.split(" ")[0];

  await createAsientoContable({
    glosa: (formData.get("glosa") as string) || "Asiento manual",
    debe_cuenta_codigo: debeCodigo,
    haber_cuenta_codigo: haberCodigo,
    monto,
  });

  revalidatePath("/contabilidad");
}

// ---------------------------------------------------------------------------
// GESTIÓN DE PEDIDOS
// ---------------------------------------------------------------------------

export async function updateOrderStatusAction(formData: FormData): Promise<void> {
  const id = formData.get("id") as string;
  const nuevoEstado = formData.get("estado") as any;
  if (!id || !nuevoEstado) throw new Error("ID y nuevo estado requeridos.");

  await updatePedidoEstado(id, nuevoEstado);

  revalidatePath("/pedidos");
  revalidatePath("/");
}
