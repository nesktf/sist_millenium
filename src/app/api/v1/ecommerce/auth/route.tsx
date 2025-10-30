"use server";

import { NextRequest, NextResponse } from "next/server";
import { checkUserLogin } from "@/prisma/auth";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || typeof(email) != "string") {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }
    if (!password || typeof(password) != "string") {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const user = await checkUserLogin(email, password);
    if (!user.hasValue()) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { ok: true, user: user.unwrap() }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
