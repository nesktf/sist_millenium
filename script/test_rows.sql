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

INSERT INTO "TipoComprobanteProveedor" (id, nombre, descripcion) VALUES
  (1, 'test', 'a funny test');

-- Reset ids
ALTER SEQUENCE "Deposito_id_seq" RESTART WITH 7;
ALTER SEQUENCE "Articulo_id_seq" RESTART WITH 31;
ALTER SEQUENCE "CategoriaArticulo_id_seq" RESTART WITH 21;
ALTER SEQUENCE "MarcaArticulo_id_seq" RESTART WITH 7;
ALTER SEQUENCE "ArticDepos_id_seq" RESTART WITH 2;
ALTER SEQUENCE "MovimientoStock_id_seq" RESTART WITH 2;
ALTER SEQUENCE "DetalleMovimiento_id_seq" RESTART WITH 3;
ALTER SEQUENCE "Proveedor_id_seq" RESTART WITH 11;
ALTER SEQUENCE "TipoComprobanteProveedor_id_seq" RESTART WITH 2;

COMMIT;

-- 6) Chequeo
SELECT ad.id, a.codigo, d.direccion, ad.stock, ad.stock_min
FROM "ArticDepos" ad
JOIN "Articulo" a ON a.id = ad.id_articulo
JOIN "Deposito" d ON d.id = ad.id_deposito
ORDER BY a.codigo, d.direccion;

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
