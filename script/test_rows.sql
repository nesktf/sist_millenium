BEGIN;

-- 1) Depósitos  (idempotente, sin UNIQUE en direccion usamos NOT EXISTS)
INSERT INTO "Deposito" ("id", "nombre", "direccion", "cap_max")
VALUES
  (1, 'Depósito Principal', 'Calle Cuántica 000', 1000),
  (2, 'Deposito Hakurei', 'Calle Falsa 123', 400),
  (3, 'Depósito Moriya', 'Calle Real 321', 400),
  (4, 'Depósito Scarlet', 'Calle Tal Vez Real 789', 500),
  (5, 'Depósito Kappa', 'Calle Tal Vez Falsa 987', 900),
  (6, 'Depósito Yamawaro', 'Calle Cuántica 456654', 900);

-- 2) Marcas
INSERT INTO "MarcaArticulo" ("id", "nombre")
VALUES
  (1, 'Intel'),
  (2, 'AMD'),
  (3, 'NVIDIA'),
  (4, 'Corsair'),
  (5, 'Samsung'),
  (6, 'Seagate'),
  (7, 'WesternDigital'),
  (8, 'ASUS'),
  (9, 'MSI'),
  (10, 'Gigabyte'),
  (11, 'EVGA'),
  (12, 'CoolerMaster'),
  (13, 'NZXT'),
  (14, 'Logitech'),
  (15, 'Razer'),
  (16, 'SteelSeries'),
  (17, 'HyperX'),
  (18, 'Kingston'),
  (19, 'Crucial'),
  (20, 'Adata');

-- 3) Categorias
INSERT INTO "CategoriaArticulo" ("id", "nombre")
VALUES
  (1, 'CPU'),
  (2, 'GPU'),
  (3, 'RAM'),
  (4, 'SSD'),
  (5, 'HDD'),
  (6, 'Motherboard'),
  (7, 'Power Supply'),
  (8, 'Case'),
  (9, 'Cooling Fan'),
  (10, 'Monitor'),
  (11, 'Keyboard'),
  (12, 'Mouse'),
  (13, 'Headset'),
  (14, 'Graphics Card'),
  (15, 'Processor'),
  (16, 'Memory'),
  (17, 'Storage'),
  (18, 'Chassis'),
  (19, 'PSU'),
  (20, 'Cooler'),
  (21, 'Display'),
  (22, 'Input Device'),
  (23, 'Audio Device'),
  (24, 'Video Card'),
  (25, 'Mainboard'),
  (26, 'Peripheral'),
  (27, 'Peripheral Component'),
  (28, 'Peripheral Device'),
  (29, 'Peripheral Equipment'),
  (30, 'Peripheral Hardware'),
  (31, 'Peripheral Unit');

-- 4) Artículos (idempotente, acá SÍ hay UNIQUE en codigo)
INSERT INTO "Articulo" ("id", "codigo","nombre", "id_marca", "id_categoria", "imagen")
VALUES
  (1, 'rtx4153', 'RTX 4090 Supreme Titan Master Flandre Edition', 3, 3, 'RTX 4090 Supreme Titan Master Flandre Edition.jpeg'),
  (2, 'abc1234', 'Core i9-13900K Ultra Pro Max Turbo Marisa Edition', 1, 1, 'Core i9-13900K Ultra Pro Max Turbo Marisa Edition.jpeg'),
  (3, 'defg4124', 'Ryzen 7 7800X3D Gamer Plus Sakuya Edition', 2, 2, 'Ryzen 7 7800X3D Gamer Plus Sakuya Edition.jpeg'),
  (4, 'asda4125', 'Radeon RX 7900 XTX Liquid Cool Reimu Edition', 4, 4, 'Radeon RX 7900 XTX Liquid Cool Reimu Edition.jpeg'),
  (5, 'uiop9876', 'Core i7-12700F Eco-Friendly Remilia Edition', 5, 5, 'Core i7-12700F Eco-Friendly Remilia Edition.jpeg'),
  (6, 'hjk54321', 'Ryzen 5 5600G Budget Beast Cirno Edition', 6, 6, 'Ryzen 5 5600G Budget Beast Cirno Edition.jpeg'),
  (7, 'zxv8765', 'GTX 1660 Ti Legacy Reborn Koishi Edition', 7, 7, 'GTX 1660 Ti Legacy Reborn Koishi Edition.jpeg'), 
  (8, 'qwer1234', 'Radeon RX 6600 XT The Lightweight Sanae Edition', 8, 8, 'Radeon RX 6600 XT The Lightweight Sanae Edition.jpeg'),
  (9, 'mnbvc56', 'Xeon W-3495X Server Super Youmu Edition', 9, 9, 'Xeon W-3495X Server Super Youmu Edition.jpeg'),
  (10, 'lkjhg98', 'Ryzen 9 7950X Threadripper Saurus Yuyuko Edition', 10, 10, 'Ryzen 9 7950X Threadripper Saurus Yuyuko Edition.jpeg'),
  (11, 'poiu876', 'RTX 3080 Ti Super Deluxe Alice Edition', 11, 11, 'RTX 3080 Ti Super Deluxe Alice Edition.jpeg'),
  (12, 'ytr145', 'Radeon RX 6900 XT The Infinity Patchouli Edition', 12, 12, 'Radeon RX 6900 XT The Infinity Patchouli Edition.jpeg'),
  (13, 'rewq234', 'Core i5-11600K Overclockinator Yukari Edition', 13, 13, 'Core i5-11600K Overclockinator Yukari Edition.jpeg'),
  (14, 'asdfg345', 'Ryzen 3 4100 Essential Pro Ran Edition', 14, 14, 'Ryzen 3 4100 Essential Pro Ran Edition.jpeg'),
  (15, 'zxcvb567', 'GTX 1050 Ti The Mini Hero Chen Edition', 15, 15, 'GTX 1050 Ti The Mini Hero Chen Edition.jpeg'),
  (16, 'oiuyt789', 'Radeon RX 570 Phantom Ghost Aya Edition', 16, 16, 'Radeon RX 570 Phantom Ghost Aya Edition.jpeg'),
  (17, 'plokm123', 'Pentium G7400 Retro Pro Reisen Edition', 17, 17, 'Pentium G7400 Retro Pro Reisen Edition.jpeg'),
  (18, 'trewq543', 'Ryzen 9 5900X Master Builder Utsuho Edition', 18, 18, 'Ryzen 9 5900X Master Builder Utsuho Edition.jpeg'),
  (19, 'qazwsxedc21', 'RTX 2060 Super Turbo Force Suwako Edition', 19, 19, 'RTX 2060 Super Turbo Force Suwako Edition.jpeg'),
  (20, 'rfvtgbyhnuj765', 'Radeon RX 5500 XT The Starter Momiji Edition', 20, 20, 'Radeon RX 5500 XT The Starter Momiji Edition.jpeg'),
  (21, 'yhnj12345', 'Core i3-10100F The Budget King Hina Edition', 1, 21, 'Core i3-10100F The Budget King Hina Edition.jpeg'),
  (22, 'edc5678', 'Ryzen 7 5700G Office Ninja Nitori Edition', 2, 22, 'Ryzen 7 5700G Office Ninja Nitori Edition.jpeg'),
  (23, 'rfvbnm098', 'RTX 3060 Ti Gaming Ace Mokou Edition', 3, 23, 'RTX 3060 Ti Gaming Ace Mokou Edition.jpeg'),
  (24, 'tgb2468', 'Radeon RX 6700 XT Extreme Keine Edition', 4, 24, 'Radeon RX 6700 XT Extreme Keine Edition.jpeg'),
  (25, 'ujmnh421', 'Core i9-10900K King of Speed Komachi Edition', 5, 25, 'Core i9-10900K King of Speed Komachi Edition.jpeg'),
  (26, 'ikol369', 'Ryzen 5 3600 Gaming Classic Eiki Edition', 6, 26, 'Ryzen 5 3600 Gaming Classic Eiki Edition.jpeg'),
  (27, 'wsx258', 'GTX 1650 Super Compact Miko Edition', 7, 27,'"GTX 1650 Super Compact Miko Edition.jpeg'),
  (28, 'rfv753', 'Radeon RX 580 The Beast Unleashed Byakuren Edition', 8, 28, 'Radeon RX 580 The Beast Unleashed Byakuren Edition.jpeg'),
  (29, 'tgb951', 'Core i7-9700K Old But Gold Shou Edition', 9, 29, 'Core i7-9700K Old But Gold Shou Edition.jpeg'),
  (30, 'yhn486', 'Ryzen 7 2700X Legacy Champion Mamizou Edition', 10, 30, 'Ryzen 7 2700X Legacy Champion Mamizou Edition.jpeg')
ON CONFLICT ("codigo") DO NOTHING;

-- 5) Stock para rtx4153 en Depósito Principal
INSERT INTO "ArticDepos" ("id", "id_deposito", "id_articulo", "stock", "stock_min")
VALUES
  (1, 1, 1, 20, 0);

INSERT INTO "TipoOperacion" (id, nombre, naturaleza) VALUES
(1, 'Compra', 'INGRESO'),
(2, 'Devolución de Cliente', 'INGRESO'),
(3, 'Venta', 'EGRESO'),
(4, 'Rotura', 'EGRESO'),
(5, 'Transferencia (Salida)', 'EGRESO'),
(6, 'Transferencia (Entrada)', 'INGRESO');

INSERT INTO "MovimientoStock" ("id", "id_deposito", "fecha_hora", "id_tipo_operacion", "num_comprobante", "id_tipo_comprobante")
VALUES
  (1, 1, '2025-09-05 15:57:18.561', 1, 'ING-1234', NULL),
  (2, 1, '2025-09-10 15:57:18.561', 3, 'TR-0001', NULL);

INSERT INTO "DetalleMovimiento" ("id", "id_movimiento", "id_artic_depos", "cantidad")
VALUES
  (1, 1, 1, 5),
  (2, 2, 1, 10);

INSERT INTO "Proveedor" (id, nombre, cuit, razon_social, domicilio, email, estado) VALUES
  (1, 'Distribuciones Alfa', '30-12345678-9', 'Distribuciones Alfa SRL', 'Calle Falsa 123, Ciudad', 'contacto@alfa.com', 'ACTIVO'),
  (2, 'Suministros Beta', '20-87654321-0', 'Suministros Beta SA', 'Av. Siempre Viva 742, Ciudad', 'ventas@beta.com', 'ACTIVO'),
  (3, 'Gamma Proveedores', '27-11223344-5', 'Gamma Proveedores SA', 'Calle Luna 456, Ciudad', 'info@gamma.com', 'INACTIVO'),
  (4, 'Delta Comercial', '30-55667788-1', 'Delta Comercial SRL', 'Calle Sol 789, Ciudad', 'contacto@delta.com', 'ACTIVO'),
  (5, 'Epsilon S.A.', '23-99887766-2', 'Epsilon Sociedad Anónima', 'Av. Estrella 321, Ciudad', 'ventas@epsilon.com', 'INACTIVO'),
  (6, 'Zeta Distribuciones', '20-33445566-7', 'Zeta Distribuciones SRL', 'Calle Mar 654, Ciudad', 'info@zeta.com', 'ACTIVO'),
  (7, 'Eta Proveedores', '27-66778899-3', 'Eta Proveedores SA', 'Av. Tierra 987, Ciudad', 'contacto@eta.com', 'ACTIVO'),
  (8, 'Theta Comercial', '30-22334455-6', 'Theta Comercial SRL', 'Calle Aire 213, Ciudad', 'ventas@theta.com', 'INACTIVO'),
  (9, 'Iota Suministros', '23-44556677-4', 'Iota Suministros SA', 'Av. Agua 432, Ciudad', 'info@iota.com', 'ACTIVO'),
  (10, 'Kappa Proveedores', '20-55667788-5', 'Kappa Proveedores SRL', 'Calle Fuego 765, Ciudad', 'contacto@kappa.com', 'ACTIVO');


-- Reset ids
ALTER SEQUENCE "Deposito_id_seq" RESTART WITH 7;
ALTER SEQUENCE "Articulo_id_seq" RESTART WITH 31;
ALTER SEQUENCE "CategoriaArticulo_id_seq" RESTART WITH 21;
ALTER SEQUENCE "MarcaArticulo_id_seq" RESTART WITH 7;
ALTER SEQUENCE "ArticDepos_id_seq" RESTART WITH 2;
ALTER SEQUENCE "MovimientoStock_id_seq" RESTART WITH 2;
ALTER SEQUENCE "DetalleMovimiento_id_seq" RESTART WITH 3;
ALTER SEQUENCE "Proveedor_id_seq" RESTART WITH 11;


INSERT INTO "PrecioDeVenta" ("id_producto", "precio") VALUES
(1, 2500000),
(2, 2300000),
(3, 1900000),
(4, 1800000),
(5, 1600000),
(6, 1300000),
(7, 1100000),
(8, 1200000),
(9, 3000000),
(10, 2700000),
(11, 2000000),
(12, 1900000),
(13, 1500000),
(14, 1000000),
(15, 850000),
(16, 700000),
(17, 600000),
(18, 2400000),
(19, 1700000),
(20, 900000),
(21, 500000),
(22, 950000),
(23, 1600000),
(24, 1750000),
(25, 1550000),
(26, 1250000),
(27, 1000000),
(28, 1150000),
(29, 1300000),
(30, 950000);

-- Both passwords are "admin"
INSERT INTO "UserEcommerce"
  ("id", "correo", "contraseña", "nombre", "apellido", "domicilio")
VALUES
  (1, 'admin@admin.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Admin', 'Computer', 'localhost'),
  (2, 'nitori@kappa.com', '8c6976e5b5410415bde908bd4dee15dfb167a9c873fc4bb8a81f6f2ab448a918', 'Nitori', 'Kawashiro', 'Kappa Village 200');

ALTER SEQUENCE "UserEcommerce_id_seq" RESTART WITH 3;

COMMIT;

-- 6) Chequeo
SELECT ad.id, a.codigo, d.direccion, ad.stock, ad.stock_min
FROM "ArticDepos" ad
JOIN "Articulo" a ON a.id = ad.id_articulo
JOIN "Deposito" d ON d.id = ad.id_deposito
ORDER BY a.codigo, d.direccion;


BEGIN;

-- =================================================================
-- FASE 1: DATOS ORIGINALES DE test_rows.sql (SOLO LO NECESARIO)
-- =================================================================

-- Insertamos los tipos de comprobante PRIMERO
INSERT INTO "TipoComprobanteProveedor" (id, nombre, descripcion) VALUES
(1, 'Factura A', 'Factura tipo A'),
(2, 'Factura B', 'Factura tipo B'),
(3, 'Factura C', 'Factura tipo C'),
(4, 'Nota de Crédito', 'Nota de crédito'),
(5, 'Nota de Débito', 'Nota de débito'),
(6, 'Remito', 'Remito de mercadería');

-- Reiniciamos la secuencia para que no haya colisiones
ALTER SEQUENCE "TipoComprobanteProveedor_id_seq" RESTART WITH 7;

-- =================================================================
-- FASE 2: AGREGAR STOCK PARA LOS ARTÍCULOS RESTANTES
-- (Necesario para poder generar ventas)
-- =================================================================
INSERT INTO "ArticDepos" ("id", "id_deposito", "id_articulo", "stock", "stock_min") VALUES
(2, 1, 2, 50, 10),
(3, 2, 3, 50, 10),
(4, 3, 4, 50, 10),
(5, 4, 5, 50, 10),
(6, 5, 6, 50, 10),
(7, 6, 7, 50, 10),
(8, 1, 8, 50, 10),
(9, 2, 9, 50, 10),
(10, 3, 10, 50, 10),
(11, 4, 11, 50, 10),
(12, 5, 12, 50, 10),
(13, 6, 13, 50, 10),
(14, 1, 14, 50, 10),
(15, 2, 15, 50, 10),
(16, 3, 16, 50, 10),
(17, 4, 17, 50, 10),
(18, 5, 18, 50, 10),
(19, 6, 19, 50, 10),
(20, 1, 20, 50, 10),
(21, 2, 21, 50, 10),
(22, 3, 22, 50, 10),
(23, 4, 23, 50, 10),
(24, 5, 24, 50, 10),
(25, 6, 25, 50, 10),
(26, 1, 26, 50, 10),
(27, 2, 27, 50, 10),
(28, 3, 28, 50, 10),
(29, 4, 29, 50, 10),
(30, 5, 30, 50, 10);

-- =================================================================
-- FASE 3: GENERAR 10 COMPROBANTES DE PROVEEDOR
-- (Ahora SÍ encontrará los id_tipo_comprobante)
-- =================================================================

-- Comprobante 1 (Total: 34,000,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(1, 1, 1, NULL, '2025-07-01', 'A', '0001', '00000001', 34000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(1, 1, 1, 10, 1800000),
(2, 1, 2, 10, 1600000);

-- Comprobante 2 (Total: 27,000,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(2, 2, 1, NULL, '2025-07-02', 'A', '0001', '00000002', 27000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(3, 2, 3, 10, 1500000),
(4, 2, 4, 10, 1200000);

-- Comprobante 3 (Total: 40,000,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(3, 3, 1, NULL, '2025-07-03', 'A', '0001', '00000003', 40000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(5, 3, 9, 10, 2000000),
(6, 3, 10, 10, 2000000);

-- Comprobante 4 (Total: 10,000,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(4, 4, 1, NULL, '2025-07-04', 'A', '0001', '00000004', 10000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(7, 4, 15, 20, 500000);

-- Comprobante 5 (Total: 13,000,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(5, 5, 1, NULL, '2025-07-05', 'A', '0001', '00000005', 13000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(8, 5, 21, 20, 300000),
(9, 5, 22, 10, 700000);

-- Comprobante 6 (Total: 22,000,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(6, 6, 1, NULL, '2025-07-06', 'A', '0001', '00000006', 22000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(10, 6, 18, 10, 1700000),
(11, 6, 19, 10, 500000);

-- Comprobante 7 (Total: 13,000,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(7, 7, 1, NULL, '2025-07-07', 'A', '0001', '00000007', 13000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(12, 7, 30, 20, 650000);

-- Comprobante 8 (Total: 17,500,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(8, 8, 1, NULL, '2025-07-08', 'A', '0001', '00000008', 17500000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(13, 8, 24, 10, 1200000),
(14, 8, 25, 5, 1100000);

-- Comprobante 9 (Total: 10,000,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(9, 9, 1, NULL, '2025-07-09', 'A', '0001', '00000009', 10000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(15, 9, 27, 10, 700000),
(16, 9, 28, 10, 300000);

-- Comprobante 10 (Total: 20,000,000)
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(10, 10, 1, NULL, '2025-07-10', 'A', '0001', '00000010', 20000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(17, 10, 11, 10, 1500000),
(18, 10, 12, 10, 500000);

-- =================================================================
-- FASE 4: GENERAR 10 ÓRDENES DE PAGO Y VINCULARLAS
-- =================================================================

-- Orden de Pago 1 (Paga Comp 1)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(1, 'OP-0001', '2025-07-02', 'PAGADO', 34000000, 1, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(1, 1, 1, 34000000, 34000000, 0, 'PAGADO');

-- Orden de Pago 2 (Paga Comp 2)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(2, 'OP-0002', '2025-07-03', 'PAGADO', 27000000, 2, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(2, 2, 2, 27000000, 27000000, 0, 'PAGADO');

-- Orden de Pago 3 (Paga Comp 3)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(3, 'OP-0003', '2025-08-04', 'PAGADO', 40000000, 3, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(3, 3, 3, 40000000, 40000000, 0, 'PAGADO');

-- Orden de Pago 4 (Paga Comp 4)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(4, 'OP-0004', '2025-08-05', 'PAGADO', 10000000, 4, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(4, 4, 4, 10000000, 10000000, 0, 'PAGADO');

-- Orden de Pago 5 (Paga Comp 5)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(5, 'OP-0005', '2025-08-06', 'PAGADO', 13000000, 5, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(5, 5, 5, 13000000, 13000000, 0, 'PAGADO');

-- Orden de Pago 6 (Paga Comp 6)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(6, 'OP-0006', '2025-09-07', 'PAGADO', 22000000, 6, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(6, 6, 6, 22000000, 22000000, 0, 'PAGADO');

-- Orden de Pago 7 (Paga Comp 7)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(7, 'OP-0007', '2025-09-08', 'PAGADO', 13000000, 7, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(7, 7, 7, 13000000, 13000000, 0, 'PAGADO');

-- Orden de Pago 8 (Paga Comp 8)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(8, 'OP-0008', '2025-10-09', 'PAGADO', 17500000, 8, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(8, 8, 8, 17500000, 17500000, 0, 'PAGADO');

-- Orden de Pago 9 (Paga Comp 9)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(9, 'OP-0009', '2025-10-10', 'PAGADO', 10000000, 9, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(9, 9, 9, 10000000, 10000000, 0, 'PAGADO');

-- Orden de Pago 10 (Paga Comp 10)
INSERT INTO "OrdenPago" (id, numero, fecha, estado, total, id_proveedor, forma_pago) VALUES
(10, 'OP-0010', '2025-10-11', 'PAGADO', 20000000, 10, 'TRANSFERENCIA');
INSERT INTO "ComprobanteOrdenPago" (id, id_comprobante, id_orden_pago, total_comprobante, monto_pagado, saldo_pendiente, estado) VALUES
(10, 10, 10, 20000000, 20000000, 0, 'PAGADO');


-- =================================================================
-- FASE 5: GENERAR 30 VENTAS CON SUS FACTURAS
-- =================================================================

-- Venta 1 (Art 1 x2 = 5,000,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(1, 'V-0001', 5000000, '2025-07-01 10:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(1, 2500000, 2, 1, 1);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(1, 'A-0001-00000001', '2025-07-01 10:01:00', 5000000, 'ENTREGADA', 1);

-- Venta 2 (Art 3 x1 = 1,900,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(2, 'V-0002', 1900000, '2025-07-02 11:00:00', 2, 'TARJETA_DEBITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(2, 1900000, 1, 2, 3);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(2, 'A-0001-0000002', '2025-07-02 11:01:00', 1900000, 'ENVIADA', 2);

-- Venta 3 (Art 5 x1 + Art 6 x2 = 1,600,000 + 2,600,000 = 4,200,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(3, 'V-0003', 4200000, '2025-10-03 12:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(3, 1600000, 1, 3, 5),
(4, 1300000, 2, 3, 6);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(3, 'A-0223-00000003', '2025-07-03 12:01:00', 4200000, 'EN_PREPARACION', 3);

-- Venta 4 (Art 10 x1 = 2,700,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(4, 'V-0004', 2700000, '2025-07-04 13:00:00', 2, 'TARJETA_CREDITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(5, 2700000, 1, 4, 10);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(4, 'B-2211-00000004', '2025-07-04 13:01:00', 2700000, 'ENTREGADA', 4);

-- Venta 5 (Art 21 x3 = 1,500,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(5, 'V-0005', 1500000, '2025-08-05 14:00:00', 1, 'TARJETA_DEBITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(6, 500000, 3, 5, 21);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(5, 'A-0009-00000005', '2025-08-05 14:01:00', 1500000, 'ENTREGADA', 5);

-- Venta 6 (Art 23 x1 + Art 24 x1 = 1,600,000 + 1,750,000 = 3,350,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(6, '-0006', 3350000, '2025-08-06 15:00:00', 2, 'TARJETA_CREDITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(7, 1600000, 1, 6, 23),
(8, 1750000, 1, 6, 24);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(6, 'B-0003-00000006', '2025-08-06 15:01:00', 3350000, 'ENVIADA', 6);

-- Venta 7 (Art 30 x1 = 950,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(7, 'V-0007', 950000, '2025-08-07 16:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(9, 950000, 1, 7, 30);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(7, 'C-0006-00000007', '2025-08-07 16:01:00', 950000, 'ENTREGADA', 7);

-- Venta 8 (Art 15 x1 = 850,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(8, 'V-0008', 850000, '2025-08-08 17:00:00', 2, 'TARJETA_DEBITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(10, 850000, 1, 8, 15);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(8, 'A-0021-00000008', '2025-08-08 17:01:00', 850000, 'ENTREGADA', 8);

-- Venta 9 (Art 18 x1 = 2,400,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(9, 'V-0009', 2400000, '2025-08-09 18:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(11, 2400000, 1, 9, 18);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(9, 'A-0321-00000009', '2025-08-09 18:01:00', 2400000, 'EN_PREPARACION', 9);

-- Venta 10 (Art 2 x1 = 2,300,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(10, 'V-0010', 2300000, '2025-09-10 10:00:00', 2, 'TARJETA_CREDITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(12, 2300000, 1, 10, 2);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(10, 'B-0211-00000010', '2025-09-10 10:01:00', 2300000, 'ENTREGADA', 10);

-- Venta 11 (Art 1 x1 = 2,500,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(11, 'V-0011', 2500000, '2025-09-11 11:00:00', 1, 'TARJETA_DEBITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(13, 2500000, 1, 11, 1);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(11, 'A-0211-00000011', '2025-09-11 11:01:00', 2500000, 'ENVIADA', 11);

-- Venta 12 (Art 7 x1 + Art 8 x1 = 1,100,000 + 1,200,000 = 2,300,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(12, 'V-0012', 2300000, '2025-09-12 12:00:00', 2, 'TARJETA_CREDITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(14, 1100000, 1, 12, 7),
(15, 1200000, 1, 12, 8);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(12, 'C-0211-00000012', '2025-09-12 12:01:00', 2300000, 'ENTREGADA', 12);

-- Venta 13 (Art 11 x1 = 2,000,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(13, 'V-0013', 2000000, '2025-09-13 13:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(16, 2000000, 1, 13, 11);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(13, 'A-0111-00000013', '2025-09-13 13:01:00', 2000000, 'ENTREGADA', 13);

-- Venta 14 (Art 13 x1 = 1,500,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(14, 'V-0014', 1500000, '2025-09-14 14:00:00', 2, 'TARJETA_DEBITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(17, 1500000, 1, 14, 13);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(14, 'A-0112-00000014', '2025-09-14 14:01:00', 1500000, 'EN_PREPARACION', 14);

-- Venta 15 (Art 26 x1 + Art 27 x1 = 1,250,000 + 1,000,000 = 2,250,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(15, 'V-0015', 2250000, '2025-09-15 15:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(18, 1250000, 1, 15, 26),
(19, 1000000, 1, 15, 27);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(15, 'B-0011-00000015', '2025-09-15 15:01:00', 2250000, 'ENTREGADA', 15);

-- Venta 16 (Art 4 x1 = 1,800,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(16, 'V-0016', 1800000, '2025-09-16 16:00:00', 2, 'TARJETA_DEBITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(20, 1800000, 1, 16, 4);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(16, 'B-0011-00000016', '2025-09-16 16:01:00', 1800000, 'ENVIADA', 16);

-- Venta 17 (Art 9 x1 = 3,000,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(17, 'V-0017', 3000000, '2025-09-17 17:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(21, 3000000, 1, 17, 9);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(17, 'B-0011-00000017', '2025-09-17 17:01:00', 3000000, 'ENTREGADA', 17);

-- Venta 18 (Art 12 x1 = 1,900,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(18, 'V-0018', 1900000, '2025-10-18 18:00:00', 2, 'TARJETA_CREDITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(22, 1900000, 1, 18, 12);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(18, 'B-0012-00000018', '2025-10-18 18:01:00', 1900000, 'ENTREGADA', 18);

-- Venta 19 (Art 14 x1 = 1,000,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(19, 'V-0019', 1000000, '2025-10-19 10:00:00', 1, 'TARJETA_DEBITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(23, 1000000, 1, 19, 14);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(19, 'C-0011-00000019', '2025-10-19 10:01:00', 1000000, 'ENVIADA', 19);

-- Venta 20 (Art 16 x1 + Art 17 x1 = 700,000 + 600,000 = 1,300,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(20, 'V-0020', 1300000, '2025-10-20 11:00:00', 2, 'TARJETA_CREDITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(24, 700000, 1, 20, 16),
(25, 600000, 1, 20, 17);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(20, 'A-0013-00000020', '2025-10-20 11:01:00', 1300000, 'ENTREGADA', 20);

-- Venta 21 (Art 19 x1 = 1,700,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(21, 'V-0021', 1700000, '2025-10-21 12:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(26, 1700000, 1, 21, 19);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(21, 'B-0011-00000021', '2025-10-21 12:01:00', 1700000, 'ENTREGADA', 21);

-- Venta 22 (Art 20 x1 = 900,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(22, 'V-0022', 900000, '2025-10-22 13:00:00', 2, 'TARJETA_DEBITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(27, 900000, 1, 22, 20);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(22, 'B-0011-00000022', '2025-10-22 13:01:00', 900000, 'EN_PREPARACION', 22);

-- Venta 23 (Art 22 x1 = 950,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(23, 'V-0023', 950000, '2025-10-23 14:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(28, 950000, 1, 23, 22);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(23, 'B-0011-00000023', '2025-10-23 14:01:00', 950000, 'ENTREGADA', 23);

-- Venta 24 (Art 25 x1 = 1,550,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(24, 'V-0024', 1550000, '2025-10-24 15:00:00', 2, 'TARJETA_CREDITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(29, 1550000, 1, 24, 25);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(24, 'A-0011-00000024', '2025-10-24 15:01:00', 1550000, 'ENTREGADA', 24);

-- Venta 25 (Art 28 x1 = 1,150,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(25, 'V-0025', 1150000, '2025-10-25 16:00:00', 1, 'TARJETA_DEBITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(30, 1150000, 1, 25, 28);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(25, 'B-0011-00000025', '2025-10-25 16:01:00', 1150000, 'ENVIADA', 25);

-- Venta 26 (Art 29 x1 = 1,300,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(26, 'V-0026', 1300000, '2025-10-26 17:00:00', 2, 'TARJETA_CREDITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(31, 1300000, 1, 26, 29);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(26, 'B-0011-00000026', '2025-10-26 17:01:00', 1300000, 'ENTREGADA', 26);

-- Venta 27 (Art 1 x1 = 2,500,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(27, 'V-0027', 2500000, '2025-10-27 18:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(32, 2500000, 1, 27, 1);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(27, 'B-0011-00000027', '2025-10-27 18:01:00', 2500000, 'ENTREGADA', 27);

-- Venta 28 (Art 2 x1 = 2,300,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(28, 'V-0028', 2300000, '2025-10-28 10:00:00', 2, 'TARJETA_DEBITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(33, 2300000, 1, 28, 2);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(28, 'B-0011-00000028', '2025-10-28 10:01:00', 2300000, 'EN_PREPARACION', 28);

-- Venta 29 (Art 3 x1 + Art 4 x1 = 1,900,000 + 1,800,000 = 3,700,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(29, 'V-0029', 3700000, '2025-10-29 11:00:00', 1, 'TARJETA_CREDITO', 'Admin', 'Computer', 'admin@admin.com', '123456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(34, 1900000, 1, 29, 3),
(35, 1800000, 1, 29, 4);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(29, 'A-0011-00000029', '2025-10-29 11:01:00', 3700000, 'ENTREGADA', 29);

-- Venta 30 (Art 5 x1 = 1,600,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(30, 'V-0030', 1600000, '2025-10-30 12:00:00', 2, 'TARJETA_DEBITO', 'Nitori', 'Kawashiro', 'nitori@kappa.com', '654321');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(36, 1600000, 1, 30, 5);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(30, 'C-0011-00000030', '2025-10-30 12:01:00', 1600000, 'ENTREGADA', 30);


-- =================================================================
-- FASE 6: ACTUALIZAR SECUENCIAS
-- =================================================================

-- Tu archivo original reiniciaba ArticDepos en 2, pero ahora tenemos 30
ALTER SEQUENCE "ArticDepos_id_seq" RESTART WITH 31;

-- Nuevas secuencias
ALTER SEQUENCE "ComprobanteProveedor_id_seq" RESTART WITH 11;
ALTER SEQUENCE "DetalleComprobanteProveedor_id_seq" RESTART WITH 19;
ALTER SEQUENCE "OrdenPago_id_seq" RESTART WITH 11;
ALTER SEQUENCE "ComprobanteOrdenPago_id_seq" RESTART WITH 11;
ALTER SEQUENCE "VentaArticulo_id_seq" RESTART WITH 31;
ALTER SEQUENCE "DetalleVentaArticulo_id_seq" RESTART WITH 37;
ALTER SEQUENCE "FacturaVenta_id_seq" RESTART WITH 31;


COMMIT;

BEGIN;

-- =================================================================
-- FASE 7: AÑADIR 5 VENTAS GRANDES PARA SUPERAR LOS EGRESOS
-- =================================================================

-- Venta 31 (10x Xeon W-3495X = 30,000,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(31, 'V-0031', 30000000, '2025-08-01 10:00:00', 1, 'TARJETA_CREDITO', 'Venta', 'Mayorista 1', 'vm1@empresa.com', '999123');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(37, 3000000, 10, 31, 9);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(31, 'A-0021-00000031', '2025-08-01 10:01:00', 30000000, 'ENTREGADA', 31);

-- Venta 32 (10x RTX 4090 = 25,000,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(32, 'V-0032', 25000000, '2025-08-01 11:00:00', 2, 'TARJETA_CREDITO', 'Venta', 'Mayorista 2', 'vm2@empresa.com', '999456');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(38, 2500000, 10, 32, 1);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(32, 'A-9002-00000032', '2025-08-01 11:01:00', 25000000, 'ENTREGADA', 32);

-- Venta 33 (10x Ryzen 9 7950X = 27,000,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(33, 'V-0033', 27000000, '2025-09-02 12:00:00', 1, 'TARJETA_CREDITO', 'Venta', 'Mayorista 3', 'vm3@empresa.com', '999789');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(39, 2700000, 10, 33, 10);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(33, 'A-0010-00000033', '2025-09-02 12:01:00', 27000000, 'ENTREGADA', 33);

-- Venta 34 (10x Ryzen 9 5900X + 10x Core i9 = 24M + 23M = 47,000,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(34, 'V-0034', 47000000, '2025-09-03 14:00:00', 2, 'TARJETA_CREDITO', 'Venta', 'Mayorista 4', 'vm4@empresa.com', '999159');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(40, 2400000, 10, 34, 18),
(41, 2300000, 10, 34, 2);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(34, 'A-0009-00000034', '2025-09-03 14:01:00', 47000000, 'ENTREGADA', 34);

-- Venta 35 (5x Xeon W-3495X + 5x Ryzen 9 7950X = 15M + 13.5M = 28,500,000)
INSERT INTO "VentaArticulo" (id, numero, total, fecha, id_user, metodo_pago, nombre_contacto, apellido_contacto, correo_contacto, telefono_contacto) VALUES
(35, 'V-0035', 28500000, '2025-10-04 15:00:00', 1, 'TARJETA_CREDITO', 'Venta', 'Mayorista 5', 'vm5@empresa.com', '999753');
INSERT INTO "DetalleVentaArticulo" (id, precio, cantidad, id_venta, id_articulo) VALUES
(42, 3000000, 5, 35, 9),
(43, 2700000, 5, 35, 10);
INSERT INTO "FacturaVenta" (id, numero, fecha_emision, total, estado, id_venta) VALUES
(35, 'B-0012-00000035', '2025-10-04 15:01:00', 28500000, 'ENTREGADA', 35);


-- =================================================================
-- FASE 8: ACTUALIZAR SECUENCIAS
-- =================================================================

ALTER SEQUENCE "VentaArticulo_id_seq" RESTART WITH 36;
ALTER SEQUENCE "DetalleVentaArticulo_id_seq" RESTART WITH 44;
ALTER SEQUENCE "FacturaVenta_id_seq" RESTART WITH 36;

COMMIT;

BEGIN;

-- Comprobante 11 (Pendiente) - Proveedor 1 (Alfa) - Total 1,000,000
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(11, 1, 1, NULL, '2025-10-05', 'A', '0001', '00000011', 1000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(19, 11, 14, 1, 1000000); -- 1x Ryzen 3 4100

-- Comprobante 12 (Pendiente) - Proveedor 1 (Alfa) - Total 1,000,000
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(12, 1, 1, NULL, '2025-10-06', 'A', '0001', '00000012', 1000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(20, 12, 15, 1, 1000000); -- 1x GTX 1050 Ti (precio ajustado para el ejemplo)

-- Comprobante 13 (Pendiente) - Proveedor 1 (Alfa) - Total 1,000,000
INSERT INTO "ComprobanteProveedor" (id, id_proveedor, id_tipo_comprobante, id_orden_compra, fecha, letra, sucursal, numero, total) VALUES
(13, 1, 1, NULL, '2025-10-07', 'A', '0001', '00000013', 1000000);
INSERT INTO "DetalleComprobanteProveedor" (id, id_comprobante, id_articulo, cantidad, precio_unitario) VALUES
(21, 13, 21, 2, 500000); -- 2x Core i3-10100F

-- =================================================================
-- FASE 10: ACTUALIZAR SECUENCIAS
-- =================================================================

ALTER SEQUENCE "ComprobanteProveedor_id_seq" RESTART WITH 14;
ALTER SEQUENCE "DetalleComprobanteProveedor_id_seq" RESTART WITH 22;

COMMIT;