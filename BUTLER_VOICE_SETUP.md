# 🔊 Butler Voice Setup — Azure Text-to-Speech

**¡Dale voz a Butler!** Ahora tu mayordomo puede hablar en español mexicano profesional.

---

## ⚡ Quick Start (3 minutos)

### 1️⃣ Obtén tu Azure Speech API Key

**Opción A: Trial gratuita (30 días, sin tarjeta crediticia)**
- Ve a: https://azure.microsoft.com/en-us/free/
- Crea una cuenta gratuita
- En Azure Portal: Cognitive Services → Speech  
- Copia tu **Subscription Key** (API Key)
- Región recomendada: `eastus` o `southcentralus`

**Opción B: Ya tienes créditos de Azure ($5,000 MXN)**
- Ve a: https://portal.azure.com
- Crea un recurso "Speech Services"
- Copia la **Subscription Key**

---

### 2️⃣ Instala dependencias

```powershell
# En la carpeta del proyecto
npm install microsoft-cognitiveservices-speech-sdk sqlite3 express cors
```

---

### 3️⃣ Inicia el servidor CRM con voz

**Windows (PowerShell):**
```powershell
$env:AZURE_SPEECH_KEY = "tu-key-aqui"
node butler-crm-server.js
```

**macOS/Linux (Terminal):**
```bash
export AZURE_SPEECH_KEY="tu-key-aqui"
node butler-crm-server.js
```

**Expected Output:**
```
✓ Azure Butler Voice initialized
✓ Connected to: butler-crm.db
✓ Butler CRM Server running on http://localhost:3000
  Voice Endpoints:
    POST /api/voice/speak      - Speak custom text
    GET  /api/voice/orden/:id  - Read order aloud
    POST /api/voice/alert      - Urgent alert
```

---

## 📱 Cómo usar Butler Voice

### En el CRM Dashboard (http://localhost:3000)
- Abre la sección **"Órdenes"**
- Haz clic en el botón **🔊** junto a cada orden
- Butler lee la orden completa en español mexicano

### En la Landing Page (http://localhost:8080)
- Usa Gemini AI para analizar mensajes del cliente
- El botón **"🔊 Escuchar respuesta"** aparece tras hacer el análisis
- Haz clic para que Butler lea la recomendación técnica en voz alta

### Alertas automáticas (en desarrollo)
- Butler gritará **¡ALERTA!** si entra una orden de urgencia ALTA
- Se lee automáticamente el nombre del cliente, teléfono y servicio

---

## 🎤 Voces disponibles (español mexicano)

Por defecto: `es-MX-DaliaNeural` (femenina, profesional, natural)

Alternativas:
```javascript
// En butler-azure-tts.js, línea 13:
'es-MX-DaliaNeural'     // Femenina (recomendado)
'es-MX-JorgeNeural'     // Masculino (profesional)
'es-MX-BeatrizNeural'   // Femenina más formal
```

---

## 🔧 Endpoints REST

### Hablar un texto
```bash
POST http://localhost:3000/api/voice/speak
Content-Type: application/json

{
  "text": "Hola, tengo una fuga en la cocina"
}
```

### Leer una orden
```bash
GET http://localhost:3000/api/voice/orden/5
```

### Alerta de urgencia
```bash
POST http://localhost:3000/api/voice/alert
Content-Type: application/json

{
  "message": "Inundación en el baño del cliente López",
  "urgencia": "ALTA"
}
```

---

## ❌ Solución de problemas

### "Voice not configured"
```
Error: set AZURE_SPEECH_KEY=<tu-key>
```
**Solución:**
```powershell
# Verifica que la variable de entorno está configurada:
$env:AZURE_SPEECH_KEY
# Si devuelve nada, repite el paso 3
```

### "HTTP 401: Missing subscription key"
- Tu Azure key está **expirada** o **mal copiada**
- Copia nuevamente desde Azure Portal (sin espacios)
- Verifica la región: `eastus`, `southcentralus`, etc.

### "Synthesizing audio failed"
- La text-to-speech de Microsoft requiere conexión a internet
- Verifica: `ping 8.8.8.8`
- Si usas VPN, desactívala temporalmente

### "localhost:3000 refused to connect"
- El servidor CRM no está corriendo
- Abre una terminal nueva en la carpeta del proyecto
- Corre: `node butler-crm-server.js`

---

## 📋 Archivos nuevos creados

| Archivo | Propósito |
|---------|-----------|
| `butler-azure-tts.js` | Cliente de Azure Speech Services |
| `butler-crm-server.js` (actualizado) | Endpoints de voz agregados |
| `butler-crm.html` (actualizado) | Botón 🔊 en la tabla de órdenes |
| `index-silver.html` (actualizado) | Botón 🔊 para análisis de Gemini |

---

## 🎯 Próximos pasos

- ✅ **Butler ya habla en órdenes**
- ✅ **Butler habla análisis de Gemini**
- ⏳ WhatsApp webhooks (alertas automáticas)
- ⏳ Transcripción de llamadas (Speech-to-Text)
- ⏳ Firmas digitales en órdenes
- ⏳ PDF con firma + fotos + voz

---

## 💡 Costos Azure TTS

- **Trial**: $0 (30 días completos)
- **Producción**: ~$1 USD por 1M caracteres
- A 200 órdenes/mes × 500 caracteres/orden = ~$0.10/mes

---

**¿Preguntas?** Revisa [butler-azure-tts.js](butler-azure-tts.js) para ver el código completo.

**¡Butler está listo para hablar! 🗣️🔧**
