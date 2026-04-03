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
    const { name, phone, email, message, source, page } = req.body;

    if (!name && !phone) {
      return res.status(400).json({ error: 'Name or phone required' });
    }

    // Save to Supabase (same database as contact form)
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (supabaseUrl && supabaseKey) {
      await fetch(`${supabaseUrl}/rest/v1/leads`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=minimal',
        },
        body: JSON.stringify({
          name: name || '',
          phone: phone || '',
          email: email || '',
          message: message || '',
          source: source || 'website',
          page: page || '/',
          created_at: new Date().toISOString(),
        }),
      }).catch(() => {});
    }

    // Send Telegram notification
    const time = new Date().toLocaleString('en-US', { timeZone: 'America/New_York' });
    await notifyTelegram(
      `🚨 NEW LEAD\nName: ${name || 'Unknown'}\nPhone: ${phone || 'No phone'}\nNeed: ${message || 'N/A'}\nSource: ${source || 'website'}\nPage: ${page || '/'}\nTime: ${time}`
    );

    return res.status(200).json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to save lead' });
  }
}
