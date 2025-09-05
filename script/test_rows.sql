BEGIN;

-- 1) Depósito base (idempotente, sin UNIQUE en direccion usamos NOT EXISTS)
INSERT INTO "Deposito" ("direccion","cap_max")
SELECT 'Depósito Principal', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM "Deposito" WHERE "direccion" = 'Depósito Principal'
);

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
INSERT INTO "Articulo" ("id", "codigo","nombre", "id_marca", "id_categoria")
VALUES
  (1, 'rtx4153', 'GPU RTX 4090 Supreme Titan Master Flandre Edition', 3, 3),
  (2, 'abc1234', 'CPU Core i9-13900K Ultra Pro Max Turbo Marisa Edition', 1, 1),
  (3, 'defg4124', 'CPU Ryzen 7 7800X3D Gamer Plus Sakuya Edition', 2, 2),
  (4, 'asda4125', 'GPU Radeon RX 7900 XTX Liquid Cool Reimu Edition', 4, 4),
  (5, 'uiop9876', 'CPU Core i7-12700F Eco-Friendly Remilia Edition', 5, 5),
  (6, 'hjk54321', 'CPU Ryzen 5 5600G Budget Beast Cirno Edition', 6, 6),
  (7, 'zxv8765', 'GPU GTX 1660 Ti Legacy Reborn Koishi Edition', 7, 7),
  (8, 'qwer1234', 'GPU Radeon RX 6600 XT The Lightweight Sanae Edition', 8, 8),
  (9, 'mnbvc56', 'CPU Xeon W-3495X Server Super Youmu Edition', 9, 9),
  (10, 'lkjhg98', 'CPU Ryzen 9 7950X Threadripper Saurus Yuyuko Edition', 10, 10),
  (11, 'poiu876', 'GPU RTX 3080 Ti Super Deluxe Alice Edition', 11, 11),
  (12, 'ytr145', 'GPU Radeon RX 6900 XT The Infinity Patchouli Edition', 12, 12),
  (13, 'rewq234', 'CPU Core i5-11600K Overclockinator Yukari Edition', 13, 13),
  (14, 'asdfg345', 'CPU Ryzen 3 4100 Essential Pro Ran Edition', 14, 14),
  (15, 'zxcvb567', 'GPU GTX 1050 Ti The Mini Hero Chen Edition', 15, 15),
  (16, 'oiuyt789', 'GPU Radeon RX 570 Phantom Ghost Aya Edition', 16, 16),
  (17, 'plokm123', 'CPU Pentium G7400 Retro Pro Reisen Edition', 17, 17),
  (18, 'trewq543', 'CPU Ryzen 9 5900X Master Builder Utsuho Edition', 18, 18),
  (19, 'qazwsxedc21', 'GPU RTX 2060 Super Turbo Force Suwako Edition', 19, 19),
  (20, 'rfvtgbyhnuj765', 'GPU Radeon RX 5500 XT The Starter Momiji Edition', 20, 20),
  (21, 'yhnj12345', 'CPU Core i3-10100F The Budget King Hina Edition', 1, 21),
  (22, 'edc5678', 'CPU Ryzen 7 5700G Office Ninja Nitori Edition', 2, 22),
  (23, 'rfvbnm098', 'GPU RTX 3060 Ti Gaming Ace Mokou Edition', 3, 23),
  (24, 'tgb2468', 'GPU Radeon RX 6700 XT Extreme Keine Edition', 4, 24),
  (25, 'ujmnh421', 'CPU Core i9-10900K King of Speed Komachi Edition', 5, 25),
  (26, 'ikol369', 'CPU Ryzen 5 3600 Gaming Classic Eiki Edition', 6, 26),
  (27, 'wsx258', 'GPU GTX 1650 Super Compact Miko Edition', 7, 27),
  (28, 'rfv753', 'GPU Radeon RX 580 The Beast Unleashed Byakuren Edition', 8, 28),
  (29, 'tgb951', 'CPU Core i7-9700K Old But Gold Shou Edition', 9, 29),
  (30, 'yhn486', 'CPU Ryzen 7 2700X Legacy Champion Mamizou Edition', 10, 30)
ON CONFLICT ("codigo") DO NOTHING;

-- 5) Stock para abc123 en Depósito Principal (idempotente)
INSERT INTO "ArticDepos" ("id_deposito", "id_articulo", "stock", "stock_min")
SELECT d.id, a.id, 12, 3
FROM "Deposito" d
JOIN "Articulo" a ON a.codigo = 'abc123'
WHERE d."direccion" = 'Depósito Principal'
  AND NOT EXISTS (
    SELECT 1 FROM "ArticDepos" ad 
    WHERE ad."id_deposito" = d.id AND ad."id_articulo" = a.id
  );

COMMIT;

-- 6) Chequeo
SELECT ad.id, a.codigo, d.direccion, ad.stock, ad.stock_min
FROM "ArticDepos" ad
JOIN "Articulo" a ON a.id = ad.id_articulo
JOIN "Deposito" d ON d.id = ad.id_deposito
ORDER BY a.codigo, d.direccion;
