#!/usr/bin/env node
/**
 * Set Admin Custom Claim Script
 * Sets the 'admin: true' custom claim for a Firebase user
 * 
 * Usage: node scripts/set_admin_claim.js <user-email>
 * 
 * Prerequisites:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Save as: scripts/serviceAccountKey.json
 * 4. Add serviceAccountKey.json to .gitignore (already done)
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Check for service account key
const serviceAccountPath = path.join(__dirname, 'serviceAccountKey.json');
if (!fs.existsSync(serviceAccountPath)) {
    console.error('❌ Error: serviceAccountKey.json not found');
    console.error('   Please download it from Firebase Console:');
    console.error('   1. Go to: https://console.firebase.google.com/project/handyworks-billing/settings/serviceaccounts/adminsdk');
    console.error('   2. Click "Generate New Private Key"');
    console.error('   3. Save as: scripts/serviceAccountKey.json');
    process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = require(serviceAccountPath);
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

// Get email from command line
const userEmail = process.argv[2];

if (!userEmail) {
    console.error('❌ Error: Email address required');
    console.error('   Usage: node scripts/set_admin_claim.js <user-email>');
    console.error('   Example: node scripts/set_admin_claim.js steve@handyworks.com');
    process.exit(1);
}

// Validate email format
if (!userEmail.includes('@')) {
    console.error('❌ Error: Invalid email address');
    process.exit(1);
}

async function setAdminClaim() {
    try {
        console.log(`\n🔍 Looking up user: ${userEmail}...`);
        
        // Find user by email
        const user = await admin.auth().getUserByEmail(userEmail);
        
        if (!user) {
            console.error(`❌ Error: User not found: ${userEmail}`);
            console.error('   Make sure the user has a Firebase Auth account');
            process.exit(1);
        }
        
        console.log(`✅ Found user: ${user.uid}`);
        console.log(`   Email: ${user.email}`);
        console.log(`   Current custom claims:`, user.customClaims || '(none)');
        
        // Set admin custom claim
        console.log(`\n🔧 Setting admin custom claim...`);
        await admin.auth().setCustomUserClaims(user.uid, { admin: true });
        
        // Verify the claim was set
        const updatedUser = await admin.auth().getUser(user.uid);
        console.log(`\n✅ Admin claim set successfully!`);
        console.log(`   Updated custom claims:`, updatedUser.customClaims);
        
        console.log(`\n📝 Important Notes:`);
        console.log(`   - User must sign out and sign back in for changes to take effect`);
        console.log(`   - The admin claim will be included in the user's ID token`);
        console.log(`   - Security rules will now recognize this user as an admin`);
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error setting admin claim:');
        console.error(error.message);
        
        if (error.code === 'auth/user-not-found') {
            console.error('\n💡 Tip: User must have a Firebase Auth account first');
            console.error('   Create account via Firebase Console or create_firebase_users.js');
        }
        
        process.exit(1);
    }
}

// Run the function
setAdminClaim();

