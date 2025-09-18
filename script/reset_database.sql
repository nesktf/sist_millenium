BEGIN;

TRUNCATE "Articulo" CASCADE;
TRUNCATE "CategoriaArticulo" CASCADE;
TRUNCATE "MarcaArticulo" CASCADE;
TRUNCATE "Deposito" CASCADE;
TRUNCATE "ArticDepos" CASCADE;
TRUNCATE "Proveedor" CASCADE;
TRUNCATE "TipoComprobanteProveedor" CASCADE;
TRUNCATE "ComprobanteProveedor" CASCADE;
TRUNCATE "DetalleComprobanteProveedor" CASCADE;
TRUNCATE "OrdenPago" CASCADE;
TRUNCATE "DetalleOrdenCompra" CASCADE;
TRUNCATE "OrdenCompra" CASCADE;

COMMIT;
