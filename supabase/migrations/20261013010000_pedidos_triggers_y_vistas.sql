-- ==============================================================================
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
