"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import Header from "@/components/Header";
import Link from "next/link";
import { fetchWithOfflineSupport } from "@/lib/offline-sync";

interface Medicamento {
    _id: string;
    nombre: string;
    presentacion: string;
    via: string;
    stock: number;
}

interface ItemReceta {
    _id: string;
    nombre: string;
    presentacion: string;
    via: string;
    cantidad: number;
}

interface RecetaHistorial {
    _id: string;
    items: {
        medicamentoId: string;
        nombre: string;
        presentacion?: string;
        via?: string;
        cantidad: number;
    }[];
    totalMedicamentos: number;
    createdAt: string;
}

export default function RecetaPage() {
    const [medicamentos, setMedicamentos] = useState<Medicamento[]>([]);
    const [receta, setReceta] = useState<ItemReceta[]>([]);
    const [historial, setHistorial] = useState<RecetaHistorial[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const cargarMedicamentos = useCallback(async () => {
        try {
            setIsLoading(true);
            const [medsRes, historyRes] = await Promise.all([
                fetch("/api/medicamentos", { cache: "no-store" }),
                fetch("/api/receta", { cache: "no-store" }),
            ]);

            if (!medsRes.ok) {
                throw new Error("No se pudieron cargar los medicamentos.");
            }

            if (!historyRes.ok) {
                throw new Error("No se pudo cargar el historial de recetas.");
            }

            const medsData: Medicamento[] = await medsRes.json();
            const historyData: RecetaHistorial[] = await historyRes.json();
            setMedicamentos(medsData);
            setHistorial(historyData);
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Error desconocido al cargar.";
            setError(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        cargarMedicamentos();
    }, [cargarMedicamentos]);

    const agregarAReceta = (med: Medicamento) => {
        const existente = receta.find((item) => item._id === med._id);
        if (existente) {
            if (existente.cantidad >= med.stock) {
                setError("No hay suficiente stock disponible.");
                return;
            }
            setReceta(
                receta.map((item) =>
                    item._id === med._id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                )
            );
        } else {
            if (med.stock <= 0) {
                setError("No hay stock disponible.");
                return;
            }
            setReceta([...receta, { ...med, cantidad: 1 }]);
        }
        setError(null);
        setSuccess(null);
    };

    const quitarDeReceta = (_id: string) => {
        setReceta(receta.filter((item) => item._id !== _id));
        setError(null);
        setSuccess(null);
    };

    const modificarCantidad = (_id: string, delta: number) => {
        setReceta((prev) =>
            prev.map((item) => {
                if (item._id !== _id) return item;
                const medicamento = medicamentos.find((m) => m._id === _id);
                if (!medicamento) return item;

                const nuevaCantidad = item.cantidad + delta;
                if (nuevaCantidad < 1 || nuevaCantidad > medicamento.stock) {
                    return item;
                }
                return { ...item, cantidad: nuevaCantidad };
            })
        );
        setError(null);
        setSuccess(null);
    };

    const establecerCantidad = (_id: string, value: string) => {
        const cantidad = Number(value);
        setReceta((prev) =>
            prev.map((item) => {
                if (item._id !== _id) return item;
                const medicamento = medicamentos.find((m) => m._id === _id);
                if (!medicamento) return item;

                if (Number.isNaN(cantidad) || cantidad < 1) {
                    return { ...item, cantidad: 1 };
                }

                const limite = Math.min(medicamento.stock, cantidad);
                return { ...item, cantidad: limite };
            })
        );
        setError(null);
        setSuccess(null);
    };

    const totalMedicamentos = useMemo(
        () => receta.reduce((acc, item) => acc + item.cantidad, 0),
        [receta]
    );

    const confirmarReceta = async () => {
        if (receta.length === 0) {
            setError("Agrega medicamentos antes de confirmar.");
            return;
        }

        setIsSubmitting(true);
        setError(null);
        setSuccess(null);

        try {
            const payload = {
                items: receta.map((item) => ({
                    medicamentoId: item._id,
                    cantidad: item.cantidad,
                })),
            };

            const res = await fetchWithOfflineSupport("/api/receta", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });

            const data = await res.json();

            if (!res.ok && !data.offline) {
                throw new Error(data.error || "No se pudo confirmar la receta.");
            }

            setReceta([]);
            if (data.offline) {
                setSuccess("Receta guardada localmente. Se sincronizará cuando haya conexión ✅");
            } else {
                setSuccess("Receta confirmada y stock actualizado ✅");
            }
            await cargarMedicamentos();
        } catch (err) {
            const message =
                err instanceof Error ? err.message : "Error inesperado al confirmar.";
            setError(message);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-100 flex flex-col items-center">
            <Header />

            <h1 className="text-2xl font-bold text-blue-950 mt-10 mb-4">Receta</h1>

            {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2 mb-4 max-w-2xl text-center">
                    {error}
                </p>
            )}

            {success && (
                <p className="text-sm text-green-700 bg-green-50 border border-green-200 rounded-md p-2 mb-4 max-w-2xl text-center">
                    {success}
                </p>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl">
                <section>
                    <h2 className="text-lg font-semibold text-blue-950 m-4">Medicamentos disponibles</h2>
                    {isLoading ? (
                        <p className="text-gray-500 mx-4">Cargando medicamentos...</p>
                    ) : (
                        <div className="space-y-4">
                            {medicamentos.length === 0 ? (
                                <p className="text-gray-500 mx-4">No hay medicamentos registrados.</p>
                            ) : (
                                medicamentos.map((med) => (
                                    <Card key={med._id} className="border m-2 border-gray-200 shadow-md">
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
                                ))
                            )}
                        </div>
                    )}
                </section>

                <section>
                    <h2 className="text-lg font-semibold text-blue-950 mb-4">Receta actual</h2>
                    {receta.length === 0 ? (
                        <p className="text-gray-500">No hay medicamentos en la receta.</p>
                    ) : (
                        <div className="space-y-4">
                            {receta.map((item) => {
                                const stockDisponible =
                                    medicamentos.find((m) => m._id === item._id)?.stock ?? 0;
                                return (
                                    <Card key={item._id} className="border border-gray-200 shadow-md">
                                        <CardHeader>
                                            <CardTitle className="text-blue-950">{item.nombre}</CardTitle>
                                        </CardHeader>
                                        <CardContent className="text-gray-700 space-y-2">
                                            <p><strong>Cantidad:</strong> {item.cantidad}</p>
                                            <p className="text-sm text-gray-500">
                                                Stock disponible: {stockDisponible}
                                            </p>
                                            <div className="flex flex-wrap gap-2 mt-2 items-center">
                                                <Button
                                                    onClick={() => modificarCantidad(item._id, -1)}
                                                    className="bg-blue-950 text-white px-3"
                                                >
                                                    -
                                                </Button>
                                                <Button
                                                    onClick={() => modificarCantidad(item._id, 1)}
                                                    className="bg-blue-950 text-white px-3"
                                                    disabled={item.cantidad >= stockDisponible}
                                                >
                                                    +
                                                </Button>
                                                <input
                                                    type="number"
                                                    min={1}
                                                    max={stockDisponible}
                                                    value={item.cantidad}
                                                    onChange={(e) =>
                                                        establecerCantidad(item._id, e.target.value)
                                                    }
                                                    className="w-24 border border-gray-300 rounded-md p-2 text-center focus:ring-2 focus:ring-blue-950 focus:outline-none"
                                                />
                                                <Button
                                                    onClick={() => quitarDeReceta(item._id)}
                                                    variant="outline"
                                                    className="border-red-600 text-red-600"
                                                >
                                                    Quitar
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    )}
                    {receta.length > 0 && (
                        <div className="mt-6 space-y-3">
                            <p className="text-sm text-gray-600">
                                Total de medicamentos a descontar:{" "}
                                <span className="font-semibold text-blue-950">{totalMedicamentos}</span>
                            </p>
                            <Button
                                onClick={confirmarReceta}
                                className="w-full bg-blue-950 text-white"
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Procesando..." : "Confirmar receta"}
                            </Button>
                        </div>
                    )}
                </section>
            </div>
            <section className="w-full max-w-6xl mt-12 px-4">
                <h2 className="text-lg font-semibold text-blue-950 mb-4">Historial de recetas</h2>
                {historial.length === 0 ? (
                    <p className="text-gray-500">Aún no hay recetas registradas.</p>
                ) : (
                    <div className="space-y-3">
                        {historial.map((rec) => (
                            <Card key={rec._id} className="border border-gray-200 shadow-sm">
                                <CardHeader className="flex flex-row justify-between items-center">
                                    <CardTitle className="text-blue-950">
                                        {rec.items.length} medicamentos · Total: {rec.totalMedicamentos}
                                    </CardTitle>
                                    <p className="text-sm text-gray-500">
                                        {new Date(rec.createdAt).toLocaleString()}
                                    </p>
                                </CardHeader>
                                <CardContent className="text-gray-700 space-y-2">
                                    {rec.items.map((item, idx) => (
                                        <div key={`${rec._id}-${idx}`} className="flex justify-between text-sm">
                                            <span>{item.nombre} ({item.presentacion})</span>
                                            <span className="font-semibold">-{item.cantidad}</span>
                                        </div>
                                    ))}
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </section>
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
