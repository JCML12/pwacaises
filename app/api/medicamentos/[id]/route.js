import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Medicamento from "@/models/Medicamento";

async function getMedicamentoFromParams(context) {
  const { id } = await context.params;

  if (!id) {
    return { error: NextResponse.json({ error: "ID no proporcionado" }, { status: 400 }) };
  }

  return { id };
}

export async function GET(req, context) {
  try {
    await connectDB();

    const { id, error } = await getMedicamentoFromParams(context);

    if (error) return error;

    console.log("Buscando medicamento con ID:", id);

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

export async function PUT(req, context) {
  try {
    await connectDB();

    const { id, error } = await getMedicamentoFromParams(context);
    if (error) return error;

    const data = await req.json();

    if (typeof data.stock !== "undefined") {
      data.stock = Number(data.stock);
    }

    const medicamentoActualizado = await Medicamento.findByIdAndUpdate(id, data, {
      new: true,
      runValidators: true,
    });

    if (!medicamentoActualizado) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json(medicamentoActualizado);
  } catch (error) {
    console.error("Error actualizando:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}

export async function DELETE(req, context) {
  try {
    await connectDB();

    const { id, error } = await getMedicamentoFromParams(context);
    if (error) return error;

    const eliminado = await Medicamento.findByIdAndDelete(id);

    if (!eliminado) {
      return NextResponse.json(
        { error: "No encontrado" },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: "Medicamento eliminado" });
  } catch (error) {
    console.error("Error eliminando:", error);
    return NextResponse.json(
      { error: "Error del servidor" },
      { status: 500 }
    );
  }
}
