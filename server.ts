import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
import helmet from "helmet";
import rateLimit from "express-rate-limit";

dotenv.config();

const app = express();
const PORT = 3000;

// Security Headers
app.use(helmet({
  contentSecurityPolicy: false, // Disable CSP for Vite dev mode compatibility
}));

app.use(express.json());

// Rate Limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 requests per window for auth endpoints
  message: { error: "Too many attempts, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60, // 60 requests per minute for general API
  standardHeaders: true,
  legacyHeaders: false,
});

// Initialize Supabase Admin (Server-side only)
const supabaseAdmin = createClient(
  process.env.VITE_SUPABASE_URL || "",
  process.env.SUPABASE_SERVICE_ROLE_KEY || "",
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Custom Auth Endpoint: Request 4-Digit Code
app.post("/api/auth/request-code", authLimiter, async (req, res) => {
  const { email } = req.body;

  if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ error: "Valid email is required" });
  }

  try {
    // 1. Generate a 4-digit code
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 mins

    // 2. Store in Supabase
    const { error: dbError } = await supabaseAdmin
      .from("auth_codes")
      .upsert({ email, code, expires_at: expiresAt });

    if (dbError) throw dbError;

    // 3. Send the code to n8n via Secure Proxy
    const n8nGatewayUrl = process.env.N8N_GATEWAY_URL;
    const n8nSecret = process.env.N8N_WEBHOOK_SECRET;
    const { mode } = req.body;
    
    if (n8nGatewayUrl) {
      await fetch(n8nGatewayUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-N8N-SECRET": n8nSecret || ""
        },
        body: JSON.stringify({
          email,
          code,
          mode: mode || 'login',
          type: "auth_code_request",
          timestamp: new Date().toISOString()
        })
      });
    }

    res.json({ success: true, message: "Verification code sent" });
  } catch (error: any) {
    console.error("Auth code generation error:", error);
    res.status(500).json({ error: "Failed to generate code" });
  }
});

// Custom Auth Endpoint: Verify 4-Digit Code
app.post("/api/auth/verify-code", authLimiter, async (req, res) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return res.status(400).json({ error: "Email and code are required" });
  }

  try {
    // 1. Check the code in Supabase
    const { data, error: dbError } = await supabaseAdmin
      .from("auth_codes")
      .select("*")
      .eq("email", email)
      .eq("code", code)
      .single();

    if (dbError || !data) {
      return res.status(401).json({ error: "Invalid or expired code" });
    }

    if (new Date(data.expires_at) < new Date()) {
      return res.status(401).json({ error: "Code has expired" });
    }

    // 2. Ensure user exists and is confirmed to prevent Supabase from sending its own emails
    // We try to create/update the user to ensure they are confirmed
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { 
        full_name: email.split('@')[0],
        source: 'custom_otp_flow'
      }
    });

    // If user already exists, we just ensure they are confirmed
    if (userError && userError.message.toLowerCase().includes('already registered')) {
      const { data: listData } = await supabaseAdmin.auth.admin.listUsers();
      const user = listData.users.find((u: any) => u.email === email);
      if (user) {
        await supabaseAdmin.auth.admin.updateUserById(user.id, { email_confirm: true });
      }
    }

    // 3. Generate a session link for the user
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (linkError) throw linkError;

    // 4. Clean up the code immediately to prevent reuse
    await supabaseAdmin.from("auth_codes").delete().eq("email", email);

    // 4. Trigger Welcome Message via n8n
    const n8nGatewayUrl = process.env.N8N_GATEWAY_URL;
    const n8nSecret = process.env.N8N_WEBHOOK_SECRET;
    if (n8nGatewayUrl) {
      fetch(n8nGatewayUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-N8N-SECRET": n8nSecret || ""
        },
        body: JSON.stringify({ email, type: "welcome_message" })
      }).catch(err => console.error("Welcome webhook failed:", err));
    }

    // Return the magic link hash
    res.json({ 
      success: true, 
      hash: new URL(linkData.properties.action_link).hash 
    });
  } catch (error: any) {
    console.error("Auth verification error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
});

// Secure Proxy: New Enquiry
app.post("/api/enquiry", apiLimiter, async (req, res) => {
  const n8nGatewayUrl = process.env.N8N_GATEWAY_URL;
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET;

  if (n8nGatewayUrl) {
    try {
      await fetch(n8nGatewayUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-N8N-SECRET": n8nSecret || "" 
        },
        body: JSON.stringify({ ...req.body, type: "new_enquiry" })
      });
    } catch (err) {
      console.error("n8n Enquiry Proxy failed:", err);
    }
  }
  res.json({ success: true });
});

// Secure Proxy: New Order
app.post("/api/order", apiLimiter, async (req, res) => {
  const n8nGatewayUrl = process.env.N8N_GATEWAY_URL;
  const n8nSecret = process.env.N8N_WEBHOOK_SECRET;

  if (n8nGatewayUrl) {
    try {
      await fetch(n8nGatewayUrl, {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "X-N8N-SECRET": n8nSecret || "" 
        },
        body: JSON.stringify({ ...req.body, type: "new_order" })
      });
    } catch (err) {
      console.error("n8n Order Proxy failed:", err);
    }
  }
  res.json({ success: true });
});

// Vite middleware for development
async function setupVite() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static("dist"));
    app.get("*", (req, res) => {
      res.sendFile("dist/index.html", { root: "." });
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

setupVite();
