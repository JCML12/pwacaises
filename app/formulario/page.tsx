"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import Link from "next/link";
import { useRouter } from "next/navigation";

interface MedicamentoForm {
  nombre: string;
  presentacion: string;
  via: string;
  lote: string;
  caducidad: string;
  stock: string;
  codigo: string;
}

const modo: "agregar" | "editar" = "agregar";

const initialValues: MedicamentoForm = {
  nombre: "",
  presentacion: "",
  via: "",
  lote: "",
  caducidad: "",
  stock: "",
  codigo: "",
};

export default function FormularioPage() {
  const router = useRouter();
  const [formData, setFormData] = useState<MedicamentoForm>(initialValues);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const payload = { ...formData, stock: Number(formData.stock) };

      if (Number.isNaN(payload.stock)) {
        throw new Error("El stock debe ser un número válido.");
      }

      const response = await fetch("/api/medicamentos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("No se pudo guardar el medicamento.");
      }

      router.push("/medicamentos");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error inesperado al guardar.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center justify-start p-4">
    
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-md bg-white p-6 rounded-2xl shadow-md space-y-4"
    >
      <h2 className="text-2xl font-bold text-blue-950 mb-4 text-center">
        {modo === "agregar" ? "Agregar medicamento" : "Editar medicamento"}
      </h2>

      {/* Nombre */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Nombre
        </label>
        <input
          type="text"
          name="nombre"
          value={formData.nombre}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          required
        />
      </div>

      {/* Presentación */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Presentación
        </label>
        <input
          type="text"
          name="presentacion"
          value={formData.presentacion}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          required
        />
      </div>

      {/* Vía de administración */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Vía de administración
        </label>
        <input
          type="text"
          name="via"
          value={formData.via}
          onChange={handleChange}
          placeholder="Oral, tópica, intravenosa..."
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          required
        />
      </div>

      {/* Lote */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Lote
        </label>
        <input
          type="text"
          name="lote"
          value={formData.lote}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          required
        />
      </div>

      {/* Caducidad */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Fecha de caducidad
        </label>
        <input
          type="date"
          name="caducidad"
          value={formData.caducidad}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          required
        />
      </div>

      {/* Stock */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Stock
        </label>
        <input
          type="number"
          name="stock"
          value={formData.stock}
          onChange={handleChange}
          min="0"
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          required
        />
      </div>

      {/* Código */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Código
        </label>
        <input
          type="text"
          name="codigo"
          value={formData.codigo}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-950 focus:outline-none"
          required
        />
      </div>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
          {error}
        </p>
      )}

      {/* Botón Submit */}
      <Button
        type="submit"
        className="w-full bg-blue-950 text-white py-2 rounded-md shadow-md hover:bg-blue-900 disabled:opacity-60 disabled:cursor-not-allowed"
        disabled={isSubmitting}
      >
        {isSubmitting
          ? "Guardando..."
          : modo === "agregar"
          ? "Guardar medicamento"
          : "Actualizar medicamento"}
      </Button>
      <Link href="/medicamentos">
        <Button type="button" variant="secondary" className="w-full">
          Cancelar
        </Button>
      </Link>
    </form>
    </main>
  );
}
