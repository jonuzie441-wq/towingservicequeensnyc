#!/usr/bin/env node
/**
 * Google Business Profile Auto-Poster
 * Posts the next weekly update to your GBP listing.
 *
 * Usage:
 *   node scripts/gbp-post.js          — posts the next scheduled post
 *   node scripts/gbp-post.js test     — dry run (shows what would post, doesn't post)
 *   node scripts/gbp-post.js force 5  — force post index 5
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// Load credentials
const envFile = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf-8');
function getEnv(key) {
  const m = envFile.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return m ? m[1].trim() : null;
}

const CLIENT_ID = getEnv('GBP_CLIENT_ID');
const CLIENT_SECRET = getEnv('GBP_CLIENT_SECRET');
const REFRESH_TOKEN = getEnv('GBP_REFRESH_TOKEN');

if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
  console.error('Missing GBP credentials in .env.local. Run: node scripts/gbp-auth.js first.');
  process.exit(1);
}

// Load posts pool
const POSTS = JSON.parse(fs.readFileSync(path.join(__dirname, 'gbp-posts.json'), 'utf-8'));

// Track which post is next
const STATE_FILE = path.join(__dirname, '..', '.gbp-post-state.json');
function getState() {
  try { return JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8')); }
  catch { return { nextIndex: 0, history: [] }; }
}
function saveState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

// HTTP helpers
function httpsPost(hostname, path, headers, body) {
  return new Promise((resolve, reject) => {
    const data = typeof body === 'string' ? body : JSON.stringify(body);
    const req = https.request({
      hostname, path, method: 'POST',
      headers: { ...headers, 'Content-Length': Buffer.byteLength(data) }
    }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, data: b }); }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function httpsGet(hostname, path, headers) {
  return new Promise((resolve, reject) => {
    const req = https.request({ hostname, path, method: 'GET', headers }, res => {
      let b = '';
      res.on('data', c => b += c);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, data: JSON.parse(b) }); }
        catch { resolve({ status: res.statusCode, data: b }); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

// Get fresh access token from refresh token
async function getAccessToken() {
  const body = [
    `refresh_token=${encodeURIComponent(REFRESH_TOKEN)}`,
    `client_id=${encodeURIComponent(CLIENT_ID)}`,
    `client_secret=${encodeURIComponent(CLIENT_SECRET)}`,
    `grant_type=refresh_token`
  ].join('&');

  const res = await httpsPost('oauth2.googleapis.com', '/token',
    { 'Content-Type': 'application/x-www-form-urlencoded' }, body);

  if (res.data.access_token) return res.data.access_token;
  throw new Error('Failed to refresh token: ' + JSON.stringify(res.data));
}

// Find account and location
async function findLocation(token) {
  const auth = { 'Authorization': `Bearer ${token}` };

  // List accounts
  const accts = await httpsGet('mybusinessaccountmanagement.googleapis.com', '/v1/accounts', auth);
  if (!accts.data.accounts || accts.data.accounts.length === 0) {
    throw new Error('No GBP accounts found for this Google account.');
  }

  // Try each account to find locations
  for (const acct of accts.data.accounts) {
    const locRes = await httpsGet('mybusinessbusinessinformation.googleapis.com',
      `/v1/${acct.name}/locations?readMask=name,title,storefrontAddress`, auth);

    if (locRes.data.locations && locRes.data.locations.length > 0) {
      const loc = locRes.data.locations[0]; // First location
      console.log(`  Found: ${loc.title || 'Unknown'} (${loc.name})`);
      return { accountName: acct.name, locationName: loc.name, locationTitle: loc.title };
    }
  }
  throw new Error('No locations found in any GBP account.');
}

// Create a local post
async function createPost(token, locationName, postContent) {
  const auth = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };

  // Build the post body
  const postBody = {
    languageCode: 'en',
    summary: postContent.text,
    topicType: 'STANDARD',
    callToAction: {
      actionType: postContent.cta === 'CALL' ? 'CALL' : 'LEARN_MORE',
      url: postContent.cta === 'CALL' ? undefined : 'https://towingservicequeensnyc.com'
    }
  };

  // Use v4 API for local posts (v1 doesn't support them yet)
  // locationName format: "locations/123456" — need to extract the ID
  const locId = locationName;
  const accountAndLoc = locId.replace('locations/', '');

  const res = await httpsPost('mybusiness.googleapis.com',
    `/v4/${locationName}/localPosts`, auth, postBody);

  return res;
}

// Main
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('test');
  const forceIdx = args.includes('force') ? parseInt(args[args.indexOf('force') + 1]) : null;

  console.log('\n📝 GBP Auto-Poster\n');

  // Determine which post to publish
  const state = getState();
  const postIndex = forceIdx !== null ? forceIdx : state.nextIndex;
  const post = POSTS[postIndex % POSTS.length];

  console.log(`  Post #${postIndex + 1} / ${POSTS.length}`);
  console.log(`  Topic: ${post.topic}`);
  console.log(`  CTA: ${post.cta}`);
  console.log(`  Text: "${post.text.slice(0, 100)}..."\n`);

  if (isDryRun) {
    console.log('  [DRY RUN] Would post the above. Run without "test" to actually post.\n');
    return;
  }

  // Get access token
  console.log('  Getting access token...');
  const token = await getAccessToken();
  console.log('  ✓ Token acquired\n');

  // Find location
  console.log('  Finding your GBP location...');
  const location = await findLocation(token);
  console.log('');

  // Create the post
  console.log('  Publishing post...');
  const result = await createPost(token, location.locationName, post);

  if (result.status === 200 || result.status === 201) {
    console.log('  ✅ Post published successfully!\n');

    // Update state
    state.nextIndex = (postIndex + 1) % POSTS.length;
    state.history.push({
      index: postIndex,
      topic: post.topic,
      postedAt: new Date().toISOString(),
      status: 'success'
    });
    saveState(state);
    console.log(`  Next scheduled post: #${state.nextIndex + 1} (${POSTS[state.nextIndex].topic})\n`);
  } else {
    console.log(`  ❌ Post failed (HTTP ${result.status})`);
    console.log('  Response:', JSON.stringify(result.data, null, 2));

    state.history.push({
      index: postIndex,
      topic: post.topic,
      postedAt: new Date().toISOString(),
      status: 'failed',
      error: result.data
    });
    saveState(state);
  }
}

main().catch(err => {
  console.error('\nFatal error:', err.message);
  process.exit(1);
});
