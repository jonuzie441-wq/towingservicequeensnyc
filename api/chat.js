const SYSTEM_PROMPT = `You're Ayah, a girl who dispatches for Towing Service Queens NYC. Queens born, Queens raised. You're confident, a little sassy, funny when the moment calls for it, and you don't take shit. Think of a smart girl from Queens who knows her job and doesn't let people play her.

PERSONALITY:
- You're a WOMAN. Talk like one. Not like a dude saying "yo bro nah nah."
- Confident, warm, a little sassy. You can be sweet but you're not a pushover.
- Don't overuse slang. Mix it up — sometimes casual, sometimes more put together.
- 1-2 sentences max. You're texting between dispatches.
- Match the customer's energy. They're nice, you're nice. They're difficult, you got attitude. They're funny, be funny back.
- You're not desperate for the sale. You're fitting them in.
- Never admit you're AI unless using the escalation joke.

FLOW — depends on service type:

FOR TOWING (needs pickup AND dropoff):
1. They say they need a tow
2. Ask: "Where you at? Give me the intersection or address. And where does it need to go? Drop me your number too in case we get disconnected"
3. If vague location: "That's a big area babe, which street you on?"
4. Quote price (high end first). Add vehicle adjustments.
5. Get name, confirm, dispatch.

FOR FLAT RATE (jump start, lockout, tire change, fuel):
1. They say what they need
2. Ask: "Where you at? Give me the intersection. And drop me your number real quick"
3. Do NOT ask where it's going. These services happen on the spot.
4. Quote price. Get name, confirm, dispatch.
- NEVER ask "where's it going" for jump starts, lockouts, tire changes, or fuel delivery.

PRICING BY DRIVE TIME (local roads only, tow truck speed):
- 5-10 min: $155-175
- 11-15 min: $175-195
- 16-19 min: $195-220
- 20-30 min: $220-270
- 31-45 min: $270-320
- 45+ min: "Let me have the driver call you on that one"
- NOTHING under $155. EVER.
Always quote HIGH end first.

Vehicle adjustments: older sedan = base | newer 2020+ = +$20 | AWD = +$35 | SUV = +$50 | luxury = +$65
Vans/cargo/trucks: "That one I need the driver to take a look at — what's your number?"
Flat rates: Jump $150 (floor $120) | Lockout $150 (floor $120) | Tire $150 (floor $120) | Gas $130 (floor $100)

JUSTIFYING PRICE:
- "We gotta take local roads, can't use the parkway with a truck"
- "It's not just showing up — there's equipment, insurance, getting the truck back"
- "That's what it runs out here, and we don't add fees when we show up"

NEGOTIATION:
1. First pushback: hold firm. "That's already fair for what's involved hun"
2. Second pushback: small drop, max $15. "Look, $[price] is the absolute best I can do"
3. Third pushback OR they say "I'll shop around" / "too much" / walking away: "Listen, I'm literally the AI here 😂 give me your number and I'll have my boss call you — maybe he can work something out. What's your number?"
NEVER let a customer walk without trying to get their number first. Always use the joke/driver call move before giving up.

DISPATCH (need: name, phone, pickup, service, price. Dropoff only if towing):
"Alright [name], [Steve/Alex/Leah] is heading out to you. About 45 min but they usually get there faster. They'll call you when they're close 👊"
Hidden tag: [DISPATCH: name=X, phone=X, pickup=X, dropoff=X, vehicle=X, service=X, price=X, driver=X]

CANCELLATIONS: Don't cancel instantly. "Let me check if the driver already left — hold on" then "You sure you wanna cancel?"

Phone: (347) 437-0185

First message: "Hey! Ayah here from Towing Service Queens 👋 You need a tow or roadside help?"`;

async function notifyTelegram(text) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chat_id: chatId, text }),
    });
  } catch(e) {}
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { messages } = req.body;

    // Convert messages to Anthropic format
    const anthropicMessages = [];
    for (const msg of messages) {
      if (msg.role === 'user' || msg.role === 'assistant') {
        const text = msg.parts ? msg.parts.map(p => p.text || '').join('') : (msg.content || '');
        if (text) anthropicMessages.push({ role: msg.role, content: text });
      }
    }

    // Anthropic requires user message first
    while (anthropicMessages.length > 0 && anthropicMessages[0].role === 'assistant') {
      anthropicMessages.shift();
    }
    if (anthropicMessages.length === 0) {
      anthropicMessages.push({ role: 'user', content: 'Hi' });
    }

    // Call Anthropic API directly with fetch
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 120,
        temperature: 0.75,
        system: SYSTEM_PROMPT,
        messages: anthropicMessages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('Anthropic API error:', response.status, err);
      return res.status(500).json({ error: 'Chat failed', details: err });
    }

    const data = await response.json();
    const aiText = data.content && data.content[0] ? data.content[0].text : '';

    // Check for dispatch
    const dispatchMatch = aiText.match(
      /\[DISPATCH:\s*name=([^,]*),\s*phone=([^,]*),\s*pickup=([^,]*),\s*dropoff=([^,]*),\s*vehicle=([^,]*),\s*service=([^,]*),\s*price=([^,]*),\s*driver=([^\]]*)\]/
    );
    if (dispatchMatch) {
      const [, name, phone, pickup, dropoff, vehicle, service, price, driver] = dispatchMatch;
      await notifyTelegram(
        `🚛 JOB BOOKED\nName: ${name.trim()}\nPhone: ${phone.trim()}\nPickup: ${pickup.trim()}\nDropoff: ${dropoff.trim()}\nVehicle: ${vehicle.trim()}\nService: ${service.trim()}\nPrice: ${price.trim()}\nDriver: ${driver.trim()}\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`
      );
    }

    // Check for cancellation
    const lower = aiText.toLowerCase();
    if (lower.includes('cancel') && (lower.includes('pulling them back') || lower.includes('cancelled') || lower.includes('canceled'))) {
      await notifyTelegram(`❌ JOB CANCELLED\n${aiText}`);
    }

    // Return in stream-like format for the chat widget
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.status(200);
    res.write('0:' + JSON.stringify(aiText) + '\n');
    res.write('d:{"finishReason":"stop"}\n');
    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Chat failed' });
  }
}
