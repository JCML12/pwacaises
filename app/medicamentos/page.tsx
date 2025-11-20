"use client";

import { useEffect, useState, useMemo } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Link from "next/link";

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

export default function MedicamentosPage() {

    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [busqueda, setBusqueda] = useState("");

    useEffect(() => {
        const cargarDatos = async () => {
            const res = await fetch("/api/medicamentos", { cache: "no-store" });
            const data = await res.json();
            setMedicamentos(data);
        };

        cargarDatos();
    }, []);

    // Filtrar medicamentos basado en la búsqueda
    const medicamentosFiltrados = useMemo(() => {
        if (!busqueda.trim()) {
            return medicamentos;
        }

        const termino = busqueda.toLowerCase();
        return medicamentos.filter((med) => {
            return (
                med.nombre?.toLowerCase().includes(termino) ||
                med.presentacion?.toLowerCase().includes(termino) ||
                med.via?.toLowerCase().includes(termino) ||
                med.codigo?.toLowerCase().includes(termino) ||
                med.lote?.toLowerCase().includes(termino)
            );
        });
    }, [medicamentos, busqueda]);

    return (
        <main className="min-h-screen bg-gray-100 flex flex-col items-center">
            <Header />

            <h1 className="text-2xl font-bold text-blue-950 mt-10 mb-6">
                Lista de medicamentos
            </h1>

            <Link href="/formulario">
                <Button className="bg-blue-950 text-white px-6 py-2 rounded-xl shadow-md mb-8 hover:scale-105 transition">
                    Agregar medicamentos
                </Button>
            </Link>

            {/* Campo de búsqueda */}
            <div className="w-full max-w-5xl mb-6 px-4">
                <input
                    type="text"
                    placeholder="Buscar medicamento por nombre, presentación, vía, código o lote..."
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    className="w-full border border-gray-300 rounded-md p-3 focus:ring-2 focus:ring-blue-950 focus:outline-none shadow-sm"
                />
                {busqueda && (
                    <p className="text-sm text-gray-600 mt-2">
                        {medicamentosFiltrados.length} resultado{medicamentosFiltrados.length !== 1 ? "s" : ""} encontrado{medicamentosFiltrados.length !== 1 ? "s" : ""}
                    </p>
                )}
            </div>

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {medicamentosFiltrados.length === 0 ? (
                    <div className="col-span-full text-center py-8">
                        <p className="text-gray-500">
                            {busqueda ? "No se encontraron medicamentos que coincidan con la búsqueda." : "No hay medicamentos registrados."}
                        </p>
                    </div>
                ) : (
                    medicamentosFiltrados.map((med) => (
                    <Link key={med._id} href={`/medicamentos/${med._id}`}>
                        <Card className="shadow-md m-2 border border-gray-200 cursor-pointer hover:scale-[1.02] transition">
                            <CardHeader>
                                <CardTitle className="text-blue-950">{med.nombre}</CardTitle>
                            </CardHeader>
                            <CardContent className="text-gray-700">
                                <p><strong>Presentación:</strong> {med.presentacion}</p>
                                <p><strong>Vía:</strong> {med.via}</p>
                            </CardContent>
                        </Card>
                    </Link>
                    ))
                )}
            </section>

            <div className="flex justify-center mt-8 pb-6">
                <Link href="/">
                    <Button className="bg-blue-950 text-white px-8 py-2 rounded-xl shadow-md hover:scale-105 transition">
                        Volver al inicio
                    </Button>
                </Link>
            </div>
        </main>
    );
}
