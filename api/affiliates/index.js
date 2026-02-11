/**
 * Azure Function: Affiliate Registration & Management
 * Endpoint: POST /api/affiliates
 */

const { AffiliateManager } = require('../crm-service');
const emailService = require('../email-service');

module.exports = async function (context, req) {
  context.log('💼 Affiliate request received');

  try {
    // Handle GET - retrieve affiliate data
    if (req.method === 'GET') {
      const code = req.query.code;
      if (!code) {
        return {
          status: 400,
          body: { error: 'Affiliate code required' }
        };
      }

      const affiliate = await AffiliateManager.getAffiliate(code);
      if (!affiliate) {
        return {
          status: 404,
          body: { error: 'Affiliate not found' }
        };
      }

      return {
        status: 200,
        body: {
          code: affiliate.affiliateCode,
          earnings: affiliate.earnings,
          conversions: affiliate.conversions,
          status: affiliate.status
        }
      };
    }

    // Handle POST - register new affiliate
    if (req.method === 'POST') {
      const { name, clientArea, whatsapp, email } = req.body;

      if (!name || !whatsapp) {
        return {
          status: 400,
          body: { success: false, error: 'Name and WhatsApp required' }
        };
      }

      const affiliate = await AffiliateManager.registerAffiliate({
        name,
        clientArea: clientArea || 'Cancún',
        whatsapp,
        email: email || null
      });

      context.log('✓ Affiliate registered:', affiliate.id);

      return {
        status: 201,
        body: {
          success: true,
          message: 'Affiliate registered successfully',
          code: affiliate.affiliateCode,
          earnings: affiliate.earnings
        }
      };
    }

    return {
      status: 405,
      body: { error: 'Method not allowed' }
    };
  } catch (error) {
    context.log('✗ Affiliate error:', error.message);

    return {
      status: 500,
      body: {
        success: false,
        error: 'Failed to process affiliate request',
        details: error.message
      }
    };
  }
};
