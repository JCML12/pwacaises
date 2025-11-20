"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

export default function DetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id; // 👈 AHORA FUNCIONA

  const [medicamento, setMedicamento] = useState(null);

  useEffect(() => {
    if (!id) return;

    const cargar = async () => {
      const res = await fetch(`/api/medicamentos/${id}`);
      const data = await res.json();
      setMedicamento(data);
    };

    cargar();
  }, [id]);

  if (!medicamento) {
    return (
      <p className="text-center mt-20 text-gray-700">
        Cargando...
      </p>
    );
  }

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
            <p><strong>Nombre:</strong> {medicamento.nombre}</p>
            <p><strong>Presentación:</strong> {medicamento.presentacion}</p>
            <p><strong>Vía:</strong> {medicamento.via}</p>
            <p><strong>Lote:</strong> {medicamento.lote}</p>
            <p><strong>Caducidad:</strong> {medicamento.caducidad}</p>
            <p><strong>Stock:</strong> {medicamento.stock}</p>
            <p><strong>Codigo:</strong> {medicamento.codigo}</p>
          </CardContent>
        </Card>

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
