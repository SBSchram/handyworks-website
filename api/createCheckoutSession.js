/**
 * Vercel Serverless Function - Create Stripe Checkout Session
 * 
 * This function securely creates Stripe Checkout Sessions
 * without exposing the secret key to the client.
 * 
 * The Stripe secret key should be set as a Vercel environment variable:
 * StripeLiveKey=sk_live_... or sk_test_...
 */

const stripe = require('stripe')(process.env.StripeLiveKey);

module.exports = async (req, res) => {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight OPTIONS request
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const invoiceData = req.body;

    // Validate required fields
    if (!invoiceData.customer_email) {
      return res.status(400).json({ error: 'Customer email is required' });
    }

    if (!invoiceData.amount) {
      return res.status(400).json({ error: 'Amount is required' });
    }

    // Check if Stripe secret key is configured
    if (!process.env.StripeLiveKey) {
      console.error('StripeLiveKey environment variable is not set');
      return res.status(500).json({ error: 'Server configuration error' });
    }

    // Convert amount to cents (Stripe requires amount in cents)
    const amountInCents = Math.round(parseFloat(invoiceData.amount) * 100);

    if (amountInCents <= 0) {
      return res.status(400).json({ error: 'Amount must be greater than 0' });
    }

    // Create Stripe Checkout Session with custom amount
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `HandyWorks ${invoiceData.year || ''} Annual Maintenance`,
              description: `Maintenance fee for ${invoiceData.customer_name || 'Customer'}`,
            },
            unit_amount: amountInCents,
          },
          quantity: 1,
        },
      ],
      customer_email: invoiceData.customer_email,
      billing_address_collection: 'auto',
      phone_number_collection: {
        enabled: true,
      },
      // Enable automatic email receipt from Stripe
      payment_intent_data: {
        receipt_email: invoiceData.customer_email,
      },
      success_url: 'https://handyworks.com/payment-success.html?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://handyworks.com/payment-cancelled.html',
      metadata: {
        acct_num: invoiceData.acct_num?.toString() || '',
        customer_name: invoiceData.customer_name || '',
        year: invoiceData.year?.toString() || '',
        invoice_amount: invoiceData.amount?.toString() || '',
      },
      custom_text: {
        submit: {
          message: `Payment for ${invoiceData.customer_name || 'Customer'} - ${invoiceData.year || ''} Annual Maintenance`,
        },
      },
    });

    // Return session URL
    return res.status(200).json({
      success: true,
      id: session.id,
      url: session.url,
    });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return res.status(500).json({
      error: 'Failed to create checkout session',
      message: error.message,
    });
  }
};

