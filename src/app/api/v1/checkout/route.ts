// src/app/api/v1/checkout/route.ts
import { NextRequest, NextResponse } from "next/server";

import { MetodoPagoCliente } from "@/generated/prisma";
import { prisma } from "@/prisma/instance";

type CartItemPayload = {
  id: number;
  nombre: string;
  precio: number;
  quantity: number;
};

type ContactPayload = {
  nombre: string;
  apellido: string;
  correo: string;
  telefono: string;
};

type PaymentPayload = {
  metodo: keyof typeof MetodoPagoCliente;
  titular: string;
  numero: string;
  vencimiento: string;
  cvv?: string;
};

type CheckoutPayload = {
  cartItems: CartItemPayload[];
  contact: ContactPayload;
  payment: PaymentPayload;
  total?: number;
  userId?: number | null;
};

const ORDER_PREFIX = "VA";

const CARD_DIGITS_LENGTH = 16;

const sanitizeCardNumber = (value: string | undefined) =>
  (value ?? "").replace(/\D/g, "");

const sanitizePhone = (value: string | undefined) =>
  (value ?? "").replace(/[^\d+]/g, "");

const generateOrderNumber = () =>
  `${ORDER_PREFIX}-${Date.now()}-${Math.floor(Math.random() * 1000)
    .toString()
    .padStart(3, "0")}`;

const isMetodoPagoCliente = (value: string): value is MetodoPagoCliente =>
  Object.values(MetodoPagoCliente).includes(value as MetodoPagoCliente);

const toInt = (value: number) => Math.round(Number(value ?? 0));

const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

const isValidPhone = (value: string) => {
  const digits = sanitizePhone(value);
  return digits.length >= 7 && digits.length <= 15;
};

const isValidName = (value: string) => value.length >= 2 && value.length <= 80;

const isValidCardNumber = (value: string) =>
  sanitizeCardNumber(value).length === CARD_DIGITS_LENGTH;

const isValidExpiry = (value: string) => {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) {
    return false;
  }
  const [_, monthStr, yearStr] = match;
  const month = Number(monthStr);
  const year = Number(yearStr);
  if (month < 1 || month > 12) {
    return false;
  }
  const fullYear = 2000 + year;
  const now = new Date();
  const expiryDate = new Date(fullYear, month); // first day of next month
  return expiryDate > now;
};

const isValidCVV = (value: string | undefined) => {
  if (!value) {
    return false;
  }
  const digits = value.replace(/\D/g, "");
  return digits.length === 3;
};

export async function POST(request: NextRequest) {
  let payload: CheckoutPayload;

  try {
    payload = await request.json();
  } catch (error) {
    return NextResponse.json(
      { error: "Formato JSON inválido." },
      { status: 400 }
    );
  }

  const { cartItems, contact, payment, total, userId } = payload;

  if (!Array.isArray(cartItems) || cartItems.length === 0) {
    return NextResponse.json(
      { error: "El carrito está vacío." },
      { status: 400 }
    );
  }

  if (
    !contact?.nombre ||
    !contact?.apellido ||
    !contact?.correo ||
    !contact?.telefono
  ) {
    return NextResponse.json(
      { error: "Faltan datos de contacto." },
      { status: 400 }
    );
  }

  const validationErrors: Record<string, string> = {};

  const trimmedNombre = contact.nombre.trim();
  const trimmedApellido = contact.apellido.trim();
  const trimmedCorreo = contact.correo.trim();
  const trimmedTelefono = contact.telefono.trim();

  if (!isValidName(trimmedNombre)) {
    validationErrors.nombre = "Ingresá un nombre válido (mínimo 2 caracteres).";
  }
  if (!isValidName(trimmedApellido)) {
    validationErrors.apellido =
      "Ingresá un apellido válido (mínimo 2 caracteres).";
  }
  if (!isValidEmail(trimmedCorreo)) {
    validationErrors.correo = "Ingresá un correo electrónico válido.";
  }
  if (!isValidPhone(trimmedTelefono)) {
    validationErrors.telefono = "Ingresá un teléfono válido (7 a 15 dígitos).";
  }

  if (!payment?.metodo || !isMetodoPagoCliente(payment.metodo)) {
    return NextResponse.json(
      { error: "Método de pago no soportado." },
      { status: 400 }
    );
  }

  const isCardPayment =
    payment.metodo === MetodoPagoCliente.TARJETA_CREDITO ||
    payment.metodo === MetodoPagoCliente.TARJETA_DEBITO;

  const trimmedTitular = payment.titular?.trim() ?? "";
  const sanitizedCard = sanitizeCardNumber(payment.numero).slice(
    0,
    CARD_DIGITS_LENGTH
  );
  const sanitizedCVV = payment.cvv?.replace(/\D/g, "").slice(0, 3) ?? "";

  if (isCardPayment) {
    if (!trimmedTitular) {
      validationErrors.titularTarjeta =
        "Ingresá el nombre del titular de la tarjeta.";
    } else if (!isValidName(trimmedTitular)) {
      validationErrors.titularTarjeta =
        "El nombre del titular debe tener al menos 2 caracteres.";
    }
    if (!sanitizedCard) {
      validationErrors.numeroTarjeta = "Ingresá el número de la tarjeta.";
    } else if (!isValidCardNumber(sanitizedCard)) {
      validationErrors.numeroTarjeta =
        "El número de tarjeta debe tener 16 dígitos.";
    }
    if (!payment.vencimiento) {
      validationErrors.vencimiento = "Ingresá la fecha de vencimiento (MM/AA).";
    } else if (!isValidExpiry(payment.vencimiento)) {
      validationErrors.vencimiento =
        "La fecha de vencimiento no tiene un formato válido o ya expiró.";
    }
    if (!sanitizedCVV) {
      validationErrors.cvv = "Ingresá el código de seguridad.";
    } else if (!isValidCVV(payment.cvv)) {
      validationErrors.cvv = "El CVV debe tener 3 dígitos.";
    }
  }

  if (Object.keys(validationErrors).length > 0) {
    return NextResponse.json(
      {
        error: "Datos inválidos.",
        details: validationErrors,
      },
      { status: 422 }
    );
  }

  const normalizedItems = cartItems.map((item) => ({
    id: Number(item.id),
    precio: toInt(item.precio),
    quantity: Math.max(1, toInt(item.quantity)),
  }));

  if (
    normalizedItems.some((item) => !Number.isInteger(item.id) || item.id <= 0)
  ) {
    return NextResponse.json(
      { error: "Identificador de artículo inválido." },
      { status: 400 }
    );
  }

  if (normalizedItems.some((item) => item.quantity <= 0)) {
    return NextResponse.json(
      { error: "Las cantidades de los artículos deben ser positivas." },
      { status: 400 }
    );
  }

  if (normalizedItems.some((item) => item.precio < 0)) {
    return NextResponse.json(
      { error: "Los precios de los artículos no pueden ser negativos." },
      { status: 400 }
    );
  }

  const uniqueIds = Array.from(new Set(normalizedItems.map((item) => item.id)));

  const existingArticles = await prisma.articulo.findMany({
    where: { id: { in: uniqueIds } },
    select: { id: true },
  });

  if (existingArticles.length !== uniqueIds.length) {
    const missingIds = uniqueIds.filter(
      (id) => !existingArticles.some((article) => article.id === id)
    );
    return NextResponse.json(
      {
        error: "Algunos artículos ya no están disponibles.",
        details: {
          cartItems: `IDs inválidos: ${missingIds.join(", ")}`,
        },
      },
      { status: 409 }
    );
  }

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + item.precio * item.quantity,
    0
  );

  if (typeof total === "number" && toInt(total) !== subtotal) {
    return NextResponse.json(
      { error: "El total enviado no coincide con el cálculo del servidor." },
      { status: 400 }
    );
  }

  try {
    const venta = await prisma.ventaArticulo.create({
      data: {
        numero: generateOrderNumber(),
        total: subtotal,
        fecha: new Date(),
        id_user: userId ?? null,
        metodo_pago: payment.metodo,
        nombre_contacto: trimmedNombre,
        apellido_contacto: trimmedApellido,
        correo_contacto: trimmedCorreo,
        telefono_contacto: sanitizePhone(trimmedTelefono),
        detalle: {
          create: normalizedItems.map((item) => ({
            precio: item.precio,
            cantidad: item.quantity,
            id_articulo: item.id,
          })),
        },
      },
      include: {
        detalle: true,
      },
    });

    // 🔹 Crear la factura de venta asociada a esta venta
    const factura = await prisma.facturaVenta.create({
      data: {
        numero: `FAC-${Date.now()}`,
        total: venta.total,
        estado: "PENDIENTE", // usar tu enum EstadoFacturaVenta
        id_venta: venta.id,
      },
    });

    return NextResponse.json(
      {
        id: venta.id,
        numero: venta.numero,
        total: venta.total,
        factura: factura.numero,
        estado: factura.estado,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[checkout][POST]", error);
    return NextResponse.json(
      { error: "No se pudo registrar la venta." },
      { status: 500 }
    );
  }
}
