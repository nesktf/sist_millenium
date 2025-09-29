import { Maybe, Result } from "@/util/error_monads";
import { prisma, DBId, DBData } from "@/prisma/instance";

export class DepositoData {
  private nombre: string;
  private direccion: string;
  private capMax?: number;

  constructor(nombre: string, direccion: string, capMax?: number | null) {
    this.nombre = nombre;
    this.direccion = direccion;
    if (capMax) {
      this.capMax = Math.round(capMax);
    }
  }

  getNombre(): string {
    return this.nombre;
  }
  getDireccion(): string {
    return this.direccion;
  }
  hasCap(): boolean {
    return this.capMax == null;
  }
  getCap(): number | undefined {
    return this.capMax;
  }
}

export class ArticuloDepositoData {
  private articulo: DBId;
  private stock: number;

  constructor(articulo: DBId, stock: number) {
    this.articulo = articulo;
    this.stock = Math.round(stock);
  }

  getId(): DBId {
    return this.articulo;
  }
  getStock(): number {
    return this.stock;
  }
}

export async function registerDeposito(data: DepositoData): Promise<DBId> {
  return await prisma.deposito
    .create({
      data: {
        nombre: data.getNombre(),
        direccion: data.getDireccion(),
        cap_max: data.getCap(),
      },
    })
    .then((entry): DBId => {
      return entry.id;
    });
}

export async function retrieveDepositos(): Promise<
  Array<DBData<DepositoData>>
> {
  return await prisma.deposito.findMany().then((entries) => {
    return entries.map((entry) => {
      return {
        id: entry.id,
        data: new DepositoData(entry.nombre, entry.direccion, entry.cap_max),
      };
    });
  });
}

export async function findDeposito(id: DBId): Promise<DepositoData> {
  return await prisma.deposito
    .findUniqueOrThrow({
      where: { id: id },
    })
    .then((entry): DepositoData => {
      return new DepositoData(entry.nombre, entry.direccion, entry.cap_max);
    });
}

export class DepositoDatas {
  private nombre: string;
  private direccion: string;
  private cap_max: number;

  constructor(nombre: string, direccion: string, cap_max: number) {
    this.nombre = nombre;
    this.direccion = direccion;
    this.cap_max = cap_max;
  }

  getNombre(): string {
    return this.nombre;
  }
  getDireccion(): string {
    return this.direccion;
  }
  getCapMax(): number {
    return this.cap_max;
  }
}

export async function retrieveDeposito() {
  return await prisma.deposito.findMany({}).then((entries) => {
    return entries.map((entry) => {
      let data = new DepositoDatas(
        entry.nombre,
        entry.direccion,
        entry.cap_max ?? 0
      );
      return {
        id: entry.id,
        data: data,
        nombre: entry.nombre,
        cuit: entry.direccion,
        razon_social: entry.cap_max,
      };
    });
  });
}

export async function registerDepositos(
  deposito: DepositoDatas
): Promise<DBId> {
  return await prisma.deposito
    .create({
      data: {
        nombre: deposito.getNombre(),
        direccion: deposito.getDireccion(),
        cap_max: deposito.getCapMax(),
      },
    })
    .then((entry): DBId => {
      return entry.id;
    });
}

export async function updateDeposito(entry: DBData<DepositoDatas>) {
  await prisma.deposito.update({
    where: { id: entry.id },
    data: {
      nombre: entry.data.getNombre(),
      direccion: entry.data.getDireccion(),
      cap_max: entry.data.getCapMax(),
    },
  });
}

export async function deleteDeposito(id: DBId) {
  await prisma.deposito.delete({
    where: { id: id },
  });
}
