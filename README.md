# 📊 Report Processor API

Una API serverless construida con **Clean Architecture** para procesar reportes de ventas CSV de manera asíncrona usando **AWS Lambda**, **S3** y **API Gateway**.

## 🏗️ Arquitectura y Decisiones de Diseño

### **Clean Architecture**
Este proyecto implementa Clean Architecture con separación estricta de responsabilidades:

```
src/
├── 🏛️ domain/                    # Lógica de negocio pura (sin dependencias externas)
│   ├── entities/                 # Entidades con reglas de negocio
│   │   └── Report.ts            # Lógica de filtrado, validación y cálculos
│   └── interfaces/              # Contratos/puertos del dominio
│       ├── ICsvProcessor.ts     # Interface para procesamiento CSV
│       └── IFileRepository.ts   # Interface para gestión de archivos
├── 🎯 application/               # Casos de uso (orquestación)
│   └── usecases/                # Lógica de aplicación
│       ├── CreateReportUseCase.ts   # Crear reporte y generar URL
│       ├── ProcessCsvUseCase.ts     # Procesar CSV asíncronamente
│       └── GetReportUseCase.ts      # Consultar estado del reporte
├── 🔌 infrastructure/           # Adaptadores externos (AWS, servicios)
│   ├── repositories/            # Implementaciones de persistencia
│   │   └── AwsS3FileRepository.ts   # Gestión de archivos en S3
│   └── services/               # Servicios externos
│       └── NodeCsvProcessor.ts      # Procesamiento CSV con Node.js
├── 🌐 interfaces/              # Puntos de entrada (HTTP, eventos)
│   └── lambda/                 # Handlers de AWS Lambda
│       ├── createReportHandler.ts   # POST /reports
│       ├── processCsvHandler.ts     # Trigger S3 events
│       └── getReportHandler.ts      # GET /reports/{id}
└── 🔧 config/                  # Configuración e inyección de dependencias
    ├── container.ts            # Contenedor IoC (Inversify)
    └── types.ts               # Símbolos para DI
```

### **Decisiones de Diseño Clave**

1. **Inversión de Dependencias**: El dominio no conoce la infraestructura
2. **Inyección de Dependencias**: Usando InversifyJS para desacoplamiento
3. **Event-Driven Architecture**: S3 triggers para procesamiento asíncrono
4. **Stateless Functions**: Lambdas sin estado para escalabilidad
5. **Presigned URLs**: Para uploads/downloads seguros sin proxy
6. **TypeScript Strict**: Tipado fuerte para prevenir errores

## 🚀 Instalación y Configuración

### **Prerrequisitos**
- Node.js 20.x o superior
- npm o yarn
- AWS CLI configurado
- Serverless Framework v4

### **1. Clonar e Instalar Dependencias**
```bash
# Clonar el repositorio
git clone <repository-url>
cd prueba-xid

# Instalar dependencias
npm install
```

### **2. Configurar AWS (si no está configurado)**
```bash
# Configurar credenciales AWS
aws configure

# Verificar configuración
aws sts get-caller-identity
```

### **3. Configurar Variables de Entorno (Opcional)**
```bash
# Copiar archivo de ejemplo
cp env.example .env

# Editar variables si es necesario
# AWS_REGION=us-east-1 (por defecto)
```

## 🚀 Despliegue con Serverless Framework

### **Despliegue a Desarrollo**
```bash
# Desplegar a stage 'dev' (por defecto)
npm run deploy

# O usando serverless directamente
serverless deploy

# O especificar stage explícitamente
serverless deploy --stage dev
```

### **Despliegue a Producción**
```bash
# Desplegar a stage 'prod'
npm run deploy:prod

# O usando serverless directamente
serverless deploy --stage prod
```

### **Verificar Despliegue**
```bash
# Ver información del stack
serverless info

# Ver logs en tiempo real
serverless logs -f processCSV --tail

# Ver métricas
serverless metrics
```

### **Remover Stack (Cleanup)**
```bash
# Remover todos los recursos AWS
serverless remove

# Para stage específico
serverless remove --stage prod
```

## 🧪 Ejecutar Tests

```bash
# Tests básicos
npm test

# Tests con cobertura
npm run test:coverage

# Tests en modo watch (desarrollo)
npm run test:watch
```

## 📋 Uso de la API

### **Endpoints Disponibles**

Después del despliegue, obtendrás una URL base como:
```
https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev
```

### **1. 📝 Crear Reporte**

**Endpoint**: `POST /reports`

**Postman/Insomnia:**
```http
POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/reports
Content-Type: application/json

{
  "fileName": "ventas-enero-2024.csv"
}
```

**cURL:**
```bash
curl -X POST https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/reports \
  -H "Content-Type: application/json" \
  -d '{"fileName": "ventas-enero-2024.csv"}'
```

**Respuesta:**
```json
{
  "reportId": "550e8400-e29b-41d4-a716-446655440000",
  "uploadUrl": "https://bucket.s3.amazonaws.com/presigned-upload-url"
}
```

### **2. 📤 Subir Archivo CSV**

**Postman:**
1. Crear nueva request tipo `PUT`
2. URL: Usar la `uploadUrl` del paso anterior
3. Body → Binary → Seleccionar archivo CSV
4. Headers: `Content-Type: text/csv`

**cURL:**
```bash
# Usar la uploadUrl del paso anterior
curl -X PUT "https://bucket.s3.amazonaws.com/presigned-upload-url" \
  -H "Content-Type: text/csv" \
  --data-binary @examples/sample-sales-data.csv
```

### **3. 🔍 Consultar Estado del Reporte**

**Endpoint**: `GET /reports/{reportId}`

**Postman:**
```http
GET https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/reports/550e8400-e29b-41d4-a716-446655440000
```

**cURL:**
```bash
curl https://xxxxxxxxxx.execute-api.us-east-1.amazonaws.com/dev/reports/550e8400-e29b-41d4-a716-446655440000
```

**Respuestas Posibles:**

**Procesando (HTTP 202):**
```json
{
  "status": "processing"
}
```

**Listo (HTTP 200):**
```json
{
  "status": "ready",
  "downloadUrl": "https://bucket.s3.amazonaws.com/presigned-download-url"
}
```

**No encontrado (HTTP 404):**
```json
{
  "status": "not_found"
}
```

### **4. 📥 Descargar Resultado**

**Postman:**
1. Usar la `downloadUrl` del paso anterior
2. GET request
3. El resultado será un JSON con el reporte procesado

**cURL:**
```bash
# Descargar y guardar resultado
curl "https://bucket.s3.amazonaws.com/presigned-download-url" > resultado.json

# Ver resumen del resultado
curl -s "https://bucket.s3.amazonaws.com/presigned-download-url" | jq '.summary'
```

## 📊 Ejemplo Completo de Flujo

### **Archivo CSV de Ejemplo** (`examples/sample-sales-data.csv`)
```csv
product_id,product_name,quantity,price
101,Laptop Gaming,5,1200.00
102,Mouse Gamer,25,75.00
103,Teclado Mecánico,15,150.00
104,Monitor 4K,8,800.00
105,Auriculares,30,120.00
```

### **Resultado JSON Procesado**
```json
{
  "metadata": {
    "reportId": "550e8400-e29b-41d4-a716-446655440000",
    "processedAt": "2024-01-15T10:30:00.000Z"
  },
  "items": [
    {
      "product_id": "102",
      "product_name": "Mouse Gamer",
      "quantity": 25,
      "price": 75,
      "total_price": 1875
    },
    {
      "product_id": "103",
      "product_name": "Teclado Mecánico",
      "quantity": 15,
      "price": 150,
      "total_price": 2250
    },
    {
      "product_id": "105",
      "product_name": "Auriculares",
      "quantity": 30,
      "price": 120,
      "total_price": 3600
    }
  ],
  "summary": {
    "totalItems": 3,
    "grandTotal": 7725
  }
}
```

> **Nota**: Solo se procesan items con `quantity > 10`

## 🔧 Script de Prueba Automática

El proyecto incluye un script de prueba completo:

```bash
# Ejecutar prueba completa del flujo
./test-deployment.sh
```

Este script:
1. ✅ Crea un reporte
2. ✅ Sube el archivo CSV
3. ✅ Monitorea el procesamiento
4. ✅ Descarga el resultado
5. ✅ Muestra métricas de rendimiento

## 🛠️ Desarrollo Local

### **Comandos Útiles**
```bash
# Desarrollo
npm run test:watch          # Tests en modo watch
npm run test:coverage       # Cobertura de tests
npm run build              # Build TypeScript

# Despliegue
npm run deploy             # Deploy a dev
npm run deploy:prod        # Deploy a producción
npm run remove             # Remover stack

# Logs y debugging
serverless logs -f createReport --tail
serverless logs -f processCSV --tail
serverless logs -f getReport --tail
```

### **Testing Offline (Opcional)**
```bash
# Instalar plugin offline
npm install --save-dev serverless-offline

# Ejecutar API localmente
serverless offline
```

## 🏗️ Tecnologías Utilizadas

### **Core Stack**
- **TypeScript 5.8** - Tipado estático
- **Node.js 20.x** - Runtime serverless
- **InversifyJS** - Inyección de dependencias

### **AWS Serverless**
- **AWS Lambda** - Funciones serverless
- **Amazon S3** - Almacenamiento de archivos
- **API Gateway** - Endpoints REST
- **CloudFormation** - Infraestructura como código

### **Testing & Build**
- **Jest 30** - Framework de testing
- **Serverless Framework v4** - Deployment
- **ESBuild** - Bundling optimizado

## 🎯 Reglas de Negocio

1. **Filtrado**: Solo se procesan items con `quantity > 10`
2. **Cálculo**: `total_price = quantity * price`
3. **Validación**: Campos obligatorios y tipos correctos
4. **Formato**: Entrada CSV, salida JSON estructurado

## 📈 Monitoreo y Logs

### **Ver Logs en Tiempo Real**
```bash
# Logs de creación de reportes
serverless logs -f createReport --tail

# Logs de procesamiento CSV
serverless logs -f processCSV --tail

# Logs de consulta de reportes
serverless logs -f getReport --tail
```

### **Métricas Disponibles**
- Duración de procesamiento
- Errores y reintentos
- Throughput de la API
- Uso de memoria

## 🔒 Seguridad

- **Presigned URLs**: Acceso temporal y seguro a S3
- **CORS**: Configurado para requests cross-origin
- **IAM Roles**: Permisos mínimos necesarios
- **Validación**: Input validation en todos los endpoints

## 🚨 Troubleshooting

### **Errores Comunes**

**Error: "Bucket does not exist"**
```bash
# Verificar que el deployment fue exitoso
serverless info
```

**Error: "Access Denied"**
```bash
# Verificar credenciales AWS
aws sts get-caller-identity
```

**Error: "Function timeout"**
```bash
# Ver logs para debugging
serverless logs -f processCSV --tail
```