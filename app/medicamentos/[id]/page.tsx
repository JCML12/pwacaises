"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Header from "@/components/Header";

interface Medicamento {
  _id: string;
  nombre: string;
  presentacion: string;
  via: string;
  lote: string;
  caducidad: string;
  stock: number;
  codigo: string;
}

interface MedicamentoForm {
  nombre: string;
  presentacion: string;
  via: string;
  lote: string;
  caducidad: string;
  stock: string;
  codigo: string;
}

const initialForm: MedicamentoForm = {
  nombre: "",
  presentacion: "",
  via: "",
  lote: "",
  caducidad: "",
  stock: "",
  codigo: "",
};

export default function DetallePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [medicamento, setMedicamento] = useState<Medicamento | null>(null);
  const [formData, setFormData] = useState<MedicamentoForm>(initialForm);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const cargar = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/medicamentos/${id}`, { cache: "no-store" });

        if (!res.ok) {
          throw new Error("No se pudo obtener el medicamento");
        }

        const data = await res.json();
        setMedicamento(data);
        setFormData({
          nombre: data.nombre || "",
          presentacion: data.presentacion || "",
          via: data.via || "",
          lote: data.lote || "",
          caducidad: data.caducidad || "",
          stock: data.stock?.toString() ?? "",
          codigo: data.codigo || "",
        });
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Error cargando el medicamento";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    cargar();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = { ...formData, stock: Number(formData.stock) };

      if (Number.isNaN(payload.stock)) {
        throw new Error("El stock debe ser un número válido.");
      }

      const res = await fetch(`/api/medicamentos/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error("No se pudo actualizar el medicamento.");
      }

      const updated = await res.json();
      setMedicamento(updated);
      setIsEditing(false);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado al actualizar.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!id) return;
    const confirmed = window.confirm(
      "¿Seguro que deseas eliminar este medicamento?"
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/medicamentos/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("No se pudo eliminar el medicamento.");
      }

      router.push("/medicamentos");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado al eliminar.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <p className="text-center mt-20 text-gray-700">
        Cargando...
      </p>
    );
  }

  if (!medicamento) {
    return (
      <p className="text-center mt-20 text-red-600">
        No se encontró el medicamento.
      </p>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100">
      <Header />
      <div className="flex flex-col items-center p-6 w-full">
        <Card className="w-full max-w-xl shadow-md border border-gray-200 bg-white">
          <CardHeader>
            <CardTitle className="text-2xl font-semibold text-blue-950 text-center">
              {isEditing ? "Editar medicamento" : "Detalle del medicamento"}
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4 text-gray-800">
            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
                {error}
              </p>
            )}

            {isEditing ? (
              <form className="space-y-4" onSubmit={handleUpdate}>
                {[
                  { label: "Nombre", name: "nombre", type: "text" },
                  { label: "Presentación", name: "presentacion", type: "text" },
                  { label: "Vía de administración", name: "via", type: "text" },
                  { label: "Lote", name: "lote", type: "text" },
                  { label: "Fecha de caducidad", name: "caducidad", type: "date" },
                  { label: "Stock", name: "stock", type: "number", min: "0" },
                  { label: "Código", name: "codigo", type: "text" },
                ].map(({ label, name, type, min }) => (
                  <div key={name}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {label}
                    </label>
                    <input
                      type={type}
                      name={name}
                      value={formData[name as keyof MedicamentoForm]}
                      onChange={handleChange}
                      min={min}
                      className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
                      required
                    />
                  </div>
                ))}

                <div className="flex flex-col gap-3">
                  <Button
                    type="submit"
                    className="bg-blue-950 text-white hover:bg-blue-900 disabled:opacity-60"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Guardando..." : "Guardar cambios"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setError(null);
                      setFormData({
                        nombre: medicamento.nombre,
                        presentacion: medicamento.presentacion,
                        via: medicamento.via,
                        lote: medicamento.lote,
                        caducidad: medicamento.caducidad,
                        stock: medicamento.stock.toString(),
                        codigo: medicamento.codigo,
                      });
                    }}
                  >
                    Cancelar
                  </Button>
                </div>
              </form>
            ) : (
              <div className="space-y-2">
                <p><strong>Nombre:</strong> {medicamento.nombre}</p>
                <p><strong>Presentación:</strong> {medicamento.presentacion}</p>
                <p><strong>Vía:</strong> {medicamento.via}</p>
                <p><strong>Lote:</strong> {medicamento.lote}</p>
                <p><strong>Caducidad:</strong> {medicamento.caducidad}</p>
                <p><strong>Stock:</strong> {medicamento.stock}</p>
                <p><strong>Código:</strong> {medicamento.codigo}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex flex-col sm:flex-row gap-3 mt-6 w-full max-w-xl">
          {!isEditing && (
            <Button
              className="flex-1 bg-blue-950 text-white hover:bg-blue-900"
              onClick={() => setIsEditing(true)}
            >
              Editar
            </Button>
          )}
          <Button
            variant="destructive"
            className="flex-1"
            onClick={handleDelete}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Procesando..." : "Eliminar"}
          </Button>
          <Button
            onClick={() => router.push("/medicamentos")}
            variant="outline"
            className="flex-1 border-blue-950 text-blue-950 hover:bg-blue-100"
          >
            Volver al listado
          </Button>
        </div>
      </div>
    </main>
  );
}
