# WhatsApp OTP — Send SMS Hook

Delivers Supabase login OTPs over WhatsApp (Meta Cloud API) instead of SMS.
Supabase generates and verifies the code; this function only sends it.

## One-time Meta setup
1. **Meta Business** account → create a **WhatsApp Business Account (WABA)** at
   [developers.facebook.com](https://developers.facebook.com) → add a WhatsApp product.
2. Add & verify a **sender phone number**. Note its **Phone Number ID**.
3. Create a **System User** with a **permanent access token** that has
   `whatsapp_business_messaging` permission. This is `WHATSAPP_TOKEN`.
4. Create a message template, **category: Authentication**, named `otp_login`
   (or set `WHATSAPP_TEMPLATE_NAME`). Use the standard auth template — body
   contains the `{{1}}` code and a "Copy code" button. Wait for Meta approval.

## Supabase setup
1. **Authentication → Providers → Phone**: enable. (No Twilio needed.)
2. **Authentication → Hooks → Send SMS hook**: enable, type **HTTPS** →
   point at this function's URL. Copy the generated **hook secret**.
3. Set secrets:
   ```bash
   supabase secrets set \
     SEND_SMS_HOOK_SECRET="v1,whsec_..." \
     WHATSAPP_TOKEN="EAAB..." \
     WHATSAPP_PHONE_NUMBER_ID="1234567890" \
     WHATSAPP_TEMPLATE_NAME="otp_login" \
     WHATSAPP_TEMPLATE_LANG="en"
   ```
4. Deploy (signature is verified in-function, so skip the platform JWT):
   ```bash
   supabase functions deploy send-whatsapp-otp --no-verify-jwt
   ```

## Notes
- WhatsApp OTP is **not** subject to India's TRAI DLT (that's SMS-only), but the
  authentication **template still needs Meta approval**.
- The app's `signInWithOtp({ phone })` flow is unchanged — only delivery differs.
- Test users can only receive messages once the WABA is out of dev mode, or add
  them as allowed test recipients in the Meta dashboard.
