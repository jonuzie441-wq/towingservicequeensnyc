#!/usr/bin/env node
/**
 * Fetch Google Street View images for each neighborhood.
 * Creates a 600x300 street-level photo per neighborhood and saves to /images/neighborhoods/.
 *
 * Usage: GOOGLE_MAPS_KEY=YOUR_KEY node scripts/fetch-streetview.js
 *
 * After running, use scripts/optimize-images.js to create WebP alternates,
 * then the CSS nth-child rules get replaced with per-neighborhood background images.
 */

const fs = require('fs');
const path = require('path');
const https = require('https');
const sharp = require('sharp');

const API_KEY = process.env.GOOGLE_MAPS_KEY;
if (!API_KEY) {
  console.error('ERROR: Set GOOGLE_MAPS_KEY env variable.\n  GOOGLE_MAPS_KEY=AIza... node scripts/fetch-streetview.js');
  process.exit(1);
}

const ROOT = path.join(__dirname, '..');
const neighborhoods = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/neighborhoods.json'), 'utf-8'));
const OUT_DIR = path.join(ROOT, 'images', 'neighborhoods');

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

const WIDTH = 600;
const HEIGHT = 300;

function fetchImage(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      if (res.statusCode !== 200) return reject(new Error(`HTTP ${res.statusCode}`));
      const chunks = [];
      res.on('data', (c) => chunks.push(c));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

async function processNeighborhood(n, index) {
  // Use the first main street + neighborhood name for a recognizable location
  const location = `${n.streets[0]}, ${n.name}, Queens, NY`;
  const url = `https://maps.googleapis.com/maps/api/streetview?size=${WIDTH}x${HEIGHT}&location=${encodeURIComponent(location)}&fov=90&pitch=5&source=outdoor&key=${API_KEY}`;

  const jpgPath = path.join(OUT_DIR, `${n.slug}.jpg`);
  const webpPath = path.join(OUT_DIR, `${n.slug}.webp`);

  // Skip if already fetched
  if (fs.existsSync(jpgPath)) {
    console.log(`  [${index+1}] ${n.name} — already exists, skipping`);
    return;
  }

  try {
    const buf = await fetchImage(url);

    // Check if Google returned a "no imagery" placeholder (usually a small gray image)
    if (buf.length < 5000) {
      console.log(`  [${index+1}] ${n.name} — no street view available (${buf.length}B), trying ZIP...`);
      // Fallback: use ZIP code as location
      const fallbackUrl = `https://maps.googleapis.com/maps/api/streetview?size=${WIDTH}x${HEIGHT}&location=${encodeURIComponent(n.zip.split(',')[0].trim() + ' Queens NY')}&fov=90&pitch=5&source=outdoor&key=${API_KEY}`;
      const buf2 = await fetchImage(fallbackUrl);
      if (buf2.length < 5000) {
        console.log(`  [${index+1}] ${n.name} — SKIP (no imagery at all)`);
        return;
      }
      await sharp(buf2).jpeg({ quality: 78, mozjpeg: true }).toFile(jpgPath);
      await sharp(buf2).webp({ quality: 72 }).toFile(webpPath);
    } else {
      await sharp(buf).jpeg({ quality: 78, mozjpeg: true }).toFile(jpgPath);
      await sharp(buf).webp({ quality: 72 }).toFile(webpPath);
    }

    const jpgSize = fs.statSync(jpgPath).size;
    const webpSize = fs.statSync(webpPath).size;
    console.log(`  [${index+1}] ${n.name.padEnd(25)} → JPG ${(jpgSize/1024).toFixed(0)}KB · WebP ${(webpSize/1024).toFixed(0)}KB`);
  } catch (err) {
    console.log(`  [${index+1}] ${n.name} — ERROR: ${err.message}`);
  }
}

(async () => {
  console.log(`\nFetching Street View images for ${neighborhoods.length} neighborhoods...\n`);

  // Process sequentially to respect rate limits
  for (let i = 0; i < neighborhoods.length; i++) {
    await processNeighborhood(neighborhoods[i], i);
    // Small delay to be nice to the API
    if (i > 0 && i % 10 === 0) await new Promise(r => setTimeout(r, 500));
  }

  // Count results
  const fetched = fs.readdirSync(OUT_DIR).filter(f => f.endsWith('.jpg')).length;
  console.log(`\n✅ Done. ${fetched} / ${neighborhoods.length} neighborhoods have Street View images.`);
  console.log(`Images saved to: images/neighborhoods/[slug].jpg + .webp`);
  console.log(`\nNext: update CSS to use per-neighborhood backgrounds instead of the 13-photo rotation.`);
})();
