export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-api-key');
  if (req.method === 'OPTIONS') return res.status(200).end();

  // Auth check
  const key = req.headers['x-api-key'];
  if (key !== process.env.ADMIN_API_KEY) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

  const results = { leads: [], analytics: [], contacts: [], chats: [] };

  if (supabaseUrl && supabaseKey) {
    // Fetch leads
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/leads?order=created_at.desc&limit=100`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      if (r.ok) results.leads = await r.json();
    } catch(e) {}

    // Fetch analytics
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/analytics?order=created_at.desc&limit=500`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      if (r.ok) results.analytics = await r.json();
    } catch(e) {}

    // Fetch chats
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/chats?order=created_at.desc&limit=500`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      if (r.ok) results.chats = await r.json();
    } catch(e) {}

    // Fetch contact messages (existing table)
    try {
      const r = await fetch(`${supabaseUrl}/rest/v1/contact_messages?order=created_at.desc&limit=100`, {
        headers: { 'apikey': supabaseKey, 'Authorization': `Bearer ${supabaseKey}` }
      });
      if (r.ok) results.contacts = await r.json();
    } catch(e) {}
  }

  return res.status(200).json(results);
}
