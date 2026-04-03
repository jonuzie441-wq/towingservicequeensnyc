# Deployment Notes — Towing Service Queens NYC

## What was added:
- **Ayah AI Chat** (js/ayah-chat.js) — AI dispatcher on every page
- **Instant Quote Popup** (js/quote-popup.js) — captures leads after 8 sec
- **Custom Analytics** (js/analytics.js) — page views, clicks, call tracking
- **Tawk.to Visitor Tracking** (js/tawkto.js) — silent visitor alerts
- **Chat API** (api/chat.js) — Ayah's brain (Anthropic Claude)
- **Leads API** (api/leads.js) — saves leads + Telegram notification
- **Analytics API** (api/analytics.js) — stores analytics data

## Environment Variables needed on Vercel:
Add these in Vercel Dashboard → Project → Settings → Environment Variables:

```
ANTHROPIC_API_KEY=<your key>
TELEGRAM_BOT_TOKEN=<your token>
TELEGRAM_CHAT_ID=<your chat id>
```
(Already configured via vercel env add)

SUPABASE_URL and SUPABASE_SERVICE_KEY should already be configured.

## Supabase tables needed (create later):
- `leads` table: name, phone, email, message, source, page, created_at
- `analytics` table: event_type, path, session_id, source, medium, device, referrer, element_tag, element_text, x, y, viewport_width, viewport_height, screen_width, screen_height, phone, created_at

## To deploy:
```
cd C:\Users\endri\projects\towingservicequeensnyc
git add -A
git commit -m "Add Ayah AI chat, quote popup, analytics, Telegram notifications"
git push
```
Vercel auto-deploys from GitHub.
