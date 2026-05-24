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

### 3. Send *as* steve@ from Gmail (free)

Replace any `mail.privateemail.com` entry (blank password = broken).

| Field | Value |
|-------|--------|
| SMTP | `smtp.gmail.com` |
| Port | `587` (TLS) |
| Username | `sbschram@gmail.com` |
| Password | Gmail **App Password** (16 characters) |

Same pattern as jetlagpro `info@`.

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
| Send-as steve@ fails | Gmail SMTP + App Password (§3), not Private Email |
| 554 relay access denied (external) | Re-check Namecheap forward; then consider Cloudflare |

---

## Public addresses

| Address | Role |
|---------|------|
| `steve@handyworks.com` | HandyWorks site / contact (forward → Gmail) |
| `info@jetlagpro.com` | JetLagPro |
| `sbschram@gmail.com` | App Review / personal |
