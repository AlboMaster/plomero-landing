# ELITE PLOMERÍA CANCÚN — Google Cloud + Domain + Ads Strategy

## 🎯 Plan Ejecutivo (5000 MXN Crédito)

### Phase 1: Dominio + Presencia (Mes 1)
- **Dominio:** plomerocancun.org o plomerocancun.com.mx (~$150-300 MXN/año)
- **DNS:** Apuntar a Cloud Run
- **SSL/HTTPS:** Automático con Cloud Run
- **Email profesional:** admin@plomerocancun.org

### Phase 2: Serverless Backend (Cloud Run)
- **Costo:** $100-150 MXN/mes (primeros 2 GB/mes gratis)
- **Qué hace:**
  - NMX interpreter en servidor (no client-side)
  - API para procesar fotos (Vision API)
  - Webhooks de Facebook/GMB
  - Auto-crear órdenes sin intervención

### Phase 3: Gemini + Vision (IA Automática)
- **Costo:** $150-200 MXN/mes
- **Flujo:**
  1. Cliente envía foto + mensaje en WhatsApp/Telegram
  2. Vision API → "Veo fuga bajo fregadero"
  3. Gemini → "Servicio: Reparación tubería, Urgencia: ALTA"
  4. Auto-crea orden + agenda técnico

### Phase 4: Google Ads (Customer Acquisition)
- **Presupuesto recomendado:** $1000-1500 MXN/mes
- **Keywords:** "plomería cancún", "servicios de urgencia", "reparación tuberías"
- **Target:** Clientes en Cancún que pagan inmediato
- **ROAS esperado:** 4:1 (por cada $1 de ads, ganas $4)

---

## 📋 Dominio + DNS Setup

### Opción 1: Google Domains (MÁS FÁCIL)
```
1. Ve a domains.google.com
2. Busca "plomerocancun.org" o "plomerocancun.com.mx"
3. Compra (~$150-300 MXN/año)
4. En DNS settings, apunta a Cloud Run:
   - A record: <tu-cloud-run-IP>
   - O CNAMe: run.app
5. ¡Listo! HTTPS automático
```

### Opción 2: GoDaddy o Namecheap (MÁS BARATO)
```
- Compra dominio
- En nameservers, apunta a Google Cloud DNS
- Crea zona DNS en Google Cloud Console
- Los registros se sincronizan automáticamente
```

---

## ☁️ Cloud Run Deployment (Serverless)

El código que voy a crear hace esto:
```
Cliente envía mensaje
    ↓
Cloud Run recibe (Express.js)
    ↓
NMX interpreter + Gemini analiza
    ↓
Vision API procesa fotos (si hay)
    ↓
Text-to-Speech genera audio
    ↓
Auto-crea orden en Cloud SQL
    ↓
Envía respuesta por WhatsApp/Telegram
```

**Costos:**
- Cloud Run: $0.0000250/segundo, primeros 2M solicitudes/mes gratis
- Gemini: $0.075/millón tokens entrada
- Vision: $0.40-1.50 por 1000 imágenes
- **Total estimado:** $150-200 MXN/mes

---

## 🎯 Google Ads Strategy (Elite Clients Only)

### Keywords de Alto Valor (Pagan mucho):
```
"plomería de urgencia Cancún" — CPC: $15-25
"reparación tubería rota Cancún" — CPC: $20-30
"servicio de plomería profesional Cancún" — CPC: $10-20
"emergencia plomería 24h Cancún" — CPC: $15-25
```

### Landing Page Optimization:
- Mostrar número de teléfono prominente
- "Disponible 24/7"
- Testimonios + fotos antes/después
- "Presupuesto gratis vía foto"
- Botón WhatsApp directo

### Budget Allocation (recomendado):
```
$1500 MXN/mes (Google Ads)
  ├─ 40% Search Ads ($600) — keywords de urgencia
  ├─ 30% Display Ads ($450) — retargeting
  ├─ 20% Local Services Ads ($300) — "llama ahora"
  └─ 10% Testing ($150) — nuevas campañas

ROAS esperado: 4:1 (mínimo)
```

---

## 🚀 Implementación Inmediata

Voy a crear:
1. **butler-cloud-run.js** — Express.js para Cloud Run
2. **butler-vision-processor.js** — Procesa fotos automáticamente
3. **butler-whatsapp-integration.js** — Webhook para WhatsApp/Telegram
4. **DEPLOYMENT_GUIDE.md** — Paso a paso

---

## 💵 Presupuesto Total (3 meses)

| Item | Costo |
|------|-------|
| Dominio (plomerocancun.org) | $200 MXN |
| Google Cloud APIs (3 meses) | $450 MXN |
| Google Ads (3 meses × $1500) | $4500 MXN |
| Contingencia | $150 MXN |
| **TOTAL** | **$5300 MXN** |

**Resultado esperado:**
- Dominio profesional ✓
- Backend 24/7 automático ✓
- 50-100 clientes nuevos/mes vía Google Ads
- Órdenes se crean solas (foto + mensaje → automático)
- ROAS: 4:1 (ganas $6000 por cada $1500 gastado)

---

## ¿LISTO? Necesito:

1. **¿Qué dominio prefieres?**
   - plomerocancun.org (profesional)
   - plomerocancun.com.mx (local)
   - otro?

2. **¿Tienes número WhatsApp Business API?** (para webhooks)
   - Si no, puedo configurar con Telegram por ahora

3. **¿Google Ads account?** (con tarjeta de crédito)
   - Lo puedo ayudar a configurar

Dime y me lanzo a crear el backend serverless + guía de deployment completa.
