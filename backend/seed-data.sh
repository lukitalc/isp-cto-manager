#!/bin/bash

# Script para popular o banco de dados com dados de exemplo

API_URL="http://localhost:3000"

echo "🌱 Populando banco de dados com dados de exemplo..."

# Criar CTO 1
echo "Criando CTO-01-Centro..."
CTO1=$(curl -s -X POST "$API_URL/ctos" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CTO-01-Centro",
    "latitude": -23.550520,
    "longitude": -46.633308,
    "splitterType": "1x8",
    "totalPorts": 8,
    "status": "ATIVA",
    "installationDate": "2025-01-15"
  }')

CTO1_ID=$(echo $CTO1 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✓ CTO-01-Centro criada: $CTO1_ID"

# Criar CTO 2
echo "Criando CTO-02-Jardins..."
CTO2=$(curl -s -X POST "$API_URL/ctos" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CTO-02-Jardins",
    "latitude": -23.561684,
    "longitude": -46.655981,
    "splitterType": "1x16",
    "totalPorts": 16,
    "status": "ATIVA",
    "installationDate": "2025-02-20"
  }')

CTO2_ID=$(echo $CTO2 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✓ CTO-02-Jardins criada: $CTO2_ID"

# Criar CTO 3
echo "Criando CTO-03-Vila-Mariana..."
CTO3=$(curl -s -X POST "$API_URL/ctos" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "CTO-03-Vila-Mariana",
    "latitude": -23.588194,
    "longitude": -46.636093,
    "splitterType": "1x8",
    "totalPorts": 8,
    "status": "ATIVA",
    "installationDate": "2025-03-10"
  }')

CTO3_ID=$(echo $CTO3 | grep -o '"id":"[^"]*' | cut -d'"' -f4)
echo "✓ CTO-03-Vila-Mariana criada: $CTO3_ID"

# Conectar alguns clientes na CTO 1
echo ""
echo "Conectando clientes na CTO-01-Centro..."

curl -s -X POST "$API_URL/client-connections" \
  -H "Content-Type: application/json" \
  -d "{
    \"ctoId\": \"$CTO1_ID\",
    \"portNumber\": 1,
    \"contractId\": \"CONTRATO-10001\",
    \"onuSerialNumber\": \"HWTC1234ABCD\",
    \"connectionDate\": \"2025-01-20\"
  }" > /dev/null
echo "✓ Cliente CONTRATO-10001 conectado na porta 1"

curl -s -X POST "$API_URL/client-connections" \
  -H "Content-Type: application/json" \
  -d "{
    \"ctoId\": \"$CTO1_ID\",
    \"portNumber\": 2,
    \"contractId\": \"CONTRATO-10002\",
    \"onuSerialNumber\": \"HWTC5678EFGH\",
    \"connectionDate\": \"2025-01-22\"
  }" > /dev/null
echo "✓ Cliente CONTRATO-10002 conectado na porta 2"

curl -s -X POST "$API_URL/client-connections" \
  -H "Content-Type: application/json" \
  -d "{
    \"ctoId\": \"$CTO1_ID\",
    \"portNumber\": 3,
    \"contractId\": \"CONTRATO-10003\",
    \"onuSerialNumber\": \"HWTC9012IJKL\",
    \"connectionDate\": \"2025-01-25\"
  }" > /dev/null
echo "✓ Cliente CONTRATO-10003 conectado na porta 3"

# Conectar clientes na CTO 2
echo ""
echo "Conectando clientes na CTO-02-Jardins..."

for i in {1..12}; do
  curl -s -X POST "$API_URL/client-connections" \
    -H "Content-Type: application/json" \
    -d "{
      \"ctoId\": \"$CTO2_ID\",
      \"portNumber\": $i,
      \"contractId\": \"CONTRATO-2000$i\",
      \"onuSerialNumber\": \"HWTC$(printf '%04d' $i)XPTO\",
      \"connectionDate\": \"2025-02-$(printf '%02d' $((15 + i)))\"
    }" > /dev/null
  echo "✓ Cliente CONTRATO-2000$i conectado na porta $i"
done

# Conectar alguns clientes na CTO 3
echo ""
echo "Conectando clientes na CTO-03-Vila-Mariana..."

curl -s -X POST "$API_URL/client-connections" \
  -H "Content-Type: application/json" \
  -d "{
    \"ctoId\": \"$CTO3_ID\",
    \"portNumber\": 1,
    \"contractId\": \"CONTRATO-30001\",
    \"onuSerialNumber\": \"HWTC3001ABCD\",
    \"connectionDate\": \"2025-03-15\"
  }" > /dev/null
echo "✓ Cliente CONTRATO-30001 conectado na porta 1"

echo ""
echo "✅ Banco de dados populado com sucesso!"
echo ""
echo "📊 Resumo:"
echo "  - 3 CTOs criadas"
echo "  - CTO-01-Centro: 3/8 portas ocupadas (37%)"
echo "  - CTO-02-Jardins: 12/16 portas ocupadas (75%)"
echo "  - CTO-03-Vila-Mariana: 1/8 portas ocupadas (12%)"
echo ""
echo "Acesse http://localhost:3001 para visualizar no frontend!"

