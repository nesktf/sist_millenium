import { Maybe, Result } from "@/lib/error_monads";
import { prisma } from "./instance";

import { createHash } from "crypto";

export type UserReqData = {
  id: number,
  email: string,
  nombre: string,
  apellido: string,
  domicilio: string,
};

export type UserRegData = {
  email: string,
  pass: string,
  nombre: string,
  apellido: string,
  domicilio: string,
};

function hashPassword(password: string) {
  return createHash("sha256").update(password.trim(), "utf8").digest("hex");
}

export async function checkUserLogin(email: string, password: string): Promise<Maybe<UserReqData>> {
  try {
    return prisma.userEcommerce.findUniqueOrThrow({
      where: { correo: email } 
    }).then((user): Maybe<UserReqData> => {
      const hash = hashPassword(password);
      if (user.contraseña != hash) {
        return Maybe.None();
      }
      return Maybe.Some({
        id: user.id,
        email: user.correo,
        nombre: user.nombre,
        apellido: user.apellido,
        domicilio: user.domicilio,
      });
    });
  } catch (error) {
    console.log(`ERROR @ checkUserLogin: ${error}`);
    return Maybe.None();
  }
}

export async function registerUserLogin(data: UserRegData): Promise<Result<UserReqData, string>> {
  try {
    const found = prisma.userEcommerce.findUnique({
      where: { correo: data.email }
    });
    if (found != null) {
      return Result.None("Correo ya registrado");
    }

    const hash = hashPassword(data.pass);
    return prisma.userEcommerce.create({
      data: {
        correo: data.email,
        contraseña: hash,
        nombre: data.nombre,
        apellido: data.apellido,
        domicilio: data.domicilio,
      }
    }).then((user): Result<UserReqData, string> => {
      return Result.Some({
        id: user.id,
        email: user.correo,
        nombre: user.nombre,
        apellido: user.apellido,
        domicilio: user.domicilio,
      })
    });
  } catch (error) {
    console.log(`ERROR @ registerUserLogin: ${error}`);
    return Result.None(`${error}`);
  }
}
