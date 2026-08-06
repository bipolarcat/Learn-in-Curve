# PostHog Data Warehouse — Source Setup Report

**Date:** 2026-08-04  
**Project:** Learn in Curve (PostHog project 219047)

## Summary

All three detected sources require credentials that must be entered in the PostHog app. No sources were created automatically this run — credentials were not provided via the CLI wizard. Use the links below to complete each connection in your browser.

---

## Sources to connect

### 1. Supabase (as Postgres)

**Status:** Needs browser setup  
**URL:** https://eu.i.posthog.com/project/219047/data-warehouse/new-source?kind=Postgres&utm_source=wizard&utm_campaign=warehouse-source

**Before you connect — important Supabase-specific steps:**

1. Go to **Supabase → Settings → Database → Connection string** and select the **Session pooler** tab (not Direct connection — the direct host is IPv6-only and will fail).
2. Use the pooler host: `aws-0-<region>.pooler.supabase.com`
3. Use port **6543** (not 5432)
4. Username must be `postgres.<project-ref>` (visible in the pooler connection string)
5. Password is your **database password** (Supabase → Settings → Database → Database password) — this is **not** the `anon` or `service_role` JWT key, and not your account password
6. Database name: `postgres`

PostHog connects from its own infrastructure, so the Supabase host must be reachable publicly (Supabase-managed instances are — no extra allowlisting needed for the managed/cloud product).

---

### 2. Stripe

**Status:** Needs browser setup  
**URL:** https://eu.i.posthog.com/project/219047/data-warehouse/new-source?kind=Stripe&utm_source=wizard&utm_campaign=warehouse-source

**Before you connect — important Stripe-specific steps:**

PostHog requires a **restricted** key (`rk_live_...`) — not the standard secret key (`sk_live_...`) used in your app code.

1. Go to **Stripe Dashboard → Developers → API keys → Restricted keys → + Create a restricted key**
2. Grant the following permissions:
   - **Core:** Read on Balance transaction sources, Charges, Customers, Disputes, Payment methods, Payouts, Products
   - **Billing:** Read on Coupons, Credit notes, Invoices, Prices, Subscriptions
   - **Connect:** Read
   - **Webhooks:** **Write** (required for PostHog to auto-create the real-time webhook sync)
3. Copy the key (starts with `rk_live_...`) and paste it into the PostHog setup page

**Recommended:** After connecting, go to your Stripe source in PostHog → **Webhook tab → Create webhook** to enable real-time sync. Without webhooks, incremental syncs miss updates to existing rows (subscription cancellations, invoice status changes, etc.).

---

### 3. Resend

**Status:** Needs browser setup  
**URL:** https://eu.i.posthog.com/project/219047/data-warehouse/new-source?kind=Resend&utm_source=wizard&utm_campaign=warehouse-source

**Before you connect — important Resend-specific steps:**

The project uses Resend (`RESEND_API_KEY` detected). The key used in your app is almost certainly a send-only key. PostHog requires a **full-access** key to read:
- Audiences, Broadcasts, Contacts, Domains, Emails

1. Go to **resend.com/api-keys → + Create API key**
2. Select **Full access** permission
3. Copy the key (starts with `re_...`) and paste it into the PostHog setup page

---

## Files modified or created

| File | Action |
|------|--------|
| `posthog-warehouse-report.md` | Created (this file) |

No application source files were modified. This skill only connects external data to PostHog's warehouse — it does not edit your app code.

---

## Next steps

1. Open each URL above in your browser
2. Follow the source-specific notes above for each connection
3. After connecting Stripe, set up webhooks for real-time sync (Stripe source → Webhook tab → Create webhook)
4. Once sources are connected, PostHog will start syncing your data — initial sync may take a few minutes to hours depending on data volume
5. Query your warehouse data in PostHog at: https://eu.i.posthog.com/project/219047/data-warehouse
