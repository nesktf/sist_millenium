"use server";

import { NextRequest, NextResponse } from "next/server";
import { retrieveUserHistory } from "@/prisma/purchase_history";

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  try {
    const raw_user_id = params.get("userId");
    if (raw_user_id == null) {
      return NextResponse.json(
        { error: "userId not provided" },
        { status: 401 },
      );
    }

    const user_id = parseInt(raw_user_id);
    if (Number.isNaN(user_id)) {
      return NextResponse.json(
        { error: "Invalid userId" },
        { status: 401 },
      );
    }

    const ret = await retrieveUserHistory(user_id);
    if (!ret.hasValue()) {
      return NextResponse.json(
        { error: ret.error() },
        { status: 401 },
      );
    }

    return NextResponse.json(
      { ok: true, history: ret.unwrap() }
    );
  } catch (error) {
    console.error("History GET error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
