// butler-cloud-run.js
// Express.js Server for Google Cloud Run
// Handles: NMX interpreter, Vision API, Gemini, order creation, WhatsApp/Telegram
// Deploy: gcloud run deploy butler-plomeria --source .

const express = require('express');
const fetch = require('node-fetch');
const GoogleGenerativeAI = require('@google/generative-ai');

const app = express();
const PORT = process.env.PORT || 8080;

// Environment variables (set in Cloud Run)
const GEMINI_KEY = process.env.GEMINI_API_KEY;
const VISION_API = 'https://vision.googleapis.com/v1/images:annotate';
const genAI = GEMINI_KEY ? new GoogleGenerativeAI.GoogleGenerativeAI(GEMINI_KEY) : null;

// NMX Glossary (same as browser)
const NMX_GLOSSARY = {
  "fuga": {term: "fuga de agua", action: "Localizar origen (unión, junta, tubería fisurada)", parts: ["Cinta de teflón","Sellador de roscas","Junta de goma"], nmxNote: "Revisar conectores y uniones según NMX aplicable."},
  "tubería rota": {term: "tubería con fisura/ruptura", action: "Reemplazo de tramo afectado o reparación con acople", parts: ["Tramo de tubería PVC/CPVC/CP- conforme al tipo"], nmxNote: "Confirmar material y diámetro conforme a norma."},
  "goteo": {term: "goteo en grifo/llave", action: "Inspeccionar asiento y empaquetadura; cambiar arandelas o cartucho", parts: ["Empaquetadura","Cartucho de grifo"], nmxNote: "Verificar presión de línea si el goteo es por exceso."},
  "agua" : {term: "flujo/caudal/agua", action: "Verificar presión y caudal en la instalación", parts: ["Manómetro","Válvula reguladora de presión"], nmxNote: "Documentar presión (kPa) para cumplimiento NMX si aplica."},
  "mal olor": {term: "obstrucción o sifón seco", action: "Revisar trampas, sifones y desagües; limpiar o reemplazar", parts: ["Desatascador","Manguera de limpieza"], nmxNote: "Asegurar sello de agua en sifones según prácticas NMX."}
};

app.use(express.json({limit: '10mb'}));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({status: 'Butler Plomería Online ✓', timestamp: new Date().toISOString()});
});

// NMX Interpreter Endpoint
app.post('/api/interpret', (req, res) => {
  const {message, useNMX} = req.body;
  if(!message) return res.status(400).json({error: 'Missing message'});

  const cleaned = sanitize(message);
  const keywords = extractKeywords(cleaned);
  const result = translateToTechnician(cleaned, keywords, useNMX !== false);

  res.json(result);
});

// Gemini AI Analysis Endpoint
app.post('/api/gemini-analyze', async (req, res) => {
  if(!genAI) return res.status(500).json({error: 'Gemini API not configured'});

  const {message} = req.body;
  if(!message) return res.status(400).json({error: 'Missing message'});

  try {
    const model = genAI.getGenerativeModel({model: 'gemini-pro'});
    const prompt = `Eres un asesor técnico de plomería en México (Norma Mexicana).
Cliente reporta: "${message}"

Analiza brevemente:
1. Problema principal
2. 3 posibles servicios
3. Urgencia (BAJA/NORMAL/ALTA)
4. Materiales probables
5. Consejo NMX

Responde en JSON compacto.`;

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    res.json({analysis: text});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// Vision API - Analyze Photo Endpoint
app.post('/api/vision-analyze', async (req, res) => {
  if(!process.env.GOOGLE_CLOUD_PROJECT) return res.status(500).json({error: 'Vision API not configured'});

  const {imageBase64} = req.body;
  if(!imageBase64) return res.status(400).json({error: 'Missing image'});

  try {
    const visionRes = await fetch(`${VISION_API}?key=${process.env.GOOGLE_APPLICATION_CREDENTIALS}`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({
        requests: [{
          image: {content: imageBase64},
          features: [
            {type: 'LABEL_DETECTION', maxResults: 10},
            {type: 'TEXT_DETECTION'},
            {type: 'OBJECT_LOCALIZATION', maxResults: 5}
          ]
        }]
      })
    });

    const visionData = await visionRes.json();
    const labels = visionData.responses?.[0]?.labelAnnotations || [];
    const objects = visionData.responses?.[0]?.localizedObjectAnnotations || [];

    // Pattern match for plumbing issues
    const detected = [];
    const keywords = labels.map(l => l.description.toLowerCase());
    if(keywords.some(k => k.includes('leak') || k.includes('fuga') || k.includes('water'))) detected.push('Posible fuga o daño por agua');
    if(keywords.some(k => k.includes('pipe') || k.includes('tubo') || k.includes('break'))) detected.push('Tuberías o conectores dañados');
    if(keywords.some(k => k.includes('mold') || k.includes('moho') || k.includes('humid'))) detected.push('Humedad/Moho — emergencia');

    res.json({
      detected_issues: detected,
      labels: labels.slice(0, 5),
      objects: objects.slice(0, 3),
      recommendation: detected.length > 0 ? 'Urgencia ALTA' : 'Revisar visualmente'
    });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// WhatsApp/Telegram Webhook (for future integration)
app.post('/api/webhook/message', (req, res) => {
  const {message, sender, platform} = req.body; // platform: 'whatsapp' | 'telegram'

  // Auto-interpret and respond
  const analysis = translateToTechnician(message, extractKeywords(message), true);

  // TODO: Send response back via WhatsApp API or Telegram Bot API
  res.json({
    status: 'received',
    interpretation: analysis.technicianText,
    client_reply: analysis.clientReply,
    incoming: {sender, platform, message}
  });
});

// Helper Functions (same as nmx-interpreter.js)
function sanitize(raw){
  if(!raw) return "";
  let t = raw.replace(/[\u200B-\u200F]/g, '').replace(/\s+/g,' ').trim();
  t = t.replace(/\.{2,}/g,'.').replace(/!{2,}/g,'!');
  return t;
}

function extractKeywords(text){
  const lowered = text.toLowerCase();
  const found = [];
  for(const k of Object.keys(NMX_GLOSSARY)){
    if(lowered.includes(k)) found.push(k);
  }
  return found;
}

function translateToTechnician(cleaned, keywords, useNMX){
  const summaryLines = [];
  summaryLines.push('Resumen técnico sugerido:');
  if(cleaned.length===0){
    summaryLines.push('- Sin texto de entrada. Pedir más detalles al cliente.');
  } else {
    summaryLines.push(`- Observación: "${cleaned}"`);
  }

  if(keywords.length===0){
    summaryLines.push('- Interpretación: revisar visualmente; pedir fotos y ubicación exacta.');
  } else {
    for(const k of keywords){
      const info = NMX_GLOSSARY[k];
      summaryLines.push(`- Causa probable: ${info.term}. Acción: ${info.action}.`);
      if(info.parts && info.parts.length) summaryLines.push(`  - Materiales: ${info.parts.join(', ')}.`);
      if(useNMX) summaryLines.push(`  - NMX: ${info.nmxNote}`);
    }
  }

  summaryLines.push('- Checklist: 1) Cerrar línea. 2) Aislar zona. 3) Evaluar presión. 4) Revisar uniones. 5) Fotografiar.');
  const severity = (cleaned.match(/fuga|goteo|tubería rota|inundación|moho|humedad/gi)||[]).length;
  if(severity>=2) summaryLines.push('- Urgencia: ALTA — <24h');
  else summaryLines.push('- Urgencia: Normal');

  return {
    cleaned,
    keywords,
    technicianText: summaryLines.join('\n'),
    clientReply: 'Gracias por reportar. Ubicación exacta, fotos y horario disponible?',
    severity
  };
}

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({error: err.message});
});

app.listen(PORT, () => {
  console.log(`✓ Butler Plomería running on port ${PORT}`);
  console.log(`→ GET /health`);
  console.log(`→ POST /api/interpret`);
  console.log(`→ POST /api/gemini-analyze`);
  console.log(`→ POST /api/vision-analyze`);
  console.log(`→ POST /api/webhook/message`);
});
