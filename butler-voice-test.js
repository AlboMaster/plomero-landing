// butler-voice-test.js
// Quick test: Make Butler speak without the HTTP server
// Usage: set AZURE_SPEECH_KEY=<tu-key> && node butler-voice-test.js

const ButlerVoice = require('./butler-azure-tts');

async function testButlerVoice() {
  const key = process.env.AZURE_SPEECH_KEY;
  
  if(!key) {
    console.error('❌ AZURE_SPEECH_KEY no configurada');
    console.error('\nPara usar voz, primero:');
    console.error('  Windows: set AZURE_SPEECH_KEY=tu-key-aqui');
    console.error('  Mac/Linux: export AZURE_SPEECH_KEY=tu-key-aqui');
    console.error('\nLuego: node butler-voice-test.js');
    process.exit(1);
  }

  console.log('🎤 Inicializando Butler Voice...\n');

  try {
    const butler = new ButlerVoice(key);
    
    // Test 1: Simple greeting
    console.log('📢 Test 1: Presentación de Butler');
    console.log('─'.repeat(50));
    await butler.speakText('Hola, soy Butler, tu asistente de plomería profesional en Cancún.');
    console.log('✓ Butler habló\n');

    // Test 2: Order example
    console.log('📢 Test 2: Lectura de orden de ejemplo');
    console.log('─'.repeat(50));
    const ordenEjemplo = {
      id: 42,
      nombre: 'Juan García',
      telefono: '998-555-1234',
      direccion: 'Calle Principal 123, Departamento 4B, Cancún',
      servicio_asignado: 'Reparación de tubería rota',
      urgencia: 'ALTA',
      interpretacion_tecnica: 'Tubería PVC fracturada bajo fregadero, requiere reemplazo de tramo de 1.5 metros'
    };
    
    await butler.speakOrden(ordenEjemplo);
    console.log('✓ Orden leída\n');

    // Test 3: Technical summary
    console.log('📢 Test 3: Resumen técnico para técnico');
    console.log('─'.repeat(50));
    const resumenTecnico = `
      Problema identificado: Tubería de agua fría está rota en el punto bajo el fregadero de la cocina.
      Causa probable: Corrosión por antigüedad, aproximadamente 15 años de instalación.
      Solución: Reemplazo del tramo defectuoso con tubería PVC de media pulgada.
      Tiempo estimado: 45 minutos.
      Costo estimado: 800 a 1000 pesos mexicanos según complejidad.
      Materiales: Tubería PVC, conectores, cinta de teflón, silicona.
      Notas: Solicitar fotos del área antes de la visita para evaluar accesibilidad.
    `;
    await butler.speakTecnicianSummary(resumenTecnico);
    console.log('✓ Resumen técnico leído\n');

    // Test 4: Urgent alert
    console.log('📢 Test 4: Alerta de urgencia');
    console.log('─'.repeat(50));
    await butler.streakWarning('Inundación reportada en el baño del cliente, orden número 156');
    console.log('✓ Alerta enviada\n');

    console.log('═'.repeat(50));
    console.log('🎉 ¡TODOS LOS TESTS EXITOSOS!');
    console.log('═'.repeat(50));
    console.log('\n✓ Butler está listo para producción\n');
    console.log('Próximos pasos:');
    console.log('  1. node butler-crm-server.js     (inicia servidor CRM con voz)');
    console.log('  2. Abre http://localhost:3000    (dashboard)');
    console.log('  3. Haz clic en botón 🔊 para escuchar órdenes\n');

  } catch(error) {
    console.error('❌ Error en test:', error.message);
    console.error('\nVerifica:');
    console.error('  ✓ Tu Azure Speech API Key es válida (desde Azure Portal)');
    console.error('  ✓ La región está correcta (eastus, southcentralus, etc)');
    console.error('  ✓ Tienes conexión a internet');
    console.error('  ✓ npm install microsoft-cognitiveservices-speech-sdk completado\n');
    process.exit(1);
  }
}

// Run tests
testButlerVoice();
