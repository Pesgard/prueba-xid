#!/bin/bash

# Script de prueba completo para el deployment
# URL real obtenida del deploy exitoso
API_URL="https://3fb9millhg.execute-api.us-east-1.amazonaws.com/dev"

echo "🚀 Iniciando prueba completa del deployment..."

# Test 1: Crear reporte
echo "📝 Paso 1: Creando reporte..."
RESPONSE=$(curl -s -X POST $API_URL/reports \
  -H "Content-Type: application/json" \
  -d '{"fileName": "test-sales-data.csv"}')

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
  --data-binary @test-sales-data.csv

echo "✅ Archivo subido"

# Test 3: Verificar estado (esperar procesamiento)
echo "⏳ Paso 3: Esperando procesamiento (30 segundos)..."
sleep 30

echo "🔍 Verificando estado del reporte..."
STATUS_RESPONSE=$(curl -s -X GET $API_URL/reports/$REPORT_ID)
echo "Estado: $STATUS_RESPONSE"

# Test 4: Descargar resultado si está listo
STATUS=$(echo $STATUS_RESPONSE | jq -r '.status')
if [ "$STATUS" = "ready" ]; then
    echo "✅ Reporte listo! Descargando..."
    DOWNLOAD_URL=$(echo $STATUS_RESPONSE | jq -r '.downloadUrl')
    curl -s "$DOWNLOAD_URL" > resultado-$REPORT_ID.json
    echo "📄 Resultado guardado en: resultado-$REPORT_ID.json"
    
    # Mostrar resumen
    echo "📊 Resumen del resultado:"
    cat resultado-$REPORT_ID.json | jq '.summary'
else
    echo "⏳ Reporte aún procesando. Estado: $STATUS"
    echo "💡 Ejecuta esto en unos minutos:"
    echo "curl $API_URL/reports/$REPORT_ID"
fi

echo "🎉 Prueba completada!" 