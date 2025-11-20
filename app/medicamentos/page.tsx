"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Link from "next/link";

export default function MedicamentosPage() {

    const [medicamentos, setMedicamentos] = useState([]);

    useEffect(() => {
        const cargarDatos = async () => {
            const res = await fetch("/api/medicamentos", { cache: "no-store" });
            const data = await res.json();
            setMedicamentos(data);
        };

        cargarDatos();
    }, []);

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

            <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
                {medicamentos.map((med) => (
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
                ))}
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
