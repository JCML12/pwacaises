"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setIsLoggingOut(false);
      router.push("/login");
      router.refresh();
    }
  };

  return (
    <header className="w-full flex flex-col gap-4 md:flex-row md:justify-between md:items-center p-4 bg-white shadow-md">
      <Link href="/" className="text-blue-950 font-semibold text-lg hover:underline">
        Gestión de medicamentos Jurisdicción Sanitaria Acámbaro
      </Link>
      <Button
        onClick={handleLogout}
        className="bg-red-600 text-white px-4 py-2 rounded-xl hover:bg-red-500 transition disabled:opacity-60"
        disabled={isLoggingOut}
      >
        {isLoggingOut ? "Cerrando sesión..." : "Cerrar sesión"}
      </Button>
    </header>
  );
}
