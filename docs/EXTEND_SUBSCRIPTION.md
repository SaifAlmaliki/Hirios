# 🚀 How to Extend Company Subscription

This guide explains how to extend a company's subscription for a specified period (e.g., 1 year).

---

## Quick Method: SQL Update

### Step 1: Open Supabase SQL Editor
Go to your Supabase Dashboard → **SQL Editor**

### Step 2: Run This Query

```sql
UPDATE public.company_profiles
SET 
  subscription_plan = 'paid',
  subscription_expires_at = NOW() + INTERVAL '365 days'
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'company@example.com'
);
```

**Replace** `'company@example.com'` with the actual company email address.

### Step 3: Verify the Update (Optional)

```sql
SELECT 
  cp.company_name,
  u.email,
  cp.subscription_plan,
  cp.subscription_expires_at,
  CASE 
    WHEN cp.subscription_expires_at > NOW() THEN '✅ Active'
    ELSE '❌ Expired'
  END as status
FROM public.company_profiles cp
JOIN auth.users u ON cp.user_id = u.id
WHERE u.email = 'company@example.com';
```

---

## ⏱️ Different Time Periods

Modify the `INTERVAL` value to extend for different periods:

| Period | SQL Interval |
|--------|-------------|
| 30 days (1 month) | `NOW() + INTERVAL '30 days'` |
| 90 days (3 months) | `NOW() + INTERVAL '90 days'` |
| 180 days (6 months) | `NOW() + INTERVAL '180 days'` |
| 365 days (1 year) | `NOW() + INTERVAL '365 days'` |
| 730 days (2 years) | `NOW() + INTERVAL '730 days'` |