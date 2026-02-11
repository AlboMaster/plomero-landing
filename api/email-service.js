/**
 * Email Service - Azure Communication Services + SendGrid Integration
 * Handles: tecnico@plomerocancun.com.mx, info@plomerocancun.com.mx
 */

require('dotenv').config();
const nodemailer = require('nodemailer');

// Email Transporter Configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.sendgrid.net',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: 'apikey',
    pass: process.env.SENDGRID_API_KEY || process.env.SMTP_PASSWORD
  }
});

// Email Templates
const emailTemplates = {
  leadConfirmation: (name, service) => ({
    subject: '✅ Solicitud Recibida - @PLOMEROCANCUN',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #d4d4d4;">¡Hola ${name}!</h2>
        <p>Hemos recibido tu solicitud de servicio: <strong>${service}</strong></p>
        <p>Nuestro equipo técnico se pondrá en contacto contigo en las próximas 2 horas.</p>
        <hr style="border: none; border-top: 1px solid #d4d4d4;">
        <p><strong>📞 Operadora:</strong> +52 998 496 0320</p>
        <p><strong>💬 WhatsApp Técnico:</strong> +52 998 411 4839</p>
        <p style="font-size: 12px; color: #888;">© @PLOMEROCANCUN - Plomería Premium desde 2005</p>
      </div>
    `
  }),

  technicianAlert: (lead) => ({
    subject: `🔧 NUEVA SOLICITUD: ${lead.service} - ${lead.name}`,
    html: `
      <div style="font-family: monospace; background: #f5f5f5; padding: 20px; border-radius: 8px;">
        <h3>NUEVA SOLICITUD DE SERVICIO</h3>
        <p><strong>Nombre:</strong> ${lead.name}</p>
        <p><strong>Teléfono:</strong> ${lead.phone}</p>
        <p><strong>Email:</strong> ${lead.email || 'N/A'}</p>
        <p><strong>Servicio:</strong> ${lead.service}</p>
        <p><strong>Ubicación:</strong> ${lead.address}</p>
        <p><strong>Descripción:</strong></p>
        <pre>${lead.description || 'N/A'}</pre>
        <hr>
        <p><a href="https://crm.plomerocancun.com/leads/${lead.id}" style="background: #d4d4d4; color: #000; padding: 10px 20px; text-decoration: none; border-radius: 4px; display: inline-block;">Ver en CRM</a></p>
      </div>
    `
  }),

  affiliateReminder: (code, earnings) => ({
    subject: `💰 Tu Código de Afiliado: ${code} - Ganancias: $${earnings}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Tu Código de Afiliado</h2>
        <p>Tu código es: <code style="background: #f0f0f0; padding: 10px; border-radius: 4px; font-weight: bold;">${code}</code></p>
        <p>Ganancias acumuladas: <strong>$${earnings}</strong></p>
        <p>Próximo pago: <strong>días 2 y 17 vía Mercado Pago</strong></p>
      </div>
    `
  })
};

/**
 * Send Email to Client (Lead Confirmation)
 */
async function sendLeadConfirmation(lead) {
  try {
    const mailOptions = {
      from: `info@plomerocancun.com.mx`,
      to: lead.email,
      ...emailTemplates.leadConfirmation(lead.name, lead.service)
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Lead confirmation sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('✗ Error sending lead confirmation:', error.message);
    throw error;
  }
}

/**
 * Send Alert to Technician
 */
async function sendTechnicianAlert(lead) {
  try {
    const mailOptions = {
      from: `info@plomerocancun.com.mx`,
      to: `tecnico@plomerocancun.com.mx`,
      ...emailTemplates.technicianAlert(lead)
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Technician alert sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('✗ Error sending technician alert:', error.message);
    throw error;
  }
}

/**
 * Send Affiliate Reminder
 */
async function sendAffiliateReminder(email, code, earnings) {
  try {
    const mailOptions = {
      from: `info@plomerocancun.com.mx`,
      to: email,
      ...emailTemplates.affiliateReminder(code, earnings)
    };
    
    const result = await transporter.sendMail(mailOptions);
    console.log('✓ Affiliate reminder sent:', result.messageId);
    return result;
  } catch (error) {
    console.error('✗ Error sending affiliate email:', error.message);
    throw error;
  }
}

/**
 * Test Email Connection
 */
async function testEmailConnection() {
  try {
    await transporter.verify();
    console.log('✓ Email service connected and ready');
    return true;
  } catch (error) {
    console.error('✗ Email service error:', error.message);
    return false;
  }
}

module.exports = {
  sendLeadConfirmation,
  sendTechnicianAlert,
  sendAffiliateReminder,
  testEmailConnection,
  transporter
};
