// Supabase "Send SMS" Auth Hook → delivers the login OTP as an SMS via MSG91.
// Supabase generates and verifies the code; this function only delivers it
// using MSG91's Flow API (so we send Supabase's OTP, not an MSG91-generated one).
//
// Deploy:  supabase functions deploy send-whatsapp-otp --no-verify-jwt
// Then point Authentication → Hooks → "Send SMS hook" at this function.
//
// Required secrets (supabase secrets set KEY=value):
//   SEND_SMS_HOOK_SECRET - hook secret Supabase shows when you enable the hook (starts "v1,whsec_")
//   MSG91_AUTHKEY        - MSG91 → Settings → API → Auth Key
//   MSG91_TEMPLATE_ID    - the DLT-approved Flow template ID for the OTP SMS
//   MSG91_OTP_VAR        - the template variable name that holds the code (default "otp")
//   DEFAULT_COUNTRY_CODE - digits prepended to bare 10-digit numbers (default "91")

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const hookSecret = (Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "").replace(
  "v1,whsec_",
  ""
);
const authKey = Deno.env.get("MSG91_AUTHKEY") ?? "";
const templateId = Deno.env.get("MSG91_TEMPLATE_ID") ?? "";
const otpVar = Deno.env.get("MSG91_OTP_VAR") ?? "otp";
const defaultCc = (Deno.env.get("DEFAULT_COUNTRY_CODE") ?? "91").replace(
  /\D/g,
  ""
);

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
  const mobile = toMsg91Mobile(event.user.phone);

  // 2. Send via MSG91 Flow API. The OTP is passed as the template variable.
  const res = await fetch("https://control.msg91.com/api/v5/flow/", {
    method: "POST",
    headers: {
      authkey: authKey,
      "Content-Type": "application/json",
      accept: "application/json",
    },
    body: JSON.stringify({
      template_id: templateId,
      short_url: "0",
      recipients: [{ mobiles: mobile, [otpVar]: otp }],
    }),
  });

  const result = await res.json().catch(() => ({}));
  // MSG91 returns { type: "success" } on success.
  if (!res.ok || result?.type !== "success") {
    console.error("MSG91 send failed", res.status, JSON.stringify(result));
    return json({ error: "sms delivery failed", detail: result }, 502);
  }

  return json({}, 200);
});

/** MSG91 wants the mobile as country-code + number, digits only, no "+".
 *  India-first: a bare 10-digit number gets DEFAULT_COUNTRY_CODE prepended. */
function toMsg91Mobile(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  return digits.length === 10 ? `${defaultCc}${digits}` : digits;
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
