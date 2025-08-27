CREATE DATABASE Millennium;
GO


USE Millennium;
GO



SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO


CREATE TABLE dbo.Tipo_mov (
  id_tipo_mov INT IDENTITY PRIMARY KEY,
  nombre      VARCHAR(20) NOT NULL,   -- 'Ingreso','Egreso','Transferencia', etc.
  signo       SMALLINT    NOT NULL    -- +1 ingreso, -1 egreso, 0 transferencia
);
CREATE UNIQUE INDEX UX_Tipo_mov_nombre ON dbo.Tipo_mov(nombre);

CREATE TABLE dbo.tipo_compr (
  id_tipo_compr INT IDENTITY PRIMARY KEY,
  nombre        VARCHAR(60) NOT NULL,
  observacion   VARCHAR(200) NULL
);


CREATE TABLE dbo.Articulos (
  id_articulo    INT IDENTITY PRIMARY KEY,
  nombre_art     VARCHAR(120) NOT NULL,
  codigo_art     VARCHAR(60)  NOT NULL,
  categoria_art  VARCHAR(60)  NULL,
  marca_art      VARCHAR(60)  NULL,
  u_medida_art   VARCHAR(20)  NULL,
  CONSTRAINT UQ_Articulos_codigo UNIQUE (codigo_art)
);

CREATE TABLE dbo.Depositos (
  id_deposito     INT IDENTITY PRIMARY KEY,
  direccion_depos VARCHAR(200) NOT NULL,
  cap_max         INT NULL
);


CREATE TABLE dbo.ArxDepos (
  id_artxdepos INT IDENTITY PRIMARY KEY,
  id_deposito  INT NOT NULL,
  id_articulo  INT NOT NULL,
  stock        DECIMAL(18,3) NOT NULL CONSTRAINT DF_AD_stock DEFAULT(0),
  stock_min    DECIMAL(18,3) NOT NULL CONSTRAINT DF_AD_stockmin DEFAULT(0),
  CONSTRAINT FK_AD_Dep FOREIGN KEY (id_deposito) REFERENCES dbo.Depositos(id_deposito),
  CONSTRAINT FK_AD_Art FOREIGN KEY (id_articulo)  REFERENCES dbo.Articulos(id_articulo),
  CONSTRAINT CK_AD_NoNeg CHECK (stock >= 0 AND stock_min >= 0)
);
-- No duplicar el mismo (depósito, artículo)
CREATE UNIQUE INDEX UX_AD_Dep_Art ON dbo.ArxDepos(id_deposito, id_articulo);
CREATE INDEX IX_AD_Art ON dbo.ArxDepos(id_articulo);


CREATE TABLE dbo.Mov_stock (
  id_mov_stock    BIGINT IDENTITY PRIMARY KEY,
  id_dep_origen   INT NULL,
  id_dep_destino  INT NULL,
  fecha_mov       DATE    NOT NULL CONSTRAINT DF_Mov_fecha DEFAULT (CAST(SYSDATETIME() AS DATE)),
  hora_mov        TIME(0) NOT NULL CONSTRAINT DF_Mov_hora  DEFAULT (CAST(SYSDATETIME() AS TIME(0))),
  id_tipo_mov     INT NOT NULL,
  nro_comprobante VARCHAR(40) NULL,
  id_tipo_compr   INT NULL,
  CONSTRAINT FK_Mov_Dep_Origen  FOREIGN KEY (id_dep_origen)  REFERENCES dbo.Depositos(id_deposito),
  CONSTRAINT FK_Mov_Dep_Destino FOREIGN KEY (id_dep_destino) REFERENCES dbo.Depositos(id_deposito),
  CONSTRAINT FK_Mov_TipoMov     FOREIGN KEY (id_tipo_mov)    REFERENCES dbo.Tipo_mov(id_tipo_mov),
  CONSTRAINT FK_Mov_TipoCompr   FOREIGN KEY (id_tipo_compr)  REFERENCES dbo.tipo_compr(id_tipo_compr),
  CONSTRAINT CK_Mov_Deps_Distintos CHECK (
    id_dep_origen IS NULL OR id_dep_destino IS NULL OR id_dep_origen <> id_dep_destino
  )
);
CREATE INDEX IX_MovStock_Fechas ON dbo.Mov_stock(fecha_mov, hora_mov);


CREATE TABLE dbo.Detalle_mov (
  id_detalle_mov BIGINT IDENTITY PRIMARY KEY,
  id_mov_stock   BIGINT NOT NULL,
  id_artxdepos   INT    NOT NULL,          -- (depósito, artículo) afectado
  cantidad       DECIMAL(18,3) NOT NULL,
  CONSTRAINT FK_Det_Mov FOREIGN KEY (id_mov_stock) REFERENCES dbo.Mov_stock(id_mov_stock),
  CONSTRAINT FK_Det_AD  FOREIGN KEY (id_artxdepos) REFERENCES dbo.ArxDepos(id_artxdepos),
  CONSTRAINT CK_Det_CantPositiva CHECK (cantidad > 0)
);
CREATE INDEX IX_Detalle_mov_Mov ON dbo.Detalle_mov(id_mov_stock);
GO



INSERT INTO dbo.Tipo_mov(nombre, signo) VALUES
('Ingreso', +1), ('Egreso', -1), ('Transferencia', 0);
GO
