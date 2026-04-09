#!/usr/bin/env node
/**
 * Citation Builder — Semi-Automated Directory Submissions
 * Opens each directory, pre-fills what it can, waits for you to handle CAPTCHAs
 *
 * Usage: node scripts/citation-builder.js
 * Or:    node scripts/citation-builder.js --start=5  (skip first 4)
 */

const puppeteer = require('puppeteer');
const readline = require('readline');

// ============ YOUR BUSINESS INFO ============
const BIZ = {
  name: 'Jonuzi Towing',
  address: '155-57 Bayview Ave',
  city: 'Rosedale',
  state: 'NY',
  zip: '11422',
  phone: '(347) 437-0185',
  phoneClean: '3474370185',
  website: 'https://towingservicequeensnyc.com',
  email: 'info@towingservicequeensnyc.com',
  hours: '24 hours, 7 days a week',
  category: 'Towing Service',
  shortDesc: '24/7 emergency towing & roadside assistance across all Queens, NY neighborhoods. Fast 15-30 min response. Call (347) 437-0185.',
  longDesc: 'Jonuzi Towing is Queens\' trusted 24/7 towing and roadside assistance provider, serving all 115+ neighborhoods from Astoria to Far Rockaway. We specialize in emergency towing, flatbed towing, heavy-duty towing, motorcycle towing, lockout service, jump starts, flat tire changes, fuel delivery, winching & recovery, accident recovery, junk car removal, exotic car transport, and long-distance towing. Our team responds in 15-30 minutes with professional, fully-equipped tow trucks. No hidden fees — upfront pricing on every call.',
  facebook: 'https://www.facebook.com/profile.php?id=61582313440260',
  instagram: 'https://www.instagram.com/jonuzitowing/',
  youtube: 'https://www.youtube.com/channel/UCOM6eHY6etVHo-Oq43pqk3Q',
  gbp: 'https://www.google.com/maps/place/?q=place_id:ChIJO4EuBb6Qa2cR4y7bzZoOXXc',
};

// ============ DIRECTORIES ============
const DIRECTORIES = [
  {
    name: 'Yelp',
    url: 'https://biz.yelp.com/signup_business/new',
    tier: 1,
    auto: false,
    notes: 'Requires account creation + phone verification. Fill manually.',
  },
  {
    name: 'Apple Business Connect',
    url: 'https://businessconnect.apple.com/',
    tier: 1,
    auto: false,
    notes: 'Requires Apple ID. Search for your business, claim it.',
  },
  {
    name: 'Bing Places',
    url: 'https://www.bingplaces.com/',
    tier: 1,
    auto: false,
    notes: 'Can import from Google Business Profile — use that option.',
  },
  {
    name: 'BBB',
    url: 'https://www.bbb.org/get-listed',
    tier: 1,
    auto: false,
    notes: 'Free listing available. Fill out the form.',
  },
  {
    name: 'Yellow Pages',
    url: 'https://adsolutions.yp.com/free-listing',
    tier: 1,
    auto: false,
    notes: 'Free listing. Fill form with business info.',
  },
  {
    name: 'Foursquare',
    url: 'https://business.foursquare.com/add-your-business',
    tier: 1,
    auto: false,
    notes: 'Add your business location. Quick form.',
  },
  {
    name: 'MapQuest',
    url: 'https://www.mapquest.com/add-a-business',
    tier: 2,
    auto: false,
    notes: 'Uses Yext — add business listing.',
  },
  {
    name: 'Hotfrog',
    url: 'https://www.hotfrog.com/add-a-business',
    tier: 2,
    auto: true,
    fields: async (page) => {
      await tryType(page, '[name="company_name"], #company_name, input[placeholder*="usiness"]', BIZ.name);
      await tryType(page, '[name="address"], #address, input[placeholder*="ddress"]', BIZ.address);
      await tryType(page, '[name="city"], #city, input[placeholder*="ity"]', BIZ.city);
      await tryType(page, '[name="state"], #state, input[placeholder*="tate"]', BIZ.state);
      await tryType(page, '[name="zip"], #zip, input[placeholder*="ip"]', BIZ.zip);
      await tryType(page, '[name="phone"], #phone, input[placeholder*="hone"]', BIZ.phone);
      await tryType(page, '[name="website"], #website, input[placeholder*="ebsite"]', BIZ.website);
      await tryType(page, '[name="email"], #email, input[placeholder*="mail"]', BIZ.email);
      await tryType(page, '[name="description"], textarea', BIZ.shortDesc);
    },
  },
  {
    name: 'Brownbook',
    url: 'https://www.brownbook.net/add-company/',
    tier: 2,
    auto: true,
    fields: async (page) => {
      await tryType(page, '[name="company_name"], #name, input[placeholder*="ompany"]', BIZ.name);
      await tryType(page, '[name="address"], input[placeholder*="ddress"]', BIZ.address + ', ' + BIZ.city + ', ' + BIZ.state + ' ' + BIZ.zip);
      await tryType(page, '[name="phone"], input[placeholder*="hone"]', BIZ.phone);
      await tryType(page, '[name="website"], input[placeholder*="ebsite"]', BIZ.website);
      await tryType(page, '[name="email"], input[placeholder*="mail"]', BIZ.email);
      await tryType(page, 'textarea', BIZ.shortDesc);
    },
  },
  {
    name: 'Cylex',
    url: 'https://www.cylex.us.com/add-company.html',
    tier: 2,
    auto: true,
    fields: async (page) => {
      await tryType(page, '[name="company"], input[placeholder*="ompany"]', BIZ.name);
      await tryType(page, '[name="street"], input[placeholder*="treet"]', BIZ.address);
      await tryType(page, '[name="city"], input[placeholder*="ity"]', BIZ.city);
      await tryType(page, '[name="zip"], input[placeholder*="ip"]', BIZ.zip);
      await tryType(page, '[name="phone"], input[placeholder*="hone"]', BIZ.phone);
      await tryType(page, '[name="website"], input[placeholder*="ebsite"]', BIZ.website);
      await tryType(page, '[name="email"], input[placeholder*="mail"]', BIZ.email);
    },
  },
  {
    name: 'n49',
    url: 'https://www.n49.com/add-business',
    tier: 2,
    auto: true,
    fields: async (page) => {
      await tryType(page, '[name="name"], input[placeholder*="usiness"]', BIZ.name);
      await tryType(page, '[name="address"], input[placeholder*="ddress"]', BIZ.address);
      await tryType(page, '[name="city"], input[placeholder*="ity"]', BIZ.city);
      await tryType(page, '[name="phone"], input[placeholder*="hone"]', BIZ.phone);
      await tryType(page, '[name="website"], input[placeholder*="ebsite"]', BIZ.website);
    },
  },
  {
    name: 'ShowMeLocal',
    url: 'https://www.showmelocal.com/addyourbusiness.aspx',
    tier: 3,
    auto: true,
    fields: async (page) => {
      await tryType(page, '[name*="BusinessName"], input[id*="Business"]', BIZ.name);
      await tryType(page, '[name*="Address"], input[id*="Address"]', BIZ.address);
      await tryType(page, '[name*="City"], input[id*="City"]', BIZ.city);
      await tryType(page, '[name*="Zip"], input[id*="Zip"]', BIZ.zip);
      await tryType(page, '[name*="Phone"], input[id*="Phone"]', BIZ.phone);
      await tryType(page, '[name*="Website"], input[id*="Web"]', BIZ.website);
      await tryType(page, '[name*="Email"], input[id*="Email"]', BIZ.email);
    },
  },
  {
    name: 'Manta',
    url: 'https://www.manta.com/claim',
    tier: 2,
    auto: false,
    notes: 'Search for your business, claim or add it.',
  },
  {
    name: 'Nextdoor Business',
    url: 'https://business.nextdoor.com/',
    tier: 2,
    auto: false,
    notes: 'Create business account. Strong for local visibility.',
  },
  {
    name: 'Thumbtack',
    url: 'https://www.thumbtack.com/pro',
    tier: 2,
    auto: false,
    notes: 'Sign up as a pro. Good for lead generation too.',
  },
  {
    name: 'Alignable',
    url: 'https://www.alignable.com/signup',
    tier: 3,
    auto: false,
    notes: 'Business networking. Create free profile.',
  },
  {
    name: 'Chamber of Commerce',
    url: 'https://www.chamberofcommerce.com/add-your-business',
    tier: 3,
    auto: true,
    fields: async (page) => {
      await tryType(page, '[name="business_name"], input[placeholder*="usiness"]', BIZ.name);
      await tryType(page, '[name="address"], input[placeholder*="ddress"]', BIZ.address);
      await tryType(page, '[name="city"], input[placeholder*="ity"]', BIZ.city);
      await tryType(page, '[name="state"], input[placeholder*="tate"]', BIZ.state);
      await tryType(page, '[name="zip"], input[placeholder*="ip"]', BIZ.zip);
      await tryType(page, '[name="phone"], input[placeholder*="hone"]', BIZ.phone);
      await tryType(page, '[name="website"], input[placeholder*="ebsite"]', BIZ.website);
    },
  },
  {
    name: 'Towing.com',
    url: 'https://www.towing.com/Company/Register/',
    tier: 2,
    auto: false,
    notes: 'Industry directory. Register your towing company.',
  },
  {
    name: 'Angi (Angie\'s List)',
    url: 'https://www.angi.com/pro/signup',
    tier: 2,
    auto: false,
    notes: 'Create pro account. Good for leads.',
  },
  {
    name: 'Bark',
    url: 'https://www.bark.com/en/us/company-registration/',
    tier: 3,
    auto: false,
    notes: 'Register as service provider.',
  },
];

// ============ HELPERS ============
async function tryType(page, selector, value) {
  try {
    const selectors = selector.split(', ');
    for (const sel of selectors) {
      try {
        const el = await page.$(sel);
        if (el) {
          await el.click({ clickCount: 3 }); // select all
          await el.type(value, { delay: 30 });
          return true;
        }
      } catch (e) { /* try next selector */ }
    }
  } catch (e) { /* field not found, skip */ }
  return false;
}

function prompt(question) {
  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  return new Promise(resolve => rl.question(question, ans => { rl.close(); resolve(ans); }));
}

// ============ MAIN ============
async function main() {
  const startIdx = parseInt(process.argv.find(a => a.startsWith('--start='))?.split('=')[1] || '0');

  console.log('\n========================================');
  console.log('  JONUZI TOWING — Citation Builder');
  console.log('========================================');
  console.log(`\nBusiness: ${BIZ.name}`);
  console.log(`Address:  ${BIZ.address}, ${BIZ.city}, ${BIZ.state} ${BIZ.zip}`);
  console.log(`Phone:    ${BIZ.phone}`);
  console.log(`Website:  ${BIZ.website}`);
  console.log(`\nDirectories to submit: ${DIRECTORIES.length}`);
  if (startIdx > 0) console.log(`Starting from #${startIdx + 1}`);
  console.log('\nThe browser will open. For each directory:');
  console.log('  - Auto-fill directories: fields will be pre-filled');
  console.log('  - Manual directories: page opens, you fill + submit');
  console.log('  - Handle any CAPTCHAs yourself');
  console.log('  - Press ENTER here when done with each one\n');

  // Copy business info to clipboard for easy pasting
  const clipboardText = `${BIZ.name}\n${BIZ.address}\n${BIZ.city}, ${BIZ.state} ${BIZ.zip}\n${BIZ.phone}\n${BIZ.website}\n${BIZ.email}\n\n${BIZ.shortDesc}`;

  try {
    require('child_process').execSync(`echo ${JSON.stringify(clipboardText)} | clip`, { stdio: 'pipe' });
    console.log('>> Business info copied to clipboard! You can paste anywhere.\n');
  } catch (e) { /* clipboard not available */ }

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--start-maximized'],
  });

  const completed = [];
  const skipped = [];
  const failed = [];

  for (let i = startIdx; i < DIRECTORIES.length; i++) {
    const dir = DIRECTORIES[i];
    console.log(`\n--- [${i + 1}/${DIRECTORIES.length}] ${dir.name} (Tier ${dir.tier}) ---`);

    if (dir.notes) console.log(`    Note: ${dir.notes}`);

    let page;
    try {
      page = await browser.newPage();
      await page.goto(dir.url, { waitUntil: 'domcontentloaded', timeout: 15000 });

      // Wait for page to settle
      await new Promise(r => setTimeout(r, 2000));

      if (dir.auto && dir.fields) {
        console.log('    Auto-filling fields...');
        try {
          await dir.fields(page);
          console.log('    Fields filled! Review and submit manually.');
        } catch (e) {
          console.log('    Some fields could not be auto-filled. Fill manually.');
        }
      } else {
        console.log('    Page opened. Fill out the form manually.');
      }

      const action = await prompt('\n    Press ENTER when done, "s" to skip, "q" to quit: ');

      if (action.toLowerCase() === 'q') {
        console.log('\nQuitting...');
        break;
      } else if (action.toLowerCase() === 's') {
        skipped.push(dir.name);
        console.log(`    Skipped ${dir.name}`);
      } else {
        completed.push(dir.name);
        console.log(`    ✓ ${dir.name} done!`);
      }
    } catch (e) {
      console.log(`    ✗ Error loading ${dir.name}: ${e.message}`);
      failed.push(dir.name);
    }

    // Close the tab
    try { if (page) await page.close(); } catch (e) {}
  }

  // Summary
  console.log('\n========================================');
  console.log('  SUMMARY');
  console.log('========================================');
  console.log(`Completed: ${completed.length} — ${completed.join(', ') || 'none'}`);
  console.log(`Skipped:   ${skipped.length} — ${skipped.join(', ') || 'none'}`);
  console.log(`Failed:    ${failed.length} — ${failed.join(', ') || 'none'}`);
  console.log(`Remaining: ${DIRECTORIES.length - completed.length - skipped.length - failed.length}`);
  console.log('\nDone! Close the browser when ready.');

  await prompt('\nPress ENTER to close browser: ');
  await browser.close();
}

main().catch(e => { console.error('Fatal error:', e); process.exit(1); });
