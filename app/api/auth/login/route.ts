import { NextResponse } from "next/server";
import { connectDB } from "@/lib/mongodb";
import User from "@/models/User";
import bcrypt from "bcryptjs";

const SESSION_COOKIE = "auth_token";
const SESSION_MAX_AGE = 60 * 60 * 4; // 4 horas

export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json(
      { error: "Usuario y contraseña son obligatorios" },
      { status: 400 }
    );
  }

  await connectDB();

  const user = await User.findOne({ username });

  if (!user) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  // 🔥 Comparación segura
  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return NextResponse.json(
      { error: "Credenciales inválidas" },
      { status: 401 }
    );
  }

  const response = NextResponse.json({
    ok: true,
    user: {
      id: user._id,
      username: user.username,
      name: user.name,
      role: user.role,
    },
  });

  // 🔥 Cookie de sesión
  response.cookies.set({
    name: SESSION_COOKIE,
    value: user._id.toString(),
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  return response;
}
