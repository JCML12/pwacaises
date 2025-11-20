"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";
import { useRouter } from "next/navigation";

export default function DetallePage() {
  const router = useRouter();

  // 🔹 Por ahora datos simulados (puedes reemplazar con props, context o fetch)
  const medicamento = {
    nombre: "Paracetamol",
    presentacion: "Tabletas 500 mg",
    via: "Oral",
    lote: "A1234B",
    caducidad: "2026-05-10",
    stock: 25,
    codigo: "MED-001",
  };

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col items-center p-6">
        <Card className="w-full max-w-xl shadow-md border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-950 text-center">
              Detalle del medicamento
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-gray-800">
            <div>
              <p className="font-semibold text-blue-950">Nombre:</p>
              <p>{medicamento.nombre}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-950">Presentación:</p>
              <p>{medicamento.presentacion}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-950">Vía de administración:</p>
              <p>{medicamento.via}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-950">Lote:</p>
              <p>{medicamento.lote}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-950">Fecha de caducidad:</p>
              <p>{medicamento.caducidad}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-950">Stock:</p>
              <p>{medicamento.stock}</p>
            </div>
            <div>
              <p className="font-semibold text-blue-950">Código:</p>
              <p>{medicamento.codigo}</p>
            </div>

            <div className="flex flex-wrap justify-center gap-4 mt-6">
              <Button
                className="bg-blue-950 text-white hover:bg-blue-900"
                onClick={() => alert("Editar medicamento")}
              >
                Editar
              </Button>
              <Button
                variant="outline"
                className="border-red-600 text-red-600 hover:bg-red-100"
                onClick={() => confirm("¿Eliminar medicamento?") && alert("Eliminado")}
              >
                Eliminar
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Botón volver */}
        <Button
          onClick={() => router.push("/medicamentos")}
          variant="outline"
          className="mt-6 border-blue-950 text-blue-950 hover:bg-blue-100"
        >
          Volver al listado
        </Button>
      </div>
    </main>
  );
}
