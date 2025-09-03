BEGIN;

-- 1) Depósito base (idempotente, sin UNIQUE en direccion usamos NOT EXISTS)
INSERT INTO "Deposito" ("direccion","cap_max")
SELECT 'Depósito Principal', NULL
WHERE NOT EXISTS (
  SELECT 1 FROM "Deposito" WHERE "direccion" = 'Depósito Principal'
);

-- 2) Artículos (idempotente, acá SÍ hay UNIQUE en codigo)
INSERT INTO "Articulo" ("codigo","nombre")
VALUES 
  ('abc123','GTX 2080TI'),
  ('abc456','GTX 3080TI'),
  ('abc789','GTX 4080TI')
ON CONFLICT ("codigo") DO NOTHING;

-- 3) Stock para abc123 en Depósito Principal (idempotente)
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

-- 4) Chequeo
SELECT ad.id, a.codigo, d.direccion, ad.stock, ad.stock_min
FROM "ArticDepos" ad
JOIN "Articulo" a ON a.id = ad.id_articulo
JOIN "Deposito" d ON d.id = ad.id_deposito
ORDER BY a.codigo, d.direccion;
