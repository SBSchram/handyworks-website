# handyworks.com email — steve@handyworks.com

**Status (May 2026):** Namecheap forwarding **`steve` → `sbschram@gmail.com`** works. Confirmed by external send (ProtonMail → `steve@handyworks.com`, `mailed-by: eforward.registrar-servers.com`).

**No Cloudflare migration or paid mailbox required** for normal inbound mail.

---

## Free fixes that work (verified)

### 1. Namecheap Email Forwarding (already correct)

- **Alias:** `steve` → **`sbschram@gmail.com`**
- If the rule exists, **inbound is fine** — no paid Private Email needed.

### 2. Don’t test with Gmail → steve@

`sbschram@gmail.com` → `steve@handyworks.com` → forwards back to the **same Gmail**.

- Often **no bounce and no message** (Gmail suppresses the loop).
- **Not a broken forward.** Test with **ProtonMail, Outlook, or iCloud** instead.

### 3. Send *as* steve@ from Gmail via **SMTP2GO** (actual setup — free tier)

**Dashboard:** [SMTP2GO](https://app-us.smtp2go.com/dashboard/main/)  
**Gmail guide:** [Setting up Gmail with SMTP2GO](https://www.smtp2go.com/setupguide/gmail/)

This is how **`steve@handyworks.com`** is sent from Gmail — **not** `smtp.gmail.com` and **not** `mail.privateemail.com`.

#### Why SMTP2GO (not Gmail SMTP)

| Approach | Auth for `@handyworks.com` |
|----------|----------------------------|
| `smtp.gmail.com` + App Password | Weak — `Return-Path` stays `@gmail.com`, DMARC often fails |
| **SMTP2GO** | Strong — mail sent through servers authorized in handyworks **SPF** (`include:spf.smtp2go.com`, added Dec 2025) |

See `DNS_CONFIGURATION.md` — SPF was updated specifically because SMTP2GO sends were failing DMARC.

#### SMTP2GO account (one-time)

1. Log in at [app-us.smtp2go.com](https://app-us.smtp2go.com/dashboard/main/)
2. **Sending → Verified Senders** — verify **`handyworks.com`** as a sender domain (SMTP2GO sets SPF/DKIM DNS; your SPF already includes `spf.smtp2go.com`)
3. **Sending → SMTP Users** — create an SMTP user; note **username** and **password**

#### Gmail → Send mail as

**Settings → Accounts → Send mail as** → add or edit **`steve@handyworks.com`**:

| Field | Value |
|-------|--------|
| Send through | **SMTP servers** (your domain — *not* Gmail) |
| SMTP server | `mail.smtp2go.com` (US accounts may also use `mail-us.smtp2go.com`) |
| Port | `587` (or `2525`) |
| Secured connection | **TLS** |
| Username | **SMTP2GO SMTP user** (from dashboard — *not* `sbschram@gmail.com`) |
| Password | **SMTP2GO SMTP password** (*not* Gmail App Password) |

Remove any old entry using `mail.privateemail.com` (Namecheap Private Email — blank password = broken).

Verify via the email Gmail sends to `steve@` (forwards to Gmail via Namecheap).

#### Fallback: Gmail SMTP only

If SMTP2GO is unavailable, use `smtp.gmail.com` + `sbschram@gmail.com` + App Password (same as jetlagpro `info@`). Expect weaker authentication — see jetlagpro `docs/EMAIL_SETUP.md`.

### 4. Relax handyworks DMARC (free DNS change)

Handyworks currently has **`p=quarantine`**, which can **hide or drop** mail from senders with weak auth (e.g. `info@jetlagpro.com` sent via free Gmail — `dmarc=fail` in headers).

**Namecheap** → **handyworks.com** → **Advanced DNS** → edit **`_dmarc`** TXT:

```text
v=DMARC1; p=none; rua=mailto:your-email@gmail.com
```

(`p=none` matches jetlagpro — monitor only, do not quarantine failing mail.)

Wait 15–60 minutes, then retest **info@** → **steve@** and check **Spam**.

### 5. Mail from info@jetlagpro.com (sender-side, free)

On **jetlagpro.com** (Cloudflare DNS), SPF must include Google:

```text
v=spf1 include:_spf.mx.cloudflare.net include:_spf.google.com ~all
```

This helps delivery but **does not** fix DMARC alignment for free Gmail “Send mail as” (`Return-Path` stays `@gmail.com`). See `jetlagpro-website/docs/EMAIL_SETUP.md`.

**Practical send options to steve@ (all free):**

- Send from **ProtonMail / Outlook** to `steve@` — works.
- Send from **sbschram@gmail.com** to `steve@` — use only if you accept loop risk; prefer external sender.
- Send from **info@** after handyworks DMARC → `p=none`; check Spam.

---

## Current DNS (reference)

| Record | Value |
|--------|--------|
| NS | Namecheap (`dns1/2.registrar-servers.com`) |
| MX | `eforward*.registrar-servers.com` |
| SPF | includes eforward, Google, smtp2go |
| DMARC | `_dmarc.handyworks.com` — consider **`p=none`** (see §4) |

**Site:** GitHub Pages — keep existing **A** / **CNAME** records if you only change DMARC.

---

## Optional: Cloudflare Email Routing (not required)

Only if Namecheap forwarding **bounces** (554) for **external** senders after 24h.

Moves DNS to Cloudflare + Email Routing (same as jetlagpro). Bigger change; **not needed** if ProtonMail → steve@ already delivers.

---

## Troubleshooting

| Symptom | Free fix |
|---------|----------|
| ProtonMail → steve@ **works** | Forward is fine — stop here |
| Gmail → steve@, nothing arrives | Expected loop — use external test (§2) |
| info@ → steve@, nothing / spam | DMARC **p=none** on handyworks (§4); check Spam |
| info@ auth warning at ProtonMail | Normal for Gmail send-as — see jetlagpro doc |
| Send-as steve@ fails | **SMTP2GO** (§3): `mail.smtp2go.com` + SMTP Users creds — not Private Email or Gmail SMTP |
| 554 relay access denied (external) | Re-check Namecheap forward; then consider Cloudflare |

---

## Public addresses

| Address | Role |
|---------|------|
| `steve@handyworks.com` | HandyWorks site / contact (forward → Gmail) |
| `info@jetlagpro.com` | JetLagPro |
| `sbschram@gmail.com` | App Review / personal |
