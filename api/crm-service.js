/**
 * CRM Backend - Azure Functions + MongoDB/SQL Database
 * Manages: Leads, Affiliates, Backlinks, Orders
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');
const { v4: uuid } = require('uuid');
const emailService = require('./email-service');
const whatsappService = require('./whatsapp-service');

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb+srv://user:pass@cluster.mongodb.net/plomerocancun';
let db = null;

async function connectDB() {
  if (db) return db;
  
  try {
    const client = new MongoClient(MONGO_URI);
    await client.connect();
    db = client.db('plomerocancun');
    console.log('✓ Database connected');
    return db;
  } catch (error) {
    console.error('✗ Database connection error:', error.message);
    throw error;
  }
}

/**
 * LEADS MANAGEMENT
 */
class LeadManager {
  async createLead(data) {
    const database = await connectDB();
    const leadsCollection = database.collection('leads');

    const lead = {
      id: uuid(),
      ...data,
      status: 'new',
      createdAt: new Date(),
      updatedAt: new Date(),
      notes: [],
      attachments: []
    };

    await leadsCollection.insertOne(lead);

    // Send confirmation email to client
    if (lead.email) {
      try {
        await emailService.sendLeadConfirmation(lead);
      } catch (e) {
        console.warn('Email not sent:', e.message);
      }
    }

    // Send alert to technician
    try {
      await emailService.sendTechnicianAlert(lead);
    } catch (e) {
      console.warn('Technician alert not sent:', e.message);
    }

    // Send WhatsApp confirmation
    if (lead.phone) {
      try {
        await whatsappService.sendMessage(
          lead.phone,
          `✅ *Solicitud Recibida*\n\nHola ${lead.name}, hemos recibido tu solicitud de ${lead.service}.\n\n` +
          `Un técnico se contactará contigo en las próximas 2 horas.\n\n` +
          `📞 +52 998 496 0320\n💬 WhatsApp: +52 998 411 4839`
        );
      } catch (e) {
        console.warn('WhatsApp message not sent:', e.message);
      }
    }

    console.log('✓ Lead created:', lead.id);
    return lead;
  }

  async getLead(leadId) {
    const database = await connectDB();
    const leadsCollection = database.collection('leads');
    return await leadsCollection.findOne({ id: leadId });
  }

  async getLeads(filter = {}) {
    const database = await connectDB();
    const leadsCollection = database.collection('leads');
    return await leadsCollection.find(filter).sort({ createdAt: -1 }).toArray();
  }

  async updateLead(leadId, updates) {
    const database = await connectDB();
    const leadsCollection = database.collection('leads');
    
    const result = await leadsCollection.updateOne(
      { id: leadId },
      {
        $set: {
          ...updates,
          updatedAt: new Date()
        }
      }
    );

    console.log('✓ Lead updated:', leadId);
    return result;
  }

  async addNoteToLead(leadId, note) {
    const database = await connectDB();
    const leadsCollection = database.collection('leads');

    const result = await leadsCollection.updateOne(
      { id: leadId },
      {
        $push: {
          notes: {
            id: uuid(),
            text: note,
            createdAt: new Date(),
            by: 'tecnico@plomerocancun.com.mx'
          }
        }
      }
    );

    return result;
  }

  async closeLead(leadId, resolution) {
    return await this.updateLead(leadId, {
      status: 'closed',
      resolution: resolution,
      closedAt: new Date()
    });
  }
}

/**
 * AFFILIATES MANAGEMENT
 */
class AffiliateManager {
  async registerAffiliate(data) {
    const database = await connectDB();
    const affiliatesCollection = database.collection('affiliates');

    const affiliateCode = `PLOM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const affiliate = {
      id: uuid(),
      ...data,
      affiliateCode,
      earnings: 0,
      conversions: 0,
      status: 'active',
      createdAt: new Date(),
      payouts: []
    };

    await affiliatesCollection.insertOne(affiliate);

    // Send welcome email
    if (data.email) {
      try {
        await emailService.sendAffiliateReminder(data.email, affiliateCode, 0);
      } catch (e) {
        console.warn('Affiliate email not sent:', e.message);
      }
    }

    console.log('✓ Affiliate created:', affiliate.id);
    return affiliate;
  }

  async getAffiliate(code) {
    const database = await connectDB();
    const affiliatesCollection = database.collection('affiliates');
    return await affiliatesCollection.findOne({ affiliateCode: code });
  }

  async trackConversion(affiliateCode, amount) {
    const database = await connectDB();
    const affiliatesCollection = database.collection('affiliates');

    const commission = amount * 0.05; // 5% commission

    const result = await affiliatesCollection.updateOne(
      { affiliateCode },
      {
        $inc: { 
          earnings: commission,
          conversions: 1
        }
      }
    );

    console.log(`✓ Conversion tracked: ${affiliateCode} = $${commission}`);
    return result;
  }

  async processPayout(affiliateCode) {
    const database = await connectDB();
    const affiliatesCollection = database.collection('affiliates');

    const payout = {
      id: uuid(),
      amount: 0,
      method: 'mercado-pago',
      status: 'pending',
      createdAt: new Date(),
      processedAt: null
    };

    const result = await affiliatesCollection.updateOne(
      { affiliateCode },
      {
        $push: { payouts: payout },
        $set: { earnings: 0 } // Reset earnings after payout
      }
    );

    console.log('✓ Payout processed for:', affiliateCode);
    return result;
  }
}

/**
 * BACKLINKS MANAGEMENT
 */
class BacklinkManager {
  async registerBacklink(data) {
    const database = await connectDB();
    const backlinksCollection = database.collection('backlinks');

    const backlinkId = `PLM-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    const backlink = {
      id: uuid(),
      ...data,
      backlinkId,
      status: 'pending-verification',
      createdAt: new Date(),
      verifiedAt: null,
      traffic: 0
    };

    await backlinksCollection.insertOne(backlink);
    console.log('✓ Backlink registered:', backlinkId);
    return backlink;
  }

  async verifyBacklink(backlinkId) {
    const database = await connectDB();
    const backlinksCollection = database.collection('backlinks');

    const result = await backlinksCollection.updateOne(
      { backlinkId },
      {
        $set: {
          status: 'verified',
          verifiedAt: new Date()
        }
      }
    );

    console.log('✓ Backlink verified:', backlinkId);
    return result;
  }

  async trackBacklinkClick(backlinkId) {
    const database = await connectDB();
    const backlinksCollection = database.collection('backlinks');

    return await backlinksCollection.updateOne(
      { backlinkId },
      { $inc: { traffic: 1 } }
    );
  }
}

/**
 * ORDERS / WORK MANAGEMENT
 */
class OrderManager {
  async createOrder(leadId, serviceData) {
    const database = await connectDB();
    const ordersCollection = database.collection('orders');

    const order = {
      id: uuid(),
      leadId,
      ...serviceData,
      status: 'scheduled',
      createdAt: new Date(),
      completedAt: null,
      technician: null,
      cost: 0,
      paid: false,
      photos: [],
      video: null,
      feedback: null
    };

    await ordersCollection.insertOne(order);
    console.log('✓ Order created:', order.id);
    return order;
  }

  async updateOrderStatus(orderId, status, notes = '') {
    const database = await connectDB();
    const ordersCollection = database.collection('orders');

    const updates = { status, updatedAt: new Date() };
    if (notes) updates.lastNote = notes;
    if (status === 'completed') updates.completedAt = new Date();

    const result = await ordersCollection.updateOne(
      { id: orderId },
      { $set: updates }
    );

    console.log(`✓ Order status updated: ${orderId} → ${status}`);
    return result;
  }

  async addPhotosToOrder(orderId, photoUrls) {
    const database = await connectDB();
    const ordersCollection = database.collection('orders');

    return await ordersCollection.updateOne(
      { id: orderId },
      {
        $push: {
          photos: {
            $each: photoUrls.map(url => ({
              url,
              uploadedAt: new Date()
            }))
          }
        }
      }
    );
  }

  async getOrdersByStatus(status) {
    const database = await connectDB();
    const ordersCollection = database.collection('orders');
    return await ordersCollection.find({ status }).toArray();
  }
}

/**
 * Export Managers
 */
module.exports = {
  connectDB,
  LeadManager: new LeadManager(),
  AffiliateManager: new AffiliateManager(),
  BacklinkManager: new BacklinkManager(),
  OrderManager: new OrderManager()
};
