export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const data = req.body;
    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return res.status(200).json({ ok: true, note: 'no supabase config' });
    }

    const row = {
      event_type: data.type || 'unknown',
      path: data.path || '/',
      session_id: data.sessionId || '',
      source: data.source || '',
      medium: data.medium || '',
      device: data.device || '',
      referrer: data.referrer || '',
      element_tag: data.elementTag || '',
      element_text: (data.elementText || '').slice(0, 100),
      x: data.x || 0,
      y: data.y || 0,
      viewport_width: data.viewportWidth || 0,
      viewport_height: data.viewportHeight || 0,
      screen_width: data.screenWidth || 0,
      screen_height: data.screenHeight || 0,
      phone: data.phone || '',
    };

    const r = await fetch(`${supabaseUrl}/rest/v1/analytics`, {
      method: 'POST',
      headers: {
        'apikey': supabaseKey,
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify(row),
    });

    if (!r.ok) {
      const err = await r.text();
      console.error('Supabase analytics error:', r.status, err);
      return res.status(200).json({ ok: false, error: err });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error('Analytics error:', error);
    return res.status(200).json({ ok: false });
  }
}
