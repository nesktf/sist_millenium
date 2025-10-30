import { Result } from "@/lib/error_monads";
import { prisma } from "./instance";

export type UserHistoryAPIProduct = {
  id: number;
  codigo: string;
  nombre: string;
  imagen: string | null;
  precio: number;
  cantidad: number;
}

export type UserHistoryAPIData = {
  id: number;
  num_factura: string;
  metodo: string;
  fecha: Date;
  total: number;
  productos: UserHistoryAPIProduct[];
};

export async function retrieveUserHistory(id: number): Promise<Result<UserHistoryAPIData[], string>> {
  return await prisma.ventaArticulo.findMany({
    where: { id_user: id },
    include: {
      detalle: {
        include: { articulo: true }
      },
      factura: true,
    }
  })
  .then((ventas): Result<UserHistoryAPIData[], string> => {
    return Result.Some(ventas.map(venta => {
      return {
        id: venta.id,
        num_factura: venta.factura ? venta.factura.numero : "",
        metodo: venta.metodo_pago.toString(),
        fecha: venta.fecha,
        total: venta.total,
        productos: venta.detalle.map(detalle => {
          return {
            id: detalle.articulo.id,
            codigo: detalle.articulo.codigo,
            nombre: detalle.articulo.nombre,
            imagen: detalle.articulo.imagen,
            precio: detalle.precio,
            cantidad: detalle.cantidad,
          }
        })
      };
    }))
  })
  .catch((error): Result<UserHistoryAPIData[], string> => {
    console.log(`ERROR @ retrieveUserHistory: ${error}`);
    return Result.None(`${error}`);
  });
}
