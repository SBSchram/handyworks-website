// Browser Console Script - Check Recent Invoices
// Paste this into the browser console on billing/admin.html

(async function() {
  console.log('📧 Checking recent invoices...\n');
  
  try {
    const db = firebase.firestore();
    
    // Get invoices from last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const invoicesSnapshot = await db.collection('handyworks_invoices')
      .where('created_at', '>=', firebase.firestore.Timestamp.fromDate(sevenDaysAgo))
      .orderBy('created_at', 'desc')
      .limit(50)
      .get();
    
    if (invoicesSnapshot.empty) {
      console.log('❌ No invoices found in the last 7 days.');
      return;
    }
    
    console.log(`✅ Found ${invoicesSnapshot.size} invoice(s) in the last 7 days:\n`);
    console.log('='.repeat(100));
    
    const invoices = [];
    invoicesSnapshot.forEach((doc) => {
      const invoice = { id: doc.id, ...doc.data() };
      invoices.push(invoice);
    });
    
    invoices.forEach((invoice, index) => {
      const createdDate = invoice.created_at?.toDate() || new Date();
      
      console.log(`\n${index + 1}. Invoice ID: ${invoice.invoice_id || invoice.id}`);
      console.log(`   Customer: ${invoice.customer_name || 'N/A'}`);
      console.log(`   📧 Email: ${invoice.customer_email || 'N/A'}`);
      console.log(`   Amount: $${invoice.amount || 0}`);
      console.log(`   Status: ${invoice.payment_status || 'pending'}`);
      console.log(`   Created: ${createdDate.toLocaleString()}`);
      console.log(`   Created By: ${invoice.created_by || 'N/A'}`);
      console.log(`   Payment Link: ${invoice.stripe_payment_link_url ? '✅ Yes' : '❌ No'}`);
      
      // Check for any email-related fields
      const emailFields = Object.keys(invoice).filter(key => 
        key.toLowerCase().includes('email') || 
        key.toLowerCase().includes('send') ||
        key.toLowerCase().includes('error') ||
        key.toLowerCase().includes('mail')
      );
      
      if (emailFields.length > 0) {
        console.log(`   📋 Email-related fields: ${emailFields.join(', ')}`);
        emailFields.forEach(field => {
          const value = invoice[field];
          if (value !== null && value !== undefined) {
            console.log(`     - ${field}: ${typeof value === 'object' ? JSON.stringify(value) : value}`);
          }
        });
      }
      
      console.log('-'.repeat(100));
    });
    
    // Summary
    const pending = invoices.filter(inv => inv.payment_status === 'pending').length;
    const paid = invoices.filter(inv => inv.payment_status === 'paid').length;
    const cancelled = invoices.filter(inv => inv.payment_status === 'cancelled').length;
    const withEmails = invoices.filter(inv => inv.customer_email).length;
    const withoutEmails = invoices.filter(inv => !inv.customer_email).length;
    
    console.log(`\n📊 Summary:`);
    console.log(`   Total Invoices: ${invoices.length}`);
    console.log(`   Pending: ${pending}`);
    console.log(`   Paid: ${paid}`);
    console.log(`   Cancelled: ${cancelled}`);
    console.log(`   With Email Address: ${withEmails}`);
    console.log(`   Without Email Address: ${withoutEmails}`);
    
    console.log(`\n💡 Email Delivery Notes:`);
    console.log(`   - This system sends emails manually through Gmail`);
    console.log(`   - There are no automated email error fields in Firebase`);
    console.log(`   - Check your Gmail Sent folder to verify emails were sent`);
    console.log(`   - SPF issues only affect SMTP2GO emails, not Gmail`);
    
    // Return invoices for further inspection
    return invoices;
    
  } catch (error) {
    console.error('❌ Error checking invoices:', error);
    console.error('Make sure you are on the billing/admin.html page with Firebase initialized.');
  }
})();

