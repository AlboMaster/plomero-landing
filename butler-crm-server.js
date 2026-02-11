// butler-crm-server.js
// CRM API server for local plumbing orders management
// Run: npm install sqlite3 express cors body-parser
// Then: node butler-crm-server.js

const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ButlerVoice = require('./butler-azure-tts');

const app = express();
const PORT = 3000;
let butlerVoice = null;

// Initialize Azure TTS if key provided
if(process.env.AZURE_SPEECH_KEY) {
  try {
    butlerVoice = new ButlerVoice(process.env.AZURE_SPEECH_KEY);
    console.log('✓ Azure Butler Voice initialized');
  } catch(e) {
    console.warn('⚠ Azure Voice unavailable:', e.message);
  }
}
const dbPath = path.join(__dirname, 'butler-crm.db');

app.use(cors());
app.use(express.json({limit: '50mb'}));
app.use(express.static(__dirname)); // Serve static files (HTML)

// Database connection
const db = new sqlite3.Database(dbPath, (err) => {
  if(err) {
    console.error('✗ Database error:', err);
    console.log('  Run: node butler-crm-database.js');
    process.exit(1);
  }
  console.log(`✓ Connected to: butler-crm.db`);
});

// Helper: promisify database calls
const dbRun = (sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(err) {
    if(err) reject(err);
    else resolve({id: this.lastID, changes: this.changes});
  });
});

const dbGet = (sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (err, row) => {
    if(err) reject(err);
    else resolve(row);
  });
});

const dbAll = (sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (err, rows) => {
    if(err) reject(err);
    else resolve(rows || []);
  });
});

// Gatekeeper Logic (Truth Seeking Curtain)
const GATEKEEPER = {
  blacklist: ["barato", "cuanto es lo menos", "primo", "amigo", "descuento", "presupuesto gratis"],
  rejection: "Mi metodología no contempla ajustes presupuestarios. Le sugiero opciones alineadas a su capacidad de costo. Suerte."
};

const checkGatekeeper = (text) => {
  if (!text) return false;
  const lowText = text.toLowerCase();
  return GATEKEEPER.blacklist.some(word => lowText.includes(word));
};

// ===== CLIENTES =====
app.post('/api/leads', async (req, res) => {
  try {
    const {name, phone, email, address, service, description} = req.body;
    
    if (checkGatekeeper(description) || checkGatekeeper(name)) {
      console.log(`[GATEKEEPER] Rejected lead from ${name} due to low-value signals.`);
      return res.status(403).json({
        error: "FUCK_OFF_CON_CLASE",
        message: GATEKEEPER.rejection
      });
    }

    const result = await dbRun(
      `INSERT INTO clientes (nombre, telefono, email, direccion, tipo_cliente) VALUES (?, ?, ?, ?, ?)`,
      [name, phone, email, address, 'Lead Web']
    );
    
    // Auto-create order
    await dbRun(
      `INSERT INTO ordenes (cliente_id, descripcion_cliente, servicio_asignado, urgencia, severidad)
       VALUES (?, ?, ?, ?, ?)`,
      [result.id, description, service, 'media', 1]
    );

    res.json({leadId: result.id, status: 'created'});
  } catch(e) {
    res.status(400).json({error: e.message});
  }
});

app.post('/api/clientes', async (req, res) => {
  try {
    const {nombre, telefono, email, direccion, ciudad, notas} = req.body;
    
    // Truth Seeking Filter
    if (checkGatekeeper(notas) || checkGatekeeper(nombre)) {
      console.log(`[GATEKEEPER] Rejected lead from ${nombre} due to low-value signals.`);
      return res.status(403).json({
        error: "FUCK_OFF_CON_CLASE",
        message: GATEKEEPER.rejection
      });
    }

    const result = await dbRun(
      `INSERT INTO clientes (nombre, telefono, email, direccion, ciudad) VALUES (?, ?, ?, ?, ?)`,
      [nombre, telefono, email, direccion, ciudad]
    );
    res.json({id: result.id, status: 'created'});
  } catch(e) {
    res.status(400).json({error: e.message});
  }
});

app.get('/api/clientes', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM clientes WHERE activo = 1 ORDER BY fecha_registro DESC`);
    res.json(rows);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/clientes/:id', async (req, res) => {
  try {
    const cliente = await dbGet(`SELECT * FROM clientes WHERE id = ?`, [req.params.id]);
    const ordenes = await dbAll(`SELECT * FROM ordenes WHERE cliente_id = ? ORDER BY fecha_creacion DESC`, [req.params.id]);
    res.json({cliente, ordenes});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.put('/api/clientes/:id', async (req, res) => {
  try {
    const {nombre, telefono, email, direccion, ciudad, tipo_cliente} = req.body;
    await dbRun(
      `UPDATE clientes SET nombre=?, telefono=?, email=?, direccion=?, ciudad=?, tipo_cliente=? WHERE id=?`,
      [nombre, telefono, email, direccion, ciudad, tipo_cliente, req.params.id]
    );
    res.json({status: 'updated'});
  } catch(e) {
    res.status(400).json({error: e.message});
  }
});

// ===== ÓRDENES =====
app.post('/api/ordenes', async (req, res) => {
  try {
    const {cliente_id, descripcion_cliente, interpretacion_tecnica, servicio_asignado, urgencia, severidad} = req.body;
    const result = await dbRun(
      `INSERT INTO ordenes (cliente_id, descripcion_cliente, interpretacion_tecnica, servicio_asignado, urgencia, severidad)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [cliente_id, descripcion_cliente, interpretacion_tecnica, servicio_asignado, urgencia, severidad]
    );
    res.json({id: result.id, status: 'created'});
  } catch(e) {
    res.status(400).json({error: e.message});
  }
});

app.get('/api/ordenes', async (req, res) => {
  try {
    const {estado, urgencia} = req.query;
    let sql = `SELECT o.*, c.nombre, c.telefono FROM ordenes o JOIN clientes c ON o.cliente_id = c.id WHERE 1=1`;
    const params = [];
    
    if(estado) { sql += ` AND o.estado = ?`; params.push(estado); }
    if(urgencia) { sql += ` AND o.urgencia = ?`; params.push(urgencia); }
    
    sql += ` ORDER BY o.fecha_creacion DESC LIMIT 100`;
    const rows = await dbAll(sql, params);
    res.json(rows);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/ordenes/:id', async (req, res) => {
  try {
    const orden = await dbGet(`SELECT o.*, c.nombre, c.telefono, c.direccion FROM ordenes o JOIN clientes c ON o.cliente_id = c.id WHERE o.id = ?`, [req.params.id]);
    const reporte = await dbGet(`SELECT * FROM reportes_trabajo WHERE orden_id = ?`, [req.params.id]);
    res.json({orden, reporte});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.put('/api/ordenes/:id', async (req, res) => {
  try {
    const {estado, tecnico_asignado, fecha_programada, costo_actual, notas_internas} = req.body;
    const updates = [];
    const values = [];
    
    if(estado !== undefined) { updates.push(`estado=?`); values.push(estado); }
    if(tecnico_asignado) { updates.push(`tecnico_asignado=?`); values.push(tecnico_asignado); }
    if(fecha_programada) { updates.push(`fecha_programada=?`); values.push(fecha_programada); }
    if(costo_actual !== undefined) { updates.push(`costo_actual=?`); values.push(costo_actual); }
    if(notas_internas) { updates.push(`notas_internas=?`); values.push(notas_internas); }
    
    if(estado === 'completada') updates.push(`fecha_completada=CURRENT_TIMESTAMP`);
    
    values.push(req.params.id);
    await dbRun(`UPDATE ordenes SET ${updates.join(', ')} WHERE id=?`, values);
    res.json({status: 'updated'});
  } catch(e) {
    res.status(400).json({error: e.message});
  }
});

// ===== TÉCNICOS =====
app.post('/api/tecnicos', async (req, res) => {
  try {
    const {nombre, telefono, especialidades} = req.body;
    const result = await dbRun(
      `INSERT INTO tecnicos (nombre, telefono, especialidades) VALUES (?, ?, ?)`,
      [nombre, telefono, JSON.stringify(especialidades)]
    );
    res.json({id: result.id, status: 'created'});
  } catch(e) {
    res.status(400).json({error: e.message});
  }
});

app.get('/api/tecnicos', async (req, res) => {
  try {
    const rows = await dbAll(`SELECT * FROM tecnicos WHERE disponible = 1`);
    res.json(rows.map(t => ({...t, especialidades: JSON.parse(t.especialidades || '[]')})));
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// ===== REPORTES =====
app.post('/api/reportes/:orden_id', async (req, res) => {
  try {
    const {tecnico_id, descripcion_trabajo, materiales_usados, fotos_antes_despues, firma_cliente} = req.body;
    const result = await dbRun(
      `INSERT INTO reportes_trabajo (orden_id, tecnico_id, descripcion_trabajo, materiales_usados, fotos_antes_despues, firma_cliente, inicio_trabajo, fin_trabajo)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [req.params.orden_id, tecnico_id, descripcion_trabajo, JSON.stringify(materiales_usados), JSON.stringify(fotos_antes_despues), firma_cliente]
    );
    
    // Mark order as completed
    await dbRun(`UPDATE ordenes SET estado = 'completada', fecha_completada = CURRENT_TIMESTAMP WHERE id = ?`, [req.params.orden_id]);
    
    res.json({id: result.id, status: 'report_created'});
  } catch(e) {
    res.status(400).json({error: e.message});
  }
});

// ===== REPORTES DE NEGOCIO =====
app.get('/api/reportes/resumen', async (req, res) => {
  try {
    const ordenes_pendientes = await dbGet(`SELECT COUNT(*) as count FROM ordenes WHERE estado IN ('pendiente', 'asignada', 'en_progreso')`);
    const ordenes_completadas = await dbGet(`SELECT COUNT(*) as count FROM ordenes WHERE estado = 'completada'`);
    const ingresos = await dbGet(`SELECT SUM(costo_actual) as total FROM ordenes WHERE estado = 'completada'`);
    const tiempo_promedio = await dbGet(`SELECT AVG(tiempo_resolucion_minutos) as mins FROM ordenes WHERE estado = 'completada'`);
    
    res.json({
      pendientes: ordenes_pendientes.count,
      completadas: ordenes_completadas.count,
      ingresos_total: ingresos.total || 0,
      tiempo_promedio_minutos: Math.round(tiempo_promedio.mins) || 0,
      timestamp: new Date().toISOString()
    });
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

app.get('/api/reportes/por-fecha', async (req, res) => {
  try {
    const {desde, hasta} = req.query;
    const rows = await dbAll(`
      SELECT DATE(fecha_creacion) as fecha, COUNT(*) as total, SUM(costo_actual) as ingresos
      FROM ordenes
      WHERE fecha_creacion BETWEEN ? AND ?
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha DESC
    `, [desde, hasta]);
    res.json(rows);
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({status: 'Butler CRM Online ✓', port: PORT});
});

// 🔊 BUTLER VOICE ENDPOINTS (Azure Text-to-Speech)
// POST /api/voice/speak - Speak any text
app.post('/api/voice/speak', async (req, res) => {
  if(!butlerVoice) return res.status(503).json({error: 'Voice not configured. Set AZURE_SPEECH_KEY env var'});
  
  const {text} = req.body;
  if(!text) return res.status(400).json({error: 'Missing: text'});
  
  try {
    const result = await butlerVoice.speakText(text);
    res.json({status: 'success', message: result.message, audioLength: result.audioLength});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// GET /api/voice/orden/:id - Read order aloud
app.get('/api/voice/orden/:id', async (req, res) => {
  if(!butlerVoice) return res.status(503).json({error: 'Voice not configured'});
  
  try {
    const orden = await dbGet(
      `SELECT * FROM ordenes WHERE id = ?`,
      [req.params.id]
    );
    if(!orden) return res.status(404).json({error: 'Order not found'});
    
    const text = buildOrdenSpeech(orden);
    const result = await butlerVoice.speakText(text);
    res.json({status: 'read', message: 'Orden leída', audioLength: result.audioLength});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// POST /api/voice/alert - Urgent alert voice
app.post('/api/voice/alert', async (req, res) => {
  if(!butlerVoice) return res.status(503).json({error: 'Voice not configured'});
  
  const {message, urgencia} = req.body;
  const alertText = `¡ALERTA! ${message}. Urgencia: ${urgencia}. Requiere atención inmediata.`;
  
  try {
    const result = await butlerVoice.speakText(alertText);
    res.json({status: 'alert_sent', audioLength: result.audioLength});
  } catch(e) {
    res.status(500).json({error: e.message});
  }
});

// Helper: Format order for text-to-speech
function buildOrdenSpeech(orden) {
  return `
    Orden número ${orden.id}.
    Cliente: ${orden.nombre || 'Sin nombre'}.
    Teléfono: ${orden.telefono || 'No registrado'}.
    Dirección: ${orden.direccion || 'No especificada'}.
    Servicio: ${orden.servicio_asignado || 'Por determinar'}.
    Urgencia: ${orden.urgencia}.
    ${orden.interpretacion_tecnica ? `Notas técnicas: ${orden.interpretacion_tecnica}` : ''}
    Estado: ${orden.estado}.
  `;
}

// Serve CRM interface
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'butler-crm.html'));
});

app.listen(PORT, () => {
  console.log(`\n✓ Su Servilleta™ CRM Server running on http://localhost:${PORT}`);
  console.log(`  Clientes:  GET/POST  /api/clientes`);
  console.log(`  Órdenes:   GET/POST  /api/ordenes`);
  console.log(`  Técnicos:  GET/POST  /api/tecnicos`);
  console.log(`  Reportes:  GET      /api/reportes/resumen`);
  console.log(`  Web UI:             http://localhost:${PORT}\n`);
});
