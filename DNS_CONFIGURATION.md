# HandyWorks DNS Configuration

## SPF Record for handyworks.com

**Purpose:** Email authentication to prevent spoofing and improve deliverability

**Current SPF Record:**
```
v=spf1 include:spf.efwd.registrar-servers.com include:_spf.google.com include:spf.smtp2go.com ~all
```

**Components:**
- `include:spf.efwd.registrar-servers.com` - Namecheap email forwarding
- `include:_spf.google.com` - Google Workspace/Gmail
- `include:spf.smtp2go.com` - SMTP2GO email service
- `~all` - Softfail for unauthorized senders (allows delivery but marks as suspicious)

**Previous Record (Before Dec 12, 2025):**
```
v=spf1 include:spf.efwd.registrar-servers.com include:_spf.google.com ~all
```

**Issue Fixed:**
- SPF was failing with softfail for emails sent via SMTP2GO
- Added `include:spf.smtp2go.com` to authorize SMTP2GO sending IPs
- This resolves DMARC report SPF failures

## DMARC Record

**Current DMARC Policy:**
```
v=DMARC1; p=quarantine; rua=mailto:steve@handyworks.com; pct=100; adkim=r; aspf=r
```

**Policy Details:**
- `p=quarantine` - Quarantine emails that fail DMARC (move to spam)
- `rua=mailto:steve@handyworks.com` - Send aggregate reports to this address
- `pct=100` - Apply policy to 100% of emails
- `adkim=r` - Relaxed DKIM alignment
- `aspf=r` - Relaxed SPF alignment

## DNS Provider

**Registrar:** Namecheap  
**Domain:** handyworks.com

**To Update SPF Record:**
1. Log into Namecheap
2. Domain List → Manage → Advanced DNS
3. Find TXT record with `v=spf1`
4. Edit value to include all authorized services
5. Save changes
6. Wait 5-60 minutes for propagation

**Verification:**
```bash
dig +short TXT handyworks.com | grep spf
dig +short TXT _dmarc.handyworks.com
```

## Email Services

1. **Namecheap Email Forwarding** - `spf.efwd.registrar-servers.com`
2. **Google Workspace/Gmail** - `_spf.google.com`
3. **SMTP2GO** - `spf.smtp2go.com` (added Dec 12, 2025)

## Last Updated

**Date:** December 12, 2025  
**Change:** Added `include:spf.smtp2go.com` to SPF record to fix DMARC SPF failures

