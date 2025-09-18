import { NextResponse } from "next/server";
import {
  ProveedorData,
  retrieveProveedor,
  registerProveedor,
  updateProveedor,
  deleteProveedor,
} from "@/app/prisma";

// Devolver productos
export async function GET(req: Request) {
  return await retrieveProveedor().then((provs) => {
    return NextResponse.json(
      provs.map((prov) => {
        let data: ProveedorData = prov.data;
        return {
          id: prov.id,
          nombre: data.getNombreProv(),
          cuit: data.getCuit(),
          razon_social: data.getRazonSocial(),
          domicilio: data.getDomicilio(),
          email: data.getEmail(),
          estado: data.getEstado(),
        };
      })
    );
  });
}

// Agregar producto
export async function POST(req: Request) {
  try {
    const body = await req.json();

    const { id, nombre, cuit, razon_social, domicilio, email, estado } = body;
    /*
    // Validación básica
    if (typeof  !== "string" || typeof nombre !== "string") {
      return NextResponse.json(
        { error: "Campos obligatorios faltantes o inválidos" },
        { status: 400 }
      );
    }*/
    return await registerProveedor(
      new ProveedorData(nombre, cuit, razon_social, domicilio, email, estado)
    ).then((id) => {
      return NextResponse.json({ id }, { status: 201 });
    });
  } catch (error) {
    console.error("Error al crear proveedor:", error);
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
    let data = new ProveedorData(
      raw_data.nombre,
      raw_data.cuit,
      raw_data.razon_social,
      raw_data.domicilio,
      raw_data.email,
      raw_data.estado
    );

    return await updateProveedor({ id: Number(id), data })
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

    await deleteProveedor(Number(id));
    return NextResponse.json({ message: "Eliminado con éxito" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
