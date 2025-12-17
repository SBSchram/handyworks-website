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

// Disable automatic body parsing for this function
export const config = {
  api: {
    bodyParser: false,
  },
};

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

// Helper function to get raw body
async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', chunk => {
      data += chunk;
    });
    req.on('end', () => {
      resolve(data);
    });
    req.on('error', reject);
  });
}

module.exports = async (req, res) => {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.StripeWebhookSecret;

  let event;

  try {
    // Get raw body for signature verification
    const rawBody = await getRawBody(req);
    
    // Verify webhook signature
    event = stripe.webhooks.constructEvent(
      rawBody,
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
  const customerName = metadata.customer_name;
  const customerEmail = session.customer_details?.email || metadata.customer_email || '';

  if (!acctNum || !year) {
    console.error('Missing metadata in checkout session');
    return;
  }

  // Find the invoice in Firestore
  const invoicesRef = db.collection('handyworks_invoices');
  const query = invoicesRef
    .where('acct_num', '==', parseInt(acctNum))
    .where('year', '==', parseInt(year))
    .orderBy('created_at', 'desc')
    .limit(1);

  const snapshot = await query.get();

  if (snapshot.empty) {
    console.error(`No invoice found for acct_num: ${acctNum}, year: ${year}`);
    return;
  }

  // Get the invoice document
  const invoiceDoc = snapshot.docs[0];
  const invoiceData = invoiceDoc.data();
  const invoiceId = invoiceData.invoice_id;
  const paymentAmount = session.amount_total / 100; // Convert from cents to dollars

  // Create payment record in handyworks_payments collection
  const paymentData = {
    invoice_id: invoiceId,
    acct_num: parseInt(acctNum),
    customer_name: customerName || 'Unknown',
    customer_email: customerEmail,
    amount: paymentAmount,
    payment_date: admin.firestore.Timestamp.now(),
    payment_method: 'stripe',
    payment_reference: session.payment_intent,
    notes: 'Automatic payment via Stripe',
    stripe_payment_intent_id: session.payment_intent,
    stripe_session_id: session.id,
    recorded_by: 'system_webhook',
    created_at: admin.firestore.Timestamp.now(),
    status: 'completed'
  };

  await db.collection('handyworks_payments').add(paymentData);
  console.log(`Payment record created for invoice ${invoiceId}`);

  // Calculate total paid for this invoice
  const paymentsSnapshot = await db.collection('handyworks_payments')
    .where('invoice_id', '==', invoiceId)
    .get();
  
  const totalPaid = paymentsSnapshot.docs.reduce((sum, doc) => {
    return sum + (doc.data().amount || 0);
  }, 0);

  // Update invoice status based on total payments
  const updateData = {
    stripe_payment_intent_id: session.payment_intent,
    stripe_checkout_session_id: session.id,
    updated_at: admin.firestore.Timestamp.now(),
    updated_by: 'stripe_webhook',
  };

  // If fully paid, mark as paid
  if (totalPaid >= invoiceData.amount) {
    updateData.payment_status = 'paid';
    updateData.paid_date = admin.firestore.Timestamp.now();
    console.log(`Invoice ${invoiceId} fully paid (total: $${totalPaid})`);
  } else {
    console.log(`Invoice ${invoiceId} partially paid (total: $${totalPaid} of $${invoiceData.amount})`);
  }

  await invoiceDoc.ref.update(updateData);
  console.log(`Invoice ${invoiceDoc.id} updated in Firestore`);
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

