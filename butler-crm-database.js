// butler-crm-database.js
// SQLite database schema for local CRM
// Run once: node butler-crm-database.js

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'butler-crm.db');
const db = new sqlite3.Database(dbPath, (err) => {
  if(err) console.error(err);
  else console.log(`✓ Database: ${dbPath}`);
});

const schema = `
-- Clientes
CREATE TABLE IF NOT EXISTS clientes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  telefono TEXT UNIQUE,
  email TEXT,
  direccion TEXT,
  ciudad TEXT,
  tipo_cliente TEXT DEFAULT 'regular', -- 'regular', 'vip', 'frecuente'
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  activo BOOLEAN DEFAULT 1
);

-- Órdenes de trabajo
CREATE TABLE IF NOT EXISTS ordenes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  cliente_id INTEGER NOT NULL,
  descripcion_cliente TEXT,
  interpretacion_tecnica TEXT,
  servicio_asignado TEXT,
  urgencia TEXT, -- 'BAJA', 'NORMAL', 'ALTA'
  severidad INTEGER,
  estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'asignada', 'en_progreso', 'completada', 'cancelada'
  tecnico_asignado TEXT,
  fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  fecha_programada DATETIME,
  fecha_completada DATETIME,
  tiempo_resolucion_minutos INTEGER,
  costo_estimado REAL,
  costo_actual REAL,
  notas_internas TEXT,
  fotos_ruta TEXT, -- JSON array de rutas
  FOREIGN KEY(cliente_id) REFERENCES clientes(id)
);

-- Servicios disponibles
CREATE TABLE IF NOT EXISTS servicios (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT UNIQUE NOT NULL,
  descripcion TEXT,
  costo_base REAL,
  tiempo_estimado_minutos INTEGER,
  materiales_sugeridos TEXT, -- JSON
  norma_nmx TEXT,
  activo BOOLEAN DEFAULT 1
);

-- Técnicos
CREATE TABLE IF NOT EXISTS tecnicos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  telefono TEXT UNIQUE,
  especialidades TEXT, -- JSON: ['fuga', 'goteo', 'tubería rota']
  disponible BOOLEAN DEFAULT 1,
  ordenes_completadas INTEGER DEFAULT 0,
  rating_promedio REAL DEFAULT 0,
  fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Reportes de trabajo
CREATE TABLE IF NOT EXISTS reportes_trabajo (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  orden_id INTEGER NOT NULL,
  tecnico_id INTEGER NOT NULL,
  descripcion_trabajo TEXT,
  materiales_usados TEXT, -- JSON
  inicio_trabajo DATETIME,
  fin_trabajo DATETIME,
  fotos_antes_despues TEXT, -- JSON array
  firma_cliente TEXT, -- base64 de firma
  firma_tecnico TEXT,
  FOREIGN KEY(orden_id) REFERENCES ordenes(id),
  FOREIGN KEY(tecnico_id) REFERENCES tecnicos(id)
);

-- Historial de cambios
CREATE TABLE IF NOT EXISTS historial (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  tabla TEXT,
  registro_id INTEGER,
  accion TEXT, -- 'INSERT', 'UPDATE', 'DELETE'
  datos_anteriores TEXT, -- JSON
  datos_nuevos TEXT, -- JSON
  usuario TEXT,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Índices para velocidad
CREATE INDEX IF NOT EXISTS idx_orden_cliente ON ordenes(cliente_id);
CREATE INDEX IF NOT EXISTS idx_orden_estado ON ordenes(estado);
CREATE INDEX IF NOT EXISTS idx_orden_fecha ON ordenes(fecha_creacion);
CREATE INDEX IF NOT EXISTS idx_cliente_telefono ON clientes(telefono);

-- Vista: Órdenes próximas (sin resolver)
CREATE VIEW IF NOT EXISTS ordenes_pendientes AS
SELECT o.id, o.cliente_id, c.nombre, c.telefono, o.urgencia, o.estado,
       o.fecha_creacion, o.fecha_programada, o.servicio_asignado
FROM ordenes o
JOIN clientes c ON o.cliente_id = c.id
WHERE o.estado IN ('pendiente', 'asignada', 'en_progreso')
ORDER BY o.urgencia DESC, o.fecha_programada ASC;
`;

db.exec(schema, (err) => {
  if(err) console.error('Schema error:', err);
  else console.log('✓ Schema created');
  
  // Seed: Servicios predeterminados
  db.run(`
    INSERT OR IGNORE INTO servicios (nombre, descripcion, costo_base, tiempo_estimado_minutos, norma_nmx)
    VALUES 
      ('Reparación de fugas', 'Localizar y reparar fugas en tuberías', 300, 60, 'NMX-E-114'),
      ('Cambio de grifería', 'Reemplazo completo de grifo o llave', 150, 45, 'NMX-E-200'),
      ('Destaponamiento', 'Limpieza de desagües y tuberías obstruidas', 200, 30, 'NMX-E-114'),
      ('Reparación tubería rota', 'Reemplazo de sección dañada', 500, 120, 'NMX-E-114'),
      ('Instalación plomería', 'Nuevas instalaciones residenciales', 1000, 240, 'NMX-E-200'),
      ('Mantenimiento preventivo', 'Revisión anual de sistema', 250, 90, 'NMX-E-114')
  `, () => {
    console.log('✓ Servicios seeded');
    db.close(() => {
      console.log('✓ Database ready: butler-crm.db');
      console.log('✓ Run: node butler-crm-server.js');
    });
  });
});
