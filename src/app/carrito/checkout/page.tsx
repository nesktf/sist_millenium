// src/app/carrito/checkout/page.tsx
"use client";

import { useCart } from "@/context/CartContext";
import Link from "next/link";
import { useMemo, useState } from "react";

type PaymentMethodOption = {
  id: string;
  label: string;
  helper?: string;
};

const PAYMENT_METHODS: PaymentMethodOption[] = [
  {
    id: "tarjeta_credito",
    label: "Tarjeta de Crédito",
    helper: "Visa, MasterCard, American Express",
  },
  {
    id: "tarjeta_debito",
    label: "Tarjeta de Débito",
  },
  {
    id: "transferencia",
    label: "Transferencia Bancaria",
  },
  {
    id: "mercado_pago",
    label: "Mercado Pago",
  },
];

const CARD_PAYMENT_METHODS = new Set(["tarjeta_credito", "tarjeta_debito"]);

const emptyFormState = {
  nombre: "",
  apellido: "",
  correo: "",
  telefono: "",
  domicilio: "",
  ciudad: "",
  provincia: "",
  codigoPostal: "",
  notas: "",
  metodoPago: PAYMENT_METHODS[0]?.id ?? "",
  titularTarjeta: "",
  numeroTarjeta: "",
  cvv: "",
  vencimiento: "",
};

export default function CheckoutPage() {
  const { cartItems, cartTotal } = useCart();
  const [formState, setFormState] = useState(emptyFormState);
  const [submitted, setSubmitted] = useState(false);

  const selectedPaymentMethod = useMemo(
    () => PAYMENT_METHODS.find(method => method.id === formState.metodoPago),
    [formState.metodoPago],
  );

  const formatCurrency = (value: number | undefined) =>
    Number(value ?? 0).toFixed(2);

  const hasCartItems = cartItems.length > 0;

  const cartSubtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) => sum + Number(item.precio ?? 0) * item.quantity,
        0,
      ),
    [cartItems],
  );

  const handleChange = (
    field: keyof typeof emptyFormState,
    value: string,
  ) => {
    if (submitted) {
      setSubmitted(false);
    }

    if (field === "metodoPago") {
      setFormState(prev => ({
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

    setFormState(prev => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    // Todavía no existe la integración real. Dejamos un estado para mostrar confirmación.
    setSubmitted(true);
  };

  const isCardPayment = CARD_PAYMENT_METHODS.has(formState.metodoPago);

  if (!hasCartItems) {
    return (
      <div className="max-w-3xl mx-auto text-center space-y-4">
        <h1 className="text-3xl font-bold">Tu carrito está vacío</h1>
        <p className="text-base-content/70">
          Agregá productos para continuar con el proceso de compra.
        </p>
        <Link href="/" className="btn btn-primary">
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
                    onChange={event => handleChange("nombre", event.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Juan"
                  />
                </label>
                <label className="form-control w-full gap-2">
                  <span className="label-text">Apellido</span>
                  <input
                    required
                    value={formState.apellido}
                    onChange={event =>
                      handleChange("apellido", event.target.value)
                    }
                    className="input input-bordered w-full"
                    placeholder="Pérez"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control w-full gap-2">
                  <span className="label-text">Correo electrónico</span>
                  <input
                    type="email"
                    required
                    value={formState.correo}
                    onChange={event =>
                      handleChange("correo", event.target.value)
                    }
                    className="input input-bordered w-full"
                    placeholder="tu@email.com"
                  />
                </label>
                <label className="form-control w-full gap-2">
                  <span className="label-text">Teléfono</span>
                  <input
                    type="tel"
                    required
                    value={formState.telefono}
                    onChange={event =>
                      handleChange("telefono", event.target.value)
                    }
                    className="input input-bordered w-full"
                    placeholder="+54 9 ..."
                  />
                </label>
              </div>
            </div>
          </div>

          <div className="card bg-base-200 shadow-lg">
            <div className="card-body space-y-4">
              <h2 className="card-title text-xl">Dirección de envío</h2>
              <label className="form-control w-full gap-2">
                <span className="label-text">Domicilio</span>
                <input
                  required
                  value={formState.domicilio}
                  onChange={event =>
                    handleChange("domicilio", event.target.value)
                  }
                  className="input input-bordered w-full"
                  placeholder="Calle y número"
                />
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="form-control w-full gap-2">
                  <span className="label-text">Ciudad</span>
                  <input
                    required
                    value={formState.ciudad}
                    onChange={event =>
                      handleChange("ciudad", event.target.value)
                    }
                    className="input input-bordered w-full"
                  />
                </label>
                <label className="form-control w-full gap-2">
                  <span className="label-text">Provincia / Estado</span>
                  <input
                    required
                    value={formState.provincia}
                    onChange={event =>
                      handleChange("provincia", event.target.value)
                    }
                    className="input input-bordered w-full"
                  />
                </label>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <label className="form-control md:col-span-1 w-full gap-2">
                  <span className="label-text">Código postal</span>
                  <input
                    required
                    value={formState.codigoPostal}
                    onChange={event =>
                      handleChange("codigoPostal", event.target.value)
                    }
                    className="input input-bordered w-full"
                  />
                </label>
                <label className="form-control md:col-span-2 w-full gap-2">
                  <span className="label-text">Notas para la entrega (opcional)</span>
                  <input
                    value={formState.notas}
                    onChange={event => handleChange("notas", event.target.value)}
                    className="input input-bordered w-full"
                    placeholder="Horario preferido, referencias, etc."
                  />
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
                  onChange={event =>
                    handleChange("metodoPago", event.target.value)
                  }
                  className="select select-bordered w-full"
                >
                  {PAYMENT_METHODS.map(method => (
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
                    Ingresá los datos de la tarjeta. Esta información se procesará de forma segura al integrar la pasarela de pago.
                  </p>
                  <label className="form-control w-full gap-2">
                    <span className="label-text">Nombre del titular</span>
                    <input
                      required={isCardPayment}
                      value={formState.titularTarjeta}
                      onChange={event =>
                        handleChange("titularTarjeta", event.target.value)
                      }
                      className="input input-bordered w-full"
                      placeholder="Como figura en la tarjeta"
                    />
                  </label>
                  <label className="form-control w-full gap-2">
                    <span className="label-text">Número de tarjeta</span>
                    <input
                      required={isCardPayment}
                      value={formState.numeroTarjeta}
                      onChange={event =>
                        handleChange("numeroTarjeta", event.target.value)
                      }
                      className="input input-bordered w-full"
                      maxLength={19}
                      placeholder="XXXX XXXX XXXX XXXX"
                    />
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="form-control w-full gap-2">
                      <span className="label-text">Fecha de vencimiento</span>
                      <input
                        required={isCardPayment}
                        value={formState.vencimiento}
                        onChange={event =>
                          handleChange("vencimiento", event.target.value)
                        }
                        className="input input-bordered w-full"
                        placeholder="MM/AA"
                      />
                    </label>
                    <label className="form-control w-full gap-2">
                      <span className="label-text">CVV</span>
                      <input
                        required={isCardPayment}
                        value={formState.cvv}
                        onChange={event => handleChange("cvv", event.target.value)}
                        className="input input-bordered w-full"
                        maxLength={4}
                        placeholder="XXX"
                      />
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
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>
                      {item.nombre} × {item.quantity}
                    </span>
                    <span>${formatCurrency(item.precio * item.quantity)}</span>
                  </div>
                ))}
              </div>
              <div className="divider my-2" />
              <div className="flex justify-between text-sm">
                <span>Subtotal</span>
                <span>${formatCurrency(cartSubtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Envío</span>
                <span>A coordinar</span>
              </div>
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${formatCurrency(cartTotal)}</span>
              </div>
              <p className="text-xs text-base-content/60">
                El costo de envío se confirma luego de coordinar la entrega.
              </p>
              <button type="submit" className="btn btn-primary w-full">
                Confirmar pedido
              </button>
              {submitted ? (
                <p className="text-success text-sm text-center">
                  Recibimos tus datos. En la próxima etapa se procesará el pago.
                </p>
              ) : null}
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}
