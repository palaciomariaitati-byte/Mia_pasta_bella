-- ==============================================================================
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
