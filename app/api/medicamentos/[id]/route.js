import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Medicamento from "@/models/Medicamento";

export async function GET(req, context) {
  try {
    await connectDB();

    const { id } = await context.params;   // 👈 ESTA ES LA CLAVE

    console.log("Buscando medicamento con ID:", id);

    if (!id) {
      return NextResponse.json(
        { error: "ID no proporcionado" },
        { status: 400 }
      );
    }

    const medicamento = await Medicamento.findById(id);

    if (!medicamento) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(medicamento, { status: 200 });

  } catch (error) {
    console.error("Error en servidor:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
