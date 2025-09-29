import { prisma, DBId, DBData } from "@/prisma/instance";
import { EstadoProveedor } from "@/generated/prisma";

export class ProveedorData {
  private nombre: string;
  private cuit: string;
  private razon_Social: string;
  private domicilio: string;
  private email: string;
  private estado: EstadoProveedor;

  constructor(
    nombre: string,
    cuit: string,
    razon_Social: string,
    domicilio: string,
    email: string,
    estado: string
  ) {
    this.nombre = nombre;
    this.cuit = cuit;
    this.razon_Social = razon_Social;
    this.domicilio = domicilio;
    this.email = email;
    // Validar que el estado recibido sea válido y asignarlo
    if (estado.toUpperCase() === "ACTIVO") {
      this.estado = EstadoProveedor.ACTIVO;
    } else if (estado.toUpperCase() === "INACTIVO") {
      this.estado = EstadoProveedor.INACTIVO;
    } else {
      // Por si llega algo inválido, asignar un default
      this.estado = EstadoProveedor.ACTIVO;
    }
  }

  getNombreProv(): string {
    return this.nombre;
  }
  getCuit(): string {
    return this.cuit;
  }
  getRazonSocial(): string {
    return this.razon_Social;
  }
  getDomicilio(): string {
    return this.domicilio;
  }
  getEmail(): string {
    return this.email;
  }
  getEstado(): EstadoProveedor {
    return this.estado;
  }
}

export async function retrieveProveedor() {
  return await prisma.proveedor.findMany({}).then((entries) => {
    return entries.map((entry) => {
      let data = new ProveedorData(
        entry.nombre,
        entry.cuit,
        entry.razon_social,
        entry.domicilio,
        entry.email,
        entry.estado
      );
      return {
        id: entry.id,
        data: data,
        nombre: entry.nombre,
        cuit: entry.cuit,
        razon_social: entry.razon_social,
        domicilio: entry.domicilio,
        email: entry.email,
        estado: entry.estado,
      };
    });
  });
}

export async function registerProveedor(
  proveedor: ProveedorData
): Promise<DBId> {
  return await prisma.proveedor
    .create({
      data: {
        nombre: proveedor.getNombreProv(),
        cuit: proveedor.getCuit(),
        razon_social: proveedor.getRazonSocial(),
        domicilio: proveedor.getDomicilio(),
        email: proveedor.getEmail(),
        estado: proveedor.getEstado(),
      },
    })
    .then((entry): DBId => {
      return entry.id;
    });
}

export async function updateProveedor(entry: DBData<ProveedorData>) {
  await prisma.proveedor.update({
    where: { id: entry.id },
    data: {
      nombre: entry.data.getNombreProv(),
      cuit: entry.data.getCuit(),
      razon_social: entry.data.getRazonSocial(),
      domicilio: entry.data.getDomicilio(),
      email: entry.data.getEmail(),
      estado: entry.data.getEstado(),
    },
  });
}

export async function deleteProveedor(id: DBId) {
  await prisma.proveedor.delete({
    where: { id: id },
  });
}
