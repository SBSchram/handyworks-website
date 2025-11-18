#!/usr/bin/env node
/**
 * Create Firebase Auth Users from Firestore Data
 * 
 * This script reads users from Firestore handyworks_users collection
 * and creates Firebase Authentication accounts for them.
 * 
 * Usage: node scripts/create_firebase_users.js
 * 
 * IMPORTANT: This requires Firebase Admin SDK (server-side only)
 * For security, this should be run as a Cloud Function or local script
 * with service account credentials.
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// NOTE: You'll need to download service account key from Firebase Console
// Go to: Project Settings → Service Accounts → Generate New Private Key
// Save as: serviceAccountKey.json (and add to .gitignore!)

let serviceAccount;
try {
    serviceAccount = require('./serviceAccountKey.json');
} catch (error) {
    console.error('❌ Error: serviceAccountKey.json not found!');
    console.error('   Please download service account key from Firebase Console:');
    console.error('   Project Settings → Service Accounts → Generate New Private Key');
    console.error('   Save as: scripts/serviceAccountKey.json');
    process.exit(1);
}

admin.initializeApp({
    credential: cert(serviceAccount)
});

const auth = getAuth();
const db = getFirestore();

/**
 * Create Firebase Auth user from Firestore user data
 */
async function createAuthUser(userData) {
    const email = userData.EMAIL;
    
    if (!email || !email.includes('@')) {
        console.warn(`⚠️  Skipping user ${userData.acct_num}: Invalid email "${email}"`);
        return { skipped: true, reason: 'Invalid email' };
    }
    
    try {
        // Check if user already exists
        let userRecord;
        try {
            userRecord = await auth.getUserByEmail(email);
            console.log(`ℹ️  User ${email} already exists (UID: ${userRecord.uid})`);
            return { exists: true, uid: userRecord.uid };
        } catch (error) {
            if (error.code !== 'auth/user-not-found') {
                throw error;
            }
        }
        
        // Create new user
        // Generate temporary password (user will need to reset)
        const tempPassword = generateTempPassword();
        
        userRecord = await auth.createUser({
            email: email,
            password: tempPassword,
            displayName: `${userData.fname || ''} ${userData.lname || ''}`.trim() || email,
            disabled: false
        });
        
        console.log(`✅ Created user: ${email} (UID: ${userRecord.uid})`);
        
        // Send password reset email so user can set their own password
        try {
            const resetLink = await auth.generatePasswordResetLink(email);
            console.log(`   Password reset link: ${resetLink}`);
            // TODO: Send email with reset link (or print for manual distribution)
        } catch (error) {
            console.warn(`   ⚠️  Could not generate password reset link: ${error.message}`);
        }
        
        return { created: true, uid: userRecord.uid, email: email };
        
    } catch (error) {
        console.error(`❌ Error creating user ${email}:`, error.message);
        return { error: error.message };
    }
}

/**
 * Generate a secure temporary password
 */
function generateTempPassword() {
    // Generate random password (user will reset it anyway)
    const length = 16;
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*';
    let password = '';
    for (let i = 0; i < length; i++) {
        password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
}

/**
 * Main function
 */
async function main() {
    console.log('🔥 Starting Firebase Auth user creation...\n');
    
    try {
        // Get all users from Firestore
        const usersRef = db.collection('handyworks_users');
        const snapshot = await usersRef.get();
        
        if (snapshot.empty) {
            console.log('❌ No users found in handyworks_users collection');
            return;
        }
        
        console.log(`📊 Found ${snapshot.size} users in Firestore\n`);
        
        const results = {
            created: 0,
            exists: 0,
            skipped: 0,
            errors: 0
        };
        
        const createdUsers = [];
        const skippedUsers = [];
        
        // Process each user
        for (const doc of snapshot.docs) {
            const userData = doc.data();
            const result = await createAuthUser(userData);
            
            if (result.created) {
                results.created++;
                createdUsers.push({ email: result.email, uid: result.uid });
            } else if (result.exists) {
                results.exists++;
            } else if (result.skipped) {
                results.skipped++;
                skippedUsers.push({ acct_num: userData.acct_num, email: userData.EMAIL, reason: result.reason });
            } else if (result.error) {
                results.errors++;
            }
            
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        // Summary
        console.log('\n\n📊 Summary:');
        console.log(`   ✅ Created: ${results.created} users`);
        console.log(`   ℹ️  Already exists: ${results.exists} users`);
        console.log(`   ⚠️  Skipped: ${results.skipped} users`);
        console.log(`   ❌ Errors: ${results.errors} users`);
        
        if (createdUsers.length > 0) {
            console.log('\n✅ Successfully created users:');
            createdUsers.forEach(user => {
                console.log(`   - ${user.email} (${user.uid})`);
            });
        }
        
        if (skippedUsers.length > 0) {
            console.log('\n⚠️  Skipped users:');
            skippedUsers.forEach(user => {
                console.log(`   - Account ${user.acct_num}: ${user.email} (${user.reason})`);
            });
        }
        
        console.log('\n✨ Done!');
        console.log('\n📧 Next Steps:');
        console.log('   1. Send password reset emails to new users');
        console.log('   2. Or manually distribute temporary passwords');
        console.log('   3. Users can reset passwords via login page "Forgot Password" link');
        
    } catch (error) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run if called directly
if (require.main === module) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}

module.exports = { createAuthUser };

