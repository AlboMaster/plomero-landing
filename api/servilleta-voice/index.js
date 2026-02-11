const sdk = require('microsoft-cognitiveservices-speech-sdk');

module.exports = async function (context, req) {
  context.log('🔊 Servilleta Voice request received');

  const key = process.env.AZURE_SPEECH_KEY;
  if (!key) {
    context.log('✗ AZURE_SPEECH_KEY is missing');
    return {
      status: 500,
      body: {
        success: false,
        error: 'Missing AZURE_SPEECH_KEY environment variable'
      }
    };
  }

  const region = process.env.AZURE_SPEECH_REGION || 'eastus';
  const voiceName = process.env.AZURE_SPEECH_VOICE || 'es-MX-DaliaNeural';
  const rawText = (req.body && req.body.text) ? req.body.text.toString().trim() : '';
  const text = rawText || 'Hola, soy Su Servilleta, tu asistente de plomería premium en Cancún. Dime qué necesitas y lo convierto en una orden lista para el técnico.';

  try {
    const speechConfig = sdk.SpeechConfig.fromSubscription(key, region);
    speechConfig.speechSynthesisVoiceName = voiceName;
    speechConfig.speechSynthesisOutputFormat = sdk.SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3;

    const synthesizer = new sdk.SpeechSynthesizer(speechConfig, undefined);

    const result = await new Promise((resolve, reject) => {
      synthesizer.speakTextAsync(
        text,
        speechResult => {
          synthesizer.close();
          if (speechResult.reason === sdk.ResultReason.SynthesizingAudioCompleted) {
            resolve(speechResult);
          } else {
            reject(new Error(speechResult.errorDetails || 'Speech synthesis failed'));
          }
        },
        error => {
          synthesizer.close();
          reject(error);
        }
      );
    });

    const audioBase64 = Buffer.from(result.audioData).toString('base64');

    context.log('✓ Azure Su Servilleta voice ready');

    return {
      status: 200,
      body: {
        success: true,
        audioBase64,
        prompt: text,
        voice: voiceName
      }
    };
  } catch (error) {
    context.log('✗ Voice error:', error.message);
    return {
      status: 500,
      body: {
        success: false,
        error: error.message || 'Azure speech service error'
      }
    };
  }
};
