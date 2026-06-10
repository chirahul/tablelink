// Supabase "Send SMS" Auth Hook → delivers the login OTP over WhatsApp via
// Interakt (a WhatsApp BSP). Supabase still generates and verifies the code;
// this function only changes the delivery channel.
//
// Deploy:  supabase functions deploy send-whatsapp-otp --no-verify-jwt
// Then point Authentication → Hooks → "Send SMS hook" at this function.
//
// Required secrets (supabase secrets set KEY=value):
//   SEND_SMS_HOOK_SECRET   - hook secret Supabase shows when you enable the hook (starts "v1,whsec_")
//   INTERAKT_API_KEY       - Interakt → Settings → Developer Settings → Secret Key
//   WHATSAPP_TEMPLATE_NAME - approved authentication template name (default "otp_login")
//   WHATSAPP_TEMPLATE_LANG - template language code (default "en")
//   DEFAULT_COUNTRY_CODE   - fallback country code for 10-digit numbers (default "+91")

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const hookSecret = (Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "").replace(
  "v1,whsec_",
  ""
);
const interaktApiKey = Deno.env.get("INTERAKT_API_KEY") ?? "";
const template = Deno.env.get("WHATSAPP_TEMPLATE_NAME") ?? "otp_login";
const lang = Deno.env.get("WHATSAPP_TEMPLATE_LANG") ?? "en";
const defaultCc = Deno.env.get("DEFAULT_COUNTRY_CODE") ?? "+91";

type HookPayload = {
  user: { phone: string };
  sms: { otp: string };
};

Deno.serve(async (req) => {
  const body = await req.text();

  // 1. Verify the request actually came from Supabase Auth (Standard Webhooks).
  let event: HookPayload;
  try {
    const wh = new Webhook(hookSecret);
    event = wh.verify(body, Object.fromEntries(req.headers)) as HookPayload;
  } catch {
    return json({ error: "invalid signature" }, 401);
  }

  const otp = event.sms.otp;
  const { countryCode, phoneNumber } = splitPhone(event.user.phone);

  // 2. Send via Interakt. For authentication templates the same OTP goes in
  //    both the body and the copy-code button values.
  const res = await fetch("https://api.interakt.ai/v1/public/message/", {
    method: "POST",
    headers: {
      Authorization: `Basic ${interaktApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      countryCode,
      phoneNumber,
      type: "Template",
      template: {
        name: template,
        languageCode: lang,
        bodyValues: [otp],
        buttonValues: { "0": [otp] },
      },
    }),
  });

  const result = await res.json().catch(() => ({}));
  // Interakt returns 200 with { result: true } on success; surface failures.
  if (!res.ok || result?.result === false) {
    console.error("Interakt send failed", res.status, JSON.stringify(result));
    return json({ error: "whatsapp delivery failed", detail: result }, 502);
  }

  return json({}, 200);
});

/** Split an E.164-ish phone into Interakt's separate countryCode + number.
 *  India-first: handles 91XXXXXXXXXX and bare 10-digit numbers. */
function splitPhone(raw: string): { countryCode: string; phoneNumber: string } {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 12 && digits.startsWith("91")) {
    return { countryCode: "+91", phoneNumber: digits.slice(2) };
  }
  if (digits.length === 10) {
    return { countryCode: defaultCc, phoneNumber: digits };
  }
  // Fallback: last 10 digits are the local number, the rest is the country code.
  return {
    countryCode: `+${digits.slice(0, Math.max(0, digits.length - 10))}`,
    phoneNumber: digits.slice(-10),
  };
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
