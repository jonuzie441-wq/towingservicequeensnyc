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
const { SAME_AS, AGGREGATE_RATING, REVIEWS, GBP_URL } = require('./business-data.js');

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

// Pick a single variant from an array deterministically
function pickVariant(arr, s) {
  return arr[s % arr.length];
}

// ============ PROSE VARIANT POOLS ============
// Each variant is a function that receives context and returns a paragraph.
// Seeded selection means every combo gets a different structural wording,
// not just different slot values inside the same sentence skeleton.

const HERO_INTRO_VARIANTS = [
  (c) => `Need ${c.serviceLower} in ${c.nb}? We provide fast, professional ${c.serviceShort} service throughout ${c.nb} (ZIP ${c.zip}) 24 hours a day, 7 days a week. Our crew knows ${c.nb} intimately — every block from ${c.street1} to ${c.street2}, every shortcut through ${c.landmark1}, every way to avoid the ${c.highway1} at rush hour. That local familiarity is why we arrive fast and handle the job right the first time.`,
  (c) => `Stuck in ${c.nb} and need ${c.serviceLower} now? We're a local ${c.serviceShort} crew covering every corner of ${c.nb} — ZIP ${c.zip} included — round the clock. Drivers who run ${c.street1}, ${c.street2}, and the streets around ${c.landmark1} daily know exactly how to reach you without GPS guesswork, even during the ${c.highway1} crunch.`,
  (c) => `${c.service} in ${c.nb} shouldn't mean waiting an hour. Our trucks work this part of ${c.region} day and night, so when the call comes in from ${c.street1}, ${c.street2}, or anywhere inside ${c.zip}, the closest driver is already rolling before you finish describing the problem. Fast, honest, local.`,
  (c) => `When ${c.serviceLower} is the one call you can't afford to get wrong, experience in ${c.nb} matters. Our operators have been running ${c.street1}, ${c.street2}, and the ${c.landmark1} area for years — that neighborhood-level familiarity is what turns a 45-minute wait elsewhere into a 20-minute response here in ${c.zip}.`,
  (c) => `Fast ${c.serviceLower} in ${c.nb}, Queens — any hour, any weather, any vehicle. We respond across ${c.zip} and the surrounding ${c.region} area, from ${c.street1} and ${c.street2} out to ${c.landmark1} and back along the ${c.highway1}. One call, upfront pricing, and a driver who actually knows the streets.`
];

const OPENING_P1_VARIANTS = [
  (c) => `${c.serviceIntro} When you need ${c.serviceLower} specifically in ${c.nb}, you need a company that knows the streets, understands how traffic moves through ${c.region}, and can navigate quickly to your exact location. Our drivers work in ${c.nb} every single day and know every shortcut, every one-way street, and every landmark from ${c.landmark1} to ${c.landmark2}.`,
  (c) => `${c.serviceIntro} Working ${c.nb} is different from working a generic Queens ZIP — the ${c.residentialFeatures} create parking and access challenges you only learn by being here. Our drivers service this neighborhood daily, so when the call comes in from near ${c.landmark1} or ${c.landmark2}, they already know the best approach, where to stage the truck, and how to keep the job moving.`,
  (c) => `${c.serviceIntro} The reason local matters: ${c.nb} isn't a map to us, it's a route we drive constantly. We know which blocks near ${c.landmark1} get choked during commute hours, which side streets off ${c.commercialArea} can fit a flatbed, and which corners near ${c.landmark2} are safest to stage a recovery. That's what you're actually hiring when you call a ${c.nb} towing company instead of a dispatcher 30 miles away.`,
  (c) => `${c.serviceIntro} In ${c.nb}, the difference between a good ${c.serviceLower} call and a bad one usually comes down to who shows up. Our operators work this ${c.region} corridor every shift, which means ${c.landmark1}, ${c.landmark2}, and every cross street between them are familiar ground — not a pin on a map they're trying to decipher while you wait.`
];

const OPENING_P2_VARIANTS = [
  (c) => `${c.nb} sits in ${c.region} and covers ZIP codes ${c.zipFull}, running along major streets like ${c.streetsList}. Whether you're stranded near ${c.landmark1}, broken down on ${c.street1}, or need service anywhere in the ${c.commercialArea} area, our ${c.serviceLower} team responds fast with the right equipment for the job.`,
  (c) => `Geographically, ${c.nb} spans ZIPs ${c.zipFull} in ${c.region}, with the main arteries being ${c.streetsList}. The ${c.commercialArea} corridor pulls heavy daytime traffic, and the surrounding residential streets get busy on evenings and weekends. We've routed around these patterns enough times to know when to cut through side streets and when to stay on the main roads — the kind of knowledge a GPS won't give you.`,
  (c) => `If you pull up ${c.nb} on a map, you'll see ZIPs ${c.zipFull} wrapped around the ${c.commercialArea} district. The important streets are ${c.streetsList}. We cover all of it — every address, every alley, every parking structure. Whether the trouble is on ${c.street1}, near ${c.landmark1}, or somewhere off the main grid, we can get to you.`,
  (c) => `${c.nb} covers ZIPs ${c.zipFull} and sits inside ${c.region}. The backbone streets — ${c.streetsList} — are where most of our ${c.serviceLower} calls in this neighborhood come from, but we also handle the quieter blocks, the ${c.residentialFeatures.split(',')[0]}, and the spaces behind the ${c.commercialArea.split(',')[0]}. Nothing in ${c.nb} is too tight, too tucked away, or too inconvenient.`
];

const OPENING_P3_VARIANTS = [
  (c) => `Every ${c.serviceLower} call in ${c.nb} is different. You might be a commuter who broke down on the ${c.highway1} during rush hour. You might be a resident whose car won't start in your driveway on ${c.street2}. You might be visiting ${c.landmark1} and discovered a problem when you returned to your vehicle. Whatever brought you to this page, we have the experience, equipment, and local knowledge to help you right now.`,
  (c) => `The situations we respond to in ${c.nb} run the full spectrum: rush-hour breakdowns on the ${c.highway1}, overnight battery failures on residential streets like ${c.street2}, tourists returning to a dead vehicle at ${c.landmark1}, delivery trucks jammed up in the ${c.commercialArea.split(',')[0]} corridor. Whatever got you here, the fix starts with one phone call.`,
  (c) => `No two ${c.serviceLower} calls look the same in ${c.nb}. Sometimes it's a fender-bender recovery on ${c.highway1}. Sometimes it's a stubborn door lock in the ${c.landmark1} parking area. Sometimes it's a dead battery three houses down from ${c.street2}. We handle all of it — and because we work this neighborhood daily, you're not explaining where you are for ten minutes before we can dispatch.`,
  (c) => `You could be reading this after a collision on the ${c.highway1}, after your car refused to start outside your apartment near ${c.street2}, or after you came back from ${c.landmark1} and found a problem in the lot. Every one of those calls gets the same response: a driver who knows ${c.nb}, the right equipment on the truck, and an upfront price before any work begins.`
];

const WHY_HERE_VARIANTS = [
  (c) => `In ${c.nb} specifically, residents face unique challenges that make professional ${c.serviceLower} essential. The ${c.residentialFeatures} mean many homes have limited parking and narrow access. Proximity to ${c.highway1} brings highway-speed incidents that require immediate response. The ${c.commercialArea.split(',')[0]} area sees heavy traffic during business hours, and the residential streets around ${c.street1} and ${c.street3} can be busy during morning and evening rush. We understand these local conditions and plan our routes accordingly.`,
  (c) => `${c.nb} has its own set of conditions that shape how towing actually works here. Older ${c.residentialFeatures.split(',')[0]} blocks often can't take a wheel-lift without damage, so we default to flatbed for certain streets. The ${c.highway1} sits close enough that highway-speed damage is common in recovery calls. And the ${c.commercialArea.split(',')[0]} corridor is backed up more often than not — we know the workaround routes. Generic towing companies learn this the hard way. We already know it.`,
  (c) => `Here's what makes ${c.nb} different: the mix of ${c.residentialFeatures} and the traffic pressure from ${c.highway1} means the standard "dispatch any available truck" model doesn't work well. You need a driver who's been on ${c.street1}, who knows how tight access gets around ${c.street3}, and who's worked the ${c.commercialArea.split(',')[0]} corridor enough times to read the traffic. That's the bar we hold ourselves to.`,
  (c) => `The local challenges in ${c.nb} are real. ${c.residentialFeatures} limit where a truck can set up. ${c.highway1} pulls in higher-speed incidents. And the ${c.commercialArea.split(',')[0]} area runs dense commercial traffic through streets like ${c.street1} and ${c.street3} most of the day. We plan around all of it — and because we do this neighborhood daily, the plan is already second nature when your call comes in.`
];

const CALL_NOW_VARIANTS = [
  (c) => `Don't wait. Every minute you're stranded is a minute lost, a minute of stress, a minute of risk. Call us now for ${c.serviceLower} service anywhere in ${c.nb}. Our dispatcher answers immediately, takes your information, and sends the nearest truck directly to your location.`,
  (c) => `Here's the honest version: waiting doesn't make it better. If you need ${c.serviceLower} in ${c.nb} right now, the fastest move is to call us directly — our dispatcher picks up live, gets your location, and has a truck rolling while you're still on the phone.`,
  (c) => `Stranded is stressful. We get it. The ${c.nb} dispatch line is staffed 24/7 by a real person (or by Ayah, our AI dispatcher if every operator is on another call) and the nearest truck is moving within minutes of hanging up.`,
  (c) => `When you're ready, pick up the phone. We don't do voicemail runarounds, we don't reroute you through a call center, we don't quote one price and charge another. You get a live ${c.nb} dispatcher, a firm quote, and a driver on the way.`
];

// ============ SCENARIO POOL ============
// Each scenario is tagged with service slugs it fits. Combos pick 2 matching
// scenarios from the pool via seed, producing unique service+neighborhood
// content per page. `services: 'all'` means applicable to any service.

const SCENARIO_POOL = [
  // Emergency towing scenarios
  { services: ['emergency-towing','accident-recovery','roadside-assistance'],
    text: (c) => `The rush-hour breakdown on the ${c.highway1} near ${c.nb}. A driver commuting into Queens gets stuck with a blown engine three lanes from the shoulder, hazards on, traffic stacking behind them. We've worked this exact scene a dozen times — the key is getting a flatbed positioned safely before NYPD has to close a lane. Average clear time for this type of call on the ${c.highway1}: 35-45 minutes start to finish.` },
  { services: ['emergency-towing','flatbed-towing','all'],
    text: (c) => `Late-night calls from ${c.street1} are their own category. Most come in between 11 PM and 4 AM — a restaurant worker leaving a shift, a rideshare driver finishing a run, a resident returning home from the city and finding a dead battery or a flat. We staff overnight specifically because these calls don't wait until morning, and ${c.nb} gets its share.` },
  { services: ['emergency-towing','accident-recovery'],
    text: (c) => `The Friday-night collision near ${c.landmark1}. Weekend evenings concentrate traffic through ${c.nb}, and minor fender benders near ${c.landmark1} are a weekly occurrence for us. When the call comes in we already know which cross streets get clogged and which side routes keep the recovery truck moving.` },

  // Flatbed scenarios
  { services: ['flatbed-towing','exotic-car-towing'],
    text: (c) => `The AWD luxury vehicle in the ${c.landmark1} area. ${c.nb} has its share of high-end vehicles — BMWs, Audis, Teslas, Porsches — and almost every one of them needs flatbed transport to avoid drivetrain damage. We carry soft tie-down straps and alignment-safe winching gear specifically for these calls. If you drive a modern AWD and you're on ${c.street2}, don't let anyone hook your wheels to a dolly — flatbed only.` },
  { services: ['flatbed-towing','exotic-car-towing','commercial-towing'],
    text: (c) => `Low-clearance pickups from parking structures around ${c.commercialArea1}. Modern sports cars and lowered trucks can't take a standard tow hookup because of bumper clearance. We bring low-angle flatbeds for these — the difference between a clean recovery and scraped paint is about 3 inches of ramp angle, and we plan for it before we dispatch.` },

  // Heavy duty scenarios
  { services: ['heavy-duty-towing','commercial-towing','construction-equipment-towing'],
    text: (c) => `Box trucks stuck in the ${c.commercialArea1} corridor. Delivery vehicles, contractor trucks, moving vans — ${c.nb}'s commercial zones see heavy GVWR traffic, and when one of them breaks down, a standard tow truck isn't going to cut it. We dispatch heavy-duty wreckers with 25-ton capacity for these calls and coordinate with NYPD when lane closures are needed.` },
  { services: ['heavy-duty-towing','construction-equipment-towing'],
    text: (c) => `Commercial breakdowns on ${c.street3} during work hours. The mix of construction trucks, delivery fleets, and commercial vehicles moving through ${c.nb} means heavy-duty service is a weekly need, not a once-in-a-while call. Our heavy wreckers are sized for box trucks, bucket trucks, and equipment hauls.` },
  { services: ['heavy-duty-towing','commercial-towing'],
    text: (c) => `Bus and shuttle recoveries near the ${c.highway1}. Transit vehicles, charter buses, airport shuttles — when one of these goes down in ${c.nb}, the operator needs a certified heavy-duty tow that won't damage air suspension or low clearance underbody components. We've handled these for commercial fleets across Queens.` },

  // Motorcycle scenarios
  { services: ['motorcycle-towing'],
    text: (c) => `Motorcycle recoveries in ${c.nb} require different equipment than cars — wheel chocks, soft tie-downs, and a flatbed with no-mar ramps. We see everything from sport bikes with dead batteries near ${c.landmark1} to cruiser drops on ${c.street1}. Bikes are transported standing (not laid down) so your gas tank, mirrors, and fairings arrive intact.` },
  { services: ['motorcycle-towing','flatbed-towing'],
    text: (c) => `Downed sport bikes after a slide on rain-slick ${c.street2} — we carry specialized motorcycle recovery straps that don't scratch clutch covers or bent bars. When the call comes from ${c.nb}, we roll with a dedicated bike kit on the flatbed.` },

  // Lockout scenarios
  { services: ['lockout-service','roadside-assistance'],
    text: (c) => `Keys locked in the car at the ${c.landmark1} parking area. This is one of our most common ${c.nb} calls — someone parks, grabs their bag, closes the door, and realizes the fob is still inside. Modern vehicles need specialized non-damage tools (not the old wedge-and-rod method), and we carry the full kit. Most lockouts are cleared in under 10 minutes once we arrive.` },
  { services: ['lockout-service'],
    text: (c) => `The trunk lockout on ${c.street1}. Less common than a door lockout but trickier — keys inside the trunk, hatch closed, no spare fob. We handle these in ${c.nb} with specialized trunk-release tools and, if the vehicle supports it, dealer-backdoor access through the rear seats.` },

  // Jump start scenarios
  { services: ['jump-start-service','roadside-assistance'],
    text: (c) => `Cold-weather dead batteries across ${c.nb}. December through February, jump-start calls spike citywide, and ${c.nb} is no exception. A battery that tested fine in October refuses to turn over at 6 AM on a 20-degree morning on ${c.street2}. We dispatch with portable lithium jump packs — no cables strung between cars, no worries about compromised alternators.` },
  { services: ['jump-start-service','flat-tire-change','fuel-delivery','roadside-assistance'],
    text: (c) => `Overnight-shift workers in ${c.nb} call us more than you'd expect. Nurses, hospital staff, airport workers at JFK and LGA — they finish at 3 AM, walk to a car that won't start on ${c.street1} or near ${c.landmark1}, and need help before their body clock gives out. We answer.` },

  // Flat tire scenarios
  { services: ['flat-tire-change','roadside-assistance'],
    text: (c) => `Pothole-blown tires on ${c.street3}. Queens streets see freeze-thaw cycles that open craters by February, and ${c.nb} has its share of problem blocks. We bring full-size spares when possible and can do a roadside tire swap in about 15-20 minutes, even without a working jack in your trunk.` },
  { services: ['flat-tire-change'],
    text: (c) => `Highway blowouts on the ${c.highway1}. A flat on a limited-access road near ${c.nb} is more dangerous than a residential flat — we come out with highway-safe cones, wear reflective gear, and position the truck as a safety shield while we swap the tire. NYPD-approved procedure.` },

  // Fuel delivery scenarios
  { services: ['fuel-delivery','roadside-assistance'],
    text: (c) => `Ran out of gas between fill-ups near ${c.landmark1}? Happens more than drivers admit. We deliver 2-5 gallons of unleaded or diesel anywhere in ${c.nb} and get you moving to the nearest station. Faster than waiting for a friend with a gas can — and safer than walking along ${c.street2} with a red jerry can at night.` },

  // Winching scenarios
  { services: ['winching-recovery','off-road-recovery'],
    text: (c) => `Vehicles stuck in snowbanks during ${c.nb} storms. January blizzards leave cars pinned in curb drifts, wedged into plowed piles, or high-centered on ice. We winch them out with recovery straps rated for modern unibody frames — no frame twist, no body-panel damage. A common call on side streets off ${c.street1} after heavy snowfall.` },
  { services: ['winching-recovery'],
    text: (c) => `Off-road recoveries near ${c.landmark2}. Not every winching call is dramatic — sometimes it's just a vehicle that slid off a driveway onto soft ground, or parked too close to a mud patch after rain. We winch back to solid pavement without marring the undercarriage.` },

  // Accident scenarios
  { services: ['accident-recovery','heavy-duty-towing'],
    text: (c) => `Collision scenes on the ${c.highway1} require coordinated response. When NYPD calls us to a multi-vehicle incident in ${c.nb}, we roll with both a standard tow and a heavy wrecker if the situation might need debris cleanup. Insurance documentation starts the moment we arrive — photos, vehicle IDs, damage notes — so your claims process is smoother on day one.` },
  { services: ['accident-recovery','flatbed-towing'],
    text: (c) => `Minor collision recoveries near ${c.landmark1}. Not every accident needs a heavy truck — fender benders and low-speed contact calls get a flatbed so the damaged vehicle doesn't take additional stress during transport. We can also coordinate with your insurance adjuster for direct billing.` },

  // Long distance scenarios
  { services: ['long-distance-towing','auto-transport'],
    text: (c) => `Long-haul moves from ${c.nb} to upstate NY, Jersey, or further. We handle scheduled long-distance transports with flat-rate pricing — no per-mile surprise charges. Common destinations include Long Island auto auctions, repair shops in Westchester, and dealerships across the tri-state area.` },

  // Commercial scenarios
  { services: ['commercial-towing','heavy-duty-towing'],
    text: (c) => `Fleet accounts in the ${c.commercialArea1} area. Delivery services, contractors, and local businesses with multiple vehicles all use our commercial towing program — net 30 invoicing, priority dispatch, consolidated reporting. If you manage a fleet that operates through ${c.nb}, our commercial desk can set up an account in 15 minutes.` },

  // Junk car scenarios
  { services: ['junk-car-removal'],
    text: (c) => `End-of-life vehicle removal from ${c.street2} driveways and lots. Non-running vehicles, cars failing inspection, old commercial trucks taking up space — we pick them up in ${c.nb} with no-hassle paperwork and pay cash for certain eligible vehicles. Title in hand or we can walk you through the DMV process.` },

  // Exotic scenarios
  { services: ['exotic-car-towing','flatbed-towing'],
    text: (c) => `Supercar and collector vehicle transport from ${c.nb}. Ferrari, Lamborghini, McLaren, classic Porsche, vintage American iron — all handled on enclosed or open carriers with soft-tie straps, wheel nets, and operators who understand that the wrong tow can cost more than the tow itself. Every exotic call in ${c.nb} gets a dedicated crew.` },

  // Wheel lift / dolly scenarios
  { services: ['wheel-lift-towing','dolly-towing'],
    text: (c) => `Tight-access recoveries in ${c.nb} where a flatbed can't fit. ${c.residentialFeatures1} create narrow driveway and parking situations that require a wheel-lift or dolly setup instead of a full flatbed. We carry both and make the call on arrival based on what the location allows.` },

  // Construction scenarios
  { services: ['construction-equipment-towing','heavy-duty-towing'],
    text: (c) => `Equipment transports around the ${c.commercialArea1} corridor. Mini excavators, skid steers, compressors, generators — construction sites in ${c.nb} frequently need equipment relocated between job sites, and we handle these with lowboy or heavy-duty trailer setups. DOT-compliant, fully insured, and scheduled around your work calendar.` }
];

function pickScenarios(service, s, ctx, count = 2) {
  const eligible = SCENARIO_POOL.filter(sc => sc.services.includes(service.slug) || sc.services.includes('all'));
  if (eligible.length === 0) return [];
  const result = [];
  for (let i = 0; i < count && i < eligible.length; i++) {
    result.push(eligible[(s + i * 7) % eligible.length]);
  }
  return result.map(sc => sc.text(ctx));
}

// ============ FAQ POOL (18 questions — seeded pick of 8 per combo) ============

function buildFaqPool(service, neighborhood, s) {
  const street1 = seedPick(neighborhood.streets, s);
  const street2 = seedPick(neighborhood.streets, s+1);
  const landmark = seedPick(neighborhood.landmarks, s+2);
  const highway = seedPick(neighborhood.highways, s+3);
  const zip = neighborhood.zip.split(',')[0].trim();
  const sn = service.name.toLowerCase();

  return [
    { q: `How fast can you provide ${sn} in ${neighborhood.name}?`,
      a: `Our ${sn} service arrives in ${neighborhood.name} within 15-30 minutes in most cases. We have tow trucks stationed throughout Queens and we prioritize emergency calls. When you call dispatch, we immediately route the nearest available truck to your exact location — whether you're near ${street1}, ${street2}, or anywhere else in ${neighborhood.name}. Response depends on traffic and active call volume, but we consistently average under 30 minutes throughout ${neighborhood.region}.` },
    { q: `How much does ${sn} cost in ${neighborhood.name}, NY?`,
      a: `${service.name} in ${neighborhood.name} typically ranges from $${service.priceMin} to $${service.priceMax}, depending on vehicle type, the specific service needed, distance, time of day, and road conditions. Upfront pricing before any work — no hidden fees. For a precise quote specific to your situation, call ${PHONE} and dispatch will give you a firm price based on exact location and needs.` },
    { q: `Are you available 24/7 in ${neighborhood.name}?`,
      a: `Yes, ${sn} runs 24 hours a day, 7 days a week, 365 days a year throughout ${neighborhood.name} and all of Queens. Whether you need help at 3 AM on a Tuesday, during rush hour on the ${highway}, on Christmas morning, or during a snowstorm, we answer every call and dispatch trucks around the clock. Car problems don't follow business hours; neither do we.` },
    { q: `What areas near ${neighborhood.name} do you serve?`,
      a: `In addition to ${neighborhood.name} (ZIP ${neighborhood.zip}), we serve all surrounding neighborhoods in ${neighborhood.region} and throughout Queens. Our ${sn} service covers every street, highway, and location in the borough. We respond near ${landmark}, along the ${highway}, and throughout ${neighborhood.commercialAreas.split(',')[0]}. No location in Queens is outside our service area.` },
    { q: `What payment methods do you accept for ${sn} in ${neighborhood.name}?`,
      a: `Cash, all major credit cards (Visa, Mastercard, Amex, Discover), debit, and mobile payment. For accident recovery and insurance claims, we can bill your insurance directly. For commercial accounts, we offer net 30 invoicing and fleet billing. Payment is collected when service is completed.` },
    { q: `Do you handle ${service.vehicleTypes.split(',')[0]} in ${neighborhood.name}?`,
      a: `Absolutely. Our ${sn} service in ${neighborhood.name} handles ${service.vehicleTypes}. We have the proper equipment, training, and experience to safely service every type of vehicle on the road. Whether you're near ${landmark} or anywhere else in ${neighborhood.name}, we can handle your specific vehicle with confidence.` },
    { q: `Can you provide ${sn} near ${landmark}?`,
      a: `Yes, ${landmark} is in our regular service area. We respond throughout ${neighborhood.name} including locations near ${landmark}, along ${street1}, and throughout the neighborhood. Our drivers know these streets and can reach you quickly regardless of your specific location.` },
    { q: `What if I need ${sn} on the ${highway}?`,
      a: `We handle calls on the ${highway} and all major highways in ${neighborhood.region}. Highway calls require extra safety precautions, and our drivers are trained in highway recovery procedures. When you call, tell dispatch your exact location (mile marker, nearest exit, or landmark) and we'll respond with appropriate equipment and safety gear.` },
    { q: `Do you offer other services besides ${sn} in ${neighborhood.name}?`,
      a: `Yes. Beyond ${sn}, we provide complete towing and roadside assistance throughout ${neighborhood.name}: emergency towing, flatbed, heavy duty, motorcycle, lockouts, jump starts, tire changes, fuel delivery, winching, accident recovery, long distance towing, and more. One call handles whatever automotive emergency you're facing.` },
    { q: `How do I request ${sn} service in ${neighborhood.name}?`,
      a: `Call ${PHONE} and tell dispatch your exact location (cross streets or address), vehicle information, and what happened. We immediately dispatch the nearest appropriate truck and give you an ETA. You can also chat with our AI dispatcher Ayah directly on our website. Either way, help is on the way within minutes.` },
    { q: `Do you tow to any shop or only yours?`,
      a: `We tow wherever you want. Your mechanic, your dealership, your home, a collision center, an insurance-preferred shop — your call. We're a neutral service provider, not a shop trying to steer business. You choose the destination in ${neighborhood.name} or anywhere else within a reasonable range.` },
    { q: `Will my insurance cover ${sn} in ${neighborhood.name}?`,
      a: `Most comprehensive and collision policies include towing and roadside coverage, and many auto clubs (AAA, Better World, etc.) do as well. We work with all major insurance carriers and can bill directly if your policy allows. Bring your insurance card when we arrive, or have the info ready when you call dispatch, and we'll verify what's covered before we begin.` },
    { q: `Can you tow an all-wheel-drive or 4x4 vehicle safely in ${neighborhood.name}?`,
      a: `Yes — AWD and 4x4 vehicles generally require flatbed towing to avoid drivetrain damage, and we default to flatbed for these vehicles in ${neighborhood.name}. Our operators are trained on the specific procedures for each drive type, and we confirm the right equipment when you describe your vehicle on the dispatch call.` },
    { q: `What do I do while I wait for the tow truck in ${neighborhood.name}?`,
      a: `Safety first: if you're on the ${highway} or any busy street, turn on hazards, exit the vehicle on the non-traffic side if possible, and wait behind the guardrail or on the sidewalk. On residential streets like ${street1}, stay with the vehicle and keep the hazards on. Our dispatcher will give you a real-time ETA and can stay on the line if you're in a stressful spot.` },
    { q: `Do you charge extra for late-night or holiday ${sn} in ${neighborhood.name}?`,
      a: `Our base pricing covers 24/7 service — no surprise overnight surcharge. Holidays and severe weather can add a small premium due to increased demand and safety requirements, but we disclose any adjustment upfront before we dispatch. No bait-and-switch.` },
    { q: `Can you help if my keys are locked in the car near ${landmark}?`,
      a: `Yes — we provide lockout service throughout ${neighborhood.name}, including around ${landmark}. Our operators use non-damaging tools designed for modern vehicles, so there's no risk of scratched paint or broken trim. Most lockouts in ${neighborhood.name} are resolved in under 10 minutes on site.` },
    { q: `What if my car is blocking traffic on ${street1}?`,
      a: `A vehicle blocking traffic is a priority dispatch for us. Call ${PHONE} immediately, let dispatch know it's a traffic hazard on ${street1}, and we'll route the closest truck with lights and the proper equipment to clear it fast and safely. We coordinate with NYPD when a police report is involved.` },
    { q: `Do you do commercial or fleet ${sn} in ${neighborhood.name}?`,
      a: `Yes. We service commercial fleets throughout ${neighborhood.name} and ${neighborhood.region} — delivery vans, box trucks, contractor vehicles, rideshare. Net 30 billing, consolidated invoicing, and priority dispatch for contracted fleets. Contact us through ${PHONE} or the contact page to set up a commercial account.` }
  ];
}

// Pick 8 FAQs from the pool using seeded rotation (first 2 always kept for consistency)
function generateFaqs(service, neighborhood, s) {
  const pool = buildFaqPool(service, neighborhood, s);
  const result = [pool[0], pool[1]]; // always keep pricing + response time
  const remaining = pool.slice(2);
  for (let i = 0; i < 6; i++) {
    result.push(remaining[(s + i * 3) % remaining.length]);
  }
  return result;
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
  const url = `${SITE_URL}/services/${service.slug}-in-${neighborhood.slug}-queens-ny/`;
  const h1 = `${service.name} in ${neighborhood.name}, Queens NY`;

  const faqs = generateFaqs(service, neighborhood, s);

  // Shared variant context — passed to every variant function
  const ctx = {
    nb: neighborhood.name,
    zip: zipFirst,
    zipFull: zip,
    region: neighborhood.region,
    service: service.name,
    serviceLower: service.name.toLowerCase(),
    serviceShort: service.short.toLowerCase(),
    serviceIntro: service.intro,
    street1, street2, street3,
    landmark1, landmark2,
    highway1, highway2,
    streetsList: streets.slice(0,4).join(', '),
    commercialArea: neighborhood.commercialAreas,
    commercialArea1: neighborhood.commercialAreas.split(',')[0].trim(),
    residentialFeatures: neighborhood.residentialFeatures,
    residentialFeatures1: neighborhood.residentialFeatures.split(',')[0].trim()
  };

  // Pick 2 service-matched scenarios for this combo
  const scenarios = pickScenarios(service, s, ctx, 2);

  // Service → hero mapping. Real photos used where we have relevant imagery;
  // branded SVGs for service categories without matching photos.
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
  const heroImage = HERO_MAP[service.slug] || '/images/tow-truck-queens-street.jpg';
  const heroWebp = heroImage.endsWith('.svg') ? null : heroImage.replace(/\.jpg$/, '.webp');

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
          },
          "sameAs": SAME_AS,
          "hasMap": GBP_URL
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
<script async src="https://www.googletagmanager.com/gtag/js?id=G-897CFT6D36"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','G-897CFT6D36');</script>
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
        <li><a href="/blog/">Blog</a></li>
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
    ${heroWebp ? `<picture><source srcset="${heroWebp}" type="image/webp"><img src="${heroImage}" alt="${service.name} in ${neighborhood.name} Queens NY - ${BUSINESS_NAME}" style="width:100%;height:100%;object-fit:cover;opacity:0.45;" loading="eager"></picture>` : `<img src="${heroImage}" alt="${service.name} in ${neighborhood.name} Queens NY - ${BUSINESS_NAME}" style="width:100%;height:100%;object-fit:cover;opacity:0.35;" loading="eager">`}
  </div>
  <div class="container">
    <div class="hero-label">${service.name} &middot; ${neighborhood.name} &middot; Queens NY</div>
    <h1><em>${service.name}<br>in <span class="accent">${neighborhood.name}, NYC</span></em></h1>
    <p>${pickVariant(HERO_INTRO_VARIANTS, s)(ctx)}</p>
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
    <p style="font-size:1.1rem;line-height:1.85;color:#444;margin-bottom:20px;">${pickVariant(OPENING_P1_VARIANTS, s+1)(ctx)}</p>

    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${pickVariant(OPENING_P2_VARIANTS, s+2)(ctx)}</p>

    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">${pickVariant(OPENING_P3_VARIANTS, s+3)(ctx)}</p>

    <h2>Why ${neighborhood.name} Residents Choose Our ${service.name} Service</h2>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${service.whyNeeded}</p>
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">${pickVariant(WHY_HERE_VARIANTS, s+4)(ctx)}</p>

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

    <h2>Real ${service.name} Scenarios We Handle in ${neighborhood.name}</h2>
    ${scenarios.map(sc => `<p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:20px;">${sc}</p>`).join('')}
    <p style="font-size:1.05rem;line-height:1.85;color:#444;margin-bottom:30px;">Whatever the situation, we've probably seen it in ${neighborhood.name} before. Beyond ${service.name.toLowerCase()}, we provide complete automotive emergency services here — if you called for one thing and it turns out you need another, we can handle it on the spot without a second dispatch.</p>

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
    <p style="font-size:1.1rem;line-height:1.85;color:#444;margin-bottom:20px;">${pickVariant(CALL_NOW_VARIANTS, s+5)(ctx)}</p>
    <div style="text-align:center;padding:40px;background:linear-gradient(135deg,#0a0a0a,#1a1a1a);border-radius:16px;margin:30px 0;">
      <p style="color:#fff;font-size:1.2rem;margin-bottom:20px;">Need ${service.name} in ${neighborhood.name} right now?</p>
      <a href="${PHONE_HREF}" style="display:inline-block;background:linear-gradient(135deg,#d4a017,#b8860b);color:#0a0a0a;padding:20px 40px;border-radius:100px;font-size:1.5rem;font-weight:800;text-decoration:none;">&#9742; Call ${PHONE}</a>
      <p style="color:#999;margin-top:16px;font-size:0.9rem;">24/7 dispatch &middot; 15-30 minute response &middot; Licensed &amp; insured</p>
    </div>

    <h2>More About <a href="/neighborhoods/${neighborhood.slug}/" style="color:#d4a017;">${neighborhood.name}, Queens</a></h2>
    <p style="font-size:1rem;line-height:1.75;color:#555;margin-bottom:15px;">Learn more about our full towing and roadside assistance coverage in <a href="/neighborhoods/${neighborhood.slug}/" style="color:#d4a017;font-weight:600;">${neighborhood.name}</a>, including response times, service details, and local coverage maps.</p>

    <h2>All Services in ${neighborhood.name}</h2>
    <p style="font-size:1rem;line-height:1.75;color:#555;margin-bottom:15px;">Need a different service in <a href="/neighborhoods/${neighborhood.slug}/" style="color:#d4a017;">${neighborhood.name}</a>? We offer all of these:</p>
    <ul style="font-size:1rem;line-height:1.9;margin-bottom:30px;padding-left:20px;">
      ${services.filter(x=>x.slug!==service.slug).map(x => `<li><a href="/services/${x.slug}-in-${neighborhood.slug}-queens-ny/" style="color:#d4a017;">${x.name} in ${neighborhood.name}</a></li>`).join('')}
    </ul>

    <h2>More About <a href="/services/${service.slug}/" style="color:#d4a017;">${service.name}</a></h2>
    <p style="font-size:1rem;line-height:1.75;color:#555;margin-bottom:15px;">Visit our main <a href="/services/${service.slug}/" style="color:#d4a017;font-weight:600;">${service.name}</a> page for complete details about this service across all of Queens.</p>

    <h2>${service.name} in Nearby Neighborhoods</h2>
    <p style="font-size:1rem;line-height:1.75;color:#555;margin-bottom:15px;">We also provide <a href="/services/${service.slug}/" style="color:#d4a017;">${service.name.toLowerCase()}</a> in these nearby Queens neighborhoods:</p>
    <ul style="font-size:1rem;line-height:1.9;margin-bottom:30px;padding-left:20px;">
      ${neighborhoods.filter(n=>n.slug!==neighborhood.slug && n.region===neighborhood.region).slice(0,10).map(n => `<li><a href="/services/${service.slug}-in-${n.slug}-queens-ny/" style="color:#d4a017;">${service.name} in <strong>${n.name}</strong></a></li>`).join('')}
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
          <li><a href="/blog/">Blog</a></li>
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
<script src="/js/analytics.js" defer></script>
<script src="/js/ayah-chat.js" defer></script>
<script src="/js/tawkto.js" defer></script>
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
