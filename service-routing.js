/**
 * Service Routing Configuration
 * Maps services to specialized landing pages and API endpoints
 */

const serviceConfigurations = {
  'Cambio de llaves y mangueras': {
    name: 'Cambio de llaves de paso, mangueras, monomandos, vástagos',
    nameEn: 'Shut-off valves, hoses, single-lever faucets',
    page: '/service-faucets.html',
    icon: '🔧',
    price: 'Desde $300',
    guarantee: 'Hermeticidad garantizada 12 meses'
  },
  'Suavización / Descalcificación': {
    name: 'Suavización / Descalcificación',
    nameEn: 'Water Softening / Descaling',
    page: '/service-softening.html',
    icon: '💧',
    price: 'Desde $800',
    guarantee: 'Diagnóstico incluido'
  },
  'Calentadores - Drenado/Desatasco': {
    name: 'Calentadores - Drenado y Desatasco',
    nameEn: 'Water Heaters - Draining & Unclogging',
    page: '/service-heaters.html',
    icon: '🔥',
    price: 'Desde $500',
    guarantee: 'Sin daño al equipo'
  },
  'Reparación Suavizadores y Bombas': {
    name: 'Reparación de equipos de suavizadores y bombas',
    nameEn: 'Softener & Pump Repairs',
    page: '/service-equipment.html',
    icon: '⚙️',
    price: 'Desde $400',
    guarantee: 'Taller electromecánico certificado'
  },
  'Limpieza Tinacos y Cisternas': {
    name: 'Limpieza de tinacos',
    nameEn: 'Tinaco Cleaning',
    page: '/service-tinaco.html',
    icon: '🧼',
    price: '$800 (400L - 1000L)',
    guarantee: 'Sin sarro, reluciente'
  },
  'Cisternas': {
    name: 'Cisternas - limpieza y mantenimiento',
    nameEn: 'Cisterns - Cleaning & Maintenance',
    page: '/service-cistern.html',
    icon: '🏺',
    price: 'Desde $800',
    guarantee: 'Brida Coflex incluida si aplica'
  },
  'Reemplazo cuello de cera': {
    name: 'Cambio de cuello de cera por brida Coflex',
    nameEn: 'Wax Neck Replacement with Coflex',
    page: '/service-coflex.html',
    icon: '🔩',
    price: 'Desde $250',
    guarantee: 'Instalación profesional'
  },
  'Lijado y repintado tanques': {
    name: 'Lijado y repintado de tanques estacionarios',
    nameEn: 'Sanding & Repainting Tanks',
    page: '/service-painting.html',
    icon: '🪚',
    price: 'Desde $1500',
    guarantee: 'Acabado tipo .925 Taxco'
  },
  'Obras negras y renovaciones': {
    name: 'Obras negras, renovaciones y redes hidráulicas',
    nameEn: 'Rough Plumbing & Renovations',
    page: '/service-construction.html',
    icon: '🏗️',
    price: 'Cotización individual',
    guarantee: '100% presupuesto transparente'
  },
  'Impermeabilizaciones': {
    name: 'Impermeabilizaciones y prestaciones adicionales',
    nameEn: 'Waterproofing & Additional Services',
    page: '/service-waterproofing.html',
    icon: '🛡️',
    price: 'Cotización individual',
    guarantee: 'Garantía de 3 años'
  },
  'Desincrustación de Tuberías Obstruidas / Pipe Descaling': {
    name: 'Desincrustación de Tuberías Obstruidas',
    nameEn: 'Pipe Descaling & Unclogging',
    page: '/service-descaling.html',
    icon: '🧼',
    price: 'Diagnóstico gratis',
    guarantee: 'Si no se destapa, NO PAGAS ⭐',
    specialty: true
  }
};

/**
 * Get Service Configuration
 */
function getServiceConfig(serviceName) {
  return serviceConfigurations[serviceName] || {
    name: serviceName,
    nameEn: serviceName,
    page: '/service-general.html',
    icon: '🔧',
    price: 'Cotizar',
    guarantee: 'Profesionalismo garantizado'
  };
}

/**
 * Build Service Page URL with Tracking Parameters
 */
function buildServicePageUrl(leadData) {
  const config = getServiceConfig(leadData.service);
  const baseUrl = config.page;
  
  const params = new URLSearchParams({
    lead_id: leadData.id || 'new',
    service: leadData.service,
    name: leadData.name,
    phone: leadData.phone,
    utm_source: 'website-form',
    utm_medium: 'lead-submission',
    utm_campaign: leadData.service.toLowerCase().replace(/\s+/g, '-')
  });

  return `${baseUrl}?${params.toString()}`;
}

/**
 * Handle Form Submission
 */
async function submitServiceRequest(formData) {
  try {
    // Use environment API base or fallback
    const apiBase = window.API_BASE || '/api';
    
    const response = await fetch(`${apiBase}/leads`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Request failed');
    }

    const result = await response.json();
    return result;
  } catch (error) {
    console.error('✗ Submit error:', error);
    throw error;
  }
}

/**
 * Subscribe to Email List
 */
async function subscribeEmail(email, name) {
  try {
    const apiBase = window.API_BASE || '/api';
    
    const response = await fetch(`${apiBase}/subscribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, name })
    });

    return await response.json();
  } catch (error) {
    console.error('✗ Subscribe error:', error);
    throw error;
  }
}

/**
 * Register Affiliate
 */
async function registerAffiliate(affiliateData) {
  try {
    const apiBase = window.API_BASE || '/api';
    
    const response = await fetch(`${apiBase}/affiliates`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(affiliateData)
    });

    return await response.json();
  } catch (error) {
    console.error('✗ Affiliate registration error:', error);
    throw error;
  }
}

/**
 * Register Backlink
 */
async function registerBacklink(backlinkData) {
  try {
    const apiBase = window.API_BASE || '/api';
    
    const response = await fetch(`${apiBase}/backlinks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(backlinkData)
    });

    return await response.json();
  } catch (error) {
    console.error('✗ Backlink registration error:', error);
    throw error;
  }
}

// Set API base on load
document.addEventListener('DOMContentLoaded', () => {
  const isDev = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
  window.API_BASE = isDev ? 'http://localhost:7071/api' : '/api';
  console.log('📡 API Base:', window.API_BASE);
});
