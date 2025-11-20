import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"; // componentes de react para ui
import { Button } from "@/components/ui/button"; //componentes de react para ui
import Header from "@/components/Header"; //componente de header
import Link from "next/link"; //importa link este nos deja navegar entre paginas

export default function HomePage() {
  const medicamentosPorCaducar = [
    { nombre: "Paracetamol", fechaCaducidad: "2025-11-05" },
    { nombre: "Ibuprofeno", fechaCaducidad: "2025-11-10" },
  ];

  const medicamentosPorAcabarse = [
    { nombre: "Amoxicilina", stock: 3 },
    { nombre: "Omeprazol", stock: 2 },
  ];

  return (
    <main className="min-h-screen bg-gray-100 flex flex-col items-center  ">
      <Header />
      <h1 className="text-3xl font-bold text-center mb-6 p-6 text-blue-950">
        Gestión de medicamentos
      </h1>

      {/* Botones principales */}
      <div className="flex gap-4 mb-10">
        <Link href="/formulario">
        <Button className="bg-blue-950 text-white px-6 py-2 rounded-xl shadow-md hover:scale-105 transition">
          Agregar medicamento
        </Button>
        </Link>
        <Link href="/medicamentos">
          <Button
            variant="outline"
            className="border-2 border-blue-950 text-blue-950 px-6 py-2 rounded-xl bg-transparent shadow-md hover:scale-105 transition"
          >
            Ver lista
          </Button>
        </Link>
      </div>

      {/* Resumen de medicamentos */}
      <section className="w-full max-w-3xl">
        <h3 className="text-xl font-semibold text-blue-950 mb-4 text-center">
          Resumen de medicamentos
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Medicamentos por caducar */}
          <Card className="shadow-md border m-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-blue-950">Medicamentos por caducar</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 text-gray-700">
                {medicamentosPorCaducar.map((med, index) => (
                  <li key={index}>
                    {med.nombre} - Caduca: {med.fechaCaducidad}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/*Medicamentos por acabarse */}
          <Card className="shadow-md border m-2 border-gray-200">
            <CardHeader>
              <CardTitle className="text-blue-950">Medicamentos por acabarse</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc pl-4 text-gray-700">
                {medicamentosPorAcabarse.map((med, index) => (
                  <li key={index}>
                    {med.nombre} - Stock: {med.stock}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Botón de Receta */}
        
        <div className="flex justify-center mt-8 pb-6">
          <Link href="/receta">
          <Button className="bg-blue-950 text-white px-8 py-2 rounded-xl shadow-md hover:scale-105 transition">
            Receta
          </Button>
          </Link>
        </div>
        
      </section>
    </main>
  );
}
