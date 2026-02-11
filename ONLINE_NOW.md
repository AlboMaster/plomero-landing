# 🌐 Get Online Now (Free & Fast)

You don't need to pay for the domain yet! Azure provides a **free, secure URL** automatically (e.g., `https://proud-sea-0abc123.azurestaticapps.net`).

### Step 1: Push to GitHub
Since I've already prepared the code locally, you just need to put it on GitHub:
1. Go to [github.com/new](https://github.com/new) and create a repository named `plomerocancun`.
2. Run these commands in your terminal here:
   ```powershell
   git remote add origin https://github.com/YOUR_USERNAME/plomerocancun.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Deploy to Azure (Free Tier)
1. Go to the [Azure Portal](https://portal.azure.com).
2. Search for **Static Web Apps** and click **Create**.
3. Choose the **Free** plan.
4. Select **GitHub** as the source and pick your `plomerocancun` repo.
5. **Build Presets:** Select `Custom`.
   - **App location:** `/`
   - **Api location:** `api`
   - **Output location:** (leave empty)
6. Click **Review + Create**.

### Step 3: Your Online URL
In about 2 minutes, Azure will give you a "URL" link in the Azure Portal overview. 
- You can share this link **immediately**.
- It has **HTTPS (SSL)** included for free.
- **Later:** When your `plomerocancun.org` or `.com.mx` is ready, you just click "Custom Domains" in Azure and add it.

---
**Status:** Local files are committed and ready for push.
