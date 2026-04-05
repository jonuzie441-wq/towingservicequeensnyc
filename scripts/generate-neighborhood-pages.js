#!/usr/bin/env node
/**
 * Generate upgraded neighborhood pages (3,000+ words each)
 * Creates pages for all 99 neighborhoods in data/neighborhoods.json
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

function escapeHtml(s) { return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }

// Pool of all 13 hero SVGs — neighborhood pages rotate through them deterministically
const HERO_POOL = [
  '/images/hero-emergency.svg',
  '/images/hero-flatbed.svg',
  '/images/hero-heavy.svg',
  '/images/hero-motorcycle.svg',
  '/images/hero-lockout.svg',
  '/images/hero-jumpstart.svg',
  '/images/hero-tire.svg',
  '/images/hero-fuel.svg',
  '/images/hero-winching.svg',
  '/images/hero-longdistance.svg',
  '/images/hero-roadside.svg',
  '/images/hero-junkcar.svg',
  '/images/hero-wheellift.svg',
  '/images/hero-exotic.svg'
];

function neighborhoodHero(slug) {
  let h = 0;
  for (let i = 0; i < slug.length; i++) h = (h * 31 + slug.charCodeAt(i)) | 0;
  return HERO_POOL[Math.abs(h) % HERO_POOL.length];
}

function buildNeighborhoodPage(n) {
  const zipFirst = n.zip.split(',')[0].trim();
  const title = `Towing Service in ${n.name}, Queens NY | 24/7 Tow Truck | ${PHONE}`;
  const metaDesc = `Fast 24/7 towing and roadside assistance in ${n.name}, Queens NY (ZIP ${zipFirst}). Emergency tow, flatbed, jump start, lockout, tire change. Call ${PHONE}.`;
  const url = `${SITE_URL}/neighborhoods/${n.slug}/`;
  const heroImage = neighborhoodHero(n.slug);

  const faqs = [
    {
      q: `How fast can you respond to towing calls in ${n.name}?`,
      a: `We respond to ${n.name} in 15-30 minutes, 24 hours a day. Our trucks are positioned throughout Queens so we can reach any ${n.name} location fast. Whether you're near ${n.landmarks[0]} or on ${n.streets[0]}, help arrives quickly.`
    },
    {
      q: `What towing services do you offer in ${n.name}?`,
      a: `We provide all towing services in ${n.name}: emergency towing, flatbed towing, heavy duty towing, motorcycle towing, lockouts, jump starts, flat tire changes, fuel delivery, winching, accident recovery, long distance towing, and more. Call ${PHONE} for any automotive emergency in ${n.name}.`
    },
    {
      q: `What ZIP codes do you cover in ${n.name}?`,
      a: `We cover all ZIP codes in ${n.name} including ${n.zip}. No location in ${n.name} is outside our service area. Whether you're in a residential section, commercial area, or on a major road, we respond fast.`
    },
    {
      q: `How much does towing cost in ${n.name}?`,
      a: `Towing in ${n.name} typically ranges from $155 to $350 depending on the service type, distance, and vehicle. Specialty services like flatbed towing or heavy duty recovery may cost more. Call ${PHONE} for an upfront quote with no hidden fees.`
    },
    {
      q: `Do you provide 24/7 service in ${n.name}?`,
      a: `Yes, we operate 24 hours a day, 7 days a week, 365 days a year in ${n.name}. Day or night, weekday or weekend, holiday or normal day — we answer every call and dispatch trucks immediately.`
    },
    {
      q: `Can you tow luxury or exotic cars in ${n.name}?`,
      a: `Yes, we offer specialized luxury and exotic vehicle towing in ${n.name}. We use flatbed trucks with soft tie-downs and experienced operators trained on high-end vehicles. BMW, Mercedes, Audi, Porsche, Tesla, Ferrari — we handle them all.`
    },
    {
      q: `Do you work with insurance companies for accidents in ${n.name}?`,
      a: `Yes, we work with all major insurance companies for accident recovery in ${n.name}. We can bill insurance directly, provide documentation for claims, and coordinate with adjusters. This makes the claims process smoother during a stressful time.`
    },
    {
      q: `What if I need towing on the ${n.highways[0]}?`,
      a: `We respond to calls on the ${n.highways[0]} and all major highways near ${n.name}. Highway calls require extra safety precautions and our drivers are trained in highway recovery procedures. Tell our dispatcher your exact location and we'll send the right equipment.`
    }
  ];

  const schema = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "LocalBusiness",
        "@id": `${url}#business`,
        "name": `${BUSINESS_NAME} - ${n.name}`,
        "description": `24/7 towing and roadside assistance in ${n.name}, Queens, NY ${n.zip}`,
        "telephone": "+1-347-437-0185",
        "url": url,
        "priceRange": "$$",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "155-57 Bayview Ave",
          "addressLocality": "Rosedale",
          "addressRegion": "NY",
          "postalCode": "11422",
          "addressCountry": "US"
        },
        "areaServed": {
          "@type": "Place",
          "name": `${n.name}, Queens, NY`
        },
        "openingHoursSpecification": {
          "@type": "OpeningHoursSpecification",
          "dayOfWeek": ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"],
          "opens": "00:00",
          "closes": "23:59"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {"@type":"ListItem","position":1,"name":"Home","item":SITE_URL+"/"},
          {"@type":"ListItem","position":2,"name":"Service Areas","item":SITE_URL+"/neighborhoods/"},
          {"@type":"ListItem","position":3,"name":n.name+", Queens","item":url}
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
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>${escapeHtml(title)}</title>
<meta name="description" content="${escapeHtml(metaDesc)}">
<meta name="keywords" content="towing ${n.name}, tow truck ${n.name}, ${n.name} Queens NY, towing ${zipFirst}, ${n.slug} towing">
<link rel="canonical" href="${url}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta name="geo.region" content="US-NY">
<meta name="geo.placename" content="${n.name}, Queens, New York">

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
    <span style="color:#999;">24/7 Towing — ${n.name}, Queens NY</span>
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
    <a href="/neighborhoods/" style="color:#666;">Service Areas</a> &rsaquo;
    <span style="color:#d4a017;font-weight:600;">${n.name}, Queens</span>
  </div>
</nav>

<section class="hero">
  <div class="hero-bg">
    <img src="${heroImage}" alt="Towing service in ${n.name} Queens NY - ${BUSINESS_NAME}" style="width:100%;height:100%;object-fit:cover;opacity:0.35;" loading="eager">
  </div>
  <div class="container">
    <div class="hero-label">${n.name} &middot; Queens NY &middot; ZIP ${zipFirst}</div>
    <h1><em>Towing Service in<br><span class="accent">${n.name}, Queens NY</span></em></h1>
    <p>24/7 professional towing and roadside assistance throughout ${n.name}, Queens. Fast 15-30 minute response, fair pricing, licensed and insured. Serving ZIP codes ${n.zip} with complete towing services.</p>
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
      <div class="hero-stat"><div class="hero-stat-number">20+</div><div class="hero-stat-label">Services Offered</div></div>
      <div class="hero-stat"><div class="hero-stat-number">${zipFirst}</div><div class="hero-stat-label">Primary ZIP</div></div>
    </div>
  </div>
</section>

<section class="section">
  <div class="container" style="max-width:900px;">

    <h2>24/7 Towing and Roadside Assistance in ${n.name}, Queens</h2>
    <p style="font-size:1.1rem;line-height:1.85;color:#444;margin-bottom:20px;">Welcome to your dedicated towing service page for ${n.name}, Queens. We provide complete 24/7 towing and roadside assistance throughout this ${n.character} in the ${n.region} section of Queens. Whether you need an emergency tow, a jump start, a lockout service, or any other automotive emergency help, we're the trusted local provider serving ZIP codes ${n.zip}.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${n.name} is home to landmarks like ${n.landmarks.slice(0,4).join(', ')}, and major roads including ${n.streets.slice(0,5).join(', ')}. Our drivers know every corner of ${n.name} and can reach any location within the neighborhood fast. When you call, you'll speak to a dispatcher who understands exactly where you are and sends the nearest available truck immediately.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">${n.name} presents unique characteristics that shape our service approach. The ${n.residentialFeatures} mean we often navigate narrow streets and limited parking. The ${n.commercialAreas.split(',')[0]} sees heavy daytime traffic. Proximity to ${n.highways[0]} brings highway incidents into our regular service area. We understand the local conditions and plan our response accordingly.</p>

    <h2>Complete Towing Services in ${n.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We offer every towing service a ${n.name} driver might need. Our complete service menu includes:</p>
    <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(250px,1fr));gap:16px;margin-bottom:30px;">
      ${services.slice(0,12).map(s => `<a href="/services/${s.slug}-in-${n.slug}-queens-ny/" style="display:block;padding:16px;background:#fff;border:1px solid #eee;border-radius:12px;text-decoration:none;">
        <div style="font-weight:700;color:#0a0a0a;margin-bottom:4px;">${s.name}</div>
        <div style="font-size:0.85rem;color:#666;">${s.description.slice(0,60)}...</div>
        <div style="font-size:0.85rem;color:#d4a017;margin-top:8px;font-weight:600;">$${s.priceMin}-$${s.priceMax} →</div>
      </a>`).join('')}
    </div>
    <p style="font-size:1rem;line-height:1.75;color:#666;margin-bottom:30px;text-align:center;"><a href="/services/" style="color:#d4a017;font-weight:600;">View all 20+ services →</a></p>

    <h2>Why ${n.name} Residents Choose Our Towing Service</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${n.name} residents choose us for several important reasons. First, we actually answer the phone. Many towing companies send calls to voicemail or put you on hold. We answer every call, every time, with a real human dispatcher who immediately starts helping you.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Second, our drivers know ${n.name}. They've worked these streets for years. When you mention being near ${n.landmarks[0]}, we know exactly where that is. When you say you're on ${n.streets[0]}, we immediately know which direction to approach from. This local expertise means faster response and fewer mistakes.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Third, we offer transparent pricing. The price we quote on the phone is the price you pay. No surprise fees, no bait-and-switch, no "that'll be an extra $100" when we arrive. Our pricing is fair, competitive, and always clear.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Fourth, we have the right equipment for any situation. Wheel-lift trucks for standard jobs, flatbeds for luxury vehicles, heavy-duty wreckers for commercial trucks, motorcycle-specific equipment, winches for stuck vehicles. Whatever you need, we bring the right tools the first time.</p>

    <h2>Streets and Landmarks We Serve in ${n.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Our towing service covers every street and location throughout ${n.name}. Our drivers respond to calls at the following major streets:</p>
    <ul style="font-size:1.05rem;line-height:1.9;color:#444;margin-bottom:20px;padding-left:20px;">
      ${n.streets.map(s => `<li><strong>${s}</strong> — complete towing coverage along this corridor</li>`).join('')}
    </ul>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We also respond to calls at these ${n.name} landmarks and points of interest:</p>
    <ul style="font-size:1.05rem;line-height:1.9;color:#444;margin-bottom:20px;padding-left:20px;">
      ${n.landmarks.map(l => `<li><strong>${l}</strong> — fast response for any automotive emergency</li>`).join('')}
    </ul>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">For highway and major roadway incidents, we handle calls on ${n.highways.join(', ')}. Highway service requires specialized safety procedures and faster response times, and our drivers are trained in highway recovery.</p>

    <h2>About ${n.name}, Queens</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${n.name} is located in ${n.region}, Queens. The neighborhood is known as a ${n.character} and covers ZIP codes ${n.zip}. It features ${n.residentialFeatures}, creating a distinct character unlike any other neighborhood in Queens.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Commercial activity in ${n.name} centers around ${n.commercialAreas}. These commercial zones see significant traffic during business hours, which can lead to automotive incidents that require our services. Residential streets throughout ${n.name} also present their own challenges, from parking issues to tight access for larger trucks.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">The major roadways serving ${n.name} — ${n.highways.join(', ')} — connect the neighborhood to the rest of Queens, Manhattan, and the surrounding boroughs. These are busy routes where breakdowns and accidents happen regularly, requiring fast professional response.</p>

    <h2>Emergency Response Times in ${n.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Our typical response time in ${n.name} is 15-30 minutes from the moment you call. This is faster than most competitors because we have trucks strategically positioned throughout Queens and our dispatch system routes the nearest available truck to your exact location immediately.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Response time depends on several factors: current traffic conditions in and around ${n.name}, active calls we're already handling, weather conditions, and your specific location within the neighborhood. During rush hour or severe weather, response times may be slightly longer, but we always give you an honest estimate when you call.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">In emergencies — accidents with injuries, vehicles blocking traffic, dangerous situations — we prioritize the call and dispatch immediately. If you're in a dangerous situation in ${n.name}, let the dispatcher know and we'll move fast.</p>

    <h2>Licensed, Insured, and Professional in ${n.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We are fully licensed and insured to provide towing services in New York City, including ${n.name} and all of Queens. Our business carries comprehensive insurance that protects your vehicle during every service call. If anything goes wrong — and it rarely does — you're covered.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Our drivers are trained professionals, not random contractors. They go through background checks, equipment training, customer service training, and safety certification. Many have been with us for years and know Queens streets including ${n.name} better than most GPS systems.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">We work with major insurance companies for accident-related services in ${n.name}. We can bill insurance directly, provide documentation for claims, and coordinate with adjusters. This makes the insurance process smoother for you during what's usually a stressful time.</p>

    <h2>Frequently Asked Questions: Towing in ${n.name}</h2>
    ${faqs.map(f => `
    <div style="margin-bottom:24px;padding:20px;background:#fff;border:1px solid #eee;border-radius:12px;">
      <h3 style="font-size:1.1rem;margin-bottom:12px;color:#0a0a0a;">${escapeHtml(f.q)}</h3>
      <p style="font-size:1rem;line-height:1.75;color:#555;">${escapeHtml(f.a)}</p>
    </div>`).join('')}

    <h2>Call Now for Towing in ${n.name}</h2>
    <p style="font-size:1.1rem;line-height:1.85;color:#444;margin-bottom:20px;">Need towing or roadside assistance in ${n.name} right now? Don't wait. Call our dispatch line at ${PHONE} and we'll send help immediately. 24/7 availability, 15-30 minute response, professional service every time.</p>
    <div style="text-align:center;padding:40px;background:linear-gradient(135deg,#0a0a0a,#1a1a1a);border-radius:16px;margin:30px 0;">
      <p style="color:#fff;font-size:1.2rem;margin-bottom:20px;">Need towing in ${n.name} right now?</p>
      <a href="${PHONE_HREF}" style="display:inline-block;background:linear-gradient(135deg,#d4a017,#b8860b);color:#0a0a0a;padding:20px 40px;border-radius:100px;font-size:1.5rem;font-weight:800;text-decoration:none;">&#9742; Call ${PHONE}</a>
      <p style="color:#999;margin-top:16px;font-size:0.9rem;">24/7 dispatch &middot; 15-30 minute response &middot; Licensed &amp; insured</p>
    </div>

    <h2>Our Professional Team Serving ${n.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">The drivers and dispatchers who serve ${n.name} are professionals, not just guys with tow trucks. Every driver goes through extensive training covering vehicle handling, customer service, safety procedures, equipment operation, and emergency response. Many have been with our company for years and have responded to thousands of calls throughout Queens including regular service to ${n.name}.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Beyond training, our drivers are carefully selected. We run background checks, verify commercial licenses, check driving records, and look for people who will represent our company professionally in every interaction. When a driver arrives at your location in ${n.name}, you're getting someone who has been vetted, trained, and trusted to handle automotive emergencies with skill and courtesy.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Our dispatch team is equally important to the quality of service you receive in ${n.name}. When you call, you speak to a dispatcher who immediately understands your situation, identifies the right equipment and driver for the job, and coordinates the response. Good dispatching means faster service, better outcomes, and smoother experiences for customers in stressful situations.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We take pride in our team because they represent our company and our values. When you work with us, you're working with people who care about doing the job right. That commitment to quality shows up in every call, every service, and every interaction with ${n.name} residents.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We also invest in our team's wellbeing. Good pay, benefits, and working conditions mean our drivers stick around for years, building experience and local knowledge. Many of our drivers have been responding to ${n.name} calls for so long that they know regular customers by name, remember locations where problems tend to happen, and have developed the kind of street-level expertise that only comes from real experience.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">This stability is rare in the towing industry where high turnover is common. Companies that churn through drivers can't deliver consistent service quality. We're different because we value our people and they value being part of our team. The result is better service for you when you need towing in ${n.name}.</p>

    <h2>Common Towing Situations in ${n.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Every neighborhood has its own patterns of automotive emergencies, and ${n.name} is no different. Based on our years of service in this area, the most common situations we respond to in ${n.name} include dead batteries, flat tires, lockouts, breakdowns in traffic, accidents on ${n.highways[0]}, vehicles stuck in tight parking situations, and engines that won't start. Each situation has its own best approach and our drivers know how to handle them all.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Weather plays a big role in ${n.name} emergencies. During winter months, cold weather drains batteries, snow and ice cause accidents, and frozen locks become a problem. During summer, overheating engines and tire blowouts from hot pavement become more common. During storms, fallen branches and flooded streets create recovery situations. We're prepared for all of it, year round.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Special events and high-traffic times in ${n.name} also create unique situations. When there's a major event or rush hour traffic, we see more accidents, stranded vehicles, and parking-related issues. We adjust our response strategy during these times to maintain fast service even when traffic is heavy.</p>

    <h2>Pricing and Payment for Towing in ${n.name}</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Towing prices in ${n.name} vary based on several factors: the service type you need, your vehicle type, the distance involved, the time of day, and the complexity of the situation. Basic emergency towing typically runs $155-$250. Flatbed service for luxury vehicles ranges $175-$400. Heavy duty towing for commercial vehicles starts at $350. Roadside assistance services like jump starts, tire changes, and lockouts typically range $85-$175. We always provide upfront pricing before starting any work.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">What you won't find with our ${n.name} service is hidden fees or surprise charges. The price we quote on the phone is the price you pay. We don't add fuel surcharges, service fees, hookup fees, or any other nonsense. What we quote is what it costs. That transparency is part of why ${n.name} residents keep calling us back and recommending us to neighbors.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We accept multiple payment methods for ${n.name} customers: cash, all major credit cards (Visa, Mastercard, American Express, Discover), debit cards, mobile payments, and for accident-related services, direct insurance billing. Commercial accounts can set up net-30 invoicing. Payment is collected when service is completed, not before.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">If you're price shopping in ${n.name}, be careful. Some companies quote unrealistically low prices over the phone then add charges when they arrive. Others have hidden fees buried in their terms. We believe in fair, transparent pricing from the first call. Our prices are competitive with other reputable Queens towing companies, and our service quality is second to none.</p>

    <h2>Our Equipment for ${n.name} Service Calls</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">We bring the right equipment to every ${n.name} service call. Our fleet includes wheel-lift tow trucks for standard jobs, flatbed carriers for luxury and damaged vehicles, heavy-duty wreckers for commercial trucks, motorcycle-specific equipment, and specialized winching gear for recovery situations. When you call, our dispatcher selects the right truck based on your specific needs.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">Beyond trucks, we carry all the tools needed for roadside assistance: professional jump starters, tire change equipment, fuel containers, lockout tools, diagnostic equipment, and safety gear including cones, flares, and reflective equipment. Every vehicle is stocked and ready to handle whatever situation we encounter in ${n.name}.</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Our equipment is maintained to the highest standards. Trucks are inspected before every shift. Tools are checked regularly. Safety equipment is replaced when needed. This maintenance means fewer breakdowns of our own, fewer delays in service, and more reliable help when you need it in ${n.name}.</p>

    <h2>Nearby Queens Neighborhoods We Also Serve</h2>
    <ul style="font-size:1rem;line-height:1.9;color:#d4a017;margin-bottom:30px;padding-left:20px;">
      ${neighborhoods.filter(x=>x.slug!==n.slug && x.region===n.region).slice(0,10).map(x => `<li><a href="/neighborhoods/${x.slug}/" style="color:#d4a017;">Towing in ${x.name}</a></li>`).join('')}
    </ul>

  </div>
</section>

<footer class="footer">
  <div class="container">
    <div class="footer-grid">
      <div>
        <h3><span style="color:#d4a017;">Towing Service</span> Queens NYC</h3>
        <p style="margin-bottom:16px;font-size:0.9rem;color:#999;">Queens' most trusted 24/7 towing in ${n.name} and all 99+ neighborhoods.</p>
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
        <h3>Popular Services</h3>
        <ul class="footer-links">
          ${services.slice(0,6).map(s => `<li><a href="/services/${s.slug}-in-${n.slug}-queens-ny/">${s.name}</a></li>`).join('')}
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
}

console.log(`\nGenerating ${neighborhoods.length} neighborhood pages...\n`);
let wordSum = 0;
let count = 0;
for (const n of neighborhoods) {
  const html = buildNeighborhoodPage(n);
  const dir = path.join(ROOT, 'neighborhoods', n.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, 'index.html'), html);
  const words = html.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').trim().split(' ').length;
  wordSum += words;
  count++;
  if (count <= 3 || count % 20 === 0) console.log(`[${count}] ${n.name}: ${words} words`);
}
console.log(`\n✅ Done. ${count} pages. Average: ${Math.round(wordSum/count)} words per page`);
