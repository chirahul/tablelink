// Supabase "Send SMS" Auth Hook → delivers the login OTP over WhatsApp
// (Meta Cloud API) instead of SMS. Supabase still generates and verifies the
// code; this function only changes the delivery channel.
//
// Deploy:  supabase functions deploy send-whatsapp-otp --no-verify-jwt
// Then point Authentication → Hooks → "Send SMS hook" at this function.
//
// Required secrets (supabase secrets set KEY=value):
//   SEND_SMS_HOOK_SECRET     - the hook secret Supabase shows when you enable the hook (starts "v1,whsec_")
//   WHATSAPP_TOKEN           - Meta permanent access token for the WABA system user
//   WHATSAPP_PHONE_NUMBER_ID - the WhatsApp sender's Phone Number ID (from Meta)
//   WHATSAPP_TEMPLATE_NAME   - approved authentication template name (default "otp_login")
//   WHATSAPP_TEMPLATE_LANG   - template language code (default "en")

import { Webhook } from "https://esm.sh/standardwebhooks@1.0.0";

const hookSecret = (Deno.env.get("SEND_SMS_HOOK_SECRET") ?? "").replace(
  "v1,whsec_",
  ""
);
const waToken = Deno.env.get("WHATSAPP_TOKEN") ?? "";
const waPhoneNumberId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") ?? "";
const waTemplate = Deno.env.get("WHATSAPP_TEMPLATE_NAME") ?? "otp_login";
const waLang = Deno.env.get("WHATSAPP_TEMPLATE_LANG") ?? "en";

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
  const to = event.user.phone.replace(/\D/g, ""); // digits only (E.164 without +)

  // 2. Send via Meta WhatsApp Cloud API using the authentication template.
  //    Auth templates repeat the code in both the body and the copy-code button.
  const res = await fetch(
    `https://graph.facebook.com/v22.0/${waPhoneNumberId}/messages`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${waToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: waTemplate,
          language: { code: waLang },
          components: [
            { type: "body", parameters: [{ type: "text", text: otp }] },
            {
              type: "button",
              sub_type: "url",
              index: 0,
              parameters: [{ type: "text", text: otp }],
            },
          ],
        },
      }),
    }
  );

  if (!res.ok) {
    const detail = await res.text();
    console.error("WhatsApp send failed", res.status, detail);
    return json({ error: "whatsapp delivery failed", detail }, 502);
  }

  return json({}, 200);
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
