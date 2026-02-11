# Facebook / Google My Business export helper

This folder contains a small Node utility to export Facebook Page conversations and messages to local JSON files. Use this only with accounts you own and have permission to access.

Files:
- `fb-fetcher.js` — Node script that exports conversations and messages to `fb_exports/`.
- `package.json` — contains the `fetch-fb` script and `node-fetch` dependency.

Quick start (Windows PowerShell):

1. Install dependencies:

```powershell
cd "c:\Users\Administrador\Documents\landing page"
npm install
```

2. Run the fetcher (provide your Page access token):

```powershell
$env:FB_TOKEN = "<YOUR_PAGE_ACCESS_TOKEN>"
node fb-fetcher.js
```

Or pass the token as an argument:

```powershell
node fb-fetcher.js "<YOUR_PAGE_ACCESS_TOKEN>"
```

Notes:
- The token must have permissions to read Page conversations/messages. For production automation consider using a long-lived token or a server with secure storage.
- The script saves files to `fb_exports/` with conversation and messages data.
- If you want automatic parsing (extract attachments/photos and attach to tickets), I can extend the script to download attachments and create CSV orders or push to your ticketing system.
