#!/usr/bin/env node
/**
 * HandyWorks Data Import Script
 * Imports MS Access data (TSV format) into Firebase Firestore
 * 
 * Usage: node scripts/import_handyworks_data.js <input_file.tsv>
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration for HandyWorks Billing
// Project: Handyworks-Billing
// Project ID: handyworks-billing
// Project Number: 326712635528
const firebaseConfig = {
    apiKey: "AIzaSyBBEcYul9EkvhaYehpR2wBKkvi7W9s-zVo",
    authDomain: "handyworks-billing.firebaseapp.com",
    projectId: "handyworks-billing",
    storageBucket: "handyworks-billing.firebasestorage.app",
    messagingSenderId: "326712635528",
    appId: "1:326712635528:web:5c408a30fd44de2f9e2f3d",
    measurementId: "G-3ZDBCGXH4D"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

/**
 * Parse TSV data into array of objects
 */
function parseTSV(tsvData) {
    const lines = tsvData.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('TSV file must have at least a header row and one data row');
    }

    // Parse header row
    const headers = lines[0].split('\t').map(h => h.trim());
    
    // Parse data rows
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split('\t');
        const record = {};
        
        headers.forEach((header, index) => {
            let value = values[index] || '';
            value = value.trim();
            
            // Convert empty strings to null
            if (value === '' || value === 'None') {
                value = null;
            }
            
            record[header] = value;
        });
        
        records.push(record);
    }
    
    return records;
}

/**
 * Convert date string to Firestore Timestamp
 * Handles various date formats: "1/1/2025", "3/20/2006", etc.
 */
function parseDate(dateStr) {
    if (!dateStr || dateStr === '' || dateStr === 'None') {
        return null;
    }
    
    try {
        // Handle MM/DD/YYYY format
        const parts = dateStr.split('/');
        if (parts.length === 3) {
            const month = parseInt(parts[0]) - 1; // JavaScript months are 0-indexed
            const day = parseInt(parts[1]);
            const year = parseInt(parts[2]);
            const date = new Date(year, month, day);
            
            // Check if date is valid
            if (!isNaN(date.getTime())) {
                return date;
            }
        }
        
        // Try ISO format
        const isoDate = new Date(dateStr);
        if (!isNaN(isoDate.getTime())) {
            return isoDate;
        }
        
        return null;
    } catch (error) {
        console.warn(`Warning: Could not parse date "${dateStr}":`, error.message);
        return null;
    }
}

/**
 * Convert currency string to number
 * Handles formats like "$555.00", "$0.00", "555.00", etc.
 */
function parseCurrency(currencyStr) {
    if (!currencyStr || currencyStr === '' || currencyStr === 'None') {
        return 0;
    }
    
    // Remove $ sign, commas, and whitespace
    const cleaned = currencyStr.replace(/[$,\s]/g, '');
    const num = parseFloat(cleaned);
    
    return isNaN(num) ? 0 : num;
}

/**
 * Extract only the fields we need for Firebase
 */
function extractFields(record) {
    // Required: acct_num (must exist)
    if (!record.acct_num || record.acct_num === '') {
        return null; // Skip records without acct_num
    }
    
    const acctNum = parseInt(record.acct_num);
    if (isNaN(acctNum)) {
        console.warn(`Warning: Invalid acct_num "${record.acct_num}", skipping record`);
        return null;
    }
    
    // Build Firebase document with only needed fields
    const firebaseDoc = {
        // Primary identifier
        acct_num: acctNum,
        
        // Demographic fields
        lname: record.lname || null,
        fname: record.fname || null,
        clinic: record.clinic || null,
        EMAIL: record.EMAIL || null,
        tele1: record.tele1 || null,
        HomePhone: record.HomePhone || null,
        CellPhone: record.CellPhone || null,
        addr1: record.addr1 || null,
        addr2: record.addr2 || null,
        city: record.city || null,
        state: record.state || null,
        zip: record.zip || null,
        status: record.status || null,
        
        // Billing fields (current year)
        maint_billed: parseCurrency(record['maint billed'] || record.maint_billed),
        maint_paid: parseCurrency(record['maint paid'] || record.maint_paid),
        maintbilldt: parseDate(record.maintbilldt),
        maintpddt: parseDate(record.maintpddt),
        owed: parseFloat(record.owed) || 0,
        
        // Metadata
        imported_at: new Date(),
        source: 'ms_access_export'
    };
    
    return firebaseDoc;
}

/**
 * Import data into Firebase Firestore
 */
async function importToFirebase(records) {
    console.log(`\n📊 Starting import of ${records.length} records...\n`);
    
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (const record of records) {
        const firebaseDoc = extractFields(record);
        
        if (!firebaseDoc) {
            errorCount++;
            continue;
        }
        
        try {
            // Use acct_num as document ID
            const docRef = doc(db, 'handyworks_users', firebaseDoc.acct_num.toString());
            await setDoc(docRef, firebaseDoc, { merge: true });
            
            successCount++;
            
            if (successCount % 10 === 0) {
                process.stdout.write(`\r✅ Imported ${successCount} records...`);
            }
        } catch (error) {
            errorCount++;
            errors.push({
                acct_num: firebaseDoc.acct_num,
                error: error.message
            });
            console.error(`\n❌ Error importing acct_num ${firebaseDoc.acct_num}:`, error.message);
        }
    }
    
    console.log(`\n\n✅ Import complete!`);
    console.log(`   Success: ${successCount} records`);
    console.log(`   Errors: ${errorCount} records`);
    
    if (errors.length > 0) {
        console.log(`\n⚠️  Errors encountered:`);
        errors.forEach(err => {
            console.log(`   - acct_num ${err.acct_num}: ${err.error}`);
        });
    }
    
    return { successCount, errorCount, errors };
}

/**
 * Main function
 */
async function main() {
    const args = process.argv.slice(2);
    
    if (args.length === 0) {
        console.error('Usage: node scripts/import_handyworks_data.js <input_file.tsv>');
        console.error('\nOr provide TSV data via stdin:');
        console.error('  cat data.tsv | node scripts/import_handyworks_data.js');
        process.exit(1);
    }
    
    const inputFile = args[0];
    
    try {
        console.log(`📖 Reading file: ${inputFile}`);
        const tsvData = fs.readFileSync(inputFile, 'utf-8');
        
        console.log('📝 Parsing TSV data...');
        const records = parseTSV(tsvData);
        console.log(`   Found ${records.length} records`);
        
        console.log('🔥 Connecting to Firebase...');
        console.log(`   Project: ${firebaseConfig.projectId}`);
        
        await importToFirebase(records);
        
        console.log('\n✨ Done!');
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

module.exports = { parseTSV, extractFields, importToFirebase };

