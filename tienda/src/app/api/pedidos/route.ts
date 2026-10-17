import { NextResponse } from "next/server";
import { crearPedido, getProductos, PedidoInput } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body: PedidoInput = await req.json();

    // 1. BLINDAJE ZERO-TRUST: Validación y Sanitización de Datos de Cliente
    const cliente_nombre = (body.cliente_nombre || "").trim();
    const cliente_telefono = (body.cliente_telefono || "").trim();

    if (!cliente_nombre || cliente_nombre.length < 2) {
      return NextResponse.json(
        { error: "El nombre completo del cliente es obligatorio." },
        { status: 400 }
      );
    }

    const cleanPhone = cliente_telefono.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 6) {
      return NextResponse.json(
        { error: "Ingrese un número de teléfono o WhatsApp de contacto válido." },
        { status: 400 }
      );
    }

    if (!body.items || !Array.isArray(body.items) || body.items.length === 0) {
      return NextResponse.json(
        { error: "La canasta de pastas no puede estar vacía." },
        { status: 400 }
      );
    }

    // 2. BLINDAJE ZERO-TRUST: Recálculo de Precios y Porciones contra la Base de Datos Real
    // (Impide manipulación de precios desde el navegador / DevTools)
    const productosDB = await getProductos();
    const productosMap = new Map(productosDB.map((p) => [p.id, p]));

    let totalRecalculado = 0;
    let totalPorcionesRecalculado = 0;
    const itemsValidados = [];

    for (const item of body.items) {
      const cantidad = Math.max(1, Math.min(100, Math.floor(Number(item.cantidad) || 1)));
      const prod = productosMap.get(item.producto_id);

      if (!prod) {
        return NextResponse.json(
          { error: `La variedad solicitada (${item.nombre || item.producto_id}) no está disponible en la fábrica.` },
          { status: 400 }
        );
      }

      // Tomar precio oficial del catálogo
      const precioUnitarioReal =
        prod.precio_oferta && prod.precio_oferta > 0 ? prod.precio_oferta : prod.precio;
      const subtotalItem = precioUnitarioReal * cantidad;

      totalRecalculado += subtotalItem;
      totalPorcionesRecalculado += (prod.rinde_porciones || 2) * cantidad;

      itemsValidados.push({
        producto_id: prod.id,
        nombre: prod.nombre,
        precio: precioUnitarioReal,
        cantidad: cantidad,
      });
    }

    // 3. Payload sanitizado y blindado
    const sanitizedPayload: PedidoInput = {
      cliente_nombre: cliente_nombre.slice(0, 100),
      cliente_telefono: cliente_telefono.slice(0, 30),
      cliente_direccion: (body.cliente_direccion || "").slice(0, 200),
      tipo_entrega: body.tipo_entrega === "delivery" ? "delivery" : "retiro",
      dia_entrega: (body.dia_entrega || "Próxima tanda").slice(0, 60),
      total_porciones: totalPorcionesRecalculado,
      metodo_pago: ["efectivo", "transferencia", "mercado_pago"].includes(body.metodo_pago)
        ? body.metodo_pago
        : "mercado_pago",
      notas: (body.notas || "").slice(0, 300),
      items: itemsValidados,
      total: totalRecalculado,
    };

    const resultado = await crearPedido(sanitizedPayload);

    return NextResponse.json({
      ...resultado,
      total_verificado: totalRecalculado,
      porciones_verificadas: totalPorcionesRecalculado,
    });
  } catch (err: any) {
    console.error("Error al procesar pedido en /api/pedidos:", err);
    return NextResponse.json(
      { error: "Error al registrar el pedido.", details: err.message },
      { status: 500 }
    );
  }
}
