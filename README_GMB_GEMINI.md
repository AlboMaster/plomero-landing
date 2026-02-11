# GMB + Gemini Integration Guide

## Google My Business (GMB) Fetcher

### What It Does
- Fetches public GMB reviews, Q&As, location info, phone, hours
- Saves to `gmb_exports/` as JSON
- Data feeds directly into interpreter or Butler for analysis

### Setup

1. **Option A: Without API key** (public data only, limited)
   - Just run and let it tell you what's available
   
2. **Option B: With Google Places API key** (recommended)
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Enable "Places API"
   - Create an API key
   - Set env var:
     ```powershell
     $env:GOOGLE_PLACES_API = "<YOUR_KEY>"
     ```

### Usage

```powershell
# Search for your business and fetch reviews
$env:GOOGLE_PLACES_API = "<YOUR_KEY>"
& "C:\Program Files\nodejs\node.exe" gmb-fetcher.js "Plomería Cancún" "Cancún, México"
```

**Output:** `gmb_exports/gmb_Plomeria_Cancun_<timestamp>.json`

Contains: business info, rating, up to 50 reviews, photos metadata

---

## Gemini API Integration for Butler

### What It Does
- **Analyzes customer messages** using Google Gemini AI
- **Generates service recommendations** based on keywords + severity
- **Batch processes GMB reviews** into actionable insights
- **Feeds into Butler** for smarter guidance

### Setup

1. **Get Gemini API Key**
   - Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
   - Create new API key (free tier available)
   - Set env var:
     ```powershell
     $env:GEMINI_API_KEY = "<YOUR_KEY>"
     ```

2. **Usage in Node**
   ```powershell
   $env:GEMINI_API_KEY = "<YOUR_KEY>"
   & "C:\Program Files\nodejs\node.exe" butler-gemini-integration.js
   ```

3. **Usage in Landing Page** (future enhancement)
   - Add `<input id="geminiKey">` to save key locally
   - Call `ButlerGeminiAdvisor` from JS
   - Get real-time AI recommendations in the interpreter UI

### API Methods

```javascript
const advisor = new ButlerGeminiAdvisor();

// Analyze single customer message
await advisor.analyzeCustomerIssue("Hay una fuga...");
// Returns: {problem, services[], urgency, materials, nmxNote}

// Get service recommendation
await advisor.generateServiceRecommendation(['fuga', 'inundación'], 4);
// Returns: {recommendation: "Reemplazo de tubería..."}

// Batch process reviews from GMB
await advisor.batchAnalyzeReviews(gmbReviewsArray);
// Returns: array of {original, analysis} pairs
```

---

## Workflow: GMB → Interpreter → Butler → Gemini

1. **Fetch GMB reviews**
   ```powershell
   node gmb-fetcher.js "Plomería Cancún" "Cancún, México"
   ```

2. **Feed reviews into NMX interpreter**
   - Paste GMB review text into `index-silver.html`
   - Get technical summary + parts list

3. **Enhance with Gemini analysis**
   - Use `ButlerGeminiAdvisor.analyzeCustomerIssue()`
   - Get AI-powered service recommendations

4. **Butler suggests next steps**
   - Which service page to show
   - What parts to mention
   - Urgency level

---

## Example: Full Pipeline

```powershell
# 1. Fetch GMB data (public)
$env:GOOGLE_PLACES_API = "<YOUR_PLACES_KEY>"
node gmb-fetcher.js "Plomería Cancún" "Cancún"

# 2. Analyze first review with Gemini (AI-powered)
$env:GEMINI_API_KEY = "<YOUR_GEMINI_KEY>"
node butler-gemini-integration.js

# 3. In landing page, integrate both:
#    - NMX interpreter (technical translation)
#    - Gemini advisor (AI recommendation)
#    - Export to CSV for team
```

---

## Free Tier Limits

- **Google Places API:** $7/1000 requests (first 100 free/month often = $200 credit)
- **Gemini API:** Free tier: 60 requests/minute, then pay-per-use ($0.075/million tokens input)
- **GMB Fetcher:** Free (no API cost for public data)

---

## Next Steps

1. **Get API keys** (both free-tier eligible)
2. **Test fetchers locally** with sample data
3. **Integrate into landing page UI** for live analysis
4. **Train Butler** on exported review data to improve recommendations

Questions? Check the generated exports in `gmb_exports/` and `fb_exports/`.
