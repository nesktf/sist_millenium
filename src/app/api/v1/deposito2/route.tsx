import { NextResponse } from "next/server";
import {
  DepositoDatas,
  retrieveDeposito,
  registerDepositos,
  updateDeposito,
  deleteDeposito,
} from "@/app/prisma";

// Devolver productos
export async function GET(req: Request) {
  return await retrieveDeposito().then((deps) => {
    return NextResponse.json(
      deps.map((dep) => {
        let data: DepositoDatas = dep.data;
        return {
          id: dep.id,
          nombre: data.getNombre(),
          direccion: data.getDireccion(),
          cap_max: data.getCapMax(),
        };
      })
    );
  });
}

// Agregar deposito
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id, nombre, direccion, cap_max } = body;

    // Validación y conversión
    if (typeof nombre !== "string" || typeof direccion !== "string") {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes o inválidos" },
        { status: 400 }
      );
    }

    const capMaxParsed = Number(cap_max);

    if (isNaN(capMaxParsed)) {
      return NextResponse.json(
        { error: "cap_max debe ser un número válido" },
        { status: 400 }
      );
    }

    return await registerDepositos(
      new DepositoDatas(nombre, direccion, capMaxParsed)
    ).then((id) => {
      return NextResponse.json({ id }, { status: 201 });
    });
  } catch (error) {
    console.error("Error al crear deposito:", error);
    return NextResponse.json(
      { error: (error as Error).message || "Error interno del servidor" },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, ...raw_data } = body;

    if (!id) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    const capMaxParsed = Number(raw_data.cap_max);
    if (isNaN(capMaxParsed)) {
      return NextResponse.json(
        { error: "cap_max debe ser un número válido" },
        { status: 400 }
      );
    }

    let data = new DepositoDatas(
      raw_data.nombre,
      raw_data.direccion,
      capMaxParsed // 👈 Ya es número
    );

    return await updateDeposito({ id: Number(id), data })
      .then(() => {
        return NextResponse.json({});
      })
      .catch((error: any) => {
        return NextResponse.json({ error: error.message }, { status: 500 });
      });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Falta ID" }, { status: 400 });
    }

    await deleteDeposito(Number(id));
    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
