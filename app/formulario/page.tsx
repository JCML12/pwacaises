"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

import Link from "next/link";

interface MedicamentoForm {
  nombre: string;
  presentacion: string;
  via: string;
  lote: string;
  caducidad: string;
  stock: string;
  codigo: string;
}

interface FormularioProps {
  onSubmit: (data: MedicamentoForm) => void;
  initialData?: MedicamentoForm;
  modo?: "agregar" | "editar";
}

export default function Formulario({
  onSubmit,
  initialData,
  modo = "agregar",
}: FormularioProps) {
  const [formData, setFormData] = useState<MedicamentoForm>(
    initialData || {
      nombre: "",
      presentacion: "",
      via: "",
      lote: "",
      caducidad: "",
      stock: "",
      codigo: "",
    }
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
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

      {/* Botón Submit */}
      <Button
        type="submit"
        className="w-full bg-blue-950 text-white py-2 rounded-md shadow-md hover:bg-blue-900"
      >
        {modo === "agregar" ? "Guardar medicamento" : "Actualizar medicamento"}
      </Button>
      <Link href="/medicamentos">
      <Button>
        Cancelar
      </Button>
      </Link>
    </form>
    </main>
  );
}
