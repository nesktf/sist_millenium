"use client"

import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Search, X } from "lucide-react"

type Fila = {
  codigo: string
  articulo: string
  categoria: string
  marca: string
  deposito: string
  stock: number
  stock_min: number
  estado: "OK" | "REPONER" | string
}

type Deposito = {
  id: number
  nombre: string
  direccion: string
}

type Paginacion = {
  page: number
  pageSize: number
  totalItems: number
  totalPages: number
}

const PAGE_SIZE = 25

export default function ConsultarStockPage() {
  const router = useRouter()

  const [depositos, setDepositos] = useState<Deposito[]>([])
  const [selectedDeposito, setSelectedDeposito] = useState("")
  const [searchInput, setSearchInput] = useState("")
  const [searchValue, setSearchValue] = useState("")
  const [filas, setFilas] = useState<Fila[]>([])
  const [paginacion, setPaginacion] = useState<Paginacion>({
    page: 1,
    pageSize: PAGE_SIZE,
    totalItems: 0,
    totalPages: 1,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // cargar depósitos al iniciar
  useEffect(() => {
    let cancelado = false
    ;(async () => {
      try {
        const res = await fetch("/api/v1/deposito", { cache: "no-store" })
        if (!res.ok) {
          throw new Error("No se pudo obtener la lista de depósitos.")
        }
        const data = await res.json()
        if (!cancelado && Array.isArray(data)) {
          setDepositos(data)
        }
      } catch (err) {
        console.error(err)
        if (!cancelado) {
          setDepositos([])
        }
      }
    })()

    return () => {
      cancelado = true
    }
  }, [])

  // cargar stock cada vez que cambian filtros o página
  useEffect(() => {
    fetchStock()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDeposito, searchValue, paginacion.page])

  const fetchStock = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams({
        page: String(paginacion.page),
        pageSize: String(PAGE_SIZE),
      })

      if (selectedDeposito) {
        params.set("depositoId", selectedDeposito)
      }

      if (searchValue) {
        params.set("query", searchValue)
      }

      const res = await fetch(`/api/v1/stock?${params.toString()}`, {
        cache: "no-store",
      })
      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data?.error ?? "No se pudieron obtener los datos de stock.",
        )
      }

      setFilas(Array.isArray(data?.items) ? data.items : [])
      if (data?.paginacion) {
        setPaginacion((prev) => ({
          ...prev,
          ...data.paginacion,
          page: data.paginacion.page ?? prev.page,
          pageSize: data.paginacion.pageSize ?? prev.pageSize,
          totalItems: data.paginacion.totalItems ?? prev.totalItems,
          totalPages: data.paginacion.totalPages ?? prev.totalPages,
        }))
      } else {
        setPaginacion((prev) => ({
          ...prev,
          totalItems: Array.isArray(data?.items) ? data.items.length : 0,
          totalPages: 1,
        }))
      }
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err.message : "Error inesperado.")
      setFilas([])
    } finally {
      setIsLoading(false)
    }
  }

  const handleBuscar = () => {
    setPaginacion((prev) => ({ ...prev, page: 1 }))
    setSearchValue(searchInput.trim())
  }

  const handleLimpiarFiltros = () => {
    setSearchInput("")
    setSearchValue("")
    setSelectedDeposito("")
    setPaginacion((prev) => ({ ...prev, page: 1 }))
  }

  const handleDepositoChange = (value: string) => {
    setSelectedDeposito(value)
    setPaginacion((prev) => ({ ...prev, page: 1 }))
  }

  const handlePrevPage = () => {
    setPaginacion((prev) => ({
      ...prev,
      page: Math.max(1, prev.page - 1),
    }))
  }

  const handleNextPage = () => {
    setPaginacion((prev) => ({
      ...prev,
      page: Math.min(prev.totalPages, prev.page + 1),
    }))
  }

  const [desde, hasta] = useMemo(() => {
    if (filas.length === 0) return [0, 0]
    const start = (paginacion.page - 1) * paginacion.pageSize + 1
    const end = start + filas.length - 1
    return [start, end]
  }, [filas.length, paginacion.page, paginacion.pageSize])

  return (
    <main style={{ padding: "2rem" }}>
      <button
        onClick={() => router.back()}
        className="btn btn-ghost btn-sm p-0 min-h-0 h-auto"
      >
        <ArrowLeft className="w-4 h-4" /> Volver
      </button>

      <h1 className="text-2xl font-bold mt-4 mb-3">Consulta de stock</h1>

    
        
        <div className="flex flex-col flex-1 min-w-[220px]">
          <label className="text-sm font-medium text-base-content/70">
            Buscar (código o nombre)
          </label>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center border rounded-lg px-3 py-1">
              <Search className="w-4 h-4 text-base-content/50 mr-2" />
              <input
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleBuscar()
                  }
                }}
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Ej: abc1234..."
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={() => setSearchInput("")}
                  className="text-base-content/50 hover:text-base-content/80"
                  title="Limpiar búsqueda"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <button onClick={handleBuscar} className="btn btn-primary btn-sm">
              Buscar
            </button>
          </div>
        </div>

              <div className="flex flex-wrap gap-3 items-end mb-4">
        <div className="flex flex-col">
          <label className="text-sm font-medium text-base-content/70">
            Depósito
          </label>
          <select
            value={selectedDeposito}
            onChange={(e) => handleDepositoChange(e.target.value)}
            className="select select-bordered select-sm min-w-[220px]"
          >
            <option value="">Todos los depósitos</option>
            {depositos.map((d) => (
              <option key={d.id} value={String(d.id)}>
                {d.nombre}
              </option>
            ))}
          </select>
        </div>

        <button
          onClick={handleLimpiarFiltros}
          className="btn btn-sm bg-gray-200 hover:bg-gray-300 text-gray-700 border-none"
        >
          Limpiar filtros
        </button>
      </div>

      <div className="flex flex-wrap justify-between items-center mb-3 text-sm text-base-content/70">
        <span>
          {isLoading && "Cargando resultados..."}
            
        </span>
        <span>
          {searchValue
            ? `Filtro: "${searchValue}"${selectedDeposito ? " · depósito seleccionado" : ""}`
            : selectedDeposito
              ? "Filtrando por depósito seleccionado"
              : "Sin filtros aplicados"}
        </span>
      </div>

      {error ? (
        <div className="alert alert-error text-sm">{error}</div>
      ) : null}

      <div className="bg-base-100 rounded-lg shadow overflow-x-auto">
        <table className="table table-zebra w-full text-sm">
          <thead className="bg-base-200">
            <tr>
              <th>Código</th>
              <th>Artículo</th>
              <th>Categoría</th>
              <th>Marca</th>
              <th>Depósito</th>
              <th className="text-right">Stock</th>
              <th className="text-right">Stock mín.</th>
              <th className="text-center">Estado</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  Cargando…
                </td>
              </tr>
            ) : filas.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-8">
                  No se encontraron registros con los filtros seleccionados.
                </td>
              </tr>
            ) : (
              filas.map((fila, index) => (
                <tr key={`${fila.codigo}-${fila.deposito}-${index}`}>
                  <td className="font-semibold">{fila.codigo}</td>
                  <td>{fila.articulo}</td>
                  <td>{fila.categoria}</td>
                  <td>{fila.marca}</td>
                  <td>{fila.deposito}</td>
                  <td className="text-right">{fila.stock}</td>
                  <td className="text-right">{fila.stock_min}</td>
                  <td
                    className={`text-center font-semibold ${fila.estado === "OK" ? "text-success" : "text-error"}`}
                  >
                    {fila.estado}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

  {filas.length > 0 && (
      <div className="flex justify-between items-center mt-4 text-sm">
        <div>
          Página {paginacion.page} de {paginacion.totalPages}
        </div>
        <div className="flex gap-2">
          <button
            className="btn btn-outline btn-sm"
            onClick={handlePrevPage}
            disabled={paginacion.page <= 1 || isLoading}
          >
            Anterior
          </button>
          <button
            className="btn btn-outline btn-sm"
            onClick={handleNextPage}
            disabled={paginacion.page >= paginacion.totalPages || isLoading}
          >
            Siguiente
          </button>
        </div>
      </div>
      )}
    </main>
  )
}
