import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.PAYPAL_CLIENT_ID || "";
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET || "";
  const mode = process.env.PAYPAL_MODE || "sandbox";

  const results: Record<string, unknown> = {
    env_vars_set: {
      PAYPAL_CLIENT_ID: clientId.length > 0,
      PAYPAL_CLIENT_SECRET: clientSecret.length > 0,
      PAYPAL_MODE: mode,
    },
    client_id_preview: clientId.slice(0, 10) + "...",
    secret_length: clientSecret.length,
  };

  // Run a real PayPal auth test
  if (!clientId || !clientSecret) {
    results.auth_test = "SKIPPED - missing credentials";
    return NextResponse.json(results);
  }

  const base = "https://api-m.sandbox.paypal.com";

  async function testAuth(id: string, secret: string, label: string) {
    const auth = Buffer.from(`${id}:${secret}`).toString("base64");
    try {
      const res = await fetch(`${base}/v1/oauth2/token`, {
        method: "POST",
        headers: { Authorization: `Basic ${auth}`, "Content-Type": "application/x-www-form-urlencoded" },
        body: "grant_type=client_credentials",
      });
      const body = await res.text();
      return { status: res.status, ok: res.ok, body: res.ok ? "token_ok" : body };
    } catch (err) {
      return { status: "NETWORK_ERROR", error: String(err) };
    }
  }

  results.auth_via_env = await testAuth(clientId, clientSecret, "from env vars");

  return NextResponse.json(results);
}
