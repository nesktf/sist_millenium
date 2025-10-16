"use client";

import { ReactNode } from "react";

export default function Modal({
  children,
  onClose,
}: {
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* overlay */}
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      {/* caja modal con scroll */}
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 rounded-xl shadow-2xl
                      bg-base-100 text-base-content m-4">
        {children}
        <div className="mt-6 flex justify-end gap-2">
          <button className="btn btn-ghost" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}