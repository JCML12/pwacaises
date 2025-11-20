import { NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';

export async function POST(request: Request) {
  try {
    const { usuario, password } = await request.json();

    if (!usuario || !password) {
      return NextResponse.json(
        { error: "Usuario y contraseña son requeridos" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db(process.env.DATABASE_NAME);
    
  
    const user = await db.collection('usuarios').findOne({ 
      usuario: usuario 
    });

    if (!user) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

   
    const userWithPassword = user as any;
    
    if (userWithPassword.password !== password) {
      return NextResponse.json(
        { error: "Credenciales inválidas" },
        { status: 401 }
      );
    }

    // Response sin password
    const { password: _, ...userWithoutPassword } = userWithPassword;

    return NextResponse.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Error en login:', error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}