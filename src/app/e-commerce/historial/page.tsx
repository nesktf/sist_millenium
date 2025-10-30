"use client";

import Image from 'next/image';
import { 
  CalendarDays, 
  Receipt, 
  CreditCard, 
  Hash, 
  ArrowLeft,
  ImageOff,
  ChevronDown,
} from 'lucide-react';

import Link from "next/link";

import { UserHistoryAPIData } from "@/prisma/purchase_history"
import { useAuth } from '@/lib/auth_ctx';
import { formatCurrency } from "@/utils/currency";
import { useEffect, useState } from 'react';


export default function HistorialPage() {
  const { user } = useAuth();

  const getPurchaseHistory = async (userId: number): Promise<UserHistoryAPIData[]> => {
    return await fetch(`/api/v1/ecommerce/history?userId=${userId}`, {
      cache: 'no-store', 
    })
    .then(async (body) => await body.json())
    .then((json): UserHistoryAPIData[] => {
      if (json.error) {
        console.log(json.error);
        return [];
      }
      return json.history as UserHistoryAPIData[];
    })
    .catch((error) => {
      console.log(error);
      return [];
    });
  }
  const [history, setHistory] = useState<UserHistoryAPIData[]>([]);

  useEffect(() => {
    getPurchaseHistory(user?.id as number)
    .then(history => setHistory(history));
  }, []);

  return (
    <div className="container mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6">Mi Historial de Compras</h1>
      <Link 
        href="/e-commerce" 
        className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 mb-6 group"
        aria-label="Volver"
      >
        <ArrowLeft className="h-4 w-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
        Volver a la tienda
      </Link>

      {/* Manejo de estado vacío */}
      {history.length === 0 ? (
        <div className="text-center p-8 border rounded-lg bg-gray-50">
          <p className="text-lg text-gray-600">Aún no tienes compras en tu historial.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Iteramos sobre cada compra */}
          {history.map((compra) => (
            <div key={compra.id} className="border rounded-lg shadow-sm bg-white overflow-hidden">
              
              {/* Encabezado de la Compra */}
              <div className="p-4 sm:p-6 bg-gray-50 border-b grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div>
                  <InfoItem icon={CalendarDays} label="Fecha" value={new Date(compra.fecha).toLocaleDateString()} />
                </div>
                <div>
                  <InfoItem icon={Receipt} label="Factura N°" value={compra.num_factura} />
                </div>
                <div>
                  <InfoItem icon={CreditCard} label="Método" value={compra.metodo} />
                </div>
                <div className="text-right sm:text-left">
                  <InfoItem icon={Hash} label="Total" value={formatCurrency(compra.total)} isCurrency={true} />
                </div>
              </div>

              {/* Detalle de Productos (Colapsable) */}
              <details className="group">
                <summary className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50">
                  <span className="font-medium text-gray-700">
                    Ver {compra.productos.length} producto(s)
                  </span>
                  <ChevronDown className="h-5 w-5 text-gray-500 transition-transform group-open:rotate-180" />
                </summary>
                
                <div className="p-4 border-t">
                  <ul className="space-y-4">
                    {compra.productos.map((producto) => (
                      <li key={producto.id} className="flex items-center space-x-4">
                        <div className="flex-shrink-0 w-16 h-16 border rounded-md bg-gray-100 flex items-center justify-center">
                          {producto.imagen ? (
                            <Image
                              src={`/images/${producto.imagen}`}
                              alt={producto.nombre}
                              width={64}
                              height={64}
                              className="object-contain w-full h-full"
                            />
                          ) : (
                            <ImageOff className="h-8 w-8 text-gray-400" />
                          )}
                        </div>
                        
                        <div className="flex-1">
                          <h4 className="font-medium">{producto.nombre}</h4>
                          <p className="text-sm text-gray-500">Código: {producto.codigo}</p>
                        </div>

                        <div className="text-right">
                          <p className="font-medium">{formatCurrency(producto.precio)}</p>
                          <p className="text-sm text-gray-500">Cant: {producto.cantidad}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

type InfoItemProps = {
  icon: React.ElementType;
  label: string;
  value: string;
  isCurrency?: boolean;
}

function InfoItem({ icon: Icon, label, value, isCurrency = false }: InfoItemProps) {
  return (
    <div>
      <dt className="text-sm font-medium text-gray-500 flex items-center">
        <Icon className="h-4 w-4 mr-1.5" />
        {label}
      </dt>
      <dd className={`mt-1 text-base ${isCurrency ? 'font-semibold text-gray-800' : 'font-medium text-gray-700'}`}>
        {value}
      </dd>
    </div>
  )
}
