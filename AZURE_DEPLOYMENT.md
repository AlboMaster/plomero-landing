# 🚀 Azure Deployment Guide - @PLOMEROCANCUN

## Quick Start: Deploy to Azure Static Web Apps

### Prerequisites
- Azure Account
- GitHub Repository
- Node.js (optional, for testing)

### Step 1: Create Azure Static Web Apps Resource

```bash
# Via Azure Portal
1. Go to https://portal.azure.com
2. Create "Static Web App"
3. Fill in:
   - Resource Group: create new (e.g., "plomerocancun-prod")
   - Name: plomerocancun (or desired subdomain)
   - Region: East US or nearest
   - Pricing Tier: Free (sufficient for this use case)
   - GitHub: Authorize & select your repo
   - Build Presets: Custom
   - App location: /
   - API location: (leave blank if no backend)
   - Output location: (leave blank)
```

### Step 2: GitHub Setup

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: plomerocancun website"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/plomerocancun.git
   git push -u origin main
   ```

2. **GitHub Secrets:**
   - Azure will auto-generate `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - This appears in the workflow file automatically

### Step 3: Verify Deployment

Once deployed:
- ✅ Azure provides a staging URL (e.g., `https://xxxxxx.azurestaticapps.net`)
- ✅ Custom domain: `https://plomerocancun.com.mx` (configure in Azure > Custom domains)
- ✅ HTTPS automatic
- ✅ CDN included

### Step 4: Optional - Backend API Integration

To connect with your existing backend services (Butler, CRM, WhatsApp):

**Create `api/` folder with Azure Functions:**

```
api/
├── leads/
│   └── function_app.py
├── whatsapp/
│   └── function_app.py
└── voice/
    └── function_app.py
```

Deploy as Azure Functions + Static Web Apps integration.

---

## 📋 Configuration Files Included

- **staticwebapp.config.json** — Routing & middleware config
- **.github/workflows/azure-static-web-apps-deploy.yml** — Auto-deploy on push

---

## 🔗 Custom Domain Setup

```
1. Azure Portal > plomerocancun Static Web App
2. Custom domains
3. Add domain: plomerocancun.com.mx
4. Verify with CNAME record:
   plomerocancun.com.mx CNAME ashyskies-abc123.azurestaticapps.net
```

---

## 💰 Pricing

- **Static Web App (Free tier):** $0/month
  - 100 GB bandwidth
  - Standard Performance
  - 1 custom domain

- **If adding backend (optional):** ~$0.20/million requests (Functions)

---

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| 404 on refresh | Already configured in `staticwebapp.config.json` |
| CORS errors | Add API routes to config file |
| Slow loading | Enable CDN caching (automatic) |
| Deploy fails | Check GitHub token permissions |

---

## 📞 Support

- Azure Support: https://support.microsoft.com/azure
- Static Web Apps Docs: https://docs.microsoft.com/azure/static-web-apps/

**Ready? Let's deploy! 🎉**
