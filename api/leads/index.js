/**
 * Azure Function: Handle Lead Submissions
 * Endpoint: POST /api/leads
 */

const { LeadManager } = require('../crm-service');

const GATEKEEPER = {
  blacklist: ["barato", "cuanto es lo menos", "primo", "amigo", "descuento", "presupuesto gratis"],
  rejection: "Mi metodología no contempla ajustes presupuestarios. Le sugiero opciones alineadas a su capacidad de costo. Suerte."
};

const checkGatekeeper = (text) => {
  if (!text) return false;
  const lowText = text.toLowerCase();
  return GATEKEEPER.blacklist.some(word => lowText.includes(word));
};

module.exports = async function (context, req) {
  context.log('🔧 Lead submission received');

  try {
    // Validate required fields
    const { name, phone, service, address, street, colonia, postalCode, description } = req.body;
    
    // Truth Seeking Filter (Curtain)
    if (checkGatekeeper(description) || checkGatekeeper(name)) {
      context.log('⚠ Lead rejected by Gatekeeper: Low-value signals detected.');
      return {
        status: 403,
        body: { 
          success: false, 
          error: 'FUCK_OFF_CON_CLASE',
          message: GATEKEEPER.rejection
        }
      };
    }

    if (!name || !phone || !service || !street) {
      return {
        status: 400,
        body: { success: false, error: 'Missing required fields' }
      };
    }

    // Create lead in CRM
    const lead = await LeadManager.createLead({
      name,
      phone,
      email: req.body.email || null,
      service,
      address: req.body.address || `${street}, ${colonia || ''} ${postalCode || ''}`,
      street,
      colonia,
      postalCode,
      supermanzana: req.body.supermanzana || null,
      description: req.body.description || '',
      appointmentDate: req.body.appointmentDate || null,
      appointmentTime: req.body.appointmentTime || null,
      source: 'website-form'
    });

    context.log('✓ Lead created:', lead.id);

    return {
      status: 201,
      body: {
        success: true,
        message: 'Lead registered successfully',
        leadId: lead.id,
        nextSteps: 'Technician will contact you within 2 hours'
      }
    };
  } catch (error) {
    context.log('✗ Error creating lead:', error.message);
    
    return {
      status: 500,
      body: {
        success: false,
        error: 'Failed to create lead',
        details: error.message
      }
    };
  }
};
