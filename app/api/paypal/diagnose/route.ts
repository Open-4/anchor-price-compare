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

  const base = mode === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  try {
    const res = await fetch(`${base}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    const body = await res.text();
    results.auth_test = {
      status: res.status,
      ok: res.ok,
      body: res.ok ? "token obtained" : body,
    };
  } catch (err) {
    results.auth_test = {
      status: "NETWORK_ERROR",
      error: String(err),
    };
  }

  return NextResponse.json(results);
}
