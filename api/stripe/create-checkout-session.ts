import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-06-30.basil',
});

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const {
      priceId,
      userId,
      userEmail,
      companyId,
      successUrl,
      cancelUrl,
    } = req.body;

    if (!priceId || !userId || !userEmail || !companyId) {
      return res.status(400).json({ 
        message: 'Missing required fields: priceId, userId, userEmail, companyId' 
      });
    }

    // Create or retrieve customer
    let customer;
    try {
      const customers = await stripe.customers.list({
        email: userEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        customer = customers.data[0];
      } else {
        customer = await stripe.customers.create({
          email: userEmail,
          metadata: {
            userId,
            companyId,
          },
        });
      }
    } catch (error) {
      console.error('Error creating/retrieving customer:', error);
      return res.status(500).json({ message: 'Failed to create customer' });
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      customer: customer.id,
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        userId,
        companyId,
        customerId: customer.id,
      },
      subscription_data: {
        metadata: {
          userId,
          companyId,
        },
      },
    });

    res.status(200).json({ sessionId: session.id });
  } catch (error: any) {
    console.error('Error creating checkout session:', error);
    res.status(500).json({ 
      message: 'Internal server error', 
      error: error.message 
    });
  }
} 