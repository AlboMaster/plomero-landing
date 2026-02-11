// servilleta-diagnosis.js
// Diagnostic questions for Su Servilleta™ - Professional Plumbing Diagnosis
// Validates problem diagnosis with intelligent multi-step questioning

const DIAGNOSIS_QUESTIONS = {
  inicio: {
    question: "¿Cuál es el problema principal que tiene?",
    options: [
      {text: "💧 Fuga de agua", value: "fuga"},
      {text: "🚿 Baja presión de agua", value: "baja_presion"},
      {text: "🚽 Inodoro con problemas", value: "inodoro"},
      {text: "🔧 Tubería rota/dañada", value: "tuberia_rota"},
      {text: "🌊 Obstrucción/drenaje lento", value: "obstruccion"},
      {text: "💨 Ruidos extraños", value: "ruidos"},
      {text: "🧊 Calentador sin agua caliente", value: "agua_caliente"}
    ]
  },

  fuga: {
    question: "¿Dónde está la fuga?",
    options: [
      {text: "🚿 Grifo/llave", value: "fuga_grifo"},
      {text: "Debajo del fregadero", value: "fuga_fregadero"},
      {text: "🚽 Inodoro", value: "fuga_inodoro"},
      {text: "🛁 Ducha/tina", value: "fuga_ducha"},
      {text: "Tubería visible en pared", value: "fuga_tuberia_pared"},
      {text: "🏠 Bajo tierra/piso", value: "fuga_subterranea"}
    ],
    followUp: {
      fuga_grifo: "¿Hay gotas constantes o tiene presión toda el agua?",
      fuga_fregadero: "¿De dónde sale el agua: las tuberías, la junta o del grifo?",
      fuga_tuberia_pared: "¿Es una gota por minuto o más rápido?",
      fuga_subterranea: "¿Ves humedad en el piso o hay manchas de agua?"
    }
  },

  baja_presion: {
    question: "¿Es baja presión en todo el casa o solo en un grifo?",
    options: [
      {text: "Solo en un grifo", value: "presion_un_grifo"},
      {text: "En toda la casa", value: "presion_toda_casa"},
      {text: "Solo agua caliente tiene baja presión", value: "presion_agua_caliente"}
    ]
  },

  inodoro: {
    question: "¿Cuál es el problema del inodoro?",
    options: [
      {text: "No baja el agua (se va lento)", value: "inodoro_lento"},
      {text: "Usa mucha agua / fluye continuo", value: "inodoro_fugas"},
      {text: "Se destapa constantemente", value: "inodoro_destapado"},
      {text: "Hace ruidos raros", value: "inodoro_ruido"}
    ]
  },

  tuberia_rota: {
    question: "¿Qué tipo de tubería es?",
    options: [
      {text: "PVC blanca (común)", value: "pvc"},
      {text: "Cobre", value: "cobre"},
      {text: "Galvanizada/hierro", value: "galvanizada"},
      {text: "No sé", value: "desconocida"}
    ]
  },

  obstruccion: {
    question: "¿Qué drenaje está obstruido?",
    options: [
      {text: "Fregadero/cocina", value: "obs_cocina"},
      {text: "Baño/lavado", value: "obs_bano"},
      {text: "Ducha/tina", value: "obs_ducha"},
      {text: "Inodoro", value: "obs_inodoro"},
      {text: "Drenaje general (toda la casa)", value: "obs_general"}
    ]
  },

  ruidos: {
    question: "¿Qué tipo de ruido escuchas?",
    options: [
      {text: "Golpes/martilleo", value: "golpes"},
      {text: "Silbido/zumbido", value: "silbido"},
      {text: "Gorgoteo/borboteo", value: "gorgoteo"},
      {text: "Crujidos", value: "crujidos"}
    ]
  },

  agua_caliente: {
    question: "¿Cómo es el problema?",
    options: [
      {text: "No sale agua caliente", value: "sin_agua_caliente"},
      {text: "Sale tibia nada más", value: "tibia"},
      {text: "Tarda mucho en calentar", value: "tarda_calentar"},
      {text: "Sale agua caliente pero se enfría rápido", value: "se_enfria"}
    ]
  }
};

const DIAGNOSIS_RESULTS = {
  fuga_grifo: {
    urgencia: "NORMAL",
    servicio: "Reparación/Cambio de grifo",
    materiales: ["Grifo nuevo", "Teflón", "Llave de paso"],
    costo_estimado: "200-400",
    tecnico_requiere: "Básico",
    tiempo_estimado: "30 minutos"
  },

  fuga_fregadero: {
    urgencia: "NORMAL",
    servicio: "Reparación de tuberías bajo fregadero",
    materiales: ["Tuberías PVC/cobre", "Conectores", "Teflón", "Silicona"],
    costo_estimado: "400-650",
    tecnico_requiere: "Intermedio",
    tiempo_estimado: "60 minutos"
  },

  fuga_tuberia_pared: {
    urgencia: "ALTA",
    servicio: "Reparación urgente de tubería",
    materiales: ["Parches epoxy", "Abrazaderas", "Tuberías"],
    costo_estimado: "600-1200",
    tecnico_requiere: "Avanzado",
    tiempo_estimado: "90 minutos"
  },

  fuga_subterranea: {
    urgencia: "CRÍTICA",
    servicio: "Localización y reparación de fuga subterránea - EMERGENCIA",
    materiales: ["Detector de fugas", "Tuberías", "Excavación"],
    costo_estimado: "1500-3000",
    tecnico_requiere: "Especialista",
    tiempo_estimado: "3-4 horas"
  },

  presion_un_grifo: {
    urgencia: "BAJA",
    servicio: "Limpieza de aerificador/filtro o cambio de grifo",
    materiales: ["Aerificador", "Filtros", "Grifo si es necesario"],
    costo_estimado: "100-300",
    tecnico_requiere: "Básico",
    tiempo_estimado: "20 minutos"
  },

  presion_toda_casa: {
    urgencia: "NORMAL",
    servicio: "Revisión de regulador de presión y tuberías",
    materiales: ["Regulador de presión", "Filtro principal"],
    costo_estimado: "400-800",
    tecnico_requiere: "Intermedio",
    tiempo_estimado: "60 minutos"
  },

  inodoro_lento: {
    urgencia: "NORMAL",
    servicio: "Destapo de inodoro",
    materiales: ["Destapadera", "Químico destapador si es necesario"],
    costo_estimado: "150-300",
    tecnico_requiere: "Básico",
    tiempo_estimado: "30 minutos"
  },

  inodoro_fugas: {
    urgencia: "NORMAL",
    servicio: "Reparación de válvula de fluxómetro/cisterna",
    materiales: ["Válvula nueva", "Sello de hule", "Tornillos"],
    costo_estimado: "300-500",
    tecnico_requiere: "Básico",
    tiempo_estimado: "45 minutos"
  },

  obs_cocina: {
    urgencia: "NORMAL",
    servicio: "Destapo de drenaje de cocina",
    materiales: ["Destapador, sifón limpio, químico"],
    costo_estimado: "150-350",
    tecnico_requiere: "Básico",
    tiempo_estimado: "45 minutos"
  },

  obs_general: {
    urgencia: "CRÍTICA",
    servicio: "Destapo de línea principal - EMERGENCIA",
    materiales: ["Equipos de presión, rooter, soluciones"],
    costo_estimado: "1200-2500",
    tecnico_requiere: "Especialista",
    tiempo_estimado: "2-4 horas"
  },

  agua_caliente_sin: {
    urgencia: "NORMAL",
    servicio: "Reparación/cambio de calentador",
    materiales: ["Calentador nuevo o pieza de repuesto"],
    costo_estimado: "800-2000",
    tecnico_requiere: "Especialista",
    tiempo_estimado: "2 horas"
  }
};

class ServilletaDiagnosis {
  constructor() {
    this.currentStep = "inicio";
    this.answers = {};
    this.diagnosis = null;
  }

  getQuestion() {
    return DIAGNOSIS_QUESTIONS[this.currentStep];
  }

  answerQuestion(answer) {
    this.answers[this.currentStep] = answer;

    // Determine next step
    switch(this.currentStep) {
      case "inicio":
        this.currentStep = answer;
        break;
      case "fuga":
        if(answer === "fuga_grifo") this.diagnosis = DIAGNOSIS_RESULTS.fuga_grifo;
        else if(answer === "fuga_fregadero") this.diagnosis = DIAGNOSIS_RESULTS.fuga_fregadero;
        else if(answer === "fuga_tuberia_pared") this.diagnosis = DIAGNOSIS_RESULTS.fuga_tuberia_pared;
        else if(answer === "fuga_subterranea") this.diagnosis = DIAGNOSIS_RESULTS.fuga_subterranea;
        break;
      case "baja_presion":
        if(answer === "presion_un_grifo") this.diagnosis = DIAGNOSIS_RESULTS.presion_un_grifo;
        else if(answer === "presion_toda_casa") this.diagnosis = DIAGNOSIS_RESULTS.presion_toda_casa;
        break;
      case "inodoro":
        if(answer === "inodoro_lento") this.diagnosis = DIAGNOSIS_RESULTS.inodoro_lento;
        else if(answer === "inodoro_fugas") this.diagnosis = DIAGNOSIS_RESULTS.inodoro_fugas;
        break;
      case "obstruccion":
        if(answer === "obs_cocina") this.diagnosis = DIAGNOSIS_RESULTS.obs_cocina;
        else if(answer === "obs_general") this.diagnosis = DIAGNOSIS_RESULTS.obs_general;
        break;
      case "agua_caliente":
        if(answer === "sin_agua_caliente") this.diagnosis = DIAGNOSIS_RESULTS.agua_caliente_sin;
        break;
    }

    return this.diagnosis ? "complete" : "next";
  }

  getDiagnosis() {
    if(!this.diagnosis) return null;

    return {
      problema: Object.keys(this.answers)[0],
      respuestas: this.answers,
      diagnostico: this.diagnosis,
      timestamp: new Date().toISOString(),
      id_orden: `ORD-${Date.now()}`
    };
  }

  reset() {
    this.currentStep = "inicio";
    this.answers = {};
    this.diagnosis = null;
  }
}

// Export for Node.js and Browser
if(typeof module !== 'undefined' && module.exports) {
  module.exports = ServilletaDiagnosis;
}
