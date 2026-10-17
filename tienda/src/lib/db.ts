/**
 * db.ts — Capa de acceso a datos de la Tienda Pública
 *
 * ARQUITECTURA DE FUENTE DUAL RESILIENTE:
 * - Supabase PostgreSQL es la fuente PRINCIPAL de datos en producción.
 * - Incluye fallback automático a store.json para desarrollo local sin Supabase activo.
 * - Garantiza que la tienda pública cargue siempre a máxima velocidad sin caídas.
 */
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";

export interface TiendaConfig {
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
  es_destacado?: boolean;
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
}

export interface PedidoItemInput {
  producto_id: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface PedidoInput {
  cliente_nombre: string;
  cliente_telefono: string;
  cliente_direccion?: string;
  tipo_entrega: "retiro" | "delivery";
  dia_entrega?: string;
  total_porciones?: number;
  metodo_pago: "efectivo" | "transferencia" | "mercado_pago";
  notas?: string;
  items: PedidoItemInput[];
  total: number;
}

export interface DatabaseStore {
  configuracion: TiendaConfig;
  categorias: CategoriaItem[];
  productos: ProductoItem[];
  clientes: any[];
  proveedores: any[];
  asientos_contables: any[];
  ventas?: any[];
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
    console.error("Error leyendo store.json en tienda:", err);
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
    console.error("Error escribiendo en store.json tienda:", err);
    return false;
  }
}

// ---------------------------------------------------------------------------
// CLIENTE SUPABASE ANÓNIMO PÚBLICO
// ---------------------------------------------------------------------------

let cachedClient: SupabaseClient | null = null;

function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !key.includes("dummy-local") &&
    url.startsWith("http")
  );
}

function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured()) return null;
  if (cachedClient) return cachedClient;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  cachedClient = createClient(url, key);
  return cachedClient;
}

// ---------------------------------------------------------------------------
// CONSULTAS ASYNC DE LA TIENDA
// ---------------------------------------------------------------------------

export async function getConfiguracion(): Promise<TiendaConfig> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("configuracion_sitio")
        .select("*")
        .limit(1)
        .single();

      if (!error && data) {
        return {
          nombre_tienda: data.nombre_tienda ?? "Mia Pasta Bella",
          slogan_principal: data.slogan ?? "Pastas Frescas de Autor",
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
      console.warn("Fallo lectura Supabase configuracion en tienda:", err);
    }
  }

  const local = readLocalStore();
  const c = local?.configuracion ?? {};
  return {
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

export async function getCategorias(): Promise<CategoriaItem[]> {
  const supabase = getSupabaseClient();

  if (supabase) {
    try {
      const { data, error } = await supabase
        .from("categorias")
        .select("*")
        .eq("activo", true)
        .order("orden", { ascending: true });

      if (!error && data && data.length > 0) {
        return data.map((c) => ({
          id: c.id,
          nombre: c.nombre,
          slug: c.slug,
          descripcion: c.descripcion ?? "",
          orden: c.orden ?? 0,
        }));
      }
    } catch (err) {
      console.warn("Fallo lectura Supabase categorias en tienda:", err);
    }
  }

  const local = readLocalStore();
  return (local?.categorias ?? []).map((c: any) => ({
    id: c.id,
    nombre: c.nombre,
    slug: c.slug,
    descripcion: c.descripcion ?? "",
    orden: c.orden ?? 0,
  }));
}

export async function getProductos(): Promise<ProductoItem[]> {
  const supabase = getSupabaseClient();

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
        .eq("activo", true)
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
          activo: true,
          fecha_elaboracion: p.fecha_elaboracion ?? "Elaboración artesanal al día",
          fecha_vencimiento: p.fecha_vencimiento ?? "72 hs en heladera / 90 días en freezer",
          dias_caducidad_fresco: p.dias_caducidad_fresco ?? 3,
          dias_caducidad_congelado: p.dias_caducidad_congelado ?? 90,
        }));
      }
    } catch (err) {
      console.warn("Fallo lectura Supabase productos en tienda:", err);
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
    fecha_elaboracion: p.fecha_elaboracion ?? "Elaboración artesanal al día",
    fecha_vencimiento: p.fecha_vencimiento ?? "72 hs en heladera / 90 días en freezer",
    dias_caducidad_fresco: p.dias_caducidad_fresco ?? 3,
    dias_caducidad_congelado: p.dias_caducidad_congelado ?? 90,
  }));
}

export async function getTiendaData(): Promise<{
  configuracion: TiendaConfig;
  categorias: CategoriaItem[];
  productos: ProductoItem[];
}> {
  const [configuracion, categorias, productos] = await Promise.all([
    getConfiguracion(),
    getCategorias(),
    getProductos(),
  ]);

  return { configuracion, categorias, productos };
}

// ---------------------------------------------------------------------------
// GESTIÓN DE PEDIDOS DESDE LA TIENDA
// ---------------------------------------------------------------------------

export async function crearPedido(pedido: PedidoInput): Promise<{
  success: boolean;
  numero_pedido: string;
  id: string;
}> {
  const supabase = getSupabaseClient();
  const numRandom = Math.floor(1000 + Math.random() * 9000);
  const numeroPedido = `PED-${Date.now().toString().slice(-4)}${numRandom.toString().slice(-2)}`;

  if (supabase) {
    try {
      let clienteId: string | null = null;
      const { data: clienteExistente } = await supabase
        .from("clientes")
        .select("id")
        .eq("telefono", pedido.cliente_telefono)
        .limit(1)
        .maybeSingle();

      if (clienteExistente) {
        clienteId = clienteExistente.id;
      } else {
        const { data: nuevoCliente } = await supabase
          .from("clientes")
          .insert({
            nombre_completo: pedido.cliente_nombre,
            telefono: pedido.cliente_telefono,
            direccion: pedido.cliente_direccion || null,
          })
          .select("id")
          .single();
        if (nuevoCliente) clienteId = nuevoCliente.id;
      }

      const { data: venta, error: ventaError } = await supabase
        .from("ventas")
        .insert({
          numero_comprobante: numeroPedido,
          cliente_id: clienteId,
          estado: "confirmada",
          metodo_pago: pedido.metodo_pago,
          subtotal: pedido.total,
          total: pedido.total,
          notas_entrega: `📅 Tanda: ${pedido.dia_entrega || "Próxima tanda"} | ${
            pedido.tipo_entrega === "delivery"
              ? "🏠 Delivery: " + (pedido.cliente_direccion || "")
              : "🏪 Retiro en fábrica"
          } | Porciones: ${pedido.total_porciones || 0}. ${pedido.notas || ""}`,
          direccion_envio: pedido.cliente_direccion || null,
        })
        .select("id")
        .single();

      if (!ventaError && venta) {
        const itemsToInsert = pedido.items
          .filter((it) => !it.producto_id.startsWith("prod-"))
          .map((it) => ({
            venta_id: venta.id,
            producto_id: it.producto_id,
            cantidad: it.cantidad,
            precio_unitario: it.precio,
            subtotal: it.precio * it.cantidad,
          }));

        if (itemsToInsert.length > 0) {
          await supabase.from("items_venta").insert(itemsToInsert);
        }

        return { success: true, numero_pedido: numeroPedido, id: venta.id };
      }
    } catch (err) {
      console.warn("Fallo inserción pedido en Supabase, usando local:", err);
    }
  }

  // Fallback local en store.json
  const local = readLocalStore();
  const idLocal = `ped-${Date.now()}`;
  if (local) {
    if (!local.ventas) local.ventas = [];
    local.ventas.unshift({
      id: idLocal,
      numero_comprobante: numeroPedido,
      cliente_nombre: pedido.cliente_nombre,
      cliente_telefono: pedido.cliente_telefono,
      cliente_direccion: pedido.cliente_direccion,
      tipo_entrega: pedido.tipo_entrega,
      dia_entrega: pedido.dia_entrega || "Próxima tanda",
      total_porciones: pedido.total_porciones || 0,
      metodo_pago: pedido.metodo_pago,
      total: pedido.total,
      notas: pedido.notas,
      items: pedido.items,
      fecha: new Date().toISOString(),
      estado: "confirmada",
    });
    writeLocalStore(local);
  }

  return { success: true, numero_pedido: numeroPedido, id: idLocal };
}

/**
 * Para retrocompatibilidad síncrona inmediata si se invoca síncronamente
 */
export function getStoreData(): DatabaseStore {
  const local = readLocalStore();
  if (local) return local as DatabaseStore;
  return {
    configuracion: {
      nombre_tienda: "Mia Pasta Bella",
      slogan_principal: "Pastas Frescas de Autor",
      variedades_texto: "",
      atencion_cliente: "",
      compromiso_calidad: "",
      facebook_url: "",
      instagram_url: "",
      whatsapp_numero: "",
      whatsapp_mensaje: "",
      google_maps_url: "",
    },
    categorias: [],
    productos: [],
    clientes: [],
    proveedores: [],
    asientos_contables: [],
  };
}
