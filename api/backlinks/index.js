/**
 * Azure Function: Backlink Registration & Generator
 * Endpoint: POST /api/backlinks
 */

const { BacklinkManager } = require('../crm-service');

module.exports = async function (context, req) {
  context.log('🔗 Backlink request received');

  try {
    // Handle POST - register backlink
    if (req.method === 'POST') {
      const { name, website, whatsapp, email } = req.body;

      if (!name || !website) {
        return {
          status: 400,
          body: { success: false, error: 'Name and website URL required' }
        };
      }

      // Validate URL format
      try {
        new URL(website);
      } catch (e) {
        return {
          status: 400,
          body: { success: false, error: 'Invalid website URL' }
        };
      }

      const backlink = await BacklinkManager.registerBacklink({
        name,
        website,
        whatsapp: whatsapp || null,
        email: email || null
      });

      // Generate HTML code for backlink
      const htmlCode = `<!-- @PLOMEROCANCUN Backlink | Code: ${backlink.backlinkId} -->
<div style="background: linear-gradient(135deg, #0a0a0a, #1a1a1a); border: 2px solid #d4d4d4; border-radius: 8px; padding: 1.5rem; text-align: center; margin: 2rem 0; box-shadow: 0 4px 15px rgba(212, 212, 212, 0.2); font-family: Arial, sans-serif;">
  <a href="https://plomerocancun.com.mx?from=${backlink.backlinkId}&affiliate=true" style="display: inline-block; text-decoration: none; color: inherit;">
    <p style="color: #d4d4d4; font-size: 0.9rem; margin: 0 0 0.75rem 0; font-weight: bold;">
      🔧 PLOMERÍA PREMIUM CANCÚN
    </p>
    <div style="background: linear-gradient(135deg, #d4d4d4, #f0f0f0); color: #0a0a0a; padding: 0.8rem 1.5rem; border-radius: 4px; font-weight: 700; display: inline-block;">
      Ver Servicios →
    </div>
    <p style="color: #888; font-size: 0.75rem; margin: 0.75rem 0 0 0; line-height: 1.4;">
      Especialistas en desincrustación y destapes garantizados desde 2005. ⭐ Líder en Cancún.
    </p>
  </a>
</div>`;

      context.log('✓ Backlink registered:', backlink.id);

      return {
        status: 201,
        body: {
          success: true,
          message: 'Backlink registered successfully',
          code: backlink.backlinkId,
          htmlCode: htmlCode,
          instructions: 'Copy the HTML code above and paste it on your website. Contact us after placement.'
        }
      };
    }

    // Handle GET - track backlink click
    if (req.method === 'GET') {
      const code = req.query.code;
      if (code) {
        await BacklinkManager.trackBacklinkClick(code);
      }
    }

    return {
      status: 405,
      body: { error: 'Method not allowed' }
    };
  } catch (error) {
    context.log('✗ Backlink error:', error.message);

    return {
      status: 500,
      body: {
        success: false,
        error: 'Failed to process backlink request',
        details: error.message
      }
    };
  }
};
