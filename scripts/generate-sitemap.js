#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const services = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/services.json'), 'utf-8'));
const neighborhoods = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/neighborhoods.json'), 'utf-8'));

const SITE_URL = 'https://towingservicequeensnyc.com';
const today = new Date().toISOString().split('T')[0];

// Build all URLs
const urls = [];

// Main pages
urls.push({ loc: `${SITE_URL}/`, priority: 1.0, changefreq: 'daily' });
urls.push({ loc: `${SITE_URL}/about.html`, priority: 0.8, changefreq: 'monthly' });
urls.push({ loc: `${SITE_URL}/contact.html`, priority: 0.8, changefreq: 'monthly' });
urls.push({ loc: `${SITE_URL}/services/`, priority: 0.9, changefreq: 'weekly' });
urls.push({ loc: `${SITE_URL}/neighborhoods/`, priority: 0.9, changefreq: 'weekly' });
urls.push({ loc: `${SITE_URL}/blog/`, priority: 0.9, changefreq: 'weekly' });

// Blog posts
const blogPosts = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/blog-posts.json'), 'utf-8'));
for (const p of blogPosts) {
  urls.push({ loc: `${SITE_URL}/blog/${p.slug}/`, priority: 0.7, changefreq: 'monthly' });
}

// Service pages
for (const s of services) {
  urls.push({ loc: `${SITE_URL}/services/${s.slug}/`, priority: 0.9, changefreq: 'weekly' });
}

// Neighborhood pages (if they exist)
const existingNeighborhoods = [
  'astoria','long-island-city','flushing','jamaica','jackson-heights','forest-hills','bayside','corona','elmhurst','ridgewood','howard-beach','far-rockaway','ozone-park','richmond-hill','woodside','sunnyside','maspeth','middle-village','glendale','woodhaven','queens-village','cambria-heights','st-albans','hollis','laurelton','springfield-gardens','rosedale','bellerose','glen-oaks','floral-park','little-neck','douglaston','whitestone','college-point','bay-terrace','beechhurst','malba','fresh-meadows','kew-gardens','briarwood','rego-park','kew-gardens-hills','hillcrest','jamaica-estates','jamaica-hills','south-jamaica','south-ozone-park','baisley-park','rochdale','hollis-hills','cunningham-heights','addisleigh-park','oakland-gardens','auburndale','pomonok','utopia','murray-hill','north-corona','east-elmhurst','ditmars-steinway','hunters-point','court-square','queensbridge','ravenswood','dutch-kills','blissville','hallets-point','bowery-bay','steinway','old-astoria','linden-hill','lefrak-city','lindenwood','old-howard-beach','hamilton-beach','broad-channel','rockaway-beach','rockaway-park','belle-harbor','neponsit','breezy-point','arverne','edgemere','seaside','north-shore-towers','clearview','bayside-hills','meadowmere','hammels','roxbury','electchester','queensboro-hill','willets-point','brookville'
];

for (const slug of existingNeighborhoods) {
  urls.push({ loc: `${SITE_URL}/neighborhoods/${slug}/`, priority: 0.8, changefreq: 'weekly' });
}

// Service x Location combo pages (1,980)
for (const s of services) {
  for (const n of neighborhoods) {
    urls.push({
      loc: `${SITE_URL}/services/${s.slug}-in-${n.slug}-queens-ny/`,
      priority: 0.7,
      changefreq: 'weekly'
    });
  }
}

console.log(`Total URLs: ${urls.length}`);

// Write single sitemap
const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority.toFixed(1)}</priority>
  </url>`).join('\n')}
</urlset>`;
fs.writeFileSync(path.join(ROOT, 'sitemap.xml'), xml);
console.log(`\n✅ Wrote sitemap.xml with ${urls.length} URLs`);
