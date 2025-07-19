import { loadStripe } from '@stripe/stripe-js';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

if (!stripePublishableKey) {
  throw new Error('Missing Stripe publishable key. Please add VITE_STRIPE_PUBLISHABLE_KEY to your .env.local file.');
}

export const stripePromise = loadStripe(stripePublishableKey);

export const STRIPE_PRICE_IDS = {
  PREMIUM_MONTHLY: 'price_premium_monthly', // You'll need to create this in Stripe Dashboard
} as const;

export const SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    price: 0,
    jobPostingLimit: 2,
    features: [
      'Browse job applications',
      'Company profile setup',
      'Up to 2 job postings',
    ],
    restrictions: [
      'No AI screening',
      'Basic support',
    ],
  },
  PREMIUM: {
    name: 'Premium',
    price: 25,
    jobPostingLimit: null, // unlimited
    features: [
      'Everything in Free',
      'Unlimited job postings',
      'AI-powered candidate screening',
      'Priority support',
      'Advanced analytics',
    ],
  },
} as const; 