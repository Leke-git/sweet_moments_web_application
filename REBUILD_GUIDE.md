# 🍰 Sweet Moments by Sarah: Master Rebuild Guide

This guide contains everything you need to rebuild the **Sweet Moments by Sarah** platform from scratch on any environment (Vercel, Supabase, n8n).

---

## 🏗️ 1. Tech Stack
- **Frontend**: React 19, Vite, Tailwind CSS 4, Motion (Framer), Lucide Icons.
- **Backend**: Node.js (Express) running on Vercel Serverless Functions.
- **Database & Auth**: Supabase (PostgreSQL + GoTrue Auth).
- **AI**: Google Gemini 3 Flash (via `@google/genai`).
- **Automation**: n8n (Gateway + Telegram Autonomous Agent).

---

## 🔑 2. Environment Variables
Set these in your hosting provider (e.g., Vercel):

| Variable | Type | Description |
| :--- | :--- | :--- |
| `VITE_SUPABASE_URL` | Public | Your Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Public | Your Supabase `anon` public key |
| `VITE_GEMINI_API_KEY` | Public | Google AI Studio API Key (Required for Frontend AI features) |
| `SUPABASE_SERVICE_ROLE_KEY` | Private | Your Supabase `service_role` secret key |
| `GEMINI_API_KEY` | Private | Google AI Studio API Key (Required for Backend AI features) |
| `N8N_GATEWAY_URL` | Private | Your n8n Production Webhook URL |
| `N8N_WEBHOOK_SECRET` | Private | A secret string to secure your n8n gateway |
| `TELEGRAM_BOT_TOKEN` | Private | Token from @BotFather (for the Agent) |

> **Note on Vercel**: Variables used in the frontend (React) **MUST** start with `VITE_`. Variables used in the backend (Express) should **NOT** have the prefix. For Gemini, it's safest to add it twice: once as `GEMINI_API_KEY` and once as `VITE_GEMINI_API_KEY`.

---

## 🗄️ 3. Supabase SQL Setup
Run this in the **Supabase SQL Editor** to create the required tables and security policies. 

> **IMPORTANT**: Replace `your@email.com` on line 102 with your actual admin email (e.g. `bn.gbemileke@gmail.com`).

```sql
-- 1. Orders Table
CREATE TABLE IF NOT EXISTS orders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT,
  delivery_method TEXT NOT NULL,
  delivery_date DATE NOT NULL,
  delivery_address TEXT,
  items JSONB NOT NULL,
  total_price DECIMAL NOT NULL,
  status TEXT DEFAULT 'pending',
  user_id UUID REFERENCES auth.users(id)
);

-- 2. Enquiries Table
CREATE TABLE IF NOT EXISTS enquiries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT DEFAULT 'new'
);

-- 3. Site Config Table
CREATE TABLE IF NOT EXISTS site_config (
  id SERIAL PRIMARY KEY,
  config JSONB NOT NULL
);
INSERT INTO site_config (id, config) 
VALUES (1, '{
  "bakeryName": "Sweet Moments by Sarah",
  "contactEmail": "sarah@example.com",
  "openingHours": "Mon-Fri: 9am-6pm",
  "deliveryZones": "London Zones 1-4",
  "knowledgeBase": "We specialize in artisanal bespoke cakes...",
  "isMaintenance": false
}') ON CONFLICT (id) DO NOTHING;

-- 4. FAQs Table
CREATE TABLE IF NOT EXISTS faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  category TEXT DEFAULT 'general',
  order_index INT DEFAULT 0
);

-- 5. Auth Codes (Custom OTP)
CREATE TABLE IF NOT EXISTS auth_codes (
  email TEXT PRIMARY KEY,
  code TEXT NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. RLS Policies
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE enquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE faqs ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to avoid "already exists" errors
DROP POLICY IF EXISTS "Public Insert Orders" ON orders;
DROP POLICY IF EXISTS "Public Insert Enquiries" ON enquiries;
DROP POLICY IF EXISTS "Public Read Config" ON site_config;
DROP POLICY IF EXISTS "Public Read FAQs" ON faqs;
DROP POLICY IF EXISTS "Admin Manage Orders" ON orders;
DROP POLICY IF EXISTS "Admin Manage Enquiries" ON enquiries;
DROP POLICY IF EXISTS "Admin Manage Config" ON site_config;
DROP POLICY IF EXISTS "Admin Manage FAQs" ON faqs;

-- Public Access
CREATE POLICY "Public Insert Orders" ON orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Insert Enquiries" ON enquiries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Read Config" ON site_config FOR SELECT USING (true);
CREATE POLICY "Public Read FAQs" ON faqs FOR SELECT USING (true);

-- Admin Access (REPLACE 'your@email.com' with your actual email)
CREATE POLICY "Admin Manage Orders" ON orders FOR ALL USING (auth.jwt() ->> 'email' IN ('your@email.com'));
CREATE POLICY "Admin Manage Enquiries" ON enquiries FOR ALL USING (auth.jwt() ->> 'email' IN ('your@email.com'));
CREATE POLICY "Admin Manage Config" ON site_config FOR ALL USING (auth.jwt() ->> 'email' IN ('your@email.com'));
CREATE POLICY "Admin Manage FAQs" ON faqs FOR ALL USING (auth.jwt() ->> 'email' IN ('your@email.com'));
```

---

## 🤖 4. Telegram Autonomous AI Agent (n8n)
This workflow allows a Telegram bot to run your business. It can answer questions, check order status, and even take new orders autonomously.

### Setup:
1. Create a bot via **@BotFather** on Telegram.
2. Import the JSON below into a new n8n workflow.
3. Add a **Supabase Node** and **Google Gemini Node** to the workflow.

```json
{
  "nodes": [
    {
      "parameters": {
        "updates": [
          "message"
        ]
      },
      "id": "tg-trigger",
      "name": "Telegram Trigger",
      "type": "n8n-nodes-base.telegramTrigger",
      "typeVersion": 1,
      "position": [100, 400]
    },
    {
      "parameters": {
        "options": {
          "systemMessage": "You are the Autonomous Manager for Sweet Moments Bakery. You have access to the database to check orders and bakery info. Be helpful, sweet, and professional."
        }
      },
      "id": "ai-agent",
      "name": "AI Business Agent",
      "type": "n8n-nodes-base.aiAgent",
      "typeVersion": 1,
      "position": [400, 400]
    },
    {
      "parameters": {
        "operation": "get",
        "table": "orders",
        "filters": {
          "conditions": [
            {
              "key": "customer_email",
              "value": "={{ $json.email }}"
            }
          ]
        }
      },
      "id": "tool-check-order",
      "name": "Check Order Status",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [600, 200]
    },
    {
      "parameters": {
        "operation": "get",
        "table": "site_config",
        "id": "1"
      },
      "id": "tool-bakery-info",
      "name": "Get Bakery Info",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [600, 400]
    }
  ],
  "connections": {
    "Telegram Trigger": {
      "main": [[{ "node": "AI Business Agent", "type": "main", "index": 0 }]]
    }
  }
}
```

---

## 🚀 5. Deployment Guide

### Vercel Setup:
1. Connect your GitHub repo to Vercel.
2. Add the **Environment Variables** listed in Section 2.
3. Ensure `vercel.json` is present in your root:
```json
{
  "version": 2,
  "builds": [
    { "src": "package.json", "use": "@vercel/static-build", "config": { "distDir": "dist" } },
    { "src": "server.ts", "use": "@vercel/node" }
  ],
  "rewrites": [
    { "source": "/api/(.*)", "destination": "server.ts" },
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### n8n Gateway Setup:
1. Import the **Master Gateway JSON** (provided in the previous turn).
2. Set the `Respond` setting to **Immediately**.
3. Set the `Response Code` to **200**.
4. Activate the workflow.

---

## 🛠️ 6. Maintenance
- **Updating Content**: Use the **Admin Dashboard** within the app to update FAQs, flavors, and business info. This updates Supabase, which the AI Assistant and Telegram Agent "scrape" in real-time.
- **Logs**: Check Vercel Logs for server errors and n8n Execution History for automation failures.

---
*Generated by Sweet Moments AI Architect*
