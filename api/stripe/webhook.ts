import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ message: `Webhook Error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionCancellation(subscription);
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'invoice.payment_succeeded': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentSucceeded(invoice);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error: any) {
    console.error('Webhook handler error:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;
  const customerId = subscription.customer as string;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const isActive = subscription.status === 'active';
  const endDate = new Date((subscription as any).current_period_end * 1000).toISOString();

  const { error } = await supabase
    .from('company_profiles')
    .update({
      subscription_status: isActive ? 'active' : 'inactive',
      subscription_plan: isActive ? 'premium' : 'free',
      subscription_end_date: endDate,
      stripe_customer_id: customerId,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating subscription status:', error);
    throw error;
  }

  console.log(`Subscription updated for user ${userId}: ${subscription.status}`);
}

async function handleSubscriptionCancellation(subscription: Stripe.Subscription) {
  const userId = subscription.metadata.userId;

  if (!userId) {
    console.error('No userId found in subscription metadata');
    return;
  }

  const { error } = await supabase
    .from('company_profiles')
    .update({
      subscription_status: 'cancelled',
      subscription_plan: 'free',
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating subscription cancellation:', error);
    throw error;
  }

  console.log(`Subscription cancelled for user ${userId}`);
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const userId = session.metadata?.userId;
  const customerId = session.customer as string;

  if (!userId) {
    console.error('No userId found in checkout session metadata');
    return;
  }

  // Update customer ID in database
  const { error } = await supabase
    .from('company_profiles')
    .update({
      stripe_customer_id: customerId,
    })
    .eq('user_id', userId);

  if (error) {
    console.error('Error updating customer ID:', error);
    throw error;
  }

  console.log(`Checkout completed for user ${userId}`);
}

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // Get subscription details
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    await handleSubscriptionUpdate(subscription);
  }

  console.log(`Payment succeeded for customer ${customerId}`);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;
  
  // You might want to notify the user or take other actions
  console.log(`Payment failed for customer ${customerId}`);
  
  // Optionally, you could update the subscription status to indicate payment issues
  if ((invoice as any).subscription) {
    const subscription = await stripe.subscriptions.retrieve((invoice as any).subscription as string);
    const userId = subscription.metadata.userId;
    
    if (userId) {
      const { error } = await supabase
        .from('company_profiles')
        .update({
          subscription_status: 'past_due',
        })
        .eq('user_id', userId);

      if (error) {
        console.error('Error updating payment failed status:', error);
      }
    }
  }
} 