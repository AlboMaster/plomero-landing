// butler-azure-tts.js
// Azure Text-to-Speech integration for Butler (Spanish Mexican voice)
// Reads work orders, client messages, and technical guidance aloud
// Setup: npm install @azure/cognitiveservices-speech

const sdk = require('microsoft-cognitiveservices-speech-sdk');
const fs = require('fs');
const path = require('path');

class ButlerVoice {
  constructor(subscriptionKey, region = 'eastus') {
    const speechConfig = sdk.SpeechConfig.fromSubscription(subscriptionKey, region);
    
    // Spanish Mexican voice - professional and natural
    speechConfig.speechSynthesisVoiceName = 'es-MX-DaliaNeural'; // Female, natural, professional
    // Alternative: 'es-MX-JorgeNeural' (Male, professional)
    
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;
    
    this.speechConfig = speechConfig;
    this.synthesizer = new sdk.SpeechSynthesizer(speechConfig, undefined);
  }

  async speakText(text, options = {}) {
    return new Promise((resolve, reject) => {
      this.synthesizer.speakTextAsync(
        text,
        result => {
          if(result.reason === sdk.ResultReason.SynthesizingAudioCompleted){
            resolve({
              status: 'success',
              audioLength: result.audioData.length,
              message: `Hablado: ${text.substring(0,50)}...`
            });
          } else {
            reject(new Error(`Synthesis failed: ${result.errorDetails}`));
          }
        },
        error => reject(error)
      );
    });
  }

  async speakOrden(ordenObj) {
    const text = `
      Orden número ${ordenObj.id}.
      Cliente: ${ordenObj.nombre || 'Sin nombre'}.
      Teléfono: ${ordenObj.telefono || 'No registrado'}.
      Dirección: ${ordenObj.direccion || 'No especificada'}.
      Servicio: ${ordenObj.servicio_asignado || 'Por determinar'}.
      Urgencia: ${ordenObj.urgencia}.
      ${ordenObj.interpretacion_tecnica ? `Interpretación: ${ordenObj.interpretacion_tecnica}` : ''}
    `;
    return this.speakText(text);
  }

  async speakTecnicianSummary(summary) {
    // Read technical summary aloud for field work
    const text = `
      Resumen técnico.
      ${summary}
      Por favor, revisa fotos y reporta al regresar.
    `;
    return this.speakText(text);
  }

  async streakWarning(message) {
    // Alert voice for urgent issues
    const text = `¡ALERTA! ${message}. Requiere atención inmediata.`;
    return this.speakText(text);
  }

  // Save audio file locally
  async speakToFile(text, filename = 'butler-audio.mp3') {
    return new Promise((resolve, reject) => {
      const audioPath = path.join(__dirname, 'audio', filename);
      
      // Create audio dir if not exist
      if(!fs.existsSync(path.join(__dirname, 'audio'))){
        fs.mkdirSync(path.join(__dirname, 'audio'), {recursive: true});
      }

      const audioConfig = sdk.AudioConfig.fromAudioFileOutput(audioPath);
      const synthesizer = new sdk.SpeechSynthesizer(this.speechConfig, audioConfig);

      synthesizer.speakTextAsync(
        text,
        result => {
          if(result.reason === sdk.ResultReason.SynthesizingAudioCompleted){
            resolve({status: 'saved', path: audioPath});
          } else {
            reject(new Error(result.errorDetails));
          }
        },
        error => reject(error)
      );
    });
  }
}

// Example usage (run: AZURE_SPEECH_KEY=<key> node butler-azure-tts.js)
if(require.main === module){
  const key = process.env.AZURE_SPEECH_KEY;
  if(!key){
    console.error('Missing: set AZURE_SPEECH_KEY env var');
    console.error('Get key from: https://portal.azure.com -> Cognitive Services -> Speech');
    process.exit(1);
  }

  const butler = new ButlerVoice(key);

  // Test voice
  console.log('\n✓ Su Servilleta™ Voice initialized (Spanish Mexican - DaliaNeural)');
  console.log('Testing voice...\n');

  butler.speakText('Hola, soy Su Servilleta. Tu asistente de plomería profesional en Cancún.')
    .then(result => {
      console.log('✓ Voice test successful:', result.message);
    })
    .catch(err => {
      console.error('✗ Voice test failed:', err.message);
    });
}

module.exports = ButlerVoice;
