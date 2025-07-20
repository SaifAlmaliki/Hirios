# Stripe Integration Setup Guide for Hirios

This guide will help you complete the Stripe integration setup for your Hirios application.

## 🔧 Required Stripe Configuration

### 1. Create Stripe Products and Prices

In your Stripe Dashboard, you need to create:

1. **Navigate to Products** in your Stripe Dashboard
2. **Create a new product**:
   - Name: `Hirios Premium`
   - Description: `Premium subscription for unlimited job postings and AI screening`

3. **Add a price**:
   - Price: `€25.00`
   - Billing period: `Monthly`
   - Copy the Price ID (starts with `price_`)

4. **Update the Price ID** in `src/lib/stripe.ts`:
   ```typescript
   export const STRIPE_PRICE_IDS = {
     PREMIUM_MONTHLY: 'price_YOUR_ACTUAL_PRICE_ID_HERE', // Replace with your actual price ID
   } as const;
   ```

### 2. Environment Variables Setup

Add these to your `.env.local` file:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key_here
STRIPE_SECRET_KEY=sk_test_your_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret_here

# Supabase Service Role Key (for webhook handler)
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here
SUPABASE_URL=your_supabase_project_url_here
```

### 3. Webhook Configuration

1. **In Stripe Dashboard**:
   - Go to Developers > Webhooks
   - Click "Add endpoint"
   - Endpoint URL: `https://your-domain.com/api/stripe/webhook`
   - Select these events:
     - `checkout.session.completed`
     - `customer.subscription.created`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

2. **Copy the webhook signing secret** and add it to your environment variables

### 4. Deploy API Endpoints

The following API endpoints need to be deployed:

- `/api/stripe/create-checkout-session.ts`
- `/api/stripe/create-portal-session.ts`
- `/api/stripe/webhook.ts`

**For Vercel deployment**, these files should be in the `api/` directory at your project root.

**For other platforms**, you may need to adapt these to your serverless function format.

## 🏃‍♂️ Database Migration

Run the new database migrations:

```sql
-- Apply the new migrations in your Supabase SQL editor:
-- 1. supabase/migrations/20250107000001_add_subscription_plan_fields.sql
-- 2. supabase/migrations/20250107000002_restrict_ai_features_to_premium.sql
```

Or use the Supabase CLI:
```bash
supabase db push
```

## 🧪 Testing the Integration

### Test Cards

Use these Stripe test cards:

- **Successful payment**: `4242 4242 4242 4242`
- **Declined payment**: `4000 0000 0000 0002`
- **Requires authentication**: `4000 0025 0000 3155`

### Testing Workflow

1. **Create a company account**:
   - Sign up as a company
   - Complete company setup

2. **Test free plan limits**:
   - Try to post 3 jobs (should fail on the 3rd)
   - Verify AI features are not accessible

3. **Test premium subscription**:
   - Go to subscription page
   - Click "Subscribe Now"
   - Complete Stripe Checkout
   - Verify unlimited job posting
   - Verify AI features are accessible

4. **Test subscription management**:
   - Click "Manage Subscription"
   - Test cancellation/reactivation

### Webhook Testing

1. **Use Stripe CLI** for local testing:
   ```bash
   stripe listen --forward-to localhost:3000/api/stripe/webhook
   ```

2. **Test webhook events**:
   - Complete a subscription
   - Cancel a subscription
   - Check database updates

## 🔍 Features Implemented

### ✅ Free Plan (€0/month)
- Browse job applications
- Company profile setup
- Up to 2 job postings per month
- Basic support
- **No AI screening**

### ✅ Premium Plan (€25/month)
- Everything in Free plan
- **Unlimited job postings**
- **AI-powered candidate screening**
- Priority support
- Advanced analytics
- Stripe Customer Portal access

### ✅ Subscription Management
- Real-time subscription status updates
- Automatic job posting limit enforcement
- AI feature access control
- Database-level security policies
- Webhook-driven status updates

### ✅ Security Features
- Row Level Security (RLS) policies
- Premium-only AI access
- Job posting limits enforced at database level
- Stripe webhook signature verification

## 🔧 Troubleshooting

### Common Issues

1. **Webhook not working**:
   - Check webhook URL is accessible
   - Verify webhook secret is correct
   - Check Stripe Dashboard for webhook delivery attempts

2. **Subscription not updating**:
   - Check webhook events are being received
   - Verify database permissions
   - Check Supabase logs

3. **AI features not working**:
   - Verify user has premium subscription
   - Check database RLS policies
   - Ensure subscription status is 'active'

4. **Job posting limits not working**:
   - Check database triggers are created
   - Verify company profile has correct subscription_plan
   - Check RLS policies on jobs table

### Debugging Commands

```bash
# Check Supabase logs
supabase functions logs --project-ref your-project-ref

# Test Stripe webhook locally
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Verify environment variables
echo $VITE_STRIPE_PUBLISHABLE_KEY
```

## 📞 Support

If you encounter issues:

1. Check Stripe Dashboard for payment/webhook logs
2. Check Supabase Dashboard for database errors
3. Verify all environment variables are set correctly
4. Test with Stripe test cards first

## 🚀 Going Live

Before going to production:

1. **Switch to live Stripe keys**
2. **Update webhook URL** to production domain
3. **Test with real payment methods**
4. **Set up proper error monitoring**
5. **Configure Stripe tax settings** if needed

## 📋 Checklist

- [ ] Created Stripe product and price
- [ ] Updated STRIPE_PRICE_IDS in code
- [ ] Added all environment variables
- [ ] Deployed API endpoints
- [ ] Applied database migrations
- [ ] Set up Stripe webhook
- [ ] Tested subscription flow
- [ ] Tested webhook events
- [ ] Verified job posting limits
- [ ] Verified AI access restrictions
- [ ] Tested customer portal

Your Stripe integration is now complete! 🎉 