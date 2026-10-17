import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se proporcionó ningún archivo de imagen" },
        { status: 400 }
      );
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const originalExt = path.extname(file.name) || ".jpg";
    const cleanBase = path.basename(file.name, originalExt).replace(/[^a-zA-Z0-9_-]/g, "");
    const filename = `prod_${Date.now()}_${cleanBase || "pasta"}${originalExt}`;

    const targetDirs = [
      path.join(process.cwd(), "public", "images", "uploads"),
      path.join(process.cwd(), "..", "admin", "public", "images", "uploads"),
    ];

    targetDirs.forEach((dir) => {
      try {
        if (!fs.existsSync(dir)) {
          fs.mkdirSync(dir, { recursive: true });
        }
        fs.writeFileSync(path.join(dir, filename), buffer);
      } catch (err) {
        console.warn(`No se pudo escribir en ${dir}:`, err);
      }
    });

    const publicUrl = `/images/uploads/${filename}`;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      filename,
      message: "Imagen subida y procesada correctamente",
    });
  } catch (err: any) {
    console.error("Error al procesar subida de archivo en tienda:", err);
    return NextResponse.json(
      { error: err.message || "Error interno al guardar la imagen" },
      { status: 500 }
    );
  }
}
