"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usuario, password }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? "Credenciales inválidas");
      }

      router.push("/medicamentos");
      router.refresh();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Error al iniciar sesión.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-blue-950">
      <div className="bg-gray-50 rounded-2xl shadow-lg p-8 w-full m-2 max-w-md text-center">
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-blue-950">
            <Image
              src="/logo.png"
              alt="Logo"
              width={96}
              height={96}
              className="object-cover"
            />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-blue-950 mb-6">
          Iniciar sesión
        </h1>

        <form className="flex flex-col gap-4 text-left" onSubmit={handleSubmit}>
          <div>
            <label
              htmlFor="usuario"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Usuario
            </label>
            <input
              id="usuario"
              type="text"
              placeholder="Ingresa tu usuario"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
              value={usuario}
              onChange={(e) => setUsuario(e.target.value)}
              autoComplete="username"
              required
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              placeholder="Ingresa tu contraseña"
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-700 focus:outline-none"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && (
            <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md p-2">
              {error}
            </p>
          )}

          <Button
            type="submit"
            className="mt-4 bg-blue-950 text-white w-full py-2 rounded-md hover:bg-blue-900 disabled:opacity-60"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Ingresando..." : "Iniciar sesión"}
          </Button>
        </form>

        <p className="text-sm text-gray-600 mt-6">
          © 2025 Jurisdicción Sanitaria, Acámbaro. Todos los derechos reservados.
        </p>
      </div>
    </main>
  );
}
