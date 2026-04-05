#!/usr/bin/env node
/**
 * One-shot image optimizer. Resizes + compresses + generates WebP.
 * Source WhatsApp photos → optimized JPG + WebP in /images.
 *
 * Run: node scripts/optimize-images.js
 */

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const IMAGES = path.join(ROOT, 'images');
const DOWNLOADS = 'C:\\Users\\endri\\Downloads';

// New WhatsApp photos with semantic names + auto-rotate on by default
const NEW_PHOTOS = [
  { src: 'WhatsApp Image 2026-04-05 at 4.56.49 PM.jpeg',     name: 'minivan-queens-street' },
  { src: 'WhatsApp Image 2026-04-05 at 4.56.49 PM (1).jpeg', name: 'tow-scene-queens-deli' },
  { src: 'WhatsApp Image 2026-04-05 at 4.56.49 PM (2).jpeg', name: 'range-rover-tow' },
  { src: 'WhatsApp Image 2026-04-05 at 4.56.49 PM (3).jpeg', name: 'jeep-flatbed-auto-shop' },
  { src: 'WhatsApp Image 2026-04-05 at 4.56.49 PM (4).jpeg', name: 'orange-sports-car-tow' },
  { src: 'WhatsApp Image 2026-04-05 at 4.56.49 PM (5).jpeg', name: 'bmw-coupe-tow' },
  { src: 'WhatsApp Image 2026-04-05 at 4.56.49 PM (6).jpeg', name: 'chevy-flatbed-intersection' },
  { src: 'WhatsApp Image 2026-04-05 at 5.05.33 PM.jpeg',     name: 'jeep-compass-flatbed' },
  { src: 'WhatsApp Image 2026-04-05 at 5.05.33 PM (1).jpeg', name: 'exotic-supercar-flatbed' },
  { src: 'WhatsApp Image 2026-04-05 at 5.05.33 PM (2).jpeg', name: 'gwagon-flatbed' }
];

// Existing JPGs already in /images that should also get WebP alternates
const EXISTING_JPGS = [
  'tow-truck-queens-street',
  'wheel-lift-dollies',
  'gbp-storefront',
  'flatbed-towing-queens-nyc'
];

const MAX_WIDTH = 1600;
const JPEG_QUALITY = 78;
const WEBP_QUALITY = 72;

async function processPhoto(inputPath, outName) {
  const baseName = path.join(IMAGES, outName);
  const img = sharp(inputPath, { failOn: 'none' }).rotate(); // respect EXIF orientation
  const meta = await img.metadata();

  // Resize if wider than MAX_WIDTH, preserving aspect
  const resized = meta.width > MAX_WIDTH ? img.resize({ width: MAX_WIDTH, withoutEnlargement: true }) : img;

  const jpegOut = baseName + '.jpg';
  const webpOut = baseName + '.webp';

  await resized.clone().jpeg({ quality: JPEG_QUALITY, mozjpeg: true, progressive: true }).toFile(jpegOut);
  await resized.clone().webp({ quality: WEBP_QUALITY }).toFile(webpOut);

  const origSize = fs.statSync(inputPath).size;
  const jpegSize = fs.statSync(jpegOut).size;
  const webpSize = fs.statSync(webpOut).size;
  console.log(`${outName.padEnd(32)} ${(origSize/1024).toFixed(0).padStart(5)}KB → JPG ${(jpegSize/1024).toFixed(0).padStart(4)}KB · WebP ${(webpSize/1024).toFixed(0).padStart(4)}KB`);
}

async function webpOnly(baseName) {
  const jpgPath = path.join(IMAGES, baseName + '.jpg');
  const webpPath = path.join(IMAGES, baseName + '.webp');
  if (!fs.existsSync(jpgPath)) { console.log(`  skip ${baseName} — no jpg`); return; }
  await sharp(jpgPath, { failOn: 'none' }).rotate().webp({ quality: WEBP_QUALITY }).toFile(webpPath);
  const jpg = fs.statSync(jpgPath).size;
  const webp = fs.statSync(webpPath).size;
  console.log(`${baseName.padEnd(32)} existing JPG ${(jpg/1024).toFixed(0)}KB → WebP ${(webp/1024).toFixed(0)}KB`);
}

(async () => {
  console.log('\nProcessing new WhatsApp photos:\n');
  for (const p of NEW_PHOTOS) {
    const inputPath = path.join(DOWNLOADS, p.src);
    if (!fs.existsSync(inputPath)) { console.log(`  SKIP ${p.src} — not found`); continue; }
    await processPhoto(inputPath, p.name);
  }
  console.log('\nGenerating WebP for existing JPGs:\n');
  for (const n of EXISTING_JPGS) await webpOnly(n);
  console.log('\n✅ Done.\n');
})();
