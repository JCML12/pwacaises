import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full flex justify-between items-center p-4 bg-white shadow-md">
      <h2 className="text-blue-950 font-semibold text-lg">
        Gestión de medicamentos Jurisdicción Sanitaria Acámbaro
      </h2>
      <Link href="login">
      <Button className="bg-blue-950 text-white px-4 py-2 rounded-xl hover:scale-105 transition">Login</Button>
      </Link>
    </header>
  );
}
