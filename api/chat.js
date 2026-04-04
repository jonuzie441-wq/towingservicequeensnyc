const SYSTEM_PROMPT = `You're Ayah, dispatcher at Towing Service Queens NYC. Queens girl. Confident, warm, a little sassy. 1-2 sentences max — you're texting.

RULES:
- Keep it SHORT. Don't over-ask. Don't confirm things twice. Don't ask "what's your name" over and over.
- Once you have their phone number, you're done collecting info. Move to quote or send to driver.
- Never ask for name more than once. If they don't give it, use "hun" or skip it.
- Never admit you're AI unless doing the joke.

FLOW FOR TOWING:
1. They say what they need
2. Ask pickup intersection, dropoff, vehicle type, and number — all in ONE message: "Where you at and where's it going? What kind of car? And drop me your number real quick"
3. Once you have that info → quote price
4. If they agree → "Alright, driver is heading your way. About 45 min, they'll call when close 👊" + DISPATCH tag
5. If they push back on price → hold firm once, drop $15 max once, then go to step 6
6. If still pushing → "Alright I'm just the AI 😂 let me have someone call you real quick to work it out" + CALLBACK tag. DONE. Stop talking.

FLOW FOR FLAT RATE (jump, lockout, tire, fuel):
1. They say what they need
2. Ask location and number in ONE message: "Where you at? And what's your number real quick"
3. Do NOT ask dropoff. Quote price.
4. Same negotiation as above.

THE MOMENT YOU HAVE THEIR PHONE NUMBER AND NEED TO SEND TO DRIVER:
Just say "Alright let me have someone call you shortly to work it out 👊" + add the CALLBACK tag. DONE. Don't keep chatting.

PRICING:
Towing by drive time (local roads, tow truck): 5-10min=$155-175 | 11-15=$175-195 | 16-19=$195-220 | 20-30=$220-270 | 31-45=$270-320 | 45+="driver will call you"
Vehicle adds: older sedan=base | newer 2020+=+$20 | AWD=+$35 | SUV=+$50 | luxury=+$65
Vans/trucks: send to driver call
Flat: Jump=$150(min$120) | Lockout=$150(min$120) | Tire=$150(min$120) | Gas=$130(min$100)
Floor: $155 minimum on towing. Always.
Quote HIGH end first.

PRICE JUSTIFICATION (only if asked): local roads only, equipment, insurance, no hidden fees.

TAGS (customer never sees these):
Dispatch: [DISPATCH: name=X, phone=X, pickup=X, dropoff=X, vehicle=X, service=X, price=X, driver=X]
Callback: [CALLBACK: name=X, phone=X, pickup=X, dropoff=X, vehicle=X, note=X]
Use "unknown" for name if they didn't give one. Use "on-site" for dropoff on flat rate.
Drivers: Steve, Alex, or Leah.

Phone: (347) 437-0185

First message: "Hey! Ayah here from Towing Service Queens 👋 You need a tow or roadside help?"`;

async function saveLead(lead) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return;
  try {
    await fetch(`${supabaseUrl}/rest/v1/leads`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(lead),
    });
  } catch(e) { console.error('Save lead error:', e); }
}

async function saveChat(sessionId, role, content) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
  if (!supabaseUrl || !supabaseKey) return;
  try {
    await fetch(`${supabaseUrl}/rest/v1/chats`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ session_id: sessionId, role, content }),
    });
  } catch(e) {}
}

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
    // 3 second delay to feel like a real person typing
    await new Promise(resolve => setTimeout(resolve, 3000));

    const { messages, sessionId } = req.body;
    const sid = sessionId || ('chat_' + Date.now());

    // Save last user message
    const lastMsg = messages[messages.length - 1];
    if (lastMsg && lastMsg.role === 'user') {
      const userText = lastMsg.parts ? lastMsg.parts.map(p => p.text || '').join('') : (lastMsg.content || '');
      if (userText && userText.toLowerCase() !== 'hi') {
        saveChat(sid, 'user', userText).catch(() => {});
      }
    }

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

    // Save Ayah's response
    const cleanText = aiText.replace(/\[DISPATCH:[^\]]*\]/g, '').replace(/\[CALLBACK:[^\]]*\]/g, '').trim();
    if (cleanText) {
      saveChat(sid, 'assistant', cleanText).catch(() => {});
    }

    // Check for dispatch
    const dispatchMatch = aiText.match(
      /\[DISPATCH:\s*name=([^,]*),\s*phone=([^,]*),\s*pickup=([^,]*),\s*dropoff=([^,]*),\s*vehicle=([^,]*),\s*service=([^,]*),\s*price=([^,]*),\s*driver=([^\]]*)\]/
    );
    if (dispatchMatch) {
      const [, name, phone, pickup, dropoff, vehicle, service, price, driver] = dispatchMatch;
      await notifyTelegram(
        `🚛 JOB BOOKED\nName: ${name.trim()}\nPhone: ${phone.trim()}\nPickup: ${pickup.trim()}\nDropoff: ${dropoff.trim()}\nVehicle: ${vehicle.trim()}\nService: ${service.trim()}\nPrice: ${price.trim()}\nDriver: ${driver.trim()}\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}`
      );
      await saveLead({
        name: name.trim(),
        phone: phone.trim(),
        message: `Pickup: ${pickup.trim()} | Dropoff: ${dropoff.trim()} | Vehicle: ${vehicle.trim()} | Service: ${service.trim()} | Price: ${price.trim()} | Driver: ${driver.trim()}`,
        source: 'ayah-dispatch',
        page: '/',
      });
    }

    // Check for callback request (sent to driver/boss for pricing)
    const callbackMatch = aiText.match(
      /\[CALLBACK:\s*name=([^,]*),\s*phone=([^,]*),\s*pickup=([^,]*),\s*dropoff=([^,]*),\s*vehicle=([^,]*),\s*note=([^\]]*)\]/
    );
    if (callbackMatch) {
      const [, name, phone, pickup, dropoff, vehicle, note] = callbackMatch;
      await notifyTelegram(
        `📞 CALLBACK NEEDED\nCustomer wants a call about pricing!\nName: ${name.trim()}\nPhone: ${phone.trim()}\nPickup: ${pickup.trim()}\nDropoff: ${dropoff.trim()}\nVehicle: ${vehicle.trim()}\nNote: ${note.trim()}\nTime: ${new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })}\n\nCALL THEM NOW!`
      );
      await saveLead({
        name: name.trim(),
        phone: phone.trim(),
        message: `CALLBACK - Pickup: ${pickup.trim()} | Dropoff: ${dropoff.trim()} | Vehicle: ${vehicle.trim()} | Note: ${note.trim()}`,
        source: 'ayah-callback',
        page: '/',
      });
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
