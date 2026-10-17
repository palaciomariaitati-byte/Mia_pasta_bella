-- ==============================================================================
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
