import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import Medicamento from "@/models/Medicamento";
import Receta from "@/models/Receta";

interface RecetaItem {
  medicamentoId: string;
  cantidad: number;
}

export async function GET() {
  try {
    await connectDB();
    const historial = await Receta.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(historial);
  } catch (error) {
    console.error("Error obteniendo historial:", error);
    return NextResponse.json(
      { error: "No se pudo obtener el historial de recetas." },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const items: RecetaItem[] = body.items;

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Se necesitan medicamentos para procesar la receta." },
        { status: 400 }
      );
    }

    await connectDB();

    const detalles: {
      medicamentoId: string;
      nombre: string;
      presentacion?: string;
      via?: string;
      cantidad: number;
    }[] = [];

    for (const item of items) {
      if (!item.medicamentoId || typeof item.cantidad !== "number" || item.cantidad <= 0) {
        return NextResponse.json(
          { error: "Datos de medicamento inválidos." },
          { status: 400 }
        );
      }

      const medicamento = await Medicamento.findById(item.medicamentoId);

      if (!medicamento) {
        return NextResponse.json(
          { error: `Medicamento con ID ${item.medicamentoId} no encontrado.` },
          { status: 404 }
        );
      }

      if (medicamento.stock < item.cantidad) {
        return NextResponse.json(
          {
            error: `Stock insuficiente para ${medicamento.nombre}. Disponible: ${medicamento.stock}, solicitado: ${item.cantidad}`,
          },
          { status: 400 }
        );
      }

      detalles.push({
        medicamentoId: medicamento._id.toString(),
        nombre: medicamento.nombre,
        presentacion: medicamento.presentacion,
        via: medicamento.via,
        cantidad: item.cantidad,
      });
    }

    const operaciones = items.map(async (item) => {
      return Medicamento.findByIdAndUpdate(
        item.medicamentoId,
        { $inc: { stock: -item.cantidad } },
        { new: true }
      );
    });

    const resultados = await Promise.all(operaciones);

    await Receta.create({
      items: detalles,
      totalMedicamentos: detalles.reduce((acc, item) => acc + item.cantidad, 0),
    });

    return NextResponse.json({ ok: true, medicamentos: resultados });
  } catch (error) {
    console.error("Error procesando receta:", error);
    return NextResponse.json(
      { error: "Error al procesar la receta." },
      { status: 500 }
    );
  }
}

