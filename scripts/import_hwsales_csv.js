#!/usr/bin/env node
/**
 * HandyWorks Sales CSV Import Script
 * Imports hwsales.csv data into Firebase Firestore
 * 
 * Usage: node scripts/import_hwsales_csv.js <input_file.csv>
 */

const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Firebase configuration for HandyWorks Billing
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
 * Parse CSV data into array of objects
 * Handles quoted fields and commas within quotes
 */
function parseCSV(csvData) {
    const lines = csvData.trim().split('\n');
    if (lines.length < 2) {
        throw new Error('CSV file must have at least a header row and one data row');
    }

    // Parse header row
    const headers = parseCSVLine(lines[0]);
    
    // Parse data rows
    const records = [];
    for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const record = {};
        
        // Map headers to values
        headers.forEach((header, index) => {
            let value = values[index] || '';
            value = value.trim();
            
            // Convert empty strings to null
            if (value === '' || value === 'None') {
                value = null;
            }
            
            record[header] = value;
        });
        
        // Note: No need to handle extra columns - CSV structure is now correct
        
        records.push(record);
    }
    
    return records;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current);
            current = '';
        } else {
            current += char;
        }
    }
    
    result.push(current);
    return result;
}

/**
 * Extract and map fields from CSV record to Firebase document
 * CSV structure: First Name,Acct_Num,Sale,Last Name,E-mail Address,Home Street,Home City,Home State,Home Postal Code,Home Phone,Work Phone,Mobile Phone,Clinic
 */
function extractFields(record) {
    // CSV structure (corrected): First Name,Acct_Num,Sale,Last Name,E-mail Address,Home Street,Home City,Home State,Home Postal Code,Home Phone,Work Phone,Mobile Phone,Clinic
    
    // Get account number from Acct_Num column (column 2)
    let acctNum = null;
    if (record.Acct_Num) {
        const parsed = parseInt(record.Acct_Num);
        if (!isNaN(parsed) && parsed > 0) {
            acctNum = parsed;
        }
    }
    
    if (!acctNum) {
        console.warn(`Warning: Could not find valid acct_num in record, skipping. Data:`, JSON.stringify(record));
        return null;
    }
    
    // Map CSV fields to Firebase fields - now using correct header names
    const firebaseDoc = {
        // Primary identifier
        acct_num: acctNum,
        
        // Demographic fields - map directly from CSV headers
        fname: record['First Name'] || null,
        lname: record['Last Name'] || null,
        clinic: record.Clinic ? record.Clinic.replace(/\r$/, '').trim() : null,
        EMAIL: record['E-mail Address'] || null,
        
        // Address fields - map directly from CSV headers
        addr1: record['Home Street'] || null,
        addr2: null, // Not in CSV
        city: record['Home City'] || null,
        state: record['Home State'] || null,
        zip: record['Home Postal Code'] || null,
        
        // Phone fields - map directly from CSV headers
        HomePhone: record['Home Phone'] || null,
        tele1: record['Work Phone'] || null,
        CellPhone: record['Mobile Phone'] || null,
        
        // Status - default to Active since this is sales data
        status: 'A',
        
        // Billing fields - initialize to zero (will be set later)
        maint_billed: 0,
        maint_paid: 0,
        maintbilldt: null,
        maintpddt: null,
        owed: 0,
        
        // Metadata
        imported_at: new Date(),
        source: 'hwsales_csv'
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
        console.error('Usage: node scripts/import_hwsales_csv.js <input_file.csv>');
        process.exit(1);
    }
    
    const inputFile = args[0];
    
    try {
        console.log(`📖 Reading file: ${inputFile}`);
        const csvData = fs.readFileSync(inputFile, 'utf-8');
        
        console.log('📝 Parsing CSV data...');
        const records = parseCSV(csvData);
        console.log(`   Found ${records.length} records`);
        
        // Debug: Show first record structure
        if (records.length > 0) {
            console.log('\n📋 First record structure:');
            console.log(JSON.stringify(records[0], null, 2));
        }
        
        console.log('\n🔥 Connecting to Firebase...');
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

module.exports = { parseCSV, extractFields, importToFirebase };

