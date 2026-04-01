export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const { name, phone, email, service, message } = req.body;

    if (!name || !phone) {
      return res.status(400).json({ error: 'Name and phone are required' });
    }

    // Insert into Supabase using service_role key (secure, server-side only)
    const response = await fetch(
      `${process.env.SUPABASE_URL}/rest/v1/contact_messages`,
      {
        method: 'POST',
        headers: {
          'apikey': process.env.SUPABASE_SERVICE_KEY,
          'Authorization': `Bearer ${process.env.SUPABASE_SERVICE_KEY}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
        },
        body: JSON.stringify({ name, phone, email, service, message }),
      }
    );

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Message received!' });
    } else {
      const err = await response.json();
      return res.status(500).json({ error: 'Failed to save message', details: err });
    }
  } catch (error) {
    return res.status(500).json({ error: 'Server error' });
  }
}
