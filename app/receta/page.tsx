"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Link from "next/link";

interface Medicamento {
    nombre: string;
    presentacion: string;
    via: string;
    stock: number;
}

interface ItemReceta extends Medicamento {
    cantidad: number;
}

export default function RecetaPage() {
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [receta, setReceta] = useState<ItemReceta[]>([]);

    // Simulación de medicamentos cargados
    useEffect(() => {
        const datosIniciales: Medicamento[] = [
            { nombre: "Paracetamol", presentacion: "Tabletas 500mg", via: "Oral", stock: 10 },
            { nombre: "Ibuprofeno", presentacion: "Cápsulas 200mg", via: "Oral", stock: 8 },
            { nombre: "Amoxicilina", presentacion: "Suspensión 250mg/5ml", via: "Oral", stock: 5 },
        ];
        setMedicamentos(datosIniciales);
    }, []);

    // Agregar al carrito
    const agregarAReceta = (med: Medicamento) => {
        const existente = receta.find((item) => item.nombre === med.nombre);
        if (existente) {
            setReceta(
                receta.map((item) =>
                    item.nombre === med.nombre
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                )
            );
        } else {
            setReceta([...receta, { ...med, cantidad: 1 }]);
        }
    };

    // Quitar del carrito
    const quitarDeReceta = (nombre: string) => {
        setReceta(receta.filter((item) => item.nombre !== nombre));
    };

    // Confirmar receta (descontar stock local)
    const confirmarReceta = () => {
        const nuevosMedicamentos = medicamentos.map((med) => {
            const usado = receta.find((r) => r.nombre === med.nombre);
            if (usado) {
                const nuevoStock = Math.max(med.stock - usado.cantidad, 0);
                return { ...med, stock: nuevoStock };
            }
            return med;
        });

        setMedicamentos(nuevosMedicamentos);
        setReceta([]);
        alert("Receta confirmada y stock actualizado ✅");
    };

    return (
        <main className="min-h-screen bg-gray-100 flex flex-col items-center">
            <Header />

            <h1 className="text-2xl font-bold text-blue-950 mt-10 mb-6">Receta</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                {/* Medicamentos disponibles */}
                <section>
                    <h2 className="text-lg font-semibold text-blue-950 m-4">Medicamentos disponibles</h2>
                    <div className="space-y-4">
                        {medicamentos.map((med, index) => (
                            <Card key={index} className="border m-2 border-gray-200 shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-blue-950">{med.nombre}</CardTitle>
                                </CardHeader>
                                <CardContent className="text-gray-700 space-y-1">
                                    <p><strong>Presentación:</strong> {med.presentacion}</p>
                                    <p><strong>Vía:</strong> {med.via}</p>
                                    <p><strong>Stock:</strong> {med.stock}</p>
                                    <Button
                                        onClick={() => agregarAReceta(med)}
                                        className="mt-2 bg-blue-950 text-white w-full"
                                        disabled={med.stock === 0}
                                    >
                                        {med.stock === 0 ? "Sin stock" : "Agregar a receta"}
                                    </Button>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </section>

                {/* Carrito de receta */}
                <section>
                    <h2 className="text-lg font-semibold text-blue-950 mb-4">Receta actual</h2>
                    {receta.length === 0 ? (
                        <p className="text-gray-500">No hay medicamentos en la receta.</p>
                    ) : (
                        <div className="space-y-4">
                            {receta.map((item, index) => (
                                <Card key={index} className="border border-gray-200 shadow-md">
                                    <CardHeader>
                                        <CardTitle className="text-blue-950">{item.nombre}</CardTitle>
                                    </CardHeader>
                                    <CardContent className="text-gray-700 space-y-1">
                                        <p><strong>Cantidad:</strong> {item.cantidad}</p>
                                        <div className="flex gap-2 mt-2">
                                            <Button
                                                onClick={() =>
                                                    setReceta(
                                                        receta.map((r) =>
                                                            r.nombre === item.nombre && r.cantidad > 1
                                                                ? { ...r, cantidad: r.cantidad - 1 }
                                                                : r
                                                        )
                                                    )
                                                }
                                                className="bg-blue-950 text-white px-3"
                                            >
                                                -
                                            </Button>
                                            <Button
                                                onClick={() =>
                                                    setReceta(
                                                        receta.map((r) =>
                                                            r.nombre === item.nombre
                                                                ? { ...r, cantidad: r.cantidad + 1 }
                                                                : r
                                                        )
                                                    )
                                                }
                                                className="bg-blue-950 text-white px-3"
                                            >
                                                +
                                            </Button>
                                            <Button
                                                onClick={() => quitarDeReceta(item.nombre)}
                                                variant="outline"
                                                className="border-red-600 text-red-600"
                                            >
                                                Quitar
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                    {receta.length > 0 && (
                        <Button
                            onClick={confirmarReceta}
                            className="w-full bg-blue-950 text-white mt-6"
                        >
                            Confirmar receta
                        </Button>
                    )}
                </section>
            </div>
            <div className="flex justify-center p-3 mt-8 pb-6">
                <Link href="/">
                    <Button className="bg-blue-950 text-white px-8 py-2 rounded-xl shadow-md hover:scale-105 transition">
                        Volver al inicio
                    </Button>
                </Link>
            </div>
        </main>
    );
}
