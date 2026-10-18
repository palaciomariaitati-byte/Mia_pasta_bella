-- ==============================================================================
-- MÍA PASTA BELLA - MIGRACIÓN MAESTRA INTEGRAL (SUPABASE / POSTGRESQL)
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. TIPOS ENUMERADOS SEGUROS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('admin', 'staff', 'cliente');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_venta AS ENUM ('pendiente', 'confirmada', 'en_preparacion', 'entregada', 'cancelada');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE metodo_pago AS ENUM ('efectivo', 'transferencia', 'tarjeta_debito', 'tarjeta_credito', 'mercado_pago');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_cuenta_contable AS ENUM ('activo', 'pasivo', 'patrimonio', 'ingreso', 'egreso');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. FUNCIÓN AUXILIAR: ACTUALIZAR updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. TABLA: configuracion_sitio
CREATE TABLE IF NOT EXISTS configuracion_sitio (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre_tienda VARCHAR(100) NOT NULL DEFAULT 'Mia Pasta Bella',
    slogan VARCHAR(255) DEFAULT 'El verdadero sabor de la pasta, hecha con el corazón',
    facebook_url VARCHAR(255) DEFAULT 'https://facebook.com',
    instagram_url VARCHAR(255) DEFAULT 'https://instagram.com',
    whatsapp_numero VARCHAR(30) DEFAULT '+5491100000000',
    whatsapp_mensaje_predeterminado TEXT DEFAULT '¡Hola! Quiero hacer un pedido en Mía Pasta Bella.',
    direccion_local VARCHAR(255) DEFAULT 'Av. de los Sabores 450',
    horarios_atencion VARCHAR(255) DEFAULT 'Martes a Domingos: 10:00 a 20:30 hs',
    email_contacto VARCHAR(150) DEFAULT 'contacto@miapastabella.com',
    actualizado_por UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_configuracion_sitio_updated_at ON configuracion_sitio;
CREATE TRIGGER tr_configuracion_sitio_updated_at
BEFORE UPDATE ON configuracion_sitio
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 4. TABLA: perfiles (RBAC)
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    rol user_role NOT NULL DEFAULT 'cliente',
    telefono VARCHAR(50),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_perfiles_updated_at ON perfiles;
CREATE TRIGGER tr_perfiles_updated_at
BEFORE UPDATE ON perfiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. TABLA: categorias
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

DROP TRIGGER IF EXISTS tr_categorias_updated_at ON categorias;
CREATE TRIGGER tr_categorias_updated_at
BEFORE UPDATE ON categorias
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. TABLA: productos
CREATE TABLE IF NOT EXISTS productos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    categoria_id UUID NOT NULL REFERENCES categorias(id) ON DELETE RESTRICT,
    nombre VARCHAR(150) NOT NULL,
    slug VARCHAR(150) NOT NULL UNIQUE,
    descripcion TEXT,
    precio DECIMAL(12, 2) NOT NULL CHECK (precio >= 0),
    precio_oferta DECIMAL(12, 2) CHECK (precio_oferta >= 0 AND (precio_oferta IS NULL OR precio_oferta < precio)),
    stock INT NOT NULL DEFAULT 0 CHECK (stock >= 0),
    unidad_medida VARCHAR(30) NOT NULL DEFAULT 'porción',
    imagen_url TEXT,
    galeria_urls TEXT[] DEFAULT '{}',
    es_destacado BOOLEAN NOT NULL DEFAULT false,
    activo BOOLEAN NOT NULL DEFAULT true,
    tiempo_coccion_minutos INT DEFAULT 4,
    rinde_porciones INT DEFAULT 2,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos(categoria_id);
CREATE INDEX IF NOT EXISTS idx_productos_destacado ON productos(es_destacado) WHERE activo = true;

DROP TRIGGER IF EXISTS tr_productos_updated_at ON productos;
CREATE TRIGGER tr_productos_updated_at
BEFORE UPDATE ON productos
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. TABLA: clientes (CRM)
CREATE TABLE IF NOT EXISTS clientes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    perfil_id UUID REFERENCES perfiles(id) ON DELETE SET NULL,
    nombre_completo VARCHAR(150) NOT NULL,
    email VARCHAR(150),
    telefono VARCHAR(50) NOT NULL,
    direccion TEXT,
    ciudad VARCHAR(100) DEFAULT 'Local',
    notas_preferencias TEXT,
    total_compras DECIMAL(14, 2) NOT NULL DEFAULT 0.00,
    cantidad_pedidos INT NOT NULL DEFAULT 0,
    ultimo_pedido_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_clientes_telefono ON clientes(telefono);

DROP TRIGGER IF EXISTS tr_clientes_updated_at ON clientes;
CREATE TRIGGER tr_clientes_updated_at
BEFORE UPDATE ON clientes
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 8. TABLA: proveedores
CREATE TABLE IF NOT EXISTS proveedores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    razon_social VARCHAR(150) NOT NULL,
    nombre_contacto VARCHAR(100),
    cuit_rut VARCHAR(50) UNIQUE,
    telefono VARCHAR(50),
    email VARCHAR(150),
    direccion TEXT,
    rubro VARCHAR(100) NOT NULL,
    dias_entrega VARCHAR(100),
    condiciones_pago VARCHAR(100),
    notas TEXT,
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

DROP TRIGGER IF EXISTS tr_proveedores_updated_at ON proveedores;
CREATE TRIGGER tr_proveedores_updated_at
BEFORE UPDATE ON proveedores
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 9. TABLA: ventas (Pedidos y Ventas)
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

CREATE INDEX IF NOT EXISTS idx_ventas_fecha ON ventas(fecha_venta);
CREATE INDEX IF NOT EXISTS idx_ventas_estado ON ventas(estado);

DROP TRIGGER IF EXISTS tr_ventas_updated_at ON ventas;
CREATE TRIGGER tr_ventas_updated_at
BEFORE UPDATE ON ventas
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 10. TABLA: items_venta (Detalle de pedidos)
CREATE TABLE IF NOT EXISTS items_venta (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    venta_id UUID NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
    producto_id UUID NOT NULL REFERENCES productos(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(12, 2) NOT NULL CHECK (precio_unitario >= 0),
    subtotal DECIMAL(12, 2) NOT NULL CHECK (subtotal >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_items_venta_venta ON items_venta(venta_id);

-- 11. MÓDULO CONTABLE: CUENTAS, ASIENTOS Y LÍNEAS (Partida Doble)
CREATE TABLE IF NOT EXISTS cuentas_contables (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    codigo VARCHAR(20) NOT NULL UNIQUE,
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
    glosa_concepto TEXT NOT NULL,
    venta_id UUID REFERENCES ventas(id) ON DELETE SET NULL,
    es_automatico BOOLEAN NOT NULL DEFAULT false,
    creado_por UUID REFERENCES perfiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_asientos_fecha ON asientos_contables(fecha);

CREATE TABLE IF NOT EXISTS lineas_asiento_contable (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asiento_id UUID NOT NULL REFERENCES asientos_contables(id) ON DELETE CASCADE,
    cuenta_id UUID NOT NULL REFERENCES cuentas_contables(id) ON DELETE RESTRICT,
    debe DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (debe >= 0),
    haber DECIMAL(14, 2) NOT NULL DEFAULT 0.00 CHECK (haber >= 0),
    descripcion VARCHAR(255),
    CONSTRAINT chk_debe_o_haber CHECK (debe > 0 OR haber > 0)
);

CREATE INDEX IF NOT EXISTS idx_lineas_asiento ON lineas_asiento_contable(asiento_id);

-- 12. TRIGGERS AUTOMÁTICOS DE NEGOCIO

-- A. Descontar Stock automáticamente al registrar item de venta
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

-- B. Crear Asiento Contable Automático y actualizar CRM al confirmar una Venta
CREATE OR REPLACE FUNCTION crear_asiento_venta_automatica()
RETURNS TRIGGER AS $$
DECLARE
    v_asiento_id UUID;
    v_cuenta_debe_id UUID;
    v_cuenta_haber_id UUID;
    v_codigo_debe VARCHAR(20);
BEGIN
    IF NEW.metodo_pago IN ('transferencia', 'mercado_pago') THEN
        v_codigo_debe := '1.1.02';
    ELSE
        v_codigo_debe := '1.1.01';
    END IF;

    SELECT id INTO v_cuenta_debe_id FROM cuentas_contables WHERE codigo = v_codigo_debe LIMIT 1;
    SELECT id INTO v_cuenta_haber_id FROM cuentas_contables WHERE codigo = '4.1.01' LIMIT 1;

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

        INSERT INTO lineas_asiento_contable (
            asiento_id, cuenta_id, debe, haber, descripcion
        ) VALUES (
            v_asiento_id, v_cuenta_debe_id, NEW.total, 0, 'Cobro Pedido #' || NEW.numero_comprobante
        );

        INSERT INTO lineas_asiento_contable (
            asiento_id, cuenta_id, debe, haber, descripcion
        ) VALUES (
            v_asiento_id, v_cuenta_haber_id, 0, NEW.total, 'Venta de pastas Pedido #' || NEW.numero_comprobante
        );
    END IF;

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

-- 13. VISTA 'pedidos_view' (Desnormalizada con items JSON para el Admin y Tienda)
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

-- 14. SEGURIDAD ROW LEVEL SECURITY (RLS)
ALTER TABLE configuracion_sitio ENABLE ROW LEVEL SECURITY;
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE categorias ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE ventas ENABLE ROW LEVEL SECURITY;
ALTER TABLE items_venta ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE proveedores ENABLE ROW LEVEL SECURITY;
ALTER TABLE cuentas_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE asientos_contables ENABLE ROW LEVEL SECURITY;
ALTER TABLE lineas_asiento_contable ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para la tienda
DROP POLICY IF EXISTS "Lectura publica configuracion" ON configuracion_sitio;
CREATE POLICY "Lectura publica configuracion" ON configuracion_sitio FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Lectura publica categorias" ON categorias;
CREATE POLICY "Lectura publica categorias" ON categorias FOR SELECT TO anon, authenticated USING (activo = true);

DROP POLICY IF EXISTS "Lectura publica productos" ON productos;
CREATE POLICY "Lectura publica productos" ON productos FOR SELECT TO anon, authenticated USING (activo = true);

DROP POLICY IF EXISTS "Permitir pedidos anonimos ventas" ON ventas;
CREATE POLICY "Permitir pedidos anonimos ventas" ON ventas FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Permitir pedidos anonimos items" ON items_venta;
CREATE POLICY "Permitir pedidos anonimos items" ON items_venta FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Políticas de administración total para usuarios autenticados
DROP POLICY IF EXISTS "Admin configuracion" ON configuracion_sitio;
CREATE POLICY "Admin configuracion" ON configuracion_sitio FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin categorias" ON categorias;
CREATE POLICY "Admin categorias" ON categorias FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin productos" ON productos;
CREATE POLICY "Admin productos" ON productos FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin ventas" ON ventas;
CREATE POLICY "Admin ventas" ON ventas FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin items_venta" ON items_venta;
CREATE POLICY "Admin items_venta" ON items_venta FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin clientes" ON clientes;
CREATE POLICY "Admin clientes" ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin proveedores" ON proveedores;
CREATE POLICY "Admin proveedores" ON proveedores FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin cuentas_contables" ON cuentas_contables;
CREATE POLICY "Admin cuentas_contables" ON cuentas_contables FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin asientos_contables" ON asientos_contables;
CREATE POLICY "Admin asientos_contables" ON asientos_contables FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin lineas_asiento_contable" ON lineas_asiento_contable;
CREATE POLICY "Admin lineas_asiento_contable" ON lineas_asiento_contable FOR ALL TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Admin perfiles" ON perfiles;
CREATE POLICY "Admin perfiles" ON perfiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 15. DATOS SEMILLA INICIALES

-- Configuración del sitio
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
    'Mia Pasta Bella',
    'El verdadero sabor de la pasta, hecha con el corazón',
    'https://facebook.com/miapastabella',
    'https://instagram.com/miapastabella',
    '+5491155551234',
    '¡Hola Mía Pasta Bella! Me gustaría encargar pastas frescas para el fin de semana.',
    'Av. de los Sabores 450',
    'Martes a Domingos de 10:00 a 20:30 hs',
    'contacto@miapastabella.com'
) ON CONFLICT DO NOTHING;

-- Plan contable básico
INSERT INTO cuentas_contables (codigo, nombre, tipo, descripcion) VALUES
('1.1.01', 'Caja y Efectivo', 'activo', 'Fondos en caja física'),
('1.1.02', 'Bancos / Mercado Pago', 'activo', 'Fondos digitales y transferencias'),
('1.1.05', 'Inventario de Materias Primas', 'activo', 'Stock de harinas, quesos, verduras, etc.'),
('2.1.01', 'Proveedores por Pagar', 'pasivo', 'Deudas comerciales con proveedores'),
('4.1.01', 'Ventas de Pastas y Salsas', 'ingreso', 'Ingresos por venta de productos elaborados'),
('5.1.01', 'Costo de Mercaderías Vendidas', 'egreso', 'Costo de elaboración e insumos'),
('5.2.01', 'Gastos Operativos y Servicios', 'egreso', 'Servicios, packaging y gas')
ON CONFLICT (codigo) DO NOTHING;

-- Proveedores iniciales
INSERT INTO proveedores (id, razon_social, nombre_contacto, telefono, rubro, dias_entrega, condiciones_pago) VALUES
('d0000000-0000-0000-0000-000000000001', 'Molinos Candeal S.A.', 'Roberto Candeal', '+541143219876', 'Harinas y Sémolas Candeal', 'Lunes y Jueves', 'Cuenta Corriente 15 días'),
('d0000000-0000-0000-0000-000000000002', 'Granja Las Praderas', 'Esteban Prats', '+541154321098', 'Huevos de Campo y Ricotas Frescas', 'Martes y Viernes', 'Contado contra entrega')
ON CONFLICT (id) DO NOTHING;

-- Categorías oficiales (IDs fijos para vinculación segura)
INSERT INTO categorias (id, nombre, slug, descripcion, imagen_url, orden, activo) VALUES
('a0000000-0000-0000-0000-000000000001', 'Tallarines', 'tallarines', 'Tallarines frescos al huevo cortados a mano y cintas artesanales', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', 1, true),
('a0000000-0000-0000-0000-000000000002', 'Sorrentinos', 'sorrentinos', 'Sorrentinos rellenos con combinaciones gourmet irresistibles', 'https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80', 2, true),
('a0000000-0000-0000-0000-000000000003', 'Ravioles', 'ravioles', 'Clásicos ravioles caseros con las recetas de la nonna', 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80', 3, true),
('a0000000-0000-0000-0000-000000000004', 'Ñoquis', 'noquis', 'Tradicionales ñoquis de papa, calabaza y espinaca livianos y esponjosos', 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80', 4, true),
('a0000000-0000-0000-0000-000000000005', 'Tortellinis', 'tortellinis', 'Exquisitos tortellinis con rellenos intensos y equilibrados', 'https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80', 5, true),
('a0000000-0000-0000-0000-000000000006', 'Pre-Pizzas', 'prepizzas', 'Pre-pizzas a la piedra de fermentación lenta de 48 hs', 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80', 6, true),
('a0000000-0000-0000-0000-000000000007', 'Empanadas', 'empanadas', 'Empanadas artesanales de masa casera al horno', 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80', 7, true),
('a0000000-0000-0000-0000-000000000008', 'Tartas', 'tartas', 'Tartas individuales y pascualinas con masa hojaldrada', 'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80', 8, true),
('a0000000-0000-0000-0000-000000000009', 'Salsas', 'salsas', 'Salsas caseras cocidas a fuego lento listas para acompañar', 'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80', 9, true)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    slug = EXCLUDED.slug,
    descripcion = EXCLUDED.descripcion,
    imagen_url = EXCLUDED.imagen_url,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo;

-- Catálogo de Productos Oficial
INSERT INTO productos (
    id, categoria_id, nombre, slug, descripcion, precio, stock,
    unidad_medida, imagen_url, tiempo_coccion_minutos, rinde_porciones, es_destacado, activo
) VALUES
-- Tallarines
(
  'b0000000-0000-0000-0000-000000000101',
  'a0000000-0000-0000-0000-000000000001',
  'Tallarines al Huevo Clásicos de Autor',
  'tallarines-al-huevo-clasicos',
  'Elaborados con pura sémola de trigo candeal y 4 huevos de granja por kilo. Masa sobada artesanalmente.',
  5800, 50, 'porción (500g)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  4, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000102',
  'a0000000-0000-0000-0000-000000000001',
  'Fettuccine Verdes con Espinaca de Huerto',
  'fettuccine-verdes-espinaca',
  'Cintas al huevo teñidas naturalmente con puré de espinaca fresca cocida al vapor, sin colorantes artificiales.',
  6200, 40, 'porción (500g)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  4, 2, false, true
),
(
  'b0000000-0000-0000-0000-000000000103',
  'a0000000-0000-0000-0000-000000000001',
  'Pappardelle Rústicos al Huevo Anchos',
  'pappardelle-rusticos-al-huevo',
  'Cintas extra anchas de 2 cm cortadas a cuchillo, textura porosa ideal para ragú de carne o estofados de larga cocción.',
  6500, 30, 'porción (500g)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  5, 2, true, true
),

-- Sorrentinos
(
  'b0000000-0000-0000-0000-000000000201',
  'a0000000-0000-0000-0000-000000000002',
  'Sorrentinos de Jamón Cocido Natural y Mozzarella',
  'sorrentinos-jamon-cocido-mozzarella',
  'Medallones rellenos de jamón cocido seleccionado y mozzarella hilada de primera calidad con nuez moscada.',
  7800, 45, 'caja (12 unid.)',
  'https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80',
  6, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000202',
  'a0000000-0000-0000-0000-000000000002',
  'Sorrentinos de Calabaza Asada, Mozzarella y Nueces',
  'sorrentinos-calabaza-mozzarella-nueces',
  'Calabaza cabutia asada al horno de barro con romero, corazón de mozzarella cremosa y lluvia de nueces tostadas.',
  7400, 50, 'caja (12 unid.)',
  'https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80',
  6, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000203',
  'a0000000-0000-0000-0000-000000000002',
  'Sorrentinos Cuatro Quesos con Corazón Fundente',
  'sorrentinos-cuatro-quesos',
  'Combinación armónica de queso azul d’Alvernia, mozzarella de búfala, provolone estacionado y sardo rallado.',
  8500, 38, 'caja (12 unid.)',
  'https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80',
  6, 2, true, true
),

-- Ravioles
(
  'b0000000-0000-0000-0000-000000000301',
  'a0000000-0000-0000-0000-000000000003',
  'Ravioles de Ricota Cremosa, Parmesano y Nuez Moscada',
  'ravioles-ricota-parmesano-nuez',
  'Planchas de masa fina al huevo rellenas de ricota entera fresca de tambo y queso reggianito rallado fino.',
  6800, 60, 'caja (2 planchas)',
  'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
  5, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000302',
  'a0000000-0000-0000-0000-000000000003',
  'Ravioles de Ternera Braseada al Malbec',
  'ravioles-ternera-braseada-malbec',
  'Carne vacuna magra cocida a fuego lento 5 horas con vegetales aromáticos, vino tinto Malbec y especias.',
  7900, 45, 'caja (2 planchas)',
  'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
  5, 2, false, true
),

-- Ñoquis
(
  'b0000000-0000-0000-0000-000000000401',
  'a0000000-0000-0000-0000-000000000004',
  'Ñoquis Clásicos de Papa Soufflé al Huevo',
  'noquis-clasicos-papa-souffle',
  'Papa seleccionada hervida al vapor sin exceso de humedad, harina 0000 y huevo fresco. Livianos como nubes.',
  5200, 65, 'porción (500g)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  3, 2, true, true
),
(
  'b0000000-0000-0000-0000-000000000402',
  'a0000000-0000-0000-0000-000000000004',
  'Ñoquis de Espinaca y Ricota de Tambo',
  'noquis-espinaca-ricota-tambo',
  'Masa verde con puré de espinaca fresca y ricota bien escurrida con toque de queso sardo fino.',
  5600, 40, 'porción (500g)',
  'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=800&q=80',
  3, 2, false, true
),

-- Tortellinis
(
  'b0000000-0000-0000-0000-000000000501',
  'a0000000-0000-0000-0000-000000000005',
  'Tortellinis de Jamón Crudo y Parmesano Reggiano',
  'tortellinis-jamon-crudo-parmesano',
  'Masa finísima al huevo replegada a mano con jamón crudo estacionado 12 meses y queso parmesano.',
  8900, 30, 'caja (500g)',
  'https://images.unsplash.com/photo-1587740114974-98a097d31fd8?auto=format&fit=crop&w=800&q=80',
  4, 2, true, true
),

-- Pre-Pizzas
(
  'b0000000-0000-0000-0000-000000000601',
  'a0000000-0000-0000-0000-000000000006',
  'Pre-Pizza a la Piedra de Masa Madre con Salsa de Tomate',
  'prepizza-masa-madre-salsa-tomate',
  'Fermentación en frío de 48 hs. Harina de fuerza, masa madre viva y salsa de tomate perita con orégano y oliva.',
  4200, 50, 'unidad (35 cm)',
  'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&q=80',
  8, 2, true, true
),

-- Empanadas
(
  'b0000000-0000-0000-0000-000000000701',
  'a0000000-0000-0000-0000-000000000007',
  'Empanadas Criollas de Carne Cortada a Cuchillo (Crudas)',
  'empanadas-criollas-carne-cuchillo',
  'Docena en caja con separador. Carne vacuna magra picada a cuchillo, abundante cebolla tierna, huevo duro y comino.',
  14500, 40, 'docena (12 unid.)',
  'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?auto=format&fit=crop&w=800&q=80',
  15, 3, true, true
),

-- Tartas
(
  'b0000000-0000-0000-0000-000000000801',
  'a0000000-0000-0000-0000-000000000008',
  'Pascualina Clásica de Espinaca, Ricota y Huevo',
  'pascualina-clasica-espinaca-ricota',
  'Masa hojaldrada crujiente rellena de espinaca cocida al vapor, ricota fresca de tambo y huevos enteros.',
  8200, 25, 'unidad (24 cm)',
  'https://images.unsplash.com/photo-1519869325930-281384150729?auto=format&fit=crop&w=800&q=80',
  12, 4, true, true
),

-- Salsas
(
  'b0000000-0000-0000-0000-000000000901',
  'a0000000-0000-0000-0000-000000000009',
  'Salsa Pomodoro Clásica con Albahaca Fresca',
  'salsa-pomodoro-albahaca',
  'Tomates perita maduros pelados a mano, cocidos a fuego lento con aceite de oliva extra virgen y hojas de albahaca fresca.',
  3800, 60, 'frasco (450g)',
  'https://images.unsplash.com/photo-1546549032-9571cd6b27df?auto=format&fit=crop&w=800&q=80',
  2, 2, true, true
)
ON CONFLICT (id) DO UPDATE SET
    nombre = EXCLUDED.nombre,
    slug = EXCLUDED.slug,
    descripcion = EXCLUDED.descripcion,
    precio = EXCLUDED.precio,
    stock = EXCLUDED.stock,
    unidad_medida = EXCLUDED.unidad_medida,
    imagen_url = EXCLUDED.imagen_url,
    tiempo_coccion_minutos = EXCLUDED.tiempo_coccion_minutos,
    rinde_porciones = EXCLUDED.rinde_porciones,
    es_destacado = EXCLUDED.es_destacado,
    activo = EXCLUDED.activo;