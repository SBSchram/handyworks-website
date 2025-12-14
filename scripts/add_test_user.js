#!/usr/bin/env node
/**
 * Add Test User to Firestore
 * Adds a test user to the handyworks_users collection
 * 
 * Usage: node scripts/add_test_user.js
 * 
 * Prerequisites:
 * 1. Install firebase-admin: npm install firebase-admin
 * 2. Download service account key from Firebase Console
 * 3. Save as: scripts/serviceAccountKey.json
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

const db = admin.firestore();

// Test user data
const testUser = {
    acct_num: 9999, // Test account number
    fname: 'Steven',
    lname: 'Schram',
    EMAIL: 'sbschram@gmail.com',
    clinic: 'Test Clinic',
    status: 'A', // Active
    maint_billed: 0,
    maint_paid: 0,
    owed: 0,
    maintbilldt: null,
    maintpddt: null,
    tele1: null,
    HomePhone: null,
    CellPhone: null,
    addr1: null,
    addr2: null,
    city: null,
    state: null,
    zip: null,
    imported_at: admin.firestore.Timestamp.now(),
    source: 'manual_test_user'
};

async function addTestUser() {
    try {
        console.log('📝 Adding test user to Firestore...\n');
        console.log('   Name: Steven Schram');
        console.log('   Email: sbschram@gmail.com');
        console.log('   Account #: 9999\n');
        
        // Use acct_num as document ID
        const docRef = db.collection('handyworks_users').doc('9999');
        
        // Check if user already exists
        const existingDoc = await docRef.get();
        if (existingDoc.exists) {
            console.log('⚠️  User with account #9999 already exists.');
            console.log('   Updating existing user...\n');
            await docRef.set(testUser, { merge: true });
            console.log('✅ Test user updated successfully!');
        } else {
            await docRef.set(testUser);
            console.log('✅ Test user added successfully!');
        }
        
        console.log('\n📋 User Details:');
        console.log(`   Account #: ${testUser.acct_num}`);
        console.log(`   Name: ${testUser.fname} ${testUser.lname}`);
        console.log(`   Email: ${testUser.EMAIL}`);
        console.log(`   Clinic: ${testUser.clinic}`);
        console.log(`   Status: ${testUser.status}`);
        
        console.log('\n✅ Done! You can now see this user in the admin dashboard.');
        
        process.exit(0);
    } catch (error) {
        console.error('\n❌ Error adding test user:', error.message);
        process.exit(1);
    }
}

// Run the script
addTestUser();

