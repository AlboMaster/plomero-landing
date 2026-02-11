// gmb-fetcher.js
// Fetch public Google My Business data (reviews, Q&As, photos, location info)
// For public listings, no API key needed; uses Google Places API or direct scraping
// Usage: node gmb-fetcher.js "<BUSINESS_NAME>" "<LOCATION>"

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const outDir = path.resolve(__dirname, 'gmb_exports');
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});

// If you have a Google Places API key, set GOOGLE_PLACES_API
const PLACES_API_KEY = process.env.GOOGLE_PLACES_API || null;
const PLACES_API = 'https://maps.googleapis.com/maps/api/place';

async function fetchJson(url, headers={}){
  const res = await fetch(url, {headers});
  if(!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText}`);
  return res.json();
}

async function searchPlace(businessName, location){
  if(!PLACES_API_KEY){
    console.warn('⚠ No GOOGLE_PLACES_API key set. Public scraping not implemented yet.');
    console.warn('  Set: $env:GOOGLE_PLACES_API = "<YOUR_KEY>" and try again.');
    return null;
  }
  const query = `${businessName} ${location}`;
  const url = `${PLACES_API}/textsearch/json?query=${encodeURIComponent(query)}&key=${PLACES_API_KEY}`;
  const data = await fetchJson(url);
  return data.results && data.results.length > 0 ? data.results[0] : null;
}

async function fetchPlaceDetails(placeId){
  if(!PLACES_API_KEY) return null;
  const url = `${PLACES_API}/details/json?place_id=${placeId}&fields=name,formatted_address,photos,rating,review,opening_hours,website,formatted_phone_number&key=${PLACES_API_KEY}`;
  return fetchJson(url);
}

async function fetchReviews(placeId){
  if(!PLACES_API_KEY) return [];
  const url = `${PLACES_API}/details/json?place_id=${placeId}&fields=reviews&key=${PLACES_API_KEY}`;
  const data = await fetchJson(url);
  return data.result && data.result.reviews ? data.result.reviews : [];
}

async function run(){
  const businessName = process.argv[2] || 'Plomería Cancún';
  const location = process.argv[3] || 'Cancún, México';

  console.log(`\n=== Google My Business Fetcher ===`);
  console.log(`Searching for: "${businessName}" in "${location}"\n`);

  try{
    const place = await searchPlace(businessName, location);
    if(!place){
      console.error('No place found. Provide business name and location as args:');
      console.error('  node gmb-fetcher.js "Business Name" "City, Country"');
      process.exit(1);
    }

    console.log(`✓ Found: ${place.name}`);
    console.log(`  Rating: ${place.rating || 'N/A'}`);
    console.log(`  Address: ${place.formatted_address}`);

    const details = await fetchPlaceDetails(place.place_id);
    const reviews = await fetchReviews(place.place_id);

    const gmbData = {
      place: place,
      details: details.result || null,
      reviews: reviews.slice(0, 50), // first 50 reviews
      fetched_at: new Date().toISOString()
    };

    const filename = path.join(outDir, `gmb_${businessName.replace(/\s+/g,'_')}_${Date.now()}.json`);
    fs.writeFileSync(filename, JSON.stringify(gmbData, null, 2), 'utf8');

    console.log(`\n✓ Exported ${reviews.length} reviews to: ${filename}`);
    console.log(`  Use this for: interpreter input, Butler training, sentiment analysis\n`);
  }catch(err){
    console.error('Error:', err.message);
    console.error('\nTip: If you have a Google Places API key, set it:');
    console.error('  $env:GOOGLE_PLACES_API = "<YOUR_KEY>"');
    process.exit(2);
  }
}

run();
