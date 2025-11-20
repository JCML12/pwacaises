import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Link from "next/link";
import { connectDB } from "@/lib/mongodb";
import MedicamentoModel from "@/models/Medicamento";

const DIAS_PARA_CADUCAR = 30;
const STOCK_MINIMO = 5;

interface ResumenCaducidad {
  nombre: string;
  fechaCaducidadISO: string;
}

interface ResumenStock {
  nombre: string;
  stock: number;
}

async function obtenerResumen(): Promise<{
  medicamentosPorCaducar: ResumenCaducidad[];
  medicamentosPorAcabarse: ResumenStock[];
}> {
  await connectDB();
  const medicamentos = await MedicamentoModel.find().lean();

  const hoy = new Date();
  const limiteCaducidad = new Date();
  limiteCaducidad.setDate(hoy.getDate() + DIAS_PARA_CADUCAR);

  const porCaducar = [];
  const pocoStock = [];

  for (const med of medicamentos) {
    const caducidadDate = med.caducidad ? new Date(med.caducidad) : null;

    if (
      caducidadDate &&
      caducidadDate >= hoy &&
      caducidadDate <= limiteCaducidad
    ) {
      porCaducar.push({
        nombre: med.nombre,
        fechaCaducidadISO: caducidadDate.toISOString(),
      });
    }

    if (typeof med.stock === "number" && med.stock <= STOCK_MINIMO) {
      pocoStock.push({ nombre: med.nombre, stock: med.stock });
    }
  }

  return {
    medicamentosPorCaducar: porCaducar.sort(
      (a, b) =>
        new Date(a.fechaCaducidadISO).getTime() -
        new Date(b.fechaCaducidadISO).getTime()
    ),
    medicamentosPorAcabarse: pocoStock.sort((a, b) => a.stock - b.stock),
  };
}

export default async function HomePage() {
  const {
    medicamentosPorCaducar,
    medicamentosPorAcabarse,
  } = await obtenerResumen();

  const formatDate = (iso: string) =>
    new Date(iso).toLocaleDateString("es-MX", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });

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
                {medicamentosPorCaducar.length === 0 ? (
                  <li>No hay medicamentos próximos a caducar.</li>
                ) : (
                  medicamentosPorCaducar.map((med, index) => (
                    <li key={index}>
                      {med.nombre} - Caduca: {formatDate(med.fechaCaducidadISO)}
                    </li>
                  ))
                )}
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
                {medicamentosPorAcabarse.length === 0 ? (
                  <li>No hay medicamentos con bajo stock.</li>
                ) : (
                  medicamentosPorAcabarse.map((med, index) => (
                    <li key={index}>
                      {med.nombre} - Stock: {med.stock}
                    </li>
                  ))
                )}
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
