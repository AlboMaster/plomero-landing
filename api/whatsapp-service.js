/**
 * WhatsApp Business API Integration
 * Uses: Twilio or Meta WhatsApp Business API
 * Endpoints: tech@wa, orders, gallery
 */

require('dotenv').config();
const axios = require('axios');

// Use Twilio by default (easier setup than Meta)
const WHATSAPP_API = process.env.WHATSAPP_API_PROVIDER || 'twilio'; // 'twilio' or 'meta'

class WhatsAppService {
  constructor() {
    if (WHATSAPP_API === 'twilio') {
      this.accountSid = process.env.TWILIO_ACCOUNT_SID;
      this.authToken = process.env.TWILIO_AUTH_TOKEN;
      this.fromNumber = process.env.TWILIO_WHATSAPP_NUMBER || '+1234567890';
      this.baseUrl = 'https://api.twilio.com/2010-04-01';
    } else {
      this.accessToken = process.env.META_WHATSAPP_API_TOKEN;
      this.phoneNumberId = process.env.META_PHONE_NUMBER_ID;
      this.businessAccountId = process.env.META_BUSINESS_ACCOUNT_ID;
      this.baseUrl = 'https://graph.instagram.com/v17.0';
    }
  }

  /**
   * Send Text Message
   */
  async sendMessage(toNumber, message, context = {}) {
    try {
      if (WHATSAPP_API === 'twilio') {
        return await this._sendTwilio(toNumber, message, context);
      } else {
        return await this._sendMeta(toNumber, message, context);
      }
    } catch (error) {
      console.error('✗ WhatsApp message error:', error.message);
      throw error;
    }
  }

  /**
   * Send Media (Photo, Video)
   */
  async sendMedia(toNumber, mediaUrl, caption, mediaType = 'image') {
    try {
      if (WHATSAPP_API === 'twilio') {
        return await this._sendMediaTwilio(toNumber, mediaUrl, caption, mediaType);
      } else {
        return await this._sendMediaMeta(toNumber, mediaUrl, caption, mediaType);
      }
    } catch (error) {
      console.error('✗ WhatsApp media error:', error.message);
      throw error;
    }
  }

  /**
   * Send Interactive Message (Buttons)
   */
  async sendInteractiveMessage(toNumber, message, buttons) {
    try {
      const buttonList = buttons.map((btn, idx) => ({
        id: `btn_${idx}`,
        title: btn.text
      }));

      const payload = {
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'interactive',
        interactive: {
          type: 'button',
          body: { text: message },
          action: {
            buttons: buttonList
          }
        }
      };

      const response = await axios.post(
        `${this.baseUrl}/${this.phoneNumberId}/messages`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${this.accessToken}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('✓ Interactive message sent:', response.data.messages[0].id);
      return response.data;
    } catch (error) {
      console.error('✗ Interactive message error:', error.message);
      throw error;
    }
  }

  /**
   * Twilio Implementation
   */
  async _sendTwilio(toNumber, message, context) {
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    
    const response = await axios.post(
      `${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`,
      {
        From: `whatsapp:${this.fromNumber}`,
        To: `whatsapp:${toNumber}`,
        Body: message
      },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    console.log('✓ Twilio message sent:', response.data.sid);
    return response.data;
  }

  async _sendMediaTwilio(toNumber, mediaUrl, caption, mediaType) {
    const auth = Buffer.from(`${this.accountSid}:${this.authToken}`).toString('base64');
    
    const response = await axios.post(
      `${this.baseUrl}/Accounts/${this.accountSid}/Messages.json`,
      {
        From: `whatsapp:${this.fromNumber}`,
        To: `whatsapp:${toNumber}`,
        MediaUrl: mediaUrl,
        Body: caption || '📸 Media'
      },
      {
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    return response.data;
  }

  /**
   * Meta WhatsApp API Implementation
   */
  async _sendMeta(toNumber, message, context) {
    const response = await axios.post(
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: toNumber,
        type: 'text',
        text: { body: message }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    console.log('✓ Meta WhatsApp message sent:', response.data.messages[0].id);
    return response.data;
  }

  async _sendMediaMeta(toNumber, mediaUrl, caption, mediaType) {
    const response = await axios.post(
      `${this.baseUrl}/${this.phoneNumberId}/messages`,
      {
        messaging_product: 'whatsapp',
        to: toNumber,
        type: mediaType,
        [mediaType]: {
          link: mediaUrl,
          caption: caption
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json'
        }
      }
    );

    return response.data;
  }

  /**
   * Handle Incoming Messages (Webhook)
   */
  async handleWebhook(body) {
    try {
      const message = body.entry[0].changes[0].value.messages?.[0];
      
      if (!message) return;

      const from = message.from;
      const text = message.text?.body || '';

      console.log(`📨 Message from ${from}: ${text}`);

      // Route to appropriate handler
      if (text.toLowerCase().includes('cotiz') || text.toLowerCase().includes('precio')) {
        return this._handlePricingRequest(from);
      } else if (text.toLowerCase().includes('urgente') || text.toLowerCase().includes('emergency')) {
        return this._handleEmergency(from);
      } else if (text.toLowerCase().includes('afiliad') || text.toLowerCase().includes('affiliate')) {
        return this._handleAffiliateEnquiry(from);
      }

      return { success: true, message: 'Webhook received' };
    } catch (error) {
      console.error('✗ Webhook error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async _handlePricingRequest(fromNumber) {
    const response = await this.sendMessage(
      fromNumber,
      `💰 *Cotización de Servicios*\n\n` +
      `Nuestros servicios comienzan desde:\n` +
      `🧼 Limpieza tinacos: $800\n` +
      `💨 Presión de agua: diagnóstico gratis\n` +
      `⚙️ Desincrustación: garantizada\n\n` +
      `¿Cuál es tu problema específico?`
    );
    return response;
  }

  async _handleEmergency(fromNumber) {
    const response = await this.sendMessage(
      fromNumber,
      `🚨 *EMERGENCIA DETECTADA*\n\n` +
      `Un técnico se contactará contigo en menos de 15 minutos.\n` +
      `Operadora: +52 998 496 0320\n` +
      `Técnico: +52 998 411 4839`
    );
    return response;
  }

  async _handleAffiliateEnquiry(fromNumber) {
    const response = await this.sendMessage(
      fromNumber,
      `💼 *PROGRAMA DE AFILIADOS*\n\n` +
      `Gana 5% de comisión en cada servicio.\n` +
      `Pagos días 2 y 17 vía Mercado Pago.\n\n` +
      `¿Interesado? Envía tu nombre y WhatsApp.`
    );
    return response;
  }
}

module.exports = new WhatsAppService();
