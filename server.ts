import express from "express";
import { createServer as createViteServer } from "vite";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

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

// Custom Auth Endpoint
app.post("/api/auth/request-link", async (req, res) => {
  const { email, origin } = req.body;

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // 1. Generate the magic link using Supabase Admin
    const { data, error } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
      options: {
        redirectTo: origin || "http://localhost:3000"
      }
    });

    if (error) throw error;

    const magicLink = data.properties.action_link;

    // 2. Send the link to n8n
    const n8nWebhookUrl = process.env.VITE_N8N_AUTH_WEBHOOK_URL;
    
    if (n8nWebhookUrl) {
      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          magicLink,
          type: "auth_request",
          timestamp: new Date().toISOString()
        })
      });

      if (!n8nResponse.ok) {
        console.error("n8n webhook failed:", await n8nResponse.text());
      }
    } else {
      console.warn("VITE_N8N_AUTH_WEBHOOK_URL not configured. Link generated but not sent.");
      // In a real scenario, you'd want to handle this better
    }

    res.json({ success: true, message: "Auth link generated and sent to n8n" });
  } catch (error: any) {
    console.error("Auth link generation error:", error);
    res.status(500).json({ error: error.message || "Failed to generate auth link" });
  }
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
