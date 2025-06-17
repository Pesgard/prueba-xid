# Report Processor API

Este proyecto implementa un sistema automatizado para la carga, procesamiento y obtención de reportes de ventas a partir de archivos CSV. Está diseñado con principios de Clean Architecture y se ejecuta sobre AWS utilizando el Serverless Framework.

---

## 🚀 Objetivo

Permitir a los usuarios subir archivos CSV con datos de ventas, procesarlos de forma asíncrona y obtener un resumen filtrado en formato JSON.

### Ejemplo de flujo

1. El cliente solicita una URL para subir un archivo CSV.
2. Sube el archivo usando una URL pre-firmada de S3.
3. Una Lambda se dispara y procesa el archivo (filtro y cálculos).
4. El resultado se guarda como un JSON en un bucket de resultados.
5. El cliente puede consultar si el archivo fue procesado y descargar el resumen.

---

## 🎓 Tecnologías y Herramientas

- **Lenguaje**: TypeScript
- **Cloud Provider**: AWS
- **Infraestructura**: Serverless Framework
- **Componentes AWS**:

  - API Gateway
  - Lambda
  - S3 (2 buckets: uploads y results)

- **Inyección de dependencias**: InversifyJS
- **Testing**: Jest

---

## 🌐 Endpoints

### 1. `POST /reports`

- Genera un `reportId` y una URL pre-firmada para subir el CSV.
- Respuesta:

```json
{
  "reportId": "uuid",
  "uploadUrl": "https://..."
}
```

### 2. S3 Trigger - `processCsvFile`

- Se ejecuta cuando se sube un archivo.
- Lógica:

  - Lee el CSV
  - Filtra productos con `quantity > 10`
  - Calcula `total_price`
  - Genera JSON con resumen y guarda en bucket de resultados

### 3. `GET /reports/{reportId}`

- Verifica si el JSON ya está listo
- Si está, devuelve una URL pre-firmada para descarga
- Si no, devuelve 202 (procesando) o 404 (no encontrado)

---

## 🧰 Estructura de Carpetas (Clean Architecture)

```
src/
  domain/          # Entidades y lógica pura de negocio
  application/     # Casos de uso
  infrastructure/  # S3, generación de URLs, adaptadores
  handlers/        # Lambdas (entry points)
  config/          # Inversify container y bindings
```

---

## 📊 JSON de Salida (Ejemplo)

```json
{
  "metadata": {
    "reportId": "uuid",
    "processedAt": "2025-06-16T14:30:00Z"
  },
  "items": [
    {
      "product_id": "102",
      "product_name": "Mouse Gamer",
      "quantity": 25,
      "price": 75.0,
      "total_price": 1875.0
    },
    {
      "product_id": "103",
      "product_name": "Teclado Mecánico",
      "quantity": 15,
      "price": 110.25,
      "total_price": 1653.75
    }
  ],
  "summary": {
    "totalItems": 2,
    "grandTotal": 3528.75
  }
}
```

---

## ⚖️ Principios de Diseño

- Arquitectura limpia y modular.
- Principios SOLID.
- Lógica de negocio completamente testeada.
- Inyección de dependencias para aislar infraestructuras.

---

## ✅ Roadmap

- [x] Definición del flujo y arquitectura
- [ ] Implementar `POST /reports`
- [ ] Lambda para procesamiento
- [ ] Implementar `GET /reports/{reportId}`
- [ ] Tests de negocio
- [ ] Deploy con Serverless

---

Cualquier nueva funcionalidad o mejora seguirá el enfoque modular y testeable propuesto en esta arquitectura.
