/**
 * db.ts — Capa de acceso a datos del panel admin
 *
 * ARQUITECTURA DE FUENTE DUAL RESILIENTE:
 * - Supabase PostgreSQL es la fuente PRINCIPAL y de producción.
 * - Incluye fallback automático a store.json para desarrollo local sin Supabase activo.
 * - Cero caídas por falta de variables o problemas de conectividad local.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

// ---------------------------------------------------------------------------
// TIPOS EXPORTADOS
// ---------------------------------------------------------------------------

export interface TiendaConfig {
  id: string;
  nombre_tienda: string;
  slogan_principal: string;
  variedades_texto: string;
  atencion_cliente: string;
  compromiso_calidad: string;
  facebook_url: string;
  instagram_url: string;
  whatsapp_numero: string;
  whatsapp_mensaje: string;
  google_maps_url: string;
  dias_elaboracion?: string;
  proxima_tanda_fecha?: string;
  cierre_pedidos_info?: string;
  mercado_pago_alias?: string;
  cbu_cuenta?: string;
  titular_cuenta?: string;
  link_pago_mercado_pago?: string;
  qr_pago_imagen_url?: string;
}

export interface ProductoItem {
  id: string;
  categoria_id: string;
  categoria_nombre: string;
  nombre: string;
  ingredientes: string;
  precio: number;
  precio_oferta?: number;
  stock: number;
  unidad_medida: string;
  imagen_url: string;
  tiempo_coccion_minutos: number;
  rinde_porciones: number;
  es_destacado: boolean;
  activo: boolean;
  fecha_elaboracion?: string;
  fecha_vencimiento?: string;
  dias_caducidad_fresco?: number;
  dias_caducidad_congelado?: number;
}

export interface CategoriaItem {
  id: string;
  nombre: string;
  slug: string;
  descripcion: string;
  orden: number;
  activo: boolean;
}

export interface ClienteItem {
  id: string;
  nombre: string;
  telefono: string;
  email: string;
  direccion: string;
  notas: string;
  total_compras: number;
  cantidad_pedidos: number;
}

export interface ProveedorItem {
  id: string;
  razon_social: string;
  contacto: string;
  telefono: string;
  rubro: string;
  dias_entrega: string;
  condiciones_pago: string;
}

export interface AsientoContableItem {
  id: string;
  numero: number;
  fecha: string;
  glosa: string;
  debe_cuenta: string;
  debe_monto: number;
  haber_cuenta: string;
  haber_monto: number;
  es_automatico: boolean;
}

export interface PedidoLinea {
  id: string;
  producto_nombre: string;
  cantidad: number;
  precio_unitario: number;
  subtotal: number;
}

export interface PedidoAdminItem {
  id: string;
  numero_comprobante: string;
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_direccion: string;
  dia_entrega?: string;
  total_porciones?: number;
  estado: "pendiente" | "confirmada" | "en_preparacion" | "entregada" | "cancelada";
  metodo_pago: string;
  total: number;
  notas_entrega: string;
  fecha: string;
  items: PedidoLinea[];
}

// ---------------------------------------------------------------------------
// HELPERS LOCAL STORE (FALLBACK SEGURO)
// ---------------------------------------------------------------------------

function getStorePath(): string | null {
  const candidates = [
    path.join(process.cwd(), "data", "store.json"),
    path.join(process.cwd(), "..", "data", "store.json"),
    path.join(process.cwd(), "..", "..", "data", "store.json"),
  ];
  for (const c of candidates) {
    if (fs.existsSync(c)) return c;
  }
  return null;
}

function readLocalStore(): any {
  const storePath = getStorePath();
  if (!storePath) return null;
  try {
    const raw = fs.readFileSync(storePath, "utf-8");
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error leyendo store.json local:", err);
    return null;
  }
}

function writeLocalStore(data: any): boolean {
  const storePath = getStorePath();
  if (!storePath) return false;
  try {
    fs.writeFileSync(storePath, JSON.stringify(data, null, 2), "utf-8");
    return true;
  } catch (err) {
    console.error("Error escribiendo en store.json local:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// CLIENTE SUPABASE CON SERVICE ROLE (solo en server-side)
// ---------------------------------------------------------------------------

let cachedClient: SupabaseClient | null = null;

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !key.includes("dummy-local") &&
    url.startsWith("http")
  );
}

function getSupabaseAdmin(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  cachedClient = createClient(url, key, {
    auth: { persistSession: false },
  });
  return cachedClient;
}

// ---------------------------------------------------------------------------
// CONFIGURACIÓN DEL SITIO
// ---------------------------------------------------------------------------

export async function getConfiguracion(): Promise<TiendaConfig> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("configuracion_sitio")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        return {
          id: data.id,
          nombre_tienda: data.nombre_tienda,
          slogan_principal: data.slogan ?? "",
          variedades_texto: data.variedades_texto ?? "",
          atencion_cliente: data.atencion_cliente ?? data.horarios_atencion ?? "",
          compromiso_calidad: data.compromiso_calidad ?? "",
          facebook_url: data.facebook_url ?? "",
          instagram_url: data.instagram_url ?? "",
          whatsapp_numero: data.whatsapp_numero ?? "",
          whatsapp_mensaje: data.whatsapp_mensaje_predeterminado ?? "",
          google_maps_url: data.google_maps_url ?? "",
          dias_elaboracion: data.dias_elaboracion ?? "Jueves, Viernes y Domingos",
          proxima_tanda_fecha: data.proxima_tanda_fecha ?? "Viernes 17 de Octubre",
          cierre_pedidos_info: data.cierre_pedidos_info ?? "Tomamos pedidos hasta el Miércoles 20:00 hs",
          mercado_pago_alias: data.mercado_pago_alias ?? "MIAPASTABELLA.MP",
          cbu_cuenta: data.cbu_cuenta ?? "0000003100012345678901",
          titular_cuenta: data.titular_cuenta ?? "Mía Pasta Bella - Fábrica Artesanal",
          link_pago_mercado_pago: data.link_pago_mercado_pago ?? "https://link.mercadopago.com.ar/miapastabella",
          qr_pago_imagen_url: data.qr_pago_imagen_url ?? "",
        };
      }
    } catch (err) {
      console.warn("Fallo lectura Supabase configuracion_sitio, usando local store:", err);
    }
  }

  // Fallback local
  const local = readLocalStore();
  const c = local?.configuracion ?? {};
  return {
    id: "local-config",
    nombre_tienda: c.nombre_tienda ?? "Mia Pasta Bella",
    slogan_principal: c.slogan_principal ?? "Pastas Frescas de Autor",
    variedades_texto: c.variedades_texto ?? "",
    atencion_cliente: c.atencion_cliente ?? "",
    compromiso_calidad: c.compromiso_calidad ?? "",
    facebook_url: c.facebook_url ?? "",
    instagram_url: c.instagram_url ?? "",
    whatsapp_numero: c.whatsapp_numero ?? "",
    whatsapp_mensaje: c.whatsapp_mensaje ?? "",
    google_maps_url: c.google_maps_url ?? "",
    dias_elaboracion: c.dias_elaboracion ?? "Jueves, Viernes y Domingos",
    proxima_tanda_fecha: c.proxima_tanda_fecha ?? "Viernes 17 de Octubre",
    cierre_pedidos_info: c.cierre_pedidos_info ?? "Tomamos pedidos hasta el Miércoles 20:00 hs",
    mercado_pago_alias: c.mercado_pago_alias ?? "MIAPASTABELLA.MP",
    cbu_cuenta: c.cbu_cuenta ?? "0000003100012345678901",
    titular_cuenta: c.titular_cuenta ?? "Mía Pasta Bella - Fábrica Artesanal",
    link_pago_mercado_pago: c.link_pago_mercado_pago ?? "https://link.mercadopago.com.ar/miapastabella",
    qr_pago_imagen_url: c.qr_pago_imagen_url ?? "",
  };
}

export async function updateConfiguracion(
  config: Partial<TiendaConfig>
): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      await supabase
        .from("configuracion_sitio")
        .update({
          nombre_tienda: config.nombre_tienda,
          slogan: config.slogan_principal,
          variedades_texto: config.variedades_texto,
          atencion_cliente: config.atencion_cliente,
          compromiso_calidad: config.compromiso_calidad,
          facebook_url: config.facebook_url,
          instagram_url: config.instagram_url,
          whatsapp_numero: config.whatsapp_numero,
          whatsapp_mensaje_predeterminado: config.whatsapp_mensaje,
          google_maps_url: config.google_maps_url,
          updated_at: new Date().toISOString(),
        })
        .neq("id", "00000000-0000-0000-0000-000000000000");
    } catch (err) {
      console.warn("Fallo actualización Supabase config, actualizando local:", err);
    }
  }

  // Siempre reflejar en store.json para mantener sincronía local
  const local = readLocalStore();
  if (local) {
    local.configuracion = { ...local.configuracion, ...config };
    writeLocalStore(local);
  }
}

// ---------------------------------------------------------------------------
// CATEGORÍAS
// ---------------------------------------------------------------------------

export async function getCategorias(): Promise<CategoriaItem[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .order("orden", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          slug: c.slug,
          descripcion: c.descripcion ?? "",
          orden: c.orden,
          activo: c.activo,
        }));
      }
    } catch (err) {
      console.warn("Fallo lectura Supabase categorias, usando local store:", err);
    }
  }

  const local = readLocalStore();
  return (local?.categorias ?? []).map((c: any) => ({
    id: c.id,
    nombre: c.nombre,
    slug: c.slug,
    descripcion: c.descripcion ?? "",
    orden: c.orden ?? 0,
    activo: c.activo ?? true,
  }));
}

// ---------------------------------------------------------------------------
// PRODUCTOS
// ---------------------------------------------------------------------------

export async function getProductos(): Promise<ProductoItem[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("productos")
        .select(`
          *,
          categorias (
            id,
            nombre,
            slug
          )
        `)
        .order("created_at", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          categoria_id: p.categoria_id,
          categoria_nombre: p.categorias?.nombre ?? "",
          nombre: p.nombre,
          ingredientes: p.descripcion ?? "",
          precio: Number(p.precio),
          precio_oferta: p.precio_oferta ? Number(p.precio_oferta) : undefined,
          stock: p.stock ?? 0,
          unidad_medida: p.unidad_medida ?? "porción",
          imagen_url: p.imagen_url ?? "",
          tiempo_coccion_minutos: p.tiempo_coccion_minutos ?? 0,
          rinde_porciones: p.rinde_porciones ?? 2,
          es_destacado: p.es_destacado ?? false,
          activo: p.activo !== false,
          fecha_elaboracion: p.fecha_elaboracion ?? "Elaboración fresca de la tanda",
          fecha_vencimiento: p.fecha_vencimiento ?? "72 hs en heladera / 90 días en freezer",
          dias_caducidad_fresco: p.dias_caducidad_fresco ?? 3,
          dias_caducidad_congelado: p.dias_caducidad_congelado ?? 90,
        }));
      }
    } catch (err) {
      console.warn("Fallo lectura Supabase productos, usando local store:", err);
    }
  }

  const local = readLocalStore();
  return (local?.productos ?? []).map((p: any) => ({
    id: p.id,
    categoria_id: p.categoria_id,
    categoria_nombre: p.categoria_nombre ?? "",
    nombre: p.nombre,
    ingredientes: p.ingredientes ?? p.descripcion ?? "",
    precio: Number(p.precio),
    precio_oferta: p.precio_oferta ? Number(p.precio_oferta) : undefined,
    stock: p.stock ?? 0,
    unidad_medida: p.unidad_medida ?? "porción",
    imagen_url: p.imagen_url ?? "",
    tiempo_coccion_minutos: p.tiempo_coccion_minutos ?? 0,
    rinde_porciones: p.rinde_porciones ?? 2,
    es_destacado: p.es_destacado ?? false,
    activo: p.activo !== false,
    fecha_elaboracion: p.fecha_elaboracion ?? "Elaboración fresca de la tanda",
    fecha_vencimiento: p.fecha_vencimiento ?? "72 hs en heladera / 90 días en freezer",
    dias_caducidad_fresco: p.dias_caducidad_fresco ?? 3,
    dias_caducidad_congelado: p.dias_caducidad_congelado ?? 90,
  }));
}

export async function createProducto(
  prod: Omit<ProductoItem, "id" | "categoria_nombre">
): Promise<string> {
  const supabase = getSupabaseAdmin();

  const slug = prod.nombre
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .trim();

  let newId = `prod-${Date.now()}`;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("productos")
        .insert({
          categoria_id: prod.categoria_id,
          nombre: prod.nombre,
          slug: `${slug}-${Date.now()}`,
          descripcion: prod.ingredientes,
          precio: prod.precio,
          precio_oferta: prod.precio_oferta ?? null,
          stock: prod.stock,
          unidad_medida: prod.unidad_medida,
          imagen_url: prod.imagen_url || null,
          tiempo_coccion_minutos: prod.tiempo_coccion_minutos,
          rinde_porciones: prod.rinde_porciones,
          es_destacado: prod.es_destacado,
          activo: prod.activo,
        })
        .select("id")
        .single();

      if (!error && data) {
        newId = data.id;
      }
    } catch (err) {
      console.warn("Fallo inserción en Supabase, guardando en local:", err);
    }
  }

  // Reflejar localmente
  const local = readLocalStore();
  if (local) {
    const cat = local.categorias?.find((c: any) => c.id === prod.categoria_id);
    const newProd = {
      id: newId,
      ...prod,
      categoria_nombre: cat?.nombre ?? "",
      fecha_elaboracion: prod.fecha_elaboracion ?? "Elaboración fresca de la tanda",
      fecha_vencimiento: prod.fecha_vencimiento ?? "72 hs en heladera / 90 días en freezer",
      dias_caducidad_fresco: prod.dias_caducidad_fresco ?? 3,
      dias_caducidad_congelado: prod.dias_caducidad_congelado ?? 90,
    };
    local.productos = [newProd, ...(local.productos ?? [])];
    writeLocalStore(local);
  }

  return newId;
}

export async function updateProducto(
  id: string,
  updates: Partial<ProductoItem>
): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      await supabase
        .from("productos")
        .update({
          nombre: updates.nombre,
          descripcion: updates.ingredientes,
          precio: updates.precio,
          precio_oferta: updates.precio_oferta ?? null,
          stock: updates.stock,
          unidad_medida: updates.unidad_medida,
          imagen_url: updates.imagen_url ?? null,
          tiempo_coccion_minutos: updates.tiempo_coccion_minutos,
          rinde_porciones: updates.rinde_porciones,
          es_destacado: updates.es_destacado,
          activo: updates.activo,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);
    } catch (err) {
      console.warn("Fallo update en Supabase, actualizando local:", err);
    }
  }

  const local = readLocalStore();
  if (local) {
    local.productos = (local.productos ?? []).map((p: any) => {
      if (p.id === id) {
        return { ...p, ...updates };
      }
      return p;
    });
    writeLocalStore(local);
  }
}

export async function deleteProducto(id: string): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      await supabase.from("productos").delete().eq("id", id);
    } catch (err) {
      console.warn("Fallo delete en Supabase:", err);
    }
  }

  const local = readLocalStore();
  if (local) {
    local.productos = (local.productos ?? []).filter((p: any) => p.id !== id);
    writeLocalStore(local);
  }
}

// ---------------------------------------------------------------------------
// CLIENTES
// ---------------------------------------------------------------------------

export async function getClientes(): Promise<ClienteItem[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .select("*")
        .order("total_compras", { ascending: false });

      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          nombre: c.nombre_completo ?? c.nombre,
          telefono: c.telefono ?? "",
          email: c.email ?? "",
          direccion: c.direccion ?? "",
          notas: c.notas_preferencias ?? c.notas ?? "",
          total_compras: Number(c.total_compras ?? 0),
          cantidad_pedidos: c.cantidad_pedidos ?? 0,
        }));
      }
    } catch (err) {
      console.warn("Fallo lectura Supabase clientes:", err);
    }
  }

  const local = readLocalStore();
  return (local?.clientes ?? []).map((c: any) => ({
    id: c.id,
    nombre: c.nombre_completo ?? c.nombre,
    telefono: c.telefono ?? "",
    email: c.email ?? "",
    direccion: c.direccion ?? "",
    notas: c.notas_preferencias ?? c.notas ?? "",
    total_compras: Number(c.total_compras ?? 0),
    cantidad_pedidos: c.cantidad_pedidos ?? 0,
  }));
}

export async function createCliente(
  cliente: Omit<ClienteItem, "id" | "total_compras" | "cantidad_pedidos">
): Promise<string> {
  const supabase = getSupabaseAdmin();
  let newId = `cli-${Date.now()}`;

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("clientes")
        .insert({
          nombre_completo: cliente.nombre,
          telefono: cliente.telefono,
          email: cliente.email || null,
          direccion: cliente.direccion || null,
          notas_preferencias: cliente.notas || null,
        })
        .select("id")
        .single();

      if (!error && data) {
        newId = data.id;
      }
    } catch (err) {
      console.warn("Fallo inserción cliente en Supabase:", err);
    }
  }

  const local = readLocalStore();
  if (local) {
    const newCli = {
      id: newId,
      nombre_completo: cliente.nombre,
      telefono: cliente.telefono,
      email: cliente.email,
      direccion: cliente.direccion,
      notas_preferencias: cliente.notas,
      total_compras: 0,
      cantidad_pedidos: 0,
    };
    local.clientes = [newCli, ...(local.clientes ?? [])];
    writeLocalStore(local);
  }

  return newId;
}

// ---------------------------------------------------------------------------
// PROVEEDORES
// ---------------------------------------------------------------------------

export async function getProveedores(): Promise<ProveedorItem[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("proveedores")
        .select("*")
        .eq("activo", true)
        .order("razon_social", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((p) => ({
          id: p.id,
          razon_social: p.razon_social,
          contacto: p.nombre_contacto ?? "",
          telefono: p.telefono ?? "",
          rubro: p.rubro ?? "",
          dias_entrega: p.dias_entrega ?? "",
          condiciones_pago: p.condiciones_pago ?? "",
        }));
      }
    } catch (err) {
      console.warn("Fallo lectura Supabase proveedores:", err);
    }
  }

  const local = readLocalStore();
  return (local?.proveedores ?? []).map((p: any) => ({
    id: p.id,
    razon_social: p.razon_social,
    contacto: p.nombre_contacto ?? p.contacto ?? "",
    telefono: p.telefono ?? "",
    rubro: p.rubro ?? "",
    dias_entrega: p.dias_entrega ?? "",
    condiciones_pago: p.condiciones_pago ?? "",
  }));
}

// ---------------------------------------------------------------------------
// ASIENTOS CONTABLES
// ---------------------------------------------------------------------------

export async function getAsientosContables(): Promise<AsientoContableItem[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("asientos_contables")
        .select(`
          *,
          lineas_asiento_contable (
            id,
            debe,
            haber,
            descripcion,
            cuentas_contables (codigo, nombre)
          )
        `)
        .order("numero_asiento", { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        return data.map((a) => {
          const lineas = a.lineas_asiento_contable ?? [];
          const lineaDebe = lineas.find((l: any) => l.debe > 0);
          const lineaHaber = lineas.find((l: any) => l.haber > 0);

          return {
            id: a.id,
            numero: a.numero_asiento,
            fecha: a.fecha,
            glosa: a.glosa_concepto,
            debe_cuenta:
              lineaDebe?.cuentas_contables?.nombre ?? lineaDebe?.descripcion ?? "",
            debe_monto: Number(lineaDebe?.debe ?? 0),
            haber_cuenta:
              lineaHaber?.cuentas_contables?.nombre ?? lineaHaber?.descripcion ?? "",
            haber_monto: Number(lineaHaber?.haber ?? 0),
            es_automatico: a.es_automatico,
          };
        });
      }
    } catch (err) {
      console.warn("Fallo lectura Supabase asientos:", err);
    }
  }

  const local = readLocalStore();
  return (local?.asientos_contables ?? []).map((a: any) => ({
    id: a.id,
    numero: a.numero,
    fecha: a.fecha,
    glosa: a.glosa,
    debe_cuenta: a.debe_cuenta,
    debe_monto: Number(a.debe_monto ?? 0),
    haber_cuenta: a.haber_cuenta,
    haber_monto: Number(a.haber_monto ?? 0),
    es_automatico: a.es_automatico ?? false,
  }));
}

export async function createAsientoContable(params: {
  glosa: string;
  debe_cuenta_codigo: string;
  haber_cuenta_codigo: string;
  monto: number;
}): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data: cuentas } = await supabase
        .from("cuentas_contables")
        .select("id, codigo")
        .in("codigo", [params.debe_cuenta_codigo, params.haber_cuenta_codigo]);

      const cuentaDebe = cuentas?.find((c) => c.codigo === params.debe_cuenta_codigo);
      const cuentaHaber = cuentas?.find((c) => c.codigo === params.haber_cuenta_codigo);

      if (cuentaDebe && cuentaHaber) {
        const { data: asiento } = await supabase
          .from("asientos_contables")
          .insert({
            fecha: new Date().toISOString().split("T")[0],
            glosa_concepto: params.glosa,
            es_automatico: false,
          })
          .select("id")
          .single();

        if (asiento) {
          await supabase.from("lineas_asiento_contable").insert([
            {
              asiento_id: asiento.id,
              cuenta_id: cuentaDebe.id,
              debe: params.monto,
              haber: 0,
              descripcion: params.glosa,
            },
            {
              asiento_id: asiento.id,
              cuenta_id: cuentaHaber.id,
              debe: 0,
              haber: params.monto,
              descripcion: params.glosa,
            },
          ]);
        }
      }
    } catch (err) {
      console.warn("Fallo inserción en Supabase contabilidad:", err);
    }
  }

  const local = readLocalStore();
  if (local) {
    const nextNum = (local.asientos_contables?.length ?? 0) + 1;
    const newAsiento = {
      id: `asiento-${Date.now()}`,
      numero: nextNum,
      fecha: new Date().toISOString().split("T")[0],
      glosa: params.glosa,
      debe_cuenta: params.debe_cuenta_codigo,
      debe_monto: params.monto,
      haber_cuenta: params.haber_cuenta_codigo,
      haber_monto: params.monto,
      es_automatico: false,
    };
    local.asientos_contables = [newAsiento, ...(local.asientos_contables ?? [])];
    writeLocalStore(local);
  }
}

// ---------------------------------------------------------------------------
// GESTIÓN DE PEDIDOS / VENTAS (PANEL ADMIN)
// ---------------------------------------------------------------------------

export async function getPedidosAdmin(): Promise<PedidoAdminItem[]> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("ventas")
        .select(`
          id,
          numero_comprobante,
          estado,
          metodo_pago,
          total,
          notas_entrega,
          direccion_envio,
          created_at,
          clientes (
            nombre_completo,
            telefono
          ),
          items_venta (
            id,
            cantidad,
            precio_unitario,
            subtotal,
            productos (
              nombre
            )
          )
        `)
        .order("created_at", { ascending: false })
        .limit(100);

      if (!error && data && data.length > 0) {
        return data.map((v: any) => ({
          id: v.id,
          numero_comprobante: v.numero_comprobante || `PED-${v.id.slice(0, 4)}`,
          cliente_nombre: v.clientes?.nombre_completo || "Cliente Mostrador",
          cliente_telefono: v.clientes?.telefono || "",
          cliente_direccion: v.direccion_envio || "",
          estado: v.estado,
          metodo_pago: v.metodo_pago,
          total: Number(v.total || 0),
          notas_entrega: v.notas_entrega || "",
          fecha: v.created_at,
          items: (v.items_venta || []).map((it: any) => ({
            id: it.id,
            producto_nombre: it.productos?.nombre || "Variedad Artesanal",
            cantidad: it.cantidad,
            precio_unitario: Number(it.precio_unitario),
            subtotal: Number(it.subtotal),
          })),
        }));
      }
    } catch (err) {
      console.warn("Fallo lectura ventas Supabase, usando local store:", err);
    }
  }

  // Fallback local en store.json
  const local = readLocalStore();
  return (local?.ventas ?? []).map((v: any) => ({
    id: v.id,
    numero_comprobante: v.numero_comprobante || `PED-${v.id.slice(0, 4)}`,
    cliente_nombre: v.cliente_nombre || "Cliente Mostrador",
    cliente_telefono: v.cliente_telefono || "",
    cliente_direccion: v.cliente_direccion || "",
    dia_entrega: v.dia_entrega || "Próxima tanda",
    total_porciones:
      v.total_porciones ||
      (v.items || []).reduce(
        (acc: number, it: any) => acc + (it.cantidad || 1) * 2,
        0
      ),
    estado: v.estado || "confirmada",
    metodo_pago: v.metodo_pago || "efectivo",
    total: Number(v.total || 0),
    notas_entrega: v.notas || "",
    fecha: v.fecha || new Date().toISOString(),
    items: (v.items || []).map((it: any) => ({
      id: it.id || `it-${Math.random()}`,
      producto_nombre: it.nombre || "Variedad",
      cantidad: it.cantidad || 1,
      precio_unitario: Number(it.precio || 0),
      subtotal: Number((it.precio || 0) * (it.cantidad || 1)),
    })),
  }));
}

export async function updatePedidoEstado(
  id: string,
  nuevoEstado: "pendiente" | "confirmada" | "en_preparacion" | "entregada" | "cancelada"
): Promise<void> {
  const supabase = getSupabaseAdmin();

  if (supabase) {
    try {
      await supabase
        .from("ventas")
        .update({ estado: nuevoEstado, updated_at: new Date().toISOString() })
        .eq("id", id);
    } catch (err) {
      console.warn("Fallo actualización estado pedido en Supabase:", err);
    }
  }

  const local = readLocalStore();
  if (local && local.ventas) {
    local.ventas = local.ventas.map((v: any) =>
      v.id === id ? { ...v, estado: nuevoEstado } : v
    );
    writeLocalStore(local);
  }
}

// ---------------------------------------------------------------------------
// DASHBOARD — Datos agregados para el panel principal
// ---------------------------------------------------------------------------

export async function getDashboardStats() {
  const [productos, clientes, asientos, pedidos] = await Promise.all([
    getProductos(),
    getClientes(),
    getAsientosContables(),
    getPedidosAdmin(),
  ]);

  const totalProductos = productos.length;
  const totalStock = productos.reduce((acc, p) => acc + (p.stock ?? 0), 0);
  const stockBajo = productos.filter((p) => p.activo && p.stock <= 5).length;
  const pedidosPendientes = pedidos.filter(
    (p) => p.estado === "pendiente" || p.estado === "confirmada" || p.estado === "en_preparacion"
  ).length;

  return {
    totalProductos,
    totalStock,
    stockBajo,
    totalClientes: clientes.length,
    totalAsientos: asientos.length,
    pedidosTotales: pedidos.length,
    pedidosPendientes,
  };
}

// ---------------------------------------------------------------------------
// LEGACY COMPATIBILITY
// ---------------------------------------------------------------------------

/** @deprecated Usar funciones async directas getProductos(), etc. */
export function getStoreData() {
  const local = readLocalStore();
  if (local) return local;
  return {
    configuracion: {},
    categorias: [],
    productos: [],
    clientes: [],
    proveedores: [],
    asientos_contables: [],
  };
}
