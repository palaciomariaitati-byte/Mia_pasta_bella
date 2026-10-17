import { NextResponse } from "next/server";
import { crearPedido, PedidoInput } from "@/lib/db";

export async function POST(req: Request) {
  try {
    const body: PedidoInput = await req.json();

    if (!body.cliente_nombre || !body.cliente_telefono) {
      return NextResponse.json(
        { error: "Nombre y teléfono son obligatorios." },
        { status: 400 }
      );
    }

    if (!body.items || body.items.length === 0) {
      return NextResponse.json(
        { error: "La canasta de pastas no puede estar vacía." },
        { status: 400 }
      );
    }

    const resultado = await crearPedido(body);

    return NextResponse.json(resultado);
  } catch (err: any) {
    console.error("Error al procesar pedido:", err);
    return NextResponse.json(
      { error: "Error al registrar el pedido.", details: err.message },
      { status: 500 }
    );
  }
}
