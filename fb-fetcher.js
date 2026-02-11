// fb-fetcher.js
// Simple Node script to export Facebook Page conversations/messages to local JSON files.
// Usage:
// 1) Install deps: npm install
// 2) Run: set FB_TOKEN=YOUR_PAGE_ACCESS_TOKEN && node fb-fetcher.js
// The token must have the correct permissions to read conversations/messages.

const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');

const FB_API = 'https://graph.facebook.com/v17.0';
const TOKEN = process.env.FB_TOKEN || process.argv[2];

if(!TOKEN){
  console.error('Missing FB token. Set FB_TOKEN env var or pass token as first arg.');
  process.exit(1);
}

const outDir = path.resolve(__dirname, 'fb_exports');
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});

async function fetchJson(url){
  const res = await fetch(url);
  if(!res.ok) throw new Error(`HTTP ${res.status} ${res.statusText} for ${url}`);
  return res.json();
}

async function listConversations(){
  const url = `${FB_API}/me/conversations?access_token=${TOKEN}&fields=participants,updated_time,link&limit=50`;
  const data = await fetchJson(url);
  return data;
}

async function fetchMessages(convoId){
  const url = `${FB_API}/${convoId}/messages?access_token=${TOKEN}&fields=message,created_time,from,attachments{media,filename,target},sticker&limit=200`;
  const data = await fetchJson(url);
  return data;
}

async function run(){
  try{
    console.log('Listing conversations...');
    const convos = await listConversations();
    const items = convos.data || [];
    console.log(`Found ${items.length} conversations (page info may be paginated).`);

    const summary = [];
    for(const c of items){
      const cid = c.id;
      console.log('Fetching messages for conversation', cid);
      let msgs = null;
      try{
        msgs = await fetchMessages(cid);
      }catch(e){
        console.warn('Failed to fetch messages for', cid, e.message);
        continue;
      }
      const filename = path.join(outDir, `convo_${cid}.json`);
      fs.writeFileSync(filename, JSON.stringify({conversation:c, messages:msgs}, null, 2), 'utf8');
      summary.push({id:cid,file:filename,messages: (msgs.data||[]).length});
    }

    const summaryFile = path.join(outDir, `summary_${Date.now()}.json`);
    fs.writeFileSync(summaryFile, JSON.stringify({fetched:summary, timestamp:new Date().toISOString()}, null,2), 'utf8');
    console.log('Done. Exports saved to', outDir);
    console.log('Summary:', summaryFile);
  }catch(err){
    console.error('Error during fetch:', err.message);
    process.exit(2);
  }
}

run();
