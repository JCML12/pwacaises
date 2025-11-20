"use client";

import { useRouter } from "next/navigation";
import Formulario from "@/components/Formulario";

export default function AgregarPage() {
  const router = useRouter();

  // Cuando el formulario envía datos
  const handleSubmit = async (data) => {
    const res = await fetch("/api/medicamentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (res.ok) {
      router.push("/medicamentos");
    } else {
      alert("Error al guardar");
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center p-4">
      <Formulario modo="agregar" onSubmit={handleSubmit} />
    </main>
  );
}
