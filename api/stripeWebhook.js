/**
 * Vercel Serverless Function - Stripe Webhook Handler
 * 
 * This function listens for Stripe events (payment success, failure, etc.)
 * and updates the corresponding invoice in Firestore.
 * 
 * Required environment variables:
 * - StripeLiveKey: Stripe secret key
 * - StripeWebhookSecret: Webhook signing secret (from Stripe Dashboard)
 * - FIREBASE_PROJECT_ID: Firebase project ID
 * - FIREBASE_CLIENT_EMAIL: Service account email
 * - FIREBASE_PRIVATE_KEY: Service account private key
 */

const stripe = require('stripe')(process.env.StripeLiveKey);
const admin = require('firebase-admin');

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  } catch (error) {
    console.error('Firebase initialization error:', error);
  }
}

const db = admin.firestore();

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.StripeWebhookSecret;

  let event;

  try {
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).json({ error: `Webhook Error: ${err.message}` });
  }

  // Handle the event
  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object);
        break;
      
      case 'payment_intent.succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;
      
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;
      
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Error handling webhook:', error);
    return res.status(500).json({ error: 'Webhook handler failed' });
  }
};

/**
 * Handle successful checkout session completion
 */
async function handleCheckoutSessionCompleted(session) {
  console.log('Checkout session completed:', session.id);

  const metadata = session.metadata;
  const acctNum = metadata.acct_num;
  const year = metadata.year;

  if (!acctNum || !year) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Find the invoice in Firestore
  const invoicesRef = db.collection('handyworks_invoices');
  const query = invoicesRef
    .where('acct_num', '==', parseInt(acctNum))
    .where('year', '==', parseInt(year))
    .where('payment_status', '==', 'pending');

  const snapshot = await query.get();

  if (snapshot.empty) {
    console.error(`No pending invoice found for acct_num: ${acctNum}, year: ${year}`);
    return;
  }

  // Update the first matching invoice
  const invoiceDoc = snapshot.docs[0];
  const updateData = {
    payment_status: 'paid',
    stripe_payment_intent_id: session.payment_intent,
    stripe_checkout_session_id: session.id,
    paid_date: admin.firestore.Timestamp.now(),
    paid_amount: session.amount_total / 100, // Convert from cents to dollars
    payment_method: 'stripe_card',
    transaction_ref: session.payment_intent,
    updated_at: admin.firestore.Timestamp.now(),
    updated_by: 'stripe_webhook',
  };

  await invoiceDoc.ref.update(updateData);
  console.log(`Invoice ${invoiceDoc.id} marked as paid`);
}

/**
 * Handle successful payment intent
 */
async function handlePaymentSucceeded(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  
  // Additional handling if needed
  // The checkout.session.completed event already handles most updates
}

/**
 * Handle failed payment
 */
async function handlePaymentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);

  // Find invoice by payment_intent_id and mark as failed
  const invoicesRef = db.collection('handyworks_invoices');
  const query = invoicesRef.where('stripe_payment_intent_id', '==', paymentIntent.id);

  const snapshot = await query.get();

  if (!snapshot.empty) {
    const invoiceDoc = snapshot.docs[0];
    await invoiceDoc.ref.update({
      payment_status: 'failed',
      updated_at: admin.firestore.Timestamp.now(),
      updated_by: 'stripe_webhook',
    });
    console.log(`Invoice ${invoiceDoc.id} marked as failed`);
  }
}

