// Admin Dashboard JavaScript
// Handles Firebase authentication, Firestore queries, and user display

(function() {
    'use strict';
    
    // Wait for config and Firebase to be available
    if (typeof window.HandyWorksConfig === 'undefined') {
        console.error('HandyWorksConfig not found');
        showError('Configuration error. Please refresh the page.');
        return;
    }
    
    // Initialize Firebase
    const config = window.HandyWorksConfig.firebase;
    if (!firebase.apps.length) {
        firebase.initializeApp(config);
    }
    
    const auth = firebase.auth();
    const db = firebase.firestore();
    
    // State
    let allUsers = [];
    let filteredUsers = [];
    
    // DOM Elements
    const loadingMessage = document.getElementById('loadingMessage');
    const errorMessage = document.getElementById('errorMessage');
    const usersTable = document.getElementById('usersTable');
    const usersTableBody = document.getElementById('usersTableBody');
    const noDataMessage = document.getElementById('noDataMessage');
    const searchInput = document.getElementById('searchInput');
    const statusFilter = document.getElementById('statusFilter');
    const userStatusFilter = document.getElementById('userStatusFilter');
    const logoutButton = document.getElementById('logoutButton');
    const generateBillButton = document.getElementById('generateBillButton');
    const exportButton = document.getElementById('exportButton');
    
    // Stats elements
    const totalUsersEl = document.getElementById('totalUsers');
    const noInvoiceCountEl = document.getElementById('noInvoiceCount');
    const paidCountEl = document.getElementById('paidCount');
    const pendingCountEl = document.getElementById('pendingCount');
    const overdueCountEl = document.getElementById('overdueCount');
    
    // Check authentication
    auth.onAuthStateChanged((user) => {
        if (!user) {
            // Not logged in, redirect to login
            window.location.href = 'admin-login.html';
        } else {
            // Logged in, load users
            loadUsers();
        }
    });
    
    // Logout handler
    logoutButton.addEventListener('click', async () => {
        try {
            await auth.signOut();
            window.location.href = 'admin-login.html';
        } catch (error) {
            console.error('Logout error:', error);
            showError('Logout failed. Please try again.');
        }
    });
    
    // Search and filter handlers
    searchInput.addEventListener('input', filterUsers);
    statusFilter.addEventListener('change', filterUsers);
    userStatusFilter.addEventListener('change', filterUsers);
    
    // Generate bill handler (placeholder for now)
    generateBillButton.addEventListener('click', () => {
        alert('Generate Bill functionality will be implemented in Phase 2 (Stripe Payment Links)');
    });
    
    // Export handler
    exportButton.addEventListener('click', exportToCSV);
    
    // Load users from Firestore
    async function loadUsers() {
        try {
            showLoading();
            hideError();
            
            const usersSnapshot = await db.collection('handyworks_users').get();
            
            allUsers = usersSnapshot.docs.map(doc => {
                const data = doc.data();
                return {
                    id: doc.id,
                    acct_num: data.acct_num || '',
                    fname: data.fname || '',
                    lname: data.lname || '',
                    email: data.EMAIL || '',
                    clinic: data.clinic || '',
                    status: data.status || '',
                    maint_billed: data.maint_billed || 0,
                    maint_paid: data.maint_paid || 0,
                    owed: data.owed || 0,
                    maintbilldt: data.maintbilldt || null,
                    maintpddt: data.maintpddt || null
                };
            });
            
            // Load 2026 invoices for payment status
            const currentYear = new Date().getFullYear();
            const targetYear = currentYear + 1; // 2026 for billing
            const invoicesSnapshot = await db.collection('handyworks_invoices')
                .where('year', '==', targetYear)
                .get();
            
            // Create a map of account number to invoice status
            const invoiceMap = {};
            invoicesSnapshot.docs.forEach(doc => {
                const invoice = doc.data();
                invoiceMap[invoice.acct_num] = {
                    payment_status: invoice.payment_status || 'pending',
                    invoice_id: doc.id,
                    amount: invoice.amount,
                    due_date: invoice.due_date,
                    stripe_payment_link_url: invoice.stripe_payment_link_url
                };
            });
            
            // Calculate payment status for each user (for 2026)
            allUsers.forEach(user => {
                user.invoice2026 = invoiceMap[user.acct_num] || null;
                user.paymentStatus = calculatePaymentStatus(user);
            });
            
            // Update stats
            updateStats();
            
            // Apply filters and display
            filterUsers();
            
        } catch (error) {
            console.error('Error loading users:', error);
            showError('Failed to load users. Please refresh the page.');
        } finally {
            hideLoading();
        }
    }
    
    // Calculate payment status based on 2026 invoice
    function calculatePaymentStatus(user) {
        // Check if there's a 2026 invoice for this user
        if (!user.invoice2026) {
            return 'no-invoice'; // No invoice generated yet for 2026
        }
        
        const invoice = user.invoice2026;
        
        // Check invoice payment status
        if (invoice.payment_status === 'paid') {
            return 'paid';
        } else if (invoice.payment_status === 'pending') {
            // Check if overdue based on due date
            if (invoice.due_date) {
                const dueDate = invoice.due_date.toDate ? invoice.due_date.toDate() : new Date(invoice.due_date);
                const now = new Date();
                if (now > dueDate) {
                    return 'overdue';
                }
            }
            return 'pending';
        } else {
            return invoice.payment_status; // 'cancelled', etc.
        }
    }
    
    // Filter users based on search and filters
    function filterUsers() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const statusFilterValue = statusFilter.value;
        const userStatusFilterValue = userStatusFilter.value;
        
        filteredUsers = allUsers.filter(user => {
            // Search filter
            if (searchTerm) {
                const searchableText = [
                    user.fname,
                    user.lname,
                    user.email,
                    user.acct_num?.toString(),
                    user.clinic
                ].join(' ').toLowerCase();
                
                if (!searchableText.includes(searchTerm)) {
                    return false;
                }
            }
            
            // Payment status filter
            if (statusFilterValue !== 'all' && user.paymentStatus !== statusFilterValue) {
                return false;
            }
            
            // User status filter
            if (userStatusFilterValue !== 'all' && user.status !== userStatusFilterValue) {
                return false;
            }
            
            return true;
        });
        
        displayUsers();
    }
    
    // Display users in table
    function displayUsers() {
        usersTableBody.innerHTML = '';
        
        if (filteredUsers.length === 0) {
            usersTable.style.display = 'none';
            noDataMessage.style.display = 'block';
            return;
        }
        
        usersTable.style.display = 'table';
        noDataMessage.style.display = 'none';
        
        filteredUsers.forEach(user => {
            const row = document.createElement('tr');
            
            const fullName = `${user.fname || ''} ${user.lname || ''}`.trim() || 'N/A';
            const paymentStatus = user.paymentStatus || 'no-invoice';
            const statusClass = `status-${paymentStatus}`;
            
            // Format status text for display
            let statusText;
            if (paymentStatus === 'no-invoice') {
                statusText = 'No Invoice';
            } else {
                statusText = paymentStatus.charAt(0).toUpperCase() + paymentStatus.slice(1);
            }
            
            row.innerHTML = `
                <td>${user.acct_num || 'N/A'}</td>
                <td>${fullName}</td>
                <td>${user.email || 'N/A'}</td>
                <td>${user.clinic || 'N/A'}</td>
                <td>${user.status || 'N/A'}</td>
                <td>$${formatCurrency(user.owed || 0)}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <button class="btn btn-primary" style="padding: 0.5rem 1rem; font-size: 0.85rem;" 
                            onclick="generateBillForUser('${user.acct_num}', '${fullName}')">
                        Generate Bill
                    </button>
                </td>
            `;
            
            usersTableBody.appendChild(row);
        });
    }
    
    // Update statistics
    function updateStats() {
        totalUsersEl.textContent = allUsers.length;
        
        const noInvoice = allUsers.filter(u => u.paymentStatus === 'no-invoice').length;
        const pending = allUsers.filter(u => u.paymentStatus === 'pending').length;
        const paid = allUsers.filter(u => u.paymentStatus === 'paid').length;
        const overdue = allUsers.filter(u => u.paymentStatus === 'overdue').length;
        
        noInvoiceCountEl.textContent = noInvoice;
        pendingCountEl.textContent = pending;
        paidCountEl.textContent = paid;
        overdueCountEl.textContent = overdue;
    }
    
    // Export to CSV
    function exportToCSV() {
        if (filteredUsers.length === 0) {
            alert('No users to export.');
            return;
        }
        
        const headers = ['Account #', 'First Name', 'Last Name', 'Email', 'Clinic', 'Status', 'Amount Owed', 'Payment Status'];
        const rows = filteredUsers.map(user => [
            user.acct_num || '',
            user.fname || '',
            user.lname || '',
            user.email || '',
            user.clinic || '',
            user.status || '',
            user.owed || 0,
            user.paymentStatus || 'pending'
        ]);
        
        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n');
        
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `handyworks-users-${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    }
    
    // Generate bill for specific user - Opens invoice modal
    window.generateBillForUser = function(acctNum, name) {
        const user = allUsers.find(u => u.acct_num == acctNum);
        if (!user) {
            alert('User not found');
            return;
        }
        openInvoiceModal(user);
    };
    
    // Invoice Modal Management
    const invoiceModal = document.getElementById('invoiceModal');
    const modalClose = document.getElementById('modalClose');
    const cancelButton = document.getElementById('cancelButton');
    const generateInvoiceButton = document.getElementById('generateInvoiceButton');
    const generateButtonText = document.getElementById('generateButtonText');
    const generateButtonSpinner = document.getElementById('generateButtonSpinner');
    const invoiceAmountPreset = document.getElementById('invoiceAmountPreset');
    const invoiceAmount = document.getElementById('invoiceAmount');
    const invoiceYear = document.getElementById('invoiceYear');
    const invoiceDescription = document.getElementById('invoiceDescription');
    const invoiceDueDate = document.getElementById('invoiceDueDate');
    const modalSuccessMessage = document.getElementById('modalSuccessMessage');
    const modalErrorMessage = document.getElementById('modalErrorMessage');
    const paymentLinkResult = document.getElementById('paymentLinkResult');
    const paymentLinkUrl = document.getElementById('paymentLinkUrl');
    const emailTemplate = document.getElementById('emailTemplate');
    const copyLinkButton = document.getElementById('copyLinkButton');
    const copyEmailButton = document.getElementById('copyEmailButton');
    
    let currentUser = null;
    
    // Open modal with user data
    function openInvoiceModal(user) {
        currentUser = user;
        
        // Populate form
        document.getElementById('invoiceAcctNum').value = user.acct_num || '';
        document.getElementById('invoiceName').value = `${user.fname || ''} ${user.lname || ''}`.trim();
        document.getElementById('invoiceEmail').value = user.email || '';
        document.getElementById('invoiceClinic').value = user.clinic || '';
        
        // Set defaults
        const currentYear = new Date().getFullYear();
        invoiceYear.value = currentYear + 1; // Default to next year
        invoiceAmount.value = '555';
        invoiceAmountPreset.value = '555';
        invoiceDescription.value = `Annual Maintenance ${currentYear + 1}`;
        
        // Set due date to 30 days from now
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + 30);
        invoiceDueDate.value = dueDate.toISOString().split('T')[0];
        
        // Reset modal state
        hideModalMessages();
        paymentLinkResult.style.display = 'none';
        document.getElementById('invoiceForm').style.display = 'block';
        generateInvoiceButton.disabled = false;
        
        // Show modal
        invoiceModal.classList.add('active');
    }
    
    // Close modal
    function closeInvoiceModal() {
        invoiceModal.classList.remove('active');
        currentUser = null;
    }
    
    modalClose.addEventListener('click', closeInvoiceModal);
    cancelButton.addEventListener('click', closeInvoiceModal);
    
    // Close modal when clicking outside
    invoiceModal.addEventListener('click', (e) => {
        if (e.target === invoiceModal) {
            closeInvoiceModal();
        }
    });
    
    // Amount preset change handler
    invoiceAmountPreset.addEventListener('change', (e) => {
        if (e.target.value === 'custom') {
            invoiceAmount.focus();
        } else {
            invoiceAmount.value = e.target.value;
        }
    });
    
    // Update description when year changes
    invoiceYear.addEventListener('change', (e) => {
        invoiceDescription.value = `Annual Maintenance ${e.target.value}`;
    });
    
    // Generate invoice button handler
    generateInvoiceButton.addEventListener('click', async () => {
        await generateInvoice();
    });
    
    // Main invoice generation function
    async function generateInvoice() {
        if (!currentUser) {
            showModalError('No user selected');
            return;
        }
        
        // Validate Stripe configuration
        const stripeConfig = window.HandyWorksConfig.stripe;
        if (!stripeConfig || !stripeConfig.secretKey || stripeConfig.secretKey.includes('YOUR_')) {
            showModalError('Stripe is not configured. Please add your API keys to js/config.js (see scripts/STRIPE_PAYMENT_LINKS_SETUP.md)');
            return;
        }
        
        if (!stripeConfig.priceId || stripeConfig.priceId.includes('YOUR_')) {
            showModalError('Stripe Price ID is not configured. Please create a product in Stripe Dashboard and add the price ID to js/config.js');
            return;
        }
        
        // Get form values
        const invoiceData = {
            acct_num: currentUser.acct_num,
            customer_name: `${currentUser.fname || ''} ${currentUser.lname || ''}`.trim(),
            customer_email: currentUser.email || '',
            clinic_name: currentUser.clinic || '',
            year: parseInt(invoiceYear.value),
            amount: parseFloat(invoiceAmount.value),
            description: invoiceDescription.value,
            due_date: new Date(invoiceDueDate.value),
            notes: document.getElementById('invoiceNotes').value || null
        };
        
        // Validate
        if (!invoiceData.amount || invoiceData.amount <= 0) {
            showModalError('Please enter a valid amount');
            return;
        }
        
        if (!invoiceData.due_date || isNaN(invoiceData.due_date.getTime())) {
            showModalError('Please enter a valid due date');
            return;
        }
        
        // Show loading state
        setGenerateButtonLoading(true);
        hideModalMessages();
        
        try {
            // Step 1: Create Stripe Payment Link
            showModalSuccess('Creating Stripe payment link...');
            const paymentLink = await createStripePaymentLink(invoiceData);
            
            // Step 2: Save invoice to Firestore
            showModalSuccess('Saving invoice to database...');
            const invoiceId = await saveInvoiceToFirestore(invoiceData, paymentLink);
            
            // Step 3: Generate email template
            const emailText = generateEmailTemplate(invoiceData, paymentLink);
            
            // Step 4: Show success
            showInvoiceSuccess(paymentLink, emailText);
            
        } catch (error) {
            console.error('Invoice generation error:', error);
            showModalError(`Failed to generate invoice: ${error.message}`);
        } finally {
            setGenerateButtonLoading(false);
        }
    }
    
    // Create Stripe Payment Link
    async function createStripePaymentLink(invoiceData) {
        const stripeConfig = window.HandyWorksConfig.stripe;
        
        const body = new URLSearchParams({
            'line_items[0][price]': stripeConfig.priceId,
            'line_items[0][quantity]': '1',
            'metadata[acct_num]': invoiceData.acct_num.toString(),
            'metadata[customer_name]': invoiceData.customer_name,
            'metadata[year]': invoiceData.year.toString(),
            'metadata[invoice_amount]': invoiceData.amount.toString(),
            'after_completion[type]': 'hosted_confirmation',
            'after_completion[hosted_confirmation][custom_message]': 'Thank you for your payment! You will receive a receipt via email. Your HandyWorks maintenance is now active.'
        });
        
        const response = await fetch('https://api.stripe.com/v1/payment_links', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${stripeConfig.secretKey}`,
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: body
        });
        
        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to create payment link');
        }
        
        const data = await response.json();
        return {
            id: data.id,
            url: data.url
        };
    }
    
    // Save invoice to Firestore
    async function saveInvoiceToFirestore(invoiceData, paymentLink) {
        const invoice = {
            invoice_id: `INV-${invoiceData.year}-${invoiceData.acct_num}`,
            acct_num: invoiceData.acct_num,
            customer_name: invoiceData.customer_name,
            customer_email: invoiceData.customer_email,
            clinic_name: invoiceData.clinic_name,
            year: invoiceData.year,
            amount: invoiceData.amount,
            description: invoiceData.description,
            invoice_date: firebase.firestore.Timestamp.now(),
            due_date: firebase.firestore.Timestamp.fromDate(invoiceData.due_date),
            payment_status: 'pending',
            payment_method: null,
            stripe_payment_link_id: paymentLink.id,
            stripe_payment_link_url: paymentLink.url,
            stripe_payment_intent_id: null,
            paid_date: null,
            paid_amount: null,
            transaction_ref: null,
            payment_notes: invoiceData.notes,
            created_at: firebase.firestore.Timestamp.now(),
            updated_at: firebase.firestore.Timestamp.now(),
            created_by: auth.currentUser?.email || 'admin',
            updated_by: null
        };
        
        const docRef = await db.collection('handyworks_invoices').add(invoice);
        return docRef.id;
    }
    
    // Generate email template
    function generateEmailTemplate(invoiceData, paymentLink) {
        return `Subject: HandyWorks Annual Maintenance Invoice - ${invoiceData.year}

Dear ${invoiceData.customer_name},

Your annual HandyWorks maintenance fee for ${invoiceData.year} is due.

INVOICE #: INV-${invoiceData.year}-${invoiceData.acct_num}
AMOUNT DUE: $${invoiceData.amount.toFixed(2)}
DUE DATE: ${invoiceData.due_date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}

PAYMENT OPTIONS:

1. PAY ONLINE (Credit Card via Stripe):
   Click here: ${paymentLink.url}
   
   This secure payment link is personalized for your account. You can pay with any major credit card.

2. PAY BY CHECK ($15 discount - $540):
   Mail check to:
   HandyWorks Software
   [Your Address]
   [City, State ZIP]
   
   Please include invoice number (INV-${invoiceData.year}-${invoiceData.acct_num}) on check memo line.

3. PAY BY PHONE (Credit Card):
   Call us at [Your Phone Number] with your credit card information
   and we'll process it securely.

Thank you for your continued business! We appreciate your support and look forward to serving you in ${invoiceData.year}.

If you have any questions about this invoice, please don't hesitate to contact us.

Best regards,
HandyWorks Software

---
This is an automated invoice. Please do not reply to this email.`;
    }
    
    // Show invoice success with payment link and email template
    function showInvoiceSuccess(paymentLink, emailText) {
        document.getElementById('invoiceForm').style.display = 'none';
        paymentLinkResult.style.display = 'block';
        generateInvoiceButton.disabled = true;
        
        paymentLinkUrl.textContent = paymentLink.url;
        emailTemplate.value = emailText;
        
        showModalSuccess('✅ Invoice created successfully! Copy the payment link or email template below.');
    }
    
    // Copy buttons
    copyLinkButton.addEventListener('click', () => {
        navigator.clipboard.writeText(paymentLinkUrl.textContent)
            .then(() => {
                const originalText = copyLinkButton.textContent;
                copyLinkButton.textContent = '✓ Copied!';
                setTimeout(() => {
                    copyLinkButton.textContent = originalText;
                }, 2000);
            })
            .catch(err => {
                console.error('Copy failed:', err);
                alert('Failed to copy. Please select and copy manually.');
            });
    });
    
    copyEmailButton.addEventListener('click', () => {
        emailTemplate.select();
        document.execCommand('copy');
        
        const originalText = copyEmailButton.textContent;
        copyEmailButton.textContent = '✓ Copied!';
        setTimeout(() => {
            copyEmailButton.textContent = originalText;
        }, 2000);
    });
    
    // Modal message helpers
    function showModalSuccess(message) {
        modalSuccessMessage.textContent = message;
        modalSuccessMessage.style.display = 'block';
        modalErrorMessage.style.display = 'none';
    }
    
    function showModalError(message) {
        modalErrorMessage.textContent = message;
        modalErrorMessage.style.display = 'block';
        modalSuccessMessage.style.display = 'none';
    }
    
    function hideModalMessages() {
        modalSuccessMessage.style.display = 'none';
        modalErrorMessage.style.display = 'none';
    }
    
    function setGenerateButtonLoading(isLoading) {
        if (isLoading) {
            generateButtonText.style.display = 'none';
            generateButtonSpinner.style.display = 'inline-block';
            generateInvoiceButton.disabled = true;
        } else {
            generateButtonText.style.display = 'inline';
            generateButtonSpinner.style.display = 'none';
            generateInvoiceButton.disabled = false;
        }
    }
    
    // Utility functions
    function formatCurrency(amount) {
        // Amount is already in dollars (not cents)
        return parseFloat(amount || 0).toFixed(2);
    }
    
    function showLoading() {
        loadingMessage.style.display = 'block';
        usersTable.style.display = 'none';
        noDataMessage.style.display = 'none';
    }
    
    function hideLoading() {
        loadingMessage.style.display = 'none';
    }
    
    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.style.display = 'block';
    }
    
    function hideError() {
        errorMessage.style.display = 'none';
    }
})();

