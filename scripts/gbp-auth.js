#!/usr/bin/env node
/**
 * One-time OAuth authorization for Google Business Profile API.
 * Opens browser for login, captures the refresh token, saves it.
 *
 * Usage: node scripts/gbp-auth.js
 *
 * IMPORTANT: Log in with the Gmail that OWNS your Google Business Profile,
 * NOT the Gmail that owns the Cloud project (unless they're the same).
 */

const http = require('http');
const https = require('https');
const fs = require('fs');
const { URL } = require('url');

// Load credentials from .env.local
const envFile = fs.readFileSync('.env.local', 'utf-8');
function getEnv(key) {
  const match = envFile.match(new RegExp(`^${key}=(.+)$`, 'm'));
  return match ? match[1].trim() : null;
}

const CLIENT_ID = getEnv('GBP_CLIENT_ID');
const CLIENT_SECRET = getEnv('GBP_CLIENT_SECRET');
const REDIRECT_URI = getEnv('GBP_REDIRECT_URI') || 'http://localhost:3456/callback';

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing GBP_CLIENT_ID or GBP_CLIENT_SECRET in .env.local');
  process.exit(1);
}

const SCOPES = [
  'https://www.googleapis.com/auth/business.manage'
].join(' ');

// Build authorization URL
const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
  `client_id=${encodeURIComponent(CLIENT_ID)}` +
  `&redirect_uri=${encodeURIComponent(REDIRECT_URI)}` +
  `&response_type=code` +
  `&scope=${encodeURIComponent(SCOPES)}` +
  `&access_type=offline` +
  `&prompt=consent`;

function exchangeCode(code) {
  return new Promise((resolve, reject) => {
    const postData = [
      `code=${encodeURIComponent(code)}`,
      `client_id=${encodeURIComponent(CLIENT_ID)}`,
      `client_secret=${encodeURIComponent(CLIENT_SECRET)}`,
      `redirect_uri=${encodeURIComponent(REDIRECT_URI)}`,
      `grant_type=authorization_code`
    ].join('&');

    const req = https.request({
      hostname: 'oauth2.googleapis.com',
      path: '/token',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': Buffer.byteLength(postData)
      }
    }, (res) => {
      let body = '';
      res.on('data', (c) => body += c);
      res.on('end', () => {
        try { resolve(JSON.parse(body)); }
        catch (e) { reject(new Error('Failed to parse token response: ' + body)); }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// Start local server to catch the OAuth callback
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost:3456');

  if (url.pathname === '/callback') {
    const code = url.searchParams.get('code');
    const error = url.searchParams.get('error');

    if (error) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>Authorization failed</h1><p>Error: ${error}</p>`);
      console.error('\nAuthorization failed:', error);
      server.close();
      process.exit(1);
    }

    if (!code) {
      res.writeHead(400, { 'Content-Type': 'text/html' });
      res.end(`<h1>No authorization code received</h1>`);
      server.close();
      return;
    }

    console.log('\nAuthorization code received. Exchanging for tokens...');

    try {
      const tokens = await exchangeCode(code);

      if (tokens.error) {
        res.writeHead(400, { 'Content-Type': 'text/html' });
        res.end(`<h1>Token exchange failed</h1><p>${tokens.error}: ${tokens.error_description}</p>`);
        console.error('Token error:', tokens.error, tokens.error_description);
        server.close();
        process.exit(1);
      }

      // Save tokens
      const tokenData = {
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        token_type: tokens.token_type,
        expires_in: tokens.expires_in,
        scope: tokens.scope,
        created_at: new Date().toISOString()
      };

      fs.writeFileSync('.gbp-tokens.json', JSON.stringify(tokenData, null, 2));

      // Also append refresh token to .env.local
      let env = fs.readFileSync('.env.local', 'utf-8');
      if (!env.includes('GBP_REFRESH_TOKEN')) {
        env += `\nGBP_REFRESH_TOKEN=${tokens.refresh_token}\n`;
        fs.writeFileSync('.env.local', env);
      }

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <html><body style="font-family:sans-serif;text-align:center;padding:60px;">
          <h1 style="color:#22c55e;">Authorization Successful!</h1>
          <p>Refresh token saved. You can close this window.</p>
          <p style="color:#888;">The GBP poster is now authorized to post on your behalf.</p>
        </body></html>
      `);

      console.log('\n✅ Authorization successful!');
      console.log('   Refresh token saved to .gbp-tokens.json and .env.local');
      console.log('   You can now run: node scripts/gbp-post.js');
      console.log('');

      setTimeout(() => { server.close(); process.exit(0); }, 2000);

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'text/html' });
      res.end(`<h1>Error exchanging token</h1><p>${err.message}</p>`);
      console.error('Exchange error:', err.message);
      server.close();
      process.exit(1);
    }
  } else {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`<html><body style="font-family:sans-serif;text-align:center;padding:60px;">
      <h1>GBP Auth Server</h1>
      <p>Waiting for OAuth callback...</p>
    </body></html>`);
  }
});

server.listen(3456, () => {
  console.log('\n🔐 GBP Authorization Flow');
  console.log('========================\n');
  console.log('A browser window will open. Log in with the Gmail that OWNS your Google Business Profile.\n');
  console.log('Authorization URL:\n');
  console.log(authUrl);
  console.log('\nOpening browser...\n');

  // Try to open browser
  const { exec } = require('child_process');
  const cmd = process.platform === 'win32' ? 'start' :
              process.platform === 'darwin' ? 'open' : 'xdg-open';
  exec(`${cmd} "${authUrl}"`);
});
