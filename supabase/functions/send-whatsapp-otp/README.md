# WhatsApp OTP — Send SMS Hook (via Interakt)

Delivers Supabase login OTPs over WhatsApp using **Interakt** (a WhatsApp BSP).
Supabase generates and verifies the code; this function only sends it.
Interakt handles the WABA, business verification, and template approval for you.

## Interakt setup
1. Sign up at [interakt.ai](https://www.interakt.ai) and complete their guided
   WhatsApp onboarding (they walk you through WABA + business verification).
2. Create a message template, **category: Authentication**, named `otp_login`
   (or set `WHATSAPP_TEMPLATE_NAME`), language English (`en`). Button: **Copy code**.
   Submit for approval inside Interakt.
3. Get your API key: **Settings → Developer Settings → Secret Key** → this is
   `INTERAKT_API_KEY` (used as `Authorization: Basic <key>`).

## Supabase setup
1. **Authentication → Providers → Phone**: enable. (No Twilio/SMS provider needed.)
2. **Authentication → Hooks → Send SMS hook**: enable, type **HTTPS** → point at
   this function's URL. Copy the generated **hook secret**.
3. Set secrets:
   ```bash
   supabase secrets set \
     SEND_SMS_HOOK_SECRET="v1,whsec_..." \
     INTERAKT_API_KEY="<Interakt secret key>" \
     WHATSAPP_TEMPLATE_NAME="otp_login" \
     WHATSAPP_TEMPLATE_LANG="en" \
     DEFAULT_COUNTRY_CODE="+91"
   ```
4. Deploy (signature verified in-function, so skip the platform JWT):
   ```bash
   supabase functions deploy send-whatsapp-otp --no-verify-jwt
   ```

## Notes
- WhatsApp OTP is **not** subject to India's TRAI DLT (that's SMS-only); the auth
  template still needs Meta approval, which Interakt manages.
- The app's `signInWithOtp({ phone })` flow is unchanged — only delivery differs.
- `splitPhone()` is India-first (handles `91XXXXXXXXXX` and bare 10-digit numbers);
  adjust `DEFAULT_COUNTRY_CODE` or the logic if you go multi-country.
- Confirm the auth template's **button index** (`buttonValues` key) matches what
  Interakt expects for your template — `"0"` is the usual single-button index.
