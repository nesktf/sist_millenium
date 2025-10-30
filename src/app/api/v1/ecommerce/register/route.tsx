"use server";

import { NextRequest, NextResponse } from "next/server";
import { registerUserLogin, UserRegData } from "@/prisma/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, pass, nombre, apellido, domicilio } = await req.json();

    if (!email || typeof(email) != "string") {
      return NextResponse.json(
        { error: "Email inválido "},
        { status: 401 }
      );
    }
    if (!pass || typeof(pass) != "string") {
      return NextResponse.json(
        { error: "Contraseña inválida"},
        { status: 401 }
      );
    }
    if (!nombre || typeof(nombre) != "string") {
      return NextResponse.json(
        { error: "Nombre inválido"},
        { status: 401 }
      );
    }
    if (!apellido || typeof(apellido) != "string") {
      return NextResponse.json(
        { error: "Apellido inválido"},
        { status: 401 }
      );
    }
    if (!domicilio || typeof(domicilio) != "string") {
      return NextResponse.json(
        { error: "Domicilio inválido"},
        { status: 401 }
      );
    }
    const user = await registerUserLogin({ email, pass, nombre, apellido, domicilio });
    if (!user.hasValue()) {
      return NextResponse.json(
        { error: user.error() },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { ok: true, user: user.unwrap() }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
