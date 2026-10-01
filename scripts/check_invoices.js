// Script to check recent invoices in Firebase
// Usage: node scripts/check_invoices.js

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase Admin
const serviceAccount = require(path.join(__dirname, '../serviceAccountKey.json'));

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId: 'handyworks-billing'
});

const db = admin.firestore();

async function checkRecentInvoices() {
  try {
    console.log('📧 Checking recent invoices...\n');
    
    // Get invoices from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const invoicesSnapshot = await db.collection('handyworks_invoices')
      .where('created_at', '>=', admin.firestore.Timestamp.fromDate(sevenDaysAgo))
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();
    
    if (invoicesSnapshot.empty) {
      console.log('No invoices found in the last 7 days.');
      return;
    }
    
    console.log(`Found ${invoicesSnapshot.size} invoice(s) in the last 7 days:\n`);
    console.log('='.repeat(100));
    
    invoicesSnapshot.forEach((doc, index) => {
      const invoice = doc.data();
      const createdDate = invoice.created_at?.toDate() || new Date();
      
      console.log(`\n${index + 1}. Invoice ID: ${invoice.invoice_id || doc.id}`);
      console.log(`   Customer: ${invoice.customer_name || 'N/A'}`);
      console.log(`   Email: ${invoice.customer_email || 'N/A'}`);
      console.log(`   Amount: $${invoice.amount || 0}`);
      console.log(`   Status: ${invoice.payment_status || 'pending'}`);
      console.log(`   Created: ${createdDate.toLocaleString()}`);
      console.log(`   Created By: ${invoice.created_by || 'N/A'}`);
      console.log(`   Payment Link: ${invoice.stripe_payment_link_url ? 'Yes' : 'No'}`);
      
      // Check for any email-related fields
      const emailFields = Object.keys(invoice).filter(key => 
        key.toLowerCase().includes('email') || 
        key.toLowerCase().includes('send') ||
        key.toLowerCase().includes('error')
      );
      
      if (emailFields.length > 0) {
        console.log(`   Email-related fields: ${emailFields.join(', ')}`);
        emailFields.forEach(field => {
          console.log(`     - ${field}: ${JSON.stringify(invoice[field])}`);
        });
      }
      
      console.log('-'.repeat(100));
    });
    
    // Summary
    const pending = invoicesSnapshot.docs.filter(doc => 
      doc.data().payment_status === 'pending'
    ).length;
    const paid = invoicesSnapshot.docs.filter(doc => 
      doc.data().payment_status === 'paid'
    ).length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total: ${invoicesSnapshot.size}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Paid: ${paid}`);
    console.log(`\n💡 Note: This system sends emails manually through Gmail.`);
    console.log(`   There are no automated email error fields in Firebase.`);
    console.log(`   Check your Gmail Sent folder to verify emails were sent.`);
    
  } catch (error) {
    console.error('❌ Error checking invoices:', error);
  } finally {
    process.exit(0);
  }
}

checkRecentInvoices();

