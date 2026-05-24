# handyworks.com email — steve@handyworks.com

**Problem (May 2026):** Mail to `steve@handyworks.com` fails intermittently with `554 5.7.1 Relay access denied` (same class of issue as jetlagpro.com had with Namecheap `eforward*` MX).

**Current DNS (checked May 2026):**

| Record | Value |
|--------|--------|
| NS | `dns1.registrar-servers.com`, `dns2.registrar-servers.com` (Namecheap) |
| MX | `eforward1`–`eforward5.registrar-servers.com` (Namecheap forwarding) |
| SPF | `v=spf1 include:spf.efwd.registrar-servers.com include:_spf.google.com include:spf.smtp2go.com ~all` |
| DMARC | `v=DMARC1; p=quarantine; pct=100; ...` at `_dmarc.handyworks.com` |

**Site hosting:** GitHub Pages (A records in Namecheap) — do not change A/CNAME unless you plan a full DNS migration.

---

## Fix A — Namecheap Email Forwarding (do this first, ~10 min)

DNS stays on Namecheap. You only fix the **forwarding alias**.

1. [Namecheap](https://www.namecheap.com) → **Domain List** → **handyworks.com** → **Manage**
2. Open **Email Forwarding** (or **Private Email** → if you only use forwarding, use **Email Forwarding**, not a paid mailbox you never configured)
3. **Add or edit** a rule:
   - **Alias:** `steve` (→ `steve@handyworks.com`)
   - **Forward to:** `sbschram@gmail.com` (or the inbox you actually read)
4. **Remove** duplicate or old rules for `steve@` pointing elsewhere
5. **Save** — wait 5–15 minutes

### Disable conflicting Private Email SMTP (if unused)

If you previously set Gmail **Send mail as** for `steve@` with `mail.privateemail.com` and **no password**, that path is wrong unless you pay for Namecheap Private Email mailboxes.

- Either buy/configure Private Email for `steve@`, **or**
- Use Fix B below for send-as via Gmail

### Test inbound

From `info@jetlagpro.com` (or `sbschram@gmail.com`), send **3 messages** to `steve@handyworks.com`.

- All should arrive at the **forward destination** Gmail
- No `554 relay access denied` bounce

Check **Spam** if missing.

---

## Fix B — Send *as* steve@ from Gmail (optional)

Same pattern as jetlagpro `info@`:

1. Google Account → **App passwords** → create one for Mail
2. Gmail → **Settings** → **Accounts** → **Send mail as** → add `steve@handyworks.com`
3. SMTP: `smtp.gmail.com`, port **587**, TLS
4. **Username:** `sbschram@gmail.com`
5. **Password:** 16-character **App Password** (not Private Email, not blank)
6. Verify via email that arrives at the forward destination

Remove any old entry that used `mail.privateemail.com`.

---

## Fix C — Move mail to Cloudflare Email Routing (optional, more reliable)

Use only if Fix A still bounces after 24 hours.

1. Add **handyworks.com** to [Cloudflare](https://dash.cloudflare.com) (free plan)
2. At Namecheap, change nameservers to Cloudflare’s pair
3. In Cloudflare DNS, recreate **GitHub Pages** records from this README:
   - **A** @ → `185.199.108.153`, `.109.153`, `.110.153`, `.111.153`
   - **CNAME** `www` → `sbschram.github.io`
4. **Email Routing** → enable → remove `eforward*` MX → add routing rule `steve@` → `sbschram@gmail.com`
5. Turn off Namecheap Email Forwarding for `steve@` to avoid double handling

Website and email then match the jetlagpro.com setup.

---

## DMARC note

`p=quarantine` is stricter than jetlagpro (`p=none`). Legitimate mail can land in **spam** even when delivery succeeds.

- After Fix A works, if mail from `info@jetlagpro.com` lands in spam, mark **Not spam**
- Do not change DMARC to `reject` without a full SPF/DKIM plan

---

## Public addresses

| Address | Role |
|---------|------|
| `steve@handyworks.com` | HandyWorks site, billing pages, contact |
| `info@jetlagpro.com` | JetLagPro (Cloudflare → Gmail) |
| `sbschram@gmail.com` | App Review / personal backup |

---

## Troubleshooting

| Symptom | Action |
|---------|--------|
| 554 relay access denied | Re-check Namecheap forwarding; remove stale `eforward` conflicts; try Fix C |
| No bounce but no mail | Check spam; confirm forward target is `sbschram@gmail.com` |
| **ProtonMail → steve@ works; info@ → steve@ does not** | Fix **jetlagpro.com** SPF: add `include:_spf.google.com` in Cloudflare DNS (see jetlagpro `docs/EMAIL_SETUP.md` Step 5) |
| Gmail → steve@ no mail, no bounce | Normal — Gmail suppresses send-to-self via forward; test with ProtonMail |
| Send-as fails | Use Gmail SMTP + App Password, not `mail.privateemail.com` |
| Website down after DNS change | Restore Namecheap NS or fix Cloudflare A/CNAME records |
