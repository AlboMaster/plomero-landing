// butler-gemini-integration.js
// Use Google Gemini API to analyze customer messages and generate smart service recommendations
// Butler can use this to provide AI-powered guidance on what service to suggest

const fetch = require('node-fetch');

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || null;
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

if(!GEMINI_API_KEY){
  console.warn('⚠ GEMINI_API_KEY not set. Set env var to enable Gemini analysis.');
}

class ButlerGeminiAdvisor {
  constructor(){
    this.apiKey = GEMINI_API_KEY;
  }

  async analyzeCustomerIssue(customerMessage){
    if(!this.apiKey){
      return {error: 'GEMINI_API_KEY not configured'};
    }

    const prompt = `Eres un asesor técnico de plomería especializado en la Norma Mexicana de Plomería (NMX).
Un cliente reporta: "${customerMessage}"

Analiza esto y proporciona:
1. Problema principal identificado (en una línea)
2. 3 posibles servicios de plomería que pueden aplicar
3. Nivel de urgencia: BAJA, NORMAL, o ALTA
4. Materiales/herramientas probables necesarios
5. Recomendación NMX relevante si aplica

Responde en JSON.`;

    try{
      const res = await fetch(GEMINI_API, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: prompt}]}],
          generationConfig: {maxOutputTokens: 500}
        })
      });

      if(!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      // Try to extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if(jsonMatch){
        try{
          return JSON.parse(jsonMatch[0]);
        }catch(e){
          return {analysis: text};
        }
      }
      return {analysis: text};
    }catch(err){
      return {error: `Gemini API error: ${err.message}`};
    }
  }

  async generateServiceRecommendation(keywords, severity){
    if(!this.apiKey) return {error: 'GEMINI_API_KEY not configured'};

    const prompt = `Basado en estos signos: ${keywords.join(', ')} con severidad ${severity}/5,
¿cuál es el servicio de plomería más recomendado? En una línea, como técnico mexicano.`;

    try{
      const res = await fetch(GEMINI_API, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
          contents: [{parts: [{text: prompt}]}],
          generationConfig: {maxOutputTokens: 100}
        })
      });

      if(!res.ok) return {error: `HTTP ${res.status}`};
      const data = await res.json();
      return {
        recommendation: data.candidates?.[0]?.content?.parts?.[0]?.text || 'Sin recomendación'
      };
    }catch(err){
      return {error: err.message};
    }
  }

  async batchAnalyzeReviews(reviewsArray){
    const results = [];
    for(const review of reviewsArray){
      const analysis = await this.analyzeCustomerIssue(review.text || review);
      results.push({
        original: review.text || review,
        analysis
      });
      // Rate limit (Gemini API)
      await new Promise(r => setTimeout(r, 500));
    }
    return results;
  }
}

// Export for use in Node or browser
if(typeof module !== 'undefined' && module.exports){
  module.exports = ButlerGeminiAdvisor;
}

// Example usage (run: GEMINI_API_KEY=<key> node butler-gemini-integration.js)
if(require.main === module){
  const advisor = new ButlerGeminiAdvisor();
  const testMessage = 'Hay una fuga bajo el fregadero de la cocina, toda mojada la pared';
  console.log('\n=== Butler + Gemini Analysis ===\n');
  console.log(`Input: "${testMessage}"\n`);
  advisor.analyzeCustomerIssue(testMessage).then(result => {
    console.log('Analysis:', JSON.stringify(result, null, 2));
  }).catch(e => console.error(e));
}
