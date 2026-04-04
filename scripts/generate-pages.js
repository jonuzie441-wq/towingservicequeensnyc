#!/usr/bin/env node
/**
 * MASSIVE PAGE GENERATOR
 * Generates service+location combo pages (20 services × 99 neighborhoods = 1,980 pages)
 * Each page is 3,000+ words with unique data injection per neighborhood
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const services = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/services.json'), 'utf-8'));
const neighborhoods = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/neighborhoods.json'), 'utf-8'));

const SITE_URL = 'https://towingservicequeensnyc.com';
const PHONE = '(347) 437-0185';
const PHONE_HREF = 'tel:+13474370185';
const BUSINESS_NAME = 'Towing Service Queens NYC';
const BUSINESS_ADDRESS = '155-57 Bayview Ave, Rosedale, NY 11422';

// Helper: random pick from array (deterministic per seed for consistency)
function seedPick(arr, seed) {
  if (!arr || arr.length === 0) return '';
  return arr[seed % arr.length];
}

function seedPickMulti(arr, seed, count) {
  if (!arr || arr.length === 0) return [];
  const result = [];
  for (let i = 0; i < count && i < arr.length; i++) {
    result.push(arr[(seed + i) % arr.length]);
  }
  return result;
}

function escapeHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Generate a unique seed from strings (deterministic)
function seed(a, b) {
  let h = 0;
  const str = a + b;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) | 0;
  return Math.abs(h);
}

// Generate FAQs specific to service+neighborhood
function generateFaqs(service, neighborhood, s) {
  const street1 = seedPick(neighborhood.streets, s);
  const street2 = seedPick(neighborhood.streets, s+1);
  const landmark = seedPick(neighborhood.landmarks, s+2);
  const highway = seedPick(neighborhood.highways, s+3);
  const zip = neighborhood.zip.split(',')[0].trim();

  return [
    {
      q: `How fast can you provide ${service.name.toLowerCase()} in ${neighborhood.name}?`,
      a: `Our ${service.name.toLowerCase()} service arrives in ${neighborhood.name} within 15-30 minutes in most cases. We have tow trucks stationed throughout Queens and we prioritize emergency calls. When you call our dispatch line, we immediately route the nearest available truck to your exact location, whether you're near ${street1}, ${street2}, or anywhere else in the ${neighborhood.name} area. Our response time depends on current traffic conditions and how many active calls we have, but we consistently average well under 30 minutes throughout ${neighborhood.region}.`
    },
    {
      q: `How much does ${service.name.toLowerCase()} cost in ${neighborhood.name}, NY?`,
      a: `${service.name} in ${neighborhood.name} typically ranges from $${service.priceMin} to $${service.priceMax}, depending on your vehicle type, the specific service needed, distance of travel, time of day, and current road conditions. We provide upfront pricing before we begin any work — no hidden fees, no surprise charges. For a precise quote specific to your situation in ${neighborhood.name}, call ${PHONE} and our dispatcher will give you a firm price based on your exact location and needs.`
    },
    {
      q: `Are you available 24/7 in ${neighborhood.name}?`,
      a: `Yes, our ${service.name.toLowerCase()} service operates 24 hours a day, 7 days a week, 365 days a year throughout ${neighborhood.name} and all of Queens. Whether you need help at 3 AM on a Tuesday, during rush hour on the ${highway}, on Christmas morning, or during a snowstorm, we answer every call and dispatch trucks around the clock. Car problems don't follow business hours and neither do we.`
    },
    {
      q: `What areas near ${neighborhood.name} do you serve?`,
      a: `In addition to ${neighborhood.name} (ZIP ${neighborhood.zip}), we serve all surrounding neighborhoods in ${neighborhood.region} and throughout Queens. Our ${service.name.toLowerCase()} service covers every street, highway, and location in the borough. We respond to calls near ${landmark}, along the ${highway}, and throughout ${neighborhood.commercialAreas.split(',')[0]}. No location in Queens is outside our service area.`
    },
    {
      q: `What payment methods do you accept for ${service.name.toLowerCase()} in ${neighborhood.name}?`,
      a: `We accept all major payment methods for ${service.name.toLowerCase()} services in ${neighborhood.name}: cash, credit cards (Visa, Mastercard, American Express, Discover), debit cards, and mobile payment options. For accident recovery and insurance claims, we can bill your insurance company directly. For commercial accounts in ${neighborhood.name}, we offer net 30 invoicing and fleet management billing. Payment is collected when service is completed.`
    },
    {
      q: `Do you handle ${service.vehicleTypes.split(',')[0]} in ${neighborhood.name}?`,
      a: `Absolutely. Our ${service.name.toLowerCase()} service in ${neighborhood.name} handles ${service.vehicleTypes}. We have the proper equipment, training, and experience to safely service every type of vehicle on the road. Whether you're near ${landmark} or anywhere else in ${neighborhood.name}, we can handle your specific vehicle with confidence.`
    },
    {
      q: `Can you provide ${service.name.toLowerCase()} near ${landmark}?`,
      a: `Yes, ${landmark} is in our regular service area. We respond to calls throughout ${neighborhood.name} including locations near ${landmark}, along ${street1}, and throughout the ${neighborhood.character} area. Our drivers know the streets of ${neighborhood.name} and can reach you quickly regardless of your specific location within the neighborhood.`
    },
    {
      q: `What if I need ${service.name.toLowerCase()} on the ${highway}?`,
      a: `We handle calls on the ${highway} and all major highways in the ${neighborhood.region} area. Highway calls require extra safety precautions due to traffic, and our drivers are trained in highway recovery procedures. When you call about a breakdown on the ${highway}, let our dispatcher know your exact location (mile marker, nearest exit, or nearest landmark) and we'll respond with appropriate equipment and safety gear.`
    },
    {
      q: `Do you offer other services besides ${service.name.toLowerCase()} in ${neighborhood.name}?`,
      a: `Yes, in addition to ${service.name.toLowerCase()}, we provide complete towing and roadside assistance services throughout ${neighborhood.name}. Our full service menu includes emergency towing, flatbed towing, heavy duty towing, motorcycle towing, lockout service, jump starts, flat tire changes, fuel delivery, winching and recovery, accident recovery, long distance towing, and more. One call handles whatever automotive emergency you're facing in ${neighborhood.name}.`
    },
    {
      q: `How do I request ${service.name.toLowerCase()} service in ${neighborhood.name}?`,
      a: `Getting ${service.name.toLowerCase()} in ${neighborhood.name} is simple. Call ${PHONE} and tell our dispatcher your exact location (cross streets or address), vehicle information, and what happened. We'll immediately dispatch the nearest appropriate truck and give you an estimated arrival time. You can also chat with our AI dispatcher Ayah directly on our website. Either way, help is on its way within minutes of your call.`
    }
  ];
}

// Build the complete HTML page for a service+location combo
function buildComboPage(service, neighborhood) {
  const s = seed(service.slug, neighborhood.slug);
  const zip = neighborhood.zip;
  const zipFirst = zip.split(',')[0].trim();
  const streets = neighborhood.streets;
  const landmarks = neighborhood.landmarks;
  const highways = neighborhood.highways;
  const street1 = seedPick(streets, s);
  const street2 = seedPick(streets, s+1);
  const street3 = seedPick(streets, s+2);
  const landmark1 = seedPick(landmarks, s);
  const landmark2 = seedPick(landmarks, s+1);
  const highway1 = seedPick(highways, s);
  const highway2 = seedPick(highways, s+1) || highway1;

  const title = `${service.name} in ${neighborhood.name}, Queens NY | ${BUSINESS_NAME}`;
  const metaDesc = `Need ${service.name.toLowerCase()} in ${neighborhood.name}, Queens NY ${zipFirst}? 24/7 fast response in 15-30 min. Call ${PHONE} for ${service.short.toLowerCase()} near ${landmark1}.`;
  const url = `${SITE_URL}/services/${service.slug}-in-${neighborhood.slug}-queens-ny`;
  const h1 = `${service.name} in ${neighborhood.name}, Queens NY`;

  const faqs = generateFaqs(service, neighborhood, s);

  // Schema markup
  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        "name": `${service.name} in ${neighborhood.name}, Queens NY`,
        "description": `${service.description} in ${neighborhood.name}, Queens, NY ${zip}`,
        "provider": {
          "@type": "TowingService",
          "@id": `${SITE_URL}/#business`,
          "name": BUSINESS_NAME,
          "telephone": "+1-347-437-0185",
          "url": SITE_URL,
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "155-57 Bayview Ave",
            "addressLocality": "Rosedale",
            "addressRegion": "NY",
            "postalCode": "11422",
            "addressCountry": "US"
          }
        },
        "areaServed": {
          "@type": "Place",
          "name": `${neighborhood.name}, Queens, NY`,
          "address": {
            "@type": "PostalAddress",
            "addressLocality": neighborhood.name,
            "addressRegion": "NY",
            "postalCode": zipFirst
          }
        },
        "offers": {
          "@type": "Offer",
          "priceRange": `$${service.priceMin}-$${service.priceMax}`,
          "priceCurrency": "USD"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type":"ListItem","position":1,"name":"Home","item":SITE_URL+"/"},
          {"@type":"ListItem","position":2,"name":"Services","item":SITE_URL+"/services/"},
          {"@type":"ListItem","position":3,"name":service.name,"item":SITE_URL+"/services/"+service.slug+"/"},
          {"@type":"ListItem","position":4,"name":neighborhood.name+", Queens","item":url}
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {"@type":"Answer","text":f.a}
        }))
      }
    ]
  };

  // Build massive unique content
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDesc)}">
<meta name="keywords" content="${service.keywords.join(', ')}, ${neighborhood.name} towing, tow truck ${neighborhood.name}, ${service.slug} ${neighborhood.slug}, towing ${zipFirst}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="geo.region" content="US-NY">
<meta name="geo.placename" content="${neighborhood.name}, Queens, New York">
<meta name="geo.position" content="40.637306;-73.744994">
<meta name="ICBM" content="40.637306, -73.744994">

<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(metaDesc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${BUSINESS_NAME}">
<meta property="og:image" content="${SITE_URL}/images/flatbed-towing-queens-nyc.jpg">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(metaDesc)}">
<meta name="twitter:image" content="${SITE_URL}/images/flatbed-towing-queens-nyc.jpg">

<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/premium.css">

<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>

<!-- Top Bar -->
<div class="top-bar" style="background:#111;padding:8px 0;font-size:0.85rem;">
  <div class="container" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
    <span style="color:#999;">24/7 ${service.name} — ${neighborhood.name}, Queens NY</span>
    <div style="display:flex;gap:12px;align-items:center;">
      <a href="javascript:void(0)" onclick="window.ayahOpen()" style="color:#d4a017;font-weight:600;text-decoration:none;border:1px solid #d4a017;padding:4px 14px;border-radius:4px;font-size:0.8rem;">CHAT WITH LIVE AGENT</a>
      <a href="${PHONE_HREF}" style="color:#fff;font-weight:600;text-decoration:none;background:#d4a017;padding:4px 14px;border-radius:4px;font-size:0.8rem;">CALL NOW</a>
    </div>
  </div>
</div>

<!-- Header -->
<header class="header">
  <div class="container">
    <a href="/" class="logo">
      <div class="logo-icon">T</div>
      <div class="logo-text">Towing Service<br>Queens NYC<span>24/7 Emergency Towing</span></div>
    </a>
    <nav class="nav">
      <button class="menu-toggle" aria-label="Menu"><span></span><span></span><span></span></button>
      <ul class="nav-list">
        <li><a href="/">Home</a></li>
        <li class="nav-dropdown"><a href="/services/">Services</a></li>
        <li class="nav-dropdown"><a href="/neighborhoods/">Service Areas</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
    <div class="header-cta"><a href="${PHONE_HREF}">&#9742; ${PHONE}</a></div>
  </div>
</header>

<!-- Breadcrumbs -->
<nav aria-label="Breadcrumb" style="background:#f8f8f8;padding:12px 0;font-size:0.85rem;border-bottom:1px solid #eee;">
  <div class="container">
    <a href="/" style="color:#666;">Home</a> &rsaquo;
    <a href="/services/" style="color:#666;">Services</a> &rsaquo;
    <a href="/services/${service.slug}/" style="color:#666;">${service.name}</a> &rsaquo;
    <span style="color:#d4a017;font-weight:600;">${neighborhood.name}, Queens</span>
  </div>
</nav>

<!-- Hero -->
<section class="hero">
  <div class="hero-bg">
    <img src="/images/flatbed-towing-queens-nyc.jpg" alt="${service.name} in ${neighborhood.name} Queens NY - ${BUSINESS_NAME}" style="width:100%;height:100%;object-fit:cover;opacity:0.35;" loading="eager">
  </div>
  <div class="container">
    <div class="hero-label">${service.name} &middot; ${neighborhood.name} &middot; Queens NY</div>
    <h1><em>${service.name}<br>in <span class="accent">${neighborhood.name}, NYC</span></em></h1>
    <p>Need ${service.name.toLowerCase()} in ${neighborhood.name}? We provide fast, professional ${service.short.toLowerCase()} service throughout ${neighborhood.name} (ZIP ${zipFirst}) 24 hours a day, 7 days a week. Our ${neighborhood.character} expertise and knowledge of local streets like ${street1} and ${street2} means we arrive fast and handle the job right the first time.</p>
    <div class="hero-buttons">
      <a href="${PHONE_HREF}" class="btn btn-primary btn-cta">Call ${PHONE}</a>
      <a href="javascript:void(0)" onclick="window.ayahOpen()" class="btn btn-outline">💬 Chat with Live Agent</a>
    </div>
    <div class="google-badge" style="margin-top:20px;">
      <span class="rating">4.9</span>
      <span class="stars">&#9733;&#9733;&#9733;&#9733;&#9733;</span>
      <span class="label">Google Customer Reviews</span>
    </div>
    <div class="hero-stats">
      <div class="hero-stat"><div class="hero-stat-number">15-30</div><div class="hero-stat-label">Minute Response in ${neighborhood.name}</div></div>
      <div class="hero-stat"><div class="hero-stat-number">24/7</div><div class="hero-stat-label">Always Available</div></div>
      <div class="hero-stat"><div class="hero-stat-number">${zipFirst}</div><div class="hero-stat-label">Service ZIP Code</div></div>
      <div class="hero-stat"><div class="hero-stat-number">$${service.priceMin}+</div><div class="hero-stat-label">Starting Price</div></div>
    </div>
  </div>
</section>

<!-- Main Content -->
<section class="section">
  <div class="container" style="max-width:900px;">

    <h2>Professional ${service.name} Services Throughout ${neighborhood.name}, Queens</h2>
    <p style="font-size:1.1rem;line-height:1.85;color:#444;margin-bottom:20px;">${service.intro} When you need ${service.name.toLowerCase()} specifically in ${neighborhood.name}, you need a company that knows the streets, understands the ${neighborhood.character}, and can navigate quickly to your exact location. Our drivers work in ${neighborhood.name} every single day and know every shortcut, every one-way street, and every landmark from ${landmark1} to ${landmark2}.</p>

    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${neighborhood.name} is a ${neighborhood.character} in the ${neighborhood.region} section of Queens. The neighborhood covers ZIP codes ${zip} and includes major streets like ${streets.slice(0,4).join(', ')}. Whether you're stranded near ${landmark1}, broken down on ${street1}, or need service anywhere in the ${neighborhood.commercialAreas.split(',')[0]} area, our ${service.name.toLowerCase()} team responds fast with the right equipment for the job.</p>

    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Every ${service.name.toLowerCase()} call in ${neighborhood.name} is different. You might be a commuter who broke down on the ${highway1} during rush hour. You might be a resident whose car won't start in your driveway on ${street2}. You might be visiting ${landmark1} and discovered a problem when you returned to your vehicle. Whatever brought you to this page, we have the experience, equipment, and local knowledge to help you right now in ${neighborhood.name}.</p>

    <h2>Why ${neighborhood.name} Residents Choose Our ${service.name} Service</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${service.whyNeeded}</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">In ${neighborhood.name} specifically, residents face unique challenges that make professional ${service.name.toLowerCase()} essential. The ${neighborhood.residentialFeatures} mean that many homes have limited parking and narrow access. The proximity to ${highway1} brings highway-speed incidents that require immediate response. The ${neighborhood.commercialAreas.split(',')[0]} area sees heavy traffic during business hours, and the residential streets around ${street1} and ${street3} can be busy during morning and evening rush hours. We understand these local conditions and plan our routes accordingly.</p>

    <h2>Our ${service.name} Equipment and Process in ${neighborhood.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;"><strong>Professional Equipment:</strong> ${service.equipment}. Every piece of equipment is maintained to the highest standards and inspected regularly. When we arrive in ${neighborhood.name}, we bring the right tools for your specific situation.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;"><strong>Step by Step Process:</strong> ${service.process}. This process has been refined over thousands of calls throughout Queens, including countless visits to ${neighborhood.name}. We handle each call with the same level of professionalism whether you're on ${street1}, near ${landmark2}, or anywhere else in the area.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;"><strong>Vehicles We Service:</strong> ${service.vehicleTypes}. Every vehicle type that drives through ${neighborhood.name} is a vehicle we can help. Our drivers are trained on multiple vehicle types and our equipment accommodates everything from small sedans to large commercial vehicles.</p>

    <h2>Streets and Landmarks We Serve in ${neighborhood.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Our ${service.name.toLowerCase()} service covers every street and location in ${neighborhood.name}, Queens. We respond to calls throughout the neighborhood, with regular service to these specific locations:</p>
    <ul style="font-size:1.05rem;line-height:1.9;color:#444;margin-bottom:20px;padding-left:20px;">
      ${streets.map(s => `<li><strong>${s}</strong> — complete ${service.name.toLowerCase()} coverage along this corridor</li>`).join('')}
    </ul>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Beyond the main streets, we regularly respond to calls at these landmarks and points of interest in ${neighborhood.name}:</p>
    <ul style="font-size:1.05rem;line-height:1.9;color:#444;margin-bottom:20px;padding-left:20px;">
      ${landmarks.map(l => `<li><strong>${l}</strong> — fast response for any automotive emergency near this location</li>`).join('')}
    </ul>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">We also handle calls on the major highways serving ${neighborhood.name}: ${highways.join(', ')}. Highway calls require special safety procedures and faster response times, and our drivers are specifically trained for these situations.</p>

    <h2>Transparent ${service.name} Pricing in ${neighborhood.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Our ${service.name.toLowerCase()} service in ${neighborhood.name} starts at $${service.priceMin} and can go up to $${service.priceMax} depending on your specific situation. Price factors include:</p>
    <ul style="font-size:1.05rem;line-height:1.9;color:#444;margin-bottom:20px;padding-left:20px;">
      <li><strong>Distance:</strong> Local service within ${neighborhood.name} and surrounding areas costs less than long-distance transports</li>
      <li><strong>Vehicle type:</strong> Standard sedans cost less than SUVs, luxury vehicles, or commercial trucks</li>
      <li><strong>Time of day:</strong> Late night and early morning calls may have slightly higher rates</li>
      <li><strong>Weather conditions:</strong> Severe weather can affect pricing due to increased safety requirements</li>
      <li><strong>Equipment needed:</strong> Some situations require specialized equipment like flatbeds or heavy-duty wreckers</li>
      <li><strong>Service complexity:</strong> Simple jobs cost less than complex recoveries or multi-step services</li>
    </ul>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">We believe in transparent pricing. Before we begin any work in ${neighborhood.name}, we'll tell you exactly what the service will cost. No hidden fees, no surprise charges, no bait-and-switch pricing. Call ${PHONE} for a firm quote specific to your situation in ${neighborhood.name}.</p>

    <h2>Common ${service.name} Scenarios in ${neighborhood.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Here are the most common ${service.name.toLowerCase()} situations we handle in ${neighborhood.name}: ${service.scenarios}. Each scenario requires specific expertise and equipment, and our team has seen them all. Whether your situation matches one of these common scenarios or is something more unusual, we can help.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Last month alone, we handled dozens of ${service.name.toLowerCase()} calls in ${neighborhood.name} ranging from simple roadside assistance to complex recoveries. Our drivers know how to navigate the ${neighborhood.character} efficiently and can reach most locations in the area within 15-20 minutes of dispatch.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Beyond ${service.name.toLowerCase()}, we provide complete automotive emergency services in ${neighborhood.name}. If you called for ${service.name.toLowerCase()} but your situation turns out to require a different service, we can handle it on the spot. This saves you time, money, and the hassle of calling multiple companies.</p>

    <h2>Licensed, Insured, and Trusted in ${neighborhood.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We are fully licensed, bonded, and insured to provide ${service.name.toLowerCase()} services throughout New York City, including ${neighborhood.name}. Our drivers are professionally trained, background checked, and experienced in ${service.name.toLowerCase()} procedures. When you hire us, you're protected by comprehensive insurance coverage that protects your vehicle during service.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We work with all major insurance companies and can bill your insurance directly for accident-related services in ${neighborhood.name}. If you need documentation for insurance claims, we provide detailed reports that insurance adjusters need. This makes the claims process faster and smoother during an already stressful time.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Our reputation is built on providing reliable, honest service throughout Queens. We maintain a 4.9 out of 5 star rating from hundreds of satisfied customers across all neighborhoods we serve. When ${neighborhood.name} residents need ${service.name.toLowerCase()}, they know they can count on us.</p>

    <h2>About ${neighborhood.name}, Queens NY</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${neighborhood.name} is located in ${neighborhood.region} with ZIP codes ${zip}. The neighborhood is known as a ${neighborhood.character} and features ${neighborhood.residentialFeatures}. Major commercial areas include ${neighborhood.commercialAreas}. The neighborhood is bordered and connected by major roadways including ${highways.join(', ')}.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Key landmarks and points of interest in ${neighborhood.name} include ${landmarks.join(', ')}. These locations see thousands of visitors and residents daily, which means automotive emergencies can happen anywhere. We know ${neighborhood.name} intimately because we respond to calls here constantly.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">The main streets that define ${neighborhood.name} — ${streets.slice(0,5).join(', ')} — are all within our regular service area. Whether you need ${service.name.toLowerCase()} on a busy commercial street or a quiet residential block, we can reach you fast.</p>

    <h2>Frequently Asked Questions: ${service.name} in ${neighborhood.name}</h2>
    ${faqs.map(f => `
    <div style="margin-bottom:24px;padding:20px;background:#fff;border:1px solid #eee;border-radius:12px;">
      <h3 style="font-size:1.1rem;margin-bottom:12px;color:#0a0a0a;">${escapeHtml(f.q)}</h3>
      <p style="font-size:1rem;line-height:1.75;color:#555;">${escapeHtml(f.a)}</p>
    </div>`).join('')}

    <h2>Call Now for ${service.name} in ${neighborhood.name}</h2>
    <p style="font-size:1.1rem;line-height:1.85;color:#444;margin-bottom:20px;">Don't wait. Every minute you're stranded is a minute lost, a minute of stress, a minute of risk. Call us now for ${service.name.toLowerCase()} service anywhere in ${neighborhood.name}, Queens. Our dispatcher will answer immediately, get your information, and send the nearest truck directly to your location.</p>
    <div style="text-align:center;padding:40px;background:linear-gradient(135deg,#0a0a0a,#1a1a1a);border-radius:16px;margin:30px 0;">
      <p style="color:#fff;font-size:1.2rem;margin-bottom:20px;">Need ${service.name} in ${neighborhood.name} right now?</p>
      <a href="${PHONE_HREF}" style="display:inline-block;background:linear-gradient(135deg,#d4a017,#b8860b);color:#0a0a0a;padding:20px 40px;border-radius:100px;font-size:1.5rem;font-weight:800;text-decoration:none;">&#9742; Call ${PHONE}</a>
      <p style="color:#999;margin-top:16px;font-size:0.9rem;">24/7 dispatch &middot; 15-30 minute response &middot; Licensed &amp; insured</p>
    </div>

    <h2>Related ${neighborhood.name} Towing Services</h2>
    <p style="font-size:1rem;line-height:1.75;color:#555;margin-bottom:15px;">Need a different service in ${neighborhood.name}? We offer these related services:</p>
    <ul style="font-size:1rem;line-height:1.9;color:#d4a017;margin-bottom:30px;padding-left:20px;">
      ${services.filter(x=>x.slug!==service.slug).slice(0,8).map(x => `<li><a href="/services/${x.slug}-in-${neighborhood.slug}-queens-ny" style="color:#d4a017;">${x.name} in ${neighborhood.name}</a></li>`).join('')}
    </ul>

    <h2>${service.name} in Nearby Queens Neighborhoods</h2>
    <p style="font-size:1rem;line-height:1.75;color:#555;margin-bottom:15px;">We also provide ${service.name.toLowerCase()} in these nearby Queens neighborhoods:</p>
    <ul style="font-size:1rem;line-height:1.9;color:#d4a017;margin-bottom:30px;padding-left:20px;">
      ${neighborhoods.filter(n=>n.slug!==neighborhood.slug && n.region===neighborhood.region).slice(0,8).map(n => `<li><a href="/services/${service.slug}-in-${n.slug}-queens-ny" style="color:#d4a017;">${service.name} in ${n.name}</a></li>`).join('')}
    </ul>

  </div>
</section>

<!-- Footer -->
<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <h3><span style="color:#d4a017;">Towing Service</span> Queens NYC</h3>
        <p style="margin-bottom:16px;font-size:0.9rem;color:#999;">Queens' most trusted 24/7 towing and roadside assistance company. Professional service throughout ${neighborhood.name} and all of Queens.</p>
        <div style="display:flex;align-items:center;gap:8px;margin:8px 0;"><span>&#128205;</span><a href="https://www.google.com/maps/place/Jonuzi+Towing/" target="_blank" rel="noopener" style="color:#ccc;">155-57 Bayview Ave, Rosedale, NY 11422</a></div>
        <div style="display:flex;align-items:center;gap:8px;margin:8px 0;"><span>&#128222;</span><a href="${PHONE_HREF}" style="color:#d4a017;font-weight:700;">${PHONE}</a></div>
      </div>
      <div>
        <h3>Quick Links</h3>
        <ul class="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/services/">All Services</a></li>
          <li><a href="/neighborhoods/">All Areas</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h3>Popular Services</h3>
        <ul class="footer-links">
          ${services.slice(0,6).map(x => `<li><a href="/services/${x.slug}/">${x.name}</a></li>`).join('')}
        </ul>
      </div>
      <div>
        <h3>Follow Us</h3>
        <div style="display:flex;gap:12px;margin-top:8px;">
          <a href="https://www.facebook.com/profile.php?id=61582313440260" target="_blank" rel="noopener" style="color:#fff;">FB</a>
          <a href="https://www.instagram.com/jonuzitowing/" target="_blank" rel="noopener" style="color:#fff;">IG</a>
          <a href="https://www.youtube.com/channel/UCOM6eHY6etVHo-Oq43pqk3Q" target="_blank" rel="noopener" style="color:#fff;">YT</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2026 ${BUSINESS_NAME}. All Rights Reserved. | 155-57 Bayview Ave, Rosedale, NY 11422 | <a href="${PHONE_HREF}">${PHONE}</a></p>
    </div>
  </div>
</footer>

<div class="mobile-call-bar"><a href="${PHONE_HREF}">&#128222; Tap to Call ${PHONE}</a></div>

<script src="/js/main.js"></script>
<script src="/js/analytics.js"></script>
<script src="/js/ayah-chat.js"></script>
<script src="/js/tawkto.js"></script>
</body>
</html>`;
  return html;
}

// ============ GENERATE ALL PAGES ============
console.log(`\n🚀 Starting generation...`);
console.log(`Services: ${services.length}`);
console.log(`Neighborhoods: ${neighborhoods.length}`);
console.log(`Total combo pages: ${services.length * neighborhoods.length}\n`);

let count = 0;
let wordCountSum = 0;
const startTime = Date.now();

for (const service of services) {
  for (const neighborhood of neighborhoods) {
    const html = buildComboPage(service, neighborhood);
    const dirName = `${service.slug}-in-${neighborhood.slug}-queens-ny`;
    const dir = path.join(ROOT, 'services', dirName);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(path.join(dir, 'index.html'), html);
    count++;

    // Word count check on first few
    if (count <= 3) {
      const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
      const words = text.split(' ').length;
      wordCountSum += words;
      console.log(`[${count}] ${service.name} in ${neighborhood.name} - ${words} words`);
    } else if (count % 100 === 0) {
      console.log(`[${count}] Generated ${count} pages...`);
    }
  }
}

const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
console.log(`\n✅ Generated ${count} pages in ${elapsed}s`);
console.log(`Average word count (sample): ${Math.round(wordCountSum/3)} words`);
console.log(`\nAll pages written to /services/[service]-in-[neighborhood]-queens-ny/index.html`);
