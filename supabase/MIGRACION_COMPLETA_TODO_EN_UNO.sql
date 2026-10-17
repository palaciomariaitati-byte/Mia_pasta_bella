-- ==============================================================================\n-- MIA PASTA BELLA - MIGRACION MAESTRA INTEGRAL (TODO EN UNO)\n-- Ejecuta este unico script en el SQL Editor de Supabase.\n-- ==============================================================================\n\n\n-- >>> ARCHIVO: ./supabase/migrations/20261002000000_init_schema.sql <<<\n\n-- ==============================================================================
-- MÍA PASTAS BELLA - ESQUEMA INICIAL DE BASE DE DATOS (POSTGRESQL / SUPABASE)
-- ==============================================================================

-- 1. EXTENSIONES Y CONFIGURACIÓN INICIAL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum para roles de usuario
CREATE TYPE user_role AS ENUM ('admin', 'staff', 'cliente');

-- Enum para estados de venta/pedido
CREATE TYPE estado_venta AS ENUM ('pendiente', 'confirmada', 'en_preparacion', 'entregada', 'cancelada');

-- Enum para métodos de pago
CREATE TYPE metodo_pago AS ENUM ('efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'mercado_pago');

-- Enum para tipo de cuenta contable
CREATE TYPE tipo_cuenta_contable AS ENUM ('activo', 'pasivo', 'patrimonio', 'ingreso', 'egreso');

-- Función auxiliar para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ==============================================================================
-- 2. TABLA: CONFIGURACION_SITIO (Single-row o Clave-Valor estructurada)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS configuracion_sitio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_tienda VARCHAR(100) NOT NULL DEFAULT 'Mía Pastas Bella',
    slogan VARCHAR(255) DEFAULT 'Pastas artesanales de autor con tradición y pasión',
    facebook_url VARCHAR(255) DEFAULT 'https://facebook.com',
    instagram_url VARCHAR(255) DEFAULT 'https://instagram.com',
    whatsapp_numero VARCHAR(30) DEFAULT '+5491100000000',
    whatsapp_mensaje_predeterminado TEXT DEFAULT '¡Hola! Quiero hacer un pedido en Mía Pastas Bella.',
    direccion_local VARCHAR(255) DEFAULT 'Av. Principal 1234',
    horarios_atencion VARCHAR(255) DEFAULT 'Martes a Domingos: 10:00 a 21:00 hs',
    email_contacto VARCHAR(150) DEFAULT 'contacto@miapastabella.com',
    actualizado_por UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tr_configuracion_sitio_updated_at
BEFORE UPDATE ON configuracion_sitio
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 3. TABLA: PERFILES (Gestión de Roles RBAC sincronizado con Supabase Auth)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol user_role NOT NULL DEFAULT 'cliente',
    telefono VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tr_perfiles_updated_at
BEFORE UPDATE ON perfiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 4. TABLA: CATEGORIAS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS categorias (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    imagen_url TEXT,
    orden INT NOT NULL DEFAULT 0,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tr_categorias_updated_at
BEFORE UPDATE ON categorias
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 5. TABLA: PRODUCTOS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    descripcion TEXT,
    precio DECIMAL(12, 2) NOT NULL CHECK (precio >= 0),
    precio_oferta DECIMAL(12, 2) CHECK (precio_oferta >= 0 AND (precio_oferta IS NULL OR precio_oferta < precio)),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    unidad_medida VARCHAR(20) NOT NULL DEFAULT 'unidad', -- 'unidad', 'caja', 'kg', 'porción'
    imagen_url TEXT,
    galeria_urls TEXT[] DEFAULT '{}',
    es_destacado BOOLEAN NOT NULL DEFAULT false,
    activo BOOLEAN NOT NULL DEFAULT true,
    tiempo_coccion_minutos INT,
    rinde_porciones INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_productos_categoria ON productos(categoria_id);
CREATE INDEX idx_productos_destacado ON productos(es_destacado) WHERE activo = true;

CREATE TRIGGER tr_productos_updated_at
BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 6. TABLA: CLIENTES (CRM Básico)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES perfiles(id) ON DELETE SET NULL, -- Opcional: si tiene cuenta registrada
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    telefono VARCHAR(50) NOT NULL,
    direccion TEXT,
    ciudad VARCHAR(100) DEFAULT 'Local',
    notas_preferencias TEXT, -- Ej: "Prefiere masa al huevo", "Alérgico a nueces"
    total_compras DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    cantidad_pedidos INT NOT NULL DEFAULT 0,
    ultimo_pedido_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_clientes_telefono ON clientes(telefono);
CREATE INDEX idx_clientes_email ON clientes(email);

CREATE TRIGGER tr_clientes_updated_at
BEFORE UPDATE ON clientes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 7. TABLA: PROVEEDORES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social VARCHAR(150) NOT NULL,
    nombre_contacto VARCHAR(100),
    cuit_rut VARCHAR(50) UNIQUE,
    telefono VARCHAR(50),
    email VARCHAR(150),
    direccion TEXT,
    rubro VARCHAR(100) NOT NULL, -- Harinas, Huevos, Lácteos, Packaging, etc.
    dias_entrega VARCHAR(100),
    condiciones_pago VARCHAR(100), -- Contado, 15 días, 30 días
    notas TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER tr_proveedores_updated_at
BEFORE UPDATE ON proveedores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 8. TABLA: VENTAS (Pedidos y Facturación de Salida)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS ventas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_comprobante VARCHAR(50) NOT NULL UNIQUE,
    cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
    estado estado_venta NOT NULL DEFAULT 'pendiente',
    metodo_pago metodo_pago NOT NULL DEFAULT 'efectivo',
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
    descuento DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (descuento >= 0),
    costo_envio DECIMAL(12, 2) NOT NULL DEFAULT 0.00 CHECK (costo_envio >= 0),
    total DECIMAL(12, 2) NOT NULL CHECK (total >= 0),
    notas_entrega TEXT,
    direccion_envio TEXT,
    pagado BOOLEAN NOT NULL DEFAULT false,
    fecha_venta TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX idx_ventas_cliente ON ventas(cliente_id);
CREATE INDEX idx_ventas_estado ON ventas(estado);

CREATE TRIGGER tr_ventas_updated_at
BEFORE UPDATE ON ventas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ==============================================================================
-- 9. TABLA: ITEMS_VENTA (Detalle de cada venta)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS items_venta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_items_venta_venta ON items_venta(venta_id);

-- ==============================================================================
-- 10. MÓDULO CONTABLE: PLAN DE CUENTAS, ASIENTOS Y LÍNEAS (Partida Doble)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS cuentas_contables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) NOT NULL UNIQUE, -- Ej: 1.1.01 (Caja), 4.1.01 (Venta de Pastas)
    nombre VARCHAR(100) NOT NULL,
    tipo tipo_cuenta_contable NOT NULL,
    descripcion TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS asientos_contables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    numero_asiento SERIAL UNIQUE,
    fecha DATE NOT NULL DEFAULT CURRENT_DATE,
    glosa_concepto TEXT NOT NULL, -- Explicación del movimiento
    venta_id UUID REFERENCES ventas(id) ON DELETE SET NULL, -- Referencia si se generó por venta
    es_automatico BOOLEAN NOT NULL DEFAULT false,
    creado_por UUID REFERENCES perfiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_asientos_fecha ON asientos_contables(fecha);

CREATE TABLE IF NOT EXISTS lineas_asiento_contable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asiento_id UUID NOT NULL REFERENCES asientos_contables(id) ON DELETE CASCADE,
    cuenta_id UUID NOT NULL REFERENCES cuentas_contables(id) ON DELETE RESTRICT,
    debe DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (debe >= 0),
    haber DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (haber >= 0),
    descripcion VARCHAR(255),
    CONSTRAINT chk_debe_o_haber CHECK (debe > 0 OR haber > 0)
);

CREATE INDEX idx_lineas_asiento ON lineas_asiento_contable(asiento_id);

-- ==============================================================================
-- 11. TRIGGER AUTOMÁTICO: GENERACIÓN DE ASIENTO CONTABLE AL CONFIRMAR VENTA
-- ==============================================================================
CREATE OR REPLACE FUNCTION fn_generar_asiento_venta()
RETURNS TRIGGER AS $$
DECLARE
    v_asiento_id UUID;
    v_cuenta_caja_id UUID;
    v_cuenta_ventas_id UUID;
BEGIN
    -- Se dispara cuando la venta pasa a pagada o confirmada
    IF (NEW.pagado = true AND (OLD.pagado = false OR OLD.pagado IS NULL)) THEN
        -- Obtener cuentas estándar (Caja o Banco / Ventas)
        SELECT id INTO v_cuenta_caja_id FROM cuentas_contables WHERE codigo = '1.1.01' LIMIT 1;
        SELECT id INTO v_cuenta_ventas_id FROM cuentas_contables WHERE codigo = '4.1.01' LIMIT 1;

        IF v_cuenta_caja_id IS NOT NULL AND v_cuenta_ventas_id IS NOT NULL THEN
            -- Crear Cabecera del Asiento
            INSERT INTO asientos_contables (fecha, glosa_concepto, venta_id, es_automatico)
            VALUES (
                CURRENT_DATE,
                'Venta N° ' || NEW.numero_comprobante || ' - Método: ' || NEW.metodo_pago::text,
                NEW.id,
                true
            ) RETURNING id INTO v_asiento_id;

            -- Registrar DEBE (Ingreso de dinero en Caja/Activo)
            INSERT INTO lineas_asiento_contable (asiento_id, cuenta_id, debe, haber, descripcion)
            VALUES (v_asiento_id, v_cuenta_caja_id, NEW.total, 0.00, 'Cobro venta N° ' || NEW.numero_comprobante);

            -- Registrar HABER (Venta de Pastas / Ingreso)
            INSERT INTO lineas_asiento_contable (asiento_id, cuenta_id, debe, haber, descripcion)
            VALUES (v_asiento_id, v_cuenta_ventas_id, 0.00, NEW.total, 'Ingreso venta N° ' || NEW.numero_comprobante);
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tr_ventas_generar_asiento
AFTER UPDATE OR INSERT ON ventas
FOR EACH ROW EXECUTE FUNCTION fn_generar_asiento_venta();

-- ==============================================================================
-- 12. DATOS SEMILLA (SEED DATA)
-- ==============================================================================

-- Configuración inicial del sitio (1 único registro inicial editable)
INSERT INTO configuracion_sitio (
    nombre_tienda,
    slogan,
    facebook_url,
    instagram_url,
    whatsapp_numero,
    whatsapp_mensaje_predeterminado,
    direccion_local,
    horarios_atencion,
    email_contacto
) VALUES (
    'Mía Pastas Bella',
    'Pastas artesanales de autor con tradición y pasión',
    'https://facebook.com/miapastabella',
    'https://instagram.com/miapastabella',
    '+5491155551234',
    '¡Hola Mía Pastas Bella! Me gustaría encargar pastas para el fin de semana.',
    'Calle de los Artesanos 450, Buenos Aires',
    'Martes a Domingos de 10:00 a 20:30 hs',
    'contacto@miapastabella.com'
) ON CONFLICT DO NOTHING;

-- Categorías oficiales requeridas
INSERT INTO categorias (nombre, slug, descripcion, orden) VALUES
('Tallarines', 'tallarines', 'Tallarines frescos al huevo cortados a mano y cintas artesanales', 1),
('Sorrentinos', 'sorrentinos', 'Sorrentinos rellenos con combinaciones gourmet irresistibles', 2),
('Ravioles', 'ravioles', 'Clásicos ravioles caseros con las recetas de la nonna', 3),
('Ñoquis', 'noquis', 'Tradicionales ñoquis de papa, calabaza y espinaca livianos y esponjosos', 4),
('Tortellinis', 'tortellinis', 'Exquisitos tortellinis con rellenos intensos y equilibrados', 5),
('Salsas', 'salsas', 'Salsas caseras cocidas a fuego lento listas para acompañar', 6)
ON CONFLICT (slug) DO NOTHING;

-- Plan contable básico inicial
INSERT INTO cuentas_contables (codigo, nombre, tipo, descripcion) VALUES
('1.1.01', 'Caja y Efectivo', 'activo', 'Fondos en caja física'),
('1.1.02', 'Bancos / Mercado Pago', 'activo', 'Fondos digitales y bancarios'),
('1.1.05', 'Inventario de Materias Primas', 'activo', 'Stock de harinas, quesos, verduras, etc.'),
('2.1.01', 'Proveedores por Pagar', 'pasivo', 'Deudas comerciales con proveedores'),
('4.1.01', 'Ventas de Pastas y Salsas', 'ingreso', 'Ingresos por venta de productos elaborados'),
('5.1.01', 'Costo de Mercaderías Vendidas', 'egreso', 'Costo de elaboración e insumos'),
('5.2.01', 'Gastos Operativos y Servicios', 'egreso', 'Electricidad, gas, packaging, etc.')
ON CONFLICT (codigo) DO NOTHING;
\n\n-- >>> ARCHIVO: ./supabase/migrations/20261002010000_rls_and_cloud_sync.sql <<<\n\n-- ==============================================================================
-- MIA PASTA BELLA - MIGRACIÓN DE POLÍTICAS DE SEGURIDAD RLS Y SINCRONIZACIÓN CLOUD
-- ==============================================================================

-- 1. HABILITAR ROW LEVEL SECURITY (RLS) EN TODAS LAS TABLAS
ALTER TABLE configuracion_sitio ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineas_asiento_contable ENABLE ROW LEVEL SECURITY;

-- 2. POLÍTICAS PARA CONFIGURACION_SITIO
-- Lectura pública para la landing page (tienda pública)
DROP POLICY IF EXISTS "Permitir lectura publica de configuracion" ON configuracion_sitio;
CREATE POLICY "Permitir lectura publica de configuracion"
ON configuracion_sitio FOR SELECT
TO anon, authenticated
USING (true);

-- Modificación exclusiva para usuarios autenticados / admin / service_role
DROP POLICY IF EXISTS "Permitir modificacion de configuracion a autenticados" ON configuracion_sitio;
CREATE POLICY "Permitir modificacion de configuracion a autenticados"
ON configuracion_sitio FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 3. POLÍTICAS PARA CATEGORIAS
DROP POLICY IF EXISTS "Permitir lectura publica de categorias activas" ON categorias;
CREATE POLICY "Permitir lectura publica de categorias activas"
ON categorias FOR SELECT
TO anon, authenticated
USING (activo = true);

DROP POLICY IF EXISTS "Gestion total de categorias para administradores" ON categorias;
CREATE POLICY "Gestion total de categorias para administradores"
ON categorias FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 4. POLÍTICAS PARA PRODUCTOS
DROP POLICY IF EXISTS "Permitir lectura publica de productos activos" ON productos;
CREATE POLICY "Permitir lectura publica de productos activos"
ON productos FOR SELECT
TO anon, authenticated
USING (activo = true);

DROP POLICY IF EXISTS "Gestion total de productos para administradores" ON productos;
CREATE POLICY "Gestion total de productos para administradores"
ON productos FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 5. POLÍTICAS PARA VENTAS E ITEMS_VENTA
-- Los clientes anónimos y registrados pueden crear pedidos / carritos
DROP POLICY IF EXISTS "Permitir insercion de pedidos publicos" ON ventas;
CREATE POLICY "Permitir insercion de pedidos publicos"
ON ventas FOR INSERT
TO anon, authenticated
WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir insercion de items de venta publicos" ON items_venta;
CREATE POLICY "Permitir insercion de items de venta publicos"
ON items_venta FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Lectura y gestión de ventas para administradores y staff
DROP POLICY IF EXISTS "Gestion de ventas para autenticados" ON ventas;
CREATE POLICY "Gestion de ventas para autenticados"
ON ventas FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Gestion de items de venta para autenticados" ON items_venta;
CREATE POLICY "Gestion de items de venta para autenticados"
ON items_venta FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 6. POLÍTICAS PARA CONTABILIDAD Y PERFILES
DROP POLICY IF EXISTS "Acceso a cuentas contables para autenticados" ON cuentas_contables;
CREATE POLICY "Acceso a cuentas contables para autenticados"
ON cuentas_contables FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso a asientos contables para autenticados" ON asientos_contables;
CREATE POLICY "Acceso a asientos contables para autenticados"
ON asientos_contables FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso a lineas de asientos para autenticados" ON lineas_asiento_contable;
CREATE POLICY "Acceso a lineas de asientos para autenticados"
ON lineas_asiento_contable FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

DROP POLICY IF EXISTS "Acceso a perfiles para autenticados" ON perfiles;
CREATE POLICY "Acceso a perfiles para autenticados"
ON perfiles FOR ALL
TO authenticated
USING (true)
WITH CHECK (true);

-- 7. ACTUALIZACIÓN DE CATEGORÍAS COMPLETAS DE FABRICA
INSERT INTO categorias (id, nombre, slug, descripcion, orden, activo) VALUES
('a0000000-0000-0000-0000-000000000001', 'Tallarines y Fideos Saborizados', 'tallarines', 'Cintas frescas al huevo y línea exclusiva de fideos saborizados con vegetales naturales y especias nobles.', 1, true),
('a0000000-0000-0000-0000-000000000002', 'Sorrentinos', 'sorrentinos', 'Medallones grandes en cajas de 12 unidades, frescos al día o ultracongelados con rellenos abundantes.', 2, true),
('a0000000-0000-0000-0000-000000000003', 'Ravioles en Plancha', 'ravioles', 'Clásicas planchas dobles de ravioles artesanales para cortar en olla hirviendo. Rellenos tradicionales.', 3, true),
('a0000000-0000-0000-0000-000000000004', 'Ñoquis Frescos', 'noquis', 'Porciones de 500g y 1kg de ñoquis livianos elaborados cada madrugada con papa seleccionada y sémola.', 4, true),
('a0000000-0000-0000-0000-000000000005', 'Tortellinis', 'tortellinis', 'Nudos tradicionales doblados a mano, ideales para sopas o salsas emulsionadas. Frescos o freezados.', 5, true),
('a0000000-0000-0000-0000-000000000006', 'Pre-Pizzas a la Piedra', 'prepizzas', 'Discos crudos leudados durante 48 hs con masa madre viva, con salsa casera cocida a fuego lento.', 6, true),
('a0000000-0000-0000-0000-000000000007', 'Empanadas Artesanales', 'empanadas', 'Docenas de empanadas crudas o precocidas en cajas térmicas, listas para hornear o freír en casa.', 7, true),
('a0000000-0000-0000-0000-000000000008', 'Tartas en Molde', 'tartas', 'Tartas crudas de masa hojaldrada o quebrada artesanal en molde descartable para cocción directa.', 8, true)
ON CONFLICT (slug) DO UPDATE SET
  nombre = EXCLUDED.nombre,
  descripcion = EXCLUDED.descripcion,
  orden = EXCLUDED.orden;

-- 8. ACTUALIZACIÓN DE CONFIGURACIÓN CON EL NOMBRE EXACTO: MIA PASTA BELLA
UPDATE configuracion_sitio
SET
  nombre_tienda = 'Mia Pasta Bella',
  slogan = 'Fábrica Artesanal de Pastas Frescas, Congelados & Pre-Pizzas',
  facebook_url = 'https://facebook.com/miapastabella',
  instagram_url = 'https://instagram.com/miapastabella',
  whatsapp_numero = '+5491155551234',
  whatsapp_mensaje_predeterminado = '¡Hola Mia Pasta Bella! Me gustaría encargar pastas frescas, pre-pizzas, empanadas o tartas.',
  direccion_local = 'Av. de los Sabores 450, Buenos Aires',
  horarios_atencion = 'Martes a Domingos: 10:00 a 20:30 hs'
WHERE id IS NOT NULL;
\n\n-- >>> ARCHIVO: ./supabase/migrations/20261013000000_seed_productos.sql <<<\n\n-- ==============================================================================
-- MIA PASTA BELLA - SEED DE PRODUCTOS COMPLETO
-- Migra todos los productos del store.json a Supabase
-- Ejecutar DESPUÉS de 20261002010000_rls_and_cloud_sync.sql
-- ==============================================================================

-- Las categorías ya tienen UUIDs fijos desde la migración anterior:
-- a0000000-0000-0000-0000-000000000001 → tallarines
-- a0000000-0000-0000-0000-000000000002 → sorrentinos
-- a0000000-0000-0000-0000-000000000003 → ravioles
-- a0000000-0000-0000-0000-000000000004 → noquis
-- a0000000-0000-0000-0000-000000000005 → tortellinis
-- a0000000-0000-0000-0000-000000000006 → prepizzas
-- a0000000-0000-0000-0000-000000000007 → empanadas
-- a0000000-0000-0000-0000-000000000008 → tartas

INSERT INTO productos (
  id, categoria_id, nombre, slug, descripcion, precio, stock,
  unidad_medida, imagen_url, tiempo_coccion_minutos, rinde_porciones,
  es_destacado, activo
) VALUES

-- ===== TALLARINES =====
(
  'b0000000-0000-0000-0000-000000000101',
  'a0000000-0000-0000-0000-000000000001',
  'Fettuccine Frescos al Huevo de Campo',
  'fettuccine-frescos-huevo-campo',
  '100% sémola de trigo candeal seleccionada y 4 huevos de granja frescos por kilo. Textura porosa en crudo, aptos para freezer directo sin descongelar.',
  5200, 45, 'porción (500g)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  4, 3, true, true
),
(
  'b0000000-0000-0000-0000-000000000102',
  'a0000000-0000-0000-0000-000000000001',
  'Tagliatelle Saborizados con Espinaca Fresca Molida',
  'tagliatelle-espinaca-fresca',
  'Masa verde intensa lograda únicamente con hojas de espinaca recién cosechadas blanqueadas y trituradas en la masa, sin colorantes artificiales.',
  5800, 35, 'porción (500g)',
  'https://images.unsplash.com/photo-1621996346565-e3d5d6281781?auto=format&fit=crop&w=800&q=80',
  4, 3, false, false
),
(
  'b0000000-0000-0000-0000-000000000103',
  'a0000000-0000-0000-0000-000000000001',
  'Cintas al Pimiento Morrón Asado al Fuego',
  'cintas-pimiento-morron-asado',
  'Elaboradas con reducción concentrada de morrones rojos asados a la leña, pimentón dulce de Cachi y sémola candeal. Tono rojizo natural con perfume ahumado.',
  5900, 30, 'porción (500g)',
  'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
  4, 3, false, true
),
(
  'b0000000-0000-0000-0000-000000000104',
  'a0000000-0000-0000-0000-000000000001',
  'Fettuccine al Nero di Seppia (Tinta de Calamar)',
  'fettuccine-nero-di-seppia',
  'Masa negra azabache amasada con tinta pura de calamar importada. Sabor mineral marino delicado ideal para salsas de mariscos.',
  6900, 25, 'porción (500g)',
  'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=800&q=80',
  4, 3, true, true
),
(
  'b0000000-0000-0000-0000-000000000105',
  'a0000000-0000-0000-0000-000000000001',
  'Pappardelle Anchas al Huevo y Albahaca Fresca',
  'pappardelle-albahaca-fresca',
  'Cintas anchas de 2 cm cortadas al bronce. Puré de hojas de albahaca genovesa fresca en la masa que libera aroma vibrante al cocinar.',
  5900, 28, 'porción (500g)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  5, 3, false, true
),

-- ===== SORRENTINOS =====
(
  'b0000000-0000-0000-0000-000000000201',
  'a0000000-0000-0000-0000-000000000002',
  'Sorrentinos de Jamón Cocido Natural y Mozzarella',
  'sorrentinos-jamon-mozzarella',
  'Masa clásica fina al huevo. Relleno abundante de jamón cocido seleccionado feteado fino, mozzarella hilada y toque de pimienta blanca.',
  7400, 50, 'caja (12 unid.)',
  'https://images.unsplash.com/photo-1621996346565-e3d5d6281781?auto=format&fit=crop&w=800&q=80',
  6, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000202',
  'a0000000-0000-0000-0000-000000000002',
  'Sorrentinos de Salmón Rosado Fresco y Eneldo',
  'sorrentinos-salmon-eneldo',
  'Masa de sémola candeal al huevo. Trozos de salmón rosado fresco salteado con puerros, manteca artesanal y eneldo aromático.',
  9900, 35, 'caja (12 unid.)',
  'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=800&q=80',
  6, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000203',
  'a0000000-0000-0000-0000-000000000002',
  'Sorrentinos de Calabaza Asada, Mozzarella y Amarettis',
  'sorrentinos-calabaza-mozzarella-amarettis',
  'Calabaza cabutiá caramelizada al horno de barro con nuez moscada, mozzarella fundente y crocante de galletas amarettis italianas.',
  7800, 40, 'caja (12 unid.)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  6, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000204',
  'a0000000-0000-0000-0000-000000000002',
  'Sorrentinos de Hongos Portobello, Ricota y Parmesano',
  'sorrentinos-portobello-ricota-parmesano',
  'Portobellos frescos salteados al ajo suave, ricota de tambo bien drenada y queso parmesano curado 12 meses.',
  8900, 30, 'caja (12 unid.)',
  'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
  6, 2, false, true
),
(
  'b0000000-0000-0000-0000-000000000205',
  'a0000000-0000-0000-0000-000000000002',
  'Sorrentinos Cuatro Quesos con Nuez Tostada',
  'sorrentinos-cuatro-quesos-nuez',
  'Mezcla de queso azul patagónico, fontina, provolone picante y mozzarella suave con corazón de nuez tostada.',
  8500, 38, 'caja (12 unid.)',
  'https://images.unsplash.com/photo-1621996346565-e3d5d6281781?auto=format&fit=crop&w=800&q=80',
  6, 2, false, true
),

-- ===== RAVIOLES =====
(
  'b0000000-0000-0000-0000-000000000301',
  'a0000000-0000-0000-0000-000000000003',
  'Ravioles de Ricota Casera, Espinaca y Nuez',
  'ravioles-ricota-espinaca-nuez',
  'Presentación tradicional en planchas dobles (48 unidades). Ricota fresca de campo, hojas de espinaca tierna y nueces molidas.',
  7100, 60, 'caja (2 planchas)',
  'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=800&q=80',
  5, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000302',
  'a0000000-0000-0000-0000-000000000003',
  'Ravioles de Ternera Braseada al Malbec',
  'ravioles-ternera-braseada-malbec',
  'Carne vacuna magra cocida a fuego lento 5 horas con vegetales aromáticos, vino tinto Malbec y especias de la huerta.',
  7900, 45, 'caja (2 planchas)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  5, 2, false, true
),
(
  'b0000000-0000-0000-0000-000000000303',
  'a0000000-0000-0000-0000-000000000003',
  'Ravioles de Pavita con Puerros y Parmesano',
  'ravioles-pavita-puerros-parmesano',
  'Pechuga de pavita asada desmenuzada, salteado de puerros tiernos en manteca y ralladura de queso sardo estacionado.',
  7600, 35, 'caja (2 planchas)',
  'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
  5, 2, false, true
),
(
  'b0000000-0000-0000-0000-000000000304',
  'a0000000-0000-0000-0000-000000000003',
  'Ravioles de Pollo de Campo, Acelga y Queso',
  'ravioles-pollo-acelga-queso',
  'Relleno casero como el de la nonna: carne de pollo cocida a la olla, acelga fresca picada y queso reggianito rallado.',
  6900, 50, 'caja (2 planchas)',
  'https://images.unsplash.com/photo-1587740908075-9e245070dfaa?auto=format&fit=crop&w=800&q=80',
  5, 2, false, true
),

-- ===== ÑOQUIS =====
(
  'b0000000-0000-0000-0000-000000000401',
  'a0000000-0000-0000-0000-000000000004',
  'Ñoquis Clásicos de Papa Soufflé al Huevo',
  'noquis-clasicos-papa-souffle',
  'Papa hervida al vapor sin exceso de humedad, harina 0000 y huevo fresco. Livianos como nubes, no se desarman al hervir.',
  5200, 65, 'porción (500g)',
  'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
  3, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000402',
  'a0000000-0000-0000-0000-000000000004',
  'Ñoquis de Espinaca y Ricota de Tambo',
  'noquis-espinaca-ricota-tambo',
  'Masa verde elaborada con puré de espinaca fresca y ricota bien escurrida con toque de queso provolone rallado fino.',
  5600, 40, 'porción (500g)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  3, 2, false, true
),
(
  'b0000000-0000-0000-0000-000000000403',
  'a0000000-0000-0000-0000-000000000004',
  'Ñoquis Rellenos de Mozzarella y Jamón',
  'noquis-rellenos-mozzarella-jamon',
  'Esferas de papa soufflé rellenas a mano con un cubito de mozzarella y jamón cocido que funde en boca.',
  7600, 35, 'porción (500g)',
  'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
  4, 2, true, true
),

-- ===== TORTELLINIS =====
(
  'b0000000-0000-0000-0000-000000000501',
  'a0000000-0000-0000-0000-000000000005',
  'Tortellinis de Jamón Crudo y Parmesano Reggiano',
  'tortellinis-jamon-crudo-parmesano',
  'Masa finísima al huevo replegada en forma de ombligo de Venus con jamón crudo estacionado 12 meses y queso parmesano.',
  8900, 30, 'caja (500g)',
  'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=800&q=80',
  4, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000502',
  'a0000000-0000-0000-0000-000000000005',
  'Capellettis de Carne Braseada y Verdura',
  'capellettis-carne-braseada-verdura',
  'Clásico formato sombrerito boloñés relleno de carne braseada tierna, miga de pan mojada en leche y espinaca cocida.',
  7900, 32, 'caja (500g)',
  'https://images.unsplash.com/photo-1595295333158-4742f28fbd85?auto=format&fit=crop&w=800&q=80',
  4, 2, false, true
),

-- ===== PRE-PIZZAS =====
(
  'b0000000-0000-0000-0000-000000000601',
  'a0000000-0000-0000-0000-000000000006',
  'Pre-Pizza a la Piedra de Masa Madre con Salsa de Tomate',
  'prepizza-masa-madre-salsa-tomate',
  'Fermentación en frío de 48 hs. Harina de fuerza, masa madre viva, piso a la piedra crocante y salsa de tomate perita con orégano y oliva.',
  4200, 50, 'unidad (35 cm)',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  8, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000602',
  'a0000000-0000-0000-0000-000000000006',
  'Pre-Pizza Fugazzeta (Cebolla Juliana Caramelizada)',
  'prepizza-fugazzeta-cebolla-caramelizada',
  'Base a la piedra cubierta con abundante cebolla blanca en pluma macerada en aceite de oliva, orégano silvestre y pimienta negra.',
  4600, 40, 'unidad (35 cm)',
  'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80',
  8, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000603',
  'a0000000-0000-0000-0000-000000000006',
  'Pre-Pizza Integral con Semillas (Chía, Lino y Sésamo)',
  'prepizza-integral-semillas',
  'Harina integral fina, salvado de trigo tostado, mix de semillas activadas y base crocante lista para cubrir con vegetales o quesos magros.',
  4800, 30, 'unidad (35 cm)',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  8, 2, false, true
),

-- ===== EMPANADAS =====
(
  'b0000000-0000-0000-0000-000000000701',
  'a0000000-0000-0000-0000-000000000007',
  'Empanadas Criollas de Carne Cortada a Cuchillo (Crudas)',
  'empanadas-criollas-carne-cuchillo',
  'Docena en caja protegida con separador. Carne vacuna magra picada a cuchillo, abundante cebolla tierna, huevo duro y comino criollo.',
  14500, 40, 'docena (12 unid.)',
  'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
  15, 3, true, true
),
(
  'b0000000-0000-0000-0000-000000000702',
  'a0000000-0000-0000-0000-000000000007',
  'Empanadas de Jamón Cocido y Doble Queso Mozzarella (Crudas)',
  'empanadas-jamon-doble-queso',
  'Docena en caja. Masa hojaldrada al huevo con abundante mozzarella fundente y jamón cocido seleccionado feteado fino.',
  13900, 45, 'docena (12 unid.)',
  'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
  12, 3, true, true
),
(
  'b0000000-0000-0000-0000-000000000703',
  'a0000000-0000-0000-0000-000000000007',
  'Empanadas de Pollo al Verdeo y Puerros (Crudas)',
  'empanadas-pollo-verdeo-puerros',
  'Docena en caja. Pechuga de pollo deshilachada cocida con puerros caramelizados, cebollita de verdeo fresca y salsa blanca suave.',
  14200, 35, 'docena (12 unid.)',
  'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
  15, 3, false, true
),
(
  'b0000000-0000-0000-0000-000000000704',
  'a0000000-0000-0000-0000-000000000007',
  'Empanadas Caprese (Tomate, Mozzarella y Albahaca)',
  'empanadas-caprese-tomate-mozzarella',
  'Docena en caja. Tomates secos hidratados, mozzarella en cubos, albahaca fresca picada y aceite de oliva extra virgen.',
  13900, 30, 'docena (12 unid.)',
  'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
  12, 3, false, true
),
(
  'b0000000-0000-0000-0000-000000000705',
  'a0000000-0000-0000-0000-000000000007',
  'Empanadas de Espinaca, Ricota y Salsa Blanca (Crudas)',
  'empanadas-espinaca-ricota-bechamel',
  'Docena en caja. Espinaca cocida al vapor, ricota fresca de tambo, bechamel cremosa y nuez moscada rallada al momento.',
  13500, 30, 'docena (12 unid.)',
  'https://images.unsplash.com/photo-1628840042765-356cda07504e?auto=format&fit=crop&w=800&q=80',
  12, 3, false, true
),

-- ===== TARTAS =====
(
  'b0000000-0000-0000-0000-000000000801',
  'a0000000-0000-0000-0000-000000000008',
  'Tarta Pascualina Tradicional de Espinaca, Ricota y Huevo',
  'tarta-pascualina-espinaca-ricota',
  'Presentada en molde de aluminio de 26 cm. Masa quebrada crujiente con espinaca salteada, ricota y huevos enteros en su interior.',
  9400, 25, 'unidad (molde 26 cm)',
  'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
  25, 4, true, true
),
(
  'b0000000-0000-0000-0000-000000000802',
  'a0000000-0000-0000-0000-000000000008',
  'Tarta de Calabaza Asada, Queso Cremoso y Choclo',
  'tarta-calabaza-cremoso-choclo',
  'En molde de 26 cm lista para hornear. Puré espeso de calabaza cabutiá asada con granos de maíz tierno y queso cremoso derretido.',
  9200, 20, 'unidad (molde 26 cm)',
  'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
  25, 4, false, true
),
(
  'b0000000-0000-0000-0000-000000000803',
  'a0000000-0000-0000-0000-000000000008',
  'Tarta Rústica de Jamón Cocido y Tres Quesos',
  'tarta-rustica-jamon-tres-quesos',
  'En molde de 26 cm. Masa casera con sésamo negro rellena de cubos de jamón cocido, provolone suave, mozzarella y parmesano.',
  9800, 22, 'unidad (molde 26 cm)',
  'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
  25, 4, false, true
),
(
  'b0000000-0000-0000-0000-000000000804',
  'a0000000-0000-0000-0000-000000000008',
  'Tarta de Puerros, Cebolla Caramelizada y Queso Azul',
  'tarta-puerros-cebolla-queso-azul',
  'En molde de 26 cm. Salteado fino de puerros dulces y cebollas en manteca, ligue con crema fresca y toques de queso azul patagónico.',
  9900, 18, 'unidad (molde 26 cm)',
  'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
  25, 4, true, true
)
ON CONFLICT (slug) DO UPDATE SET
  descripcion = EXCLUDED.descripcion,
  precio = EXCLUDED.precio,
  stock = EXCLUDED.stock,
  imagen_url = EXCLUDED.imagen_url,
  es_destacado = EXCLUDED.es_destacado,
  activo = EXCLUDED.activo;

-- ===== CLIENTES =====
INSERT INTO clientes (id, nombre_completo, telefono, email, direccion, notas_preferencias, total_compras, cantidad_pedidos)
VALUES
(
  'c0000000-0000-0000-0000-000000000001',
  'Martín Gómez', '+5491144445555', 'martin@gmail.com',
  'Av. Libertador 2200, Piso 4',
  'Prefiere sorrentinos de salmón y empanadas de carne a cuchillo.',
  38400, 4
),
(
  'c0000000-0000-0000-0000-000000000002',
  'Lucía Benítez', '+5491166667777', 'lucia.b@hotmail.com',
  'Calle Juramento 1540',
  'Pide siempre pre-pizzas a la piedra y tarta pascualina los viernes.',
  21800, 3
)
ON CONFLICT (id) DO NOTHING;

-- ===== PROVEEDORES =====
INSERT INTO proveedores (id, razon_social, nombre_contacto, telefono, rubro, dias_entrega, condiciones_pago)
VALUES
(
  'd0000000-0000-0000-0000-000000000001',
  'Molinos Candeal S.A.', 'Roberto Candeal', '+541143219876',
  'Harinas y Sémolas Candeal', 'Lunes y Jueves', 'Cuenta Corriente 15 días'
),
(
  'd0000000-0000-0000-0000-000000000002',
  'Granja Las Praderas', 'Esteban Prats', '+541154321098',
  'Huevos de Campo y Ricotas Frescas', 'Martes y Viernes', 'Contado contra entrega'
)
ON CONFLICT (id) DO NOTHING;
\n\n-- >>> ARCHIVO: ./supabase/migrations/20261013010000_pedidos_triggers_y_vistas.sql <<<\n\n-- ==============================================================================
-- MIA PASTA BELLA - AUTOMATIZACIÓN DE PEDIDOS, STOCK Y ASIENTOS CONTABLES
-- Migración: 20261013010000_pedidos_triggers_y_vistas.sql
-- Ejecutar junto al resto de migraciones en un solo paso
-- ==============================================================================

-- 1. Secuencia para numeración legible de pedidos
CREATE SEQUENCE IF NOT EXISTS seq_numero_pedido START 1001;

-- Función para generar número de comprobante único
CREATE OR REPLACE FUNCTION generar_numero_pedido()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.numero_comprobante IS NULL OR NEW.numero_comprobante = '' THEN
        NEW.numero_comprobante := 'PED-' || nextval('seq_numero_pedido');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_generar_numero_pedido ON ventas;
CREATE TRIGGER tr_generar_numero_pedido
BEFORE INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION generar_numero_pedido();

-- 2. Trigger para descontar stock al registrar ítems de venta
CREATE OR REPLACE FUNCTION descontar_stock_producto()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE productos
    SET stock = GREATEST(0, stock - NEW.cantidad),
        updated_at = NOW()
    WHERE id = NEW.producto_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_descontar_stock_producto ON items_venta;
CREATE TRIGGER tr_descontar_stock_producto
AFTER INSERT ON items_venta
FOR EACH ROW
EXECUTE FUNCTION descontar_stock_producto();

-- 3. Trigger para crear Asiento Contable Automático al confirmar una Venta
CREATE OR REPLACE FUNCTION crear_asiento_venta_automatica()
RETURNS TRIGGER AS $$
DECLARE
    v_asiento_id UUID;
    v_cuenta_debe_id UUID;
    v_cuenta_haber_id UUID;
    v_codigo_debe VARCHAR(20);
BEGIN
    -- Determinar cuenta DEBE según método de pago
    IF NEW.metodo_pago IN ('transferencia', 'mercado_pago') THEN
        v_codigo_debe := '1.1.02'; -- Bancos / Mercado Pago
    ELSE
        v_codigo_debe := '1.1.01'; -- Caja y Efectivo
    END IF;

    -- Obtener IDs de cuentas contables
    SELECT id INTO v_cuenta_debe_id FROM cuentas_contables WHERE codigo = v_codigo_debe LIMIT 1;
    SELECT id INTO v_cuenta_haber_id FROM cuentas_contables WHERE codigo = '4.1.01' LIMIT 1;

    -- Si las cuentas existen, generar el asiento de partida doble
    IF v_cuenta_debe_id IS NOT NULL AND v_cuenta_haber_id IS NOT NULL AND NEW.total > 0 THEN
        INSERT INTO asientos_contables (
            fecha,
            glosa_concepto,
            es_automatico,
            venta_id
        ) VALUES (
            CURRENT_DATE,
            'Venta automática Pedido #' || NEW.numero_comprobante,
            true,
            NEW.id
        ) RETURNING id INTO v_asiento_id;

        -- Línea DEBE (Ingreso a Caja o Bancos)
        INSERT INTO lineas_asiento_contable (
            asiento_id,
            cuenta_id,
            debe,
            haber,
            descripcion
        ) VALUES (
            v_asiento_id,
            v_cuenta_debe_id,
            NEW.total,
            0,
            'Ingreso por Pedido #' || NEW.numero_comprobante
        );

        -- Línea HABER (Salida de Ventas)
        INSERT INTO lineas_asiento_contable (
            asiento_id,
            cuenta_id,
            debe,
            haber,
            descripcion
        ) VALUES (
            v_asiento_id,
            v_cuenta_haber_id,
            0,
            NEW.total,
            'Venta de pastas Pedido #' || NEW.numero_comprobante
        );
    END IF;

    -- Actualizar estadísticas de cliente si está asociado
    IF NEW.cliente_id IS NOT NULL THEN
        UPDATE clientes
        SET total_compras = total_compras + NEW.total,
            cantidad_pedidos = cantidad_pedidos + 1,
            ultimo_pedido_at = NOW()
        WHERE id = NEW.cliente_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_crear_asiento_venta ON ventas;
CREATE TRIGGER tr_crear_asiento_venta
AFTER INSERT ON ventas
FOR EACH ROW
EXECUTE FUNCTION crear_asiento_venta_automatica();

-- 4. VISTA CONVENIENTE 'pedidos_view' para consultas simplificadas
CREATE OR REPLACE VIEW pedidos_view AS
SELECT 
    v.id,
    v.numero_comprobante AS numero_pedido,
    v.cliente_id,
    COALESCE(c.nombre_completo, 'Cliente Mostrador / Web') AS cliente_nombre,
    COALESCE(c.telefono, '') AS cliente_telefono,
    v.estado,
    v.metodo_pago,
    v.subtotal,
    v.descuento,
    v.costo_envio,
    v.total,
    v.notas_entrega,
    v.direccion_envio,
    v.pagado,
    v.fecha_venta,
    v.created_at,
    COALESCE(
        json_agg(
            json_build_object(
                'id', iv.id,
                'producto_id', iv.producto_id,
                'producto_nombre', p.nombre,
                'cantidad', iv.cantidad,
                'precio_unitario', iv.precio_unitario,
                'subtotal', iv.subtotal
            )
        ) FILTER (WHERE iv.id IS NOT NULL), '[]'::json
    ) AS items
FROM ventas v
LEFT JOIN clientes c ON v.cliente_id = c.id
LEFT JOIN items_venta iv ON v.id = iv.venta_id
LEFT JOIN productos p ON iv.producto_id = p.id
GROUP BY v.id, c.nombre_completo, c.telefono;
\n