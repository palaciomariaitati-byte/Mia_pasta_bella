# Mia Pasta Bella — Memoria del Proyecto y Estado de Entrega

**Fecha de guardado:** 15 de Octubre de 2026  
**Estado:** ✅ Ambas aplicaciones compiladas con código 0 y listas para producción.

---

## 1. Diagnóstico del Error en la Captura (`localhost:3001 rechaza la conexión`)
En la captura de pantalla compartida, el navegador mostraba:
`Vaya... no se puede obtener acceso a esta página. localhost rechazó la conexión (ERR_CONNECTION_REFUSED)`.

### Motivo:
1. **El servidor de desarrollo del Admin no estaba encendido** en la terminal.
2. Además, en la configuración previa de `admin/package.json`, el puerto por defecto estaba asignado en **3020** (`next dev -p 3020`).

### Solución aplicada de inmediato:
1. Se actualizó `admin/package.json` para que el script `dev` y `start` apunten directamente al **puerto 3001**:
   ```json
   "dev": "next dev -p 3001"
   ```
2. Se creó el archivo ejecutable **`iniciar_proyecto.bat`** en la raíz de la carpeta. Con solo hacerle **doble clic**, abre automáticamente la Tienda en `localhost:3000` y el Panel en `localhost:3001`.

---

## 2. Resumen de Todo lo Implementado para la Fábrica

### A. Modelo de Fábrica de Pastas por Tandas (~3 Días por Semana)
- **Corta Caducidad:** Avisos destacados en catálogo y portada de frescura (72 hs en heladera / 90 días en freezer, 100% libre de conservantes).
- **Elección de Tanda:** En el checkout el cliente selecciona su día de producción (Jueves, Viernes, Domingos).
- **Cálculo por Porciones:** Cada variedad indica cuántas porciones rinde y el resumen calcula el total de platos a servir.

### B. Checkout con Cobro Instantáneo
- **Pantalla con QR y Link:** Al confirmar Nombre, Teléfono, Dirección y Tanda, se abre la pantalla con el Total en $ ARS según porciones.
- **QR Dinámico:** Con el logo artesanal de Mia Pasta Bella en el centro.
- **Link de Mercado Pago:** Botón directo para pagar al instante.
- **Datos Bancarios Copiables:** Alias y CBU con botón de 1 toque.
- **WhatsApp:** Envío prolijo de la comanda hacia el teléfono de la fábrica.

### C. Autonomía Máxima en el Admin (`localhost:3001`)
- **Precios y Stocks por Tanda:** Modificación de precios normales y de oferta, control de stock y botón de agotado.
- **Fechas:** Carga de fecha de elaboración y caducidad por producto.
- **Galería Predeterminada de 12 Fotos Gourmet:** Selector visual con 1 clic para asignar fotos de alta definición o pegar la URL de la foto real del taller.
- **Textos de Tandas y Cobro:** Sección para cambiar el Alias, CBU, link de Mercado Pago y días de apertura.
- **Pedidos:** Visualización de la tanda solicitada, total de porciones a elaborar y botón directo de WhatsApp al cliente.

---

## 3. Comandos para Iniciar Mañana

### Opción 1: Con 1 solo clic (Recomendada)
Doble clic sobre el archivo:
📁 **`c:\Users\Mary\OneDrive\Desktop\Mia_Pasta_Bella\iniciar_proyecto.bat`**

### Opción 2: Desde la terminal de comandos
```bash
# Para la Tienda (Clientes):
npm run dev:tienda     # Abre en http://localhost:3000

# Para el Panel Admin (Dueño):
npm run dev:admin      # Abre en http://localhost:3001
```
