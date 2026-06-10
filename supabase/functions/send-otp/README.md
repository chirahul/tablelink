# Login OTP delivery — Send SMS Hook (via MSG91 SMS)

Delivers Supabase login OTPs as an SMS via **MSG91**. Supabase generates and
verifies the code; this function only delivers it (using MSG91's Flow API, so
we send Supabase's OTP — not an MSG91-generated one).

## MSG91 setup
1. Sign up at [msg91.com](https://msg91.com).
2. **DLT registration (India, mandatory for SMS):** register your business
   entity, a sender ID/header, and an OTP **content template**. MSG91 guides
   this, but TRAI approval takes a few days.
3. Create a **Flow** in MSG91 that uses your approved DLT template, with one
   variable for the code (e.g. `##otp##`). Note its **Template/Flow ID** →
   `MSG91_TEMPLATE_ID`, and the variable name → `MSG91_OTP_VAR` (default `otp`).
4. Get your **Auth Key**: MSG91 → Settings → API → Auth Key → `MSG91_AUTHKEY`.

## Supabase setup
1. **Authentication → Providers → Phone**: enable.
2. **Authentication → Hooks → Send SMS hook**: enable, type **HTTPS** → point at
   this function's URL. Copy the generated **hook secret**.
3. Set secrets:
   ```bash
   supabase secrets set \
     SEND_SMS_HOOK_SECRET="v1,whsec_..." \
     MSG91_AUTHKEY="<auth key>" \
     MSG91_TEMPLATE_ID="<flow template id>" \
     MSG91_OTP_VAR="otp" \
     DEFAULT_COUNTRY_CODE="91"
   ```
4. Deploy (signature verified in-function, so skip the platform JWT):
   ```bash
   supabase functions deploy send-otp --no-verify-jwt
   ```

## Notes
- India SMS requires **DLT** approval (a few days) — unavoidable for any SMS
  provider. WhatsApp would have avoided DLT but needs a verified WABA instead.
- The app's `signInWithOtp({ phone })` flow is unchanged — only delivery differs.
- `MSG91_OTP_VAR` must match the variable name in your MSG91 Flow template.
- `toMsg91Mobile()` is India-first (prepends `DEFAULT_COUNTRY_CODE` to bare
  10-digit numbers); adjust if you go multi-country.
- Swappable: to move to WhatsApp later, only this function's outbound call
  changes — the hook, secrets pattern, and app flow stay the same.
