// src/app/carrito/checkout/page.tsx
"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import Swal from "sweetalert2";

import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/utils/currency";

type PaymentMethodOption = {
  id: string;
  label: string;
  helper?: string;
};

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "TARJETA_CREDITO",
    label: "Tarjeta de Crédito",
    helper: "Visa, MasterCard, American Express",
  },
  {
    id: "TARJETA_DEBITO",
    label: "Tarjeta de Débito",
  },
];

const CARD_PAYMENT_METHODS = new Set(
  PAYMENT_METHODS.map((method) => method.id)
);

const EMPTY_FORM_STATE = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  metodoPago: PAYMENT_METHODS[0]?.id ?? "",
  titularTarjeta: "",
  numeroTarjeta: "",
  cvv: "",
  vencimiento: "",
};

type FormState = typeof EMPTY_FORM_STATE;
type FormField = keyof FormState;
type FormErrors = Partial<Record<FormField, string>>;

const createInitialFormState = (): FormState => ({ ...EMPTY_FORM_STATE });

const sanitizeCardNumber = (value: string) => value.replace(/\D/g, "");
const sanitizePhone = (value: string) => value.replace(/[^\d+]/g, "");
const sanitizeCVV = (value: string) => value.replace(/\D/g, "");

const CARD_DIGITS_LENGTH = 16;

const formatCardNumber = (value: string) =>
  sanitizeCardNumber(value)
    .slice(0, CARD_DIGITS_LENGTH)
    .replace(/(\d{4})(?=\d)/g, "$1 ")
    .trim();

const formatExpiry = (value: string) => {
  const digits = sanitizeCardNumber(value).slice(0, 4);
  if (digits.length <= 2) {
    return digits;
  }
  return `${digits.slice(0, 2)}/${digits.slice(2)}`;
};

const formatCVV = (value: string) => sanitizeCVV(value).slice(0, 3);

const isValidName = (value: string) => value.length >= 2 && value.length <= 80;
const isValidEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidPhone = (value: string) => {
  const digits = sanitizePhone(value);
  return digits.length >= 7 && digits.length <= 15;
};
const isValidCardNumber = (value: string) =>
  sanitizeCardNumber(value).length === CARD_DIGITS_LENGTH;
const isValidExpiry = (value: string) => {
  const match = value.match(/^(\d{2})\/(\d{2})$/);
  if (!match) {
    return false;
  }
  const [, monthStr, yearStr] = match;
  const month = Number(monthStr);
  const year = Number(yearStr);
  if (Number.isNaN(month) || Number.isNaN(year) || month < 1 || month > 12) {
    return false;
  }
  const fullYear = 2000 + year;
  const now = new Date();
  const expiryDate = new Date(fullYear, month);
  return expiryDate > now;
};
const isValidCVV = (value: string) => sanitizeCVV(value).length === 3;

const validateForm = (form: FormState): FormErrors => {
  const errors: FormErrors = {};

  const trimmedNombre = form.nombre.trim();
  const trimmedApellido = form.apellido.trim();
  const trimmedCorreo = form.correo.trim();
  const trimmedTelefono = form.telefono.trim();

  if (!isValidName(trimmedNombre)) {
    errors.nombre = "Ingresá un nombre válido (mínimo 2 caracteres).";
  }
  if (!isValidName(trimmedApellido)) {
    errors.apellido = "Ingresá un apellido válido (mínimo 2 caracteres).";
  }
  if (!isValidEmail(trimmedCorreo)) {
    errors.correo = "Ingresá un correo electrónico válido.";
  }
  if (!isValidPhone(trimmedTelefono)) {
    errors.telefono = "Ingresá un teléfono válido (7 a 15 dígitos).";
  }

  const usingCard = CARD_PAYMENT_METHODS.has(form.metodoPago);

  if (usingCard) {
    const trimmedTitular = form.titularTarjeta.trim();
    const sanitizedCard = sanitizeCardNumber(form.numeroTarjeta);
    const sanitizedCvv = sanitizeCVV(form.cvv);

    if (!trimmedTitular) {
      errors.titularTarjeta = "Ingresá el nombre del titular de la tarjeta.";
    } else if (!isValidName(trimmedTitular)) {
      errors.titularTarjeta =
        "El nombre del titular debe tener al menos 2 caracteres.";
    }
    if (!sanitizedCard) {
      errors.numeroTarjeta = "Ingresá el número de la tarjeta.";
    } else if (!isValidCardNumber(form.numeroTarjeta)) {
      errors.numeroTarjeta = "El número de tarjeta debe tener 16 dígitos.";
    }
    if (!form.vencimiento) {
      errors.vencimiento = "Ingresá la fecha de vencimiento (MM/AA).";
    } else if (!isValidExpiry(form.vencimiento)) {
      errors.vencimiento =
        "La fecha de vencimiento no tiene un formato válido o ya expiró.";
    }
    if (!sanitizedCvv) {
      errors.cvv = "Ingresá el código de seguridad.";
    } else if (!isValidCVV(form.cvv)) {
      errors.cvv = "El CVV debe tener 3 o 4 dígitos.";
    }
  }

  return errors;
};

export default function CheckoutPage() {
  const { cartItems, cartTotal, clearCart } = useCart();
  const [formState, setFormState] = useState<FormState>(createInitialFormState);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedPaymentMethod = useMemo(
    () => PAYMENT_METHODS.find((method) => method.id === formState.metodoPago),
    [formState.metodoPago]
  );

  const hasCartItems = cartItems.length > 0;

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.precio ?? 0) * item.quantity,
        0
      ),
    [cartItems]
  );

  const handleChange = (field: FormField, value: string) => {
    if (statusMessage) {
      setStatusMessage(null);
    }
    if (errorMessage) {
      setErrorMessage(null);
    }

    setFormErrors((prev) => {
      const next = { ...prev };
      if (field in next) {
        delete next[field];
      }
      if (field === "metodoPago" && !CARD_PAYMENT_METHODS.has(value)) {
        delete next.titularTarjeta;
        delete next.numeroTarjeta;
        delete next.cvv;
        delete next.vencimiento;
      }
      return next;
    });

    if (field === "metodoPago") {
      setFormState((prev) => ({
        ...prev,
        metodoPago: value,
        ...(CARD_PAYMENT_METHODS.has(value)
          ? {}
          : {
              titularTarjeta: "",
              numeroTarjeta: "",
              cvv: "",
              vencimiento: "",
            }),
      }));
      return;
    }

    const nextValue =
      field === "numeroTarjeta"
        ? formatCardNumber(value)
        : field === "vencimiento"
        ? formatExpiry(value)
        : field === "cvv"
        ? formatCVV(value)
        : value;

    setFormState((prev) => ({
      ...prev,
      [field]: nextValue,
    }));
  };

  const applyServerErrors = (details: Record<string, unknown>) => {
    let cartErrorMessage: string | null = null;
    const nextErrors: FormErrors = {};

    Object.entries(details).forEach(([key, message]) => {
      if (
        Object.prototype.hasOwnProperty.call(EMPTY_FORM_STATE, key) &&
        typeof message === "string"
      ) {
        nextErrors[key as FormField] = message;
      }
      if (key === "cartItems" && typeof message === "string") {
        cartErrorMessage = message;
      }
    });

    if (Object.keys(nextErrors).length > 0) {
      setFormErrors((prev) => ({ ...prev, ...nextErrors }));
    }
    if (cartErrorMessage) {
      setErrorMessage(cartErrorMessage);
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);
    setErrorMessage(null);
    const validationErrors = validateForm(formState);
    if (Object.keys(validationErrors).length > 0) {
      setFormErrors(validationErrors);
      setIsSubmitting(false);
      return;
    }

    setFormErrors({});

    const trimmedNombre = formState.nombre.trim();
    const trimmedApellido = formState.apellido.trim();
    const trimmedCorreo = formState.correo.trim();
    const trimmedTelefono = formState.telefono.trim();
    const trimmedTitular = formState.titularTarjeta.trim();

    const sanitizedPhoneValue = sanitizePhone(trimmedTelefono);
    const sanitizedCardNumberValue = sanitizeCardNumber(
      formState.numeroTarjeta
    ).slice(0, CARD_DIGITS_LENGTH);
    const sanitizedCvvValue = sanitizeCVV(formState.cvv);

    const payload = {
      cartItems: cartItems.map((item) => ({
        id: item.id,
        nombre: item.nombre,
        precio: Number(item.precio ?? 0),
        quantity: item.quantity,
      })),
      contact: {
        nombre: trimmedNombre,
        apellido: trimmedApellido,
        correo: trimmedCorreo,
        telefono: sanitizedPhoneValue,
      },
      payment: {
        metodo: formState.metodoPago,
        titular: trimmedTitular,
        numero: sanitizedCardNumberValue,
        vencimiento: formState.vencimiento,
        cvv: sanitizedCvvValue,
      },
      total: cartSubtotal,
    };

    try {
      const response = await fetch("/api/v1/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data?.details && typeof data.details === "object") {
          applyServerErrors(data.details as Record<string, unknown>);
        }
        throw new Error(data?.error ?? "No pudimos registrar la venta.");
      }

      const successMessage = `Pedido registrado correctamente. Número de orden: ${data.numero}.`;
      setStatusMessage(successMessage);
      void Swal.fire({
        title: "¡Pedido confirmado!",
        html: `<p class="text-lg">Tu compra se registró con éxito.</p><p class="mt-2 text-base"><strong>Número de orden:</strong> ${data.numero}</p>`,
        icon: "success",
        confirmButtonText: "Entendido",
        confirmButtonColor: "#2563eb",
        background: "#f3f4f6",
        color: "#1f2937",
      });
      clearCart();
      setFormState(createInitialFormState());
      setFormErrors({});
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado al confirmar el pedido.";
      setErrorMessage(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const isCardPayment = CARD_PAYMENT_METHODS.has(formState.metodoPago);

  if (!hasCartItems) {
    return (
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
        <p className="text-base-content/70">
          Agregá productos para continuar con el proceso de compra.
        </p>
        <Link href="/e-commerce" className="btn btn-primary">
          Volver a la tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finalizar compra</h1>
          <p className="text-base-content/70">
            Completá tus datos y revisá el resumen antes de confirmar.
          </p>
        </div>
        <Link href="/carrito" className="btn btn-ghost">
          Volver al carrito
        </Link>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <section className="lg:col-span-2 space-y-6">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body space-y-4">
              <h2 className="card-title text-xl">Datos de contacto</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control w-full gap-2">
                  <span className="label-text">Nombre</span>
                  <input
                    required
                    value={formState.nombre}
                    onChange={(event) =>
                      handleChange("nombre", event.target.value)
                    }
                    className="input input-bordered w-full"
                    aria-invalid={Boolean(formErrors.nombre)}
                    aria-describedby={
                      formErrors.nombre ? "nombre-error" : undefined
                    }
                    placeholder="Juan"
                  />
                  {formErrors.nombre ? (
                    <span id="nombre-error" className="text-error text-xs">
                      {formErrors.nombre}
                    </span>
                  ) : null}
                </label>
                <label className="form-control w-full gap-2">
                  <span className="label-text">Apellido</span>
                  <input
                    required
                    value={formState.apellido}
                    onChange={(event) =>
                      handleChange("apellido", event.target.value)
                    }
                    className="input input-bordered w-full"
                    aria-invalid={Boolean(formErrors.apellido)}
                    aria-describedby={
                      formErrors.apellido ? "apellido-error" : undefined
                    }
                    placeholder="Pérez"
                  />
                  {formErrors.apellido ? (
                    <span id="apellido-error" className="text-error text-xs">
                      {formErrors.apellido}
                    </span>
                  ) : null}
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control w-full gap-2">
                  <span className="label-text">Correo electrónico</span>
                  <input
                    type="email"
                    required
                    value={formState.correo}
                    onChange={(event) =>
                      handleChange("correo", event.target.value)
                    }
                    className="input input-bordered w-full"
                    aria-invalid={Boolean(formErrors.correo)}
                    aria-describedby={
                      formErrors.correo ? "correo-error" : undefined
                    }
                    placeholder="tu@email.com"
                  />
                  {formErrors.correo ? (
                    <span id="correo-error" className="text-error text-xs">
                      {formErrors.correo}
                    </span>
                  ) : null}
                </label>
                <label className="form-control w-full gap-2">
                  <span className="label-text">Teléfono</span>
                  <input
                    type="tel"
                    required
                    value={formState.telefono}
                    onChange={(event) =>
                      handleChange("telefono", event.target.value)
                    }
                    className="input input-bordered w-full"
                    aria-invalid={Boolean(formErrors.telefono)}
                    aria-describedby={
                      formErrors.telefono ? "telefono-error" : undefined
                    }
                    inputMode="tel"
                    placeholder="+54 9 ..."
                  />
                  {formErrors.telefono ? (
                    <span id="telefono-error" className="text-error text-xs">
                      {formErrors.telefono}
                    </span>
                  ) : null}
                </label>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body space-y-4">
              <h2 className="card-title text-xl">Método de pago</h2>
              <label className="form-control w-full gap-2">
                <span className="label-text">Seleccioná un método</span>
                <select
                  value={formState.metodoPago}
                  onChange={(event) =>
                    handleChange("metodoPago", event.target.value)
                  }
                  className="select select-bordered w-full"
                >
                  {PAYMENT_METHODS.map((method) => (
                    <option key={method.id} value={method.id}>
                      {method.label}
                    </option>
                  ))}
                </select>
              </label>
              {selectedPaymentMethod?.helper ? (
                <p className="text-sm text-base-content/60">
                  {selectedPaymentMethod.helper}
                </p>
              ) : null}
              {isCardPayment ? (
                <div className="space-y-4 rounded-lg border border-base-300 p-4">
                  <p className="text-sm text-base-content/70">
                    Ingresá los datos de la tarjeta. Esta información se
                    procesará de forma segura al integrar la pasarela de pago.
                  </p>
                  <label className="form-control w-full gap-2">
                    <span className="label-text">Nombre del titular</span>
                    <input
                      required={isCardPayment}
                      value={formState.titularTarjeta}
                      onChange={(event) =>
                        handleChange("titularTarjeta", event.target.value)
                      }
                      className="input input-bordered w-full"
                      aria-invalid={Boolean(formErrors.titularTarjeta)}
                      aria-describedby={
                        formErrors.titularTarjeta ? "titular-error" : undefined
                      }
                      autoComplete="cc-name"
                      placeholder="Como figura en la tarjeta"
                    />
                    {formErrors.titularTarjeta ? (
                      <span id="titular-error" className="text-error text-xs">
                        {formErrors.titularTarjeta}
                      </span>
                    ) : null}
                  </label>
                  <label className="form-control w-full gap-2">
                    <span className="label-text">Número de tarjeta</span>
                    <input
                      required={isCardPayment}
                      value={formState.numeroTarjeta}
                      onChange={(event) =>
                        handleChange("numeroTarjeta", event.target.value)
                      }
                      className="input input-bordered w-full"
                      maxLength={19}
                      aria-invalid={Boolean(formErrors.numeroTarjeta)}
                      aria-describedby={
                        formErrors.numeroTarjeta ? "numero-error" : undefined
                      }
                      inputMode="numeric"
                      autoComplete="cc-number"
                      placeholder="XXXX XXXX XXXX XXXX"
                    />
                    {formErrors.numeroTarjeta ? (
                      <span id="numero-error" className="text-error text-xs">
                        {formErrors.numeroTarjeta}
                      </span>
                    ) : null}
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="form-control w-full gap-2">
                      <span className="label-text">Fecha de vencimiento</span>
                      <input
                        required={isCardPayment}
                        value={formState.vencimiento}
                        onChange={(event) =>
                          handleChange("vencimiento", event.target.value)
                        }
                        className="input input-bordered w-full"
                        aria-invalid={Boolean(formErrors.vencimiento)}
                        aria-describedby={
                          formErrors.vencimiento
                            ? "vencimiento-error"
                            : undefined
                        }
                        inputMode="numeric"
                        autoComplete="cc-exp"
                        maxLength={5}
                        pattern="[0-9]{2}/[0-9]{2}"
                        placeholder="MM/AA"
                      />
                      {formErrors.vencimiento ? (
                        <span
                          id="vencimiento-error"
                          className="text-error text-xs"
                        >
                          {formErrors.vencimiento}
                        </span>
                      ) : null}
                    </label>
                    <label className="form-control w-full gap-2">
                      <span className="label-text">CVV</span>
                      <input
                        required={isCardPayment}
                        value={formState.cvv}
                        onChange={(event) =>
                          handleChange("cvv", event.target.value)
                        }
                        className="input input-bordered w-full"
                        maxLength={3}
                        aria-invalid={Boolean(formErrors.cvv)}
                        aria-describedby={
                          formErrors.cvv ? "cvv-error" : undefined
                        }
                        inputMode="numeric"
                        autoComplete="cc-csc"
                        pattern="[0-9]{3}"
                        placeholder="XXX"
                      />
                      {formErrors.cvv ? (
                        <span id="cvv-error" className="text-error text-xs">
                          {formErrors.cvv}
                        </span>
                      ) : null}
                    </label>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </section>

        <aside className="space-y-6">
          <div className="card bg-base-200 shadow-lg">
            <div className="card-body space-y-4">
              <h2 className="card-title text-xl">Resumen del pedido</h2>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.nombre} × {item.quantity}
                    </span>
                    <span>{formatCurrency(item.precio * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="divider my-2" />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>{formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>{formatCurrency(cartTotal)}</span>
              </div>
              {errorMessage ? (
                <p className="text-error text-sm text-center">{errorMessage}</p>
              ) : null}
              {statusMessage ? (
                <p className="text-success text-sm text-center">
                  {statusMessage}
                </p>
              ) : null}
              <button
                type="submit"
                className="btn btn-primary w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Confirmando..." : "Confirmar pedido"}
              </button>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
