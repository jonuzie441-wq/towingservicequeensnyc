#!/usr/bin/env node
/**
 * Generate upgraded service pages (3,000+ words each)
 * Replaces the original /services/[slug]/index.html files
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const services = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/services.json'), 'utf-8'));
const neighborhoods = JSON.parse(fs.readFileSync(path.join(ROOT, 'data/neighborhoods.json'), 'utf-8'));
const { SAME_AS, AGGREGATE_RATING, REVIEWS, GBP_URL } = require('./business-data.js');

const SITE_URL = 'https://towingservicequeensnyc.com';
const PHONE = '(347) 437-0185';
const PHONE_HREF = 'tel:+13474370185';
const BUSINESS_NAME = 'Towing Service Queens NYC';

function escapeHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

const HERO_MAP = {
  'emergency-towing': '/images/tow-scene-queens-deli.jpg',
  'accident-recovery': '/images/chevy-flatbed-intersection.jpg',
  'flatbed-towing': '/images/bmw-coupe-tow.jpg',
  'heavy-duty-towing': '/images/hero-heavy.svg',
  'commercial-towing': '/images/hero-heavy.svg',
  'construction-equipment-towing': '/images/hero-heavy.svg',
  'motorcycle-towing': '/images/hero-motorcycle.svg',
  'lockout-service': '/images/hero-lockout.svg',
  'jump-start-service': '/images/hero-jumpstart.svg',
  'flat-tire-change': '/images/hero-tire.svg',
  'fuel-delivery': '/images/hero-fuel.svg',
  'winching-recovery': '/images/hero-winching.svg',
  'off-road-recovery': '/images/hero-winching.svg',
  'long-distance-towing': '/images/jeep-compass-flatbed.jpg',
  'auto-transport': '/images/jeep-flatbed-auto-shop.jpg',
  'roadside-assistance': '/images/minivan-queens-street.jpg',
  'junk-car-removal': '/images/hero-junkcar.svg',
  'exotic-car-towing': '/images/exotic-supercar-flatbed.jpg',
  'wheel-lift-towing': '/images/wheel-lift-dollies.jpg',
  'dolly-towing': '/images/wheel-lift-dollies.jpg'
};

function buildServicePage(service) {
  const title = `${service.name} in Queens NY | 24/7 ${service.short} | ${PHONE}`;
  const metaDesc = `Professional ${service.name.toLowerCase()} throughout Queens NY. 24/7 service, 15-30 minute response, fair pricing. Serving all 99+ neighborhoods. Call ${PHONE} now.`;
  const url = `${SITE_URL}/services/${service.slug}/`;
  const heroImage = HERO_MAP[service.slug] || '/images/tow-truck-queens-street.jpg';
  const heroWebp = heroImage.endsWith('.svg') ? null : heroImage.replace(/\.jpg$/, '.webp');

  const faqs = [
    {
      q: `How much does ${service.name.toLowerCase()} cost in Queens?`,
      a: `${service.name} in Queens typically ranges from $${service.priceMin} to $${service.priceMax}. The exact price depends on your vehicle type, distance, time of day, and specific situation. We provide upfront pricing with no hidden fees. Call ${PHONE} for a precise quote.`
    },
    {
      q: `How fast can you provide ${service.name.toLowerCase()} service?`,
      a: `Our ${service.name.toLowerCase()} service responds to most Queens locations within 15-30 minutes. We operate 24 hours a day, 7 days a week, and we have trucks positioned throughout the borough to ensure fast response times in every neighborhood.`
    },
    {
      q: `Do you provide ${service.name.toLowerCase()} in all Queens neighborhoods?`,
      a: `Yes, we provide ${service.name.toLowerCase()} throughout every neighborhood in Queens including Astoria, Long Island City, Flushing, Jamaica, Forest Hills, Bayside, Howard Beach, Far Rockaway, and 90+ other neighborhoods. No location in Queens is outside our service area.`
    },
    {
      q: `What payment methods do you accept?`,
      a: `We accept cash, all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, and mobile payments. For accident-related services, we can bill your insurance company directly. Commercial accounts can set up invoicing.`
    },
    {
      q: `Are you licensed and insured for ${service.name.toLowerCase()}?`,
      a: `Yes, we are fully licensed, bonded, and insured to provide ${service.name.toLowerCase()} services in New York City. Our drivers are professionally trained and background checked. Your vehicle is protected by comprehensive insurance throughout the service.`
    },
    {
      q: `What equipment do you use for ${service.name.toLowerCase()}?`,
      a: `For ${service.name.toLowerCase()}, we use ${service.equipment}. All equipment is professionally maintained and inspected regularly to ensure safe, damage-free service. We bring the right equipment for your specific situation every time.`
    },
    {
      q: `What vehicles can you handle?`,
      a: `Our ${service.name.toLowerCase()} service handles ${service.vehicleTypes}. Whether you drive a standard sedan, luxury vehicle, commercial truck, or specialty vehicle, we have the equipment and expertise to service it properly.`
    },
    {
      q: `Do you offer emergency ${service.name.toLowerCase()} at night?`,
      a: `Absolutely. We provide ${service.name.toLowerCase()} 24 hours a day, 365 days a year. Late night, early morning, weekends, holidays — we're always available. Automotive emergencies don't wait for business hours and neither do we.`
    },
    {
      q: `Can you handle multiple vehicles at once?`,
      a: `Yes, for commercial accounts and fleet operators, we can dispatch multiple trucks simultaneously for ${service.name.toLowerCase()} jobs. If you manage a fleet or need multi-vehicle service, let our dispatcher know and we'll coordinate accordingly.`
    },
    {
      q: `How do I request ${service.name.toLowerCase()} service?`,
      a: `Call ${PHONE} and tell our dispatcher your location, vehicle info, and situation. We immediately send the nearest truck and give you an ETA. You can also chat with our AI dispatcher Ayah on the website. Help arrives fast.`
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Service",
        "@id": `${url}#service`,
        "name": `${service.name} in Queens NY`,
        "description": service.description,
        "provider": {
          "@type": "TowingService",
          "@id": `${SITE_URL}/#business`,
          "name": BUSINESS_NAME,
          "telephone": "+1-347-437-0185",
          "url": SITE_URL,
          "sameAs": SAME_AS,
          "hasMap": GBP_URL
        },
        "areaServed": {
          "@type": "City",
          "name": "Queens, NY"
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
          {"@type":"ListItem","position":3,"name":service.name,"item":url}
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

  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<script async src="https://www.googletagmanager.com/gtag/js?id=G-897CFT6D36"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-897CFT6D36');</script>
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDesc)}">
<meta name="keywords" content="${service.keywords.join(', ')}, Queens NY, 24/7 ${service.slug}">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="geo.region" content="US-NY">
<meta name="geo.placename" content="Queens, New York">
<meta name="geo.position" content="40.637306;-73.744994">
<meta name="ICBM" content="40.637306, -73.744994">

<meta property="og:type" content="website">
<meta property="og:title" content="${escapeHtml(title)}">
<meta property="og:description" content="${escapeHtml(metaDesc)}">
<meta property="og:url" content="${url}">
<meta property="og:site_name" content="${BUSINESS_NAME}">
<meta property="og:image" content="${SITE_URL}${heroImage}">

<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${escapeHtml(title)}">
<meta name="twitter:description" content="${escapeHtml(metaDesc)}">
<meta name="twitter:image" content="${SITE_URL}${heroImage}">

<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Playfair+Display:wght@600;700;800&display=swap">
<link rel="stylesheet" href="/css/style.css">
<link rel="stylesheet" href="/css/premium.css">

<script type="application/ld+json">${JSON.stringify(schema)}</script>
</head>
<body>

<div class="top-bar" style="background:#111;padding:8px 0;font-size:0.85rem;">
  <div class="container" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
    <span style="color:#999;">24/7 ${service.name} — All Queens, NY</span>
    <div style="display:flex;gap:12px;align-items:center;">
      <a href="javascript:void(0)" onclick="window.ayahOpen()" style="color:#d4a017;font-weight:600;text-decoration:none;border:1px solid #d4a017;padding:4px 14px;border-radius:4px;font-size:0.8rem;">CHAT WITH LIVE AGENT</a>
      <a href="${PHONE_HREF}" style="color:#fff;font-weight:600;text-decoration:none;background:#d4a017;padding:4px 14px;border-radius:4px;font-size:0.8rem;">CALL NOW</a>
    </div>
  </div>
</div>

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
        <li><a href="/blog/">Blog</a></li>
        <li><a href="/about.html">About</a></li>
        <li><a href="/contact.html">Contact</a></li>
      </ul>
    </nav>
    <div class="header-cta"><a href="${PHONE_HREF}">&#9742; ${PHONE}</a></div>
  </div>
</header>

<nav aria-label="Breadcrumb" style="background:#f8f8f8;padding:12px 0;font-size:0.85rem;border-bottom:1px solid #eee;">
  <div class="container">
    <a href="/" style="color:#666;">Home</a> &rsaquo;
    <a href="/services/" style="color:#666;">Services</a> &rsaquo;
    <span style="color:#d4a017;font-weight:600;">${service.name}</span>
  </div>
</nav>

<section class="hero">
  <div class="hero-bg">
    ${heroWebp ? `<picture><source srcset="${heroWebp}" type="image/webp"><img src="${heroImage}" alt="${service.name} in Queens NY - ${BUSINESS_NAME}" style="width:100%;height:100%;object-fit:cover;opacity:0.45;" loading="eager"></picture>` : `<img src="${heroImage}" alt="${service.name} in Queens NY - ${BUSINESS_NAME}" style="width:100%;height:100%;object-fit:cover;opacity:0.35;" loading="eager">`}
  </div>
  <div class="container">
    <div class="hero-label">${service.name} &middot; Queens NY</div>
    <h1><em><span class="accent">${service.name}</span><br>in Queens, NYC</em></h1>
    <p>${service.description}. Fast response, fair pricing, professional service throughout all 99+ Queens neighborhoods. Call ${PHONE} for immediate help, day or night.</p>
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
      <div class="hero-stat"><div class="hero-stat-number">15-30</div><div class="hero-stat-label">Minute Response</div></div>
      <div class="hero-stat"><div class="hero-stat-number">24/7</div><div class="hero-stat-label">Always Available</div></div>
      <div class="hero-stat"><div class="hero-stat-number">99+</div><div class="hero-stat-label">Neighborhoods</div></div>
      <div class="hero-stat"><div class="hero-stat-number">$${service.priceMin}+</div><div class="hero-stat-label">Starting Price</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:900px;">

    <h2>Professional ${service.name} Services Throughout Queens, NY</h2>
    <p style="font-size:1.1rem;line-height:1.85;color:#444;margin-bottom:20px;">${service.intro}</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Queens is New York City's largest borough by area, covering 109 square miles and home to over 2.4 million residents across 99+ neighborhoods. From the high-rise waterfront of Long Island City to the quiet residential streets of Douglaston, from the commercial hub of Jamaica to the beaches of the Rockaway Peninsula, Queens presents unique challenges for ${service.name.toLowerCase()}. Our drivers know every corner of the borough and respond fast to any location.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Our ${service.name.toLowerCase()} service has been serving Queens residents and visitors for years. We've handled thousands of calls in every neighborhood, from routine jobs to complex emergencies. That experience means when you call us, you get a professional team that knows exactly what to do, whether you're on the BQE, parked near JFK Airport, or stuck in a Jamaica side street.</p>

    <h2>Why You Need Professional ${service.name} in Queens</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${service.whyNeeded}</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">In Queens specifically, the density, traffic, parking challenges, and highway access all create situations where professional ${service.name.toLowerCase()} is essential. Trying to handle an automotive emergency yourself on a busy Queens street is dangerous. Cars pass at high speed, there's nowhere safe to work, and the stress of the situation makes mistakes more likely. Our professional service eliminates all of that risk.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Time matters in every automotive emergency. The longer you're stranded, the more stressful and potentially dangerous your situation becomes. Professional ${service.name.toLowerCase()} means faster response, proper handling, and getting you back to your day as quickly as possible. That's why thousands of Queens residents save our number and call us first when things go wrong.</p>

    <h2>Our ${service.name} Equipment and Process</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;"><strong>Professional Equipment:</strong> ${service.equipment}. We invest in top-tier equipment because we know that quality tools prevent damage, speed up service, and ensure safety. Every piece of equipment is inspected before each shift and maintained on a strict schedule.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;"><strong>Step by Step Process:</strong> ${service.process}. This process has been refined over thousands of calls and represents the fastest, safest way to handle ${service.name.toLowerCase()} situations. Our drivers follow this process every time, regardless of the complexity of the job.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;"><strong>Vehicle Types We Handle:</strong> ${service.vehicleTypes}. No vehicle is too big, too small, too old, or too specialized for our team. If it's a vehicle, we can provide ${service.name.toLowerCase()} for it.</p>

    <h2>Common ${service.name} Scenarios We Handle</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${service.scenarios}. These are just some of the situations we handle every day throughout Queens. Each scenario has its own challenges, but our experience means we know exactly what to do in every case.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Beyond these common scenarios, we also handle unusual situations that don't fit neatly into any category. Maybe your vehicle has a unique problem, maybe you're in an unusual location, maybe your situation involves multiple issues. Whatever you're facing, we've probably seen something similar before and we'll figure out the best approach for your specific case.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Our drivers are trained to assess each situation on arrival and adapt their approach accordingly. What works for one job might not work for another, and the ability to think on your feet is what separates good ${service.name.toLowerCase()} from great ${service.name.toLowerCase()}.</p>

    <h2>Transparent ${service.name} Pricing</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Our ${service.name.toLowerCase()} service starts at $${service.priceMin} and ranges up to $${service.priceMax} depending on your specific situation. Factors that affect pricing include:</p>
    <ul style="font-size:1.05rem;line-height:1.9;color:#444;margin-bottom:20px;padding-left:20px;">
      <li><strong>Distance traveled</strong> — local jobs cost less than long-distance services</li>
      <li><strong>Vehicle type</strong> — cars cost less than trucks, SUVs, or commercial vehicles</li>
      <li><strong>Time of day</strong> — overnight and early morning calls may have adjusted rates</li>
      <li><strong>Weather conditions</strong> — severe weather can affect pricing</li>
      <li><strong>Equipment required</strong> — some situations need specialized tools</li>
      <li><strong>Complexity</strong> — simple jobs cost less than complex recoveries</li>
      <li><strong>Location difficulty</strong> — hard-to-reach locations require extra effort</li>
    </ul>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">We believe in complete price transparency. Before we start any work, we give you a firm price based on your exact situation. No hidden fees, no surprise charges, no bait-and-switch tactics. Call ${PHONE} for a quote specific to your needs.</p>

    <h2>${service.name} Coverage Throughout Queens</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We provide ${service.name.toLowerCase()} in every Queens neighborhood. Click any area below to learn about our service in that specific location:</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:12px;margin-bottom:30px;">
      ${neighborhoods.slice(0,24).map(n => `<a href="/services/${service.slug}-in-${n.slug}-queens-ny/" style="display:block;padding:12px 16px;background:#fff;border:1px solid #eee;border-radius:8px;color:#d4a017;font-weight:500;text-decoration:none;">${service.short} in ${n.name}</a>`).join('')}
    </div>
    <p style="text-align:center;"><a href="/neighborhoods/" style="color:#d4a017;font-weight:600;">View all 99+ Queens neighborhoods →</a></p>

    <h2>Licensed, Insured, and Trusted</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We are fully licensed by New York City and New York State to provide ${service.name.toLowerCase()} services. Our business is bonded and insured with comprehensive coverage that protects your vehicle during every service call. If something goes wrong — and it almost never does — you're protected.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Our drivers are professionally trained in ${service.name.toLowerCase()} procedures, vehicle handling, safety protocols, and customer service. They undergo background checks and receive ongoing training on new vehicles, equipment, and techniques. When you hire us, you're getting a real professional, not a random contractor.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">We maintain a 4.9 out of 5 star rating from hundreds of satisfied customers throughout Queens. This reputation is built one call at a time by showing up fast, doing the job right, charging fair prices, and treating people with respect. When you call us, you join the community of satisfied customers who trust us with their vehicles.</p>

    <h2>Frequently Asked Questions: ${service.name} in Queens</h2>
    ${faqs.map(f => `
    <div style="margin-bottom:24px;padding:20px;background:#fff;border:1px solid #eee;border-radius:12px;">
      <h3 style="font-size:1.1rem;margin-bottom:12px;color:#0a0a0a;">${escapeHtml(f.q)}</h3>
      <p style="font-size:1rem;line-height:1.75;color:#555;">${escapeHtml(f.a)}</p>
    </div>`).join('')}

    <h2>Call for ${service.name} in Queens Right Now</h2>
    <p style="font-size:1.1rem;line-height:1.85;color:#444;margin-bottom:20px;">Don't sit there stressed and waiting. Don't try to handle it yourself. Don't call multiple companies hoping one will answer. Call us. We answer every call, dispatch immediately, and respond fast. It's what we do, and we do it better than anyone else in Queens.</p>
    <div style="text-align:center;padding:40px;background:linear-gradient(135deg,#0a0a0a,#1a1a1a);border-radius:16px;margin:30px 0;">
      <p style="color:#fff;font-size:1.2rem;margin-bottom:20px;">Need ${service.name.toLowerCase()} in Queens right now?</p>
      <a href="${PHONE_HREF}" style="display:inline-block;background:linear-gradient(135deg,#d4a017,#b8860b);color:#0a0a0a;padding:20px 40px;border-radius:100px;font-size:1.5rem;font-weight:800;text-decoration:none;">&#9742; Call ${PHONE}</a>
      <p style="color:#999;margin-top:16px;font-size:0.9rem;">24/7 dispatch &middot; 15-30 minute response &middot; Licensed &amp; insured</p>
    </div>

    <h2>Our Service Guarantee for ${service.name} in Queens</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">When you call us for ${service.name.toLowerCase()}, we guarantee three things: fast response, fair pricing, and professional service. These aren't just marketing words — they're the standards we live by on every call. Fast response means we aim for 15-30 minutes to any Queens location. Fair pricing means the price we quote on the phone is the price you pay. Professional service means our drivers treat you with respect, handle your vehicle with care, and explain everything clearly.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We also guarantee that our equipment is appropriate for your specific situation. Before dispatching a truck, our dispatcher asks about your vehicle, your location, and the problem. This lets us send the right equipment the first time, avoiding delays and additional costs. If we ever arrive with the wrong equipment, we'll fix the problem without charging you extra for the return trip.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Most importantly, we guarantee that we'll treat your vehicle like our own. Whether it's a 30-year-old work truck or a brand-new luxury car, it gets the same careful handling. We use soft tie-downs where needed, protect paint from damage, and never cut corners that could cause problems later. That's what professional ${service.name.toLowerCase()} looks like.</p>

    <h2>Insurance and Billing for ${service.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We work with all major insurance companies for ${service.name.toLowerCase()} situations that involve insurance claims. If your service is covered by your auto insurance, roadside assistance policy, or an accident claim, we handle the billing directly with your insurer. You don't need to pay out of pocket and wait for reimbursement in most cases.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">For customers paying directly, we accept cash, all major credit cards, debit cards, and mobile payment options. Payment is processed when service is completed. We provide itemized receipts for every transaction for your records, expense reports, or tax purposes.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Commercial accounts and fleet operators can set up monthly invoicing with net-30 payment terms. This is especially useful for businesses that need regular ${service.name.toLowerCase()} service for their fleet vehicles. Contact us to discuss commercial account setup and preferential pricing for volume customers.</p>

    <h2>Why Queens Residents Choose Us for ${service.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Queens has many towing companies, but we stand out for several reasons. First, we actually answer the phone. Every call, every time, day or night. You're never sent to voicemail, never waiting on hold for 20 minutes, never left wondering if anyone is coming. Our dispatch is available 24/7 and responds immediately.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Second, we're locally owned and operated. We're not a national chain where you get whatever contractor happens to be nearest. We're a Queens business serving Queens residents, and our drivers know the borough inside and out. When you describe your location, we immediately understand where you are. When you mention a landmark, we know it. This local knowledge translates to faster response and better service.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Third, we're honest about pricing. Some towing companies quote low on the phone then add fees when they arrive. We don't play those games. The price we quote is the price you pay. If something changes during the job that affects pricing, we tell you before doing the work. You always know what you're paying for.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Fourth, we invest in professional equipment and ongoing training. Our trucks are modern, well-maintained, and equipped with everything needed for ${service.name.toLowerCase()} jobs. Our drivers attend training sessions on new vehicle technology, safety procedures, and customer service. This investment shows up in the quality of service you receive.</p>

    <h2>Related Services We Offer in Queens</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Beyond ${service.name.toLowerCase()}, we provide complete automotive emergency and roadside services throughout Queens. If your situation requires a different service, or you need multiple services at once, we can handle it:</p>
    <ul style="font-size:1rem;line-height:1.9;color:#d4a017;margin-bottom:30px;padding-left:20px;">
      ${services.filter(x=>x.slug!==service.slug).slice(0,10).map(x => `<li><a href="/services/${x.slug}/" style="color:#d4a017;">${x.name}</a> — ${x.description}</li>`).join('')}
    </ul>

  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <h3><span style="color:#d4a017;">Towing Service</span> Queens NYC</h3>
        <p style="margin-bottom:16px;font-size:0.9rem;color:#999;">Queens' most trusted 24/7 ${service.name.toLowerCase()} and complete towing services.</p>
        <div style="margin:8px 0;"><a href="https://www.google.com/maps/place/Jonuzi+Towing/" target="_blank" rel="noopener" style="color:#ccc;">155-57 Bayview Ave, Rosedale, NY 11422</a></div>
        <div style="margin:8px 0;"><a href="${PHONE_HREF}" style="color:#d4a017;font-weight:700;">${PHONE}</a></div>
      </div>
      <div>
        <h3>Quick Links</h3>
        <ul class="footer-links">
          <li><a href="/">Home</a></li>
          <li><a href="/services/">All Services</a></li>
          <li><a href="/neighborhoods/">All Areas</a></li>
          <li><a href="/blog/">Blog</a></li>
          <li><a href="/about.html">About</a></li>
          <li><a href="/contact.html">Contact</a></li>
        </ul>
      </div>
      <div>
        <h3>Other Services</h3>
        <ul class="footer-links">
          ${services.filter(x=>x.slug!==service.slug).slice(0,6).map(x => `<li><a href="/services/${x.slug}/">${x.name}</a></li>`).join('')}
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
<script src="/js/analytics.js" defer></script>
<script src="/js/ayah-chat.js" defer></script>
<script src="/js/tawkto.js" defer></script>
</body>
</html>`;
}

console.log(`\nUpgrading ${services.length} service pages to 3000+ words...\n`);
let wordSum = 0;
for (const service of services) {
  const html = buildServicePage(service);
  const dir = path.join(ROOT, 'services', service.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const words = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().split(' ').length;
  wordSum += words;
  console.log(`✓ ${service.name}: ${words} words`);
}
console.log(`\n✅ Done. Average: ${Math.round(wordSum/services.length)} words per page`);
