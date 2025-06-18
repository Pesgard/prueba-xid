#!/bin/bash

# Script de prueba completo para el deployment
# URL real obtenida del deploy exitoso
API_URL="https://5oh4dzia63.execute-api.us-east-1.amazonaws.com/dev"

echo "🚀 Iniciando prueba completa del deployment..."

# Test 1: Crear reporte
echo "📝 Paso 1: Creando reporte..."
RESPONSE=$(curl -s -X POST $API_URL/reports \
  -H "Content-Type: application/json" \
  -d '{"fileName": "examples/sample-sales-data.csv"}')

echo "Respuesta: $RESPONSE"

# Extraer reportId y uploadUrl (necesitarás jq instalado)
REPORT_ID=$(echo $RESPONSE | jq -r '.reportId')
UPLOAD_URL=$(echo $RESPONSE | jq -r '.uploadUrl')

echo "📋 Report ID: $REPORT_ID"
echo "📤 Upload URL: $UPLOAD_URL"

# Test 2: Subir archivo
echo "📤 Paso 2: Subiendo archivo CSV..."
curl -X PUT "$UPLOAD_URL" \
  -H "Content-Type: text/csv" \
  --data-binary @examples/sample-sales-data.csv

echo "✅ Archivo subido"

# Test 3: Verificar estado con medición de tiempo real
echo "⏳ Paso 3: Verificando procesamiento..."
START_TIME=$(date +%s)
POLL_INTERVAL=2  # Verificar cada 2 segundos
MAX_WAIT_TIME=300  # Máximo 5 minutos
ELAPSED=0

while [ $ELAPSED -lt $MAX_WAIT_TIME ]; do
    echo "🔍 Verificando estado del reporte... (${ELAPSED}s transcurridos)"
    STATUS_RESPONSE=$(curl -s -X GET $API_URL/reports/$REPORT_ID)
    STATUS=$(echo $STATUS_RESPONSE | jq -r '.status')
    
    if [ "$STATUS" = "ready" ]; then
        END_TIME=$(date +%s)
        PROCESSING_TIME=$((END_TIME - START_TIME))
        echo "✅ Reporte procesado exitosamente!"
        echo "⏱️  Tiempo de procesamiento: ${PROCESSING_TIME} segundos"
        break
    elif [ "$STATUS" = "processing" ]; then
        echo "⏳ Estado: procesando..."
    elif [ "$STATUS" = "failed" ]; then
        echo "❌ Error: El procesamiento falló"
        echo "Estado: $STATUS_RESPONSE"
        exit 1
    else
        echo "⏳ Estado: $STATUS"
    fi
    
    sleep $POLL_INTERVAL
    ELAPSED=$((ELAPSED + POLL_INTERVAL))
done

# Verificar si se agotó el tiempo de espera
if [ $ELAPSED -ge $MAX_WAIT_TIME ]; then
    echo "⏰ Tiempo de espera agotado (${MAX_WAIT_TIME}s). Estado final: $STATUS"
    exit 1
fi

# Test 4: Descargar resultado
echo "📥 Descargando resultado..."
DOWNLOAD_URL=$(echo $STATUS_RESPONSE | jq -r '.downloadUrl')
curl -s "$DOWNLOAD_URL" > resultado-$REPORT_ID.json
echo "📄 Resultado guardado en: resultado-$REPORT_ID.json"

# Mostrar resumen
echo "📊 Resumen del resultado:"
cat resultado-$REPORT_ID.json | jq '.summary'

echo "🎉 Prueba completada!"
echo "📈 Métricas de rendimiento:"
echo "   - Tiempo total de procesamiento: ${PROCESSING_TIME} segundos"
echo "   - Archivo procesado: test-sales-data.csv"
echo "   - Report ID: $REPORT_ID" 