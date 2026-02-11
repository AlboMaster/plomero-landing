/**
 * Azure Function: WhatsApp Webhook Handler
 * Endpoint: POST /api/whatsapp
 */

const whatsappService = require('../whatsapp-service');
const { LeadManager } = require('../crm-service');

module.exports = async function (context, req) {
  context.log('📨 WhatsApp webhook received');

  try {
    // Verify webhook token
    if (req.query['hub.verify_token'] !== process.env.WHATSAPP_VERIFY_TOKEN) {
      return {
        status: 403,
        body: { error: 'Invalid verify token' }
      };
    }

    // Challenge response
    if (req.query['hub.challenge']) {
      return {
        status: 200,
        body: req.query['hub.challenge']
      };
    }

    // Handle incoming message
    if (req.method === 'POST') {
      const body = req.body;
      
      const messageEntry = body.entry?.[0]?.changes?.[0]?.value?.messages?.[0];
      const from = messageEntry?.from;
      const text = messageEntry?.text?.body || '';
      const phoneNumber = messageEntry?.button?.payload || from;

      context.log(`📱 Message from ${from}: ${text}`);

      // Create or update lead from WhatsApp message
      if (text && text.length > 0) {
        try {
          const lead = await LeadManager.createLead({
            name: 'WhatsApp Contact',
            phone: from,
            service: 'Consulta por WhatsApp',
            address: 'Cancún',
            street: 'Por definir',
            colonia: 'Por definir',
            postalCode: '77000',
            description: text,
            source: 'whatsapp-direct'
          });

          // Send acknowledgment
          await whatsappService.sendMessage(
            from,
            `✅ Hemos recibido tu mensaje.\n\nUn técnico se contactará contigo pronto.\n\n📞 +52 998 496 0320`
          );

          context.log('✓ Lead created from WhatsApp:', lead.id);
        } catch (error) {
          context.log('⚠️ Error creating lead from WhatsApp:', error.message);
        }
      }

      // Handle webhook message
      await whatsappService.handleWebhook(body);

      return {
        status: 200,
        body: { success: true, message: 'Webhook processed' }
      };
    }

    return {
      status: 200,
      body: { success: true }
    };
  } catch (error) {
    context.log('✗ WhatsApp webhook error:', error.message);
    
    return {
      status: 500,
      body: { success: false, error: error.message }
    };
  }
};
