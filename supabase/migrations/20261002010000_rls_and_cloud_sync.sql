-- ==============================================================================
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
